import { NextResponse } from 'next/server';
import { appendToInterestSheet } from '@/lib/googleSheets';

export async function POST(req: Request) {
    try {
        const { name, email, country, interest, goal, budget } = await req.json();

        if (!name?.trim() || !email?.trim() || !country?.trim() || !interest?.trim()) {
            return NextResponse.json({ error: 'Name, email, country and interest are required' }, { status: 400 });
        }

        if (!email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];

        await appendToInterestSheet([[
            dateStr,
            timeStr,
            name.trim(),
            email.trim().toLowerCase(),
            country.trim(),
            interest,
            goal || '',
            budget || '',
        ]]);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Interest form error:', error);
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
}
