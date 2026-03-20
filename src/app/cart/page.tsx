'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import styles from './page.module.css';
import CheckoutModal from '@/components/CheckoutModal';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        snap: any;
    }
}

export default function CartPage() {
    const { items, removeItem, totalItems, clearCart } = useCart();
    const { language } = useLanguage();
    const { currency } = useCurrency();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [snapLoaded, setSnapLoaded] = useState(false);

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
        setIsModalOpen(true);
    };

    const handleCheckoutSubmit = async (customerData: { name: string; phone: string; email?: string }) => {
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
                        console.log('Success:', result);
                        clearCart();
                        router.push('/dashboard?status=success');
                    },
                    onPending: (result: any) => {
                        console.log('Pending:', result);
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
            throw error;
        }
    };

    if (totalItems === 0) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h1>Your cart is empty</h1>
                        <p>You haven&apos;t added any courses yet. Explore our pathways to success.</p>
                        <Link href="/courses" className="btn btn-primary btn-xl">Explore Courses</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1>Your Learning Path</h1>
                    <p>Building your future with {totalItems} expert-led courses.</p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.itemList}>
                        {items.map((item) => (
                            <div key={`${item.courseId}-${item.dateId}`} className={styles.cartItem}>
                                <div className={styles.itemIcon}>{item.icon}</div>
                                <div className={styles.itemInfo}>
                                    <h3>{item.courseTitle}</h3>
                                    <div className={styles.itemMeta}>
                                        <span>📅 {item.dateLabel}</span>
                                        <span>🕒 {item.timeLabel}</span>
                                    </div>
                                </div>
                                <div className={styles.itemPrice}>
                                    {formatPrice(currency === 'IDR' ? item.priceIDR : item.priceMYR, currency)}
                                </div>
                                <button 
                                    className={styles.removeBtn} 
                                    onClick={() => removeItem(item.courseId, item.dateId)}
                                    aria-label="Remove item"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryBox}>
                            <h2>Order Summary</h2>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>{displayTotal}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Platform Fee</span>
                                <span>Free</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                <span>Total</span>
                                <span>{displayTotal}</span>
                            </div>

                            <button 
                                onClick={handleCheckoutClick}
                                className="btn btn-primary btn-xl btn-full"
                                style={{ marginTop: '24px' }}
                                disabled={!snapLoaded}
                            >
                                {snapLoaded ? 'Secure Checkout →' : 'Loading Security...'}
                            </button>
                            
                            <p className={styles.guaranteeNote}>
                                🔒 Secure multi-course checkout
                                <br />
                                100% Satisfaction Guaranteed
                            </p>
                        </div>
                        
                        <Link href="/courses" className={styles.continueLink}>
                            ← Add another course
                        </Link>
                    </div>
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
