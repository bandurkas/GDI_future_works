
/**
 * Multi-Currency Pricing Utility (IDR / MYR)
 */

export type Currency = 'IDR' | 'MYR';

// Fixed internal conversion rate for Midtrans (IDR only)
// 1 MYR = 3337 IDR (Approximation for predefined prices)
export const MYR_TO_IDR_RATE = 3337;

/**
 * Format currency amounts with local symbols
 */
export function formatPrice(amount: number, currency: Currency): string {
    if (currency === 'IDR') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('Rp', 'Rp ');
    } else {
        return `RM ${amount.toLocaleString('en-MY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    }
}

/**
 * Convert MYR to IDR for Midtrans processing
 * Used ONLY when user selected MYR market but payment must be in IDR
 */
export function convertToIdr(amount: number, currency: Currency): number {
    if (currency === 'IDR') return amount;
    // For MYR 899 -> should return 3,000,000 approx
    // But we follow FIXED PRICES. This utility is for dynamic safety.
    return Math.round(amount * MYR_TO_IDR_RATE);
}

/**
 * Detect user currency based on headers or cookies (Server Side)
 */
export function getUserCurrencyServer(cookiesHandler: any): Currency {
    const cookie = cookiesHandler.get('GDI_CURRENCY')?.value;
    if (cookie === 'MYR') return 'MYR';
    return 'IDR'; // Default to Indonesia
}
