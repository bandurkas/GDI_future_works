'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

export default function GlobalCheckoutPage() {
    const { items, totalItems } = useCart();
    const [form, setForm] = useState({ name: '', whatsapp: '' });
    const { language } = useLanguage();

    const totalPriceIDR = items.reduce((sum, item) => sum + item.priceIDR, 0);
    const totalPriceMYR = items.reduce((sum, item) => sum + item.priceMYR, 0);

    const displayTotal = language === 'id' 
        ? `Rp ${totalPriceIDR.toLocaleString('id-ID')}`
        : `RM ${totalPriceMYR.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

    const isValid = form.name.trim().length > 1 && form.whatsapp.trim().length > 6;

    const paymentHref = isValid
        ? `/payment?n=${encodeURIComponent(form.name)}&p=${encodeURIComponent(form.whatsapp)}`
        : '#';

    const handleProceed = (e: React.MouseEvent) => {
        if (!isValid) e.preventDefault();
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    if (totalItems === 0) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.empty}>
                        <p>Your cart is empty. Please add a course first.</p>
                        <Link href="/courses" className="btn btn-primary">Browse Courses</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.inner}>
                    {/* Progress */}
                    <div className={styles.progress}>
                        {[
                            { n: 1, l: 'Review Cart' }, 
                            { n: 2, l: 'Your Details' }, 
                            { n: 3, l: 'Payment' }
                        ].map((s, i) => (
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
                        <h1 className={styles.title}>Secure Checkout</h1>
                        <p className={styles.subtitle}>Complete your details to secure your spot in {totalItems} courses.</p>
                    </div>

                    <div className={styles.grid}>
                        {/* Form */}
                        <div className={styles.formCard}>
                            <h3 className={styles.formTitle}>Your Contact Information</h3>

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

                            <Link href="/cart" className={styles.back}>← Back to cart</Link>
                        </div>

                        {/* Order summary */}
                        <div className={styles.summaryCard}>
                            <h3 className={styles.summaryTitle}>Order Summary ({totalItems})</h3>

                            <div className={styles.itemContainer}>
                                {items.map((item) => (
                                    <div key={`${item.courseId}-${item.dateId}`} className={styles.summaryItem}>
                                        <div className={styles.summaryIcon}>{item.icon}</div>
                                        <div className={styles.summaryInfo}>
                                            <p className={styles.summaryName}>{item.courseTitle}</p>
                                            <p className={styles.summaryMeta}>📅 {item.dateLabel} · {item.timeLabel}</p>
                                        </div>
                                        <div className={styles.summaryPrice}>
                                            {language === 'id' ? `Rp ${item.priceIDR.toLocaleString('id-ID')}` : `RM ${item.priceMYR}`}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.priceLine}>
                                <span>Total Price</span>
                                <span className={styles.totalAmt}>{displayTotal}</span>
                            </div>
                            
                            <div className={styles.trustBadge}>
                                🛡️ Secure Checkout powered by Midtrans
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
