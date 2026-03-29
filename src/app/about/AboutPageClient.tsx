'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { Briefcase, Layout, Zap, Users, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function AboutPageClient() {
    const { t } = useLanguage();

    const stats: [string, string][] = [
        ['500+', t('about.stats.0')],
        ['⭐ 4.9/5', t('about.stats.1')],
        ['4', t('about.stats.2')],
        ['2', t('about.stats.3')],
    ];

    const pillars = [
        { icon: <Briefcase size={24} />, title: t('about.pillar1.title'), desc: t('about.pillar1.desc') },
        { icon: <Layout size={24} />, title: t('about.pillar2.title'), desc: t('about.pillar2.desc') },
        { icon: <Zap size={24} />, title: t('about.pillar3.title'), desc: t('about.pillar3.desc') },
        { icon: <Users size={24} />, title: t('about.pillar4.title'), desc: t('about.pillar4.desc') },
    ];

    return (
        <div className={styles.page}>

            {/* HERO */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label">{t('about.badge')}</p>
                            <h1 className="text-h1">
                                {t('about.hero.h1.1')}<br />{t('about.hero.h1.2')}
                            </h1>
                            <p className="text-body-lg" style={{ maxWidth: 560 }}>
                                {t('about.hero.p')}
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
                        {stats.map(([num, lbl]) => (
                            <div key={lbl} className={styles.stat}>
                                <div className={styles.statNum}>{num}</div>
                                <div className={styles.statLbl}>{lbl}</div>
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
                            <p className="section-label">{t('about.mission.badge')}</p>
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
                        <p className="section-label">{t('about.pillars.badge')}</p>
                        <h2 className="text-h2">{t('about.pillars.h2')}</h2>
                    </div>
                    <div className="grid-2">
                        {pillars.map((p, i) => (
                            <div key={i} className={`card ${styles.pillarCard}`}>
                                <div className={styles.pillarIcon}>{p.icon}</div>
                                <h3 className={styles.pillarTitle}>{p.title}</h3>
                                <p className={styles.pillarDesc}>{p.desc}</p>
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
                            <Link href="/#courses" className="btn btn-primary btn-lg">
                                {t('about.cta.browse')} <ChevronRight size={20} />
                            </Link>
                            <Link href="/contact" className={styles.ctaBtnGhost}>
                                {t('about.cta.consult')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
