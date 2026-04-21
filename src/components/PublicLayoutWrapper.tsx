'use client';

import { usePathname } from 'next/navigation';
import Navbar from './NavbarPremium';
import Footer from './Footer';
import ScrollReveal from './ScrollReveal';
import dynamic from 'next/dynamic';

const WhatsAppButton = dynamic(() => import('./WhatsAppButton'), { ssr: false });
const DigitalAdvisor = dynamic(() => import('./DigitalAdvisor'), { ssr: false });
const PromoPopup = dynamic(() => import('./PromoPopup'), { ssr: false });

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Host-based isolation for CRM
  const isCrmSubdomain = typeof window !== 'undefined' && window.location.hostname.startsWith('crm.');
  const isAdminRoute = pathname.startsWith('/admin') || isCrmSubdomain;

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
      <DigitalAdvisor />
      <PromoPopup />
    </>
  );
}
