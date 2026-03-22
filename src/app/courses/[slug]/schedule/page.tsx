'use client';
import { useState, use, useEffect } from 'react';
import { useCurrency } from '@/components/CurrencyContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCourseBySlug } from '@/data/courses';
import { useCart } from '@/components/CartContext';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

const STEPS = [
    { number: 1, label: 'Select Time' },
    { number: 2, label: 'Your Details' },
    { number: 3, label: 'Payment' },
];

type Props = { params: Promise<{ slug: string }> };

export default function SchedulePage({ params }: Props) {
    const { slug } = use(params);
    const router = useRouter();
    const { data: session, status } = useSession();
    const course = getCourseBySlug(slug);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { addItem, customerInfo, updateCustomerInfo } = useCart();
    
    const isAuthenticated = status === 'authenticated';
    
    // Contact State
    const [email, setEmail] = useState(customerInfo.email || '');
    const [phone, setPhone] = useState(customerInfo.phone || '');

    // Prefill from session if empty
    useEffect(() => {
        if (session?.user) {
            if (!email && session.user.email) setEmail(session.user.email);
        }
    }, [session, email]);

    const selected = course?.schedules?.find(d => d.id === selectedId);
    
    const canContinue = selectedId && (isAuthenticated || email.trim().length > 0 || phone.trim().length > 0);

    const handleNext = () => {
        if (!canContinue || !selected || !course) return;
        
        // Save customer info to context
        updateCustomerInfo({ email, phone });
        
        // Add course to cart
        addItem({
            courseId: course.id,
            courseTitle: course.title,
            slug: course.slug,
            dateId: selected.id,
            dateLabel: selected.date,
            timeLabel: `${selected.time}–${selected.timeEnd}`,
            priceIDR: course.priceIDR,
            priceMYR: course.priceMYR,
            icon: course.icon
        });
        
        // Immediate redirect to cart
        router.push('/cart');
    };

    if (!course) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.inner}>
                    {/* Top flow control */}
                    <button onClick={() => router.back()} className={styles.flowBackBtn} aria-label="Go back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        <span>Back</span>
                    </button>

                    {/* Progress indicator */}
                    <div className={styles.progress}>
                        {STEPS.map((s, i) => (
                            <div key={s.number} className={styles.progressStep}>
                                <div className={`${styles.stepBubble} ${s.number === 1 ? styles.stepActive : ''}`}>
                                    {s.number}
                                </div>
                                <span className={`${styles.stepLabel} ${s.number === 1 ? styles.stepLabelActive : ''}`}>{s.label}</span>
                                {i < STEPS.length - 1 && <div className={styles.stepLine} />}
                            </div>
                        ))}
                    </div>

                    <div>
                        <h1 className={styles.title}>Choose a time that works for you.</h1>
                        <p className={styles.subtitle}>
                            Session for <strong>{course.title}</strong> · {course.format}
                        </p>
                    </div>

                    {/* Date grid */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionLabel}>📅 Available Dates</h3>
                        
                        {(!course.schedules || course.schedules.length === 0) ? (
                            <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center', marginTop: '16px' }}>
                                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>No upcoming schedules available.</h4>
                                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Please contact us via WhatsApp to arrange a session or inquire about future dates.
                                </p>
                            </div>
                        ) : (
                            <div className={styles.dateGrid}>
                                {course.schedules.map((slot) => {
                                    const isFull = slot.seatsLeft === 0;
                                    const isUrgent = slot.seatsLeft > 0 && slot.seatsLeft <= 3;
                                    const dayNames = slot.dayOfWeek.split(/[–-]/);
                                    const dayName = dayNames.length > 0 ? dayNames[0] : slot.dayOfWeek;
                                    
                                    return (
                                        <button
                                            key={slot.id}
                                            className={`${styles.dateCard} ${selectedId === slot.id ? styles.dateSelected : ''} ${isUrgent ? styles.dateUrgent : ''} ${isFull ? styles.dateFull : ''}`}
                                            onClick={() => !isFull && setSelectedId(slot.id)}
                                            aria-pressed={selectedId === slot.id}
                                            disabled={isFull}
                                            id={`date-${slot.id}`}
                                        >
                                            <span className={styles.dayName}>{dayName}</span>
                                            <span className={styles.dayNum}>{slot.day}</span>
                                            <span className={styles.dayMonth}>{slot.month}</span>
                                            {isFull ? (
                                                <span className={styles.fullBadge}>Fully Booked</span>
                                            ) : slot.seatsLeft <= 5 ? (
                                                <span className={styles.seatBadge}>{slot.seatsLeft} left</span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Time slot — appears on selection */}
                    {selected && (
                        <div className={`${styles.section} ${styles.timeSection}`}>
                            <h3 className={styles.sectionLabel}>🕒 Session Time</h3>
                            <div className={styles.timeSlot}>
                                <span className={styles.timeIcon}>🕒</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className={styles.timeVal}>{selected.time}–{selected.timeEnd || '12:00'} (GMT+8)</span>
                                    <span className={styles.timeMeta}>Live online · 2 hours</span>
                                </div>
                                <div className={styles.timeCheck}>✓</div>
                            </div>
                        </div>
                    )}

                    {/* Contact Information — appears once date is selected, but hidden for logged-in users */}
                    {selected && !isAuthenticated && (
                        <div className={styles.contactSection}>
                            <h3 className={styles.sectionLabel}>👤 Your Details</h3>
                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Email Address</label>
                                    <input 
                                        className={styles.inputField} 
                                        type="email" 
                                        placeholder="example@mail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Phone Number</label>
                                    <input 
                                        className={styles.inputField} 
                                        type="tel" 
                                        placeholder="+62..."
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Specific validation error requested by user */}
                            {!email && !phone && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: '600', marginTop: '4px' }}>
                                    Please enter your email or phone number to continue.
                                </p>
                            )}
                            
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                * We need at least an email or phone number to send your joining link.
                            </p>
                        </div>
                    )}

                    <div className={styles.bottomNote}>
                        💬 Need a different date? WhatsApp us — we open new sessions based on demand.
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!canContinue}
                        className={`btn btn-primary btn-xl btn-full ${!canContinue ? styles.ctaDisabled : ''}`}
                        id="schedule-next-cta"
                    >
                        {selectedId ? (
                            <>Next →</>
                        ) : (
                            <>Select a date to continue</>
                        )}
                    </button>

                    <button onClick={() => router.back()} className={styles.back}>← Back to previous page</button>
                </div>
            </div>
        </div>
    );
}
