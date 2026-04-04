'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLanguage, Translate } from '@/components/LanguageContext';
import { formatPrice } from '@/lib/currency';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Trash2,
  Calendar,
  Clock,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  Check,
} from 'lucide-react';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import QRISPaymentBlock from '@/components/payment/QRISPaymentBlock';
import PayPalPaymentBlock from '@/components/payment/PayPalPaymentBlock';
import PaymentStatusBlock from '@/components/payment/PaymentStatusBlock';

type Step = 'summary' | 'details' | 'method' | 'payment';
type PaymentMethod = 'qris' | 'paypal' | null;

const STEPS: { key: Step; label: string }[] = [
  { key: 'summary', label: 'Order' },
  { key: 'details', label: 'Details' },
  { key: 'method', label: 'Payment' },
  { key: 'payment', label: 'Pay' },
];

const STEP_INDEX: Record<Step, number> = {
  summary: 0,
  details: 1,
  method: 2,
  payment: 3,
};

export default function CartPage() {
  const { items, removeItem, totalItems, clearCart, customerInfo, updateCustomerInfo } = useCart();
  const { language } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState<Step>('summary');
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  // Customer details form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);

  // Pre-fill from session / cart context
  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
    if (session?.user?.email && !email) setEmail(session.user.email);
    if (customerInfo.name && !name) setName(customerInfo.name);
    if (customerInfo.email && !email) setEmail(customerInfo.email);
    if (customerInfo.phone && !phone) setPhone(customerInfo.phone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const totalIDR = items.reduce((sum, item) => sum + item.priceIDR, 0);
  const displayTotal = formatPrice(totalIDR, 'IDR');

  const currentSlug = items[0]?.slug ?? '';

  // Step navigation
  const goBack = () => {
    const idx = STEP_INDEX[step];
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const validateDetails = () => {
    if (!name.trim() || name.trim().length < 2) {
      setDetailsError('Please enter your full name.');
      return false;
    }
    if (!email.trim() && !phone.trim()) {
      setDetailsError('Please provide at least an email or WhatsApp number.');
      return false;
    }
    setDetailsError(null);
    return true;
  };

  const handleContinueDetails = () => {
    if (!validateDetails()) return;
    updateCustomerInfo({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    setStep('method');
  };

  const handleContinueMethod = async () => {
    if (!method) return;
    if (method === 'qris') {
      setCreateOrderLoading(true);
      setCreateOrderError(null);
      try {
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            currency: 'IDR',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not create order');
        setOrderId(data.orderId);
      } catch (err: any) {
        setCreateOrderError(err.message || 'Something went wrong. Please try again.');
        return;
      } finally {
        setCreateOrderLoading(false);
      }
    }
    setStep('payment');
  };

  // Empty cart state
  if (totalItems === 0 && !paid) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <div className={styles.emptyIconContainer}>
              <ShoppingCart size={48} className={styles.emptyIcon} strokeWidth={1.5} />
            </div>
            <h1><Translate tKey="cart.empty" defaultText="Your cart is empty" /></h1>
            <p><Translate tKey="cart.emptySub" defaultText="Unlock your potential with expert-led training." /></p>
            <Link href="/courses" className="btn btn-primary btn-xl">
              <Translate tKey="cart.browse" defaultText="Browse Courses" />{' '}
              <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = STEP_INDEX[step];

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          {currentIdx > 0 ? (
            <button type="button" className={styles.backLink} onClick={goBack}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <Link href="/courses" className={styles.backLink}>
              <ChevronLeft size={16} /> <Translate tKey="cart.back" defaultText="Back to Courses" />
            </Link>
          )}
          <h1 className={styles.pageTitle}>Checkout</h1>
        </div>

        {/* Step progress */}
        <div className={styles.progress}>
          {STEPS.map((s, i) => {
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            return (
              <React.Fragment key={s.key}>
                <div className={styles.progressStep}>
                  <div className={`${styles.stepBubble} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}>
                    {isDone ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step content */}
        <div className={styles.layout}>
          <div className={styles.main}>
            <div key={step} className={styles.stepContent}>

              {/* ── Step 1: Order Summary ── */}
              {step === 'summary' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Your Order</h2>
                  <div className={styles.itemList}>
                    {items.map((item) => (
                      <div key={`${item.courseId}-${item.dateId}`} className={styles.cartItem}>
                        <div className={styles.itemMain}>
                          <div className={styles.itemIcon}>{item.icon}</div>
                          <div className={styles.itemInfo}>
                            <h3>{item.courseTitle}</h3>
                            <div className={styles.itemMeta}>
                              <span className={styles.metaItem}><Calendar size={14} /> {item.dateLabel}</span>
                              <span className={styles.metaItem}><Clock size={14} /> {item.timeLabel}</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.itemActions}>
                          <div className={styles.itemPrice}>{formatPrice(item.priceIDR, 'IDR')}</div>
                          <button
                            className={styles.removeBtn}
                            onClick={() => removeItem(item.courseId, item.dateId)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary btn-xl btn-full"
                    style={{ marginTop: '8px' }}
                    onClick={() => setStep('details')}
                  >
                    Continue to Details <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* ── Step 2: Customer Details ── */}
              {step === 'details' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Your Details</h2>
                  <div className={styles.form}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        className={styles.input}
                        type="text"
                        placeholder="e.g. Budi Santoso"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        className={styles.input}
                        type="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="phone">
                        WhatsApp Number <span className={styles.labelHint}>(for enrollment confirmation)</span>
                      </label>
                      <input
                        id="phone"
                        className={styles.input}
                        type="tel"
                        inputMode="tel"
                        placeholder="e.g. 0812 3456 7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                    {detailsError && <p className={styles.fieldError}>{detailsError}</p>}
                  </div>
                  <button
                    className="btn btn-primary btn-xl btn-full"
                    style={{ marginTop: '8px' }}
                    onClick={handleContinueDetails}
                  >
                    Continue to Payment <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* ── Step 3: Payment Method ── */}
              {step === 'method' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Choose Payment Method</h2>
                  <PaymentMethodSelector selected={method} onSelect={setMethod} />
                  {createOrderError && <p className={styles.fieldError}>{createOrderError}</p>}
                  <button
                    className="btn btn-primary btn-xl btn-full"
                    style={{ marginTop: '8px', opacity: method ? 1 : 0.45 }}
                    onClick={handleContinueMethod}
                    disabled={!method || createOrderLoading}
                  >
                    {createOrderLoading ? 'Preparing order...' : <>Continue <ArrowRight size={18} /></>}
                  </button>
                </div>
              )}

              {/* ── Step 4: Payment ── */}
              {step === 'payment' && !paid && (
                <div className={styles.section}>
                  {method === 'qris' && orderId ? (
                    <QRISPaymentBlock
                      orderId={orderId}
                      amountIDR={totalIDR}
                      onPaid={() => { clearCart(); setPaid(true); }}
                    />
                  ) : method === 'qris' && !orderId ? (
                    <p className={styles.fieldError}>Order could not be created. Please go back and try again.</p>
                  ) : (
                    <PayPalPaymentBlock />
                  )}
                </div>
              )}

              {/* ── Paid: Status ── */}
              {paid && orderId && (
                <PaymentStatusBlock orderId={orderId} slug={currentSlug} />
              )}

            </div>
          </div>

          {/* Order summary sidebar */}
          {step !== 'payment' && !paid && (
            <div className={styles.sidebar}>
              <div className={styles.summaryBox}>
                <h2 className={styles.summaryTitle}>
                  <Translate tKey="summary.title" defaultText="Order Summary" />
                </h2>
                <div className={styles.summaryRow}>
                  <span><Translate tKey="cart.subtotal" defaultText="Subtotal" /> ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span>{displayTotal}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span><Translate tKey="cart.platformFee" defaultText="Platform Fee" /></span>
                  <span className={styles.freeBadge}>FREE</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span><Translate tKey="cart.total" defaultText="Total" /></span>
                  <span>{displayTotal}</span>
                </div>
                <div className={styles.secureBadge}>
                  <ShieldCheck size={15} />
                  <span>Secure Checkout</span>
                </div>
              </div>
              <Link href="/courses" className={styles.addMoreLink}>
                + <Translate tKey="cart.addMore" defaultText="Add another course" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      {step !== 'payment' && !paid && (
        <div className={styles.mobileStickyFooter}>
          <div className={styles.mobileFooterContent}>
            <div className={styles.mobileTotalInfo}>
              <span className={styles.mobileTotalLabel}>Total</span>
              <span className={styles.mobileTotalPrice}>{displayTotal}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}
              onClick={() => {
                if (step === 'summary') setStep('details');
                else if (step === 'details') handleContinueDetails();
                else if (step === 'method') handleContinueMethod();
              }}
              disabled={step === 'method' && (!method || createOrderLoading)}
            >
              {step === 'method' && createOrderLoading ? '...' : language === 'id' ? 'Lanjut' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
