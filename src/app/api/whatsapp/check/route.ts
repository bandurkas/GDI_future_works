import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ exists: true });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');

    if (cleanPhone.length < 8) {
      return NextResponse.json({ exists: true });
    }

    const apiUrl = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
    const token = process.env.WHAPI_TOKEN;

    if (!token) {
      console.warn('[whapi] WHAPI_TOKEN not set — skipping check');
      return NextResponse.json({ exists: true });
    }

    const res = await fetch(`${apiUrl}/contacts/check`, {
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

    let exists: boolean | undefined;
    if (typeof data.exists === 'boolean') {
      exists = data.exists;
    } else if (Array.isArray(data.contacts) && data.contacts.length > 0) {
      const c = data.contacts[0];
      exists = Boolean(c?.status === 'valid' || c?.exists || c?.in_whatsapp);
    }

    return NextResponse.json({ exists: exists ?? true });
  } catch (error) {
    console.error('WA check error:', error);
    return NextResponse.json({ exists: true });
  }
}
