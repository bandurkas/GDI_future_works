'use client';
import Link from 'next/link';
import { Course } from '@/data/courses';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice } from '@/lib/currency';

interface Props {
    course: Course;
    slug: string;
    variant: 'hero' | 'sidebar';
    styles: Record<string, string>;
}

/**
 * Client component — renders course price card with correct IDR/MYR
 * based on user language. Replaces ClientPrice (USD) in course detail page.
 * Renders flat children to match the flex-column layout of .priceCard / .sidebarCard.
 */
export default function CoursePriceCard({ course, slug, variant, styles }: Props) {
    const { language } = useLanguage();
    const { currency } = useCurrency();
    const isID = language === 'id';

    const currentPrice = currency === 'IDR' ? course.priceIDR : course.priceMYR;
    const originalPrice = currency === 'IDR' ? course.originalPriceIDR : course.originalPriceMYR;

    const displayPrice = formatPrice(currentPrice, currency);
    const displayOriginal = formatPrice(originalPrice, currency);

    const discount = Math.round(
        (1 - (currentPrice / originalPrice)) * 100
    );

    const inclusions = variant === 'hero'
        ? ['Live interactive training', 'Real-time Q&A', 'Portfolio project', 'Certificate of completion', 'Community access']
        : ['Live interactive training', 'Real-time Q&A', 'Portfolio project', 'Certificate', 'Community access'];

    const ctaId = variant === 'hero' ? 'course-hero-cta' : 'sidebar-cta';
    const ctaNote = variant === 'hero'
        ? '🔒 Secure checkout · Confirmed in <2 min via WhatsApp'
        : '🔒 Secure · Confirmed via WhatsApp';

    return (
        <>
            {/* Price row — matches original .priceTop structure */}
            <div className={styles.priceTop}>
                <div className={styles.priceAmount}>{displayPrice}</div>
                <div className={styles.priceRight}>
                    <span className={styles.priceOrig}>{displayOriginal}</span>
                    <span className="badge badge-accent">{discount}% off</span>
                </div>
            </div>

            {/* Inclusions list */}
            <ul className={styles.priceIncludes}>
                {inclusions.map((item) => (
                    <li key={item} className={styles.priceItem}>
                        <div className="check-icon">✓</div>
                        {item}
                    </li>
                ))}
            </ul>

            {/* CTA button */}
            <Link
                href={`/courses/${slug}/schedule`}
                className="btn btn-primary btn-lg btn-full"
                id={ctaId}
            >
                Choose Date & Time →
            </Link>

            {/* Footnote */}
            <p className={styles.priceNote}>{ctaNote}</p>
        </>
    );
}
