'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Star, Users, Globe, BookOpen, Clock, 
    TrendingUp, ArrowRight, Download 
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';
import LeadConversionWidget from '@/components/LeadConversionWidget';
import StickyBookingBar from '@/components/StickyBookingBar';

interface CourseLandingClientProps {
    course: any;
    slug: string;
}

export default function CourseLandingClient({ course, slug }: CourseLandingClientProps) {
    const { language } = useLanguage();
    const [isLeadWidgetOpen, setIsLeadWidgetOpen] = useState(false);
    const [initialScenario, setInitialScenario] = useState<'Syllabus' | 'Consultation'>('Syllabus');

    const isID = language === 'id';

    const openWidget = (scenario: 'Syllabus' | 'Consultation') => {
        setInitialScenario(scenario);
        setIsLeadWidgetOpen(true);
    };

    const titleParts = (isID && course.titleID ? course.titleID : course.title).split(' ');
    const firstPart = titleParts.slice(0, -2).join(' ');
    const accentPart = titleParts.slice(-2).join(' ');

    const subtitle = isID && course.subtitleID ? course.subtitleID : course.subtitle;
    const outcomes = isID && course.outcomesID ? course.outcomesID : course.outcomes;
    const instructor = isID && course.instructorID ? course.instructorID : course.instructor;
    const syllabusDetails = isID && course.syllabusDetailsID ? course.syllabusDetailsID : course.syllabusDetails;

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

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

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
                        {isID && course.titleID 
                            ? <>{course.titleID}: <br /><span className={styles.heroAccent}>Bootcamp Analytics Terbaik</span></> 
                            : <>{firstPart}<br /><span className={styles.heroAccent}>{accentPart}</span></>}
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
                        <div className={styles.ctaPrimary} style={{ cursor: 'pointer' }} onClick={() => scrollToSection('pricing')}>
                            {isID ? 'Mulai Belajar Sekarang' : 'Start Learning Now'} <ArrowRight size={16} />
                        </div>
                        <button className={styles.ctaSecondary} onClick={() => openWidget('Syllabus')}>
                            <Download size={16} />
                            {isID ? 'Unduh Silabus' : 'Download Syllabus'}
                        </button>
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

            {/* ── OUTCOMES SECTION ── */}
            <section className={styles.outcomesSection} id="outcomes">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>{isID ? 'HASIL BELAJAR' : 'LEARNING OUTCOMES'}</span>
                        <h2 className={styles.sectionTitle}>{isID ? 'Kuasai Skill Masa Depan' : 'Master Future-Proof Skills'}</h2>
                        <p className={styles.sectionSubtitle}>{isID ? 'Setelah kursus ini, Anda akan memiliki kemampuan profesional untuk:' : 'After this course, you will have the professional capability to:'}</p>
                    </div>

                    <div className={styles.outcomesGrid}>
                        {outcomes.map((o: string, i: number) => (
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

            {/* ── CURRICULUM SECTION ── */}
            {syllabusDetails && (
                <section className={styles.curriculumSection} id="curriculum">
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionLabel}>{isID ? 'KURIKULUM' : 'CURRICULUM'}</span>
                            <h2 className={styles.sectionTitle}>{isID ? 'Apa yang Akan Kita Bahas' : 'What We Will Cover'}</h2>
                        </div>

                        <div className={styles.curriculumGrid}>
                            {syllabusDetails.sessions.map((session: any, i: number) => (
                                <div key={i} className={styles.curriculumCard}>
                                    <div className={styles.curriculumIcon}>
                                        <BookOpen size={20} />
                                    </div>
                                    <span className={styles.curriculumModNum}>Module {i + 1}</span>
                                    <div className={styles.curriculumTitle}>{session.title}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.curriculumCta}>
                            <button className={styles.outlineBtnLarge} onClick={() => openWidget('Syllabus')}>
                                <Download size={20} /> {isID ? 'Unduh Kurikulum Lengkap (PDF)' : 'Download Full Curriculum (PDF)'}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* ── BENEFITS SECTION ── */}
            <section className={styles.benefitsSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>{isID ? 'MENGAPA GDI' : 'WHY GDI'}</span>
                        <h2 className={styles.sectionTitle}>{isID ? 'Keunggulan Bootcamp Data Analytics GDI' : 'Why Choose GDI Data Analytics Bootcamp?'}</h2>
                    </div>

                    <div className={styles.benefitsGrid}>
                        {[
                            { icon: <Clock size={24} />, title: isID ? 'Jadwal Fleksibel' : 'Flexible Schedule', desc: isID ? 'Pilih sesi yang sesuai dengan waktu Anda.' : 'Choose sessions that fit your busy schedule.' },
                            { icon: <Users size={24} />, title: isID ? 'Grup Kecil' : 'Small Groups', desc: isID ? 'Maksimal 12 siswa untuk perhatian yang personal.' : 'Max 12 students for real individual attention.' },
                            { icon: <TrendingUp size={24} />, title: isID ? 'Kurikulum Industri' : 'Industry Curriculum', desc: isID ? 'Materi yang dirancang oleh pakar praktisi.' : 'Curriculum designed by active industry practitioners.' },
                            { icon: <Globe size={24} />, title: isID ? 'Akses Seumur Hidup' : 'Lifetime Access', desc: isID ? 'Bergabunglah dengan komunitas alumni eksklusif kami.' : 'Join our exclusive global alumni community.' },
                        ].map((b: any, i: number) => (
                            <div key={i} className={styles.benefitCard}>
                                <div className={styles.benefitIconWrap}>{b.icon}</div>
                                <h3 className={styles.benefitTitle}>{b.title}</h3>
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
                            <p className={styles.instructorExperience}>{instructor.experience}</p>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                {instructor.loom && (
                                    <a 
                                        href={instructor.loom} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={styles.videoButton}
                                    >
                                        <div className={styles.playIconContainer}>
                                            <div className={styles.playTriangle} />
                                        </div>
                                        {isID ? `Tonton Video Intro dari ${instructor.name.split(' ')[0]}` : `Watch Intro Video from ${instructor.name.split(' ')[0]}`}
                                    </a>
                                )}
                                {instructor.linkedin && (
                                    <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" className={styles.instructorLink}>
                                        LinkedIn Profile →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ SECTION ── */}
            {isID && course.faqsID && (
                <section className={styles.faqSection} id="faq">
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionLabel}>FAQ</span>
                            <h2 className={styles.sectionTitle}>{isID ? 'Pertanyaan yang Sering Diajukan' : 'Frequently Asked Questions'}</h2>
                        </div>
                        <div className={styles.faqGrid}>
                            {course.faqsID.map((faq: any, i: number) => (
                                <div key={i} className={styles.faqItem}>
                                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                                    <p className={styles.faqAnswer}>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── FINAL CTA ── */}
            <section className={styles.finalCta} id="pricing">
                <div className="container">
                    <div className={styles.finalCtaCard}>
                        <h2 className={styles.finalCtaTitle}>{isID ? 'Siap Memulai Karir Anda?' : 'Ready to Start Your Career?'}</h2>
                        <p className={styles.finalCtaDesc}>{isID ? 'Amankan tempat Anda di batch berikutnya. Slot terbatas.' : 'Secure your spot in the next batch. Limited slots available.'}</p>
                        <div className={styles.finalCtaButtons}>
                            <button className={styles.primaryBtnLarge} onClick={() => scrollToSection('pricing')}>
                                {isID ? 'Daftar Sekarang' : 'Enroll Now'}
                            </button>
                            <button className={styles.outlineBtnLarge} onClick={() => openWidget('Consultation')}>
                                {isID ? 'Konsultasi Gratis' : 'Free Consultation'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <LeadConversionWidget 
                isOpen={isLeadWidgetOpen}
                onClose={() => setIsLeadWidgetOpen(false)}
                courseId={course.id}
                courseTitle={isID ? course.titleID : course.title}
            />

            <StickyBookingBar course={course} />
        </div>
    );
}
