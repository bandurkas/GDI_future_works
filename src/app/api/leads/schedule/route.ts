import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewLead } from '@/lib/sales-notifications';
import { normalizeUtm } from '@/lib/utm-normalize';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    let bodyData: any = {};
    try {
        bodyData = await req.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    try {
        const {
            phone, courseSlug, courseTitle,
            dateLabel, timeLabel,
            source: srcInput,
            utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
            gaClientId, fbClientId, fbBrowserId,
            waStatus
        } = bodyData;

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

        // Record activity
        await prisma.leadActivity.create({
            data: {
                leadId: leadId,
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
        console.error('CRITICAL: Lead sync failed. Activating Fallback Store.', error);
        
        try {
            const logDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
            
            const logFile = path.join(logDir, 'failed-leads.jsonl');
            const logEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                error: (error as Error).message,
                data: bodyData
            });
            
            fs.appendFileSync(logFile, logEntry + '\n');
            console.log('Lead data preserved in failed-leads.jsonl');
            
            // Return 202 Accepted - we have the data, but it's not in the main DB yet
            return NextResponse.json({ ok: true, fallback: true }, { status: 202 });
        } catch (logError) {
            console.error('ULTIMATE FAILURE: Could not even log lead to file!', logError);
            return NextResponse.json({ ok: false, error: 'System failure' }, { status: 500 });
        }
    }
}
