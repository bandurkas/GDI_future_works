'use client';
import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import styles from './HomeFAQ.module.css';

const faqKeys = [
    { q: 'faq.q1', a: 'faq.a1' },
    { q: 'faq.q2', a: 'faq.a2' },
    { q: 'faq.q3', a: 'faq.a3' },
    { q: 'faq.q4', a: 'faq.a4' },
    { q: 'faq.q5', a: 'faq.a5' },
];

export default function HomeFAQ() {
    const [open, setOpen] = useState<number | null>(null);
    const { t } = useLanguage();

    return (
        <section className={styles.faqSection}>
            <div className="container">
                <div className={styles.faqHeader}>
                    <p className={styles.faqLabel}>FAQ</p>
                    <h2 className={styles.faqH2}>{t('faq.h2')}</h2>
                    <p className={styles.faqSub}>{t('faq.sub')}</p>
                </div>
                <div className={styles.faqList}>
                    {faqKeys.map(({ q, a }, i) => (
                        <div
                            key={i}
                            className={`${styles.faqItem} ${open === i ? styles.faqOpen : ''}`}
                        >
                            <button
                                className={styles.faqQ}
                                onClick={() => setOpen(open === i ? null : i)}
                                aria-expanded={open === i}
                            >
                                <span>{t(q)}</span>
                                <span className={styles.faqChevron}>
                                    {open === i ? '−' : '+'}
                                </span>
                            </button>
                            <div className={styles.faqAnswer}>
                                <p>{t(a)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.faqFooter}>
                    <p>{t('faq.footer')}</p>
                    <a
                        href="https://wa.me/6282258720974"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.faqWa}
                    >
                        💬 {t('faq.wa')}
                    </a>
                </div>
            </div>
        </section>
    );
}
