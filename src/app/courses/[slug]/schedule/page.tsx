'use client';
import { useState, use, useEffect } from 'react';
import { useCurrency } from '@/components/CurrencyContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCourseBySlug } from '@/data/courses';
import { useCart } from '@/components/CartContext';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export default function SchedulePage({ params }: Props) {
    const { slug } = use(params);
    const router = useRouter();
    const { data: session, status } = useSession();
    const { t, language } = useLanguage();
    const course = getCourseBySlug(slug);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { addItem, customerInfo, updateCustomerInfo } = useCart();
    
    const isID = language === 'id';
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

    const STEPS = [
        { number: 1, label: t('schedule.step1') },
        { number: 2, label: t('schedule.step2') },
        { number: 3, label: t('schedule.step3') },
    ];

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

    // Localized course title
    const courseTitle = isID ? (course?.titleID || course?.title) : course?.title;
    const courseFormat = course?.format;

    if (!course) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.inner}>
                    {/* Top flow control */}
                    <button onClick={() => router.back()} className={styles.flowBackBtn} aria-label="Go back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        <span>{t('schedule.back')}</span>
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
                        <h1 className={styles.title}>{t('schedule.title')}</h1>
                        <p className={styles.subtitle}>
                            {t('schedule.sessionFor')} <strong>{courseTitle}</strong> · {courseFormat}
                        </p>
                    </div>

                    {/* Date grid */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionLabel}>{t('schedule.availableDates')}</h3>
                        
                        {(!course.schedules || course.schedules.length === 0) ? (
                            <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center', marginTop: '16px' }}>
                                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{t('schedule.noSchedule')}</h4>
                                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {t('schedule.noScheduleDesc')}
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
                                                <span className={styles.fullBadge}>{t('schedule.fullyBooked')}</span>
                                            ) : slot.seatsLeft <= 5 ? (
                                                <span className={styles.seatBadge}>{slot.seatsLeft} {t('schedule.seatsLeft')}</span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Time slot */}
                    {selected && (
                        <div className={`${styles.section} ${styles.timeSection}`}>
                            <h3 className={styles.sectionLabel}>{t('schedule.sessionTime')}</h3>
                            <div className={styles.timeSlot}>
                                <span className={styles.timeIcon}>🕒</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className={styles.timeVal}>{selected.time}–{selected.timeEnd || '12:00'} (GMT+8)</span>
                                    <span className={styles.timeMeta}>{t('schedule.liveOnline')}</span>
                                </div>
                                <div className={styles.timeCheck}>✓</div>
                            </div>
                        </div>
                    )}

                    {/* Contact Information */}
                    {selected && !isAuthenticated && (
                        <div className={styles.contactSection}>
                            <h3 className={styles.sectionLabel}>{t('schedule.yourDetails')}</h3>
                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>{t('schedule.emailLabel')}</label>
                                    <input 
                                        className={styles.inputField} 
                                        type="email" 
                                        placeholder={t('schedule.emailPlaceholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>{t('schedule.phoneLabel')}</label>
                                    <input 
                                        className={styles.inputField} 
                                        type="tel" 
                                        placeholder={t('schedule.phonePlaceholder')}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {!email && !phone && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: '600', marginTop: '4px' }}>
                                    {t('schedule.validationMsg')}
                                </p>
                            )}
                            
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {t('schedule.contactNote')}
                            </p>
                        </div>
                    )}

                    <div className={styles.bottomNote}>
                        {t('schedule.bottomNote')}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!canContinue}
                        className={`btn btn-primary btn-xl btn-full ${!canContinue ? styles.ctaDisabled : ''}`}
                        id="schedule-next-cta"
                    >
                        {selectedId ? (
                            <>{t('schedule.next')}</>
                        ) : (
                            <>{t('schedule.selectDate')}</>
                        )}
                    </button>

                    <button onClick={() => router.back()} className={styles.back}>{t('schedule.backFull')}</button>
                </div>
            </div>
        </div>
    );
}
