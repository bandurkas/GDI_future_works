import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const payment = await prisma.payment.findUnique({
            where: { externalId: orderId },
            select: { status: true, externalId: true },
        });
        if (!payment) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ status: payment.status, orderId });
    } catch (error) {
        console.error('Payment status error:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
