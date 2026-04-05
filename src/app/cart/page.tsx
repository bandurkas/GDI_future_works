'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLanguage, Translate } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice, convertToIdr } from '@/lib/currency';
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


const PAYPAL_LINKS: Record<string, string> = {
  'data-analytics':              'https://www.paypal.com/ncp/payment/7R89GWTZY6T42',
  'python-programming':          'https://www.paypal.com/ncp/payment/SQ9SHMYL8U258',
  'graphic-design-ai':           'https://www.paypal.com/ncp/payment/V3RUE3TLKDRRQ',
  'llm-ai-engineering':          'https://www.paypal.com/ncp/payment/U2EP8SMF6YRX2',
  'intermediate-data-analytics': 'https://www.paypal.com/ncp/payment/ADWNHE46RYBT8',
  'advanced-data-analytics':     'https://www.paypal.com/ncp/payment/QR4U3B4T9QEGG',
};

export default function CartPage() {
  const { items, removeItem, totalItems, clearCart, customerInfo, updateCustomerInfo } = useCart();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState<Step>('summary');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paidSlug, setPaidSlug] = useState<string>('');
  const [removeToast, setRemoveToast] = useState<string | null>(null);
  const removeToastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRemoveItem = (courseId: string, dateId: string, title: string) => {
    removeItem(courseId, dateId);
    if (removeToastTimer.current) clearTimeout(removeToastTimer.current);
    setRemoveToast(title);
    removeToastTimer.current = setTimeout(() => setRemoveToast(null), 3000);
  };

  // Customer details form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+62');
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'details') {
      setTimeout(() => nameInputRef.current?.focus(), 320); // after slide animation
    }
  }, [step]);

  const nameInvalid  = touched.name  && name.trim().length < 2;
  const emailInvalid = touched.email && (!email.trim() || !email.includes('@'));
  const phoneInvalid = touched.phone && phone.trim().length < 6;
  const phoneEmpty   = touched.phone && !phone.trim();
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
  const totalMYR = items.reduce((sum, item) => sum + item.priceMYR, 0);
  const displayTotal = currency === 'MYR'
    ? formatPrice(totalMYR, 'MYR')
    : formatPrice(totalIDR, 'IDR');
  // QRIS/Midtrans always charges in IDR — convert MYR if needed
  const chargeAmountIDR = currency === 'MYR' ? convertToIdr(totalMYR, 'MYR') : totalIDR;

  const currentSlug = items[0]?.slug ?? '';

  // Step navigation
  const goBack = () => {
    const idx = STEP_INDEX[step];
    if (idx > 0) { setDirection('back'); setStep(STEPS[idx - 1].key); }
  };

  const validateDetails = () => {
    const allTouched = { name: true, email: true, phone: true };
    setTouched(allTouched);
    if (!name.trim() || name.trim().length < 2) {
      setDetailsError(language === 'id' ? 'Masukkan nama lengkap Anda.' : 'Please enter your full name.');
      setTimeout(() => document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return false;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setDetailsError(language === 'id' ? 'Nomor telepon diperlukan untuk konfirmasi kelas.' : 'Phone number is required to confirm your class.');
      setTimeout(() => document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setDetailsError(language === 'id' ? 'Email wajib diisi untuk mengirim invoice.' : 'Email is required to send your invoice.');
      setTimeout(() => document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return false;
    }
    setDetailsError(null);
    return true;
  };

  const handleContinueDetails = () => {
    if (!validateDetails()) return;
    const fullPhone = phone.trim() ? `${countryCode}${phone.trim().replace(/^0/, '')}` : '';
    updateCustomerInfo({ name: name.trim(), email: email.trim(), phone: fullPhone });
    setDirection('forward');
    setStep('method');
  };

  const handleContinueMethod = async () => {
    if (!method) return;
    setCreateOrderLoading(true);
    setCreateOrderError(null);
    try {
      if (method === 'qris') {
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            currency: 'IDR', // Midtrans always processes IDR
            displayCurrency: currency,
            chargeAmountIDR,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not create order');
        setOrderId(data.orderId);
      } else if (method === 'paypal') {
        const res = await fetch('/api/payment/create-paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((item: any) => ({
              ...item,
              paypalUrl: PAYPAL_LINKS[item.courseId] ?? PAYPAL_LINKS[item.slug] ?? '#',
            })),
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not register order');
        setOrderId(data.orderId);
        // Open each PayPal link directly — skip the Pay step
        setPaidSlug(currentSlug);
        items.forEach((item: any) => {
          const url = PAYPAL_LINKS[item.courseId] ?? PAYPAL_LINKS[item.slug];
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
        setCreateOrderLoading(false);
        setDirection('forward');
        setStep('payment');
        return;
      }
    } catch (err: any) {
      setCreateOrderError(err.message || 'Something went wrong. Please try again.');
      return;
    } finally {
      setCreateOrderLoading(false);
    }
    setDirection('forward');
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
        <div className={`${styles.progress} ${(step === 'payment' || paid) ? styles.progressCentered : ''}`}>
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
        <div className={`${styles.layout} ${(step === 'payment' || paid) ? styles.layoutCentered : ''}`}>
          <div className={styles.main}>
            <div key={step} className={`${styles.stepContent} ${direction === 'back' ? styles.stepContentBack : styles.stepContentForward}`}>

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
                          <div className={styles.itemPrice}>
                            {currency === 'MYR'
                              ? formatPrice(item.priceMYR, 'MYR')
                              : formatPrice(item.priceIDR, 'IDR')}
                          </div>
                          <button
                            className={styles.removeBtn}
                            onClick={() => handleRemoveItem(item.courseId, item.dateId, item.courseTitle)}
                            aria-label={`Remove ${item.courseTitle} from cart`}
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
                    onClick={() => { setDirection('forward'); setStep('details'); }}
                  >
                    Continue to Details <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* ── Step 2: Customer Details ── */}
              {step === 'details' && (
                <div className={styles.section}>
                  <div className={styles.detailsHeader}>
                    <h2 className={styles.sectionTitle}>
                      {language === 'id' ? '👤 Data Kamu' : '👤 Your Details'}
                    </h2>
                    <p className={styles.detailsSubtitle}>
                      {language === 'id'
                        ? 'Kami butuh info ini untuk mengirim link kelas kamu.'
                        : 'We need this to send your class access link.'}
                    </p>
                  </div>

                  <div className={styles.form}>
                    {/* Name */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="cart-name">
                        {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
                      </label>
                      <input
                        id="cart-name"
                        ref={nameInputRef}
                        className={styles.input}
                        type="text"
                        placeholder={language === 'id' ? 'cth. Budi Santoso' : 'e.g. Budi Santoso'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, name: true }))}
                        autoComplete="name"
                        data-error={nameInvalid ? 'true' : undefined}
                        data-valid={touched.name && name.trim().length >= 2 ? 'true' : undefined}
                      />
                      {nameInvalid && (
                        <p className={styles.fieldError} role="alert">
                          ⚠ {language === 'id' ? 'Masukkan nama lengkap kamu.' : 'Please enter your full name.'}
                        </p>
                      )}
                    </div>

                    {/* Phone — required */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="cart-phone">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366', marginRight: 5, verticalAlign: 'middle' }}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {language === 'id' ? 'Nomor WhatsApp / Telepon' : 'WhatsApp / Phone Number'}
                        <span className={styles.requiredBadge}>*</span>
                      </label>
                      <div className={styles.phoneInputGroup}>
                        <select
                          className={styles.countrySelect}
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          aria-label="Country code"
                        >
                          <option value="+62">🇮🇩 +62</option>
                          <option value="+60">🇲🇾 +60</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+1">🇺🇸 +1</option>
                        </select>
                        <input
                          id="cart-phone"
                          className={styles.phoneInput}
                          type="tel"
                          inputMode="numeric"
                          placeholder={countryCode === '+62' ? '812 3456 7890' : '12 3456 7890'}
                          value={phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/[^\d\s]/g, '');
                            setPhone(digits);
                          }}
                          onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                          autoComplete="tel"
                          data-error={(phoneInvalid || phoneEmpty) ? 'true' : undefined}
                          data-valid={touched.phone && phone.trim().length >= 6 ? 'true' : undefined}
                        />
                      </div>
                      {(phoneInvalid || phoneEmpty) && (
                        <p className={styles.fieldError} role="alert">
                          ⚠ {language === 'id'
                            ? 'Nomor telepon diperlukan untuk konfirmasi kelas'
                            : 'Phone number is required to confirm your class'}
                        </p>
                      )}
                      <p className={styles.fieldHelper}>
                        📲 {language === 'id'
                          ? 'Kami akan menghubungi Anda untuk konfirmasi jadwal kelas'
                          : 'We will contact you to confirm your class schedule'}
                      </p>
                    </div>

                    {/* Email — optional */}
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="cart-email">
                        {language === 'id' ? 'Email' : 'Email'}
                        <span className={styles.requiredBadge}>*</span>
                      </label>
                      <input
                        id="cart-email"
                        className={styles.input}
                        type="email"
                        inputMode="email"
                        placeholder={language === 'id' ? 'contoh@email.com' : 'you@example.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, email: true }))}
                        autoComplete="email"
                        data-error={emailInvalid ? 'true' : undefined}
                        data-valid={touched.email && email.trim() !== '' && email.includes('@') ? 'true' : undefined}
                      />
                      {emailInvalid && (
                        <p className={styles.fieldError} role="alert">
                          ⚠ {language === 'id'
                            ? 'Email wajib diisi agar kami bisa mengirim invoice kelas'
                            : 'Email is required so we can send your class invoice'}
                        </p>
                      )}
                      <p className={styles.fieldHelper}>
                        📄 {language === 'id'
                          ? 'Kami akan mengirim invoice dan detail kelas'
                          : 'We will send your invoice and class details'}
                      </p>
                    </div>

                    {detailsError && !nameInvalid && !phoneInvalid && !phoneEmpty && !emailInvalid && (
                      <p className={styles.fieldErrorGlobal} role="alert">{detailsError}</p>
                    )}
                  </div>

                  <button
                    className="btn btn-primary btn-xl btn-full"
                    style={{ marginTop: '8px' }}
                    onClick={handleContinueDetails}
                  >
                    {language === 'id' ? 'Lanjut ke Pembayaran' : 'Continue to Payment'} <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* ── Step 3: Payment Method ── */}
              {step === 'method' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Choose Payment Method</h2>
                  <PaymentMethodSelector selected={method} onSelect={setMethod} currency={currency} />
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
                      amountIDR={chargeAmountIDR}
                      onPaid={() => { setPaidSlug(currentSlug); clearCart(); setPaid(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    />
                  ) : method === 'qris' && !orderId ? (
                    <p className={styles.fieldError}>Order could not be created. Please go back and try again.</p>
                  ) : (
                    <>
                      <div className={styles.thankYouBlock}>
                        <div className={styles.thankYouIcon}>🎉</div>
                        <h2 className={styles.thankYouTitle}><Translate tKey="thankyou.title" /></h2>
                        <p className={styles.thankYouSub}><Translate tKey="thankyou.sub" /></p>
                        <ul className={styles.thankYouList}>
                          <li><Translate tKey="thankyou.step1" /></li>
                          <li><Translate tKey="thankyou.step2" /></li>
                          <li><Translate tKey="thankyou.step3" /></li>
                        </ul>
                        <p className={styles.thankYouTime}><Translate tKey="thankyou.time" /></p>
                        {orderId && (
                          <div className={styles.thankYouOrderBox}>
                            <span className={styles.thankYouOrderLabel}><Translate tKey="thankyou.orderId" /></span>
                            <code className={styles.thankYouOrderId}>{orderId}</code>
                          </div>
                        )}
                        <div className={styles.thankYouLinks}>
                          {items.map((item: any) => {
                            const url = PAYPAL_LINKS[item.courseId] ?? PAYPAL_LINKS[item.slug];
                            return url ? (
                              <a
                                key={item.courseId ?? item.slug}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.paypalReopen}
                              >
                                <Translate tKey="thankyou.reopen" /> {item.courseTitle} →
                              </a>
                            ) : null;
                          })}
                        </div>
                      </div>
                      {orderId && (
                        <PaymentStatusBlock orderId={orderId} slug={paidSlug} provider="paypal" />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── Paid: Status ── */}
              {paid && orderId && (
                <PaymentStatusBlock orderId={orderId} slug={paidSlug} />
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

      {/* Remove toast */}
      {removeToast && (
        <div className={styles.removeToast} role="status" aria-live="polite">
          <Trash2 size={15} />
          <span><strong>{removeToast}</strong> removed from cart</span>
        </div>
      )}

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
                if (step === 'summary') { setDirection('forward'); setStep('details'); }
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
