import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { 
            phone, courseSlug, courseTitle, 
            dateLabel, timeLabel,
            utmSource, utmMedium, utmCampaign 
        } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Clean phone number for identification
        const cleanPhone = phone.replace(/\D/g, '');
        const pseudoEmail = `lead_${cleanPhone}@noemail.gdi`;

        // Find existing or create new lead
        let lead = await prisma.lead.findFirst({
            where: { email: pseudoEmail }
        });

        if (lead) {
            lead = await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    phone,
                    status: 'NEW',
                    source: `Schedule: ${courseTitle || courseSlug}`,
                    utmSource,
                    utmMedium,
                    utmCampaign,
                    updatedAt: new Date(),
                }
            });
        } else {
            lead = await prisma.lead.create({
                data: {
                    email: pseudoEmail,
                    name: 'Schedule Lead', 
                    phone,
                    type: 'STUDENT',
                    status: 'NEW',
                    source: `Schedule: ${courseTitle || courseSlug}`,
                    utmSource,
                    utmMedium,
                    utmCampaign,
                }
            });
        }

        // Record activity
        await prisma.leadActivity.create({
            data: {
                leadId: lead.id,
                type: 'WHATSAPP',
                notes: JSON.stringify({
                    action: 'started_schedule_selection',
                    course: courseTitle || courseSlug,
                    dates: dateLabel || '',
                    times: timeLabel || '',
                    timestamp: new Date().toISOString()
                }),
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Lead sync error:', error);
        return NextResponse.json({ ok: false, error: 'Failed to sync lead' }, { status: 500 });
    }
}
