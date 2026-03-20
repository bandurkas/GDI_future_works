import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";

const prisma = new PrismaClient();

export default async function CohortsDirectory() {
    const session = await auth();

    let whereClause = {};

    // Instructors only see their assigned cohorts
    if (session?.user?.role === 'INSTRUCTOR') {
        const user = await prisma.appUser.findUnique({
            where: { email: session.user.email || "" },
            include: { cohorts: true }
        });
        
        if (user) {
            whereClause = {
                id: { in: user.cohorts.map(c => c.cohort_id) }
            };
        } else {
             return <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>Instructor profile error.</div>;
        }
    }

    const cohorts = await prisma.cohort.findMany({
        where: whereClause,
        orderBy: { start_date: 'desc' },
        include: {
            course: true,
            enrollments: true,
            instructors: { include: { user: true } }
        }
    });

    return (
        <div style={{ fontFamily: 'var(--font-body)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '28px' }}>Cohort Management</h1>
                {session?.user?.role !== 'INSTRUCTOR' && (
                    <button style={{
                        background: 'var(--red)',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}>
                        + Add Cohort
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {cohorts.map(cohort => (
                    <div key={cohort.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                        
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: '#f8f9fa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
                                    background: cohort.status === 'active' ? '#e0f2fe' : cohort.status === 'completed' ? '#f1f5f9' : '#fef08a',
                                    color: cohort.status === 'active' ? '#0369a1' : cohort.status === 'completed' ? '#475569' : '#854d0e',
                                    textTransform: 'uppercase'
                                }}>
                                    {cohort.status}
                                </span>
                                <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>
                                    {cohort.enrollments.length} / {cohort.max_seats} Enrolled
                                </div>
                            </div>
                            <h2 style={{ fontSize: '16px', margin: '0 0 4px', color: 'var(--dark)' }}>{cohort.course.name}</h2>
                            <div style={{ fontSize: '14px', color: '#555', fontWeight: 500 }}>{cohort.name}</div>
                        </div>

                        <div style={{ padding: '20px', flex: 1 }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Timeline</div>
                                <div style={{ fontSize: '13px', color: 'var(--dark)' }}>
                                    {cohort.start_date.toLocaleDateString()} — {cohort.end_date.toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Teachers</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {cohort.instructors.length > 0 ? cohort.instructors.map(inst => (
                                    <span key={inst.id} style={{ fontSize: '12px', padding: '2px 8px', background: '#eee', borderRadius: '12px', color: '#444' }}>
                                        {inst.user.name.split(' ')[0]}
                                    </span>
                                )) : <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>Unassigned</span>}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                            <button style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--dark)' }}>
                                View Roster
                            </button>
                            {cohort.meeting_url && (
                                <a href={cohort.meeting_url} target="_blank" rel="noreferrer" style={{ padding: '8px 12px', background: 'var(--red)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                                    Zoom Call
                                </a>
                            )}
                        </div>

                    </div>
                ))}
                {cohorts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#888', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                        No requested cohorts available in the system.
                    </div>
                )}
            </div>
        </div>
    );
}
