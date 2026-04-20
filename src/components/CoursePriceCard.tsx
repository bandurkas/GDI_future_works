'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Course } from '@/data/courses';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import LeadConversionWidget from '@/components/LeadConversionWidget';
import { Download } from 'lucide-react';

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
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const isID = language === 'id';

    const currentPrice = currency === 'IDR' ? course.priceIDR : course.priceMYR;
    const originalPrice = currency === 'IDR' ? course.originalPriceIDR : course.originalPriceMYR;

    const displayPrice = formatPrice(currentPrice, currency);
    const displayOriginal = formatPrice(originalPrice, currency);

    const discount = Math.round(
        (1 - (currentPrice / originalPrice)) * 100
    );

    const inclusions = isID 
        ? (variant === 'hero'
            ? ['Pelatihan interaktif langsung', 'Tanya Jawab Real-time', 'Proyek portofolio', 'Sertifikat kelulusan', 'Akses komunitas']
            : ['Pelatihan interaktif langsung', 'Tanya Jawab Real-time', 'Proyek portofolio', 'Sertifikat', 'Akses komunitas'])
        : (variant === 'hero'
            ? ['Live interactive training', 'Real-time Q&A', 'Portfolio project', 'Certificate of completion', 'Community access']
            : ['Live interactive training', 'Real-time Q&A', 'Portfolio project', 'Certificate', 'Community access']);

    const ctaId = variant === 'hero' ? 'course-hero-cta' : 'sidebar-cta';
    const ctaNote = variant === 'hero'
        ? (isID ? '🔒 Checkout aman · Dikonfirmasi dalam <2 mnt via WhatsApp' : '🔒 Secure checkout · Confirmed in <2 min via WhatsApp')
        : (isID ? '🔒 Aman · Dikonfirmasi via WhatsApp' : '🔒 Secure · Confirmed via WhatsApp');

    return (
        <>
            {/* Price row — matches original .priceTop structure */}
            <div className={styles.priceTop}>
                <div className={styles.priceAmount}>{displayPrice}</div>
                <div className={styles.priceRight}>
                    <span className={styles.priceOrig}>{displayOriginal}</span>
                    <span className={`${styles.badge} ${styles.badgeAccent}`}>{discount}% {isID ? 'disкон' : 'off'}</span>
                </div>
            </div>

            {/* Inclusions list */}
            <ul className={styles.priceIncludes}>
                {inclusions.map((item) => (
                    <li key={item} className={styles.priceItem}>
                        <div className={styles.checkIcon}>✓</div>
                        {item}
                    </li>
                ))}
            </ul>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                    href={`/courses/${slug}/schedule`}
                    className="btn btn-primary btn-lg btn-full"
                    id={ctaId}
                    style={{ marginBottom: 0 }}
                >
                    {isID ? 'Pilih Tanggal & Waktu →' : 'Choose Date & Time →'}
                </Link>

                <button 
                    onClick={() => setIsWidgetOpen(true)}
                    className="btn btn-outline btn-lg btn-full"
                    style={{ 
                        background: 'transparent', 
                        border: '1.5px solid #eee',
                        color: '#444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Download size={18} />
                    {isID ? 'Unduh Program (PDF)' : 'Get Full Syllabus'}
                </button>
            </div>

            {/* Footnote */}
            <p className={styles.priceNote}>{ctaNote}</p>

            {/* Global Lead Widget */}
            <LeadConversionWidget 
                courseId={course.id}
                courseTitle={isID && course.titleID ? course.titleID : course.title}
                isOpen={isWidgetOpen}
                onClose={() => setIsWidgetOpen(false)}
            />
        </>
    );
}
