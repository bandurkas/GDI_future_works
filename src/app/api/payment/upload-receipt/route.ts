import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const orderId = formData.get('orderId') as string | null;

        if (!file || !orderId) {
            return NextResponse.json({ error: 'File and orderId are required' }, { status: 400 });
        }

        // Validate file type
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPG, PNG, or PDF files accepted' }, { status: 400 });
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
        }

        // Find the payment record
        const payment = await prisma.payment.findUnique({
            where: { externalId: orderId },
        });
        if (!payment) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Save file to /public/receipts/
        const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg';
        const fileName = `${orderId}-${Date.now()}.${ext}`;
        const receiptsDir = path.join(process.cwd(), 'public', 'receipts');
        await mkdir(receiptsDir, { recursive: true });
        const filePath = path.join(receiptsDir, fileName);
        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        const receiptUrl = `/receipts/${fileName}`;

        // Update payment metadata with receipt URL
        const existingMeta = (payment.metadata as Record<string, any>) ?? {};
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                metadata: { ...existingMeta, receiptUrl },
            },
        });

        return NextResponse.json({ receiptUrl });
    } catch (error) {
        console.error('Upload receipt error:', error);
        return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
    }
}
