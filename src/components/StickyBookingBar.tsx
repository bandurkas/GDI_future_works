'use client';
import Link from 'next/link';
import { Course } from '@/data/courses';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import styles from './StickyBookingBar.module.css';

interface Props { course: Course; }

// Fix #6 — replaced ClientPrice (USD conversion) with direct IDR/MYR display
export default function StickyBookingBar({ course }: Props) {
    const { language } = useLanguage();
    const { currency } = useCurrency();

    const currentPrice = currency === 'IDR' ? course.priceIDR : course.priceMYR;
    const originalPrice = currency === 'IDR' ? course.originalPriceIDR : course.originalPriceMYR;

    const displayPrice = formatPrice(currentPrice, currency);
    const displayOriginal = formatPrice(originalPrice, currency);

    const isID = language === 'id';
    const nextSession = isID && course.nextSessionID ? course.nextSessionID : course.nextSession;

    return (
        <div className={styles.bar}>
            <div className={styles.inner}>
                <div className={styles.info}>
                    <div className={styles.price}>{displayPrice}
                        <span className={styles.priceOrig}>{displayOriginal}</span>
                    </div>
                    <div className={styles.meta}>
                        <span aria-hidden="true">📅</span>
                        <span className="sr-only">Next session:</span>
                        {nextSession}
                        {course.seatsLeft <= 5 && (
                            <span className={styles.urgent} role="status" aria-live="polite">
                                {' · '}{course.seatsLeft} {isID ? 'kursi tersisa' : 'seats left'}
                            </span>
                        )}
                    </div>
                </div>
                <Link
                    href={`/courses/${course.slug}/schedule`}
                    className={`btn btn-primary btn-lg ${styles.cta}`}
                    id="sticky-booking-cta"
                >
                    {isID ? 'Pilih Tanggal & Waktu' : 'Choose Date & Time'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
