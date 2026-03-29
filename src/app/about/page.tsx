import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { Translate } from '@/components/LanguageContext';
import { 
    Briefcase, 
    Layout, 
    Zap, 
    Users,
    ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us — GDI FutureWorks',
    description: 'GDI FutureWorks was built by Feonna Watford and Sergei Bandurka — two industry veterans with over 40 years of combined experience — to deliver real-world tech skills that accelerate careers across Southeast Asia.'
};

const pillars = [
    { icon: <Briefcase size={24} />, titleKey: 'about.p1.title', descKey: 'about.p1.desc' },
    { icon: <Layout size={24} />, titleKey: 'about.p2.title', descKey: 'about.p2.desc' },
    { icon: <Zap size={24} />, titleKey: 'about.p3.title', descKey: 'about.p3.desc' },
    { icon: <Users size={24} />, titleKey: 'about.p4.title', descKey: 'about.p4.desc' },
];

const stats = [
    ['500+', 'about.stat1.lbl'],
    ['\u2b50 4.9/5', 'about.stat2.lbl'],
    ['4', 'about.stat3.lbl'],
    ['2', 'about.stat4.lbl'],
];

export default function AboutPage() {
    return (
        <div className={styles.page}>

            {/* HERO */}
            <section className={styles.hero}>
                <div className=container>
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className=section-label><Translate tKey=about.label /></p>
                            <h1 className=text-h1>
                                <Translate tKey=about.h1.1 /><br />
                                <Translate tKey=about.h1.2 />
                            </h1>
                            <p className=text-body-lg style={{ maxWidth: 560 }}>
                                <Translate tKey=about.intro />
                            </p>
                        </div>
                        <div className={styles.heroVisual}>
                            <Image src=/assets/info_about.png alt=About GDI FutureWorks width={500} height={500} />
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className={styles.statsBar}>
                <div className=container>
                    <div className={styles.statsGrid}>
                        {stats.map(([num, lblKey]) => (
                            <div key={lblKey} className={styles.stat}>
                                <div className={styles.statNum}>{num}</div>
                                <div className={styles.statLbl}><Translate tKey={lblKey} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MISSION */}
            <section className=section>
                <div className=container>
                    <div className={styles.missionGrid}>
                        <div>
                            <p className=section-label><Translate tKey=about.mission.label /></p>
                            <h2 className=text-h2><Translate tKey=about.mission.h2 /></h2>
                        </div>
                        <div>
                            <p className={styles.missionText}>
                                <Translate tKey=about.mission.p1 />
                            </p>
                            <p className={styles.missionText} style={{ marginTop: 'var(--space-5)' }}>
                                <Translate tKey=about.mission.p2 />
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PILLARS */}
            <section className={`section ${styles.pillarsSection}`}>
                <div className=container>
                    <div className={styles.sectionHead}>
                        <p className=section-label><Translate tKey=about.diff.label /></p>
                        <h2 className=text-h2><Translate tKey=about.diff.h2 /></h2>
                    </div>
                    <div className=grid-2>
                        {pillars.map((p, i) => (
                            <div key={i} className={`card ${styles.pillarCard}`}>
                                <div className={styles.pillarIcon}>{p.icon}</div>
                                <h3 className={styles.pillarTitle}><Translate tKey={p.titleKey} /></h3>
                                <p className={styles.pillarDesc}><Translate tKey={p.descKey} /></p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.ctaSection}>
                <div className=container>
                    <div className={styles.ctaBox}>
                        <h2 className={styles.ctaTitle}><Translate tKey=about.cta.h2 /></h2>
                        <div className={styles.ctaBtns}>
                            <Link href=/#courses className=btn btn-primary btn-lg>
                                <Translate tKey=about.cta.browse /> <ChevronRight size={20} />
                            </Link>
                            <Link href=/contact className=btn btn-secondary btn-lg>
                                <Translate tKey=about.cta.consult />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
