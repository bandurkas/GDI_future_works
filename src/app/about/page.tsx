'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { Briefcase, Layout, Zap, Users, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useState, useEffect } from 'react';

export default function AboutPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const pillars = [
        { icon: <Briefcase size={24} />, titleKey: 'about.pillar1.title', descKey: 'about.pillar1.desc' },
        { icon: <Layout size={24} />, titleKey: 'about.pillar2.title', descKey: 'about.pillar2.desc' },
        { icon: <Zap size={24} />, titleKey: 'about.pillar3.title', descKey: 'about.pillar3.desc' },
        { icon: <Users size={24} />, titleKey: 'about.pillar4.title', descKey: 'about.pillar4.desc' },
    ];

    const stats = [
        ['500+', 'about.stats.trained'],
        ['⭐ 4.9/5', 'about.stats.satisfaction'],
        ['4', 'about.stats.courses'],
        ['2', 'about.stats.countries'],
    ];

    if (!mounted) return null;

    return (
        <div className={styles.page}>

            {/* HERO */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label">{t('about.label')}</p>
                            <h1 className="text-h1">{t('about.h1')}</h1>
                            <p className="text-body-lg" style={{ maxWidth: 560 }}>
                                {t('about.intro')}
                            </p>
                        </div>
                        <div className={styles.heroVisual}>
                            <Image src="/assets/info_about.png" alt="About GDI FutureWorks" width={500} height={500} />
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className={styles.statsBar}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        {stats.map(([num, labelKey]) => (
                            <div key={labelKey} className={styles.stat}>
                                <div className={styles.statNum}>{num}</div>
                                <div className={styles.statLbl}>{t(labelKey)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MISSION */}
            <section className="section">
                <div className="container">
                    <div className={styles.missionGrid}>
                        <div>
                            <p className="section-label">{t('about.mission.label')}</p>
                            <h2 className="text-h2">{t('about.mission.h2')}</h2>
                        </div>
                        <div>
                            <p className={styles.missionText}>{t('about.mission.p1')}</p>
                            <p className={styles.missionText} style={{ marginTop: 'var(--space-5)' }}>
                                {t('about.mission.p2')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PILLARS */}
            <section className={`section ${styles.pillarsSection}`}>
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="section-label">{t('about.pillars.label')}</p>
                        <h2 className="text-h2">{t('about.pillars.h2')}</h2>
                    </div>
                    <div className="grid-2">
                        {pillars.map((p, i) => (
                            <div key={i} className={`card ${styles.pillarCard}`}>
                                <div className={styles.pillarIcon}>{p.icon}</div>
                                <h3 className={styles.pillarTitle}>{t(p.titleKey)}</h3>
                                <p className={styles.pillarDesc}>{t(p.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaBox}>
                        <h2 className={styles.ctaTitle}>{t('about.cta.h2')}</h2>
                        <div className={styles.ctaBtns}>
                            <Link href="/#courses" className="btn btn-primary btn-lg">{t('about.cta.browse')} <ChevronRight size={20} /></Link>
                            <Link href="/contact" className="btn btn-secondary btn-lg">{t('about.cta.consult')}</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
