'use client';

import { useState } from 'react';
import styles from '@/app/great-english/page.module.css';
import { useLanguage } from './LanguageContext';

declare global {
    interface Window {
        snap: any;
    }
}

type Props = {
    courseId: string;
    courseName: string;
    price: number;
};

export default function EnrollButton({ courseId, courseName, price }: Props) {
    const [loading, setLoading] = useState(false);

    const handleEnroll = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/tokenize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{
                        courseId: courseId,
                        dateId: 'immediate',
                        slug: 'great-english',
                        dateLabel: 'Immediate Access'
                    }],
                    customerName: 'Student',
                    customerPhone: '',
                })
            });

            const data = await res.json();

            if (data.token && typeof window.snap !== 'undefined') {
                window.snap.pay(data.token, {
                    onSuccess: function () {
                        alert('Payment successful! Your credentials will be emailed to you.');
                        setLoading(false);
                    },
                    onPending: function () {
                        alert('Waiting for your payment!');
                        setLoading(false);
                    },
                    onError: function () {
                        alert('Payment failed!');
                        setLoading(false);
                    },
                    onClose: function () {
                        setLoading(false);
                    }
                });
            } else {
                alert('Payment gateway could not be loaded. Please ensure you are connected to the internet.');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('A network error occurred.');
            setLoading(false);
        }
    };

    const { language } = useLanguage();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <button onClick={handleEnroll} className={styles.enrollBtn} disabled={loading} style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : { cursor: 'pointer', border: 'none' }}>
                {loading ? 'Processing...' : 'Enroll Now'}
            </button>
            {language === 'en' && (
                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Transactions are processed securely in IDR equivalent.</small>
            )}
        </div>
    );
}
