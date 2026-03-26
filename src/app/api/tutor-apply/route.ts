import { NextResponse } from 'next/server';
import { appendToTutorSheet } from '@/lib/googleSheets';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Helper: treats empty string as undefined so .optional() URL fields don't fail on ""
const optionalUrl = z.preprocess(
    val => (val === '' ? undefined : val),
    z.string().url().optional()
);

const schema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    expertise: z.string().min(2).max(200),
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
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            console.error('[tutor-apply] Zod validation failed:', JSON.stringify(result.error.issues));
            console.error('[tutor-apply] Body received:', JSON.stringify(body));
            return NextResponse.json({ error: result.error.issues[0].message, field: result.error.issues[0].path }, { status: 400 });
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
                status: 'PENDING'
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
                status: 'PENDING'
            }
        });

        const now = new Date();
        const row: string[] = [
            now.toISOString().split('T')[0],
            now.toTimeString().split(' ')[0],
            data.name,
            data.email,
            data.expertise,
            data.bio ?? '',
            data.linkedin ?? '',
            data.videoLink,
            data.portfolioLink ?? '',
            data.curriculum ?? '',
            data.lessonPlan ?? '',
            data.availability ?? '',
            data.timezone ?? '',
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
