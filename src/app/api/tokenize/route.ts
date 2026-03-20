import { NextResponse } from 'next/server';
import { courses } from '@/data/courses';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Updated to handle multiple items
        const { items, customerName, customerPhone } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const midtransItems = [];
        let totalAmount = 0;

        for (const cartItem of items) {
            const course = courses.find(c => c.id === String(cartItem.courseId));
            if (!course) {
                return NextResponse.json({ error: `Course ${cartItem.courseId} not found` }, { status: 400 });
            }
            
            midtransItems.push({
                id: `${course.id}-${cartItem.dateId}`,
                price: course.priceIDR, // always server-side IDR price
                quantity: 1,
                name: `${course.title.substring(0, 30)} (${cartItem.dateLabel})`,
            });
            totalAmount += course.priceIDR;
        }

        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const authString = Buffer.from(serverKey + ':').toString('base64');

        // Readable order ID
        const firstSlug = items[0].slug;
        const count = items.length;
        const orderId = `GDI-${firstSlug}${count > 1 ? '-multi' : ''}-${Date.now()}`;

        // --- CRM DATABASE INTEGRATION (v1.1) ---
        const emailToUse = body.customerEmail || items[0]?.email || `${Date.now()}@temp.client.com`;
        
        // 1. Find or create the Client
        let dbClient = await prisma.client.findUnique({ where: { email: emailToUse } });
        if (!dbClient) {
            dbClient = await prisma.client.create({
                data: {
                    full_name: customerName || 'Student',
                    phone_whatsapp: customerPhone || '',
                    email: emailToUse,
                    source: 'website'
                }
            });
        }

        // 2. Map items to Enrollments
        await Promise.all(items.map(async (cartItem: any) => {
            const course = courses.find(c => c.id === String(cartItem.courseId));
            if (!course) return;
            
            // Safely find the specified cohort, or fallback to the first upcoming one.
            let activeCohort = await prisma.cohort.findFirst({
                where: { course_id: course.id, name: cartItem.dateLabel }
            });
            
            if (!activeCohort) {
                activeCohort = await prisma.cohort.findFirst({
                    where: { course_id: course.id, status: 'upcoming' },
                    orderBy: { start_date: 'asc' }
                });
                
                // If there is no exact string match and no upcoming cohorts, fallback to any active one
                if (!activeCohort) {
                    activeCohort = await prisma.cohort.findFirst({
                        where: { course_id: course.id, status: 'active' },
                        orderBy: { start_date: 'asc' }
                    });
                }
                
                if (!activeCohort) {
                     console.error(`Checkout failed: No available cohorts for course ${course.id}`);
                     throw new Error('No available cohorts for this course.');
                }
            }

            await prisma.enrollment.create({
                data: {
                    client_id: dbClient.id,
                    cohort_id: activeCohort.id,
                    price_agreed: course.priceIDR,
                }
            });
        }));
        // --------------------------------

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
                    gross_amount: totalAmount,
                },
                item_details: midtransItems,
                customer_details: {
                    first_name: customerName || 'Student',
                    phone: customerPhone || '',
                },
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Midtrans API Error:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
