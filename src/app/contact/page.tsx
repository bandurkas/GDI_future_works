'use client';
import Link from 'next/link';
import { MessageCircle, Mail, ArrowRight, HelpCircle, Zap, Send } from 'lucide-react';
import styles from './page.module.css';
import FAQAccordion from '@/components/FAQAccordion';
import { useLanguage } from '@/components/LanguageContext';
import { useState, useEffect } from 'react';

export default function ContactPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <div className={styles.page}>

            {/* HERO SECTION */}
            <header className={styles.hero}>
                <div className="container">
                    <span className={styles.sectionLabel}>
                        {t('contact.label')}
                    </span>

                    <h1 className={styles.heroTitle}>
                        {t('contact.h1')}
                    </h1>

                    <p className={styles.heroSubtitle}>
                        {t('contact.subtitle')}
                    </p>
                </div>
            </header>

            {/* CONTACT CARDS */}
            <section className={styles.mainSection}>
                <div className="container">
                    <div className={styles.contactGrid}>
                        <div className={`${styles.card} ${styles.cardFeatured}`}>
                            <span className={`${styles.tierBadge} ${styles.tierBadgeAccent}`}>
                                <Zap size={12} strokeWidth={1.5} style={{ marginRight: 4 }} /> {t('contact.whatsapp.priority')}
                            </span>
                            
                            <div className={styles.iconWrap}>
                                <MessageCircle size={24} strokeWidth={1.5} />
                            </div>

                            <div className={styles.cardTitle}>{t('contact.whatsapp.title')}</div>
                            
                            <p className={styles.cardDesc}>
                                {t('contact.whatsapp.desc')}
                            </p>

                            <a 
                                href="https://wa.me/628211704707" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'auto' }}
                            >
                                {t('contact.whatsapp.btn')} <ArrowRight size={18} strokeWidth={1.5} />
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
                            
                            <p className={styles.cardDesc}>
                                {t('contact.email.desc')}
                            </p>

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
                        <span className={styles.sectionLabel}>
                            <HelpCircle size={12} strokeWidth={1.5} style={{ marginRight: 4 }} /> {t('contact.faq.label')}
                        </span>
                        <h2 className={styles.sectionTitle}>{t('contact.faq.h2')}</h2>
                    </div>
                    
                    <div style={{ maxWidth: 840, margin: '0 auto' }}>
                        <FAQAccordion items={[
                            { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
                            { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
                            { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
                            { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
                        ]} />
                    </div>
                </div>
            </section>

        </div>
    );
}
