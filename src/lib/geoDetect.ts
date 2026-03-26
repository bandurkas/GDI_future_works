/**
 * Shared geo-detection utility.
 * Both CurrencyContext and LanguageContext call getCountryCode().
 *
 * Detection order:
 *  1. navigator.language  — instant, no API call (covers most ID/MY users)
 *  2. ipapi.co            — accurate IP lookup, used only when language is ambiguous
 *
 * The API fetch fires at most once per page load (promise cached at module level).
 */

let geoPromise: Promise<string | null> | null = null;

/** Fast heuristic: returns 'ID' if browser language is Indonesian, else null */
function guessCountryFromBrowserLang(): string | null {
    if (typeof navigator === 'undefined') return null;
    const lang = navigator.language?.toLowerCase() ?? '';
    if (lang.startsWith('id')) return 'ID';       // id, id-ID
    if (lang === 'ms' || lang.startsWith('ms-')) return 'MY'; // ms, ms-MY
    return null;
}

export function getCountryCode(): Promise<string | null> {
    // Layer 1: instant browser language heuristic
    const fast = guessCountryFromBrowserLang();
    if (fast) return Promise.resolve(fast);

    // Layer 2: IP-based lookup (cached — fires only once)
    if (!geoPromise) {
        geoPromise = fetch('https://ipapi.co/json/', {
            signal: AbortSignal.timeout(3000),
        })
            .then(r => (r.ok ? r.json() : null))
            .then((data: { country_code?: string } | null) => data?.country_code ?? null)
            .catch(() => null);
    }
    return geoPromise;
}
