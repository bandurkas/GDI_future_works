import { Metadata } from 'next';
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

export const metadata: Metadata = {
    title: 'Community — GDI FutureWorks',
    description: 'Join the GDI FutureWorks student community. Get access to exclusive job opportunities, peer networking, career mentorship, and a support network across Indonesia and Malaysia.'
};

const perks = [
    {
        icon: <MessageSquare size={24} />,
        title: 'Private Student Community',
        desc: 'Access our exclusive WhatsApp group with active peers, alumni, and instructors. Ask questions, share wins, and get unstuck — any time of day.',
    },
    {
        icon: <TrendingUp size={24} />,
        title: 'Real Job Opportunities',
        desc: 'Get early access to curated job postings, freelance contracts, and referrals shared directly by our network. Your next role may already be waiting inside.',
    },
    {
        icon: <Handshake size={24} />,
        title: 'Professional Networking',
        desc: 'Build lasting connections with driven professionals from Indonesia, Malaysia, and across Southeast Asia who are walking the same path as you.',
    },
    {
        icon: <Target size={24} />,
        title: 'Mentorship & Career Guidance',
        desc: 'Get actionable advice from instructors and alumni on building your portfolio, preparing for interviews, and choosing your next career move.',
    },
    {
        icon: <Bell size={24} />,
        title: 'Early Access & Perks',
        desc: 'Be the first to know about new courses, cohort discounts, and special partnerships — exclusive offers available only to community members.',
    },
    {
        icon: <Rocket size={24} />,
        title: 'Accountability & Growth',
        desc: 'Share weekly goals, celebrate milestones, and stay motivated in a group of peers who are just as serious about their careers as you are.',
    },
];

const testimonials = [
    {
        quote: "The community was honestly the most valuable part. I found my first freelance client through the WhatsApp group within two weeks of finishing the course.",
        name: "Rina S.",
        role: "Data Analyst, Jakarta",
        flag: "🇮🇩",
    },
    {
        quote: "I was nervous starting a new career path at 32, but the community made it feel possible. Everyone was incredibly supportive.",
        name: "Ahmad K.",
        role: "Python Developer, Kuala Lumpur",
        flag: "🇲🇾",
    },
    {
        quote: "The group chat alone is worth it. Job leads, study help, portfolio feedback — it's active, friendly, and genuinely useful.",
        name: "Dewi P.",
        role: "UX Designer, Bandung",
        flag: "🇮🇩",
    },
];

export default function CommunityPage() {
    return (
        <div className={styles.page}>

            {/* HERO */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label">Community</p>
                            <h1 className="text-h1">Your career network<br />starts here.</h1>
                            <p className="text-body-lg" style={{ maxWidth: 520 }}>
                                Every GDI FutureWorks student joins a career-focused community where learning continues long after the last session ends — and where real opportunities are shared every single day.
                            </p>
                            <Link href="/#courses" className="btn btn-primary">Join via a Course →</Link>
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
                        <p className="section-label">What You Get</p>
                        <h2 className="text-h2">Your community membership includes everything you need to grow.</h2>
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
                        <div className={styles.proofNum}>500+</div>
                        <p className={styles.proofLbl}>professionals in our active community</p>
                        <p className={styles.proofSub}>from Indonesia, Malaysia, Singapore, and across Southeast Asia</p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className={styles.sectionHead}>
                        <p className="section-label">From Our Community</p>
                        <h2 className="text-h2">Hear it from the people inside.</h2>
                    </div>
                    <div className={styles.testimonialsGrid}>
                        {testimonials.map((t, i) => (
                            <div key={i} className={styles.testimonialCard}>
                                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                                <div className={styles.testimonialMeta}>
                                    <span className={styles.testimonialFlag}>{t.flag}</span>
                                    <div>
                                        <p className={styles.testimonialName}>{t.name}</p>
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
                        <h2 className={styles.ctaTitle}>Community access is free for all enrolled students.</h2>
                        <p className={styles.ctaDesc}>Enroll in any course to get lifetime access to the full network — no extra fee, no expiry date.</p>
                        <Link href="/#courses" className="btn btn-primary btn-lg">Choose a Course <ChevronRight size={20} /></Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
