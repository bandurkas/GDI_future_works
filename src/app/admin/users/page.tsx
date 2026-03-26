import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/roles';
import UserListClient from './UserListClient';

export default async function AdminUsersPage() {
  const session = await auth();
  // Only OWNER can see this page
  if (!session || (session.user?.role !== ROLES.OWNER && session.user?.role !== 'Owner')) {
    redirect('/admin');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">User Management</h1>
        <p className="text-sm text-gray-400 mt-1">Manage system-wide permissions and roles.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
        <UserListClient initialUsers={users as any} />
      </div>
    </div>
  );
}
