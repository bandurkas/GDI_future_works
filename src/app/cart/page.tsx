'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLanguage, Translate } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import styles from './page.module.css';
import CheckoutModal from '@/components/CheckoutModal';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
    Trash2, 
    Calendar, 
    Clock, 
    Lock, 
    ShoppingCart, 
    ArrowRight, 
    ChevronLeft,
    ShieldCheck
} from 'lucide-react';

declare global {
    interface Window {
        snap: any;
    }
}

export default function CartPage() {
    const { items, removeItem, totalItems, clearCart, customerInfo } = useCart();
    const { language } = useLanguage();
    const { currency } = useCurrency();
    const router = useRouter();
    const { data: session } = useSession();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [snapLoaded, setSnapLoaded] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Load Midtrans Snap Script
    useEffect(() => {
        const snapScriptUrl = 'https://app.midtrans.com/snap/snap.js';
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXX';
        
        const script = document.createElement('script');
        script.src = snapScriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.onload = () => setSnapLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const totalAmount = items.reduce((sum, item) => 
        sum + (currency === 'IDR' ? item.priceIDR : item.priceMYR), 0
    );

    const displayTotal = formatPrice(totalAmount, currency);

    const handleCheckoutClick = () => {
        if (customerInfo.email || customerInfo.phone) {
            handleCheckoutSubmit({
                ...customerInfo,
                name: session?.user?.name || 'Student'
            });
        } else {
            setIsModalOpen(true);
        }
    };

    const handleCheckoutSubmit = async (customerData: { name: string; phone: string; email?: string }) => {
        setCheckoutLoading(true);
        try {
            const response = await fetch('/api/tokenize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customerName: customerData.name,
                    customerPhone: customerData.phone,
                    customerEmail: customerData.email,
                    currency,
                }),
            });

            const data = await response.json();

            if (data.token && window.snap) {
                window.snap.pay(data.token, {
                    onSuccess: (result: any) => {
                        clearCart();
                        router.push('/dashboard?status=success');
                    },
                    onPending: (result: any) => {
                        clearCart();
                        router.push('/dashboard?status=pending');
                    },
                    onError: (err: any) => {
                        console.error('Error:', err);
                        alert('Payment failed. Please try again.');
                    },
                    onClose: () => {
                        console.log('User closed the popup');
                    }
                });
                setIsModalOpen(false);
            } else {
                throw new Error(data.error || 'Failed to initialize payment');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message || 'Payment failed. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (totalItems === 0) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.empty}>
                        <div className={styles.emptyIconContainer}>
                            <ShoppingCart size={48} className={styles.emptyIcon} strokeWidth={1.5} />
                        </div>
                        <h1><Translate tKey="cart.empty" defaultText="Your cart is empty" /></h1>
                        <p><Translate tKey="cart.emptySub" defaultText="Unlock your potential with expert-led training. Your future starts with a single course." /></p>
                        <Link href="/courses" className="btn btn-primary btn-xl">
                            <Translate tKey="cart.browse" defaultText="Browse Courses" /> <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const checkoutBtnLabel = checkoutLoading 
        ? (language === 'id' ? 'Memulai Pembayaran Aman...' : 'Launching Secure Payment...') 
        : snapLoaded 
            ? (language === 'id' ? 'Bayar Sekarang' : 'Pay Now') 
            : (language === 'id' ? 'Memuat Keamanan...' : 'Loading Security...');

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <Link href="/courses" className={styles.backLink}>
                        <ChevronLeft size={16} /> <Translate tKey="cart.back" defaultText="Back to Courses" />
                    </Link>
                    <h1><Translate tKey="cart.review" defaultText="Review Your Cart" /></h1>
                    <p>
                        <Translate tKey="cart.reviewSub" defaultText="Ready to start your journey? You have" /> {totalItems} {totalItems === 1 ? (language === 'id' ? 'kursus' : 'course') : (language === 'id' ? 'kursus' : 'courses')} {language === 'id' ? 'terpilih' : 'selected'}.
                    </p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.itemList}>
                        {items.map((item) => (
                            <div key={`${item.courseId}-${item.dateId}`} className={styles.cartItem}>
                                <div className={styles.itemMain}>
                                    <div className={styles.itemIcon}>{item.icon}</div>
                                    <div className={styles.itemInfo}>
                                        <h3>{item.courseTitle}</h3>
                                        <div className={styles.itemMeta}>
                                            <span className={styles.metaItem}>
                                                <Calendar size={14} /> {item.dateLabel}
                                            </span>
                                            <span className={styles.metaItem}>
                                                <Clock size={14} /> {item.timeLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.itemActions}>
                                    <div className={styles.itemPrice}>
                                        {formatPrice(currency === 'IDR' ? item.priceIDR : item.priceMYR, currency)}
                                    </div>
                                    <button 
                                        className={styles.removeBtn} 
                                        onClick={() => removeItem(item.courseId, item.dateId)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryBox}>
                            <h2><Translate tKey="summary.title" defaultText="Order Summary" /></h2>
                            <div className={styles.summaryRow}>
                                <span><Translate tKey="cart.subtotal" defaultText="Subtotal" /> ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                                <span>{displayTotal}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span><Translate tKey="cart.platformFee" defaultText="Platform Fee" /></span>
                                <span className={styles.freeBadge}>FREE</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                <span><Translate tKey="cart.total" defaultText="Total Amount" /></span>
                                <span>{displayTotal}</span>
                            </div>

                            <button 
                                onClick={handleCheckoutClick}
                                className="btn btn-primary btn-xl btn-full"
                                style={{ marginTop: '24px', height: '64px', fontSize: '1.1rem' }}
                                disabled={!snapLoaded || checkoutLoading}
                            >
                                {checkoutBtnLabel}
                            </button>
                            
                            <div className={styles.secureBadge}>
                                <ShieldCheck size={16} />
                                <span><Translate tKey="cart.secure" defaultText="Secure Checkout • 256-bit Encryption" /></span>
                            </div>
                        </div>
                        
                        <Link href="/courses" className={styles.addMoreLink}>
                            <Translate tKey="cart.addMore" defaultText="Add another course" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            <div className={styles.mobileStickyFooter}>
                <div className={styles.mobileFooterContent}>
                    <div className={styles.mobileTotalInfo}>
                        <span className={styles.mobileTotalLabel}><Translate tKey="cart.total" defaultText="Total" /></span>
                        <span className={styles.mobileTotalPrice}>{displayTotal}</span>
                    </div>
                    <button 
                        onClick={handleCheckoutClick}
                        className="btn btn-primary"
                        style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}
                        disabled={!snapLoaded || checkoutLoading}
                    >
                        {checkoutLoading ? '...' : (language === 'id' ? 'Bayar' : 'Checkout')}
                    </button>
                </div>
            </div>

            <CheckoutModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCheckoutSubmit}
                totalAmount={displayTotal}
                currency={currency}
            />
        </div>
    );
}
