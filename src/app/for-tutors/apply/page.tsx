'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const EXPERTISE_OPTIONS = [
    'Graphic Design with AI',
    'Data Analytics for Professionals',
    'Python for Professionals',
    'LLM and AI Engineering',
    'TEFL / English Teaching',
    'Other Future Skill',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = [
    { key: 'morning',   label: 'Morning',   time: '06:00–10:00' },
    { key: 'midday',    label: 'Midday',    time: '10:00–14:00' },
    { key: 'afternoon', label: 'Afternoon', time: '14:00–18:00' },
    { key: 'evening',   label: 'Evening',   time: '18:00–22:00' },
];

const TIMEZONES = [
    { value: 'Asia/Jakarta',      label: 'WIB — Jakarta (UTC+7)' },
    { value: 'Asia/Makassar',     label: 'WITA — Makassar (UTC+8)' },
    { value: 'Asia/Jayapura',     label: 'WIT — Jayapura (UTC+9)' },
    { value: 'Asia/Kuala_Lumpur', label: 'MYT — Kuala Lumpur (UTC+8)' },
    { value: 'Asia/Singapore',    label: 'SGT — Singapore (UTC+8)' },
    { value: 'UTC',               label: 'UTC' },
];

// Step order: Profile → Availability → Work → Teaching Plan → Agreement
const STEPS = [
    { label: 'Your Profile',  title: 'Tell us about yourself',  badge: 'Step 1 of 5' },
    { label: 'Availability',  title: 'When can you teach?',     badge: 'Step 2 of 5' },
    { label: 'Your Work',     title: 'Share your credentials',  badge: 'Step 3 of 5' },
    { label: 'Teaching Plan', title: 'Outline your curriculum', badge: 'Step 4 of 5' },
    { label: 'Agreement',     title: 'Terms & Conditions',      badge: 'Step 5 of 5' },
];

interface FormData {
    name: string;
    email: string;
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
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(INITIAL);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
    // Step 1 = Profile, Step 2 = Availability, Step 3 = Work,
    // Step 4 = Teaching Plan, Step 5 = Agreement
    const validate = (s: number): string => {
        if (s === 1) {
            if (formData.name.trim().length < 2)       return 'Full name must be at least 2 characters.';
            if (!formData.email.includes('@'))          return 'Please enter a valid email address.';
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
            if (!isValidUrl(formData.videoLink.trim())) return 'Video URL must start with https:// (e.g. https://loom.com/share/...).';
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
                    <h1 className={styles.successTitle}>Application Received!</h1>
                    <p className={styles.successText}>
                        Thank you for applying to join the GDI FutureWorks tutor network.
                        Our team will review your profile, video, and curriculum outline.
                    </p>
                    <div className={styles.successMeta}>
                        <span className={styles.successMetaDot} />
                        We typically respond within 3–5 business days
                    </div>
                    <Link href="/" className={styles.btnPrimary}>Return to Homepage</Link>
                </div>
            </div>
        );
    }

    const currentStep = STEPS[step - 1];

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.eyebrow}>🎓 Tutor Application</div>
                    <h1 className={styles.title}>Become a <span>GDI</span> Tutor</h1>
                    <p className={styles.subtitle}>
                        Apply to join our curated network of expert educators and start earning by teaching the skills you know.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className={styles.progressWrapper}>
                    {STEPS.map((s, i) => (
                        <div
                            key={i}
                            className={`${styles.progressStep} ${i + 1 < step ? styles.stepDone : ''} ${i + 1 === step ? styles.stepActive : ''}`}
                        >
                            <div className={styles.progressTop}>
                                <div className={styles.progressDot}>
                                    {i + 1 < step ? '✓' : i + 1}
                                </div>
                                {i < STEPS.length - 1 && <div className={styles.progressLine} />}
                            </div>
                            <div className={styles.progressLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Form Card — plain div, no <form>, no accidental submit */}
                <div className={styles.formCard}>
                    <div className={styles.stepHeader}>
                        <div className={styles.stepBadge}>{currentStep.badge}</div>
                        <div className={styles.stepTitle}>{currentStep.title}</div>
                    </div>

                    <div>

                        {/* ── Step 1: Profile ── */}
                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        type="text" value={formData.name}
                                        onChange={e => set('name', e.target.value)}
                                        className={styles.input}
                                        placeholder="e.g. Sari Dewi"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Professional Email</label>
                                    <input
                                        type="email" value={formData.email}
                                        onChange={e => set('email', e.target.value)}
                                        className={styles.input}
                                        placeholder="sari@example.com"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Expertise Area</label>
                                    <select
                                        value={formData.expertise}
                                        onChange={e => set('expertise', e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">Select your teaching area…</option>
                                        {EXPERTISE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Professional Bio</label>
                                    <p className={styles.hint}>Tell us about your industry background and teaching experience.</p>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => set('bio', e.target.value)}
                                        className={styles.textarea}
                                        placeholder="I am a data professional with 7 years of experience at…"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>LinkedIn Profile URL</label>
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
                                    <strong>Tap cells to mark your availability.</strong> Click a day header to select all slots for that day, or a row label to select that time across all days.
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Your Timezone</label>
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
                                                        title={`Toggle ${slot.label} across all days`}
                                                    >
                                                        <span className={styles.gridSlotName}>{slot.label}</span>
                                                        <span className={styles.gridSlotTime}>{slot.time}</span>
                                                    </button>
                                                    {DAYS.map(day => {
                                                        const key = `${day}-${slot.key}`;
                                                        const isActive = formData.availability.includes(key);
                                                        return (
                                                            <button key={key} type="button"
                                                                className={`${styles.gridCell}${isActive ? ` ${styles.gridCellActive}` : ''}`}
                                                                onClick={() => toggleSlot(day, slot.key)}
                                                                aria-label={`${day} ${slot.label} — ${isActive ? 'selected' : 'not selected'}`}
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
                                            ? <span className={styles.gridSummaryEmpty}>No slots selected yet — tap cells above</span>
                                            : <span className={styles.gridSummaryCount}>{formData.availability.length} slot{formData.availability.length !== 1 ? 's' : ''} selected</span>
                                        }
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Your Work ── */}
                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.infoBox}>
                                    <strong>Why do we ask for this?</strong> Our community selects tutors based on real credibility. A short video and portfolio help students choose the right teacher for them.
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Introduction Video (3–5 mins)</label>
                                    <p className={styles.hint}>Record yourself teaching a short concept. Host it on Loom, YouTube, or Vimeo and paste the link below.</p>
                                    <input
                                        type="url" value={formData.videoLink}
                                        onChange={e => set('videoLink', e.target.value)}
                                        className={styles.input}
                                        placeholder="https://loom.com/share/abc123"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Portfolio / Work Examples{' '}
                                        <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— optional</span>
                                    </label>
                                    <p className={styles.hint}>Link to your GitHub, Behance, portfolio site, or previous course materials.</p>
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
                                    <strong>This is the most important step.</strong> A clear, structured curriculum is the #1 thing students look for when choosing a tutor.
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Proposed Curriculum Outline</label>
                                    <p className={styles.hint}>Summarize your modules, key learning outcomes, and tools/software used.</p>
                                    <textarea
                                        value={formData.curriculum}
                                        onChange={e => set('curriculum', e.target.value)}
                                        className={styles.textarea}
                                        placeholder={'Module 1: Introduction to Python (Week 1–2)\n• Outcome: Students can write scripts\n• Tools: Python, Jupyter, Pandas\n\nModule 2: …'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Sample Lesson Plan (2 Lessons)</label>
                                    <p className={styles.hint}>Walk us through two consecutive lessons as you would deliver them live.</p>
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
                                    <strong>Almost there!</strong> Please read and agree to our tutor terms before submitting your application.
                                </div>
                                <div className={styles.termsBox}>
                                    <p><strong>Tutor Code of Conduct</strong></p>
                                    <ul>
                                        <li>You will deliver sessions on time and as scheduled with students.</li>
                                        <li>You will not share students' personal data with any third party.</li>
                                        <li>All curriculum content you submit must be your original work or properly licensed.</li>
                                        <li>You agree to GDI FutureWorks' platform fee structure (as communicated in your onboarding).</li>
                                        <li>GDI FutureWorks reserves the right to remove tutors who violate community standards.</li>
                                        <li>You confirm that all information in this application is accurate and truthful.</li>
                                    </ul>
                                    <p style={{ marginTop: '12px' }}>
                                        By submitting, you also agree to our{' '}
                                        <a href="#" onClick={e => e.preventDefault()} title="Coming soon"
                                           style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'default' }}>Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="#" onClick={e => e.preventDefault()} title="Coming soon"
                                           style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'default' }}>Privacy Policy</a>.
                                    </p>
                                </div>
                                <label className={styles.agreementRow}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agreed}
                                        onChange={e => set('agreed', e.target.checked)}
                                        className={styles.agreementCheckbox}
                                    />
                                    <span className={styles.agreementLabel}>
                                        I have read and agree to the Tutor Code of Conduct, Terms of Service, and Privacy Policy.
                                    </span>
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
                                    ← Back
                                </button>
                            ) : (
                                <span />
                            )}

                            <span className={styles.stepCounter}>{step} / {STEPS.length}</span>

                            {step < 5 ? (
                                <button type="button" onClick={goNext} className={styles.btnPrimary}>
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !formData.agreed}
                                    className={styles.btnPrimary}
                                >
                                    {isSubmitting ? 'Submitting…' : !formData.agreed ? 'Agree to terms to continue' : 'Submit Application →'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
