'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { getCourseBySlug } from '@/data/courses';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

declare global {
    interface Window {
        snap: any;
    }
}

export default function PaymentPage({ params }: Props) {
    const { slug } = use(params);
    const course = getCourseBySlug(slug);
    const [method, setMethod] = useState<'card' | 'qris' | 'va'>('card');
    const [loading, setLoading] = useState(false);
    const { language } = useLanguage();

    if (!course) return null;

    const handlePay = async () => {
        if (!method || loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/tokenize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: course.id,
                    name: course.title,
                    price: course.price * 16800,
                })
            });

            const data = await res.json();

            if (data.token && typeof window.snap !== 'undefined') {
                window.snap.pay(data.token, {
                    onSuccess: function (result: any) {
                        window.location.href = `/courses/${slug}/confirmation`;
                    },
                    onPending: function (result: any) {
                        alert('Waiting for your payment!');
                        setLoading(false);
                    },
                    onError: function (result: any) {
                        alert('Payment failed!');
                        setLoading(false);
                    },
                    onClose: function () {
                        setLoading(false);
                    }
                });
            } else {
                alert('Payment gateway could not be loaded. Check your internet connection or keys.');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('A network error occurred.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href={`/courses/${slug}/checkout`} className={styles.cancelBtn}>Cancel</Link>
                <div className={styles.headerTitle}>Checkout</div>
                <div className={styles.headerSpacer} />
            </header>

            <main className={styles.main}>
                <div className={styles.progressRow}>
                    {[{ n: 1, l: 'Select Time' }, { n: 2, l: 'Your Details' }, { n: 3, l: 'Payment' }].map((s, i) => (
                        <div key={s.n} className={styles.progressStep}>
                            <div className={`${styles.stepBubble} ${s.n < 3 ? styles.done : ''} ${s.n === 3 ? styles.active : ''}`}>
                                {s.n < 3 ? '✓' : s.n}
                            </div>
                            <span className={`${styles.stepLabel} ${s.n === 3 ? styles.activeLbl : ''}`}>{s.l}</span>
                            {i < 2 && <div className={`${styles.line} ${s.n < 3 ? styles.lineDone : ''}`} />}
                        </div>
                    ))}
                </div>

                <div className={styles.content}>
                    <h1 className={styles.title}>Choose a payment method</h1>
                    <p className={styles.subtitle}>You won&apos;t be charged until you review the order on the next page</p>

                    <div className={styles.paymentMethods}>

                        <div className={styles.accordionHeader} onClick={() => setMethod('card')}>
                            <div className={`${styles.radio} ${method === 'card' ? styles.radioSelected : ''}`}>
                                {method === 'card' && <div className={styles.radioDot} />}
                            </div>
                            <span className={styles.methodName}>Credit Card</span>
                        </div>

                        {method === 'card' && (
                            <div className={styles.accordionBody}>
                                <div className={styles.inputWrap}>
                                    <input type="text" className={styles.cardInput} defaultValue="Mastercard xxxx xxxx xxxx 1234" readOnly />
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.inputCheck}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            </div>
                        )}

                        <div className={styles.divider} />

                        <div className={styles.accordionHeader} onClick={() => setMethod('qris')}>
                            <div className={`${styles.radio} ${method === 'qris' ? styles.radioSelected : ''}`}>
                                {method === 'qris' && <div className={styles.radioDot} />}
                            </div>
                            <span className={styles.methodName}>QRIS / E-Wallet</span>
                        </div>
                        {method === 'qris' && (
                            <div className={styles.accordionBody}>
                                <p className={styles.qrisDesc}>Pay instantly using GoPay, OVO, Dana, ShopeePay, or any QRIS app.</p>
                            </div>
                        )}

                        <div className={styles.divider} />

                        <div className={styles.accordionHeader} onClick={() => setMethod('va')}>
                            <div className={`${styles.radio} ${method === 'va' ? styles.radioSelected : ''}`}>
                                {method === 'va' && <div className={styles.radioDot} />}
                            </div>
                            <span className={styles.methodName}>Bank Transfer (Virtual Account)</span>
                        </div>
                        {method === 'va' && (
                            <div className={styles.accordionBody}>
                                <p className={styles.qrisDesc}>BCA, Mandiri, BNI, BRI, Permata transfers supported.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <div className={styles.footer} style={{ flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {language === 'en' && (
                    <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Transactions are processed securely in IDR equivalent.</small>
                )}
                <button
                    className={`${styles.payBtn} ${loading ? styles.payBtnLoading : ''}`}
                    onClick={handlePay}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Continue'}
                </button>
            </div>
        </div>
    );
}
