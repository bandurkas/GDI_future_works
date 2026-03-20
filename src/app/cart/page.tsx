'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

export default function CartPage() {
    const { items, removeItem, totalItems } = useCart();
    const { language } = useLanguage();

    const totalPriceIDR = items.reduce((sum, item) => sum + item.priceIDR, 0);
    const totalPriceMYR = items.reduce((sum, item) => sum + item.priceMYR, 0);

    const displayTotal = language === 'id' 
        ? `Rp ${totalPriceIDR.toLocaleString('id-ID')}`
        : `RM ${totalPriceMYR.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

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
                                    {language === 'id' ? `Rp ${item.priceIDR.toLocaleString('id-ID')}` : `RM ${item.priceMYR}`}
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

                            <Link 
                                href="/checkout" 
                                className="btn btn-primary btn-xl btn-full"
                                style={{ marginTop: '24px' }}
                            >
                                Proceed to Checkout →
                            </Link>
                            
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
        </div>
    );
}
