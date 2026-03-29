'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { 
    Users, 
    Briefcase, 
    Globe, 
    UserCheck, 
    Gift, 
    TrendingUp,
    ChevronRight,
    Star
} from 'lucide-react';
import { useLanguage, Translate } from '@/components/LanguageContext';

export default function CommunityPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const perks = [
        {
            icon: <Users size={20} strokeWidth={1.5} />,
            title: t('comm.perk1.title'),
            desc: t('comm.perk1.desc'),
        },
        {
            icon: <Briefcase size={20} strokeWidth={1.5} />,
            title: t('comm.perk2.title'),
            desc: t('comm.perk2.desc'),
        },
        {
            icon: <Globe size={20} strokeWidth={1.5} />,
            title: t('comm.perk3.title'),
            desc: t('comm.perk3.desc'),
        },
        {
            icon: <UserCheck size={20} strokeWidth={1.5} />,
            title: t('comm.perk4.title'),
            desc: t('comm.perk4.desc'),
        },
        {
            icon: <Gift size={20} strokeWidth={1.5} />,
            title: t('comm.perk5.title'),
            desc: t('comm.perk5.desc'),
        },
        {
            icon: <TrendingUp size={20} strokeWidth={1.5} />,
            title: t('comm.perk6.title'),
            desc: t('comm.perk6.desc'),
        },
    ];

    const testimonials = [
        {
            quote: t('comm.test1.quote'),
            name: "Rina S.",
            role: t('comm.test1.role'),
            flag: "🇮🇩",
            gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
            initials: "RS"
        },
        {
            quote: t('comm.test2.quote'),
            name: "Ahmad K.",
            role: t('comm.test2.role'),
            flag: "🇲🇾",
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            initials: "AK"
        },
        {
            quote: t('comm.test3.quote'),
            name: "Dewi P.",
            role: t('comm.test3.role'),
            flag: "🇮🇩",
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            initials: "DP"
        },
    ];

    return (
        <div className={styles.page}>

            {/* HERO SECTION */}
            <header className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <span className={styles.sectionLabel}>
                            <Users size={12} strokeWidth={1.5} style={{ marginRight: 4 }} />
                            <Translate tKey="comm.hero.label" defaultText="Elite Network" />
                        </span>

                        <h1 className={styles.heroTitle}>
                            {t('comm.hero.title1')} <br />
                            <span className={styles.heroAccent}>{t('comm.hero.title2')}</span>
                        </h1>

                        <p className={styles.heroSubtitle}>
                            <Translate 
                                tKey="comm.hero.sub" 
                                defaultText="Join a career-focused community where learning continues long after the session ends — and where real opportunities are shared every single day." 
                            />
                        </p>

                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                            <Link href="/#courses" className="btn btn-primary btn-lg">
                                <Translate tKey="comm.hero.cta" defaultText="Join via a Course" /> <ChevronRight size={18} strokeWidth={1.5} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.heroVisual}>
                        <Image 
                            src="/assets/info_community.png" 
                            alt="Community Network" 
                            width={600} 
                            height={400} 
                            priority
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                </div>
            </header>

            {/* BENEFITS GRID */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHead}>
                        <span className={styles.sectionLabel}>
                            <Translate tKey="comm.perks.label" defaultText="Exclusive Benefits" />
                        </span>
                        <h2 className={styles.sectionTitle}>
                            <Translate tKey="comm.perks.title" defaultText="Maximum Growth Potential" />
                        </h2>
                    </div>

                    <div className={styles.benefitsGrid}>
                        {perks.map((p, i) => (
                            <div key={i} className={styles.perkCard}>
                                <div className={styles.perkIcon}>{p.icon}</div>
                                <h3 className={styles.perkTitle}>{p.title}</h3>
                                <p className={styles.perkDesc}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF NUMBER */}
            <section className={styles.proofSection}>
                <div className="container">
                    <div className={styles.proofNum}>
                        <Translate tKey="comm.proof.num" defaultText="500+" />
                    </div>
                    <p className={styles.proofLbl}>
                        <Translate tKey="comm.proof.label" defaultText="Active Professionals" />
                    </p>
                    <p className={styles.proofSub}>
                        <Translate tKey="comm.proof.sub" defaultText="Connecting talent from Indonesia, Malaysia, Singapore, and SE Asia." />
                    </p>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHead}>
                        <span className={styles.sectionLabel}>
                            <Translate tKey="comm.test.label" defaultText="Success Stories" />
                        </span>
                        <h2 className={styles.sectionTitle}>
                            <Translate tKey="comm.test.title" defaultText="Hear it from the people inside." />
                        </h2>
                    </div>

                    <div className={styles.testimonialsGrid}>
                        {testimonials.map((t, i) => (
                            <div key={i} className={styles.testimonialCard}>
                                <div className={styles.tStars}>
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" stroke="none" />)}
                                </div>
                                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                                <div className={styles.testimonialMeta}>
                                    <div className={styles.tAvatar} style={{ background: t.gradient }}>{t.initials}</div>
                                    <div>
                                        <p className={styles.testimonialName}>{t.flag} {t.name}</p>
                                        <p className={styles.testimonialRole}>{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.cta}>
                        <h2 className={styles.ctaTitle}>
                            <Translate tKey="comm.cta.title" defaultText="Free Access for Every Student." />
                        </h2>
                        <p className={styles.ctaDesc}>
                            <Translate tKey="comm.cta.desc" defaultText="Enroll in any course to get lifetime access to the full network — no extra fee, no expiry date." />
                        </p>
                        <Link href="/#courses" className="btn btn-primary btn-lg">
                            <Translate tKey="comm.cta.btn" defaultText="Choose a Course" /> <ChevronRight size={20} strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
