import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing Lead ID', { status: 400 });
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, name: true, status: true }
    });

    if (!lead) {
      return new NextResponse('Lead not found', { status: 404 });
    }

    if (lead.status === 'NEW') {
      await prisma.lead.update({
        where: { id },
        data: { status: 'CONTACTED' }
      });

      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'EMAIL',
          notes: 'Lead claimed via Telegram Bot notification.'
        }
      }).catch(e => console.error('[TakeInWork] Activity failed:', e));
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://gdifuture.works';
    return NextResponse.redirect(`${baseUrl}/crm/students`);
  } catch (error) {
    console.error('[TakeInWork] Error:', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
