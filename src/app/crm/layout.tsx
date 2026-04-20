import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import CrmShell from './CrmShell';
import { ManagementProvider } from './ManagementContext';
import { ALL_ADMIN_ROLES } from '@/lib/roles';

export const metadata = { title: 'GDI CRM' };

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const hostname = headersList.get('host') || '';
  const isCrmSubdomain = hostname.startsWith('crm.');
  const isLoginPage = pathname === '/login' || pathname === '/crm/login';

  if (!isLoginPage) {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const isAdmin = role && ALL_ADMIN_ROLES.includes(role);

    if (!session || !isAdmin) {
      const loginPath = isCrmSubdomain ? '/login' : '/crm/login';
      redirect(loginPath);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
      <ManagementProvider>
        <CrmShell>{children}</CrmShell>
      </ManagementProvider>
    </>
  );
}
