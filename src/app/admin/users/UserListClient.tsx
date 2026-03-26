'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/roles';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
};

export default function UserListClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert('Failed to update role');
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-400 uppercase text-[10px] tracking-wider">
            <th className="px-5 py-3">Name / Email</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-4">
                <p className="font-semibold text-gray-800">{user.name || '—'}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </td>
              <td className="px-5 py-4">
                <select
                  disabled={loadingId === user.id}
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-400 disabled:opacity-50"
                >
                  {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td className="px-5 py-4">
                <span className={cn(
                  'px-2 py-1 rounded-full text-[10px] font-bold',
                  user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                )}>
                  {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
