// @ts-check
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,

    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
    },

    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [390, 640, 768, 1024, 1280, 1440],
        imageSizes: [48, 80, 128, 256, 384],
        minimumCacheTTL: 2592000,
    },

    async headers() {
        return [
            {
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/deferred.css',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
                ],
            },
            {
                source: '/assets/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
                ],
            },
            {
                source: '/:file(.*\\.webp)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
                ],
            },
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://app.midtrans.com https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' https://accounts.google.com https://app.midtrans.com https://api.midtrans.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://www.facebook.com; frame-src https://accounts.google.com https://id.google.com https://app.midtrans.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'" },
                ],
            },
        ];
    },

    async redirects() {
        return [
            { source: '/courses', destination: '/', permanent: true },
        ];
    },
};

export default withBundleAnalyzer(nextConfig);
