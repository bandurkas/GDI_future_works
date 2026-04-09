'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import styles from './PaymentStatusBlock.module.css';

interface PaymentStatusBlockProps {
  orderId: string;
  slug: string;
  provider?: 'qris' | 'paypal';
}

export default function PaymentStatusBlock({ orderId, provider = 'qris' }: PaymentStatusBlockProps) {
  const [status, setStatus] = useState<'UNDER_REVIEW' | 'PAID' | 'FAILED'>('UNDER_REVIEW');
  const { trackLead } = useMetaPixel();

  useEffect(() => {
    if (status === 'PAID' || status === 'FAILED') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderId}`);
        const data = await res.json();
        if (data.status === 'PAID') {
          setStatus('PAID');
          clearInterval(interval);
        } else if (data.status === 'FAILED') {
          setStatus('FAILED');
          clearInterval(interval);
        }
      } catch {
        // silently retry
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [status, orderId]);

  const waLink = `/api/whatsapp?text=${encodeURIComponent(`Hi, I just submitted payment for order ${orderId}. Please verify when ready.`)}`;
  const waRejectLink = `/api/whatsapp?text=${encodeURIComponent(`Hi, my payment for order ${orderId} was not verified. Can you help me resubmit?`)}`;

  /* ── PAID: green checkmark ── */
  if (status === 'PAID') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.ringWrapper}>
          <div className={`${styles.ring} ${styles.ringSuccess}`}>
            <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className={styles.text}>
          <h2 className={styles.title}>Thank you! Your payment is being verified.</h2>
          <p className={styles.subtitle}>Our team will contact you shortly with:</p>
          <ul className={styles.contactList}>
            <li>Enrollment confirmation</li>
            <li>Next steps</li>
            <li>Class access link</li>
          </ul>
          <p className={styles.verifyNote}>Verification usually takes a short time.</p>
        </div>

        <div className={styles.orderBox}>
          <span className={styles.orderLabel}>Order ID</span>
          <span className={styles.orderId}>{orderId}</span>
        </div>

        <div className={styles.actions}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg btn-full" onClick={() => trackLead('payment_status_wa')}>
            💬 Chat on WhatsApp
          </a>
          <Link href="/courses" className="btn btn-secondary btn-lg btn-full">
            Browse Other Courses
          </Link>
        </div>
      </div>
    );
  }

  /* ── FAILED: red ── */
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
          <a href={waRejectLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg btn-full" onClick={() => trackLead('payment_status_wa_reject')}>
            💬 Contact Support on WhatsApp
          </a>
          <Link href="/cart" className="btn btn-secondary btn-lg btn-full">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  /* ── UNDER_REVIEW: amber hourglass (default) ── */
  return (
    <div className={styles.wrapper}>
      <div className={styles.ringWrapper}>
        <div className={`${styles.ring} ${styles.ringPending}`}>
          <span className={styles.ringIcon}>⏳</span>
        </div>
      </div>

      <div className={styles.text}>
        <h2 className={styles.title}>Payment Under Review</h2>
        <p className={styles.subtitle}>
          {provider === 'paypal'
            ? <>Your PayPal payment is being confirmed. This usually happens automatically within a few minutes.</>
            : <>Your receipt has been submitted. Our team will verify your payment within <strong>5–30 minutes</strong> and send a WhatsApp confirmation.</>}
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
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg btn-full" onClick={() => trackLead('payment_status_wa_pending')}>
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
