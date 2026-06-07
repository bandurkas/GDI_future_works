'use client';

import { useEffect, useState, FormEvent } from 'react';
import styles from './webinar.module.css';
import { HandWrittenTitle } from './HandWrittenTitle';
import { trackConversion, getGAClientId, getFbc, getFbp } from '@/lib/analytics';

/* ─────────────────────────────────────────────────────────────────
   EDIT THESE TWO CONSTANTS TO RESCHEDULE THE WEBINAR
   ───────────────────────────────────────────────────────────────── */
const WEBINAR_DATE = new Date('2026-06-13T10:00:00+07:00'); // 13 Juni 2026, 10:00 WIB

const WEBINAR_DATE_LABEL = '13 Juni 2026';
const WEBINAR_TIME_LABEL = '10:00 WIB';

/* ─────────────────────────────────────────────────────────────────
   Countdown hook
   ───────────────────────────────────────────────────────────────── */
function useCountdown(target: Date) {
    const [now, setNow] = useState<number>(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const diff = Math.max(0, target.getTime() - now);
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    const secs = Math.floor((diff % 60_000) / 1_000);
    return { days, hours, mins, secs, ended: diff === 0 };
}

const pad = (n: number) => n.toString().padStart(2, '0');

/* ─────────────────────────────────────────────────────────────────
   Scroll reveal hook (IntersectionObserver, runs once per element)
   ───────────────────────────────────────────────────────────────── */
function useReveal() {
    useEffect(() => {
        const els = document.querySelectorAll<HTMLElement>(`.${styles.reveal}`);
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add(styles.revealIn);
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
}

/* ─────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────── */
export default function WebinarClient() {
    const { days, hours, mins, secs, ended } = useCountdown(WEBINAR_DATE);
    useReveal();

    return (
        <div className={styles.page}>
            <StickyCountdown days={days} hours={hours} mins={mins} secs={secs} ended={ended} />
            <Hero ended={ended} />
            <SocialProof />
            <Personas />
            <Agenda />
            <Urgency />
            <Speaker />
            <FinalClosing days={days} hours={hours} mins={mins} secs={secs} ended={ended} />
            <MiniFooter />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   1. Sticky countdown bar
   ───────────────────────────────────────────────────────────────── */
function StickyCountdown({ days, hours, mins, secs, ended }: { days: number; hours: number; mins: number; secs: number; ended: boolean }) {
    return (
        <div className={styles.stickyBar}>
            <span className={styles.stickyDot} aria-hidden />
            <span>
                {ended ? 'Webinar sedang berlangsung' : 'Webinar mulai dalam:'}{' '}
                {!ended && (
                    <span className={styles.stickyTime}>
                        {days > 0 && `${days}h `}
                        {pad(hours)}:{pad(mins)}:{pad(secs)}
                    </span>
                )}
            </span>
            <a href="#daftar" className={styles.stickyCta}>Amankan Slot Gratis →</a>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   2. Hero + form
   ───────────────────────────────────────────────────────────────── */
function Hero({ ended }: { ended: boolean }) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroInner}>
                <div className={styles.reveal}>
                    <div className={styles.heroEyebrow}>Webinar Premium · Live 60 Menit · Slot Terbatas</div>
                    <HandWrittenTitle title="Master AI-Assisted Coding Workflow" />
                    <p className={styles.heroSub}>
                        Pelajari cara developer modern memakai Claude, Gemini, Cursor, dan GPT untuk planning, coding, debugging, review, dan shipping aplikasi secara <strong>end-to-end</strong>.
                    </p>
                    <div className={styles.heroMeta}>
                        <div className={styles.heroMetaItem}>
                            <span className={styles.heroMetaKey}>Tanggal</span>
                            <span className={styles.heroMetaVal}>{WEBINAR_DATE_LABEL}</span>
                        </div>
                        <div className={styles.heroMetaItem}>
                            <span className={styles.heroMetaKey}>Waktu</span>
                            <span className={styles.heroMetaVal}>{WEBINAR_TIME_LABEL}</span>
                        </div>
                        <div className={styles.heroMetaItem}>
                            <span className={styles.heroMetaKey}>Format</span>
                            <span className={styles.heroMetaVal}>Live di Zoom</span>
                        </div>
                        <div className={styles.heroMetaItem}>
                            <span className={styles.heroMetaKey}>Bahasa</span>
                            <span className={styles.heroMetaVal}>Indonesia</span>
                        </div>
                        <div className={styles.heroMetaItem}>
                            <span className={styles.heroMetaKey}>Investasi</span>
                            <span className={styles.heroMetaVal} style={{ color: '#D42B2B' }}>
                                <span style={{ textDecoration: 'line-through', opacity: 0.5, fontWeight: 600, marginRight: 8 }}>Rp 400.000</span>
                                <span style={{ fontWeight: 800 }}>GRATIS</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.reveal} id="daftar">
                    <RegistrationForm />
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Registration form (with loading/error/success states)
   ───────────────────────────────────────────────────────────────── */
function RegistrationForm() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) { setError('Nama lengkap wajib diisi.'); return; }
        if (phone.replace(/\D/g, '').length < 8) { setError('Nomor WhatsApp gak valid (min 8 digit).'); return; }
        setLoading(true);
        try {
            const [gaClientId, fbClientId, fbBrowserId] = await Promise.all([
                getGAClientId(),
                Promise.resolve(getFbc()),
                Promise.resolve(getFbp()),
            ]);

            const urlParams = new URLSearchParams(window.location.search);

            const res = await fetch('/api/leads/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim() || undefined,
                    scenario: 'Consultation',
                    courseId: 'ai-vibe-coding',
                    courseTitle: `Webinar: AI Vibe Coding (${WEBINAR_DATE_LABEL})`,
                    gaClientId,
                    fbClientId,
                    fbBrowserId,
                    utmSource: urlParams.get('utm_source'),
                    utmMedium: urlParams.get('utm_medium'),
                    utmCampaign: urlParams.get('utm_campaign'),
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || 'Gagal daftar. Coba lagi atau chat WA admin.');
            }

            // Fire browser-side Meta Pixel 'Lead' + GA4 'generate_lead'.
            // Server-side CAPI 'Lead' fires from /api/leads/capture; fbc/fbp passed above let Meta dedup.
            trackConversion('webinar_register', `AI Vibe Coding Webinar (${WEBINAR_DATE_LABEL})`);

            setDone(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className={styles.successCard}>
                <h3>Terima kasih sudah daftar ✓</h3>
                <p>
                    Admin kami akan kontak kamu via WhatsApp dalam <strong>5 menit</strong> untuk <strong>konfirmasi pendaftaran</strong> + kirim link Zoom dan bonus 30+ AI Prompts Pack.
                </p>
                <p style={{ marginBottom: 0 }}>
                    Slot kamu sudah terkunci. Sampai jumpa di webinar! 🎉
                </p>
                <div className={styles.successHint}>
                    Belum dapet WA dari kami dalam 5 menit? Langsung chat admin: <a href="https://wa.me/628211704707?text=Halo%20admin%2C%20saya%20baru%20daftar%20webinar%20AI%20Vibe%20Coding%20dan%20butuh%20konfirmasi%20pendaftaran" target="_blank" rel="noopener" style={{ color: '#D42B2B', fontWeight: 700 }}>+62 821-1704-707</a>
                </div>
            </div>
        );
    }

    return (
        <form className={styles.formCard} onSubmit={submit} noValidate>
            <span className={styles.formBadge}>
                <span style={{ textDecoration: 'line-through', opacity: 0.55, fontWeight: 600, marginRight: 8 }}>Rp 400.000</span>
                GRATIS · Akses Live + Replay
            </span>
            <h2 className={styles.formTitle}>Amankan slot kamu</h2>
            <p className={styles.formSub}>Sudah termasuk bonus 30+ AI Prompts Pack + akses replay 24 jam.</p>

            {error && <div className={styles.formError}>{error}</div>}

            <input
                className={styles.formField}
                type="text"
                placeholder="Nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
            />
            <input
                className={styles.formField}
                type="tel"
                placeholder="Nomor WhatsApp (cth: 08123456789)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
            />
            <input
                className={styles.formField}
                type="email"
                placeholder="Email (buat link Zoom)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
            />

            <button className={styles.formCta} type="submit" disabled={loading}>
                {loading ? 'Mengamankan slot…' : 'Amankan Slot Gratis →'}
            </button>

            <div className={styles.formFoot}>
                Setelah daftar, admin kirim konfirmasi + link Zoom ke WhatsApp kamu dalam 5 menit. Sebelumnya webinar ini Rp 400.000 — sekarang gratis, slot terbatas.
            </div>
        </form>
    );
}

/* ─────────────────────────────────────────────────────────────────
   4. Social proof bar
   ───────────────────────────────────────────────────────────────── */
function SocialProof() {
    const avatars: { letter: string; bg: string }[] = [
        { letter: 'R', bg: '#D42B2B' },
        { letter: 'A', bg: '#0D0D0D' },
        { letter: 'S', bg: '#A81E1E' },
        { letter: 'F', bg: '#2a2a2a' },
        { letter: 'M', bg: '#FF4040' },
    ];
    return (
        <section className={`${styles.proofBar} ${styles.reveal}`}>
            <div className={styles.proofInner}>
                <div className={styles.avatarRow} aria-hidden>
                    {avatars.map((a, i) => (
                        <div key={i} className={styles.avatar} style={{ background: a.bg }}>{a.letter}</div>
                    ))}
                </div>
                <div className={styles.proofText}>
                    Udah <strong>247+ developer Indonesia</strong> ikut training AI Vibe Coding bareng GDI
                </div>
                <div className={styles.proofRating}>
                    <span className={styles.proofStars}>★★★★★</span>
                    <span>4.8/5 dari 247 alumni</span>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   5. Persona segmentation
   ───────────────────────────────────────────────────────────────── */
const personas = [
    {
        tag: 'Buat Developer',
        title: 'Capek ngetik boilerplate yang itu-itu aja?',
        points: [
            'AI handle scaffolding & repetitive code',
            'Autocomplete level senior dev di tiap file',
            'Ship feature 3× lebih cepet dari kompetitor',
            'Fokus ke arsitektur & logic, bukan syntax',
        ],
    },
    {
        tag: 'Buat Solo Founder',
        title: 'Punya ide tapi gak punya tim?',
        points: [
            'Bangun MVP dalam hitungan jam, bukan minggu',
            'Gak perlu hire CTO atau dev mahal',
            'Validasi ide ke market secepat mungkin',
            'Investor lebih percaya kalau prototype-nya udah jalan',
        ],
    },
    {
        tag: 'Buat Freelancer',
        title: 'Mau ambil lebih banyak project tapi gak ada waktu?',
        points: [
            '2× kapasitas project dengan jam kerja sama',
            'Charge premium karena delivery lebih cepet',
            'Klien happy karena turnaround singkat',
            'Margin per project naik tanpa naik harga',
        ],
    },
    {
        tag: 'Buat Career Switcher',
        title: 'Mau pindah ke tech tapi takut hafal syntax?',
        points: [
            'AI urus syntax — kamu fokus problem solving',
            'Portfolio jadi lebih cepet, gak perlu nunggu jago',
            'Skill yang transferable ke bahasa & framework apa pun',
            'Tetap bayar gaji dev — tanpa CS degree',
        ],
    },
];

function Personas() {
    return (
        <section className={styles.section}>
            <div className={styles.reveal}>
                <div className={styles.eyebrow}>Cocok Buat Siapa</div>
                <h2 className={styles.sectionTitle}>
                    Webinar ini buat kamu yang <em>udah tau AI lagi ngubah game</em> — tapi belum tau cara naik kapalnya.
                </h2>
            </div>
            <div className={styles.personaGrid}>
                {personas.map((p, i) => (
                    <div key={i} className={`${styles.personaCard} ${styles.reveal}`}>
                        <div className={styles.personaTag}>{p.tag}</div>
                        <h3 className={styles.personaTitle}>{p.title}</h3>
                        <ul className={styles.personaList}>
                            {p.points.map((pt, j) => <li key={j}>{pt}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   7. Agenda — 60 menit timed
   ───────────────────────────────────────────────────────────────── */
const agenda = [
    {
        time: '10:00 – 10:10',
        dur: '10 menit',
        title: 'Apa itu AI Vibe Coding — kapan menang dari ngoding manual',
        desc: 'Mindset shift: kamu konduktornya, AI orkestranya. Kapan pakai vibe coding, kapan tetep manual.',
    },
    {
        time: '10:10 – 10:25',
        dur: '15 menit',
        title: 'Adu Claude vs Gemini vs GPT — pilih yang pas per use case',
        desc: 'Konteks 200K vs 2M token. Harga API. Kekuatan & kelemahan tiap model dari pemakai harian.',
    },
    {
        time: '10:25 – 10:45',
        dur: '20 menit',
        title: 'LIVE BUILD: Bikin tool dari nol pakai AI dalam 20 menit',
        desc: 'Demo penuh — kamu liat tiap prompt, tiap iterasi, tiap bug yang muncul dan cara fix-nya.',
    },
    {
        time: '10:45 – 10:55',
        dur: '10 menit',
        title: '5 prinsip prompting yang naekin output 10× sekali jadi',
        desc: 'Template prompt siap pakai. Cara minta AI debug. Cara dapet code production-ready, bukan demo.',
    },
    {
        time: '10:55 – 11:00',
        dur: '5 menit',
        title: 'Q&A + Bonus + Cara lanjut ke kursus lengkap',
        desc: 'Tanya bebas. Info kursus penuh AI Vibe Coding + diskon khusus peserta webinar.',
    },
];

function Agenda() {
    return (
        <section className={styles.section}>
            <div className={styles.reveal}>
                <div className={styles.eyebrow}>Agenda · 60 Menit</div>
                <h2 className={styles.sectionTitle}>
                    Apa yang kamu pelajari, <em>menit per menit</em>.
                </h2>
                <p className={styles.sectionLede}>
                    Bukan webinar generic yang isinya "AI is the future". Ini breakdown spesifik per segmen waktu, plus live demo beneran.
                </p>
            </div>
            <div className={styles.agendaList}>
                {agenda.map((a, i) => (
                    <div key={i} className={`${styles.agendaRow} ${styles.reveal}`}>
                        <div>
                            <div className={styles.agendaTime}>{a.time}</div>
                            <div className={styles.agendaTimeDuration}>{a.dur}</div>
                        </div>
                        <div>
                            <h3 className={styles.agendaTitle}>{a.title}</h3>
                            <p className={styles.agendaDesc}>{a.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   10. Urgency / market narrative
   ───────────────────────────────────────────────────────────────── */
function Urgency() {
    return (
        <section className={styles.sectionDark}>
            <div className={styles.reveal}>
                <div className={styles.eyebrow}>Kenapa Sekarang</div>
                <h2 className={styles.sectionTitle}>
                    Skill paling cepet naik value-nya di 2026. <em>Yang skip, ketinggalan.</em>
                </h2>
            </div>
            <div className={`${styles.urgencyStat} ${styles.reveal}`}>
                <div>
                    <div className={styles.urgencyStatNum}>+40%</div>
                    <div className={styles.urgencyStatLabel}>Gaji rata-rata developer yang pakai AI (Stack Overflow Dev Survey)</div>
                </div>
                <div>
                    <div className={styles.urgencyStatNum}>3×</div>
                    <div className={styles.urgencyStatLabel}>Kecepatan delivery developer yang udah punya workflow AI</div>
                </div>
                <div>
                    <div className={styles.urgencyStatNum}>92%</div>
                    <div className={styles.urgencyStatLabel}>Tim engineering yang minimal 1 anggotanya pakai AI assistant tiap hari</div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   11. Speaker — Bayu Sedana
   ───────────────────────────────────────────────────────────────── */
function Speaker() {
    return (
        <section className={styles.section}>
            <div className={styles.reveal}>
                <div className={styles.eyebrow}>Pembicara</div>
                <h2 className={styles.sectionTitle}>
                    Belajar dari yang <em>tiap hari pakai AI</em> di kerjaan real.
                </h2>
            </div>
            <div className={`${styles.speakerCard} ${styles.reveal}`}>
                <div className={styles.speakerPhoto} role="img" aria-label="Foto Bayu Sedana" />
                <div className={styles.speakerInfo}>
                    <div className={styles.speakerRoleTag}>Senior Software Engineer · AI Coding Specialist</div>
                    <h3 className={styles.speakerName}>Bayu Sedana</h3>
                    <p className={styles.speakerBio}>
                        6 tahun di software engineering, data analysis & QA. Pemakai harian Claude, Gemini, dan Cursor untuk kerjaan production di proyek klien IT consulting. Instruktur tersertifikasi di 2 institusi Indonesia.
                    </p>
                    <div className={styles.speakerCreds}>
                        <span className={styles.speakerCred}>6 thn · Engineering</span>
                        <span className={styles.speakerCred}>AI Coding Daily</span>
                        <span className={styles.speakerCred}>23+ GitHub Projects</span>
                        <span className={styles.speakerCred}>Jakarta · Bandung</span>
                    </div>
                    <p className={styles.speakerQuote}>
                        Pakai AI buat ngoding itu bukan curang — yang penting kamu ngerti hasil yang dia kasih, dan bisa ngarahin outputnya.
                    </p>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   12 + 13. Closing hero + countdown + final CTA
   ───────────────────────────────────────────────────────────────── */
function FinalClosing({ days, hours, mins, secs, ended }: { days: number; hours: number; mins: number; secs: number; ended: boolean }) {
    return (
        <section className={styles.finalCta}>
            <div className={styles.reveal}>
                <div className={styles.eyebrow}>Slot Terbatas</div>
                <h2 className={styles.sectionTitle}>
                    Webinar mulai dalam:
                </h2>
                {!ended ? (
                    <div className={styles.countdownBig}>
                        <div className={styles.countdownBlock}>
                            <div className={styles.countdownNum}>{pad(days)}</div>
                            <div className={styles.countdownLabel}>Hari</div>
                        </div>
                        <div className={styles.countdownBlock}>
                            <div className={styles.countdownNum}>{pad(hours)}</div>
                            <div className={styles.countdownLabel}>Jam</div>
                        </div>
                        <div className={styles.countdownBlock}>
                            <div className={styles.countdownNum}>{pad(mins)}</div>
                            <div className={styles.countdownLabel}>Menit</div>
                        </div>
                        <div className={styles.countdownBlock}>
                            <div className={styles.countdownNum}>{pad(secs)}</div>
                            <div className={styles.countdownLabel}>Detik</div>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: 18, color: '#cfcfcf', margin: '32px 0' }}>
                        Webinar lagi berlangsung. Daftar sekarang buat dapet akses replay 24 jam.
                    </p>
                )}
                <p className={styles.sectionLede} style={{ textAlign: 'center', margin: '0 auto 0' }}>
                    Sebelumnya <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>Rp 400.000</span> — sekarang <strong style={{ color: '#FF4040' }}>GRATIS</strong>. Akses live + replay 24 jam + bonus 30+ AI Prompts Pack. Slot terbatas.
                </p>
            </div>
            <div className={`${styles.finalCtaForm} ${styles.reveal}`}>
                <RegistrationForm />
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   14. Mini footer
   ───────────────────────────────────────────────────────────────── */
function MiniFooter() {
    return (
        <footer className={styles.miniFooter}>
            <div>© {new Date().getFullYear()} GDI FutureWorks · Global Digital Informasi</div>
            <div style={{ marginTop: 8 }}>
                <a href="/privacy">Privasi</a>·
                <a href="/terms">Ketentuan</a>·
                <a href="https://wa.me/628211704707" target="_blank" rel="noopener">WhatsApp</a>·
                <a href="/courses/ai-vibe-coding">Kursus Lengkap</a>
            </div>
        </footer>
    );
}
