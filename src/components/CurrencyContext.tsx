
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
        // Sync with localStorage if different (client-side preference)
        const saved = localStorage.getItem('GDI_CURRENCY') as Currency;
        if (saved && (saved === 'IDR' || saved === 'MYR') && saved !== initialCurrency) {
            setCurrencyState(saved);
        }
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
