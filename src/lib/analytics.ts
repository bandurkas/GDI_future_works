import { getStoredUTMs } from './utm';

/**
 * Retrieves the GA4 Client ID asynchronously.
 * Returns a promise that resolves to the CID or null if not available.
 */
export const getGAClientId = (): Promise<string | null> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve(null);
        
        const gaId = 'G-HJ7BSBB2SF';
        let isResolved = false;

        const timeout = setTimeout(() => {
            isResolved = true;
            resolve(null);
        }, 3000); // 3s safety timeout

        const tryGet = () => {
            if (isResolved) return;
            
            if ((window as any).gtag) {
                (window as any).gtag('get', gaId, 'client_id', (clientId: string) => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timeout);
                    resolve(clientId);
                });
            } else {
                setTimeout(tryGet, 200);
            }
        };

        tryGet();
    });
};

/**
 * Utility to get cookie value by name.
 */
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

/**
 * Retrieves Meta/Facebook Click ID (fbc) and Browser ID (fbp) from cookies.
 */
export const getFbc = () => getCookie('_fbc');
export const getFbp = () => getCookie('_fbp');

/**
 * Tracks a 'Lead' or 'Conversion' event across all platforms.
 * @param eventName The type of conversion (e.g., 'whatsapp_click', 'tutor_application')
 * @param source Optional detail about where the lead occurred
 */
export const trackConversion = (eventName: string, source?: string) => {
    if (typeof window === 'undefined') return;

    const utms = getStoredUTMs() || {};
    
    // Remap events for GA4 parity as requested
    let gaEventName = 'generate_lead';
    if (eventName === 'whatsapp_click' || eventName === 'contact_whatsapp') {
        gaEventName = 'contact_whatsapp';
    }

    const eventParams = {
        event_category: 'conversion',
        event_label: source || eventName,
        value: 1,
        transport_type: 'beacon', // Hardened for mobile/redirects
        ...utms,
    };

    // 1. GA4 Event
    if ((window as any).gtag) {
        (window as any).gtag('event', gaEventName, {
            ...eventParams,
            method: eventName,
        });
        console.log(`[Analytics] GA4: ${gaEventName} (${eventName})`, eventParams);
    }

    // 2. Meta Pixel Event
    if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
            content_name: source || eventName,
            content_category: eventName,
            ...utms,
        });
        console.log(`[Analytics] Meta Pixel: Lead (${eventName})`, utms);
    }
};

/**
 * Tracks generic UI interactions or non-conversion events.
 */
export const trackEvent = (name: string, params?: any) => {
    if (typeof window === 'undefined') return;

    const utms = getStoredUTMs() || {};

    if ((window as any).gtag) {
        (window as any).gtag('event', name, { 
            ...params, 
            ...utms,
            transport_type: 'beacon' 
        });
    }
};
