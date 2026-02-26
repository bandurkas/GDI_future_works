'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    formatPrice: (usdPrice: number) => string;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        'nav.courses': 'Courses',
        'nav.about': 'About',
        'nav.community': 'Community',
        'nav.contact': 'Contact',
        'hero.title': 'Top IT Courses',
        'hero.subtitle': 'Learn the skills that matter. Taught by industry experts.',
        'btn.enroll': 'Enroll Now',
        'btn.checkout': 'Proceed to Checkout',
        'btn.chat': 'Chat us',
        'summary.title': 'Order Summary',
        'summary.total': 'Total Due',
        'course.duration': 'Duration',
        'course.format': 'Format',
        'course.nextSession': 'Next Session',
        'payment.choose': 'Choose a payment method',
        'payment.card': 'Credit Card',
        'payment.qris': 'QRIS / E-Wallet',
        'payment.va': 'Bank Transfer (VA)',
        'progress.step1': 'Select Time',
        'progress.step2': 'Your Details',
        'progress.step3': 'Payment',
        'ge.special': 'Special Partnership',
        'ge.title': 'Great English & iTTi',
        'ge.desc': 'Study English with a clear goal — become confident, fluent, and fully prepared to pass internationally recognized TESOL / TEFL certification.',
        'ge.btn': 'Discover the Opportunity →',
        'courses.available': 'courses available'
    },
    id: {
        'nav.courses': 'Kursus',
        'nav.about': 'Tentang Kami',
        'nav.community': 'Komunitas',
        'nav.contact': 'Kontak',
        'hero.title': 'Kursus IT Terbaik',
        'hero.subtitle': 'Pelajari keahlian yang penting. Diajarkan oleh para ahli industri.',
        'btn.enroll': 'Daftar Sekarang',
        'btn.checkout': 'Lanjut Pembayaran',
        'btn.chat': 'Chat kami',
        'summary.title': 'Ringkasan Pesanan',
        'summary.total': 'Total Tagihan',
        'course.duration': 'Durasi',
        'course.format': 'Format',
        'course.nextSession': 'Sesi Berikutnya',
        'payment.choose': 'Pilih metode pembayaran',
        'payment.card': 'Kartu Kredit',
        'payment.qris': 'QRIS / E-Wallet',
        'payment.va': 'Transfer Bank (VA)',
        'progress.step1': 'Pilih Waktu',
        'progress.step2': 'Data Diri',
        'progress.step3': 'Pembayaran',
        'ge.special': 'Kemitraan Khusus',
        'ge.title': 'Great English & iTTi',
        'ge.desc': 'Belajar bahasa Inggris dengan tujuan yang jelas — menjadi percaya diri, fasih, dan sepenuhnya siap untuk lulus sertifikasi TESOL / TEFL yang diakui secara internasional.',
        'ge.btn': 'Pelajari Peluang Ini →',
        'courses.available': 'kursus tersedia'
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    formatPrice: (p) => `$${p}`,
    t: (k) => k,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('gdi_lang') as Language;
        if (saved && (saved === 'en' || saved === 'id')) {
            setLanguageState(saved);
        } else {
            // Default based on browser? We force EN by default
            setLanguageState('en');
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('gdi_lang', lang);
        // Force reload to let server components re-render with cookie if needed, 
        // but for now we just change context. To translate actual text we use `t()`.
    };

    const formatPrice = (usdPrice: number) => {
        if (language === 'id') {
            const idrValue = usdPrice * 16800;
            return `Rp ${idrValue.toLocaleString('id-ID')}`;
        } else {
            const myrValue = usdPrice * 4.0;
            return `RM ${myrValue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, formatPrice, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
