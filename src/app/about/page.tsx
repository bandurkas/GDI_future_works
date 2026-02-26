import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
export const metadata: Metadata = { title: 'About Us — GDI FutureWorks', description: 'We help people enter the tech industry faster through practical, live online courses.' };
const pillars = [
    { icon: '🎯', title: 'Industry practitioners', desc: 'Instructors who work at top companies and train you with real-world tools.' },
    { icon: '🏗️', title: 'Real portfolio projects', desc: 'Every course ends with a project you can show employers immediately.' },
    { icon: '🎙️', title: 'Fully interactive format', desc: 'Ask questions live — not passive watching.' },
    { icon: '🌐', title: 'Career community', desc: 'Private network with job postings, peers, and long-term guidance.' },
];
export default function AboutPage() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label">About GDI FutureWorks</p>
                            <h1 className="text-h1">We help people enter<br />the tech industry faster.</h1>
                            <p className="text-body-lg" style={{ maxWidth: 560 }}>GDI FutureWorks is built by Global Digital Informasi — a team passionate about making high-quality tech education practical, career-focused, and accessible across Southeast Asia.</p>
                        </div>
                        <div className={styles.heroVisual}>
                            <Image src="/assets/info_about.png" alt="About GDI FutureWorks" width={500} height={500} unoptimized />
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.statsBar}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        {[['1,200+', 'Students trained'], ['⭐ 4.9', 'Average rating'], ['4', 'Live courses'], ['< 2 min', 'Enrollment time']].map(([num, lbl]) => (
                            <div key={lbl} className={styles.stat}>
                                <div className={styles.statNum}>{num}</div>
                                <div className={styles.statLbl}>{lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    <div className={styles.missionGrid}>
                        <div><p className="section-label">Our Mission</p><h2 className="text-h2">To make high-quality tech education practical, accessible, and career-focused.</h2></div>
                        <div>
                            <p className={styles.missionText}>We saw that most tech courses are either too theoretical, too expensive, or too slow. GDI FutureWorks was built to solve all three: real skills, real instructors, real outcomes — in the shortest time possible.</p>
                            <p className={styles.missionText} style={{ marginTop: 'var(--space-5)' }}>Our courses are designed by people who actually work in tech every day and know exactly what skills companies are hiring for right now.</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className={`section ${styles.pillarsSection}`}>
                <div className="container">
                    <div className={styles.sectionHead}><p className="section-label">What Makes Us Different</p><h2 className="text-h2">Built different. By design.</h2></div>
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
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaBox}>
                        <h2 className={styles.ctaTitle}>Ready to start your tech career?</h2>
                        <div className={styles.ctaBtns}>
                            <Link href="/" className="btn btn-primary btn-lg">Browse Courses →</Link>
                            <Link href="/contact" className="btn btn-secondary btn-lg">Talk to Advisor</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
