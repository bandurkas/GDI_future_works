'use client';
import styles from './PaymentMethodSelector.module.css';

interface PaymentMethodSelectorProps {
  selected: 'qris' | 'paypal' | null;
  onSelect: (method: 'qris' | 'paypal') => void;
}

function QrisLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill="#1A4FA0" />
      <text x="18" y="24" textAnchor="middle" fill="white" fontFamily="sans-serif" fontSize="13" fontWeight="bold">QR</text>
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill="#003087" />
      <text x="18" y="24" textAnchor="middle" fill="#009CDE" fontFamily="sans-serif" fontSize="13" fontWeight="bold">PP</text>
    </svg>
  );
}

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className={styles.wrapper}>
      {/* QRIS Card */}
      <button
        type="button"
        className={`${styles.card} ${selected === 'qris' ? styles.selected : ''}`}
        onClick={() => onSelect('qris')}
      >
        <div className={styles.cardMain}>
          <div className={styles.cardIcon}><QrisLogo /></div>
          <div className={styles.cardInfo}>
            <div className={styles.cardTitle}>QRIS / GoPay</div>
            <div className={styles.cardSub}>Pay via GoPay, OVO, Dana, or any bank app</div>
            <div className={styles.cardMeta}>Instant · IDR only</div>
          </div>
          <div className={`${styles.radio} ${selected === 'qris' ? styles.radioSelected : ''}`} />
        </div>
        <div className={styles.details}>
          <ul className={styles.detailList}>
            <li>Scan QR from GoPay or any banking app</li>
            <li>Upload receipt to confirm</li>
            <li>Admin verifies within 5–30 min</li>
          </ul>
        </div>
      </button>

      {/* PayPal Card */}
      <button
        type="button"
        className={`${styles.card} ${selected === 'paypal' ? styles.selected : ''}`}
        onClick={() => onSelect('paypal')}
      >
        <div className={styles.cardMain}>
          <div className={styles.cardIcon}><PayPalLogo /></div>
          <div className={styles.cardInfo}>
            <div className={styles.cardTitle}>PayPal</div>
            <div className={styles.cardSub}>Pay with credit/debit card or PayPal balance</div>
            <div className={styles.cardMeta}>Auto-confirmed · USD</div>
          </div>
          <div className={`${styles.radio} ${selected === 'paypal' ? styles.radioSelected : ''}`} />
        </div>
      </button>
    </div>
  );
}
