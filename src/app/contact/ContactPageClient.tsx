'use client';
import Link from 'next/link';
import { MessageCircle, Mail, ArrowRight, Zap, Send } from 'lucide-react';
import styles from './page.module.css';
import FAQAccordion from '@/components/FAQAccordion';
import { useLanguage } from '@/components/LanguageContext';
import { useMetaPixel } from '@/hooks/useMetaPixel';

export default function ContactPageClient() {
    const { t } = useLanguage();
    const { trackLead } = useMetaPixel();

    const faqs = [
        { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
        { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
        { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
        { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
        { q: t('contact.faq.q5'), a: t('contact.faq.a5') },
        { q: t('contact.faq.q6'), a: t('contact.faq.a6') },
        { q: t('contact.faq.q7'), a: t('contact.faq.a7') },
        { q: t('contact.faq.q8'), a: t('contact.faq.a8') },
    ];

    return (
        <div className={styles.page}>

            {/* HERO SECTION */}
            <header className={styles.hero}>
                <div className="container">
                    <span className={styles.sectionLabel}>
                        {t('contact.badge')}
                    </span>

                    <h1 className={styles.heroTitle}>
                        {t('contact.hero.h1.1')} <br />
                        <span className={styles.heroAccent}>{t('contact.hero.h1.2')}</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        {t('contact.hero.sub')}
                    </p>
                </div>
            </header>

            {/* CONTACT CARDS */}
            <section className={styles.mainSection}>
                <div className="container">
                    <div className={styles.contactGrid}>
                        <div className={`${styles.card} ${styles.cardFeatured}`}>
                            <span className={`${styles.tierBadge} ${styles.tierBadgeAccent}`}>
                                <Zap size={12} strokeWidth={1.5} style={{ marginRight: 4 }} /> {t('contact.wa.priority')}
                            </span>
                            <div className={styles.iconWrap}>
                                <MessageCircle size={24} strokeWidth={1.5} />
                            </div>
                            <div className={styles.cardTitle}>{t('contact.wa.title')}</div>
                            <p className={styles.cardDesc}>{t('contact.wa.desc')}</p>
                            <a
                                href="/api/whatsapp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'auto' }}
                                onClick={() => trackLead('wa_contact_page')}
                            >
                                {t('contact.wa.btn')} <ArrowRight size={18} strokeWidth={1.5} />
                            </a>
                        </div>

                        <div className={styles.card}>
                            <span className={styles.tierBadge}>
                                <Send size={12} strokeWidth={1.5} style={{ marginRight: 4 }} /> {t('contact.email.badge')}
                            </span>
                            <div className={styles.iconWrap}>
                                <Mail size={24} strokeWidth={1.5} />
                            </div>
                            <div className={styles.cardTitle}>{t('contact.email.title')}</div>
                            <p className={styles.cardDesc}>{t('contact.email.desc')}</p>
                            <a
                                href="mailto:support@gdifuture.works"
                                className="btn btn-secondary btn-lg"
                                style={{ width: '100%', marginTop: 'auto' }}
                            >
                                {t('contact.email.btn')} <ArrowRight size={18} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className={styles.faqSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>{t('contact.faq.badge')}</span>
                        <h2 className={styles.sectionTitle}>{t('contact.faq.title')}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 32, maxWidth: 560, margin: '8px auto 32px' }}>
                            {t('contact.faq.sub')}
                        </p>
                    </div>

                    <div style={{ maxWidth: 840, margin: '0 auto' }}>
                        <FAQAccordion items={faqs} />
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <p style={{ marginBottom: 16, fontWeight: 600 }}>{t('contact.faq.still')}</p>
                        <a
                            href="/api/whatsapp"
                            className="btn btn-primary btn-lg"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackLead('wa_contact_page_faq')}
                        >
                            {t('contact.faq.chatBtn')}
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
