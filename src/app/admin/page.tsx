import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowRight
} from "lucide-react";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    // Fetch Marketplace Stats
    const [tutorCount, pendingTutors, studentCount, activeSessions, recentBookings, totalRevenue] = await Promise.all([
        prisma.tutor.count(),
        prisma.tutor.count({ where: { status: 'PENDING' } }),
        prisma.student.count(),
        prisma.session.count({ where: { status: 'SCHEDULED', startTime: { gt: new Date() } } }),
        prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { 
                student: { include: { user: true } }, 
                session: { include: { course: true } } 
            }
        }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID' }
        })
    ]);

    const stats = [
        { label: "Total Tutors", value: tutorCount, subtext: `${pendingTutors} pending approval`, icon: GraduationCap, color: "#3B82F6" },
        { label: "Active Students", value: studentCount, subtext: "Lifetime registered", icon: Users, color: "#10B981" },
        { label: "Upcoming Sessions", value: activeSessions, subtext: "Next 7 days", icon: Calendar, color: "#F59E0B" },
        { label: "Gross Revenue", value: `Rp ${(Number(totalRevenue._sum.amount || 0)).toLocaleString('id-ID')}`, subtext: "Settled payments", icon: TrendingUp, color: "#EF4444" },
    ];

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-1px' }}>
                    Marketplace Overview
                </h1>
                <p style={{ color: '#666', fontSize: '16px' }}>Welcome back, {(session.user as any)?.name}. Here's what's happening today.</p>
            </header>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ 
                        padding: '24px', 
                        background: 'white', 
                        borderRadius: '16px', 
                        border: '1px solid #eee',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', background: `${stat.color}10`, color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a1a' }}>{stat.value}</div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{stat.subtext}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '40px' }}>
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Bookings</h2>
                        <Link href="/admin/bookings" style={{ fontSize: '13px', color: '#e43a3d', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Student</th>
                                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Course</th>
                                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{b.student.user.email}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>ID: {b.studentId.split('-')[0]}</div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{b.session.course.title}</td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{new Date(b.session.startTime).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '11px', 
                                                fontWeight: 700,
                                                background: b.status === 'BOOKED' ? '#ECFDF5' : '#FEF2F2',
                                                color: b.status === 'BOOKED' ? '#059669' : '#DC2626'
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                            No recent bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Marketplace Health</h2>
                    <div style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#666' }}>Tutor Verification Rate</span>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{Math.round((tutorCount - pendingTutors) / (tutorCount || 1) * 100)}%</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', background: '#f0f0f0', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(tutorCount - pendingTutors) / (tutorCount || 1) * 100}%`, background: '#10B981' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '12px', background: '#F8F9FA' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: '#fff', border: '1px solid #eee' }}>
                                <Clock size={20} color="#666" />
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>Tutor Payouts Pending</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>Next run: Monday, March 23</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
