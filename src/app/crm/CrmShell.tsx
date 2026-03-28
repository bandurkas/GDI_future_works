'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import styles from './CrmShell.module.css';
import nav from './crm-nav.module.css';

export default function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/crm/login';
  const isStudents = pathname.startsWith('/crm/students');
  const isTutors = pathname.startsWith('/crm/tutors');
  const [collapsed, setCollapsed] = useState(false);

  if (isLoginPage) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, fontFamily: "'DM Sans', sans-serif" }}>
        {children}
      </div>
    );
  }

  const pageLabel = isStudents ? 'Students' : isTutors ? 'Tutors' : 'Dashboard';

  return (
    <div className={styles.wrap}>
      {/* ── Sidebar ── */}
      <aside className={collapsed ? `${styles.sidebar} ${styles.sidebarCollapsed}` : styles.sidebar}>
        {/* Logo row */}
        <div className={collapsed ? `${styles.logo} ${styles.logoCenter}` : styles.logo}>
          <div className={styles.logoLeft}>
            <div className={styles.logoMark}>
              <span className={styles.logoMarkLetter}>G</span>
            </div>
            {!collapsed && (
              <div className={styles.logoTexts}>
                <div className={styles.logoName}>GDI CRM</div>
                <div className={styles.logoVersion}>V3.0 ENTERPRISE</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className={styles.toggleBtn} onClick={() => setCollapsed(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {!collapsed && <div className={styles.navSection}>Manage</div>}

          <NavItem href="/crm/students" active={isStudents} collapsed={collapsed} icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }>Students & Leads</NavItem>

          <NavItem href="/crm/tutors" active={isTutors} collapsed={collapsed} icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          }>Tutor Pipeline</NavItem>
        </nav>

        {/* Bottom: user + logout */}
        <div className={styles.userSection}>
          {collapsed ? (
            <button
              className={`${styles.toggleBtn} ${styles.toggleBtnFull}`}
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
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
              <form action="/api/crm/logout" method="POST">
                <button type="submit" className={styles.logoutBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        {/* Top bar */}
        <div className={styles.topbar}>
          {collapsed && (
            <button className={styles.toggleBtn} onClick={() => setCollapsed(false)} style={{ marginRight: '4px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
          <span className={styles.topbarCrumb}>GDI FutureWorks</span>
          <span className={styles.topbarSep}>/</span>
          <span className={styles.topbarPage}>{pageLabel}</span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, active, collapsed, icon, children }: {
  href: string; active: boolean; collapsed: boolean; icon: React.ReactNode; children: React.ReactNode;
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
    </Link>
  );
}
