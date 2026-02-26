'use client';
import { useLanguage } from './LanguageContext';

export function ClientPrice({ price, originalPrice }: { price: number; originalPrice?: number }) {
    const { formatPrice } = useLanguage();

    if (originalPrice !== undefined) {
        return (
            <>
                <span>{formatPrice(price)}</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8em', marginLeft: '6px' }}>
                    {formatPrice(originalPrice)}
                </span>
            </>
        );
    }
    return <span>{formatPrice(price)}</span>;
}

export function Translate({ tKey, defaultText }: { tKey: string, defaultText?: string }) {
    const { t, language } = useLanguage();
    // If we only passed the key, use the context.
    // In our quick dictionary, we return the string, or fallback
    return <span>{t(tKey) !== tKey ? t(tKey) : defaultText || tKey}</span>;
}
