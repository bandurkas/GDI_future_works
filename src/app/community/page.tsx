'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { 
    MessageSquare, 
    TrendingUp, 
    Handshake, 
    Target, 
    Bell, 
    Rocket,
    ChevronRight
} from 'lucide-react';
import { useLanguage, Translate } from '@/components/LanguageContext';

export default function CommunityPage() {
    const { t } = useLanguage();

    const perks = [
        {
            icon: <MessageSquare size={24} />,
            title: t('comm.perk1.title'),
            desc: t('comm.perk1.desc'),
        },
        {
            icon: <TrendingUp size={24} />,
            title: t('comm.perk2.title'),
            desc: t('comm.perk2.desc'),
        },
        {
            icon: <Handshake size={24} />,
            title: t('comm.perk3.title'),
            desc: t('comm.perk3.desc'),
        },
        {
            icon: <Target size={24} />,
            title: t('comm.perk4.title'),
            desc: t('comm.perk4.desc'),
        },
        {
            icon: <Bell size={24} />,
            title: t('comm.perk5.title'),
            desc: t('comm.perk5.desc'),
        },
        {
            icon: <Rocket size={24} />,
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

            {/* HERO */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label"><Translate tKey="comm.hero.label" defaultText="Community" /></p>
                            <h1 className="text-h1">
                                <Translate tKey="comm.hero.title" defaultText="Your career network starts here." />
                            </h1>
                            <p className="text-body-lg" style={{ maxWidth: 520 }}>
                                <Translate 
                                    tKey="comm.hero.sub" 
                                    defaultText="Every GDI FutureWorks student joins a career-focused community where learning continues long after the last session ends — and where real opportunities are shared every single day." 
                                />
                            </p>
                            <Link href="/#courses" className="btn btn-primary">
                                <Translate tKey="comm.hero.cta" defaultText="Join via a Course →" />
                            </Link>
                        </div>
                        <div className={styles.heroVisual}>
                            <Image src="/assets/info_community.png" alt="Community Network" width={500} height={500} />
                        </div>
                    </div>
                </div>
            </section>

            {/* PERKS GRID */}
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="section-label"><Translate tKey="comm.perks.label" defaultText="What You Get" /></p>
                        <h2 className="text-h2">
                            <Translate tKey="comm.perks.title" defaultText="Your community membership includes everything you need to grow." />
                        </h2>
                    </div>
                    <div className="grid-2">
                        {perks.map((p, i) => (
                            <div key={i} className={`card ${styles.perkCard}`}>
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
                    <div className={styles.proofInner}>
                        <div className={styles.proofNum}><Translate tKey="comm.proof.num" defaultText="500+" /></div>
                        <p className={styles.proofLbl}><Translate tKey="comm.proof.label" defaultText="professionals in our active community" /></p>
                        <p className={styles.proofSub}><Translate tKey="comm.proof.sub" defaultText="from Indonesia, Malaysia, Singapore, and across Southeast Asia" /></p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="section-label"><Translate tKey="comm.test.label" defaultText="From Our Community" /></p>
                        <h2 className="text-h2"><Translate tKey="comm.test.title" defaultText="Hear it from the people inside." /></h2>
                    </div>
                    <div className={styles.testimonialsGrid}>
                        {testimonials.map((t, i) => (
                            <div key={i} className={styles.testimonialCard}>
                                <div className={styles.tStars}>★★★★★</div>
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

            {/* CTA */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.cta}>
                        <h2 className={styles.ctaTitle}><Translate tKey="comm.cta.title" defaultText="Community access is free for all enrolled students." /></h2>
                        <p className={styles.ctaDesc}><Translate tKey="comm.cta.desc" defaultText="Enroll in any course to get lifetime access to the full network — no extra fee, no expiry date." /></p>
                        <Link href="/#courses" className="btn btn-primary btn-lg">
                            <Translate tKey="comm.cta.btn" defaultText="Choose a Course" /> <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
