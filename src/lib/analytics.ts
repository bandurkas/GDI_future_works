/**
 * Unified Analytics Engine
 * Connects GA4 and Meta Pixel for consistent event tracking.
 */

import { getStoredUTMs } from './utm';

/**
 * Tracks a 'Lead' or 'Conversion' event across all platforms.
 * @param eventName The type of conversion (e.g., 'whatsapp_click', 'tutor_application')
 * @param source Optional detail about where the lead occurred
 */
export const trackConversion = (eventName: string, source?: string) => {
    if (typeof window === 'undefined') return;

    const utms = getStoredUTMs() || {};
    
    const eventParams = {
        event_category: 'conversion',
        event_label: source || eventName,
        value: 1,
        ...utms,
    };

    // 1. GA4 Event
    if ((window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
            ...eventParams,
            method: eventName,
        });
        console.log(`[Analytics] GA4: generate_lead (${eventName})`, eventParams);
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
        (window as any).gtag('event', name, { ...params, ...utms });
    }
};
