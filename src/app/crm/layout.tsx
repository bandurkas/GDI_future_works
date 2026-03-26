import { getCrmSession } from '@/lib/crm-session';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import CrmShell from './CrmShell';

export const metadata = { title: 'GDI CRM' };

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isLoginPage = pathname === '/crm/login';

  if (!isLoginPage) {
    const session = await getCrmSession();
    if (!session) redirect('/crm/login');
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
      <CrmShell>{children}</CrmShell>
    </>
  );
}
