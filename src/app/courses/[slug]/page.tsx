import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { courses, getCourseBySlug } from '@/data/courses';
import StickyBookingBar from '@/components/StickyBookingBar';
import CoursePriceCard from '@/components/CoursePriceCard';
import { CheckCircle2, Star, Users, Globe, BookOpen, Clock, TrendingUp, ArrowRight } from 'lucide-react';
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

    const cookieStore = await cookies();
    const lang = cookieStore.get('GDI_LANG')?.value === 'id' ? 'id' : 'en';

    const title = lang === 'id' && course.titleID 
        ? `${course.titleID} | GDI FutureWorks Live Training` 
        : `${course.title} | GDI FutureWorks Live Training`;
    
    const description = (lang === 'id' && course.descriptionID ? course.descriptionID : course.description).substring(0, 160) + '...';
    const url = `https://gdifuture.works/courses/${slug}`;
    const imageUrl = 'https://gdifuture.works/assets/og-courses-premium.png';

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
            images: [{ url: imageUrl, width: 1200, height: 630 }],
        },
    };
}

export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) notFound();

    const cookieStore = await cookies();
    const headerStore = await headers();

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
    const titleParts = (isID && course.titleID ? course.titleID : course.title).split(' ');
    const firstPart = titleParts.slice(0, -2).join(' ');
    const accentPart = titleParts.slice(-2).join(' ');

    const subtitle = isID && course.subtitleID ? course.subtitleID : course.subtitle;
    const description = isID && course.descriptionID ? course.descriptionID : course.description;
    const outcomes = isID && course.outcomesID ? course.outcomesID : course.outcomes;
    const instructor = isID && course.instructorID ? course.instructorID : course.instructor;
    const syllabusDetails = isID && course.syllabusDetailsID ? course.syllabusDetailsID : course.syllabusDetails;
    const whatYouGet = isID && course.whatYouGetID ? course.whatYouGetID : course.whatYouGet;

    const BULLETS = [
        isID ? 'Pelatihan Live Interaktif' : 'Live Interactive Training',
        isID ? 'Maksimal 12 Siswa/Kelas' : 'Max 12 Students/Class',
        isID ? 'Dukungan WhatsApp Seumur Hidup' : 'Lifetime WhatsApp Support',
    ];

    const TRUST_STATS = [
        { value: `${course.rating}/5`, label: isID ? 'Peringkat Alumni' : 'Alumni Rating', sub: isID ? 'Berdasarkan ulasan' : 'Based on reviews' },
        { value: `${course.studentsCount.toLocaleString()}+`, label: isID ? 'Alumni' : 'Students Joined', sub: isID ? 'Global community' : 'Global community' },
        { value: 'LIVE', label: 'Format', sub: isID ? 'Interactive Sessions' : 'Interactive Sessions' },
    ];

    return (
        <div className={styles.page}>
            {/* ── HERO SECTION ── */}
            <section className={styles.hero}>
                <div className="container">
                    <span className={styles.heroEyebrow}>
                        <CheckCircle2 size={12} />
                        {course.category}
                    </span>

                    <h1 className={styles.heroTitle}>
                        {firstPart}<br />
                        <span className={styles.heroAccent}>{accentPart}</span>
                    </h1>

                    <p className={styles.heroSubtitle}>{subtitle}</p>

                    <ul className={styles.heroBullets}>
                        {BULLETS.map((b) => (
                            <li key={b} className={styles.heroBulletItem}>
                                <CheckCircle2 size={15} className={styles.heroBulletIcon} />
                                {b}
                            </li>
                        ))}
                    </ul>

                    <div className={styles.heroCtas}>
                        <Link href={`/courses/${slug}/schedule`} className={styles.ctaPrimary}>
                            {isID ? 'Mulai Belajar Sekarang' : 'Start Learning Now'} <ArrowRight size={16} />
                        </Link>
                        <a href="https://wa.me/6281222222222" className={styles.ctaSecondary}>
                            {isID ? 'Tanya via WhatsApp' : 'Inquire on WhatsApp'}
                        </a>
                    </div>

                    {/* TRUST BAR */}
                    <div className={styles.heroTrustBar}>
                        {TRUST_STATS.map((stat, i) => (
                            <div key={stat.label} className={styles.heroTrustBarInner}>
                                <div className={styles.heroTrustStat}>
                                    <span className={styles.heroTrustValue}>{stat.value}</span>
                                    <span className={styles.heroTrustLabel}>{stat.label}</span>
                                    <span className={styles.heroTrustSub}>{stat.sub}</span>
                                </div>
                                {i < TRUST_STATS.length - 1 && (
                                    <div className={styles.heroTrustDivider} aria-hidden="true" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUTCOMES SECTION (Earnings style) ── */}
            <section className={styles.outcomesSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>{isID ? 'HASIL BELAJAR' : 'LEARNING OUTCOMES'}</span>
                        <h2 className={styles.sectionTitle}>{isID ? 'Kuasai Skill Masa Depan' : 'Master Future-Proof Skills'}</h2>
                        <p className={styles.sectionSubtitle}>{isID ? 'Setelah kursus ini, Anda akan memiliki kemampuan profesional untuk:' : 'After this course, you will have the professional capability to:'}</p>
                    </div>

                    <div className={styles.outcomesGrid}>
                        {outcomes.map((o, i) => (
                            <div key={i} className={`${styles.outcomeCard} ${i === 1 ? styles.outcomeCardFeatured : ''}`}>
                                <span className={`${styles.outcomeBadge} ${i === 1 ? styles.outcomeBadgeFeatured : ''}`}>
                                    {isID ? `Kompetensi ${i + 1}` : `Competency ${i + 1}`}
                                </span>
                                <div className={styles.outcomeTitle}>{o}</div>
                                <p className={styles.outcomeDesc}>{isID ? 'Penerapan langsung dalam skenario dunia nyata.' : 'Direct application in real-world professional scenarios.'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CURRICULUM SECTION (Topics style) ── */}
            {syllabusDetails && (
                <section className={styles.curriculumSection}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionLabel}>{isID ? 'KURIKULUM' : 'CURRICULUM'}</span>
                            <h2 className={styles.sectionTitle}>{isID ? 'Apa yang Akan Kita Bahas' : 'What We Will Cover'}</h2>
                        </div>

                        <div className={styles.curriculumGrid}>
                            {syllabusDetails.sessions.map((session, i) => (
                                <div key={i} className={styles.curriculumCard}>
                                    <div className={styles.curriculumIcon}>
                                        <BookOpen size={20} />
                                    </div>
                                    <span className={styles.curriculumModNum}>Module {i + 1}</span>
                                    <div className={styles.curriculumTitle}>{session.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── BENEFITS SECTION (Why Teach style) ── */}
            <section className={styles.benefitsSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>{isID ? 'MENGAPA GDI' : 'WHY GDI'}</span>
                        <h2 className={styles.sectionTitle}>{isID ? 'Pengalaman Belajar Premium' : 'Premium Learning Experience'}</h2>
                    </div>

                    <div className={styles.benefitsGrid}>
                        {[
                            { icon: <Clock size={24} />, title: isID ? 'Jadwal Fleksibel' : 'Flexible Schedule', desc: isID ? 'Pilih sesi yang sesuai dengan waktu Anda.' : 'Choose sessions that fit your busy schedule.' },
                            { icon: <Users size={24} />, title: isID ? 'Grup Kecil' : 'Small Groups', desc: isID ? 'Maksimal 12 siswa для полноценного внимания.' : 'Max 12 students for real individual attention.' },
                            { icon: <TrendingUp size={24} />, title: isID ? 'Kurikulum Industri' : 'Industry Curriculum', desc: isID ? 'Materi yang dirancang oleh pakar praktisi.' : 'Curriculum designed by active industry practitioners.' },
                            { icon: <Globe size={24} />, title: isID ? 'Akses Seumur Hidup' : 'Lifetime Access', desc: isID ? 'Bergabunglah dengan komunitas alumni eksklusif kami.' : 'Join our exclusive global alumni community.' },
                        ].map((b, i) => (
                            <div key={i} className={styles.benefitCard}>
                                <div className={styles.benefitIconWrap}>{b.icon}</div>
                                <div className={styles.benefitTitle}>{b.title}</div>
                                <p className={styles.benefitDesc}>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── INSTRUCTOR SECTION ── */}
            <section className={styles.instructorSection}>
                <div className="container">
                    <div className={styles.instructorCard}>
                        <div className={styles.instructorAvatar}>
                            <img src={instructor.photoUrl || '/assets/avatar-placeholder.png'} alt={instructor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className={styles.instructorContent}>
                            <span className={styles.instructorRole}>{instructor.role} @ {instructor.company}</span>
                            <h2 className={styles.instructorName}>{instructor.name}</h2>
                            <p className={instructor.experience}>{instructor.experience}</p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                                {instructor.linkedin && (
                                    <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>LinkedIn →</a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <StickyBookingBar course={course} />
        </div>
    );
}
