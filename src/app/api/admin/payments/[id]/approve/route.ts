import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCrmSessionFromReq } from '@/lib/crm-session';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCrmSessionFromReq(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { student: { include: { user: true } } },
  });

  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  if (!['UNDER_REVIEW', 'PAYMENT_UPLOADED', 'PENDING'].includes(payment.status)) {
    return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
  }

  await prisma.payment.update({ where: { id }, data: { status: 'PAID' } });
  await prisma.student.update({ where: { id: payment.studentId }, data: { status: 'ACTIVE' } });

  const meta = payment.metadata as Record<string, unknown> | null;
  const cartDetails = (meta?.cartDetails as Array<{ courseTitle?: string }> | undefined);
  const courseTitle = cartDetails?.[0]?.courseTitle ?? 'your course';
  const name = payment.student.user.name ?? payment.student.user.email.split('@')[0];

  await sendEmail({
    to: payment.student.user.email,
    subject: 'Payment Confirmed — GDI FutureWorks \u{1F389}',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="background:#10B981;color:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <h2 style="margin:0;font-size:1.4rem;">Payment Confirmed! \u{1F389}</h2>
        </div>
        <p style="color:#333;font-size:1rem;line-height:1.6;">
          Hi <strong>${name}</strong>, your enrollment for <strong>${courseTitle}</strong> has been verified.
        </p>
        <p style="color:#333;font-size:1rem;line-height:1.6;">
          You'll receive your session link on WhatsApp within 5 minutes. Welcome to GDI FutureWorks!
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="margin:0;color:#166534;font-size:0.85rem;">Order ID: <code>${payment.externalId}</code></p>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:0.8rem;">GDI FutureWorks · gdifuture.works</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
