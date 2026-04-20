'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import styles from './CrmShell.module.css';
import nav from './crm-nav.module.css';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  BarChart3, 
  Plus, 
  Search, 
  Menu, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronRight
} from 'lucide-react';
import { useManagement } from './ManagementContext';
import LeadDialog from './components/LeadDialog';

type Theme = 'dark' | 'light';

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // On CRM subdomain, middleware rewrites '/login' → '/crm/login' internally,
  // but client-side pathname stays as '/login'. Match both.
  const isLoginPage = pathname === '/crm/login' || pathname === '/login';
  const isStudents = pathname.startsWith('/crm/students') || pathname.startsWith('/students');
  const isTutors = pathname.startsWith('/crm/tutors') || pathname.startsWith('/tutors');
  const isPayments = pathname.startsWith('/crm/payments') || pathname.startsWith('/payments');
  const isAdsReports = pathname.startsWith('/crm/ads-reports') || pathname.startsWith('/ads-reports');
  const { openAddLeadDialog } = useManagement();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isCrmSubdomain, setIsCrmSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsCrmSubdomain(window.location.hostname.startsWith('crm.'));
    }
  }, []);

  const isLight = theme === 'light';
  const [pendingCount, setPendingCount] = useState(0);
  const [newLeadCount, setNewLeadCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const lastLeadCount = useRef<number | null>(null);

  // Load saved theme preference
  useEffect(() => {
    const saved = localStorage.getItem('crm-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  // Fetch pending payment count for sidebar badge
  useEffect(() => {
    fetch('/api/admin/payments/pending-count')
      .then((r) => r.json())
      .then((d) => setPendingCount(d.count ?? 0))
      .catch(() => {});
  }, [pathname]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // SSE: real-time lead notifications
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/admin/notifications/sse');
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const current = data.newLeads ?? 0;
          setNewLeadCount(current);

          if (lastLeadCount.current !== null && current > lastLeadCount.current) {
            const diff = current - lastLeadCount.current;
            playNotificationSound();
            setToast(`🔥 ${diff} new lead${diff > 1 ? 's' : ''}!`);
            setTimeout(() => setToast(null), 5000);

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('GDI CRM — New Lead', {
                body: `${diff} new lead${diff > 1 ? 's' : ''} waiting in Fresh Leads`,
                icon: '/LOGO_FW.svg',
              });
            }

            router.refresh();
          }
          lastLeadCount.current = current;
        } catch {}
      };
      es.onerror = () => { es?.close(); };
    } catch {}
    return () => { es?.close(); };
  }, [router]);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('crm-theme', next);
  }

  if (isLoginPage) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, fontFamily: "'DM Sans', sans-serif" }}>
        {children}
      </div>
    );
  }

  const pageLabel = isStudents ? 'Students' : isTutors ? 'Tutors' : isPayments ? 'Payments' : isAdsReports ? 'Ads Reports' : 'Dashboard';
    // ── CRM Navigation Helpers ──
    const formatLink = (path: string) => {
        if (!isCrmSubdomain) return path;
        return path.replace(/^\/crm/, '') || '/';
    };

    return (
        <div className={styles.wrap} data-crm-theme={theme}>
            {/* ── Sidebar ── */}
            <aside className={collapsed ? `${styles.sidebar} ${styles.sidebarCollapsed}` : styles.sidebar}>
                {/* Logo row */}
                <div className={styles.logo}>
                    <div className={styles.logoLeft}>
                        <div className={styles.logoMark}>G</div>
                        {!collapsed && (
                            <div className={styles.logoTexts}>
                                <div className={styles.logoName}>GDI CRM</div>
                                <div className={styles.logoVersion}>V3.0 ENTERPRISE</div>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button className={styles.toggleBtn} onClick={() => setCollapsed(true)}>
                            <Menu size={16} />
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className={styles.nav}>
                    {!collapsed && <div className={styles.navSection}>Main</div>}

                    <NavItem href={formatLink('/crm/students')} active={isStudents} collapsed={collapsed} icon={<Users size={18} />} badge={newLeadCount}>
                        Sales Pipeline
                    </NavItem>

                    <NavItem href={formatLink('/crm/tutors')} active={isTutors} collapsed={collapsed} icon={<GraduationCap size={18} />}>
                        Tutor Pipeline
                    </NavItem>

                    <NavItem href={formatLink('/crm/payments')} active={isPayments} collapsed={collapsed} badge={pendingCount} icon={<CreditCard size={18} />}>
                        Payments
                    </NavItem>

                    <NavItem href={formatLink('/crm/interests')} active={pathname.includes('/interests')} collapsed={collapsed} icon={<Search size={18} />}>
                        Interests
                    </NavItem>

                    <NavItem href={formatLink('/crm/ads-reports')} active={isAdsReports} collapsed={collapsed} icon={<BarChart3 size={18} />}>
                        Ads Reports
                    </NavItem>
                </nav>

        {/* Bottom: user + logout */}
        <div className={styles.userSection}>
          {collapsed ? (
            <button className={styles.toggleBtn} onClick={() => setCollapsed(false)} style={{ width: '100%', justifyContent: 'center' }}>
              <ChevronRight size={18} />
            </button>
          ) : (
            <>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>AD</div>
                <div className={styles.userMeta}>
                  <div className={styles.userName}>Admin</div>
                  <div className={styles.userRole}>CRM Access</div>
                </div>
              </div>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        {/* Top bar */}
        <div className={styles.topbar}>
          {collapsed && (
            <button className={styles.toggleBtn} onClick={() => setCollapsed(false)}>
              <Menu size={18} />
            </button>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.topbarCrumb}>GDI FutureWorks</span>
            <span className={styles.topbarSep}>/</span>
            <span className={styles.topbarPage}>{pageLabel}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className={styles.themeBtn} onClick={() => {}}>
              <Search size={14} />
              Search...
            </button>

            <button 
              className={styles.themeBtn} 
              style={{ background: 'var(--crm-brand)', color: 'white', borderColor: 'transparent' }}
              onClick={openAddLeadDialog}
            >
              <Plus size={14} />
              New Lead
            </button>

            <button className={styles.themeBtn} onClick={toggleTheme}>
              {isLight ? <Moon size={14} /> : <Sun size={14} />}
              {isLight ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
          background: 'linear-gradient(135deg, #e43a3d, #c0292c)',
          color: '#fff', padding: '14px 22px', borderRadius: '12px',
          fontSize: '14px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 8px 32px rgba(228,58,61,0.35)',
          animation: 'slideInRight 0.3s ease-out',
          cursor: 'pointer',
        }} onClick={() => { setToast(null); window.location.href = '/crm/students'; }}>
          {toast}
          <div style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85, marginTop: '2px' }}>
            Click to view →
          </div>
        </div>
      )}
      <LeadDialog />
    </div>
  );
}

function NavItem({ href, active, collapsed, icon, badge, children }: {
  href: string; active: boolean; collapsed: boolean; icon: React.ReactNode; badge?: number; children: React.ReactNode;
}) {
  const cls = [
    nav.item,
    active ? nav.active : '',
    collapsed ? nav.collapsed : '',
  ].filter(Boolean).join(' ');

  return (
    <Link href={href} className={cls} title={collapsed ? String(children) : undefined}>
      <span className={nav.icon}>{icon}</span>
      {!collapsed && <span>{children}</span>}
      {!collapsed && badge && badge > 0 ? (
        <span style={{
          marginLeft: 'auto',
          background: '#EF4444',
          color: '#fff',
          fontSize: '0.68rem',
          fontWeight: 700,
          borderRadius: '100px',
          minWidth: '18px',
          height: '18px',
          padding: '0 5px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}>{badge}</span>
      ) : null}
    </Link>
  );
}
