import { NextResponse } from 'next/server';
import { appendToInterestSheet } from '@/lib/googleSheets';
import { prisma } from '@/lib/prisma';
import { notifyNewLead } from '@/lib/sales-notifications';

export async function POST(req: Request) {
    try {
        const {
            name, email, phone, country, interest, goal, budget,
            utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
        } = await req.json();

        if (!name?.trim() || !email?.trim() || !phone?.trim() || !country?.trim() || !interest?.trim()) {
            return NextResponse.json({ error: 'Name, email, phone, country and interest are required' }, { status: 400 });
        }

        if (!email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];

        let sheetsOk = false;
        let dbOk = false;
        let leadId: string | undefined;

        // 1. Google Sheets
        try {
            await appendToInterestSheet([[
                dateStr, timeStr,
                name.trim(), normalizedEmail, phone.trim(), country.trim(),
                interest, goal || '', budget || '',
            ]]);
            sheetsOk = true;
        } catch (sheetsErr) {
            console.error('[Interest] Sheets save failed:', sheetsErr);
        }

        // 2. Save to CRM Lead table (non-blocking)
        try {
            const existing = await prisma.lead.findFirst({
                where: { email: normalizedEmail, source: 'Interest Form' },
                select: { id: true },
            });

            if (existing) {
                leadId = existing.id;
                await prisma.lead.update({
                    where: { id: leadId },
                    data: { status: 'NEW', phone: phone.trim(), country: country.trim(), updatedAt: now },
                });
            } else {
                const lead = await prisma.lead.create({
                    data: {
                        type: 'STUDENT',
                        name: name.trim(),
                        email: normalizedEmail,
                        phone: phone.trim(),
                        source: 'Interest Form',
                        country: country.trim(),
                        status: 'NEW',
                        utmSource: utmSource || null,
                        utmMedium: utmMedium || null,
                        utmCampaign: utmCampaign || null,
                        utmContent: utmContent || null,
                        utmTerm: utmTerm || null,
                    },
                });
                leadId = lead.id;
            }

            await prisma.leadActivity.create({
                data: {
                    leadId,
                    type: 'EMAIL',
                    notes: JSON.stringify({ country: country.trim(), interest, goal: goal || '', budget: budget || '' }),
                },
            });
            dbOk = true;
        } catch (dbErr) {
            console.error('[Interest] DB save failed (non-critical):', dbErr);
        }

        if (!sheetsOk && !dbOk) {
            return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
        }

        // Notify sales team (non-blocking)
        notifyNewLead({
            id: leadId || '',
            source: 'Interest Form',
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            interest,
            country: country.trim(),
        }).catch(err => console.error('[Interest] Notification failed:', err));

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Interest form error:', error);
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
}
