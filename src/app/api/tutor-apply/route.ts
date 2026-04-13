import { NextResponse } from 'next/server';
import { appendToTutorSheet } from '@/lib/googleSheets';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, getIP } from '@/lib/rateLimit';


// Helper: treats empty string as undefined so .optional() URL fields don't fail on ""
const optionalUrl = z.preprocess(
    val => (val === '' ? undefined : val),
    z.string().url().optional()
);

const schema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    expertise: z.string().min(2).max(200),
    phone: z.string().min(5, 'Please enter a valid phone number.').max(25),
    videoLink: z.string().url(),
    linkedin: optionalUrl,
    bio: z.string().max(1000).optional(),
    portfolioLink: optionalUrl,
    curriculum: z.string().max(2000).optional(),
    lessonPlan: z.string().max(2000).optional(),
    availability: z.string()
        .refine(
            s => { try { return Array.isArray(JSON.parse(s)); } catch { return false; } },
            'Must be a JSON array of slot keys'
        )
        .optional(),
    timezone: z.string().max(100).optional(),
    // UTM fields
    utmSource: z.string().max(200).optional(),
    utmMedium: z.string().max(200).optional(),
    utmCampaign: z.string().max(200).optional(),
    utmContent: z.string().max(200).optional(),
    utmTerm: z.string().max(200).optional(),
    gaClientId: z.string().max(200).optional(),
    fbClientId: z.string().max(200).optional(),
    fbBrowserId: z.string().max(200).optional(),
});

export async function POST(req: Request) {
    // Rate limit: 5 submissions per minute per IP
    const ip = getIP(req);
    const rl = rateLimit(`tutor-apply:${ip}`, 5, 60_000);
    if (!rl.success) {
        return NextResponse.json(
            { error: true, message: 'Too many requests. Please wait a minute and try again.', code: 'RATE_LIMITED' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
        );
    }

    try {
        const body = await req.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            console.error('[tutor-apply] Zod validation failed:', JSON.stringify(result.error.issues));
            console.error('[tutor-apply] Body received:', JSON.stringify(body));
            return NextResponse.json(
                { error: true, message: result.error.issues[0].message, code: 'VALIDATION_ERROR', field: result.error.issues[0].path },
                { status: 400 }
            );
        }


        const data = result.data;

        await prisma.tutorApplication.upsert({
            where: { email: data.email },
            update: {
                name: data.name,
                linkedin: data.linkedin,
                bio: data.bio,
                expertise: data.expertise,
                videoLink: data.videoLink,
                portfolioLink: data.portfolioLink,
                curriculum: data.curriculum,
                lessonPlan: data.lessonPlan,
                availability: data.availability,
                timezone: data.timezone,
                phone: data.phone,
                status: 'PENDING',
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign,
                utmContent: data.utmContent,
                utmTerm: data.utmTerm,
                gaClientId: data.gaClientId,
                fbClientId: data.fbClientId,
                fbBrowserId: data.fbBrowserId
            },
            create: {
                name: data.name,
                email: data.email,
                linkedin: data.linkedin,
                bio: data.bio,
                expertise: data.expertise,
                videoLink: data.videoLink,
                portfolioLink: data.portfolioLink,
                curriculum: data.curriculum,
                lessonPlan: data.lessonPlan,
                availability: data.availability,
                timezone: data.timezone,
                phone: data.phone,
                status: 'PENDING',
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign,
                utmContent: data.utmContent,
                utmTerm: data.utmTerm,
                gaClientId: data.gaClientId,
                fbClientId: data.fbClientId,
                fbBrowserId: data.fbBrowserId
            }
        });

        const now = new Date();
        const row: string[] = [
            now.toISOString().split('T')[0],
            now.toTimeString().split(' ')[0],
            data.name,
            data.email,
            data.phone ?? '',
            data.expertise,
            data.bio ?? '',
            data.linkedin ?? '',
            data.videoLink,
            data.portfolioLink ?? '',
            data.curriculum ?? '',
            data.lessonPlan ?? '',
            data.availability ?? '',
            data.timezone ?? '',
            data.utmSource ?? '',
            data.utmMedium ?? '',
            data.utmCampaign ?? ''
        ];

        try {
            await appendToTutorSheet([row]);
        } catch (sheetErr) {
            console.warn('[tutor-apply] Google Sheets append failed (non-fatal):', sheetErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in tutor-apply API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
