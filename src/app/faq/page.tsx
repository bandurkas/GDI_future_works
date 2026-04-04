'use client';
import { useState } from 'react';
import styles from './page.module.css';
const faqs = [
    { q: 'How are classes conducted?', a: 'All classes are live online video sessions with real-time interaction. You join via a link sent to your WhatsApp.' },
    { q: 'Do I need prior experience?', a: 'No. Our courses start from the absolute fundamentals — no prior coding or tech experience required.' },
    { q: 'Will I receive a certificate?', a: 'Yes. Upon completing all sessions and the portfolio project, you receive a verifiable certificate of completion.' },
    { q: 'Can I ask questions during class?', a: 'Absolutely. Sessions are fully interactive Q&A throughout. Ask anything — the instructor is there for you.' },
    { q: 'Will I build a real project?', a: 'Yes. Every course includes a portfolio-ready project based on a real business case you can show employers.' },
    { q: 'What if I can\'t attend a session?', a: 'Message us on WhatsApp and we\'ll help you reschedule to another date.' },
    { q: 'How do I access the course?', a: 'Within minutes of payment, you\'ll receive a WhatsApp message with your session link and all course info.' },
    { q: 'Is this available outside Indonesia?', a: 'Yes — students from Malaysia, Singapore, Philippines, and Australia have all joined. Classes are in English.' },
];
export default function FAQPage() {
    const [open, setOpen] = useState<number | null>(null);
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className="container">
                    <p className="section-label">FAQ</p>
                    <h1 className="text-h1">Frequently Asked Questions</h1>
                    <p className="text-body-lg" style={{ maxWidth: 520 }}>Everything you need to know about GDI FutureWorks courses and enrollment.</p>
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
                                    aria-controls={`faq-answer-${i}`}
                                    id={`faq-${i}`}
                                >
                                    <span>{faq.q}</span>
                                    <svg className={`${styles.chevron} ${open === i ? styles.chevronOpen : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    id={`faq-answer-${i}`}
                                    role="region"
                                    aria-labelledby={`faq-${i}`}
                                    hidden={open !== i}
                                    className={styles.answer}
                                >
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.cta}>
                        <p className={styles.ctaTxt}>Still have questions?</p>
                        <a href="https://wa.me/628211704707" className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                            💬 Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
