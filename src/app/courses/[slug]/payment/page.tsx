'use client';
import { useState, use, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { getCourseBySlug } from '@/data/courses';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };


// Inner component — must be separate so <Suspense> can wrap useSearchParams()
function PaymentContent({ slug }: { slug: string }) {
    const course = getCourseBySlug(slug);
    const [loading, setLoading] = useState(false);
    const [popupClosed, setPopupClosed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Cache token so reopenSnap() can reuse it without a new API call
    const snapTokenRef = useRef<string | null>(null);
    const { language } = useLanguage();
    const searchParams = useSearchParams();

    // Fix #14 — read customer data from URL params (set by checkout page)
    const customerName = searchParams.get('n') || 'Student';
    const customerPhone = searchParams.get('p') || '';

    const displayPrice = language === 'id'
        ? `Rp ${course?.priceIDR.toLocaleString('id-ID')}`
        : `RM ${course?.priceMYR}`;

    // Fix #2 — handlePay defined with useCallback before useEffect so no stale closure
    const handlePay = useCallback(async () => {
        if (loading || !course) return;
        setLoading(true);
        setError(null);
        setPopupClosed(false);

        try {
            const res = await fetch('/api/tokenize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Fix #10 — only send id + customer info; price is now server-side
                body: JSON.stringify({ id: course.id, customerName, customerPhone }),
            });
            const data = await res.json();

            if (!data.token) {
                setError('Could not start payment. Please try again.');
                setLoading(false);
                return;
            }

            if (typeof window.snap === 'undefined') {
                setError('Payment gateway is still loading. Please wait a moment and try again.');
                setLoading(false);
                return;
            }

            // Cache token so reopenSnap() can reuse it without a new API call
            snapTokenRef.current = data.token;

            window.snap.pay(data.token, {
                onSuccess: () => {
                    window.location.href = `/courses/${slug}/confirmation`;
                },
                onPending: () => {
                    setError('Payment is pending. We\'ll notify you once confirmed.');
                    setLoading(false);
                },
                onError: () => {
                    setError('Payment failed. Please try again or use a different method.');
                    setLoading(false);
                },
                // Normal behavior: popup closes, user sees page with Pay Now button
                onClose: () => {
                    setLoading(false);
                    setPopupClosed(true);
                },
            });
        } catch {
            setError('A network error occurred. Please check your connection and try again.');
            setLoading(false);
        }
    }, [loading, course, customerName, customerPhone, slug]);

    // Reopen popup using cached token — no new API call, no new order created
    const reopenSnap = useCallback(() => {
        if (!snapTokenRef.current || typeof window.snap === 'undefined') {
            handlePay(); // fallback: fetch a fresh token
            return;
        }
        setPopupClosed(false);
        setError(null);
        window.snap.pay(snapTokenRef.current, {
            onSuccess: () => {
                window.location.href = `/courses/${slug}/confirmation`;
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
    }, [slug, handlePay]);


    if (!course) return null;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href={`/courses/${slug}/checkout`} className={styles.cancelBtn}>← Back</Link>
                <div className={styles.headerTitle}>Checkout</div>
                <div className={styles.headerSpacer} />
            </header>

            <main className={styles.main}>
                {/* Step indicator */}
                <div className={styles.progressRow}>
                    {[
                        { n: 1, l: 'Select Time' },
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
                    {popupClosed ? (
                        // User closed the popup — show course summary with Pay Now button
                        <div className={styles.processingBox}>
                            <div className={styles.closedIcon}>🔒</div>
                            <h1 className={styles.processingTitle}>
                                {language === 'id' ? 'Belum selesai bayar?' : 'Ready to complete payment?'}
                            </h1>
                            <p className={styles.processingSubtitle}>
                                {language === 'id'
                                    ? 'Tempat Anda masih tersimpan. Klik tombol di bawah untuk melanjutkan.'
                                    : 'Your spot is still held. Click below to reopen the payment window.'}
                            </p>

                            {error && (
                                <div className={styles.errorBanner} role="alert">
                                    <span>⚠️ {error}</span>
                                </div>
                            )}

                            <div className={styles.coursePreview}>
                                <span className={styles.courseIcon}>{course.icon}</span>
                                <div>
                                    <p className={styles.courseName}>{course.title}</p>
                                    <p className={styles.coursePrice}>{displayPrice}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Popup is loading / open
                        <div className={styles.processingBox}>
                            <div className={styles.spinnerWrap}>
                                <div className={styles.spinner} />
                            </div>
                            <h1 className={styles.processingTitle}>
                                {loading ? 'Opening payment gateway…' : 'Redirecting to payment…'}
                            </h1>
                            <p className={styles.processingSubtitle}>
                                {language === 'id'
                                    ? 'Pembayaran diproses secara aman melalui Midtrans.'
                                    : 'Your payment is processed securely through Midtrans.'}
                            </p>

                            {/* Fix #3 — in-page error banner instead of alert() */}
                            {error && (
                                <div className={styles.errorBanner} role="alert">
                                    <span>⚠️ {error}</span>
                                </div>
                            )}

                            <div className={styles.coursePreview}>
                                <span className={styles.courseIcon}>{course.icon}</span>
                                <div>
                                    <p className={styles.courseName}>{course.title}</p>
                                    <p className={styles.coursePrice}>{displayPrice}</p>
                                </div>
                            </div>
                        </div>
                    )}
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

// Outer page — wraps PaymentContent in Suspense so useSearchParams() hydrates correctly
// snap.js is loaded here (not in layout) — keeps 689KB off every other page
export default function PaymentPage({ params }: Props) {
    const { slug } = use(params);
    return (
        <>
            <Script
                src="https://app.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="afterInteractive"
            />
            <Suspense fallback={null}>
                <PaymentContent slug={slug} />
            </Suspense>
        </>
    );
}
