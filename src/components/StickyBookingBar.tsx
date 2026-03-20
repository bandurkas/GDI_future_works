'use client';
import Link from 'next/link';
import { Course } from '@/data/courses';
import { useLanguage } from '@/components/LanguageContext';
import styles from './StickyBookingBar.module.css';

interface Props { course: Course; }

// Fix #6 — replaced ClientPrice (USD conversion) with direct IDR/MYR display
export default function StickyBookingBar({ course }: Props) {
    const { language } = useLanguage();
    const displayPrice = language === 'id'
        ? `Rp ${course.priceIDR.toLocaleString('id-ID')}`
        : `RM ${course.priceMYR}`;
    const displayOriginal = language === 'id'
        ? `Rp ${course.originalPriceIDR.toLocaleString('id-ID')}`
        : `RM ${course.originalPriceMYR}`;

    return (
        <div className={styles.bar}>
            <div className={styles.inner}>
                <div className={styles.info}>
                    <div className={styles.price}>{displayPrice}
                        <span className={styles.priceOrig}>{displayOriginal}</span>
                    </div>
                    <div className={styles.meta}>
                        📅 Next: {course.nextSession}
                        {course.seatsLeft <= 5 && (
                            <span className={styles.urgent}> · {course.seatsLeft} seats left</span>
                        )}
                    </div>
                </div>
                <Link
                    href={`/courses/${course.slug}/schedule`}
                    className={`btn btn-primary btn-lg ${styles.cta}`}
                    id="sticky-booking-cta"
                >
                    Choose Date & Time
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
