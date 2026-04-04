import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCourseBySlug } from '@/data/courses';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerName, customerEmail, customerPhone } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const email = (customerEmail || '').trim().toLowerCase();
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const totalIDR = items.reduce((sum: number, item: any) => sum + (item.priceIDR ?? 0), 0);

        const cartDetails = items.map((item: any) => {
            const course = getCourseBySlug(String(item.courseId ?? item.slug));
            return {
                courseSlug: item.courseId ?? item.slug,
                courseTitle: course?.title ?? item.courseTitle ?? '',
                dateLabel: item.dateLabel ?? '',
                timeLabel: item.timeLabel ?? '',
                priceIDR: item.priceIDR ?? course?.priceIDR ?? 0,
            };
        });

        const firstSlug = items[0].slug ?? items[0].courseId ?? 'course';
        const orderId = `GDI-QRIS-${firstSlug}-${Date.now()}`;

        const dbUser = await prisma.user.upsert({
            where: { email },
            update: { name: customerName || undefined },
            create: {
                email,
                name: customerName || 'Student',
                role: 'STUDENT',
                isActive: true,
            },
        });

        const student = await prisma.student.upsert({
            where: { userId: dbUser.id },
            update: {},
            create: { userId: dbUser.id, status: 'LEAD' },
        });

        await prisma.payment.create({
            data: {
                studentId: student.id,
                amount: totalIDR,
                currency: 'IDR',
                status: 'PENDING',
                provider: 'QRIS',
                externalId: orderId,
                metadata: {
                    cartDetails,
                    customerPhone: customerPhone ?? '',
                    customerName: customerName ?? '',
                },
            },
        });

        return NextResponse.json({ orderId });
    } catch (error) {
        console.error('Payment create error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
