'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { captureUTMs } from '@/lib/utm';
import { GoogleAnalytics } from '@next/third-parties/google';
import MetaPixel from './MetaPixel';

/**
 * TrackingInitializer handles:
 * 1. Capturing UTM parameters from the URL on every page load.
 * 2. Conditionally loading GA4 and Meta Pixel (excluding internal routes like /admin and /crm).
 */
function TrackingLogic() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // 1. Capture UTMs whenever the URL changes
        captureUTMs();
    }, [pathname, searchParams]);

    // Check if the current route is excluded from tracking
    const isExcluded = pathname.startsWith('/admin') || pathname.startsWith('/crm');

    if (isExcluded) {
        return null;
    }

    return (
        <>
            <GoogleAnalytics gaId="G-HJ7BSBB2SF" />
            <MetaPixel />
        </>
    );
}

export default function TrackingInitializer() {
    return (
        <Suspense fallback={null}>
            <TrackingLogic />
        </Suspense>
    );
}
