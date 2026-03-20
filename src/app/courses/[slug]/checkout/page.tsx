'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { getCourseBySlug } from '@/data/courses';
import { Translate } from '@/components/ClientTranslations';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export default function CheckoutPage({ params }: Props) {
    const { slug } = use(params);
    const course = getCourseBySlug(slug);
    const [form, setForm] = useState({ name: '', whatsapp: '' });
    const { language } = useLanguage();

    const displayPrice = language === 'id'
        ? `Rp ${course?.priceIDR.toLocaleString('id-ID')}`
        : `RM ${course?.priceMYR}`;

    const isValid = form.name.trim().length > 1 && form.whatsapp.trim().length > 6;

    // Build the payment URL with customer data as URL params (survives new tabs, no sessionStorage SSR issues)
    const paymentHref = isValid
        ? `/courses/${slug}/payment?n=${encodeURIComponent(form.name)}&p=${encodeURIComponent(form.whatsapp)}`
        : '#';

    const handleProceed = (e: React.MouseEvent) => {
        if (!isValid) e.preventDefault();
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    if (!course) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.inner}>
                    {/* Progress */}
                    <div className={styles.progress}>
                        {[{ n: 1, l: 'Select Time' }, { n: 2, l: 'Your Details' }, { n: 3, l: 'Payment' }].map((s, i) => (
                            <div key={s.n} className={styles.progressStep}>
                                <div className={`${styles.stepBubble} ${s.n < 2 ? styles.done : ''} ${s.n === 2 ? styles.active : ''}`}>
                                    {s.n < 2 ? '✓' : s.n}
                                </div>
                                <span className={`${styles.stepLabel} ${s.n === 2 ? styles.activeLbl : ''}`}>{s.l}</span>
                                {i < 2 && <div className={`${styles.line} ${s.n < 2 ? styles.lineDone : ''}`} />}
                            </div>
                        ))}
                    </div>

                    <div>
                        <h1 className={styles.title}>Almost there.</h1>
                        <p className={styles.subtitle}>Just 2 short fields to secure your spot.</p>
                    </div>

                    <div className={styles.grid}>
                        {/* Form */}
                        <div className={styles.formCard}>
                            <h3 className={styles.formTitle}>Your Details</h3>

                            <div className="form-group">
                                <label className="form-label" htmlFor="name">Full Name *</label>
                                <input
                                    id="name" name="name" type="text"
                                    className="form-input"
                                    placeholder="e.g. Arif Setiyawan"
                                    value={form.name} onChange={onChange}
                                    autoComplete="name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="whatsapp">WhatsApp Number *</label>
                                <input
                                    id="whatsapp" name="whatsapp" type="tel"
                                    className="form-input"
                                    placeholder="+62 812 3456 7890"
                                    value={form.whatsapp} onChange={onChange}
                                    autoComplete="tel"
                                />
                            </div>

                            <Link
                                href={paymentHref}
                                className={`btn btn-primary btn-lg btn-full ${!isValid ? styles.disabled : ''}`}
                                aria-disabled={!isValid}
                                id="checkout-to-payment-btn"
                                onClick={handleProceed}
                            >
                                Proceed to Payment →
                            </Link>

                            {!isValid && (
                                <p className={styles.validationHint}>Fill your name and WhatsApp to continue</p>
                            )}

                            <Link href={`/courses/${slug}/schedule`} className={styles.back}>← Back to schedule</Link>
                        </div>

                        {/* Order summary */}
                        <div className={styles.summaryCard}>
                            <h3 className={styles.summaryTitle}>Order Summary</h3>

                            <div className={styles.summaryCourse}>
                                <div className={styles.summaryIcon} style={{ background: course.iconBg }}>{course.icon}</div>
                                <div>
                                    <p className={styles.summaryName}>{course.title}</p>
                                    <p className={styles.summaryMeta}>Live Session · 📅 {course.nextSession}</p>
                                </div>
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.priceLine}>
                                <span><Translate tKey="summary.total" defaultText="Total Price" /></span>
                                <span className={styles.totalAmt}>{displayPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
