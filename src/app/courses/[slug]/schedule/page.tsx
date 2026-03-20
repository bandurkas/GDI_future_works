'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCourseBySlug } from '@/data/courses';
import { useCart } from '@/components/CartContext';
import styles from './page.module.css';

const STEPS = [
    { number: 1, label: 'Select Time' },
    { number: 2, label: 'Your Details' },
    { number: 3, label: 'Payment' },
];

const MOCK_DATES = [
    { id: 's1', dayName: 'Wed', day: 12, month: 'Mar', time: '19:00–21:00', seatsLeft: 3 },
    { id: 's2', dayName: 'Fri', day: 14, month: 'Mar', time: '10:00–12:00', seatsLeft: 8 },
    { id: 's3', dayName: 'Wed', day: 19, month: 'Mar', time: '19:00–21:00', seatsLeft: 12 },
    { id: 's4', dayName: 'Fri', day: 21, month: 'Mar', time: '14:00–16:00', seatsLeft: 10 },
    { id: 's5', dayName: 'Wed', day: 26, month: 'Mar', time: '19:00–21:00', seatsLeft: 15 },
    { id: 's6', dayName: 'Wed', day: 2, month: 'Apr', time: '19:00–21:00', seatsLeft: 14 },
    { id: 's7', dayName: 'Sat', day: 5, month: 'Apr', time: '10:00–12:00', seatsLeft: 10 },
    { id: 's8', dayName: 'Wed', day: 9, month: 'Apr', time: '19:00–21:00', seatsLeft: 14 },
];

type Props = { params: Promise<{ slug: string }> };

export default function SchedulePage({ params }: Props) {
    const { slug } = use(params);
    const router = useRouter();
    const course = getCourseBySlug(slug);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const selected = MOCK_DATES.find(d => d.id === selectedId);
    const handleAddToCart = () => {
        if (!selected || !course) return;
        
        addItem({
            courseId: course.id,
            courseTitle: course.title,
            slug: course.slug,
            dateId: selected.id,
            dateLabel: `${selected.day} ${selected.month}`,
            timeLabel: selected.time,
            priceIDR: course.priceIDR,
            priceMYR: course.priceMYR,
            icon: course.icon
        });
        setAdded(true);
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
                        <div className={styles.dateGrid}>
                            {MOCK_DATES.map((slot) => (
                                <button
                                    key={slot.id}
                                    className={`${styles.dateCard} ${selectedId === slot.id ? styles.dateSelected : ''} ${slot.seatsLeft <= 3 ? styles.dateUrgent : ''}`}
                                    onClick={() => setSelectedId(slot.id)}
                                    aria-pressed={selectedId === slot.id}
                                    id={`date-${slot.id}`}
                                >
                                    <span className={styles.dayName}>{slot.dayName}</span>
                                    <span className={styles.dayNum}>{slot.day}</span>
                                    <span className={styles.dayMonth}>{slot.month}</span>
                                    {slot.seatsLeft <= 5 && (
                                        <span className={styles.seatBadge}>{slot.seatsLeft} left</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time slot — appears on selection */}
                    {selected && (
                        <div className={`${styles.section} ${styles.timeSection}`}>
                            <h3 className={styles.sectionLabel}>🕒 Session Time</h3>
                            <div className={styles.timeSlot}>
                                <span className={styles.timeIcon}>🕒</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className={styles.timeVal}>{selected.time}</span>
                                    <span className={styles.timeMeta}>Live online · 2 hours</span>
                                </div>
                                <div className={styles.timeCheck}>✓</div>
                            </div>

                            {/* Urgency note */}
                            {selected.seatsLeft <= 5 && (
                                <div className={styles.urgencyNote}>
                                    🔴 Only {selected.seatsLeft} seats remaining for this date — secure yours now.
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.bottomNote}>
                        💬 Need a different date? WhatsApp us — we open new sessions based on demand.
                    </div>

                    {!added ? (
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedId}
                            className={`btn btn-primary btn-xl btn-full ${!selectedId ? styles.ctaDisabled : ''}`}
                            id="schedule-add-to-cart-cta"
                        >
                            {selectedId ? (
                                <>Add to Cart & Continue →</>
                            ) : (
                                <>Select a date to continue</>
                            )}
                        </button>
                    ) : (
                        <div className={styles.addedSuccess}>
                            <div className={styles.addedIcon}>✓</div>
                            <div className={styles.addedText}>
                                <h3>Added to Cart!</h3>
                                <p>{course.title} — {selected?.day} {selected?.month}</p>
                            </div>
                            <div className={styles.addedActions}>
                                <Link href="/cart" className="btn btn-primary btn-lg">Go to Cart</Link>
                                <Link href="/" className="btn btn-secondary btn-lg">Browse More</Link>
                            </div>
                        </div>
                    )}

                    <button onClick={() => router.back()} className={styles.back}>← Back to previous page</button>
                </div>
            </div>
        </div>
    );
}
