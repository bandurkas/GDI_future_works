import { useCallback } from 'react';
import { trackLead as trackLeadUtil } from '@/lib/metaPixel';

/**
 * Custom React hook for Meta Pixel tracking.
 */
export function useMetaPixel() {
    const trackLead = useCallback((source?: string) => {
        trackLeadUtil(source);
    }, []);

    return { trackLead };
}
