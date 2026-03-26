'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/crm/login';
  const isStudents = pathname.startsWith('/crm/students');
  const isTutors = pathname.startsWith('/crm/tutors');

  if (isLoginPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#f5f6fa',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#f7f7f5',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      overflow: 'hidden',
    }}>
      <style>{`div[style*="z-index: 9999"] * { box-sizing: border-box; }`}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', minWidth: '220px',
        background: '#111',
        display: 'flex', flexDirection: 'column',
        height: '100%',
      }}>

        {/* Logo */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', background: '#e43a3d',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>G</span>
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '15px', fontWeight: 700, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>GDI</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>CRM Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 12px', marginBottom: '4px' }}>
            Overview
          </div>
          <NavItem href="/crm/students" active={isStudents} icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }>Students</NavItem>

          <NavItem href="/crm/tutors" active={isTutors} icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          }>Tutors</NavItem>
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <form action="/api/crm/logout" method="POST">
            <button
              type="submit"
              style={{
                width: '100%', background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 500,
                transition: 'all 0.15s', textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Top bar */}
        <div style={{
          height: '56px', minHeight: '56px',
          background: 'white',
          borderBottom: '1px solid #ebebeb',
          display: 'flex', alignItems: 'center',
          padding: '0 32px',
          gap: '8px',
        }}>
          <span style={{ fontSize: '13px', color: '#bbb', fontWeight: 400 }}>GDI FutureWorks</span>
          <span style={{ color: '#ddd' }}>/</span>
          <span style={{ fontSize: '13px', color: '#333', fontWeight: 600 }}>
            {isStudents ? 'Students' : isTutors ? 'Tutors' : 'CRM'}
          </span>
        </div>

        {/* Page content */}
        <div style={{ padding: '36px 36px 60px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, active, icon, children }: {
  href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
      textDecoration: 'none',
      background: active ? 'rgba(228,58,61,0.15)' : 'transparent',
      color: active ? '#e43a3d' : 'rgba(255,255,255,0.55)',
      fontSize: '13px', fontWeight: active ? 600 : 400,
      transition: 'all 0.15s',
    }}>
      <span style={{ opacity: active ? 1 : 0.8, flexShrink: 0 }}>{icon}</span>
      {children}
      {active && (
        <span style={{
          marginLeft: 'auto', width: '5px', height: '5px',
          background: '#e43a3d', borderRadius: '50%',
        }} />
      )}
    </Link>
  );
}
