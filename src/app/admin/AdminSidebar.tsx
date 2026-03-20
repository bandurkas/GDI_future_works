"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminSidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin", roles: ["Owner", "Sales Manager", "Instructor"] },
    { label: "Clients Directory", href: "/admin/clients", roles: ["Owner", "Sales Manager"] },
    { label: "System Users", href: "/admin/users", roles: ["Owner"] },
    { label: "Cohorts & Classes", href: "/admin/cohorts", roles: ["Owner", "Instructor"] },
    { label: "Settings", href: "/admin/settings", roles: ["Owner"] },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--dark)',
      color: 'white',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--red)' }}>GDI Admin</div>
        <div style={{ fontSize: '12px', color: 'var(--gray3)' }}>V1.1 CRM</div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((link) => {
          if (!link.roles.includes(role)) return null;

          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link key={link.href} href={link.href} style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: isActive ? 'var(--red)' : 'transparent',
              color: isActive ? 'white' : 'var(--gray2)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s ease',
            }}>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{userName}</div>
        <div style={{ fontSize: '11px', color: 'var(--gray3)', marginBottom: '16px', textTransform: 'capitalize' }}>{role.toLowerCase()}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center'
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
