'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

function ConfirmationContent() {
    const { language } = useLanguage();
    const searchParams = useSearchParams();

    const isID = language === 'id';

    // Optional: surface order details if passed via query params
    const orderId  = searchParams.get('orderId');
    const course   = searchParams.get('course');
    const date     = searchParams.get('date');

    const nextSteps = isID ? [
        'Cek email/WhatsApp — kami kirimkan detail akses dalam 5 menit',
        'Bergabung dengan grup komunitas yang kami kirimkan',
        'Siapkan perangkat Anda untuk sesi live',
        'Jika ada pertanyaan, hubungi kami di WhatsApp',
    ] : [
        'Check your email — we\'ll send access details within 5 minutes',
        'Look for the community group link in that email',
        'Prepare your device for the live session',
        'Questions? Reach us via the contact page or WhatsApp',
    ];

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.card} role="main">
                    <div className={styles.icon} aria-hidden="true">🎉</div>

                    <h1 className={styles.title}>
                        {isID ? 'Pembayaran Berhasil!' : 'You\'re enrolled!'}
                    </h1>

                    <p className={styles.subtitle}>
                        {isID
                            ? 'Pendaftaran Anda telah dikonfirmasi. Detail akses akan segera dikirimkan.'
                            : 'Your enrollment is confirmed. We\'ll send your access details shortly.'}
                    </p>

                    {/* Order / course details if available */}
                    {(orderId || course || date) && (
                        <div className={styles.orderDetails}>
                            {course && (
                                <div className={styles.orderRow}>
                                    <span className={styles.orderKey}>{isID ? 'Kursus' : 'Course'}</span>
                                    <span className={styles.orderVal}>{decodeURIComponent(course)}</span>
                                </div>
                            )}
                            {date && (
                                <div className={styles.orderRow}>
                                    <span className={styles.orderKey}>{isID ? 'Tanggal' : 'Date'}</span>
                                    <span className={styles.orderVal}>{decodeURIComponent(date)}</span>
                                </div>
                            )}
                            {orderId && (
                                <div className={styles.orderRow}>
                                    <span className={styles.orderKey}>Order ID</span>
                                    <code className={styles.orderCode}>{orderId}</code>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.nextSteps}>
                        <h2>{isID ? 'Langkah Selanjutnya:' : 'What happens next:'}</h2>
                        <ul>
                            {nextSteps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/dashboard" className="btn btn-primary btn-xl">
                            {isID ? 'Lihat Dashboard' : 'Go to Dashboard'}
                        </Link>
                        <Link href="/courses" className={styles.secondaryBtn}>
                            {isID ? 'Kursus Lainnya' : 'Browse more courses'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GlobalConfirmationPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '90vh' }} />}>
            <ConfirmationContent />
        </Suspense>
    );
}
