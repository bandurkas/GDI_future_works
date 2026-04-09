/**
 * UTM Tracking Engine
 * Captures, persists, and provides marketing attribution data.
 */

export interface UTMData {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    timestamp?: number;
}

const STORAGE_KEY = 'gdi_utm_data';
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Captures UTM parameters from the current URL and persists them.
 */
export const captureUTMs = () => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmTerm = params.get('utm_term');

    // Only update if at least one UTM is present
    if (utmSource || utmMedium || utmCampaign) {
        const data: UTMData = {
            utmSource: utmSource || undefined,
            utmMedium: utmMedium || undefined,
            utmCampaign: utmCampaign || undefined,
            utmContent: utmContent || undefined,
            utmTerm: utmTerm || undefined,
            timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('[UTM Engine] Captured new attribution patterns:', data);
    }
};

/**
 * Retrieves stored UTM data.
 */
export const getStoredUTMs = (): UTMData | null => {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
        const data: UTMData = JSON.parse(stored);
        
        // Check for expiration
        if (data.timestamp && Date.now() - data.timestamp > EXPIRY_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        
        return data;
    } catch {
        return null;
    }
};

/**
 * Clears stored UTM data (to be used after successful conversion if desired).
 */
export const clearUTMs = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
};
