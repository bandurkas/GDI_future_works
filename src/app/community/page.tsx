import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
export const metadata: Metadata = { title: 'Community — GDI FutureWorks', description: 'Join the GDI FutureWorks student community. Get job opportunities, networking, and career support.' };
const perks = [
    { icon: '💬', title: 'Private Student Community', desc: 'Join our exclusive WhatsApp group with active peers and alumni who\'ve been through the same journey.' },
    { icon: '💼', title: 'Job Opportunities', desc: 'Access curated job postings, freelance projects, and career opportunities shared by our network.' },
    { icon: '🤝', title: 'Peer Networking', desc: 'Connect with students from across Indonesia and Southeast Asia building careers in tech.' },
    { icon: '🎯', title: 'Career Guidance', desc: 'Get advice from instructors and alumni on portfolio building, interviews, and career direction.' },
];
export default function CommunityPage() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label">Community</p>
                            <h1 className="text-h1">You&apos;re not learning alone.</h1>
                            <p className="text-body-lg" style={{ maxWidth: 520 }}>Every GDI FutureWorks student joins a career-focused community where learning continues long after the course ends.</p>
                        </div>
                        <div className={styles.heroVisual}>
                            <Image src="/assets/info_community.png" alt="Community Network" width={500} height={500} unoptimized />
                        </div>
                    </div>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    <div className={styles.sectionHead}><p className="section-label">What You Get</p><h2 className="text-h2 reveal">Your community membership includes:</h2></div>
                    <div className="grid-2">
                        {perks.map((p, i) => (
                            <div key={i} className={`card ${styles.perkCard} reveal`}>
                                <div className={styles.perkIcon}>{p.icon}</div>
                                <h3 className={styles.perkTitle}>{p.title}</h3>
                                <p className={styles.perkDesc}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className={styles.proofSection}>
                <div className="container">
                    <div className={styles.proofInner}>
                        <div className={styles.proofNum}>1,200+</div>
                        <p className={styles.proofLbl}>students in our community</p>
                        <p className={styles.proofSub}>from Indonesia, Malaysia, Singapore, and across Southeast Asia</p>
                    </div>
                </div>
            </section>
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.cta}>
                        <h2 className={styles.ctaTitle}>The community is free for all enrolled students.</h2>
                        <p className={styles.ctaDesc}>Enroll in any course to get lifetime access.</p>
                        <Link href="/" className="btn btn-primary btn-lg">Choose a Course →</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
