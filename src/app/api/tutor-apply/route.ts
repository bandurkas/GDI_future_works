import { NextResponse } from 'next/server';
import { appendToTutorSheet } from '@/lib/googleSheets';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Validate basic fields
        if (!data.name || !data.email || !data.expertise || !data.videoLink) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = new Date();
        const row = [
            now.toISOString().split('T')[0],
            now.toTimeString().split(' ')[0],
            data.name,
            data.email,
            data.expertise,
            data.bio,
            data.linkedin,
            data.videoLink,
            data.portfolioLink,
            data.curriculum,
            data.lessonPlan
        ];

        await appendToTutorSheet([row]);

        console.log('New Tutor Application saved to Google Sheets:', data.email);

        // Success response
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in tutor-apply API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
