'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useTheme } from '../../components/ThemeProvider';

export default function ForTutorsPage() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) {
        return <div className={styles.page} style={{ background: 'var(--bg)', minHeight: '100vh' }} />;
    }

    const ctaStyle = {
        background: 'var(--accent, #D42B2B)',
        color: '#FFFFFF',
        fontWeight: 700
    };

    return (
        <div className={styles.page} data-theme={theme}>
            <div className={styles.container}>
                {/* HERO */}
                <section className={styles.hero}>
                    <div className={styles.heroIcons}>
                        <span className={styles.heroIcon}>🎓</span>
                        <span className={styles.heroIcon}>💡</span>
                        <span className={styles.heroIcon}>🚀</span>
                    </div>
                    <h1 className={styles.heroTitle}>Teach with us — The business-in-a-box for tutors</h1>
                    <p className={styles.heroSubtitle}>
                        Join the GDI FutureWorks platform and focus on what you do best — TEACH. 
                        We handle the technology, marketing, and payments so you can grow your reputation and income.
                    </p>
                    {mounted && (
                        <Link href="/for-tutors/apply" className={styles.ctaBtn} style={ctaStyle}>
                            Apply to become a tutor →
                        </Link>
                    )}
                </section>

                {/* STRATEGIC OVERVIEW */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The Future of Teaching</h2>
                        <p className={styles.sectionSubtitle}>We bring together quality expert tutors and motivated students in one trusted ecosystem.</p>
                    </div>

                    <div className={styles.comparisonGrid}>
                        <div className={styles.problemCard}>
                            <h3 className={styles.cardTitle}>Problem: Tutors struggle to find students</h3>
                            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                Skilled professionals often don&apos;t have the time or resources to build websites, manage marketing funnels, run ads, or handle enrollment systems. Finding students consistently is hard.
                            </p>
                        </div>
                        <div className={styles.solutionCard}>
                            <h3 className={styles.cardTitle}>Our Solution: Done-for-you Infrastructure</h3>
                            <p className={styles.solutionDesc}>
                                GDI FutureWorks provides the "business-in-a-box". We handle the marketing, enrollment, payment processing, and scheduling. You focus 100% on delivering impactful live learning.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Your Business-in-a-Box</h2>
                        <p className={styles.sectionSubtitle}>Everything you need to operate at scale from day one.</p>
                    </div>

                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>👤</span>
                            <h4 className={styles.featureTitle}>Dedicated Profile Page</h4>
                            <p className={styles.featureDesc}>A professional storefront where students can discover your industry expertise and enroll in your classes.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>📣</span>
                            <h4 className={styles.featureTitle}>Student Marketing</h4>
                            <p className={styles.featureDesc}>We promote your programs through our verified channels and ads to bring qualified learners directly to you.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>💳</span>
                            <h4 className={styles.featureTitle}>Payment & Enrollment</h4>
                            <p className={styles.featureDesc}>We manage registration and payments securely, handling the administrative burden so you don&apos;t have to.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🛤️</span>
                            <h4 className={styles.featureTitle}>Course Infrastructure</h4>
                            <p className={styles.featureDesc}>Leverage our structured micro-tracks and learning pathways designed for clear, future-ready outcomes.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🗓️</span>
                            <h4 className={styles.featureTitle}>Class Management</h4>
                            <p className={styles.featureDesc}>Organized scheduling and course management tools for a seamless teaching experience across time zones.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🌎</span>
                            <h4 className={styles.featureTitle}>Regional Reach</h4>
                            <p className={styles.featureDesc}>Gain immediate visibility among motivated learners across the high-growth markets of Malaysia and Indonesia.</p>
                        </div>
                    </div>
                </section>

                {/* REQUIREMENTS */}
                <section className={styles.requirementsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Who we are looking for</h2>
                        <p className={styles.requirementsSubtitle}>
                            We are building a curated network of professional tutors who are passionate about empowering the next generation of professionals.
                        </p>
                    </div>

                    <div className={styles.requirementsGrid}>
                        <div>
                            <h4 className={styles.listTitle}>Ideal Tutors:</h4>
                            <ul className={styles.checkList}>
                                {['Industry expertise in AI, Data, or Design', 'Clear communication in English', 'Passion for mentoring learners', 'Commitment to student success'].map((item, i) => (
                                    <li key={i} className={styles.checkItem}>
                                        <span className={styles.checkIcon}>✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className={styles.listTitle}>Application Requirements:</h4>
                            <ul className={styles.requirementsList}>
                                <li><strong>1. Professional Profile:</strong> Qualifications & experience</li>
                                <li><strong>2. Tutor Portfolio:</strong> Credentials & previous work</li>
                                <li><strong>3. Proposed Curriculum:</strong> Program delivery outline</li>
                                <li><strong>4. Sample Lesson Plan:</strong> Mock structure for 2 lessons</li>
                                <li><strong>5. Intro Video:</strong> 3-4 minute teaching style showcase</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* PROCESS */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Tutor Selection Process</h2>
                    </div>
                    <div className={styles.processList}>
                        {[
                            'Application Submission',
                            'Portfolio Review',
                            'Teaching Video Assessment',
                            'Lesson Plan Evaluation',
                            'Tutor Approval',
                        ].map((step, idx) => (
                            <div key={idx} className={styles.processStep}>
                                <div className={styles.stepNumber}>{idx + 1}</div>
                                <div className={styles.stepText}>{step}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
            <section className={[styles.section, styles.hero].join(' ')} style={{ borderTop: '1px solid var(--border-light)' }}>
                    <h2 className={styles.heroTitle} style={{ fontSize: '2.5rem' }}>Ready to teach with us?</h2>
                    <p className={styles.heroSubtitle}>Join a platform designed to help expert tutors focus on what matters most — teaching and impacting students.</p>
                    {mounted && (
                        <Link href="/for-tutors/apply" className={styles.ctaBtn}>
                            Apply to become a tutor →
                        </Link>
                    )}
                </section>
            </div>
        </div>
    );
}
