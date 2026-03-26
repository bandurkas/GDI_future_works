'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice, convertToIdr } from '@/lib/currency';
import styles from './page.module.css';

declare global {
    interface Window {
        snap: any;
    }
}

function PaymentContent() {
    const searchParams = useSearchParams();
    const customerName = searchParams.get('n') || '';
    const customerPhone = searchParams.get('p') || '';
    
    const { items, totalItems, clearCart } = useCart();
    const { language } = useLanguage();
    const { currency } = useCurrency();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [popupClosed, setPopupClosed] = useState(false);
    
    const snapTokenRef = useRef<string | null>(null);

    const totalAmount = items.reduce((sum, item) => 
        sum + (currency === 'IDR' ? item.priceIDR : item.priceMYR), 0
    );
    const displayTotal = formatPrice(totalAmount, currency);
    const idrEquivalent = convertToIdr(totalAmount, currency);

    const handlePay = useCallback(async () => {
        if (loading || items.length === 0) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/tokenize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customerName,
                    customerPhone,
                    currency, // Pass currency to API
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.token) {
                setError(data.error || 'Failed to initialize payment');
                setLoading(false);
                return;
            }

            snapTokenRef.current = data.token;
            window.snap.pay(data.token, {
                onSuccess: () => {
                    clearCart();
                    window.location.href = `/confirmation`;
                },
                onPending: () => {
                    setError('Payment is pending. We\'ll notify you once confirmed.');
                    setLoading(false);
                },
                onError: () => {
                    setError('Payment failed. Please try again or use a different method.');
                    setLoading(false);
                },
                onClose: () => {
                    setLoading(false);
                    setPopupClosed(true);
                },
            });
        } catch {
            setError('A network error occurred. Please check your connection and try again.');
            setLoading(false);
        }
    }, [loading, items, customerName, customerPhone, clearCart]);

    const reopenSnap = useCallback(() => {
        if (!snapTokenRef.current || typeof window.snap === 'undefined') {
            handlePay();
            return;
        }
        setPopupClosed(false);
        setError(null);
        window.snap.pay(snapTokenRef.current, {
            onSuccess: () => {
                clearCart();
                window.location.href = `/confirmation`;
            },
            onPending: () => {
                setError('Payment is pending. We\'ll notify you once confirmed.');
                setLoading(false);
            },
            onError: () => {
                setError('Payment failed. Please try again or use a different method.');
                setLoading(false);
            },
            onClose: () => {
                setLoading(false);
                setPopupClosed(true);
            },
        });
    }, [handlePay, clearCart]);

    // Initial trigger
    useEffect(() => {
        if (items.length > 0 && typeof window.snap !== 'undefined' && !snapTokenRef.current && !loading) {
            handlePay();
        }
    }, [items, handlePay, loading]);

    if (totalItems === 0) {
        return (
            <div className={styles.page}>
                 <main className={styles.main}>
                    <div className={styles.processingBox}>
                        <p>No items in cart.</p>
                        <Link href="/courses" className="btn btn-primary">Browse Courses</Link>
                    </div>
                 </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/checkout" className={styles.cancelBtn}>← Back</Link>
                <div className={styles.headerTitle}>Checkout</div>
                <div className={styles.headerSpacer} />
            </header>

            <main className={styles.main}>
                <div className={styles.progressRow}>
                    {[
                        { n: 1, l: 'Review Cart' },
                        { n: 2, l: 'Your Details' },
                        { n: 3, l: 'Payment' },
                    ].map((s, i, arr) => (
                        <div key={s.n} className={styles.progressStep}>
                            <div className={styles.stepInner}>
                                <div className={`${styles.stepBubble} ${s.n < 3 ? styles.done : ''} ${s.n === 3 ? styles.active : ''}`}>
                                    {s.n < 3 ? '✓' : s.n}
                                </div>
                                <span className={`${styles.stepLabel} ${s.n === 3 ? styles.activeLbl : ''}`}>{s.l}</span>
                            </div>
                            {i < arr.length - 1 && (
                                <div className={`${styles.line} ${s.n < 3 ? styles.lineDone : ''}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.content}>
                    <div className={styles.processingBox}>
                        {popupClosed ? (
                            <>
                                <div className={styles.closedIcon}>🔒</div>
                                <h1 className={styles.processingTitle}>
                                    {language === 'id' ? 'Belum selesai bayar?' : 'Ready to complete payment?'}
                                </h1>
                                <p className={styles.processingSubtitle}>
                                    {language === 'id'
                                        ? 'Pendaftaran Anda masih tersimpan. Klik tombol di bawah untuk membayar.'
                                        : 'Your enrollment is still held. Click below to reopen the payment window.'}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className={styles.spinnerWrap}>
                                    <div className={styles.spinner} />
                                </div>
                                <h1 className={styles.processingTitle}>
                                    {loading ? 'Opening payment gateway…' : 'Redirecting to payment…'}
                                </h1>
                            </>
                        )}

                        {error && (
                            <div className={styles.errorBanner}>
                                <span>⚠️ {error}</span>
                            </div>
                        )}

                        <div className={styles.itemSummary}>
                           {items.map(item => (
                               <div key={`${item.courseId}-${item.dateId}`} className={styles.miniItem}>
                                   <span>{item.icon} {item.courseTitle}</span>
                                   <span>{language === 'id' ? `Rp ${item.priceIDR.toLocaleString('id-ID')}` : `RM ${item.priceMYR}`}</span>
                               </div>
                           ))}
                           <div className={styles.totalRow}>
                               <span>Total</span>
                               <span>{displayTotal}</span>
                           </div>
                           {currency === 'MYR' && (
                               <div className={styles.currencyNote}>
                                   * You will be charged approximately <strong>Rp {idrEquivalent.toLocaleString('id-ID')}</strong> (IDR)
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            </main>

            <div className={styles.footer}>
                <button
                    className={`${styles.payBtn} ${loading ? styles.payBtnLoading : ''}`}
                    onClick={popupClosed ? reopenSnap : handlePay}
                    disabled={loading}
                >
                    {loading ? 'Processing…' : popupClosed
                        ? (language === 'id' ? '💳 Bayar Sekarang' : '💳 Pay Now')
                        : (language === 'id' ? 'Tap untuk Bayar' : 'Tap to Pay')}
                </button>
                <p className={styles.secure}>🔒 {language === 'id' ? 'Transaksi aman & terenkripsi' : 'Secure & encrypted transaction'}</p>
            </div>
        </div>
    );
}

export default function GlobalPaymentPage() {
    return (
        <>
            <Script
                src="https://app.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="afterInteractive"
            />
            <Suspense fallback={null}>
                <PaymentContent />
            </Suspense>
        </>
    );
}
