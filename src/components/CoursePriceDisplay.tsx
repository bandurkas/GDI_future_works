'use client';
import { Course } from '@/data/courses';
import { useLanguage } from './LanguageContext';

interface Props { course: Course; variant?: 'card' | 'sidebar' }

/**
 * Fix #6 — replaces ClientPrice (USD) with direct IDR/MYR display.
 * Used in course detail page price cards (hero + sidebar).
 */
export default function CoursePriceDisplay({ course, variant = 'card' }: Props) {
    const { language } = useLanguage();
    const isID = language === 'id';

    const price = isID
        ? `Rp ${course.priceIDR.toLocaleString('id-ID')}`
        : `RM ${course.priceMYR}`;
    const original = isID
        ? `Rp ${course.originalPriceIDR.toLocaleString('id-ID')}`
        : `RM ${course.originalPriceMYR}`;
    const discount = Math.round((1 - (isID ? course.priceIDR / course.originalPriceIDR : course.priceMYR / course.originalPriceMYR)) * 100);

    return { price, original, discount };
}
