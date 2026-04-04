'use client';
import { useState } from 'react';
import styles from './PaymentsView.module.css';

interface PaymentRecord {
  id: string;
  externalId: string;
  status: string;
  provider: string;
  amount: number;
  currency: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  student: { id: string; name: string; email: string; phone: string };
}

type Tab = 'review' | 'paypal' | 'approved' | 'rejected' | 'all';

function formatAmount(amount: number, currency: string) {
  if (currency === 'IDR') return `Rp ${amount.toLocaleString('id-ID')}`;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusLabel(s: string) {
  if (s === 'UNDER_REVIEW' || s === 'PAYMENT_UPLOADED') return '🕐 Under Review';
  if (s === 'PAID') return '✅ Approved';
  if (s === 'FAILED') return '❌ Rejected';
  if (s === 'PENDING') return '⏳ Pending';
  return s;
}

export default function PaymentsView({ payments: initial }: { payments: PaymentRecord[] }) {
  const [payments, setPayments] = useState<PaymentRecord[]>(initial);
  const [tab, setTab] = useState<Tab>('review');
  const [loading, setLoading] = useState<Record<string, 'approve' | 'reject' | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<string | null>(null);

  const reviewCount = payments.filter(
    (p) => p.status === 'UNDER_REVIEW' || p.status === 'PAYMENT_UPLOADED'
  ).length;

  const paypalPendingCount = payments.filter(
    (p) => p.provider === 'PAYPAL' && p.status === 'PENDING'
  ).length;

  const filtered = payments.filter((p) => {
    if (tab === 'review') return (p.status === 'UNDER_REVIEW' || p.status === 'PAYMENT_UPLOADED') && p.provider !== 'PAYPAL';
    if (tab === 'paypal') return p.provider === 'PAYPAL';
    if (tab === 'approved') return p.status === 'PAID';
    if (tab === 'rejected') return p.status === 'FAILED';
    return true;
  });

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setLoading((l) => ({ ...l, [id]: action }));
    setErrors((e) => ({ ...e, [id]: '' }));
    try {
      const res = await fetch(`/api/admin/payments/${id}/${action}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setErrors((e) => ({ ...e, [id]: data.error || 'Failed' }));
        return;
      }
      const newStatus = action === 'approve' ? 'PAID' : 'FAILED';
      setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    } catch {
      setErrors((e) => ({ ...e, [id]: 'Network error' }));
    } finally {
      setLoading((l) => ({ ...l, [id]: null }));
    }
  }

  function cardClass(status: string) {
    if (status === 'UNDER_REVIEW' || status === 'PAYMENT_UPLOADED') return `${styles.card} ${styles.cardReview}`;
    if (status === 'PAID') return `${styles.card} ${styles.cardApproved}`;
    if (status === 'FAILED') return `${styles.card} ${styles.cardRejected}`;
    return styles.card;
  }

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>Review and approve QRIS receipts · target: within 30 min</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={tab === 'review' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('review')}
        >
          Needs Review
          {reviewCount > 0 && <span className={styles.badge}>{reviewCount}</span>}
        </button>
        <button
          className={tab === 'paypal' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('paypal')}
        >
          PayPal
          {paypalPendingCount > 0 && <span className={styles.badge}>{paypalPendingCount}</span>}
        </button>
        <button
          className={tab === 'approved' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('approved')}
        >
          Approved
        </button>
        <button
          className={tab === 'rejected' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('rejected')}
        >
          Rejected
        </button>
        <button
          className={tab === 'all' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('all')}
        >
          All ({payments.length})
        </button>
      </div>

      {/* Cards */}
      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <span>No payments in this category</span>
          </div>
        )}
        {filtered.map((p) => {
          const meta = p.metadata ?? {};
          const receiptUrl = meta.receiptUrl as string | undefined;
          const cartDetails = meta.cartDetails as Array<{ courseTitle?: string; price?: number; dateLabel?: string; timeLabel?: string }> | undefined;
          const courseTitle = cartDetails?.[0]?.courseTitle ?? '—';
          const dateLabel = cartDetails?.[0]?.dateLabel ?? '';
          const timeLabel = cartDetails?.[0]?.timeLabel ?? '';
          const customerPhone = meta.customerPhone as string | undefined;
          const isActionable = p.status === 'UNDER_REVIEW' || p.status === 'PAYMENT_UPLOADED' || (p.provider === 'PAYPAL' && p.status === 'PENDING');
          const isPdf = receiptUrl?.toLowerCase().endsWith('.pdf');

          return (
            <div key={p.id} className={cardClass(p.status)}>
              {/* Top row */}
              <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                  <span className={styles.providerBadge}>{p.provider}</span>
                  <span className={styles.orderId}>{p.externalId || p.id}</span>
                </div>
                <span className={`${styles.statusChip} ${styles['status' + p.status]}`}>
                  {statusLabel(p.status)}
                </span>
              </div>

              {/* Student info */}
              <div className={styles.studentRow}>
                <span className={styles.studentName}>{p.student.name || '(no name)'}</span>
                <span className={styles.dot}>·</span>
                <span className={styles.studentEmail}>{p.student.email}</span>
                {customerPhone && (
                  <>
                    <span className={styles.dot}>·</span>
                    <span className={styles.studentPhone}>{customerPhone}</span>
                  </>
                )}
              </div>

              {/* Course + amount + date */}
              <div className={styles.metaRow}>
                <span className={styles.metaCourse}>
                  📅 <strong>{courseTitle}</strong>
                  {dateLabel && <span className={styles.metaSchedule}> · {dateLabel}</span>}
                  {timeLabel && <span className={styles.metaSchedule}> · {timeLabel}</span>}
                </span>
                <span className={styles.metaAmount}>{formatAmount(p.amount, p.currency)}</span>
                <span className={styles.metaDate}>{formatDate(p.createdAt)}</span>
              </div>

              {/* Receipt */}
              {receiptUrl ? (
                <div className={styles.receiptRow}>
                  {isPdf ? (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.receiptPdf}
                    >
                      📄 View Receipt PDF
                    </a>
                  ) : (
                    <img
                      src={receiptUrl}
                      alt="Receipt"
                      className={styles.receiptThumb}
                      onClick={() => setLightbox(receiptUrl)}
                    />
                  )}
                </div>
              ) : (
                isActionable && (
                  <div className={styles.noReceipt}>No receipt uploaded yet</div>
                )
              )}

              {/* Actions */}
              {isActionable && p.provider === 'PAYPAL' && p.status === 'PENDING' && (
                <div className={styles.paypalNote}>
                  💳 Check your <strong>PayPal dashboard</strong> to verify this payment before confirming.
                </div>
              )}
              {isActionable && (
                <div className={styles.actions}>
                  <button
                    className={styles.approveBtn}
                    disabled={!!loading[p.id]}
                    onClick={() => handleAction(p.id, 'approve')}
                  >
                    {loading[p.id] === 'approve' ? (
                      <span className={styles.spinner} />
                    ) : p.provider === 'PAYPAL' ? '✅ Confirm Paid' : '✅ Approve'}
                  </button>
                  <button
                    className={styles.rejectBtn}
                    disabled={!!loading[p.id]}
                    onClick={() => handleAction(p.id, 'reject')}
                  >
                    {loading[p.id] === 'reject' ? (
                      <span className={styles.spinner} />
                    ) : '❌ Reject'}
                  </button>
                </div>
              )}
              {errors[p.id] && <p className={styles.errorMsg}>{errors[p.id]}</p>}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <img
            src={lightbox}
            alt="Receipt full size"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
