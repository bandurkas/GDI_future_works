'use client';
import { Metadata } from 'next';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Translate } from '@/components/LanguageContext';
import CourseCardLazy from '@/components/CourseCardLazy';
import CourseCarousel from '@/components/CourseCarousel';
import PathCard from '@/components/PathCard';
import PartnershipSection from '@/components/PartnershipSection';
import HomeFAQ from '@/components/HomeFAQ';
import { courses } from '@/data/courses';
import { Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import styles from './page.module.css';

// CourseCard is lazily loaded via CourseCardLazy (client wrapper with dynamic import)
// This keeps the heavy CourseCard JS bundle out of the initial render path
const CourseCard = CourseCardLazy;

// ── STATIC DATA ──────────────────────────────────────────────────────────────

const proofCompanies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Gojek', 'Tokopedia', 'Grab'];

const instructors = [
    {
        name: 'Arman Rahman',
        role: 'Senior Data Analyst',
        company: 'Google',
        initials: 'AR',
        gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
        tools: ['Python', 'BigQuery', 'Looker'],
        course: 'Basic Data Analyst',
    },
    {
        name: 'Dian Pratiwi',
        role: 'Senior Software Engineer',
        company: 'Tokopedia',
        initials: 'DP',
        gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
        tools: ['Python', 'Django', 'AWS'],
        course: 'Python for Professionals',
    },
    {
        name: 'Siti Nurhaliza',
        role: 'Creative Director & AI Lead',
        company: 'Grab',
        initials: 'SN',
        gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
        tools: ['Midjourney', 'Figma', 'DALL-E'],
        course: 'Graphic Design with AI',
    },
    {
        name: 'Rizky Firmansyah',
        role: 'AI Engineering Lead',
        company: 'Microsoft',
        initials: 'RF',
        gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        tools: ['OpenAI', 'LangChain', 'Azure'],
        course: 'LLM & AI Engineering',
    },
];

const testimonials = [
    {
        name: 'Arif Setiyawan',
        before: 'Office admin with no tech background',
        after: 'Junior Data Analyst at a Jakarta startup',
        quote: 'After the course I built my first dashboard and landed a data analyst role within 3 weeks.',
        outcome: '🎯 Hired in 3 weeks',
        course: 'Basic Data Analyst',
        initials: 'AS',
        gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
        flag: '🇮🇩',
    },
    {
        name: 'Mei Rahayu',
        before: 'Business analyst doing manual Excel reports',
        after: 'Python Automation Specialist — same company, 40% pay rise',
        quote: 'Python finally clicked. I automated half my monthly reporting. My boss noticed immediately.',
        outcome: '💰 40% salary increase',
        course: 'Python for Professionals',
        initials: 'MR',
        gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
        flag: '🇲🇾',
    },
    {
        name: 'Budi Santoso',
        before: 'Freelance designer, losing clients to cheaper competitors',
        after: 'AI-augmented designer charging 3× his previous rate',
        quote: 'By day 2 I was creating assets I used in actual client projects. Nothing comes close.',
        outcome: '📈 Revenue tripled in 2 months',
        course: 'Graphic Design with AI',
        initials: 'BS',
        gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
        flag: '🇮🇩',
    },
];

const getNextWeekend = (staggerWeeks = 0) => {
    let now = new Date();
    // Requirements: "closest date 24-25 april", "move automatically accordantly the real time"
    const minStart = new Date(2026, 3, 25); // Apr 25, 2026 (Saturday)
    if (now < minStart) {
        now = minStart;
    }

    // Move next to Saturday
    const day = now.getDay();
    const diffToSat = (6 - day + 7) % 7;
    now.setDate(now.getDate() + diffToSat);

    // Add staggered weeks
    now.setDate(now.getDate() + (staggerWeeks * 7));

    const sat = new Date(now);
    const sun = new Date(now);
    sun.setDate(sun.getDate() + 1);

    const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    // JS getMonth() runs 0-11. We matched monthNames such that monthNames[3] = Apr, wait.
    // Standard array is 0=Jan.
    const stdMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (sat.getMonth() === sun.getMonth()) {
        return `${stdMonthNames[sat.getMonth()]} ${sat.getDate()}–${sun.getDate()}`;
    } else {
        return `${stdMonthNames[sat.getMonth()]} ${sat.getDate()} – ${stdMonthNames[sun.getMonth()]} ${sun.getDate()}`;
    }
};

const cohorts = [
    { course: 'Basic Data Analyst', date: getNextWeekend(0), seatsLeft: 3, slug: 'data-analytics', color: '#667eea' },
    { course: 'Python for Professionals', date: getNextWeekend(0), seatsLeft: 5, slug: 'python-programming', color: '#11998e' },
    { course: 'Graphic Design with AI', date: getNextWeekend(1), seatsLeft: 6, slug: 'graphic-design-ai', color: '#f093fb' },
    { course: 'LLM & AI Engineering', date: getNextWeekend(1), seatsLeft: 4, slug: 'llm-ai-engineering', color: '#4facfe' },
];

const trustBadges = [
    { icon: '🎥', label: 'Live Expert Sessions' },
    { icon: '🛠️', label: 'Real Projects Included' },
    { icon: '🎓', label: 'Certificate of Completion' },
    { icon: '🚀', label: 'Job-Ready in 4 Weeks' },
    { icon: '🌏', label: 'Southeast Asia & Remote' },
];

// ─────────────────────────────────────────────────────────────────────────────


function CourseAutoOpener() {
    const searchParams = useSearchParams();
    useEffect(() => {
        const slug = searchParams.get('course');
        if (!slug) return;
        const tryOpen = (attempts = 0) => {
            const card = document.getElementById(`course-card-${slug}`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => card.click(), 400);
            } else if (attempts < 15) {
                setTimeout(() => tryOpen(attempts + 1), 300);
            }
        };
        setTimeout(() => tryOpen(), 300);
    }, [searchParams]);
    return null;
}

export default function HomePage() {
    const { trackLead } = useMetaPixel();

    return (
        <div className={styles.page}>
            <Suspense fallback={null}><CourseAutoOpener /></Suspense>

            {/* ── HERO ── */}
            <section className={styles.heroSection} data-theme="light">
                <div className={styles.heroLayout}>
                    {/* Left Illustration */}
                    <div className={`${styles.heroIllustration} ${styles.heroIllustrationLeft} ${styles.hideMobile}`}>
                        <Image 
                            src="/assets/notion_hero_left.webp" 
                            alt="Collaborating Talent" 
                            className={styles.heroImage}
                            width={500}
                            height={500}
                            priority
                            unoptimized
                            sizes="(max-width: 1200px) 280px, 380px"
                        />
                    </div>

                    <div className={styles.heroContainer}>
                        <div className={styles.trustBadge}>
                            <span className={styles.heroIcon}><Sparkles size={14} /></span>
                            <span><Translate tKey="hero.badge" /></span>
                        </div>

                        <h1 className={styles.heroTitle}>
                            <Translate tKey="hero.title1" /><br />
                            <span className={styles.heroTitleAccent}><Translate tKey="hero.title2" /></span>
                        </h1>

                        <p className={styles.heroSubhead}>
                            <Translate tKey="hero.subhead" />
                        </p>

                        <div className={styles.ctaGroup}>
                            <a href="#courses" className={styles.btnPrimaryRed}>
                                <Translate tKey="hero.cta1" />
                            </a>
                            <a href="/for-tutors" className={styles.btnOutline}>
                                <Translate tKey="hero.teachWithUs" />
                            </a>
                        </div>

                        {/* Mobile-only centered illustration */}
                        <div className={styles.heroIllustrationMobile}>
                            <Image
                                src="/assets/notion_hero_left.webp"
                                alt="Collaborating Talent"
                                className={styles.heroImage}
                                width={360}
                                height={360}
                                priority
                                unoptimized
                                sizes="(max-width: 768px) 280px, 360px"
                            />
                        </div>

                        <div className={styles.trustedByRow}>
                            <p className={styles.trustedByLabel}><Translate tKey="hero.trustedBy" /></p>
                            <div className={styles.marqueeOuter}>
                                <div className={styles.marqueeTrack}>
                                    {[...proofCompanies, ...proofCompanies].map((c, i) => (
                                        <span key={i} className={styles.miniLogoText}>{c}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className={`${styles.heroIllustration} ${styles.heroIllustrationRight} ${styles.hideMobile}`}>
                        <Image 
                            src="/assets/notion_hero_right.webp" 
                            alt="Innovating Talent" 
                            className={styles.heroImage}
                            width={500}
                            height={500}
                            priority
                            unoptimized
                            sizes="(max-width: 1200px) 280px, 380px"
                        />
                    </div>
                </div>
            </section>

            {/* ── PROOF BAR ── */}
            {/* 
            <div className={styles.proofBar}>
                <div className={styles.proofBarInner}>
                    <span className={styles.proofBarLabel}>Our instructors are from</span>
                    {proofCompanies.map((c) => (
                        <span key={c} className={styles.proofLogo}>{c}</span>
                    ))}
                </div>
            </div>
            */}

            {/* ── COURSES ── */}
            <section className={styles.coursesSection} id="courses">
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <p className={styles.sectionLabel}><Translate tKey="courses.sub" /></p>
                        <h2 className={styles.sectionH2}><Translate tKey="courses.h2" /></h2>
                    </div>
                    <CourseCarousel>
                        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
                    </CourseCarousel>
                    <div className={styles.coursesFooter}>
                        <p><Translate tKey="courses.notSure" /></p>
                        <Link href="/contact" className={styles.advisorLink}><Translate tKey="courses.advisor" /> <ArrowRight size={16} /></Link>
                    </div>
                </div>
            </section>

            {/* ── SMART PARTNERSHIP ── */}
            <PartnershipSection />


            {/* ── COHORT URGENCY ── */}
            <section className={styles.cohortSection} id="cohort">
                <div className="container">
                    <div className={styles.sectionHeader} style={{ color: 'white' }}>
                        <p className={styles.cohortLabel}><Translate tKey="cohort.sub" /></p>
                        <h2 className={styles.cohortH2}><Translate tKey="cohort.h2" /></h2>
                    </div>
                    <div className={styles.cohortGrid}>
                        {cohorts.map((c) => (
                            <div key={c.slug} className={styles.cohortCard}>
                                <div className={styles.cohortTop}>
                                    <span className={styles.cohortCourseName}>{c.course}</span>
                                    <span className={`${styles.cohortUrgency} ${c.seatsLeft <= 3 ? styles.cohortUrgencyHigh : styles.cohortUrgencyLow}`}>
                                        {c.seatsLeft} <Translate tKey="cohort.seats" />
                                    </span>
                                </div>
                                <p className={styles.cohortDate} suppressHydrationWarning><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {c.date}</p>
                                <p className={styles.cohortFormat}><Translate tKey="cohort.format" /></p>
                                <Link href={`/courses/${c.slug}/schedule`} className={styles.cohortCta}>
                                    <Translate tKey="cohort.cta" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY US ── */}
            <section className={styles.diffSection}>
                <div className="container">
                    <h2><Translate tKey="diff.h2" /></h2>
                    <div className={styles.benefitsGrid}>
                        {[
                            {
                                tk: 'benefit1.title', 
                                dk: 'benefit1.desc', 
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                            },
                            {
                                tk: 'benefit2.title', 
                                dk: 'benefit2.desc', 
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            },
                            {
                                tk: 'benefit3.title', 
                                dk: 'benefit3.desc', 
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            },
                            {
                                tk: 'benefit4.title', 
                                dk: 'benefit4.desc', 
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                            },
                            {
                                tk: 'benefit5.title', 
                                dk: 'benefit5.desc', 
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
                            },
                            {
                                tk: 'benefit6.title', 
                                dk: 'benefit6.desc', 
                                icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
                            },
                        ].map(({ tk, dk, icon }) => (
                            <div key={tk} className={styles.benefitBox}>
                                <div className={styles.benefitHeader}>
                                    <div className={styles.benefitIconWrap}>{icon}</div>
                                    <h3 className={styles.benefitTitle}><Translate tKey={tk} /></h3>
                                </div>
                                <p className={styles.benefitText}><Translate tKey={dk} /></p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3-STEP ENROLLMENT ── */}
            <section className={styles.enrollStepsSection} id="enroll">
                <div className="container">
                    <h2><Translate tKey="enroll.h2" /></h2>
                    <p className={styles.enrollSubtitle}><Translate tKey="enroll.sub" /></p>
                    <div className={styles.stepsWrapper}>
                        {[
                            { num: '1', h: 'step1.h3', p: 'step1.p' },
                            { num: '2', h: 'step2.h3', p: 'step2.p' },
                            { num: '3', h: 'step3.h3', p: 'step3.p' },
                        ].map(({ num, h, p }) => (
                            <div key={num} className={styles.step}>
                                <div className={styles.stepNumber}>{num}</div>
                                <h3><Translate tKey={h} /></h3>
                                <p><Translate tKey={p} /></p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className={styles.finalCta}>
                <div className="container">
                    <h2>
                        <Translate tKey="cta.h2" /><br />
                        <Translate tKey="cta.h2b" />
                    </h2>
                    <p><Translate tKey="cta.p" /></p>
                    <div className={styles.ctaAction}>
                        <a href="#courses" className={styles.btnPrimaryWhite}>
                            <Translate tKey="cta.btn" />
                        </a>
                        <a 
                            href="https://wa.me/628211704707" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.ctaWaBtn}
                            onClick={() => trackLead('wa_consult_advisor')}
                        >
                            <Translate tKey="cta.consultAdvisor" />
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
