import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ThemeProvider from '@/components/ThemeProvider';
import ScrollReveal from '@/components/ScrollReveal';
import { LanguageProvider } from '@/components/LanguageContext';
import { CartProvider } from '@/components/CartContext';
import { cookies } from 'next/headers';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import GoogleOneTapPopup from '@/components/GoogleOneTapPopup';

// Fix #1 — Self-hosted fonts via next/font (eliminates render-blocking @import)
// Next.js downloads fonts at build time, serves from same origin, adds <link rel="preload">
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-display',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: {
    default: 'GDI FutureWorks — IT Courses That Get You Hired',
    template: '%s | GDI FutureWorks',
  },
  description: 'Live online IT courses led by industry professionals. Learn data analytics, Python, AI, and more. Build real projects. Start your tech career faster.',
  keywords: ['IT courses', 'data analytics', 'Python', 'AI', 'online learning', 'tech career', 'Indonesia', 'Southeast Asia'],
  authors: [{ name: 'Global Digital Informasi' }],
  openGraph: {
    type: 'website',
    siteName: 'GDI FutureWorks',
    title: 'GDI FutureWorks — IT Courses That Get You Hired',
    description: 'Live online IT courses led by industry professionals. Build real projects and join the tech workforce faster.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fix #9 — Dynamic lang attribute based on cookie
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('GDI_LANG')?.value;
  const htmlLang = langCookie === 'id' ? 'id' : 'en';

  return (
    <html
      lang={htmlLang}
      suppressHydrationWarning
      // Apply font CSS variables so --font-display and --font-body in globals.css resolve correctly
      className={`${jakartaSans.variable} ${poppins.variable}`}
    >
      <head>
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HJ7BSBB2SF"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HJ7BSBB2SF');
            `,
          }}
        />
        {/* Fix #4 — Preconnect to Midtrans so snap.js TCP handshake starts early (only on payment page) */}
        <link rel="preconnect" href="https://app.midtrans.com" />
        <link rel="dns-prefetch" href="https://app.midtrans.com" />
        {/* Midtrans snap.js is loaded per-page on /payment to avoid 689KB on every page */}
        {/* ChunkLoadError recovery — hard reload when a stale JS chunk 404s after a new deploy */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var msg = (e && e.message) || '';
                var src = (e && e.filename) || '';
                if (
                  (msg.includes('ChunkLoad') || msg.includes('Loading chunk') || msg.includes('Failed to fetch dynamically')) ||
                  (src.includes('/_next/static/chunks/') && e.type === 'error')
                ) {
                  // window.location.reload();
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                var msg = (e && e.reason && e.reason.message) || '';
                if (msg.includes('ChunkLoad') || msg.includes('Loading chunk') || msg.includes('Failed to fetch dynamically')) {
                  // window.location.reload();
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <GoogleAuthProvider>
          <GoogleOneTapPopup />
          <ThemeProvider>
            <LanguageProvider>
              <CartProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <BottomNav />
              <ScrollReveal />
            </CartProvider>
            </LanguageProvider>
          </ThemeProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
