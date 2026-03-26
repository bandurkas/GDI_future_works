
import { NextResponse } from 'next/server';
import { convertToIdr, MYR_TO_IDR_RATE } from '@/lib/currency';
import { prisma } from '@/lib/prisma';
import { getCourseBySlug } from '@/data/courses';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerName, customerPhone, currency = 'IDR' } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const midtransItems = [];
        const cartDetails = [];
        let totalAmountLocal = 0;

        for (const cartItem of items) {
            // Look up course from static data using the slug (courseId is the slug)
            const staticCourse = getCourseBySlug(String(cartItem.courseId));

            if (!staticCourse) {
                console.error('Course not found in static data:', cartItem.courseId);
                return NextResponse.json({ error: `Course not found: ${cartItem.courseId}` }, { status: 404 });
            }

            const amount = currency === 'MYR' ? staticCourse.priceMYR : staticCourse.priceIDR;
            totalAmountLocal += amount;

            const priceInIdr = convertToIdr(amount, currency);

            midtransItems.push({
                id: `${cartItem.courseId}-${cartItem.dateId}`,
                price: priceInIdr,
                quantity: 1,
                name: `${currency === 'MYR' ? 'RM ' + amount + ' ' : ''}${staticCourse.title.substring(0, 30)}`,
            });

            // Save cart details for CRM display
            cartDetails.push({
                courseSlug: cartItem.courseId,
                courseTitle: staticCourse.title,
                dateLabel: cartItem.dateLabel || '',
                timeLabel: cartItem.timeLabel || '',
                priceIDR: staticCourse.priceIDR,
                priceMYR: staticCourse.priceMYR,
            });
        }

        const totalAmountIdr = convertToIdr(totalAmountLocal, currency);

        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const authString = Buffer.from(serverKey + ':').toString('base64');

        // Order ID generation
        const firstSlug = items[0].slug || 'course';
        const orderId = `GDI-${currency}-${firstSlug}-${Date.now()}`;

        // CRM Integration
        const rawEmail = body.customerEmail || items[0]?.email;
        if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
            return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
        }
        const emailToUse = rawEmail.toLowerCase();
        
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
                    cartDetails,
                    userCurrency: currency,
                    userAmount: totalAmountLocal,
                    conversionRate: currency === 'MYR' ? MYR_TO_IDR_RATE : 1
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

        return NextResponse.json({ token: data.token, redirect_url: data.redirect_url });
    } catch (error) {
        console.error('Midtrans API Error:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
