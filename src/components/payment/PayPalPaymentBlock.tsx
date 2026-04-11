'use client';
import { trackConversion } from '@/lib/analytics';
import styles from './PayPalPaymentBlock.module.css';

interface PayPalPaymentBlockProps {
  items: { courseTitle: string; paypalUrl: string }[];
}

export default function PayPalPaymentBlock({ items }: PayPalPaymentBlockProps) {
  const single = items.length === 1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.trustRow}>
        <span className={styles.trustBadge}>🔒 256-bit SSL</span>
        <span className={styles.trustBadge}>💳 Card accepted</span>
        <span className={styles.trustBadge}>✅ Auto-confirmed</span>
      </div>

      <p className={styles.note}>
        Click below to pay securely. Your enrollment is confirmed automatically after payment.
      </p>

      <div className={styles.links}>
        {items.map((item) => (
          <a
            key={item.paypalUrl}
            href={item.paypalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.paypalBtn}
            onClick={() => trackConversion('payment_paypal')}
          >
            {/* PayPal two-tone wordmark */}
            <div className={styles.ppMark} aria-label="PayPal">
              <span>Pay</span><span>Pal</span>
            </div>
            <div className={styles.btnInner}>
              <span className={styles.btnLabel}>
                {single ? 'Pay Now' : `Pay for ${item.courseTitle}`}
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className={styles.currency}>
        Processed in USD by PayPal · No PayPal account required
      </p>
    </div>
  );
}
