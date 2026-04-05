'use client';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCourseBySlug, type Schedule } from '@/data/courses';
import { useCart } from '@/components/CartContext';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageContext';
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
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Schedule | null>(null);
    const { addItem, customerInfo, updateCustomerInfo } = useCart();

    const isID = language === 'id';
    const isAuthenticated = status === 'authenticated';

    const [email, setEmail] = useState(customerInfo.email || '');
    const [phone, setPhone] = useState(customerInfo.phone || '');
    const [countryCode, setCountryCode] = useState('+62');
    const [emailTouched, setEmailTouched] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    useEffect(() => {
        if (session?.user && !email && session.user.email) setEmail(session.user.email);
    }, [session, email]);

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

    const selectedDateSlots = selectedDate ? (slotsByDate.get(selectedDate) ?? []) : [];

    // Step progress: 1 = выбор даты/времени, 2 = корзина/детали, 3 = оплата
    const currentStep = selectedSlot && !isAuthenticated ? 2 : 1;

    const STEPS = [
        { number: 1, label: t('schedule.step1') },
        { number: 2, label: t('schedule.step2') },
        { number: 3, label: t('schedule.step3') },
    ];

    const emailValid = email.trim().length > 0 && email.includes('@');
    const phoneValid = phone.trim().length >= 6;
    const contactOk = isAuthenticated || phoneValid;
    const canContinue = !!selectedSlot && contactOk;

    const handleDateSelect = (dateKey: string) => {
        setSelectedDate(dateKey);
        setSelectedSlot(null);
    };

    const handleNext = () => {
        if (!canContinue || !selectedSlot || !course) return;
        const fullPhone = phone.trim() ? `${countryCode}${phone.trim().replace(/^0/, '')}` : '';
        updateCustomerInfo({ email, phone: fullPhone });
        addItem({
            courseId: course.id,
            courseTitle: course.title,
            slug: course.slug,
            dateId: selectedSlot.id,
            dateLabel: selectedSlot.date,
            timeLabel: `${selectedSlot.time}\u2013${selectedSlot.timeEnd}`,
            priceIDR: course.priceIDR,
            priceMYR: course.priceMYR,
            icon: course.icon,
        });
        router.push('/cart');
    };

    const courseTitle = isID ? (course?.titleID || course?.title) : course?.title;

    if (!course) return null;

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
                                        className={[
                                            styles.stepBubble,
                                            isDone ? styles.stepDone : '',
                                            isActive ? styles.stepActive : '',
                                        ].join(' ')}
                                        aria-current={isActive ? 'step' : undefined}
                                    >
                                        {isDone ? '✓' : s.number}
                                    </div>
                                    <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                                        {s.label}
                                    </span>
                                    {i < STEPS.length - 1 && (
                                        <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />
                                    )}
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

                    {/* STEP 1 — Select Date */}
                    <section className={styles.section} aria-labelledby="dates-label">
                        <h2 id="dates-label" className={styles.sectionLabel}>{t('schedule.availableDates')}</h2>

                        {slotsError ? (
                            <div className={styles.apiError} role="alert">
                                <span aria-hidden="true">⚠️</span>
                                <span>Couldn't load live availability. Showing default schedule — contact us to confirm.</span>
                            </div>
                        ) : slotsLoading ? (
                            <div className={styles.skeletonGrid} aria-busy="true" aria-label="Loading available dates">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className={styles.skeletonCard} />
                                ))}
                            </div>
                        ) : uniqueDates.length === 0 ? (
                            <div className={styles.emptyState}>
                                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{t('schedule.noSchedule')}</h4>
                                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('schedule.noScheduleDesc')}</p>
                            </div>
                        ) : (
                            <div className={styles.dateGrid} role="group" aria-label="Available dates">
                                {uniqueDates.map(({ dateKey, dateSlots, rep, allFull, someUrgent }) => (
                                    <button
                                        key={dateKey}
                                        className={[
                                            styles.dateCard,
                                            selectedDate === dateKey ? styles.dateSelected : '',
                                            someUrgent ? styles.dateUrgent : '',
                                            allFull ? styles.dateFull : '',
                                        ].join(' ')}
                                        onClick={() => !allFull && handleDateSelect(dateKey)}
                                        disabled={allFull}
                                        aria-pressed={selectedDate === dateKey}
                                        aria-label={`${rep.dayOfWeek} ${rep.day} ${rep.month}${allFull ? ', fully booked' : someUrgent ? ', almost full' : ''}`}
                                    >
                                        <span className={styles.dayName} aria-hidden="true">{language === 'id' ? (DAY_ID[rep.dayOfWeek] ?? rep.dayOfWeek) : rep.dayOfWeek}</span>
                                        <span className={styles.dayNum} aria-hidden="true">{rep.day}</span>
                                        <span className={styles.dayMonth} aria-hidden="true">{rep.month}</span>
                                        {allFull ? (
                                            <span className={styles.fullBadge}>{t('schedule.fullyBooked')}</span>
                                        ) : (
                                            <span className={styles.slotCount}>{dateSlots.length} {dateSlots.length === 1 ? 'slot' : 'slots'}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* STEP 2 — Select Time */}
                    {selectedDate && selectedDateSlots.length > 0 && (
                        <section className={`${styles.section} ${styles.timeSection}`} aria-labelledby="times-label">
                            <h2 id="times-label" className={styles.sectionLabel}>
                                {language === 'id' ? (DAY_ID[selectedDateSlots[0].dayOfWeek] ?? selectedDateSlots[0].dayOfWeek) : selectedDateSlots[0].dayOfWeek} {selectedDateSlots[0].day} {selectedDateSlots[0].month} &mdash; Available Times
                            </h2>
                            <div className={styles.timeGrid} role="group" aria-label="Available time slots">
                                {selectedDateSlots.map(slot => {
                                    const isFull = slot.seatsLeft === 0;
                                    const isSelected = selectedSlot?.id === slot.id;
                                    return (
                                        <button
                                            key={slot.id}
                                            className={[
                                                styles.timeCard,
                                                isSelected ? styles.timeSelected : '',
                                                isFull ? styles.timeFull : '',
                                            ].join(' ')}
                                            onClick={() => !isFull && setSelectedSlot(slot)}
                                            disabled={isFull}
                                            aria-pressed={isSelected}
                                            aria-label={`${formatTime(slot.time)} to ${formatTime(slot.timeEnd)}${isFull ? ', fully booked' : ''}`}
                                        >
                                            <span className={styles.timeRange}>
                                                {formatTime(slot.time)} &mdash; {formatTime(slot.timeEnd)}
                                            </span>
                                            <span className={`${styles.timeStatus} ${isFull ? '' : styles.timeAvail}`}>
                                                {isFull ? t('schedule.fullyBooked') : 'Available'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Confirmed selection */}
                    {selectedSlot && (
                        <section className={`${styles.section} ${styles.confirmedSection}`} aria-labelledby="session-label">
                            <h2 id="session-label" className={styles.sectionLabel}>{t('schedule.sessionTime')}</h2>
                            <div className={styles.timeSlot}>
                                <span className={styles.timeIcon} aria-hidden="true">🕒</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className={styles.timeVal}>{selectedSlot.time}&ndash;{selectedSlot.timeEnd} (GMT+8)</span>
                                    <span className={styles.timeMeta}>{t('schedule.liveOnline')}</span>
                                </div>
                                <div className={styles.timeCheck} aria-hidden="true">✓</div>
                            </div>
                        </section>
                    )}

                    {/* Contact info — only for non-authenticated users */}
                    {selectedSlot && !isAuthenticated && (
                        <section className={styles.contactSection} aria-labelledby="contact-label">
                            <div className={styles.contactHeader}>
                                <h2 id="contact-label" className={styles.sectionLabel}>{t('schedule.yourDetails')}</h2>
                                <p className={styles.contactSubtitle}>
                                    {isID
                                        ? 'Kami butuh info ini untuk mengirim link kelas kamu.'
                                        : 'We need this to send your class access link.'}
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
                                    <select
                                        className={styles.countrySelect}
                                        value={countryCode}
                                        onChange={e => setCountryCode(e.target.value)}
                                        aria-label="Country code"
                                    >
                                        <option value="+62">🇮🇩 +62</option>
                                        <option value="+60">🇲🇾 +60</option>
                                        <option value="+65">🇸🇬 +65</option>
                                        <option value="+1">🇺🇸 +1</option>
                                    </select>
                                    <input
                                        id="schedule-phone"
                                        className={styles.phoneInput}
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        placeholder={countryCode === '+62' ? '812 3456 7890' : '12 3456 7890'}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                                        onBlur={() => setPhoneTouched(true)}
                                        data-error={phoneTouched && !phoneValid ? 'true' : undefined}
                                        data-valid={phoneValid ? 'true' : undefined}
                                    />
                                </div>
                                {phoneTouched && !phoneValid && (
                                    <span className={styles.fieldError} role="alert">
                                        ⚠ {isID
                                            ? 'Nomor telepon diperlukan untuk konfirmasi kelas'
                                            : 'Phone number is required to confirm your class'}
                                    </span>
                                )}
                                <p className={styles.fieldHelper}>
                                    📲 {isID
                                        ? 'Kami akan menghubungi Anda untuk konfirmasi jadwal kelas'
                                        : 'We will contact you to confirm your class schedule'}
                                </p>
                            </div>

                            {/* Email — optional */}
                            <div className={styles.inputGroup}>
                                <label htmlFor="schedule-email" className={styles.inputLabel}>
                                    {isID ? 'Email' : 'Email'}
                                    <span className={styles.optionalTag}>
                                        {isID ? 'Opsional' : 'Optional'}
                                    </span>
                                </label>
                                <input
                                    id="schedule-email"
                                    className={styles.inputField}
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder={isID ? 'contoh@email.com' : 'you@example.com'}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onBlur={() => setEmailTouched(true)}
                                    data-error={emailTouched && email && !emailValid ? 'true' : undefined}
                                    data-valid={emailValid ? 'true' : undefined}
                                />
                                {emailTouched && email && !emailValid && (
                                    <span className={styles.fieldError} role="alert">
                                        ⚠ {isID ? 'Masukkan alamat email yang valid' : 'Enter a valid email address'}
                                    </span>
                                )}
                                <p className={styles.fieldHelper}>
                                    📄 {isID
                                        ? 'Kami akan mengirim invoice dan detail kelas'
                                        : 'We will send your invoice and class details'}
                                </p>
                            </div>
                        </section>
                    )}

                    <p className={styles.bottomNote}>{t('schedule.bottomNote')}</p>

                    <button
                        onClick={handleNext}
                        disabled={!canContinue}
                        className={`btn btn-primary btn-xl btn-full ${!canContinue ? styles.ctaDisabled : ''}`}
                        id="schedule-next-cta"
                        aria-disabled={!canContinue}
                    >
                        {selectedSlot ? t('schedule.next') : selectedDate ? 'Select a Time' : t('schedule.selectDate')}
                    </button>

                    <button onClick={() => router.back()} className={styles.back}>{t('schedule.backFull')}</button>
                </div>
            </div>
        </div>
    );
}
