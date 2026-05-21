'use client';
import { useEffect } from 'react';

export default function PrintTrigger() {
    useEffect(() => {
        const t = setTimeout(() => {
            try { window.print(); } catch {}
        }, 600);
        return () => clearTimeout(t);
    }, []);
    return null;
}
