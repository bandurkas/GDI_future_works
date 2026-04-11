import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { phone, courseSlug, courseTitle, utmSource, utmMedium, utmCampaign } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Clean phone number for identification
        const cleanPhone = phone.replace(/\D/g, '');
        const pseudoEmail = `lead_${cleanPhone}@noemail.gdi`;

        // Upsert the Lead in Prisma
        const lead = await prisma.lead.upsert({
            where: { email: pseudoEmail },
            update: {
                phone,
                status: 'NEW',
                source: `Schedule: ${courseTitle || courseSlug}`,
                utmSource,
                utmMedium,
                utmCampaign,
                updatedAt: new Date(),
            },
            create: {
                email: pseudoEmail,
                name: 'Schedule Lead', 
                phone,
                type: 'STUDENT',
                status: 'NEW',
                source: `Schedule: ${courseTitle || courseSlug}`,
                utmSource,
                utmMedium,
                utmCampaign,
            },
        });

        // Record activity
        await prisma.leadActivity.create({
            data: {
                leadId: lead.id,
                type: 'WHATSAPP',
                notes: `Started schedule selection for: ${courseTitle || courseSlug}`,
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Lead sync error:', error);
        return NextResponse.json({ ok: false, error: 'Failed to sync lead' }, { status: 500 });
    }
}
