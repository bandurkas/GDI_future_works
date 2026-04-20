import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { courses, getCourseBySlug } from '@/data/courses';
import StickyBookingBar from '@/components/StickyBookingBar';
import CoursePriceCard from '@/components/CoursePriceCard';
import WhatsAppTrackedLink from '@/components/WhatsAppTrackedLink';
import { Translate } from '@/components/LanguageContext';
import styles from './page.module.css';

import { cookies, headers } from 'next/headers';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    return courses.map((c) => ({ slug: c.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) return {};

    // For SEO, we determine lang to show correct title/desc
    const cookieStore = await cookies();
    const lang = cookieStore.get('GDI_LANG')?.value === 'id' ? 'id' : 'en';

    const title = lang === 'id' && course.titleID ? `${course.titleID} — GDI FutureWorks` : `${course.title} — GDI FutureWorks`;
    const description = lang === 'id' && course.descriptionID ? course.descriptionID : course.description;

    const url = `https://gdifuture.works/courses/${slug}`;
    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: 'GDI FutureWorks',
            type: 'website',
            images: [{ url: 'https://gdifuture.works/LOGO_FW.svg', width: 800, height: 600, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://gdifuture.works/LOGO_FW.svg'],
        },
    };
}


export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) notFound();

    const cookieStore = await cookies();
    const headerStore = await headers();

    // Language detection sequence: cookie > CF header > Accept-Language > default
    const langCookie = cookieStore.get('GDI_LANG')?.value;
    const cfCountry = headerStore.get('cf-ipcountry') ?? '';
    const acceptLang = headerStore.get('accept-language') ?? '';

    let lang: 'en' | 'id' = 'en';
    if (langCookie === 'id' || langCookie === 'en') {
        lang = langCookie;
    } else if (cfCountry === 'ID') {
        lang = 'id';
    } else if (acceptLang.toLowerCase().includes('id')) {
        lang = 'id';
    }

    const isID = lang === 'id';

    // Localized field resolution
    const title = isID && course.titleID ? course.titleID : course.title;
    const subtitle = isID && course.subtitleID ? course.subtitleID : course.subtitle;
    const description = isID && course.descriptionID ? course.descriptionID : course.description;
    const nextSession = isID && course.nextSessionID ? course.nextSessionID : course.nextSession;
    const durationLabel = isID && course.durationID ? course.durationID : course.duration;
    const instructor = isID && course.instructorID ? course.instructorID : course.instructor;
    const outcomes = isID && course.outcomesID ? course.outcomesID : course.outcomes;
    const whyWorthIt = isID && course.whyWorthItID ? course.whyWorthItID : course.whyWorthIt;
    const syllabusDetails = isID && course.syllabusDetailsID ? course.syllabusDetailsID : course.syllabusDetails;
    const whatYouGet = isID && course.whatYouGetID ? course.whatYouGetID : course.whatYouGet;
    const whoFor = isID && course.whoForID ? course.whoForID : course.whoFor;

    return (
        <div className={`${styles.page} page-with-sticky-bottom`}>
            {/* ===== HERO ===== */}
            <section className={styles.hero}>
                <div className="container">
                    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                        <Link href="/">{isID ? 'Beranda' : 'Home'}</Link>
                        <span aria-hidden="true"> › </span>
                        <Link href="/courses">{isID ? 'Kursus' : 'Courses'}</Link>
                        <span aria-hidden="true"> › </span>
                        <span aria-current="page">{course.category}</span>
                    </nav>

                    <div className={styles.heroGrid}>
                        <div className={styles.heroLeft}>
                            <div className={styles.heroIconRow}>
                                <div className={styles.heroIcon} style={{ background: course.iconBg }}>{course.icon}</div>
                                <span className="badge badge-accent">{course.category}</span>
                                {course.seatsLeft <= 5 && (
                                    <span className="badge" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                                        🔴 {isID ? `Hanya ${course.seatsLeft} kursi tersisa` : `Only ${course.seatsLeft} seats left`}
                                    </span>
                                )}
                            </div>
                            <h1 className={styles.heroTitle}>{title}</h1>
                            <p className={styles.heroSubtitle}>{subtitle}</p>
                            <p className={styles.heroDesc}>{description}</p>

                            <div className={styles.heroMeta}>
                                {[
                                    { icon: '📅', label: isID ? 'Sesi berikutnya' : 'Next session', val: nextSession },
                                    { icon: '⏱', label: isID ? 'Durasi' : 'Duration', val: course.format },
                                    { icon: '👥', label: 'Format', val: isID ? 'Langsung · maks 12 siswa' : 'Live · max 12 students' },
                                ].map((m) => (
                                    <div key={m.label} className={styles.metaItem}>
                                        <span aria-hidden="true">{m.icon}</span>
                                        <div>
                                            <span className={styles.metaLabel}>{m.label}</span>
                                            <span className={styles.metaVal}>{m.val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.heroRating}>
                                <span className={styles.stars} aria-label="5 stars">⭐⭐⭐⭐⭐</span>
                                <strong>{course.rating}</strong>
                                <span className={styles.ratingCount}>({course.studentsCount.toLocaleString()} {isID ? 'peserta' : 'students'})</span>
                            </div>
                        </div>

                        {/* Price card — desktop hero */}
                        <div className={styles.priceCard}>
                            <CoursePriceCard course={course} slug={slug} variant="hero" styles={styles} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BODY ===== */}
            <div className={styles.body}>
                <div className="container">
                    <div className={styles.bodyGrid}>
                        <div className={styles.bodyMain}>

                            {/* BLOCK 1 — INSTRUCTOR */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>{isID ? 'Kenali Instruktur Anda' : 'Meet Your Instructor'}</h2>
                                <div className={styles.instructorCard}>
                                    <div className={styles.instructorTop}>
                                        <div className={styles.instructorAvatar} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                                            {instructor.photoUrl
                                                ? <img src={instructor.photoUrl} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                : instructor.initials}
                                        </div>
                                        <div>
                                            <h3 className={styles.instructorName}>{instructor.name}</h3>
                                            <p className={styles.instructorRole}>{instructor.role}</p>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                {instructor.linkedin && (
                                                    <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                                        LinkedIn
                                                    </a>
                                                )}
                                                {instructor.github && (
                                                    <a href={instructor.github} target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#181717"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                                                        GitHub
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video Banner */}
                                    {instructor.loom && (
                                        <a href={instructor.loom} target="_blank" rel="noopener noreferrer" className={styles.videoBanner}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className={styles.iconPlay}>
                                                    <span style={{ fontSize: '0.75rem', paddingLeft: '2px' }}>▶</span>
                                                </div>
                                                <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{isID ? 'Tonton Perkenalan Instruktur' : 'Watch Instructor Intro'}</span>
                                            </div>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>~5 min</span>
                                        </a>
                                    )}

                                    {/* Status Badges */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '0.5rem 0 1rem', padding: '1.25rem', border: '1px dashed #ebeeef', borderRadius: '1rem', background: '#f2f4f4' }}>
                                        <div className={styles.badgeChip}>⭐ {isID ? 'Pakar Industri Terverifikasi' : 'Verified Industry Expert'}</div>
                                        <div className={styles.badgeChip}>🔬 {isID ? `Saat ini merupakan Profesional ${instructor.company}` : `Currently an ${instructor.company} Professional`}</div>
                                        <div className={styles.badgeChip}>📊 {isID ? 'Pengalaman 6+ Tahun' : '6+ Years Experience'}</div>
                                        <div className={styles.badgeChip}>👥 {isID ? 'Pelatih IT Aktif' : 'Active IT Trainer'}</div>
                                    </div>

                                    <div className={styles.quoteBlock}>
                                        ✦ {instructor.experience}
                                    </div>

                                    <ul className={styles.checkList}>
                                        {instructor.credentials.map((c, i) => (
                                            <li key={i} className={styles.checkItem}>
                                                <div className={styles.checkIcon}>✓</div>
                                                <span>{c}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            {/* RETENTION: Learning Path Bundle */}
                            <section className={styles.learningPathBlock}>
                                <div>
                                    <div className={styles.pathBadge}>{isID ? 'JALUR BELAJAR' : 'LEARNING PATH'}</div>
                                    <h3 className={styles.pathTitle}>{isID ? `Buka Jalur Karier ${course.category} Sepenuhnya` : `Unlock the Full ${course.category} Career Path`}</h3>
                                    <p className={styles.pathDesc}>{isID ? `Gabungkan kursus ini dengan dua modul lanjutan dan dapatkan diskon 25% dari total harga. Kuasai keterampilan yang dicari perusahaan.` : `Bundle this course with two advanced modules and get 25% off the total price. Master the skills that employers are actively hiring for.`}</p>
                                </div>
                                <WhatsAppTrackedLink
                                    href={`/api/whatsapp?text=${encodeURIComponent(isID ? `Halo, saya tertarik dengan penawaran bundel untuk ${title}. Bisa jelaskan lebih lanjut?` : `Hi, I'm interested in the bundle offer for ${title}. Can you tell me more?`)}`}
                                    className={styles.pathBtn}
                                    eventSource="course_bundle"
                                >
                                    {isID ? 'Klaim Penawaran Bundel' : 'Claim Bundle Offer'}
                                </WhatsAppTrackedLink>
                            </section>

                            {/* BLOCK 2 — OUTCOMES */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>{isID ? 'Yang Akan Anda Pelajari' : "What You'll Learn"}</h2>
                                <p className={styles.blockDesc}>{isID ? 'Setelah kursus ini, Anda akan dapat:' : 'After this course, you will be able to:'}</p>
                                <div className="check-list">
                                    {outcomes.map((o, i) => (
                                        <div key={i} className="check-item">
                                            <div className="check-icon">✓</div>
                                            <span>{o}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 2.5 — CURRICULUM */}
                            {syllabusDetails && (
                                <section className={styles.block}>
                                    <h2 className={styles.blockTitle}>{isID ? 'Kurikulum Kursus' : 'Course Curriculum'}</h2>
                                    <div className={styles.syllabusContainer}>
                                        {syllabusDetails.sessions.map((session, i) => (
                                            <div key={i} className={styles.syllabusItem}>
                                                <div className={styles.syllabusHeader}>
                                                    <span className={styles.syllabusNum}>{i + 1}</span>
                                                    <h4 className={styles.syllabusTitle}>{session.title}</h4>
                                                </div>
                                                <ul className={styles.syllabusList}>
                                                    {session.items.map((item, j) => (
                                                        <li key={j} className={styles.syllabusListItem}>
                                                            <span className={styles.syllabusCheck}>✓</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                        <div className={styles.syllabusProject}>
                                            <span className={styles.syllabusProjectLabel}>🎯 {isID ? 'Proyek Portofolio' : 'Portfolio Project'}</span>
                                            <p>{syllabusDetails.project}</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* BLOCK 3 — SOCIAL PROOF */}
                            <section className={`${styles.block} ${styles.proofBlock}`}>
                                <div className={styles.proofStat}>
                                    <div className={styles.proofNum}>{course.studentsCount.toLocaleString()}+</div>
                                    <div className={styles.proofLabel}>{isID ? 'siswa telah menyelesaikan kursus ini' : 'students have completed this course'}</div>
                                </div>
                                <div className={styles.pullQuote}>
                                    <span className={styles.quoteMarks}>&ldquo;</span>
                                    <p>{isID && course.testimonialQuoteID ? course.testimonialQuoteID : course.testimonialQuote}</p>
                                    <span className={styles.quoteAuthor}>— {course.testimonialAuthor}</span>
                                </div>
                            </section>

                            {/* BLOCK 4 — WHAT YOU GET */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>{isID ? 'Yang Anda Dapatkan' : 'What You Get'}</h2>
                                <div className={styles.getsGrid}>
                                    {whatYouGet.map((item, i) => (
                                        <div key={i} className={styles.getItem}>
                                            <div className="check-icon">✓</div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 5 — FORMAT */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>{isID ? 'Format Pembelajaran' : 'Learning Format'}</h2>
                                <div className={styles.formatGrid}>
                                    {[
                                        { icon: '💻', title: 'Live Online', desc: isID ? 'Interaktif, bukan rekaman.' : 'Interactive, not pre-recorded.' },
                                        { icon: '🙋', title: isID ? 'Tanya Apa Saja' : 'Ask Anything', desc: isID ? 'Tanya jawab sepanjang sesi.' : 'Q&A throughout the entire session.' },
                                        { icon: '👥', title: isID ? 'Maks 12 Siswa' : 'Max 12 Students', desc: isID ? 'Grup kecil untuk perhatian nyata.' : 'Small group for real attention.' },
                                        { icon: '⏱', title: isID && course.durationID ? course.durationID : course.format, desc: isID ? 'Padat, fokus, dan efektif.' : 'Compact, focused, and effective.' },
                                    ].map((f, i) => (
                                        <div key={i} className={styles.formatItem}>
                                            <span className={styles.formatIcon}>{f.icon}</span>
                                            <h4 className={styles.formatTitle}>{f.title}</h4>
                                            <p className={styles.formatDesc}>{f.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 6 — WHY IT'S WORTH IT */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>{isID ? 'Mengapa Ini Sebanding' : "Why It's Worth It"}</h2>
                                <div className="check-list">
                                    {whyWorthIt.map((item, i) => (
                                        <div key={i} className="check-item">
                                            <div className="check-icon">✓</div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 7 — WHO IT'S FOR */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>{isID ? 'Untuk Siapa Kursus Ini' : 'Who This Course Is For'}</h2>
                                <div className={styles.whoGrid}>
                                    {whoFor.map((who, i) => (
                                        <div key={i} className={styles.whoItem}>
                                            <span>👤</span>
                                            <span>{who}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* MOBILE bottom CTA (inside content for scrollers) */}
                            <div className={styles.mobileCta}>
                                <Link href={`/courses/${slug}/schedule`} className="btn btn-primary btn-xl btn-full" id="mobile-inline-cta">
                                    {isID ? 'Pilih Tanggal & Waktu →' : 'Choose Date & Time →'}
                                </Link>
                                <p className={styles.mobileCtaNote}>🔒 {isID ? 'Aman · Dikonfirmasi via WhatsApp dalam <2 menit' : 'Secure · Confirmed via WhatsApp in <2 min'}</p>
                            </div>

                        </div>

                        {/* ===== STICKY SIDEBAR (desktop) ===== */}
                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarCard}>
                                <CoursePriceCard course={course} slug={slug} variant="sidebar" styles={styles} />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* Sticky bottom bar (mobile) */}
            <StickyBookingBar course={course} />
        </div>
    );
}
