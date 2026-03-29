/**
 * Shared geo-detection utility (client-side).
 * Calls /api/geo which reads Cloudflare's cf-ipcountry header server-side.
 * Falls back to Accept-Language on the server when CF is not present (local dev).
 *
 * The promise is cached at module level — only one request per page load,
 * shared between LanguageContext and CurrencyContext.
 */

let geoPromise: Promise<string | null> | null = null;

export function getCountryCode(): Promise<string | null> {
    if (!geoPromise) {
        geoPromise = fetch('/api/geo', {
            signal: AbortSignal.timeout(3000),
        })
            .then(r => (r.ok ? r.json() : null))
            .then((data: { country?: string | null } | null) => data?.country ?? null)
            .catch(() => null);
    }
    return geoPromise;
}
