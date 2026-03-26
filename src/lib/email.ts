import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  }
  return resendInstance;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - skipping email');
    return;
  }

  try {
    const data = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'GDI FutureWorks <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error('Email error:', error);
  }
}
