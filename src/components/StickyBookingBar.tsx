'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Course } from '@/data/courses';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import LeadConversionWidget from '@/components/LeadConversionWidget';
import styles from './StickyBookingBar.module.css';
import { Download } from 'lucide-react';

interface Props { course: Course; }

// Fix #6 — replaced ClientPrice (USD conversion) with direct IDR/MYR display
export default function StickyBookingBar({ course }: Props) {
    const { language } = useLanguage();
    const { currency } = useCurrency();
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);

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
                        <button 
                            className={styles.syllabusBtn}
                            onClick={() => setIsWidgetOpen(true)}
                        >
                            <Download size={14} />
                            {isID ? 'Program' : 'Syllabus'}
                        </button>
                        {course.seatsLeft <= 5 && (
                            <span className={styles.urgent} role="status" aria-live="polite">
                                {' · '}{course.seatsLeft} {isID ? 'kursi' : 'seats'}
                            </span>
                        )}
                    </div>
                </div>
                <Link
                    href={`/courses/${course.slug}/schedule`}
                    className={`btn btn-primary btn-lg ${styles.cta}`}
                    id="sticky-booking-cta"
                >
                    {isID ? 'Pilih' : 'Choose'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <LeadConversionWidget 
                courseId={course.id}
                courseTitle={isID && course.titleID ? course.titleID : course.title}
                isOpen={isWidgetOpen}
                onClose={() => setIsWidgetOpen(false)}
            />
        </div>
    );
}
