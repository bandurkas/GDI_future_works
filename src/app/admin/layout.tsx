import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AdminShell from './AdminShell';
import { ADMIN_ROLES } from '@/lib/auth-guards';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware sets x-pathname header so we can detect current route server-side
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    // Login page: just render, no auth check
    return <AdminShell>{children}</AdminShell>;
  }

  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  if (!ADMIN_ROLES.includes(session.user?.role as any)) {
    redirect('/admin/login?error=unauthorized');
  }

  return <AdminShell>{children}</AdminShell>;
}
