import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const payment = await prisma.payment.findUnique({
            where: { externalId: orderId },
        });
        if (!payment) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check that receipt was uploaded
        const meta = (payment.metadata as Record<string, any>) ?? {};
        if (!meta.receiptUrl) {
            return NextResponse.json({ error: 'Receipt must be uploaded before confirming' }, { status: 400 });
        }

        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'UNDER_REVIEW' },
        });

        return NextResponse.json({ success: true, status: 'UNDER_REVIEW' });
    } catch (error) {
        console.error('Payment confirm error:', error);
        return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
    }
}
