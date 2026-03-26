'use client';

import { usePathname } from 'next/navigation';
import Navbar from './NavbarPremium';
import Footer from './Footer';
import ScrollReveal from './ScrollReveal';
import WhatsAppButton from './WhatsAppButton';

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ScrollReveal />
      <WhatsAppButton />
    </>
  );
}
