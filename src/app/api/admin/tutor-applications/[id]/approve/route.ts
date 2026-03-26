import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, TUTOR_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, TUTOR_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;

  const application = await prisma.tutorApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (application.status === 'APPROVED') {
    return NextResponse.json({ error: 'Already approved' }, { status: 400 });
  }

  const email = application.email.toLowerCase();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update application status
      const updatedApp = await tx.tutorApplication.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      // 2. Upsert User with TUTOR role
      const user = await tx.user.upsert({
        where: { email },
        update: { role: 'TUTOR', isActive: true },
        create: {
          email,
          name: application.name,
          role: 'TUTOR',
          isActive: true,
        },
      });

      // 3. Create Tutor record if it doesn't exist
      const tutor = await tx.tutor.upsert({
        where: { userId: user.id },
        update: { status: 'APPROVED' },
        create: {
          userId: user.id,
          bio: application.bio,
          expertise: application.expertise ? [application.expertise] : [],
          status: 'APPROVED',
          isVerified: false,
        },
      });

      return { application: updatedApp, user, tutor };
    });

    await logAudit({
      session,
      action: 'tutor.application.approved',
      targetType: 'TutorApplication',
      targetId: id,
      before: { status: 'PENDING' },
      after: { status: 'APPROVED', userId: result.user.id, tutorId: result.tutor.id },
      ip: getClientIp(req),
    });

    await sendEmail({
      to: email,
      subject: '🎉 Congratulations! You\'re Approved as a Tutor at GDI Future Works',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e43a3d 0%, #c0392b 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">GDI Future Works</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">gdifuture.works</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">Hi ${application.name}, 👋</p>
            <p style="font-size: 16px; color: #e43a3d; font-weight: 700; margin: 0 0 24px;">Congratulations — your tutor application has been approved!</p>

            <p style="line-height: 1.7; margin: 0 0 16px;">We are excited to welcome you to the GDI Future Works tutor community. Your expertise is exactly what our students need, and we can't wait to see the impact you'll make.</p>

            <p style="line-height: 1.7; margin: 0 0 24px;">You might be wondering — <strong>how much can you earn as a GDI tutor?</strong> Our tutors typically earn competitive session rates based on their subject and availability. Want to know the exact numbers and discuss your earning potential?</p>

            <!-- CTA Box -->
            <div style="background: #f9f9f9; border-left: 4px solid #e43a3d; border-radius: 8px; padding: 20px 24px; margin: 0 0 24px;">
              <p style="margin: 0 0 8px; font-weight: 600; font-size: 15px;">📞 Get in touch with our team:</p>
              <p style="margin: 0; font-size: 20px; font-weight: 700; color: #e43a3d;">+62 821-1704-707</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #888;">WhatsApp or call — we're happy to walk you through everything.</p>
            </div>

            <p style="line-height: 1.7; margin: 0 0 8px;">You can now log in to the platform using your email <strong>${email}</strong> to set up your tutor profile.</p>
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Approve tutor error:', error);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
