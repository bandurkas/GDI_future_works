'use client';
import { useState, use, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCourseBySlug, type Schedule } from '@/data/courses';
import { useCart } from '@/components/CartContext';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageContext';
import { trackConversion, getGAClientId, getFbc, getFbp } from '@/lib/analytics';
import { getStoredUTMs } from '@/lib/utm';
import { useWhatsAppCheck } from '@/hooks/useWhatsAppCheck';
import WhatsAppWarningPopup from '@/components/WhatsAppWarningPopup';
import { validatePhone, buildFullPhone, phoneErrorText } from '@/lib/phone';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const DAY_ID: Record<string, string> = {
    Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu',
    Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu',
    'Mon–Tue': 'Sen–Sel', 'Tue–Wed': 'Sel–Rab', 'Wed–Thu': 'Rab–Kam',
    'Thu–Fri': 'Kam–Jum', 'Sat–Sun': 'Sab–Min', 'Fri–Sat': 'Jum–Sab',
};

export default function SchedulePage({ params }: Props) {
    const { slug } = use(params);
    const router = useRouter();
    const { data: session, status } = useSession();
    const { t, language } = useLanguage();
    const course = getCourseBySlug(slug);

    const [dynamicSlots, setDynamicSlots] = useState<Schedule[] | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState(false);

    // Day 1 & Day 2 selection
    const [day1Date, setDay1Date] = useState<string | null>(null);
    const [day1Slot, setDay1Slot] = useState<Schedule | null>(null);
    const [day2Date, setDay2Date] = useState<string | null>(null);
    const [day2Slot, setDay2Slot] = useState<Schedule | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addItem, customerInfo, updateCustomerInfo } = useCart();

    const isID = language === 'id';
    const isAuthenticated = status === 'authenticated';

    const [phone, setPhone] = useState(customerInfo.phone || '');
    const [countryCode, setCountryCode] = useState('+62');
    const [phoneTouched, setPhoneTouched] = useState(false);
    const { check: checkWA, loading: waLoading, exists: waExists } = useWhatsAppCheck();
    const [showWAPopup, setShowWAPopup] = useState(false);
    const [waConfirmed, setWaConfirmed] = useState(false);
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const submitInFlightRef = useRef(false);
    const shouldResubmitRef = useRef(false);

    const runWACheck = async () => {
        setPhoneTouched(true);
        const full = phone.trim() ? `${countryCode}${phone.trim().replace(/^0/, '')}` : '';
        if (full.replace(/\D/g, '').length < 8) return;
        await checkWA(full);
    };

    const handleWAFix = () => {
        setShowWAPopup(false);
        setTimeout(() => phoneInputRef.current?.focus(), 50);
    };

    const handleWAContinue = () => {
        setWaConfirmed(true);
        setShowWAPopup(false);
        shouldResubmitRef.current = true;
    };

    useEffect(() => {
        if (waConfirmed && shouldResubmitRef.current) {
            shouldResubmitRef.current = false;
            handleNext();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [waConfirmed]);

    useEffect(() => {
        if (!course || !(course as any).tutorEmail) return;
        setSlotsLoading(true);
        setSlotsError(false);
        fetch('/api/courses/' + slug + '/availability')
            .then(r => r.json())
            .then(data => { if (data.slots?.length > 0) setDynamicSlots(data.slots); })
            .catch(() => setSlotsError(true))
            .finally(() => setSlotsLoading(false));
    }, [slug, course]);

    const slots: Schedule[] = dynamicSlots ?? (course?.schedules ?? []);

    // Group slots by calendar date
    const slotsByDate = new Map<string, Schedule[]>();
    for (const slot of slots) {
        const match = slot.id.match(/^(\d{4}-\d{2}-\d{2})/);
        const dateKey = match ? match[1] : slot.date + '-' + slot.day;
        if (!slotsByDate.has(dateKey)) slotsByDate.set(dateKey, []);
        slotsByDate.get(dateKey)!.push(slot);
    }

    const uniqueDates = Array.from(slotsByDate.entries()).map(([dateKey, dateSlots]) => {
        const rep = dateSlots[0];
        const allFull = dateSlots.every(s => s.seatsLeft === 0);
        const someUrgent = dateSlots.some(s => s.seatsLeft > 0 && s.seatsLeft <= 3);
        return { dateKey, dateSlots, rep, allFull, someUrgent };
    });

    const day1DateSlots = day1Date ? (slotsByDate.get(day1Date) ?? []) : [];
    const day2DateSlots = day2Date ? (slotsByDate.get(day2Date) ?? []) : [];
    const bothSelected = !!day1Slot && !!day2Slot;

    const phoneValidation = validatePhone(countryCode, phone);
    const phoneValid = phoneValidation.valid;
    const contactOk = isAuthenticated || phoneValid;
    const canContinue = bothSelected && contactOk;

    const currentStep = bothSelected && !isAuthenticated ? 2 : 1;

    const STEPS = [
        { number: 1, label: t('schedule.step1') },
        { number: 2, label: t('schedule.step2') },
        { number: 3, label: t('schedule.step3') },
    ];

    const handleDay1Select = (dateKey: string) => {
        setDay1Date(dateKey);
        setDay1Slot(null);
        // Changing Day 1 resets Day 2
        setDay2Date(null);
        setDay2Slot(null);
    };

    const handleDay2Select = (dateKey: string) => {
        setDay2Date(dateKey);
        setDay2Slot(null);
    };

    const handleNext = async () => {
        if (!canContinue || !day1Slot || !day2Slot || !course) return;
        if (submitInFlightRef.current) return;
        if (!phoneValid) {
            setPhoneTouched(true);
            return;
        }
        const fullPhone = buildFullPhone(countryCode, phone);

        let waVerified = waConfirmed;
        if (fullPhone.replace(/\D/g, '').length >= 8) {
            submitInFlightRef.current = true;
            try {
                const waOk = await checkWA(fullPhone);
                if (waOk === false && !waConfirmed) {
                    setShowWAPopup(true);
                    return;
                }
                if (waOk === true) waVerified = true;
            } finally {
                submitInFlightRef.current = false;
            }
        }

        setIsSubmitting(true);
        // Sync to CRM Lead table
        try {
            const utms = getStoredUTMs() || {};
            const [gaClientId, fbClientId, fbBrowserId] = await Promise.all([
                getGAClientId(),
                Promise.resolve(getFbc()),
                Promise.resolve(getFbp())
            ]);
            
            fetch('/api/leads/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: fullPhone,
                    courseSlug: slug,
                    courseTitle: course.title,
                    dateLabel: `${day1Slot.date} & ${day2Slot.date}`,
                    timeLabel: `${day1Slot.time}–${day1Slot.timeEnd} / ${day2Slot.time}–${day2Slot.timeEnd}`,
                    utmSource: utms.utmSource,
                    utmMedium: utms.utmMedium,
                    utmCampaign: utms.utmCampaign,
                    utmContent: utms.utmContent,
                    utmTerm: utms.utmTerm,
                    gaClientId,
                    fbClientId,
                    fbBrowserId,
                })
            }).catch(e => console.error('Failed to sync lead:', e));
        } catch (e) {}

        trackConversion('course_booking_start');
        updateCustomerInfo({ email: '', phone: fullPhone, phoneVerified: waVerified });
        addItem({
            courseId: course.id,
            courseTitle: course.title,
            slug: course.slug,
            dateId: `${day1Slot.id}+${day2Slot.id}`,
            dateLabel: `${day1Slot.date} & ${day2Slot.date}`,
            timeLabel: `${day1Slot.time}–${day1Slot.timeEnd} / ${day2Slot.time}–${day2Slot.timeEnd}`,
            priceIDR: course.priceIDR,
            priceMYR: course.priceMYR,
            icon: course.icon,
        });
        router.push('/cart?reserved=true');
    };

    // Dynamic CTA label
    const ctaLabel = () => {
        if (!day1Date) return isID ? 'Pilih Tanggal Hari ke-1' : 'Select Day 1 Date';
        if (!day1Slot) return isID ? 'Pilih Waktu untuk Hari ke-1' : 'Select a Time for Day 1';
        if (!day2Date) return isID ? 'Pilih Tanggal Hari ke-2' : 'Select Day 2 Date';
        if (!day2Slot) return isID ? 'Pilih Waktu untuk Hari ke-2' : 'Select a Time for Day 2';
        if (!contactOk) return isID ? 'Pesan Slot Saya' : 'Book My Slot';
        return t('schedule.next');
    };

    const courseTitle = isID ? (course?.titleID || course?.title) : course?.title;

    if (!course) return null;

    // Reusable date grid renderer
    const renderDateGrid = (
        onSelect: (dk: string) => void,
        activeDate: string | null,
        markedDate?: string | null, // Day 1 dateKey shown in Day 2 grid
    ) => {
        if (slotsError) {
            return (
                <div className={styles.apiError} role="alert">
                    <span aria-hidden="true">⚠️</span>
                    <span>Couldn't load live availability. Showing default schedule — contact us to confirm.</span>
                </div>
            );
        }
        if (slotsLoading) {
            return (
                <div className={styles.skeletonGrid} aria-busy="true" aria-label="Loading available dates">
                    {[1, 2, 3, 4].map(n => <div key={n} className={styles.skeletonCard} />)}
                </div>
            );
        }
        if (uniqueDates.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{t('schedule.noSchedule')}</h4>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('schedule.noScheduleDesc')}</p>
                </div>
            );
        }
        return (
            <div className={styles.dateGrid} role="group" aria-label="Available dates">
                {uniqueDates.map(({ dateKey, dateSlots, rep, allFull, someUrgent }) => {
                    const isDay1Marked = markedDate === dateKey;
                    return (
                        <button
                            key={dateKey}
                            className={[
                                styles.dateCard,
                                activeDate === dateKey ? styles.dateSelected : '',
                                someUrgent && !allFull ? styles.dateUrgent : '',
                                allFull ? styles.dateFull : '',
                                isDay1Marked ? styles.dateDay1Marked : '',
                            ].join(' ')}
                            onClick={() => !allFull && onSelect(dateKey)}
                            disabled={allFull}
                            aria-pressed={activeDate === dateKey}
                            aria-label={`${rep.dayOfWeek} ${rep.day} ${rep.month}${allFull ? ', fully booked' : someUrgent ? ', almost full' : ''}`}
                        >
                            <span className={styles.dayName} aria-hidden="true">{language === 'id' ? (DAY_ID[rep.dayOfWeek] ?? rep.dayOfWeek) : rep.dayOfWeek}</span>
                            <span className={styles.dayNum} aria-hidden="true">{rep.day}</span>
                            <span className={styles.dayMonth} aria-hidden="true">{rep.month}</span>
                            {allFull ? (
                                <span className={styles.fullBadge}>{t('schedule.fullyBooked')}</span>
                            ) : isDay1Marked ? (
                                <span className={styles.day1Badge}>{isID ? 'Hari 1' : 'Day 1'}</span>
                            ) : (
                                <span className={styles.slotCount}>{dateSlots.length} {dateSlots.length === 1 ? 'slot' : 'slots'}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    // Reusable time slot renderer
    const renderTimeSlots = (dateSlots: Schedule[], selectedSlot: Schedule | null, onSelect: (s: Schedule) => void, label: string) => (
        <section className={`${styles.section} ${styles.timeSection}`} aria-labelledby={`times-label-${label}`}>
            <h2 id={`times-label-${label}`} className={styles.sectionLabel}>
                {language === 'id' ? (DAY_ID[dateSlots[0].dayOfWeek] ?? dateSlots[0].dayOfWeek) : dateSlots[0].dayOfWeek} {dateSlots[0].day} {dateSlots[0].month} &mdash; {isID ? 'Waktu Tersedia' : 'Available Times'}
            </h2>
            <div className={styles.timeGrid} role="group" aria-label="Available time slots">
                {dateSlots.map(slot => {
                    const isFull = slot.seatsLeft === 0;
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                        <button
                            key={slot.id}
                            className={[styles.timeCard, isSelected ? styles.timeSelected : '', isFull ? styles.timeFull : ''].join(' ')}
                            onClick={() => !isFull && onSelect(slot)}
                            disabled={isFull}
                            aria-pressed={isSelected}
                            aria-label={`${formatTime(slot.time)} to ${formatTime(slot.timeEnd)}${isFull ? ', fully booked' : ''}`}
                        >
                            <span className={styles.timeRange}>{formatTime(slot.time)} &mdash; {formatTime(slot.timeEnd)}</span>
                            <span className={`${styles.timeStatus} ${isFull ? '' : styles.timeAvail}`}>
                                {isFull ? t('schedule.fullyBooked') : isID ? 'Tersedia' : 'Available'}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.inner}>
                    {/* Back button */}
                    <button onClick={() => router.back()} className={styles.flowBackBtn} aria-label="Go back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span>{t('schedule.back')}</span>
                    </button>

                    {/* Progress */}
                    <nav aria-label="Booking progress" className={styles.progress}>
                        {STEPS.map((s, i) => {
                            const isDone = s.number < currentStep;
                            const isActive = s.number === currentStep;
                            return (
                                <div key={s.number} className={styles.progressStep}>
                                    <div
                                        className={[styles.stepBubble, isDone ? styles.stepDone : '', isActive ? styles.stepActive : ''].join(' ')}
                                        aria-current={isActive ? 'step' : undefined}
                                    >
                                        {isDone ? '✓' : s.number}
                                    </div>
                                    <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>{s.label}</span>
                                    {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />}
                                </div>
                            );
                        })}
                    </nav>

                    <div>
                        <h1 className={styles.title}>{t('schedule.title')}</h1>
                        <p className={styles.subtitle}>
                            {t('schedule.sessionFor')} <strong>{courseTitle}</strong> &middot; {course.format}
                        </p>
                    </div>

                    {/* ── DAY 1 BLOCK ── */}
                    <div className={`${styles.dayBlock} ${day1Slot ? styles.dayComplete : ''}`}>
                        <div className={styles.dayBlockLabel}>
                            <span className={styles.dayBadge}>1</span>
                            <span>{isID ? 'Hari ke-1' : 'Day 1'}</span>
                            {day1Slot && <span className={styles.dayCheckmark}>✓</span>}
                        </div>

                        {/* Day 1 confirmed summary */}
                        {day1Slot ? (
                            <div className={styles.dayConfirmedRow}>
                                <span className={styles.dayConfirmedText}>
                                    {language === 'id' ? (DAY_ID[day1Slot.dayOfWeek] ?? day1Slot.dayOfWeek) : day1Slot.dayOfWeek}, {day1Slot.day} {day1Slot.month} &middot; {day1Slot.time}–{day1Slot.timeEnd}
                                </span>
                                <button
                                    className={styles.changeBtn}
                                    onClick={() => { setDay1Date(null); setDay1Slot(null); setDay2Date(null); setDay2Slot(null); }}
                                >
                                    {isID ? 'Ubah' : 'Change'}
                                </button>
                            </div>
                        ) : (
                            <section className={styles.section} aria-labelledby="day1-dates-label">
                                <h2 id="day1-dates-label" className={styles.sectionLabel}>{t('schedule.availableDates')}</h2>
                                {renderDateGrid(handleDay1Select, day1Date)}
                                {day1Date && day1DateSlots.length > 0 && renderTimeSlots(day1DateSlots, day1Slot, setDay1Slot, 'day1')}
                            </section>
                        )}
                    </div>

                    {/* ── DAY 2 BLOCK — only shown after Day 1 is complete ── */}
                    {day1Slot && (
                        <div className={`${styles.dayBlock} ${day2Slot ? styles.dayComplete : ''}`}>
                            <div className={styles.dayBlockLabel}>
                                <span className={styles.dayBadge}>2</span>
                                <span>{isID ? 'Hari ke-2' : 'Day 2'}</span>
                                {day2Slot && <span className={styles.dayCheckmark}>✓</span>}
                            </div>

                            {/* Day 2 confirmed summary */}
                            {day2Slot ? (
                                <div className={styles.dayConfirmedRow}>
                                    <span className={styles.dayConfirmedText}>
                                        {language === 'id' ? (DAY_ID[day2Slot.dayOfWeek] ?? day2Slot.dayOfWeek) : day2Slot.dayOfWeek}, {day2Slot.day} {day2Slot.month} &middot; {day2Slot.time}–{day2Slot.timeEnd}
                                    </span>
                                    <button
                                        className={styles.changeBtn}
                                        onClick={() => { setDay2Date(null); setDay2Slot(null); }}
                                    >
                                        {isID ? 'Ubah' : 'Change'}
                                    </button>
                                </div>
                            ) : (
                                <section className={styles.section} aria-labelledby="day2-dates-label">
                                    <h2 id="day2-dates-label" className={styles.sectionLabel}>{t('schedule.availableDates')}</h2>
                                    {renderDateGrid(handleDay2Select, day2Date, day1Date)}
                                    {day2Date && day2DateSlots.length > 0 && renderTimeSlots(day2DateSlots, day2Slot, setDay2Slot, 'day2')}
                                </section>
                            )}
                        </div>
                    )}

                    {/* ── SESSION SUMMARY — shown after both days selected ── */}
                    {bothSelected && day1Slot && day2Slot && (
                        <section className={`${styles.section} ${styles.confirmedSection}`} aria-labelledby="session-label">
                            <h2 id="session-label" className={styles.sectionLabel}>
                                📅 {isID ? 'Sesi 2 Hari Kamu' : 'Your 2-Day Session'}
                            </h2>
                            <div className={styles.twoSessionSummary}>
                                <div className={styles.sessionRow}>
                                    <span className={styles.sessionDayTag}>{isID ? 'Hari 1' : 'Day 1'}</span>
                                    <span className={styles.sessionInfo}>
                                        {language === 'id' ? (DAY_ID[day1Slot.dayOfWeek] ?? day1Slot.dayOfWeek) : day1Slot.dayOfWeek}, {day1Slot.day} {day1Slot.month} &middot; {day1Slot.time}–{day1Slot.timeEnd}
                                    </span>
                                    <span className={styles.timeCheck}>✓</span>
                                </div>
                                <div className={styles.sessionRow}>
                                    <span className={styles.sessionDayTag}>{isID ? 'Hari 2' : 'Day 2'}</span>
                                    <span className={styles.sessionInfo}>
                                        {language === 'id' ? (DAY_ID[day2Slot.dayOfWeek] ?? day2Slot.dayOfWeek) : day2Slot.dayOfWeek}, {day2Slot.day} {day2Slot.month} &middot; {day2Slot.time}–{day2Slot.timeEnd}
                                    </span>
                                    <span className={styles.timeCheck}>✓</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── CONTACT FORM — only for non-authenticated users, after both days selected ── */}
                    {bothSelected && !isAuthenticated && (
                        <section className={styles.contactSection} aria-labelledby="contact-label">
                            <div className={styles.contactHeader}>
                                <h2 id="contact-label" className={styles.sectionLabel}>{t('schedule.yourDetails')}</h2>
                                <p className={styles.contactSubtitle}>
                                    {isID ? 'Kami butuh info ini untuk mengirim link kelas kamu.' : 'We need this to send your class access link.'}
                                </p>
                            </div>

                            {/* Phone — required */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="schedule-phone" className={styles.inputLabel}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366', marginRight: 4, verticalAlign: 'middle', flexShrink: 0 }}>
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    {isID ? 'Nomor WhatsApp / Telepon' : 'WhatsApp / Phone Number'}
                                    <span className={styles.requiredStar}>*</span>
                                </label>
                                <div className={styles.phoneInputGroup}>
                                    <select className={styles.countrySelect} value={countryCode} onChange={e => setCountryCode(e.target.value)} aria-label="Country code">
                                        <option value="+62">🇮🇩 +62</option>
                                        <option value="+60">🇲🇾 +60</option>
                                        <option value="+65">🇸🇬 +65</option>
                                        <option value="+1">🇺🇸 +1</option>
                                    </select>
                                    <input
                                        id="schedule-phone"
                                        ref={phoneInputRef}
                                        className={styles.phoneInput}
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        placeholder={countryCode === '+62' ? '812 3456 7890' : '12 3456 7890'}
                                        value={phone}
                                        onChange={e => {
                                            setPhone(e.target.value.replace(/[^\d\s]/g, ''));
                                            if (waConfirmed) setWaConfirmed(false);
                                        }}
                                        onBlur={runWACheck}
                                        data-error={phoneTouched && !phoneValid ? 'true' : undefined}
                                        data-valid={phoneValid ? 'true' : undefined}
                                    />
                                </div>
                                {phoneTouched && !phoneValid && (
                                    <span className={styles.fieldError} role="alert">
                                        ⚠ {phoneErrorText(phoneValidation.errorId, isID ? 'id' : 'en') || (isID ? 'Nomor telepon diperlukan untuk konfirmasi kelas' : 'Phone number is required to confirm your class')}
                                    </span>
                                )}
                                <div style={{ marginTop: 6, fontSize: 12, minHeight: 18 }}>
                                    {waLoading && <span style={{ color: '#888' }}>{isID ? 'Memeriksa WhatsApp…' : 'Checking WhatsApp…'}</span>}
                                    {!waLoading && waExists === true && (
                                        <span style={{ color: '#16a34a' }}>✓ {isID ? 'Nomor terdaftar di WhatsApp' : 'WhatsApp OK'}</span>
                                    )}
                                    {!waLoading && waExists === false && (
                                        <span style={{ color: '#dc2626' }}>⚠ {isID ? 'Nomor tidak terdaftar di WhatsApp' : 'Not registered on WhatsApp'}</span>
                                    )}
                                </div>
                                <p className={styles.fieldHelper}>
                                    📲 {isID ? 'Kami akan menghubungi Anda untuk konfirmasi jadwal kelas' : 'We will contact you to confirm your class schedule'}
                                </p>
                            </div>
                        </section>
                    )}

                    <p className={styles.bottomNote}>{t('schedule.bottomNote')}</p>

                    <button
                        onClick={handleNext}
                        disabled={!canContinue || isSubmitting}
                        className={`btn btn-primary btn-xl btn-full ${!canContinue ? styles.ctaDisabled : ''}`}
                        id="schedule-next-cta"
                        aria-disabled={!canContinue || isSubmitting}
                    >
                        {isSubmitting ? (isID ? 'Tunggu Sebentar...' : 'Please Wait...') : ctaLabel()}
                    </button>

                    <button onClick={() => router.back()} className={styles.back}>{t('schedule.backFull')}</button>
                </div>
            </div>
            {showWAPopup && (
                <WhatsAppWarningPopup
                    onClose={() => setShowWAPopup(false)}
                    onFix={handleWAFix}
                    onContinue={handleWAContinue}
                />
            )}
        </div>
    );
}
