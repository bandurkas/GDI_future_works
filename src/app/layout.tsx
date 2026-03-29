import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import './globals.css';
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';
import ThemeProvider from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageContext';
import { CartProvider } from '@/components/CartContext';
import { cookies, headers } from 'next/headers';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import LazyOneTap from '@/components/LazyOneTap';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { auth } from '@/auth';
import { GoogleAnalytics } from '@next/third-parties/google';
import { jwtVerify } from 'jose';

// Fix #1 — Self-hosted fonts via next/font (eliminates render-blocking @import)

// Fix #1 — Self-hosted fonts via next/font (eliminates render-blocking @import)
// Next.js downloads fonts at build time, serves from same origin, adds <link rel="preload">
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-body',
  preload: true,
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
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cookieStore = await cookies();

  // If no NextAuth session, check legacy gdi_session so SessionProvider is pre-populated
  // and the navbar never shows "Log in" for an already-authenticated user.
  let effectiveSession = session;
  if (!effectiveSession) {
    const gdiToken = cookieStore.get('gdi_session')?.value;
    if (gdiToken) {
      try {
        const { payload } = await jwtVerify(gdiToken, new TextEncoder().encode(process.env.JWT_SECRET ?? ''));
        effectiveSession = {
          user: { name: (payload.name as string) || 'User', email: payload.email as string },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        } as any;
      } catch { /* invalid token — stay logged out */ }
    }
  }
  const headerStore = await headers();

  // Language detection — priority: cookie > Accept-Language header > default 'en'
  const langCookie = cookieStore.get('GDI_LANG')?.value;
  let initialLang: 'en' | 'id';
  if (langCookie === 'id' || langCookie === 'en') {
    initialLang = langCookie;
  } else {
    const acceptLang = headerStore.get('accept-language') ?? '';
    initialLang = acceptLang.toLowerCase().includes('id') ? 'id' : 'en';
  }

  // Currency detection — priority: cookie > language > default 'MYR'
  const currCookie = cookieStore.get('GDI_CURRENCY')?.value;
  let initialCurr: 'IDR' | 'MYR';
  if (currCookie === 'IDR' || currCookie === 'MYR') {
    initialCurr = currCookie;
  } else {
    initialCurr = initialLang === 'id' ? 'IDR' : 'MYR';
  }

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${poppins.variable}`}
    >
      <head>

        <link rel="preconnect" href="https://app.midtrans.com" />
        <link rel="dns-prefetch" href="https://app.midtrans.com" />
      </head>
      <body>
        <GoogleAuthProvider session={effectiveSession}>
          <LazyOneTap />
          <CurrencyProvider initialCurrency={initialCurr}>
            <ThemeProvider>
              <LanguageProvider initialLanguage={initialLang}>
                <CartProvider>
                  <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
                </CartProvider>
              </LanguageProvider>
            </ThemeProvider>
          </CurrencyProvider>
        </GoogleAuthProvider>
      </body>
          <GoogleAnalytics gaId="G-HJ7BSBB2SF" />
    </html>
  );
}
