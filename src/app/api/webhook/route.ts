import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let cachedSheetName: string | null = null;
let headerWritten = false;

async function appendToSheet(rows: string[][]) {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!cachedSheetName) {
        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        cachedSheetName = meta.data.sheets?.[0]?.properties?.title || 'Sheet1';
    }
    const sheetName = cachedSheetName;

    if (!headerWritten) {
        const existing = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A1:A1`,
        });
        if (!existing.data.values?.length) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [['Date', 'Time', 'Order ID', 'Name', 'WhatsApp', 'Course', 'Amount (IDR)', 'Status', 'Transaction ID']],
                },
            });
        }
        headerWritten = true;
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: rows },
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
            transaction_id,
            transaction_time,
            payment_type,
            customer_details,
            item_details,
        } = body;

        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const expectedSignature = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest('hex');

        if (signature_key !== expectedSignature) {
            console.error('Invalid Midtrans signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Database-level Idempotency Check
        const existingPayment = await prisma.payment.findUnique({
            where: { transaction_id }
        });

        if (existingPayment) {
            console.log(`Duplicate webhook ignored: ${transaction_id}`);
            return NextResponse.json({ ok: true });
        }

        const isPaid =
            transaction_status === 'settlement' ||
            (transaction_status === 'capture' && fraud_status === 'accept');

        const status = isPaid
            ? '✅ Paid'
            : transaction_status === 'pending'
                ? '⏳ Pending'
                : transaction_status === 'cancel'
                    ? '❌ Cancelled'
                    : transaction_status === 'expire'
                        ? '⌛ Expired'
                        : transaction_status;

        // --- CRM DATABASE INTEGRATION (v1.1) ---
        // In the tokenize step, we couldn't properly inject orderId into Enrollment because it wasn't linked to a Payment yet.
        // If this is a real deployment, we'd lookup by client email and cohort, or pass an ID in the custom fields.
        // For MVP, we will update the client's most recent unpaid enrollment.
        
        try {
            if (customer_details?.email) {
                 const client = await prisma.client.findUnique({
                     where: { email: customer_details.email },
                     include: {
                         enrollments: {
                             where: { payment_status: 'unpaid' },
                             orderBy: { created_at: 'desc' },
                             take: 1
                         }
                     }
                 });

                 if (client && client.enrollments.length > 0) {
                     const enrollment = client.enrollments[0];
                     
                     if (isPaid) {
                         // Update Enrollment
                         await prisma.enrollment.update({
                             where: { id: enrollment.id },
                             data: { payment_status: 'paid', total_paid: gross_amount }
                         });
                         
                         // Create Payment Ledger Entry
                        await prisma.payment.create({
                            data: {
                                enrollment_id: enrollment.id,
                                transaction_id: transaction_id,
                                transaction_type: 'payment',
                                amount: parseFloat(gross_amount),
                                currency: 'IDR',
                                method: payment_type || 'midtrans',
                                paid_at: new Date(transaction_time),
                                notes: `Midtrans Order: ${order_id}`
                            }
                        });
                    } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
                         await prisma.enrollment.update({
                             where: { id: enrollment.id },
                             data: { payment_status: transaction_status === 'cancel' ? 'refunded' : 'unpaid' }
                         });
                     }
                 }
            }
        } catch (dbErr) {
            console.error("CRM DB Sync Error on Webhook:", dbErr);
            // Don't fail the webhook if the DB sync fails, still write to Google Sheets
        }
        // --------------------------------

        const [datePart, timePart] = (transaction_time || '').split(' ');
        const name = customer_details?.first_name || 'Unknown';
        const phone = customer_details?.phone || '-';

        // Fix: Map multiple items to separate rows
        const rowsToAppend: string[][] = [];

        if (item_details && Array.isArray(item_details)) {
            item_details.forEach((item: any) => {
                rowsToAppend.push([
                    datePart || new Date().toISOString().split('T')[0],
                    timePart || new Date().toTimeString().split(' ')[0],
                    order_id,
                    name,
                    phone,
                    item.name || '-',
                    item.price || '-',
                    status,
                    transaction_id,
                ]);
            });
        } else {
            // Fallback for unexpected format
            rowsToAppend.push([
                datePart || new Date().toISOString().split('T')[0],
                timePart || new Date().toTimeString().split(' ')[0],
                order_id,
                name,
                phone,
                order_id.split('-')[1] || '-',
                gross_amount,
                status,
                transaction_id,
            ]);
        }

        await appendToSheet(rowsToAppend);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
