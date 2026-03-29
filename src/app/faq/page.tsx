'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

export default function FAQPage() {
    const { t } = useLanguage();
    const [open, setOpen] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const faqs = [
        { q: t('faq.page.q1'), a: t('faq.page.a1') },
        { q: t('faq.page.q2'), a: t('faq.page.a2') },
        { q: t('faq.page.q3'), a: t('faq.page.a3') },
        { q: t('faq.page.q4'), a: t('faq.page.a4') },
        { q: t('faq.page.q5'), a: t('faq.page.a5') },
        { q: t('faq.page.q6'), a: t('faq.page.a6') },
        { q: t('faq.page.q7'), a: t('faq.page.a7') },
        { q: t('faq.page.q8'), a: t('faq.page.a8') },
    ];

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className="container">
                    <p className="section-label">{t('faq.page.label')}</p>
                    <h1 className="text-h1">{t('faq.page.h1')}</h1>
                    <p className="text-body-lg" style={{ maxWidth: 520 }}>{t('faq.page.sub')}</p>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    <div className={styles.list}>
                        {faqs.map((faq, i) => (
                            <div key={i} className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}>
                                <button
                                    className={styles.question}
                                    onClick={() => setOpen(open === i ? null : i)}
                                    aria-expanded={open === i}
                                    id={`faq-${i}`}
                                >
                                    <span>{faq.q}</span>
                                    <svg className={`${styles.chevron} ${open === i ? styles.chevronOpen : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {open === i && (
                                    <div className={styles.answer}><p>{faq.a}</p></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={styles.cta}>
                        <p className={styles.ctaTxt}>{t('faq.page.still')}</p>
                        <a href="https://wa.me/628211704707" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                            {t('faq.page.chat')}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
