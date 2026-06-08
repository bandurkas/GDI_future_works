import { NextRequest, NextResponse } from 'next/server';
import { normalizeIdPhone } from '@/lib/webinar';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ exists: true });
    }

    // Normalize to international digits (62…, no "+") — Whapi needs this, else
    // local "08…" numbers never match and the check silently passes everyone.
    const cleanPhone = normalizeIdPhone(phone);

    if (cleanPhone.length < 10) {
      return NextResponse.json({ exists: true });
    }

    if (process.env.E2E_MODE === '1') {
      const flag = req.headers.get('x-e2e-wa');
      if (flag === 'fail') return NextResponse.json({ exists: false, status: 'invalid', e2e: true });
      return NextResponse.json({ exists: true, status: 'valid', e2e: true });
    }

    const apiUrl = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
    const token = process.env.WHAPI_TOKEN;

    if (!token) {
      console.warn('[whapi] WHAPI_TOKEN not set — skipping check');
      return NextResponse.json({ exists: true });
    }

    const res = await fetch(`${apiUrl}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blocking: 'wait', contacts: [cleanPhone] }),
    });

    if (!res.ok) {
      console.warn('[whapi] non-ok response:', res.status);
      return NextResponse.json({ exists: true });
    }

    const data = await res.json();
    const contact = Array.isArray(data?.contacts) ? data.contacts[0] : null;
    const exists = contact?.status === 'valid';

    return NextResponse.json({ exists, status: contact?.status ?? 'unknown' });
  } catch (error) {
    console.error('WA check error:', error);
    return NextResponse.json({ exists: true });
  }
}
