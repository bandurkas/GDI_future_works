import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
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

        const country = req.headers.get('cf-ipcountry') || 'XX';

        // Resolve lead identity. Anonymous visitors are keyed by phone (pseudo-email).
        // Authenticated visitors skip the contact form, so `phone` is empty — key them by
        // their real account email (phone pulled from profile) so the booking still lands
        // in CRM instead of being silently dropped by the old `if (!phone) return 400`.
        let leadEmail: string;
        let leadName: string;
        let leadPhone: string = phone || '';

        if (phone) {
            const cleanPhone = phone.replace(/\D/g, '');
            leadEmail = `lead_${cleanPhone}@noemail.gdi`;
            leadName = phone;
        } else {
            const session = await auth();
            const sessEmail = session?.user?.email?.toLowerCase();
            if (!sessEmail) {
                return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
            }
            const user = await prisma.user.findUnique({
                where: { email: sessEmail },
                select: { email: true, name: true, phone: true },
            });
            leadEmail = (user?.email || sessEmail).toLowerCase();
            leadPhone = user?.phone || '';
            leadName = user?.name || leadPhone || leadEmail;
        }

        // Find existing or create new lead using raw SQL to ensure field compatibility
        let leadId: string;
        const existingLeads: any[] = await prisma.$queryRaw`SELECT id FROM "Lead" WHERE email = ${leadEmail} LIMIT 1`;

        if (existingLeads.length > 0) {
            leadId = existingLeads[0].id;
            await prisma.$executeRaw`
                UPDATE "Lead"
                SET phone = COALESCE(NULLIF(${leadPhone}, ''), phone),
                    name = COALESCE(NULLIF(${leadName}, ''), name),
                    status = 'NEW', "deletedAt" = NULL, source = ${sourceNorm}, country = ${country},
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
                VALUES (${leadId}, ${leadEmail}, ${leadName}, ${leadPhone}, ${country}, 'STUDENT', 'NEW', ${sourceNorm}, ${gaClientId}, ${fbClientId}, ${fbBrowserId}, ${utm.utmSource}, ${utm.utmMedium}, ${utm.utmCampaign}, ${waStatusNorm}, NOW(), NOW())
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
            phone: leadPhone || phone,
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
