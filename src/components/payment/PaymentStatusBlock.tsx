'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './PaymentStatusBlock.module.css';

interface PaymentStatusBlockProps {
  orderId: string;
  slug: string;
}

export default function PaymentStatusBlock({ orderId, slug }: PaymentStatusBlockProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'UNDER_REVIEW' | 'PAID' | 'FAILED'>('UNDER_REVIEW');

  useEffect(() => {
    if (status === 'PAID' || status === 'FAILED') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderId}`);
        const data = await res.json();
        if (data.status === 'PAID') {
          setStatus('PAID');
          clearInterval(interval);
          router.push(`/courses/${slug}/confirmation?method=qris&paid=1`);
        } else if (data.status === 'FAILED') {
          setStatus('FAILED');
          clearInterval(interval);
        }
      } catch {
        // silently retry
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [status, orderId, slug, router]);

  const waLink = `https://wa.me/628211704707?text=${encodeURIComponent(`Hi, I just submitted payment for order ${orderId}. Please verify when ready.`)}`;
  const waRejectLink = `https://wa.me/628211704707?text=${encodeURIComponent(`Hi, my payment for order ${orderId} was not verified. Can you help me resubmit?`)}`;

  if (status === 'FAILED') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.ringWrapper}>
          <div className={`${styles.ring} ${styles.ringFailed}`}>
            <span className={styles.ringIcon}>❌</span>
          </div>
        </div>

        <div className={styles.text}>
          <h2 className={styles.title}>Payment Not Verified</h2>
          <p className={styles.subtitle}>
            Unfortunately, we could not verify your payment receipt. This may be due to an unreadable image or a payment amount mismatch.
          </p>
        </div>

        <div className={styles.orderBox}>
          <span className={styles.orderLabel}>Order ID</span>
          <span className={styles.orderId}>{orderId}</span>
        </div>

        <div className={styles.actions}>
          <a
            href={waRejectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg btn-full"
          >
            💬 Contact Support on WhatsApp
          </a>
          <Link href="/cart" className="btn btn-secondary btn-lg btn-full">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.ringWrapper}>
        <div className={styles.ring}>
          <span className={styles.ringIcon}>⏳</span>
        </div>
      </div>

      <div className={styles.text}>
        <h2 className={styles.title}>Payment Under Review</h2>
        <p className={styles.subtitle}>
          Your receipt has been received. Our team will verify your payment within{' '}
          <strong>5–30 minutes</strong>.
        </p>
      </div>

      <div className={styles.orderBox}>
        <span className={styles.orderLabel}>Order ID</span>
        <span className={styles.orderId}>{orderId}</span>
      </div>

      <p className={styles.waNote}>
        We&apos;ll notify you via WhatsApp once confirmed.
      </p>

      <div className={styles.actions}>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg btn-full"
        >
          💬 Chat on WhatsApp
        </a>
        <Link href="/courses" className="btn btn-secondary btn-lg btn-full">
          Browse Other Courses
        </Link>
      </div>

      <p className={styles.autoCheck}>
        This page checks for confirmation automatically every 30 seconds.
      </p>
    </div>
  );
}
