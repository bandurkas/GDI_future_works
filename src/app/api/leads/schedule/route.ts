import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewLead } from '@/lib/sales-notifications';
import { normalizeUtm } from '@/lib/utm-normalize';

export async function POST(req: NextRequest) {
    // Sync fix: ensured DB schema matches Prisma model
    try {
        const {
            phone, courseSlug, courseTitle,
            dateLabel, timeLabel,
            source: srcInput,
            utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
            gaClientId, fbClientId, fbBrowserId,
            waStatus
        } = await req.json();
        const waStatusNorm = waStatus === 'VERIFIED' || waStatus === 'BYPASSED' ? waStatus : null;
        const sourceNorm = typeof srcInput === 'string' && srcInput.trim() ? srcInput.trim() : 'Schedule Form';
        const utm = normalizeUtm({ utmSource, utmMedium, utmCampaign, utmContent, utmTerm });

        if (!phone) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        }

        const country = req.headers.get('cf-ipcountry') || 'XX';

        // Find existing or create new lead using raw SQL to ensure field compatibility
        const cleanPhone = phone.replace(/\D/g, '');
        const pseudoEmail = `lead_${cleanPhone}@noemail.gdi`;

        let leadId: string;
        const existingLeads: any[] = await prisma.$queryRaw`SELECT id FROM "Lead" WHERE email = ${pseudoEmail} LIMIT 1`;

        if (existingLeads.length > 0) {
            leadId = existingLeads[0].id;
            await prisma.$executeRaw`
                UPDATE "Lead"
                SET phone = ${phone}, name = ${phone}, status = 'NEW', "deletedAt" = NULL, source = ${sourceNorm}, country = ${country},
                    "gaClientId" = ${gaClientId}, "fbClientId" = ${fbClientId}, "fbBrowserId" = ${fbBrowserId},
                    "utmSource" = ${utm.utmSource}, "utmMedium" = ${utm.utmMedium}, "utmCampaign" = ${utm.utmCampaign},
                    "waStatus" = COALESCE(${waStatusNorm}, "waStatus"),
                    "updatedAt" = NOW()
                WHERE id = ${leadId}
            `;
        } else {
            leadId = crypto.randomUUID();
            await prisma.$executeRaw`
                INSERT INTO "Lead" (id, email, name, phone, country, type, status, source, "gaClientId", "fbClientId", "fbBrowserId", "utmSource", "utmMedium", "utmCampaign", "waStatus", "createdAt", "updatedAt")
                VALUES (${leadId}, ${pseudoEmail}, ${phone}, ${phone}, ${country}, 'STUDENT', 'NEW', ${sourceNorm}, ${gaClientId}, ${fbClientId}, ${fbBrowserId}, ${utm.utmSource}, ${utm.utmMedium}, ${utm.utmCampaign}, ${waStatusNorm}, NOW(), NOW())
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
            id: leadId,
            source: sourceNorm,
            phone,
            course: courseTitle || courseSlug,
        }).catch(err => console.error('[Schedule] Notification failed:', err));

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Lead sync error:', error);
        return NextResponse.json({ ok: false, error: 'Failed to sync lead' }, { status: 500 });
    }
}
