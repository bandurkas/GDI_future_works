'use client';

import './admin.css';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, CreditCard,
  LogOut, Menu, X, ChevronRight, Settings, FileText, UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_ADMIN_ROLES, SYSTEM_ADMIN_ROLES, TUTOR_MANAGER_ROLES, STUDENT_MANAGER_ROLES, ROLES } from '@/lib/roles';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState({ pendingApps: 0, newLeads: 0 });

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
  }, [status, isLoginPage, router]);

  useEffect(() => {
    if (isLoginPage || status !== 'authenticated') return;

    const eventSource = new EventSource('/api/admin/notifications/sse');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications(data);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    return () => eventSource.close();
  }, [isLoginPage, status]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoginPage) return <>{children}</>;

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e43a3d] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || '';
  const name = session?.user?.name || session?.user?.email || 'Admin';
  const email = session?.user?.email || '';
  const initial = name.charAt(0).toUpperCase();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const canSeeItem = (item: { allowedRoles?: string[] }) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  };

  type NavItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
    exact?: boolean;
    allowedRoles?: string[];
    badge?: number;
  };

  const NAV_SECTIONS: { label: string; adminOnly?: boolean; items: NavItem[] }[] = [
    {
      label: 'Core',
      items: [
        { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} />, exact: true },
      ],
    },
    {
      label: 'CRM',
      items: [
        { href: '/admin/students', label: 'Students', icon: <Users size={16} />, allowedRoles: STUDENT_MANAGER_ROLES },
        { href: '/admin/payments', label: 'Payments', icon: <CreditCard size={16} />, allowedRoles: [ROLES.OWNER, ROLES.ADMIN, ROLES.SALES_MANAGER] },
      ],
    },
    {
      label: 'Teaching',
      items: [
        { 
          href: '/admin/tutors', 
          label: 'Tutors & Applications', 
          icon: <GraduationCap size={16} />,
          allowedRoles: TUTOR_MANAGER_ROLES,
          badge: notifications.pendingApps > 0 ? notifications.pendingApps : undefined
        },
      ],
    },
    {
      label: 'System',
      adminOnly: true,
      items: [
        { href: '/admin/users', label: 'Users', icon: <UserCog size={16} />, allowedRoles: [ROLES.OWNER] },
        { href: '/admin/audit-log', label: 'Audit Log', icon: <FileText size={16} />, allowedRoles: SYSTEM_ADMIN_ROLES },
        { href: '/admin/settings', label: 'Settings', icon: <Settings size={16} />, allowedRoles: SYSTEM_ADMIN_ROLES },
      ],
    },
  ];

  const Sidebar = () => (
    <aside className="w-64 shrink-0 bg-[#0a0a0b] text-white flex flex-col h-full border-r border-white/5 shadow-2xl">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e43a3d] to-[#ff6b6b] flex items-center justify-center font-black text-white italic">G</div>
          <div>
            <div className="text-[16px] font-black tracking-tight text-white">GDI Admin</div>
            <div className="text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase mt-0.5">V2 Next-Gen</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7 custom-scrollbar">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(canSeeItem);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              <p className="px-3 mb-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                {section.label}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isActive(item.href, (item as any).exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group',
                        active
                          ? 'bg-[#e43a3d] text-white shadow-lg shadow-[#e43a3d]/20'
                          : 'text-white/40 hover:text-white/90 hover:bg-white/5'
                      )}
                    >
                      <span className={cn('shrink-0 transition-colors', active ? 'text-white' : 'text-white/20 group-hover:text-white/60')}>
                        {item.icon}
                      </span>
                      <span className="truncate flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={cn(
                          'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center animate-in zoom-in duration-300',
                          active ? 'bg-white text-[#e43a3d]' : 'bg-[#e43a3d] text-white'
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {active && !item.badge && <ChevronRight size={12} className="ml-auto opacity-40 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-5 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-[13px] font-black text-white shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{name}</p>
            <p className="text-[10px] text-white/30 truncate uppercase tracking-wider">{userRole}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-bold text-white/40 hover:text-[#ff6b6b] hover:bg-[#e43a3d]/10 transition-all border border-transparent hover:border-[#e43a3d]/20"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans overflow-hidden text-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex flex-col h-full animate-in slide-in-from-left duration-300">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Menu size={20} className="text-gray-900" />
            </button>
            <span className="font-black tracking-tight text-gray-900">GDI Admin</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-[10px] font-black text-white">{initial}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
