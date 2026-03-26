'use client';
import { useCurrency } from '@/components/CurrencyContext';

interface Props {
    priceIDR: number;  // in IDR
    priceMYR: number;  // in MYR
}

/**
 * Displays the correct currency (Rp or RM) based on user currency selection.
 * Used on the Great English page to replace ClientPrice (USD).
 */
export default function PriceBadge({ priceIDR, priceMYR }: Props) {
    const { currency } = useCurrency();
    return currency === 'IDR'
        ? <span>Rp {priceIDR.toLocaleString('id-ID')}</span>
        : <span>RM {priceMYR.toLocaleString()}</span>;
}
