import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewLead } from '@/lib/sales-notifications';

export async function POST(req: NextRequest) {
    // Sync fix: ensured DB schema matches Prisma model
    try {
        const { 
            phone, courseSlug, courseTitle, 
            dateLabel, timeLabel,
            utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
            gaClientId
        } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Find existing or create new lead using raw SQL to ensure field compatibility
        const cleanPhone = phone.replace(/\D/g, '');
        const pseudoEmail = `lead_${cleanPhone}@noemail.gdi`;

        let leadId: string;
        const existingLeads: any[] = await prisma.$queryRaw`SELECT id FROM "Lead" WHERE email = ${pseudoEmail} LIMIT 1`;

        if (existingLeads.length > 0) {
            leadId = existingLeads[0].id;
            await prisma.$executeRaw`
                UPDATE "Lead" 
                SET phone = ${phone}, status = 'NEW', source = ${`Digital Advisor: Maya`}, "updatedAt" = NOW()
                WHERE id = ${leadId}
            `;
        } else {
            leadId = crypto.randomUUID();
            await prisma.$executeRaw`
                INSERT INTO "Lead" (id, email, name, phone, type, status, source, "createdAt", "updatedAt")
                VALUES (${leadId}, ${pseudoEmail}, 'Maya Lead', ${phone}, 'STUDENT', 'NEW', 'Digital Advisor: Maya', NOW(), NOW())
            `;
        }

        const lead = { id: leadId };

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

        // Notify sales team (non-blocking)
        notifyNewLead({
            source: 'Digital Advisor: Maya',
            phone,
            course: courseTitle || courseSlug,
        }).catch(err => console.error('[Schedule] Notification failed:', err));

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Lead sync error:', error);
        return NextResponse.json({ ok: false, error: 'Failed to sync lead' }, { status: 500 });
    }
}
