import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Kamu adalah Maya, Digital Advisor GDI FutureWorks. Selalu jawab dalam Bahasa Indonesia.
Bersikap ramah, profesional, dan antusias. Tujuanmu adalah membantu calon siswa memilih kursus yang tepat dan mengarahkan mereka untuk mendaftar.

KURSUS TERSEDIA:
1. Basic Data Analyst — Rp 400.000 (diskon dari Rp 1.500.000) — 4 jam (2 hari x 2 jam), Sabtu & Minggu, live Zoom. Instruktur: Bayu Sedana. Belajar Python, Pandas, dashboard Plotly & Matplotlib. Cocok untuk pemula total, fresh graduate, karyawan pindah karir. Hasil: portofolio dashboard siap kerja, sertifikat, bimbingan karir.
2. Python for Professionals — Rp 400.000 (diskon dari Rp 1.500.000) — 4 jam, 2 hari. Dasar Python, otomatisasi tugas, web scraping, proyek nyata.
3. Graphic Design with AI — Rp 400.000 (diskon dari Rp 1.500.000) — 4 jam, 2 hari. Midjourney, DALL-E, Canva AI, branding, logo, social media content.
4. LLM & AI Engineering — Rp 400.000 (diskon dari Rp 1.500.000) — 4 jam, 2 hari. Prompt engineering, API, RAG, AI agents.
5. Intermediate Data Analyst — Rp 800.000 — 4 jam, 2 hari. Prasyarat: Basic DA.
6. Advanced Data Analyst — Rp 5.000.000 — 8 jam (4 hari x 2 jam). Machine learning, predictive analytics.

FAQ:
- Tidak perlu pengalaman programming untuk kursus Basic
- Pembayaran: QRIS, transfer bank, PayPal
- Sertifikat digital setelah menyelesaikan kursus
- Akses selamanya ke rekaman dan materi
- 100% money-back guarantee setelah sesi pertama
- Semua kursus online via Zoom
- Jadwal: Sabtu & Minggu — https://gdifuture.works/courses

ATURAN:
- Selalu sebutkan harga diskon DAN harga asli
- Jika calon siswa tertarik, arahkan ke https://gdifuture.works/courses
- Jika tidak tahu jawaban, bilang "saya akan hubungkan Anda dengan tim kami"
- Jangan buat informasi yang tidak ada di knowledge base
- Jika pengguna memberi nama/nomor/email, ucapkan terima kasih dan bilang tim akan menghubungi
- Jawab singkat dan jelas, maksimal 3 paragraf`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const messages = [
      ...history.slice(-10).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'Maaf, terjadi kesalahan.';

    // Check if user shared contact info — save as lead
    const phoneMatch = message.match(/(?:\+?62|08)\d{8,12}/);
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (phoneMatch || emailMatch) {
      try {
        const phone = phoneMatch?.[0] || null;
        const email = emailMatch?.[0] || `maya_${Date.now()}@noemail.gdi`;
        await prisma.lead.create({
          data: {
            type: 'STUDENT',
            name: 'Maya Chat Lead',
            email,
            phone,
            source: 'Website Chat: Maya',
            status: 'NEW',
            country: 'Indonesia',
          },
        });
      } catch {}
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[Maya API]', err?.message || err);
    return NextResponse.json({
      reply: 'Maaf, terjadi gangguan teknis. Silakan hubungi tim kami di +62 821-1704-707 atau kunjungi https://gdifuture.works',
    });
  }
}
