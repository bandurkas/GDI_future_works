import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'About Us — GDI FutureWorks',
    description: 'GDI FutureWorks was built by Feonna Watford and Sergei Bandurka — two industry veterans with over 40 years of combined experience — to deliver real-world tech skills that accelerate careers across Southeast Asia.'
};

const pillars = [
    { icon: '🎯', title: 'Industry Practitioners Only', desc: 'Every instructor is an active tech professional — not a career academic. They bring the tools, workflows, and insider knowledge you need on day one.' },
    { icon: '🏗️', title: 'Portfolio-Ready Projects', desc: 'Every course ends with a real project you can show employers immediately. No theoretical assignments. Just work that proves you can do the job.' },
    { icon: '🎙️', title: 'Fully Live & Interactive', desc: 'Ask questions in real time. Get feedback on your work. Learn at the pace of your curiosity — not a pre-recorded video.' },
    { icon: '🌐', title: 'Lifetime Community Access', desc: 'Join a private network of driven professionals. Share job leads, get career advice, and stay connected to the people who can open doors.' },
];

const stats = [
    ['500+', 'Professionals trained'],
    ['⭐ 4.9/5', 'Student satisfaction'],
    ['4', 'Expert-led courses'],
    ['2', 'Countries served'],
];

export default function AboutPage() {
    return (
        <div className={styles.page}>

            {/* HERO */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label">About GDI FutureWorks</p>
                            <h1 className="text-h1">Built by industry leaders.<br />Designed for real careers.</h1>
                            <p className="text-body-lg" style={{ maxWidth: 560 }}>
                                GDI FutureWorks was founded by professionals who saw the same problem everywhere: talented people being left behind because education couldn&apos;t keep up with the speed of tech. We built the platform we wish had existed when we were starting out.
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
                            <p className="section-label">Our Mission</p>
                            <h2 className="text-h2">To close the gap between education and the real world.</h2>
                        </div>
                        <div>
                            <p className={styles.missionText}>
                                Most tech courses are either too theoretical, too expensive, or too slow. By the time you graduate, the industry has already moved on. GDI FutureWorks was built to solve all three: real skills, real instructors, real outcomes — in the shortest time possible.
                            </p>
                            <p className={styles.missionText} style={{ marginTop: 'var(--space-5)' }}>
                                We serve professionals in Malaysia and Indonesia who are serious about their careers and need training that delivers measurable results — not certificates that collect dust.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MEET THE FOUNDERS */}
            <section className={styles.foundersSection}>
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="section-label">Meet the Founders</p>
                        <h2 className="text-h2">40+ years of combined expertise,<br />delivered directly to you.</h2>
                    </div>
                    <div className={styles.foundersGrid}>
                        <div className={styles.founderCard}>
                            <img src="/team/feonna.png" alt="Feonna Watford" className={styles.founderImg} />
                            <div className={styles.founderInfo}>
                                <h3 className={styles.founderName}>Feonna Watford</h3>
                                <p className={styles.founderRole}>Co-Founder · Operations & Digital Transformation</p>
                                <p className={styles.founderBio}>
                                    With over 20 years of corporate leadership across digital transformation and operations, Feonna designs the systems that ensure every training program at GDI FutureWorks delivers measurable, real-world career impact. She has led large-scale digital initiatives across Southeast Asia and brings that enterprise-level thinking to every curriculum she builds.
                                </p>
                            </div>
                        </div>
                        <div className={styles.founderCard}>
                            <img src="/team/sergei.png" alt="Sergei Bandurka" className={styles.founderImg} />
                            <div className={styles.founderInfo}>
                                <h3 className={styles.founderName}>Sergei Bandurka</h3>
                                <p className={styles.founderRole}>Co-Founder · Technology & Strategy</p>
                                <p className={styles.founderBio}>
                                    A veteran in corporate strategy and tech execution, Sergei brings two decades of experience designing programs that empower organizations and individuals to lead their industries. His hands-on approach to AI, data, and engineering education means students are always learning what the market actually needs — not what textbooks say it needs.
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className={styles.founderCombined}>
                        Together, Feonna and Sergei are actively building and refining GDI FutureWorks — bringing Fortune 500-level strategy and real-world execution experience directly to professionals across Malaysia and Indonesia.
                    </p>
                </div>
            </section>

            {/* PILLARS */}
            <section className={`section ${styles.pillarsSection}`}>
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="section-label">What Makes Us Different</p>
                        <h2 className="text-h2">Built different. By design.</h2>
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
                        <h2 className={styles.ctaTitle}>Ready to accelerate your tech career?</h2>
                        <div className={styles.ctaBtns}>
                            <Link href="/#courses" className="btn btn-primary btn-lg">Browse Courses →</Link>
                            <Link href="/contact" className="btn btn-secondary btn-lg">Consult Advisor</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
