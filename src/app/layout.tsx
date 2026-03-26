import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import './globals.css';
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';
import ThemeProvider from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageContext';
import { CartProvider } from '@/components/CartContext';
import { cookies } from 'next/headers';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import GoogleOneTapPopup from '@/components/GoogleOneTapPopup';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { auth } from '@/auth';

// Fix #1 — Self-hosted fonts via next/font (eliminates render-blocking @import)

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
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cookieStore = await cookies();
  
  // Language detection
  const langCookie = cookieStore.get('GDI_LANG')?.value;
  const initialLang = (langCookie === 'id' || langCookie === 'en') ? langCookie : 'en';

  // Currency detection
  const currCookie = cookieStore.get('GDI_CURRENCY')?.value;
  let initialCurr: 'IDR' | 'MYR' = (currCookie === 'IDR' || currCookie === 'MYR') ? currCookie : 'IDR';
  
  // Default currency logic based on language if currency cookie is missing
  if (!currCookie) {
    initialCurr = initialLang === 'id' ? 'IDR' : 'MYR';
  }

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
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
        <link rel="preconnect" href="https://app.midtrans.com" />
        <link rel="dns-prefetch" href="https://app.midtrans.com" />
      </head>
      <body>
        <GoogleAuthProvider session={session}>
          <GoogleOneTapPopup />
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
    </html>
  );
}
