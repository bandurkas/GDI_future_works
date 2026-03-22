
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Currency = 'IDR' | 'MYR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children, initialCurrency = 'IDR' }: { children: ReactNode, initialCurrency?: Currency }) {
    const [currency, setCurrencyState] = useState<Currency>(initialCurrency);
    const router = useRouter();

    useEffect(() => {
        // Priority 1: localStorage (user preference)
        const saved = localStorage.getItem('GDI_CURRENCY') as Currency;
        if (saved && (saved === 'IDR' || saved === 'MYR')) {
            if (saved !== initialCurrency) setCurrencyState(saved);
            return;
        }

        // Priority 2: Geolocation detection (Indonesia vs Others)
        const detectCurrency = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            try {
                const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) throw new Error('Network response not ok');
                
                const data = await res.json();
                if (data.country_code === 'ID') {
                    setCurrency('IDR');
                } else {
                    setCurrency('MYR');
                }
            } catch (err) {
                // Silence common fetch errors (blocked, network down, etc)
                // We keep the initial default/server-detected currency
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Silent currency geo-detection skip:', err instanceof Error ? err.message : 'Unknown error');
                }
            }
        };

        detectCurrency();
    }, [initialCurrency]);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem('GDI_CURRENCY', c);
        // Sync with cookie for SSR
        document.cookie = `GDI_CURRENCY=${c}; path=/; max-age=31536000; SameSite=Lax`;
        
        // Refresh server components to reflect currency change globally
        router.refresh();
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
