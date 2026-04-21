'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Script from 'next/script';
import { captureUTMs } from '@/lib/utm';
import MetaPixel from './MetaPixel';

const GA_ID = 'G-HJ7BSBB2SF';

/**
 * TrackingInitializer handles:
 * 1. Capturing UTM parameters from the URL on every page load.
 * 2. Conditionally loading GA4 and Meta Pixel (excluding internal routes like /admin and /crm).
 * 3. Robust GTAG initialization for mobile/Webview support.
 */
function TrackingLogic() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // 1. Capture UTMs whenever the URL changes
        captureUTMs();
    }, [pathname, searchParams]);

    // Check if the current route is excluded from tracking (Admin / CRM / Internal)
    const isInternalRoute = pathname.startsWith('/admin') || pathname.startsWith('/crm');
    
    if (isInternalRoute) {
        return null;
    }

    return (
        <>
            {/* ── High-Precision GA4 Initialization ── */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="lazyOnload"
            />
            <Script id="ga4-init" strategy="lazyOnload">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    
                    // transport_type: 'beacon' is default for better mobile/webview results
                    gtag('config', '${GA_ID}', {
                        page_path: window.location.pathname,
                        transport_type: 'beacon',
                        send_page_view: true
                    });
                `}
            </Script>

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
