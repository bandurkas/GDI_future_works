
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { google } from 'googleapis';
import { PaymentStatus, StudentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Google Sheets helper (optimized for multiple rows)
async function appendToSheet(rows: string[][]) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        if (!spreadsheetId) return;

        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetName = meta.data.sheets?.[0]?.properties?.title || 'Sheet1';

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:A`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: rows },
        });
    } catch (err) {
        console.error('Google Sheets sync error:', err);
    }
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
            customer_details,
            item_details,
        } = body;

        // 1. Signature Verification
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const expectedSignature = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest('hex');

        const sigBuf = Buffer.from(signature_key || '');
        const expBuf = Buffer.from(expectedSignature);
        const sigValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
        if (!sigValid) {
            console.error('Invalid Midtrans signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // 2. Identify the matching Payment record
        const payment = await prisma.payment.findUnique({
            where: { externalId: order_id }
        });

        if (!payment) {
            console.warn(`Webhook: Order ID ${order_id} not found in database.`);
            return NextResponse.json({ ok: true }); // Acknowledge to Midtrans anyway
        }

        // 3. Idempotency Check (Check if already processed this transaction_id)
        if (payment.transactionId === transaction_id && payment.status === 'PAID') {
            return NextResponse.json({ ok: true });
        }

        // 4. Determine Payment Outcomes
        const isSettled = transaction_status === 'settlement' || 
                         (transaction_status === 'capture' && fraud_status === 'accept');
        
        const isFailed = transaction_status === 'cancel' || 
                        transaction_status === 'expire' || 
                        transaction_status === 'deny';

        let newStatus: PaymentStatus = 'PENDING';
        if (isSettled) newStatus = 'PAID';
        else if (isFailed) newStatus = 'FAILED';

        // 5. Atomic Update: Payment & CRM Status
        await prisma.$transaction(async (tx) => {
            // Update Payment
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: newStatus,
                    transactionId: transaction_id,
                    metadata: {
                        ...(payment.metadata as object || {}),
                        midtrans_transaction_id: transaction_id,
                        midtrans_transaction_status: transaction_status,
                        midtrans_transaction_time: transaction_time,
                    }
                }
            });

            // If success, upgrade Student access + save phone if provided
            if (isSettled) {
                await tx.student.update({
                    where: { id: payment.studentId },
                    data: { status: 'ACTIVE' as StudentStatus }
                });

                // Save phone from Midtrans customer_details if not already stored
                const phone = customer_details?.phone;
                if (phone) {
                    await tx.user.updateMany({
                        where: { student: { id: payment.studentId }, phone: null },
                        data: { phone },
                    });
                }
            }
        });

        // 6. External Logging (Google Sheets)
        if (isSettled || isFailed) {
            const dateStr = transaction_time ? transaction_time.split(' ')[0] : new Date().toISOString().split('T')[0];
            const timeStr = transaction_time ? transaction_time.split(' ')[1] : new Date().toTimeString().split(' ')[0];
            
            const rows = (item_details || [{ name: 'Course Enrollment', price: gross_amount }]).map((item: any) => [
                dateStr,
                timeStr,
                order_id,
                customer_details?.first_name || 'Student',
                customer_details?.phone || '-',
                item.name,
                item.price,
                newStatus,
                transaction_id
            ]);

            await appendToSheet(rows);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Webhook critical failure:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
