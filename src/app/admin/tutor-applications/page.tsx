import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function TutorApplicationsPage() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const applications = await prisma.tutorApplication.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Tutor Applications
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Review new tutor applications submitted via the public apply form.</p>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Expertise</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>{app.name}</td>
                <td style={{ padding: '16px' }}>{app.email}</td>
                <td style={{ padding: '16px' }}>{app.expertise}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: app.status === 'APPROVED' ? '#ECFDF5' : app.status === 'PENDING' ? '#FFFBEB' : '#FEF2F2',
                    color: app.status === 'APPROVED' ? '#059669' : app.status === 'PENDING' ? '#D97706' : '#DC2626',
                  }}>{app.status}</span>
                </td>
                <td style={{ padding: '16px' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ color: '#999', fontSize: '14px' }}>No tutor applications found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
