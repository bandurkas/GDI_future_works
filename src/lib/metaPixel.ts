/**
 * Utility for triggering Meta Pixel events with safety checks and logging.
 */
export const trackLead = (source?: string) => {
    if (typeof window !== 'undefined') {
        // Log to console for debugging
        console.log(`[Meta Pixel] Lead Event Triggered${source ? ` from: ${source}` : ''}`);

        // Trigger Meta Pixel event if defined
        if ((window as any).fbq) {
            (window as any).fbq('track', 'Lead', source ? { content_name: source } : undefined);
        }
    }
};
