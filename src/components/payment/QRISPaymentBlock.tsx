'use client';
import { useState } from 'react';
import { Download, CheckCircle, Loader2 } from 'lucide-react';
import { trackConversion } from '@/lib/analytics';
import ReceiptUploader from './ReceiptUploader';
import styles from './QRISPaymentBlock.module.css';

interface QRISPaymentBlockProps {
  orderId: string;
  amountIDR: number;
  onPaid: () => void;
}

export default function QRISPaymentBlock({ orderId, amountIDR, onPaid }: QRISPaymentBlockProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountIDR).replace('Rp', 'Rp ');

  const handlePaid = async () => {
    if (!receiptFile) {
      setError('Please upload your payment receipt first.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', receiptFile);
      formData.append('orderId', orderId);

      const uploadRes = await fetch('/api/payment/upload-receipt', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) {
        const d = await uploadRes.json();
        throw new Error(d.error || 'Upload failed');
      }

      const confirmRes = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!confirmRes.ok) {
        const d = await confirmRes.json();
        throw new Error(d.error || 'Confirmation failed');
      }

      // Track successful receipt upload as Lead
      trackConversion('payment_qris');

      onPaid();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Scan to Pay</h3>
        <p className={styles.subtitle}>Open GoPay, OVO, Dana, or your bank app and tap "Scan QR"</p>
      </div>

      <div className={styles.qrContainer}>
        <div className={styles.qrFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/qris-gdi.png"
            alt="QRIS Payment QR Code"
            width={240}
            height={240}
            className={styles.qrImage}
          />
        </div>
        <div className={styles.amountBadge}>
          <span className={styles.amountLabel}>Total to pay</span>
          <span className={styles.amount}>{formattedAmount}</span>
        </div>
        <a href="/assets/qris-gdi.png" download="qris-gdi-futureworks.png" className={styles.downloadLink}>
          <Download size={13} />
          Download QR (for mobile users)
        </a>
      </div>

      <ol className={styles.steps}>
        {[
          'Open GoPay, OVO, Dana, or your banking app',
          'Tap "Scan QR" or "Pay"',
          'Scan the QR code above and complete payment',
          'Screenshot the receipt and upload it below',
        ].map((step, i) => (
          <li key={i} className={styles.step}>
            <div className={styles.stepNum}>{i + 1}</div>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className={styles.uploadSection}>
        <p className={styles.uploadLabel}>Upload Payment Receipt</p>
        <ReceiptUploader onFileSelect={setReceiptFile} file={receiptFile} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="button"
        className={`btn btn-primary btn-xl btn-full ${styles.paidBtn}`}
        onClick={handlePaid}
        disabled={!receiptFile || loading}
      >
        {loading ? (
          <><Loader2 size={18} className={styles.spin} /> Submitting...</>
        ) : (
          <><CheckCircle size={18} /> I&apos;ve Already Paid</>
        )}
      </button>
    </div>
  );
}
