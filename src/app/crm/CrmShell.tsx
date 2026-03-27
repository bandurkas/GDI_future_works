'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

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

  const sideW = collapsed ? '60px' : '220px';
  const pageLabel = isStudents ? 'Students' : isTutors ? 'Tutors' : 'Dashboard';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0d0d0d',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      overflow: 'hidden',
    }}>
      <style>{`
        .crm * { box-sizing: border-box; }
        .crm-nav-item:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.85) !important; }
        .crm-logout:hover { background: rgba(228,58,61,0.15) !important; color: #e43a3d !important; }
        .crm-toggle:hover { background: rgba(255,255,255,0.08) !important; }
        .crm-input:focus { border-color: #e43a3d !important; outline: none !important; box-shadow: 0 0 0 3px rgba(228,58,61,0.12) !important; }
        .crm-card { transition: border-color 0.18s; }
        .crm-card:hover { border-color: rgba(255,255,255,0.14) !important; }
        .crm-chip-email { transition: background 0.12s, color 0.12s; }
        .crm-chip-email:hover { background: rgba(228,58,61,0.12) !important; color: #e43a3d !important; }
        .crm-chip-phone { transition: background 0.12s, color 0.12s; }
        .crm-chip-phone:hover { background: rgba(16,185,129,0.12) !important; color: #10b981 !important; }
        .crm-filter-tab:hover { background: rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.7) !important; }
        .crm-expand-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .crm-action-btn:hover { opacity: 0.85 !important; }
        @keyframes crm-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .crm-toast { animation: crm-fadein 0.22s ease; }
        @keyframes crm-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .crm-live-dot { animation: crm-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className="crm" style={{
        width: sideW,
        minWidth: sideW,
        background: '#111',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1), min-width 0.2s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {/* Logo row */}
        <div style={{
          height: '58px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 14px 0 16px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>
            <div style={{
              width: '30px', height: '30px', background: '#e43a3d',
              borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>G</span>
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 700, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>GDI CRM</div>
                <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>V3.0 ENTERPRISE</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              className="crm-toggle"
              onClick={() => setCollapsed(true)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {!collapsed && (
            <div style={{
              fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '6px 8px 8px',
            }}>Manage</div>
          )}

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
        <div style={{
          padding: '8px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          {collapsed ? (
            <button
              className="crm-toggle"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{
                width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 10px 10px',
                marginBottom: '4px',
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(228,58,61,0.2)', color: '#e43a3d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, fontFamily: "'Syne', sans-serif", flexShrink: 0,
                }}>AD</div>
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>CRM Access</div>
                </div>
              </div>
              <form action="/api/crm/logout" method="POST">
                <button
                  type="submit"
                  className="crm-logout"
                  style={{
                    width: '100%', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontWeight: 500,
                    transition: 'all 0.15s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
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
      <main className="crm" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0d0d0d' }}>
        {/* Top bar */}
        <div style={{
          height: '58px', minHeight: '58px',
          background: '#111',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: '10px',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {collapsed && (
            <button
              className="crm-toggle"
              onClick={() => setCollapsed(false)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', padding: '6px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                marginRight: '4px',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>GDI FutureWorks</span>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>/</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{pageLabel}</span>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, active, collapsed, icon, children }: {
  href: string; active: boolean; collapsed: boolean; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={active ? undefined : 'crm-nav-item'}
      title={collapsed ? String(children) : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? '0' : '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px' : '9px 10px',
        borderRadius: '8px', marginBottom: '2px',
        textDecoration: 'none',
        background: active ? 'rgba(228,58,61,0.12)' : 'transparent',
        color: active ? '#e43a3d' : 'rgba(255,255,255,0.4)',
        fontSize: '13px', fontWeight: active ? 600 : 400,
        transition: 'all 0.15s',
        borderLeft: active && !collapsed ? '2px solid #e43a3d' : '2px solid transparent',
      }}
    >
      <span style={{ flexShrink: 0, lineHeight: 0 }}>{icon}</span>
      {!collapsed && <span>{children}</span>}
    </Link>
  );
}
