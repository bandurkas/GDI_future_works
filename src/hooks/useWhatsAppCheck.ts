import { useRef, useState } from 'react';

export const useWhatsAppCheck = (debounceMs: number = 400) => {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPhoneRef = useRef<string>('');

  const runCheck = async (phone: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      const result = data.exists !== false;
      setExists(result);
      return result;
    } catch (e) {
      setExists(true);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const check = (phone: string): Promise<boolean> => {
    const clean = (phone || '').replace(/\D/g, '');
    if (!clean || clean.length < 8) {
      setExists(null);
      return Promise.resolve(true);
    }
    if (clean === lastPhoneRef.current && exists !== null) {
      return Promise.resolve(exists);
    }
    lastPhoneRef.current = clean;

    if (timerRef.current) clearTimeout(timerRef.current);

    return new Promise((resolve) => {
      timerRef.current = setTimeout(async () => {
        const result = await runCheck(clean);
        resolve(result);
      }, debounceMs);
    });
  };

  const reset = () => {
    setExists(null);
    lastPhoneRef.current = '';
  };

  return { check, loading, exists, reset };
};
