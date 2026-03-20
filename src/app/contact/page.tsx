import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Contact Us — GDI FutureWorks',
    description: 'Reach out to GDI FutureWorks for course enquiries, corporate training, or partnerships. Available via WhatsApp or email — we reply within minutes.',
};

const faqs = [
    {
        q: 'How quickly will you respond?',
        a: 'WhatsApp messages are answered in under 2 minutes during business hours. Emails are responded to within 24 hours.',
    },
    {
        q: 'I\'m not sure which course to take — can you help?',
        a: 'Absolutely. Our advisors will ask you a few quick questions and point you to the right course for your goals.',
    },
    {
        q: 'Do you offer corporate or group packages?',
        a: 'Yes. We offer custom group training for companies. Get in touch via email to discuss your team\'s needs.',
    },
];

export default function ContactPage() {
    return (
        <div className={styles.page}>

            {/* HERO */}
            <header className={styles.header}>
                <div className={styles.heroLayout}>
                    <div className={styles.heroContent}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8 }}>Get in Touch</p>
                        <h1 className={styles.headerTitle}>We&apos;re here to help you find the right path.</h1>
                        <p className={styles.headerSubtitle}>Have a question about a course, want to explore a partnership, or need help enrolling? Pick your preferred way to reach us — we respond fast.</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                            <span style={{ background: '#f0fdf4', color: '#166534', fontWeight: 600, fontSize: '0.8125rem', padding: '6px 14px', borderRadius: 100 }}>🇮🇩 Indonesia</span>
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.8125rem', padding: '6px 14px', borderRadius: 100 }}>🇲🇾 Malaysia</span>
                        </div>
                    </div>
                    <div className={styles.heroVisual}>
                        <Image src="/assets/info_contact.png" alt="Contact Us" width={400} height={400} />
                    </div>
                </div>
            </header>

            {/* CONTACT CARDS */}
            <main className={styles.main}>
                <div className={styles.card}>
                    <div className={styles.iconWrap}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                    </div>
                    <div className={styles.badgeWrap}>
                        <div className={styles.badgeWhatsapp}>⚡ Fastest — under 2 min</div>
                    </div>
                    <h2 className={styles.title}>Chat on WhatsApp</h2>
                    <p className={styles.desc}>
                        The quickest way to reach our team. Ask about courses, schedules, pricing, or anything else — we&apos;re online and ready to help.
                    </p>
                    <a href="https://wa.me/6282258720974" target="_blank" rel="noopener noreferrer" className={styles.buttonWhatsapp}>
                        Open WhatsApp →
                    </a>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconWrap}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                            <path d="M2 6l10 7 10-7"></path>
                        </svg>
                    </div>
                    <div className={styles.badgeWrap}>
                        <div className={styles.badge}>📬 Reply within 24h</div>
                    </div>
                    <h2 className={styles.title}>Send an Email</h2>
                    <p className={styles.desc}>
                        Ideal for partnership inquiries, corporate training proposals, or detailed questions. We&apos;ll get back to you within one business day.
                    </p>
                    <a href="mailto:hello@gdieduhub.com" className={styles.button}>
                        Email Us →
                    </a>
                </div>
            </main>

            {/* FAQ */}
            <section style={{ padding: '60px 20px', maxWidth: 760, margin: '0 auto', width: '100%' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8, textAlign: 'center' }}>Common Questions</p>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 40 }}>Before you reach out</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {faqs.map((faq, i) => (
                        <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 28px' }}>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontSize: '1rem' }}>{faq.q}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Still have questions? Browse our full FAQ page.</p>
                    <Link href="/faq" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>View all FAQs →</Link>
                </div>
            </section>

        </div>
    );
}
