import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, TUTOR_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';
import { sendEmail } from '@/lib/email';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, TUTOR_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const before = await prisma.tutorApplication.findUnique({
    where: { id },
    select: { status: true, name: true, email: true },
  });
  const app = await prisma.tutorApplication.update({ where: { id }, data: { status } });

  const action =
    status === 'APPROVED'  ? 'tutor.application.approved' :
    status === 'REJECTED'  ? 'tutor.application.rejected' :
    status === 'ARCHIVED'  ? 'tutor.application.archived' :
    'tutor.application.reset';

  await logAudit({
    session,
    action,
    targetType: 'TutorApplication',
    targetId: id,
    before: { status: before?.status },
    after: { status },
    ip: getClientIp(req),
  });

  if (status === 'REJECTED' && before?.email) {
    await sendEmail({
      to: before.email,
      subject: 'Update on Your GDI Future Works Tutor Application',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e43a3d 0%, #c0392b 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">GDI Future Works</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">gdifuture.works</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 18px; font-weight: 600; margin: 0 0 20px;">Hi ${before.name},</p>

            <p style="line-height: 1.7; margin: 0 0 16px;">Thank you for taking the time to apply as a tutor at GDI Future Works. We truly appreciate your interest in joining our team.</p>

            <p style="line-height: 1.7; margin: 0 0 16px;">After carefully reviewing your application, we are not able to move forward at this stage. This is not a reflection of your abilities — we simply need to ensure the best fit for our current student needs and openings.</p>

            <p style="line-height: 1.7; margin: 0 0 24px;">We encourage you to stay in touch and reapply in the future. If you have any questions or would like feedback on your application, don't hesitate to reach out to us directly — we're always happy to help.</p>

            <!-- Contact Box -->
            <div style="background: #f9f9f9; border-left: 4px solid #e43a3d; border-radius: 8px; padding: 20px 24px; margin: 0 0 24px;">
              <p style="margin: 0 0 8px; font-weight: 600; font-size: 15px;">💬 Have questions? Contact us:</p>
              <p style="margin: 0; font-size: 20px; font-weight: 700; color: #e43a3d;">+62 821-1704-707</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #888;">WhatsApp or call — we're here for you.</p>
            </div>

            <p style="line-height: 1.7; margin: 0; color: #555;">We wish you all the best and hope to hear from you again soon.</p>
          </div>

          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 24px 32px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-weight: 600; color: #333;">Best regards,</p>
            <p style="margin: 4px 0 0; color: #e43a3d; font-weight: 700;">GDI Future Works Team</p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #aaa;">gdifuture.works · +62 821-1704-707</p>
          </div>
        </div>
      `,
    });
  }

  return NextResponse.json(app);
}
