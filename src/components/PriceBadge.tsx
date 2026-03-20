'use client';
import { useLanguage } from '@/components/LanguageContext';

interface Props {
    priceIDR: number;  // in IDR
    priceMYR: number;  // in MYR
}

/**
 * Displays the correct currency (Rp or RM) based on user language.
 * Used on the Great English page to replace ClientPrice (USD).
 */
export default function PriceBadge({ priceIDR, priceMYR }: Props) {
    const { language } = useLanguage();
    return language === 'id'
        ? <span>Rp {priceIDR.toLocaleString('id-ID')}</span>
        : <span>RM {priceMYR.toLocaleString()}</span>;
}
