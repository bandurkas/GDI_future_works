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
