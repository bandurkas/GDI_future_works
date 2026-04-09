import { Metadata } from 'next';
import Link from 'next/link';
import { courses } from '@/data/courses';
import WhatsAppTrackedLink from '@/components/WhatsAppTrackedLink';

export const metadata: Metadata = {
    title: 'Schedule — GDI FutureWorks',
    description: 'Browse upcoming course dates and reserve your spot. Choose a course below to see available session times.',
};

export default function SchedulePage() {
    return (
        <div style={{ paddingTop: 'var(--nav-height)', paddingBottom: 100 }}>
            <div style={{ padding: '48px 20px 32px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <div className="container">
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8 }}>Schedule</p>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 12 }}>
                        Pick a course.<br />Choose your date.
                    </h1>
                    <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.6 }}>
                        All sessions are live, online, and run by active industry experts. Select a course below to see available dates and reserve your spot.
                    </p>
                </div>
            </div>

            <div className="container" style={{ paddingTop: 40 }}>
                <div style={{ display: 'grid', gap: 16 }}>
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.slug}/schedule`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 20,
                                padding: '20px 24px',
                                transition: 'box-shadow 0.2s, transform 0.2s',
                                boxShadow: 'var(--shadow-sm)',
                                cursor: 'pointer',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 4 }}>{course.category || 'Course'}</p>
                                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h3>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>📅 {course.duration || '4 weeks'}</span>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>🌐 {course.format || 'Live Online'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    <span style={{ background: 'var(--success-light)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
                                        Dates available
                                    </span>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div style={{ marginTop: 40, padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Need a custom schedule?</p>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 16 }}>We open new cohorts based on demand. Chat with us and we&apos;ll find a time that works.</p>
                    <WhatsAppTrackedLink 
                        href="/api/whatsapp" 
                        eventSource="general_schedule_wa"
                        style={{ display: 'inline-block', background: 'var(--whatsapp)', color: 'white', fontWeight: 700, fontSize: '0.9375rem', padding: '12px 24px', borderRadius: 100, textDecoration: 'none' }}
                    >
                        Chat on WhatsApp →
                    </WhatsAppTrackedLink>
                </div>
            </div>
        </div>
    );
}
