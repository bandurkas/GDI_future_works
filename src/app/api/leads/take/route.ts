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

    // Update status to CONTACTED (In Work) if it's currently NEW
    if (lead.status === 'NEW') {
      await prisma.lead.update({
        where: { id },
        data: { status: 'CONTACTED' }
      });
      
      // Log activity
      try {
        await prisma.leadActivity.create({
          data: {
            leadId: id,
            type: 'EMAIL', // Using EMAIL as placeholder since TAKE_IN_WORK is not in enum
            notes: 'Lead claimed via Telegram Bot notification.'
          }
        });
      } catch (e) {
        console.error('[TakeInWork] Failed to create activity:', e);
      }
    }

    // Redirect to the Lead Details in CRM
    const baseUrl = process.env.NEXTAUTH_URL || 'https://gdifuture.works';
    return NextResponse.redirect(`${baseUrl}/crm/students?id=${id}&claimed=true`);
  } catch (error) {
    console.error('[TakeInWork] Error:', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
