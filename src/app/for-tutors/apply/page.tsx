'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useLanguage } from '@/components/LanguageContext';

const EXPERTISE_OPTIONS = [
    'Graphic Design with AI',
    'Data Analytics for Professionals',
    'Python for Professionals',
    'LLM and AI Engineering',
    'TEFL / English Teaching',
    'Other Future Skill',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIMEZONES = [
    { value: 'Asia/Jakarta',      label: 'WIB — Jakarta (UTC+7)' },
    { value: 'Asia/Makassar',     label: 'WITA — Makassar (UTC+8)' },
    { value: 'Asia/Jayapura',     label: 'WIT — Jayapura (UTC+9)' },
    { value: 'Asia/Kuala_Lumpur', label: 'MYT — Kuala Lumpur (UTC+8)' },
    { value: 'Asia/Singapore',    label: 'SGT — Singapore (UTC+8)' },
    { value: 'UTC',               label: 'UTC' },
];

interface FormData {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    bio: string;
    expertise: string;
    availability: string[];
    timezone: string;
    videoLink: string;
    portfolioLink: string;
    curriculum: string;
    lessonPlan: string;
    agreed: boolean;
}

const INITIAL: FormData = {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    bio: '',
    expertise: '',
    availability: [],
    timezone: 'Asia/Jakarta',
    videoLink: '',
    portfolioLink: '',
    curriculum: '',
    lessonPlan: '',
    agreed: false,
};

export default function TutorApplyPage() {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(INITIAL);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Derived from translations so they react to language toggle
    const STEPS = [
        { labelKey: 'apply.step1.label', titleKey: 'apply.step1.title' },
        { labelKey: 'apply.step2.label', titleKey: 'apply.step2.title' },
        { labelKey: 'apply.step3.label', titleKey: 'apply.step3.title' },
        { labelKey: 'apply.step4.label', titleKey: 'apply.step4.title' },
        { labelKey: 'apply.step5.label', titleKey: 'apply.step5.title' },
    ];

    const SLOTS = [
        { key: 'morning',   labelKey: 'apply.slot.morning',   time: '06:00–10:00' },
        { key: 'midday',    labelKey: 'apply.slot.midday',    time: '10:00–14:00' },
        { key: 'afternoon', labelKey: 'apply.slot.afternoon', time: '14:00–18:00' },
        { key: 'evening',   labelKey: 'apply.slot.evening',   time: '18:00–22:00' },
    ];

    // ── Field helpers ──────────────────────────────────────────
    const set = (field: keyof FormData, value: any) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const toggleSlot = (day: string, slotKey: string) => {
        const key = `${day}-${slotKey}`;
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.includes(key)
                ? prev.availability.filter(k => k !== key)
                : [...prev.availability, key],
        }));
    };

    const toggleDay = (day: string) => {
        const dayKeys = SLOTS.map(s => `${day}-${s.key}`);
        setFormData(prev => {
            const allSelected = dayKeys.every(k => prev.availability.includes(k));
            return {
                ...prev,
                availability: allSelected
                    ? prev.availability.filter(k => !dayKeys.includes(k))
                    : [...new Set([...prev.availability, ...dayKeys])],
            };
        });
    };

    const toggleSlotRow = (slotKey: string) => {
        const rowKeys = DAYS.map(d => `${d}-${slotKey}`);
        setFormData(prev => {
            const allSelected = rowKeys.every(k => prev.availability.includes(k));
            return {
                ...prev,
                availability: allSelected
                    ? prev.availability.filter(k => !rowKeys.includes(k))
                    : [...new Set([...prev.availability, ...rowKeys])],
            };
        });
    };

    // ── URL helper ─────────────────────────────────────────────
    const isValidUrl = (val: string) => {
        try { new URL(val); return true; } catch { return false; }
    };

    // ── Validation per step ────────────────────────────────────
    const validate = (s: number): string => {
        if (s === 1) {
            if (formData.name.trim().length < 2)       return 'Full name must be at least 2 characters.';
            if (!formData.email.includes('@'))          return 'Please enter a valid email address.';
            if (formData.phone.trim().length < 5)       return 'Please enter a valid phone number.';
            if (!formData.expertise)                    return 'Please select your expertise area.';
            if (!formData.bio.trim())                   return 'Please write a short professional bio.';
            if (!formData.linkedin.trim())              return 'Please enter your LinkedIn profile URL.';
            if (!isValidUrl(formData.linkedin.trim()))  return 'LinkedIn URL must start with https:// (e.g. https://linkedin.com/in/your-name).';
        }
        if (s === 2) {
            if (formData.availability.length === 0)     return 'Please select at least one availability slot.';
        }
        if (s === 3) {
            if (!formData.videoLink.trim())             return 'Please provide a link to your introduction video.';
            if (!isValidUrl(formData.videoLink.trim())) return 'Video URL must start with https:// (e.g. https://youtube.com/watch?v=... or https://loom.com/share/...).';
            if (formData.portfolioLink.trim() && !isValidUrl(formData.portfolioLink.trim()))
                                                        return 'Portfolio URL must start with https://.';
        }
        if (s === 4) {
            if (!formData.curriculum.trim())            return 'Please outline your proposed curriculum.';
            if (!formData.lessonPlan.trim())            return 'Please provide a sample lesson plan.';
        }
        if (s === 5) {
            if (!formData.agreed)                       return 'Please agree to the Tutor Code of Conduct before submitting.';
        }
        return '';
    };

    // ── Navigation ─────────────────────────────────────────────
    const goNext = () => {
        const err = validate(step);
        if (err) { setError(err); return; }
        setError('');
        setStep(s => s + 1);
    };

    const goBack = () => {
        setError('');
        setStep(s => s - 1);
    };

    // ── Submit ─────────────────────────────────────────────────
    const handleSubmit = async () => {
        const err = validate(5);
        if (err) { setError(err); return; }
        setError('');
        setIsSubmitting(true);

        try {
            const payload = {
                name:          formData.name.trim(),
                email:         formData.email.trim().toLowerCase(),
                phone:         formData.phone.trim(),
                linkedin:      formData.linkedin.trim(),
                bio:           formData.bio.trim(),
                expertise:     formData.expertise,
                availability:  JSON.stringify(formData.availability),
                timezone:      formData.timezone,
                videoLink:     formData.videoLink.trim(),
                portfolioLink: formData.portfolioLink.trim(),
                curriculum:    formData.curriculum.trim(),
                lessonPlan:    formData.lessonPlan.trim(),
            };

            const res = await fetch('/api/tutor-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsSuccess(true);
                return;
            }

            const data = await res.json().catch(() => ({}));
            setError(data.error ?? 'Something went wrong. Please try again.');
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Success screen ─────────────────────────────────────────
    if (isSuccess) {
        return (
            <div className={styles.successPage}>
                <div className={styles.successCard}>
                    <div className={styles.successIconWrap}>🚀</div>
                    <h1 className={styles.successTitle}>{t('apply.success.title')}</h1>
                    <p className={styles.successText}>{t('apply.success.text')}</p>
                    <div className={styles.successMeta}>
                        <span className={styles.successMetaDot} />
                        {t('apply.success.meta')}
                    </div>
                    <Link href="/" className={styles.btnPrimary}>{t('apply.success.home')}</Link>
                </div>
            </div>
        );
    }

    const currentStep = STEPS[step - 1];
    const stepBadge = `${t('apply.step.badge')} ${step} ${t('apply.step.of')} ${STEPS.length}`;

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.eyebrow}>🎓 {t('apply.eyebrow')}</div>
                    <h1 className={styles.title}>
                        {t('apply.title.pre')}<span>{t('apply.title.brand')}</span>{t('apply.title.post')}
                    </h1>
                    <p className={styles.subtitle}>{t('apply.subtitle')}</p>
                </div>

                {/* ── Progress Steps — pixel-perfect: each dot centered above its label ── */}
                <div className={styles.progressWrapper}>
                    {STEPS.map((s, i) => (
                        <div
                            key={i}
                            className={`${styles.progressStep} ${i + 1 < step ? styles.stepDone : ''} ${i + 1 === step ? styles.stepActive : ''}`}
                        >
                            {/* Half-line before dot | dot | half-line after dot */}
                            <div className={styles.progressTop}>
                                <div className={`${styles.progressLineHalf} ${styles.progressLineBefore}`} />
                                <div className={styles.progressDot}>
                                    {i + 1 < step ? '✓' : i + 1}
                                </div>
                                <div className={`${styles.progressLineHalf} ${styles.progressLineAfter}`} />
                            </div>
                            <div className={styles.progressLabel}>{t(s.labelKey)}</div>
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className={styles.formCard}>
                    <div className={styles.stepHeader}>
                        <div className={styles.stepBadge}>{stepBadge}</div>
                        <div className={styles.stepTitle}>{t(currentStep.titleKey)}</div>
                    </div>

                    <div>

                        {/* ── Step 1: Profile ── */}
                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.name')}</label>
                                    <input
                                        type="text" value={formData.name}
                                        onChange={e => set('name', e.target.value)}
                                        className={styles.input}
                                        placeholder="e.g. Sari Dewi"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.email')}</label>
                                    <input
                                        type="email" value={formData.email}
                                        onChange={e => set('email', e.target.value)}
                                        className={styles.input}
                                        placeholder="sari@example.com"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.phone')}</label>
                                    <input
                                        type="tel" value={formData.phone}
                                        onChange={e => set('phone', e.target.value)}
                                        className={styles.input}
                                        placeholder="+62 812..."
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.expertise')}</label>
                                    <select
                                        value={formData.expertise}
                                        onChange={e => set('expertise', e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">{t('apply.f.expertise.ph')}</option>
                                        {EXPERTISE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.bio')}</label>
                                    <p className={styles.hint}>{t('apply.f.bio.hint')}</p>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => set('bio', e.target.value)}
                                        className={styles.textarea}
                                        placeholder="I am a data professional with 7 years of experience at…"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.linkedin')}</label>
                                    <input
                                        type="url" value={formData.linkedin}
                                        onChange={e => set('linkedin', e.target.value)}
                                        className={styles.input}
                                        placeholder="https://linkedin.com/in/your-name"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Availability ── */}
                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <div className={styles.infoBox}>
                                    {t('apply.avail.info')}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.tz')}</label>
                                    <select
                                        value={formData.timezone}
                                        onChange={e => set('timezone', e.target.value)}
                                        className={styles.select}
                                    >
                                        {TIMEZONES.map(tz => (
                                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.gridWrap}>
                                    <div className={styles.gridTable}>
                                        <div className={styles.gridHeaderRow}>
                                            <div className={styles.gridCorner} />
                                            {DAYS.map(day => {
                                                const dayKeys = SLOTS.map(s => `${day}-${s.key}`);
                                                const allSelected = dayKeys.every(k => formData.availability.includes(k));
                                                return (
                                                    <button key={day} type="button"
                                                        className={`${styles.gridDayHeader}${allSelected ? ` ${styles.gridDayHeaderActive}` : ''}`}
                                                        onClick={() => toggleDay(day)}
                                                        title={`Toggle all ${day} slots`}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {SLOTS.map(slot => {
                                            const rowKeys = DAYS.map(d => `${d}-${slot.key}`);
                                            const rowAllSelected = rowKeys.every(k => formData.availability.includes(k));
                                            return (
                                                <div key={slot.key} className={styles.gridRow}>
                                                    <button type="button"
                                                        className={`${styles.gridTimeLabel}${rowAllSelected ? ` ${styles.gridTimeLabelActive}` : ''}`}
                                                        onClick={() => toggleSlotRow(slot.key)}
                                                        title={`Toggle ${t(slot.labelKey)} across all days`}
                                                    >
                                                        <span className={styles.gridSlotName}>{t(slot.labelKey)}</span>
                                                        <span className={styles.gridSlotTime}>{slot.time}</span>
                                                    </button>
                                                    {DAYS.map(day => {
                                                        const key = `${day}-${slot.key}`;
                                                        const isActive = formData.availability.includes(key);
                                                        return (
                                                            <button key={key} type="button"
                                                                className={`${styles.gridCell}${isActive ? ` ${styles.gridCellActive}` : ''}`}
                                                                onClick={() => toggleSlot(day, slot.key)}
                                                                aria-label={`${day} ${t(slot.labelKey)} — ${isActive ? 'selected' : 'not selected'}`}
                                                                aria-pressed={isActive}
                                                                style={{ minWidth: '40px', minHeight: '40px' }}
                                                            >
                                                                {isActive && (
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="20 6 9 17 4 12" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className={styles.gridSummary}>
                                        {formData.availability.length === 0
                                            ? <span className={styles.gridSummaryEmpty}>{t('apply.avail.none')}</span>
                                            : <span className={styles.gridSummaryCount}>
                                                {formData.availability.length}{' '}
                                                {formData.availability.length !== 1 ? t('apply.avail.slotsP') : t('apply.avail.slots')}{' '}
                                                {t('apply.avail.selected')}
                                              </span>
                                        }
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Your Work ── */}
                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.infoBox}>
                                    {t('apply.work.info')}
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.video')}</label>
                                    <p className={styles.hint}>{t('apply.f.video.hint')}</p>
                                    <input
                                        type="url" value={formData.videoLink}
                                        onChange={e => set('videoLink', e.target.value)}
                                        className={styles.input}
                                        placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        {t('apply.f.portfolio')}{' '}
                                        <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{t('apply.f.portfolio.opt')}</span>
                                    </label>
                                    <p className={styles.hint}>{t('apply.f.portfolio.hint')}</p>
                                    <input
                                        type="url" value={formData.portfolioLink}
                                        onChange={e => set('portfolioLink', e.target.value)}
                                        className={styles.input}
                                        placeholder="https://github.com/your-profile"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Teaching Plan ── */}
                        {step === 4 && (
                            <div className={styles.stepContent}>
                                <div className={styles.infoBox}>
                                    {t('apply.plan.info')}
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.curriculum')}</label>
                                    <p className={styles.hint}>{t('apply.f.curriculum.hint')}</p>
                                    <textarea
                                        value={formData.curriculum}
                                        onChange={e => set('curriculum', e.target.value)}
                                        className={styles.textarea}
                                        placeholder={'Module 1: Introduction to Python (Week 1–2)\n• Outcome: Students can write scripts\n• Tools: Python, Jupyter, Pandas\n\nModule 2: …'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('apply.f.lesson')}</label>
                                    <p className={styles.hint}>{t('apply.f.lesson.hint')}</p>
                                    <textarea
                                        value={formData.lessonPlan}
                                        onChange={e => set('lessonPlan', e.target.value)}
                                        className={styles.textarea}
                                        placeholder={'Lesson 1 — Getting Started with Data (60 min)\n• Warm-up: Live data demo (10 min)\n• Theory (15 min)\n• Hands-on exercise (25 min)\n• Q&A (10 min)\n\nLesson 2 — …'}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Step 5: Agreement ── */}
                        {step === 5 && (
                            <div className={styles.stepContent}>
                                <div className={styles.infoBox}>
                                    {t('apply.agree.info')}
                                </div>
                                <div className={styles.termsBox}>
                                    <p><strong>{t('apply.terms.title')}</strong></p>
                                    <ul>
                                        <li>{t('apply.terms.1')}</li>
                                        <li>{t('apply.terms.2')}</li>
                                        <li>{t('apply.terms.3')}</li>
                                        <li>{t('apply.terms.4')}</li>
                                        <li>{t('apply.terms.5')}</li>
                                        <li>{t('apply.terms.6')}</li>
                                    </ul>
                                    <p style={{ marginTop: '12px' }}>
                                        {t('apply.terms.footer')}{' '}
                                        <a href="#" onClick={e => e.preventDefault()} title="Coming soon"
                                           style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'default' }}>{t('apply.terms.tos')}</a>
                                        {' '}{t('apply.terms.and')}{' '}
                                        <a href="#" onClick={e => e.preventDefault()} title="Coming soon"
                                           style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'default' }}>{t('apply.terms.pp')}</a>.
                                    </p>
                                </div>
                                <label className={styles.agreementRow}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agreed}
                                        onChange={e => set('agreed', e.target.checked)}
                                        className={styles.agreementCheckbox}
                                    />
                                    <span className={styles.agreementLabel}>{t('apply.agree.label')}</span>
                                </label>
                            </div>
                        )}

                        {/* Inline error */}
                        {error && (
                            <div className={styles.errorBanner} role="alert">
                                {error}
                            </div>
                        )}

                        {/* Footer */}
                        <div className={styles.footer}>
                            {step > 1 ? (
                                <button type="button" onClick={goBack} className={styles.btnSecondary}>
                                    {t('apply.btn.back')}
                                </button>
                            ) : (
                                <span />
                            )}

                            <span className={styles.stepCounter}>{step} / {STEPS.length}</span>

                            {step < 5 ? (
                                <button type="button" onClick={goNext} className={styles.btnPrimary}>
                                    {t('apply.btn.continue')}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !formData.agreed}
                                    className={styles.btnPrimary}
                                >
                                    {isSubmitting
                                        ? t('apply.btn.submitting')
                                        : !formData.agreed
                                            ? t('apply.btn.agree.first')
                                            : t('apply.btn.submit')}
                                </button>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
