import { Inter, Fira_Code, Fira_Sans } from 'next/font/google';
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
import TrackingInitializer from '@/components/TrackingInitializer';
import { jwtVerify } from 'jose';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const firaCode = Fira_Code({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
});

const firaSans = Fira_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-sans-alt',
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
  // ── Geo detection priority: cookie → CF header → Accept-Language → default ──
  const cfCountry = headerStore.get('cf-ipcountry') ?? '';
  const isIndonesia = cfCountry === 'ID';

  const langCookie = cookieStore.get('GDI_LANG')?.value;
  let initialLang: 'en' | 'id';
  if (langCookie === 'id' || langCookie === 'en') {
    // Priority 1: user has explicitly set a preference (cookie)
    initialLang = langCookie;
  } else if (cfCountry && cfCountry !== 'XX') {
    // Priority 2: Cloudflare country header (accurate, no API call)
    initialLang = isIndonesia ? 'id' : 'en';
  } else {
    // Priority 3: Accept-Language header fallback (no CF — dev/direct access)
    const acceptLang = headerStore.get('accept-language') ?? '';
    initialLang = acceptLang.toLowerCase().includes('id') ? 'id' : 'en';
  }

  // Currency — same priority order, ID → IDR, everyone else → MYR
  const currCookie = cookieStore.get('GDI_CURRENCY')?.value;
  let initialCurr: 'IDR' | 'MYR';
  if (currCookie === 'IDR' || currCookie === 'MYR') {
    // Priority 1: user preference
    initialCurr = currCookie;
  } else if (cfCountry && cfCountry !== 'XX') {
    // Priority 2: Cloudflare country header
    initialCurr = isIndonesia ? 'IDR' : 'MYR';
  } else {
    // Priority 3: derive from resolved language
    initialCurr = initialLang === 'id' ? 'IDR' : 'MYR';
  }

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
      className={`${inter.variable} ${firaCode.variable} ${firaSans.variable}`}
    >
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://app.midtrans.com" />
        <link rel="dns-prefetch" href="https://app.midtrans.com" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        {/* Preload LCP hero image for homepage */}
        <link
          rel="preload"
          as="image"
          href="/assets/notion_hero_right.webp"
          imageSizes="(max-width: 1200px) 280px, 380px"
        />
        {/* Non-critical CSS loaded async — cards, forms, animations, utilities */}
        <script dangerouslySetInnerHTML={{ __html: "var l=document.createElement('link');l.rel='stylesheet';l.href='/deferred.css';document.head.appendChild(l);" }} />
        <noscript><link rel="stylesheet" href="/deferred.css" /></noscript>
        {/* Microsoft Clarity — session recordings + heatmaps */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "wdhsnq3gas");`}
        </Script>
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
        {/* Centralized Analytics & UTM Capture */}
        <TrackingInitializer />
      </body>
    </html>
  );
}
