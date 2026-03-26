// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable gzip compression — reduces HTML/JS/CSS transfer by ~70%
    compress: true,

    // Remove X-Powered-By header
    poweredByHeader: false,

    // Image optimization — serve WebP/AVIF instead of PNG/JPEG
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [390, 640, 768, 1024, 1280, 1440],
        imageSizes: [48, 80, 128, 256, 384],
    },

    async headers() {
        return [
            {
                // Cache static assets for 1 year (Next.js content-hashes filenames)
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                // Cache public folder assets for 30 days
                source: '/assets/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
                ],
            },
            {
                // Security + type headers for all pages
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://app.midtrans.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' https://accounts.google.com https://app.midtrans.com https://www.google-analytics.com; frame-src https://accounts.google.com https://app.midtrans.com; object-src 'none'; base-uri 'self'; form-action 'self'",
                    },
                ],
            },
        ];
    },

    async redirects() {
        return [
            {
                source: '/courses',
                destination: '/',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
