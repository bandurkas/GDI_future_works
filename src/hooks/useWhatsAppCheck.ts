import { useRef, useState } from 'react';

export const useWhatsAppCheck = (debounceMs: number = 400) => {
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPhoneRef = useRef<string>('');
  const cacheRef = useRef<Map<string, boolean>>(new Map());
  const pendingResolversRef = useRef<Array<(v: boolean) => void>>([]);

  const runCheck = async (phone: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      const result = data.exists === true;
      cacheRef.current.set(phone, result);
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
    if (cacheRef.current.has(clean)) {
      const cached = cacheRef.current.get(clean)!;
      setExists(cached);
      lastPhoneRef.current = clean;
      return Promise.resolve(cached);
    }
    if (clean !== lastPhoneRef.current) {
      setExists(null);
    }
    lastPhoneRef.current = clean;

    if (timerRef.current) clearTimeout(timerRef.current);

    return new Promise((resolve) => {
      pendingResolversRef.current.push(resolve);
      timerRef.current = setTimeout(async () => {
        const result = await runCheck(clean);
        const resolvers = pendingResolversRef.current;
        pendingResolversRef.current = [];
        resolvers.forEach((r) => r(result));
      }, debounceMs);
    });
  };

  const reset = () => {
    setExists(null);
    lastPhoneRef.current = '';
    cacheRef.current.clear();
  };

  return { check, loading, exists, reset };
};
