import { PrismaClient, Tutor, TutorApplication } from '@prisma/client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CheckCircle, XCircle, ExternalLink, Search, Filter } from 'lucide-react';

const prisma = new PrismaClient();

export default async function TutorsAdminPage() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const tutors = await prisma.tutor.findMany({
    include: {
      user: true,
      profile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch all tutor applications to display status
  const applications = await prisma.tutorApplication.findMany();
  const appByEmail = Object.fromEntries(
    applications.map((app: TutorApplication) => [app.email, app])
  );

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              marginBottom: '8px',
              letterSpacing: '-1px',
            }}
          >
            Tutor Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage applications, verification, and marketplace profiles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tutors..."
              style={{
                padding: '10px 12px 10px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '14px',
                width: '240px',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Filter size={16} /> Filter
          </button>
        </div>
      </header>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tutor
              </th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Expertise
              </th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Application
              </th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rating
              </th>
              <th style={{ padding: '16px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {tutors.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-xl)',
                        background: 'var(--accent-light)',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    >
                      {t.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.user.email}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Joined {t.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {t.expertise.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {t.expertise.length > 2 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        +{t.expertise.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      background:
                        t.status === 'APPROVED'
                          ? 'var(--success-light)'
                          : t.status === 'PENDING'
                          ? 'var(--warning-light)'
                          : 'var(--accent-light)',
                      color:
                        t.status === 'APPROVED'
                          ? 'var(--success)'
                          : t.status === 'PENDING'
                          ? 'var(--warning)'
                          : 'var(--accent)',
                    }}
                  >
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {appByEmail[t.user.email] ? (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          appByEmail[t.user.email].status === 'APPROVED'
                            ? 'var(--success-light)'
                            : appByEmail[t.user.email].status === 'PENDING'
                            ? 'var(--warning-light)'
                            : 'var(--accent-light)',
                        color:
                          appByEmail[t.user.email].status === 'APPROVED'
                            ? 'var(--success)'
                            : appByEmail[t.user.email].status === 'PENDING'
                            ? 'var(--warning)'
                            : 'var(--accent)',
                      }}
                    >
                      {appByEmail[t.user.email].status}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>No Application</span>
                  )}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>
                  ⭐ {t.ratingAvg.toFixed(1)}{' '}
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px' }}>
                    ({t.totalReviews})
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      title="View Profile"
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      title="Approve"
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        color: 'var(--success)',
                      }}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      title="Reject"
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        color: 'var(--accent)',
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tutors.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No tutors found in the system.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
