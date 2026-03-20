"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  Settings, 
  LogOut,
  Target,
  CreditCard
} from "lucide-react";

export default function AdminSidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname();

  const sections = [
    {
      title: "Marketplace",
      links: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["STUDENT", "TUTOR", "ADMIN", "Owner", "Sales Manager", "Instructor"] },
        { label: "Tutors", href: "/admin/tutors", icon: GraduationCap, roles: ["ADMIN", "Owner"] },
        { label: "Students", href: "/admin/students", icon: Users, roles: ["ADMIN", "Owner", "Sales Manager"] },
        { label: "Programs", href: "/admin/programs", icon: BookOpen, roles: ["ADMIN", "Owner"] },
      ]
    },
    {
      title: "Operations",
      links: [
        { label: "Leads CRM", href: "/admin/leads", icon: Target, roles: ["ADMIN", "Owner", "Sales Manager"] },
        { label: "Sessions", href: "/admin/sessions", icon: Calendar, roles: ["ADMIN", "Owner", "Instructor"] },
        { label: "Bookings", href: "/admin/bookings", icon: CheckSquare, roles: ["ADMIN", "Owner", "Sales Manager"] },
      ]
    },
    {
      title: "Financials",
      links: [
        { label: "Payments", href: "/admin/payments", icon: CreditCard, roles: ["ADMIN", "Owner", "Sales Manager"] },
        { label: "Payouts", href: "/admin/payouts", icon: DollarSign, roles: ["ADMIN", "Owner"] },
      ]
    },
    {
      title: "System",
      links: [
        { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["ADMIN", "Owner"] },
      ]
    }
  ];

  return (
    <aside style={{
      width: '260px',
      background: '#1a1a1a',
      color: 'white',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #333',
      height: '100vh',
      position: 'sticky',
      top: 0,
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#e43a3d', letterSpacing: '-0.5px' }}>GDI Admin</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Marketplace OS v2.0</div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        {sections.map((section) => {
          const visibleLinks = section.links.filter(link => link.roles.includes(role));
          if (visibleLinks.length === 0) return null;

          return (
            <div key={section.title}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', padding: '0 8px' }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {visibleLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                  const Icon = link.icon;

                  return (
                    <Link key={link.href} href={link.href} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(228, 58, 61, 0.1)' : 'transparent',
                      color: isActive ? '#e43a3d' : '#888',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.2s ease',
                    }}>
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '20px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
            {userName.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{userName}</div>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'capitalize' }}>{role.toLowerCase()}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: '#888',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#333'; }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
