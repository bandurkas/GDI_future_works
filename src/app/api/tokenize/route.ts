
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { convertToIdr } from '@/lib/currency';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerName, customerPhone, currency = 'IDR' } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const midtransItems = [];
        let totalAmountLocal = 0;

        for (const cartItem of items) {
            console.log('Fetching course for cart item:', cartItem.courseId);
            const course = await prisma.course.findUnique({
                where: { id: String(cartItem.courseId) },
                include: { prices: true }
            });

            if (!course) {
                console.error('Course not found:', cartItem.courseId);
                return NextResponse.json({ error: `Course not found: ${cartItem.courseId}` }, { status: 404 });
            }

            const coursePrice = course.prices.find(p => p.currency === currency);
            if (!coursePrice) {
                console.error(`Price for currency ${currency} not found for course ${course.id}`);
                return NextResponse.json({ error: `Price for ${currency} not found` }, { status: 400 });
            }

            const amount = Number(coursePrice.amount);
            totalAmountLocal += amount;

            const itemPrice = currency === 'IDR' ? Number(coursePrice.amount) : convertToIdr(Number(coursePrice.amount), currency);
            console.log(`Item Price for ${course.title}: ${itemPrice} IDR (Original: ${coursePrice.amount} ${currency})`);

            // For Midtrans, if currency is MYR, we convert to IDR but keep the label localized
            const priceInIdr = convertToIdr(amount, currency);

            midtransItems.push({
                id: `${course.id}-${cartItem.dateId}`,
                price: priceInIdr,
                quantity: 1,
                name: `${currency === 'MYR' ? 'RM ' + amount + ' ' : ''}${course.title.substring(0, 30)}`,
            });
        }

        const totalAmountIdr = convertToIdr(totalAmountLocal, currency);

        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const authString = Buffer.from(serverKey + ':').toString('base64');

        // Order ID generation
        const firstSlug = items[0].slug || 'course';
        const orderId = `GDI-${currency}-${firstSlug}-${Date.now()}`;

        // CRM Integration
        const emailToUse = (body.customerEmail || items[0]?.email || `${Date.now()}@temp.client.com`).toLowerCase();
        
        const dbUser = await prisma.user.upsert({
            where: { email: emailToUse },
            update: {},
            create: {
                email: emailToUse,
                name: customerName || 'Student',
                role: 'STUDENT',
                isActive: true,
            }
        });

        const student = await prisma.student.upsert({
            where: { userId: dbUser.id },
            update: {},
            create: {
                userId: dbUser.id,
                status: 'LEAD',
            }
        });

        // Log payment in IDR (Midtrans reality) but store original currency in metadata
        await prisma.payment.create({
            data: {
                studentId: student.id,
                amount: totalAmountIdr,
                currency: 'IDR',
                status: 'PENDING',
                provider: 'MIDTRANS',
                externalId: orderId,
                metadata: { 
                    items: midtransItems,
                    userCurrency: currency,
                    userAmount: totalAmountLocal,
                    conversionRate: currency === 'MYR' ? 3337 : 1
                }
            }
        });

        const response = await fetch('https://app.midtrans.com/snap/v1/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify({
                transaction_details: {
                    order_id: orderId,
                    gross_amount: totalAmountIdr,
                },
                item_details: midtransItems,
                customer_details: {
                    first_name: customerName || 'Student',
                    phone: customerPhone || '',
                    email: emailToUse,
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Midtrans Tokenize Error Response:', data);
            return NextResponse.json({ error: data.error_messages ? data.error_messages[0] : 'Failed to create transaction' }, { status: response.status });
        }

        console.log('Midtrans Transaction Created:', data.token);
        return NextResponse.json({ token: data.token, redirect_url: data.redirect_url });
    } catch (error) {
        console.error('Midtrans API Error:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
