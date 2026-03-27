import { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Mail, ArrowRight, HelpCircle, Zap, Send } from 'lucide-react';
import styles from './page.module.css';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = {
    title: 'Contact Us — GDI FutureWorks',
    description: 'Connect with GDI FutureWorks for inquiries, partnerships, and support. Our team responds within minutes via WhatsApp or Email.',
};

export default function ContactPage() {
    return (
        <div className={styles.page}>

            {/* HERO SECTION (Mobile Optimized) */}
            <header className={styles.hero}>
                <div className="container">
                    <span className={styles.sectionLabel}>
                        Connect with GDI
                    </span>

                    <h1 className={styles.heroTitle}>
                        Connect with the <br />
                        <span className={styles.heroAccent}>Future of Work.</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Reach out for enrollment support, corporate partnerships, 
                        or technical guidance. We are faster than you think.
                    </p>
                </div>
            </header>

            {/* CONTACT CARDS (Mobile First Stack) */}
            <section className={styles.mainSection}>
                <div className="container">
                    <div className={styles.contactGrid}>
                        <div className={`${styles.card} ${styles.cardFeatured}`}>
                            <span className={`${styles.tierBadge} ${styles.tierBadgeAccent}`}>
                                <Zap size={12} strokeWidth={1.5} style={{ marginRight: 4 }} /> Highest Priority
                            </span>
                            
                            <div className={styles.iconWrap}>
                                <MessageCircle size={24} strokeWidth={1.5} />
                            </div>

                            <div className={styles.cardTitle}>WhatsApp</div>
                            
                            <p className={styles.cardDesc}>
                                Direct access to our learning advisors. Ideal for quick questions about course details, enrollment, or technical help.
                            </p>

                            <a 
                                href="https://wa.me/628211704707" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'auto' }}
                            >
                                Start Chat <ArrowRight size={18} strokeWidth={1.5} />
                            </a>
                        </div>

                        <div className={styles.card}>
                            <span className={styles.tierBadge}>
                                <Send size={12} strokeWidth={1.5} style={{ marginRight: 4 }} /> Response within 24h
                            </span>

                            <div className={styles.iconWrap}>
                                <Mail size={24} strokeWidth={1.5} />
                            </div>

                            <div className={styles.cardTitle}>Email Support</div>
                            
                            <p className={styles.cardDesc}>
                                For institutional partnerships, corporate inquiries, and formal support requests. We review all mail daily.
                            </p>

                            <a 
                                href="mailto:support@gdifuture.works" 
                                className="btn btn-secondary btn-lg"
                                style={{ width: '100%', marginTop: 'auto' }}
                            >
                                Send Email <ArrowRight size={18} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION (Clean & Responsive) */}
            <section className={styles.faqSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>
                            <HelpCircle size={12} strokeWidth={1.5} style={{ marginRight: 4 }} /> Solutions Center
                        </span>
                        <h2 className={styles.sectionTitle}>Help & FAQ</h2>
                    </div>
                    
                    <div style={{ maxWidth: 840, margin: '0 auto' }}>
                        <FAQAccordion items={[
                            {
                                q: 'Can I start with no experience?',
                                a: 'Yes. Most courses are beginner-friendly and designed for fast learning.',
                            },
                            {
                                q: 'How fast can I learn?',
                                a: 'Some skills can be learned and applied in 1–2 weeks, such as: Canva + AI, Digital marketing basics, Freelance skills, and AI tools.',
                            },
                            {
                                q: 'Is it online or offline?',
                                a: 'Fully online. Learn from anywhere, anytime.',
                            },
                            {
                                q: 'What skills can I learn?',
                                a: 'You can master Canva + AI, Digital Marketing, AI Tools, No-code tools, Freelance skills, IT basics, and Business digital skills.',
                            },
                        ]} />
                    </div>
                </div>
            </section>

        </div>
    );
}
