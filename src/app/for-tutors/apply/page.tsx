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
    'Other Future Skill'
];

const STEPS = [
    { label: 'Your Profile', title: 'Tell us about yourself', badge: 'Step 1 of 3' },
    { label: 'Your Work', title: 'Share your credentials', badge: 'Step 2 of 3' },
    { label: 'Teaching Plan', title: 'Outline your curriculum', badge: 'Step 3 of 3' },
];

export default function TutorApplyPage() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        linkedin: '',
        bio: '',
        expertise: '',
        videoLink: '',
        portfolioLink: '',
        curriculum: '',
        lessonPlan: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/tutor-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsSuccess(true);
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch {
            alert('Error submitting application.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <div className={styles.progressSteps}>
                        {STEPS.map((s, i) => (
                            <div key={i} className={styles.progressItem}>
                                <div className={`${styles.progressDot} ${i + 1 < step ? styles.progressDotDone : ''} ${i + 1 === step ? styles.progressDotActive : ''}`}>
                                    {i + 1 < step ? '✓' : i + 1}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`${styles.progressLine} ${i + 1 < step ? styles.progressLineDone : ''}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={styles.progressLabels}>
                        {STEPS.map((s, i) => (
                            <div key={i} className={`${styles.progressLabel} ${i + 1 === step ? styles.progressLabelActive : ''}`}>
                                {s.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className={styles.formCard}>
                    <div className={styles.stepHeader}>
                        <div className={styles.stepBadge}>{currentStep.badge}</div>
                        <div className={styles.stepTitle}>{currentStep.title}</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* ── Step 1: Profile ── */}
                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        type="text" name="name" value={formData.name}
                                        onChange={handleChange} className={styles.input}
                                        placeholder="e.g. Sari Dewi" required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Professional Email</label>
                                    <input
                                        type="email" name="email" value={formData.email}
                                        onChange={handleChange} className={styles.input}
                                        placeholder="sari@example.com" required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Expertise Area</label>
                                    <select
                                        name="expertise" value={formData.expertise}
                                        onChange={handleChange} className={styles.select} required
                                    >
                                        <option value="">Select your teaching area…</option>
                                        {EXPERTISE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Professional Bio</label>
                                    <p className={styles.hint}>Tell us about your industry background and teaching experience. Be specific about years of experience.</p>
                                    <textarea
                                        name="bio" value={formData.bio}
                                        onChange={handleChange} className={styles.textarea}
                                        placeholder="I am a data professional with 7 years of experience at…" required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>LinkedIn Profile URL</label>
                                    <input
                                        type="url" name="linkedin" value={formData.linkedin}
                                        onChange={handleChange} className={styles.input}
                                        placeholder="https://linkedin.com/in/your-name" required
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Credentials ── */}
                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <div className={styles.infoBox}>
                                    <strong>Why do we ask for this?</strong> Our community selects tutors based on real credibility. A short video and portfolio help students choose the right teacher for them.
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Introduction Video (3–5 mins)</label>
                                    <p className={styles.hint}>Record yourself teaching a short concept in your expertise area. Host it on Loom, YouTube, or Vimeo and paste the link below.</p>
                                    <input
                                        type="url" name="videoLink" value={formData.videoLink}
                                        onChange={handleChange} className={styles.input}
                                        placeholder="https://loom.com/share/abc123" required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Portfolio / Work Examples</label>
                                    <p className={styles.hint}>Link to your GitHub, Behance, portfolio site, or any previous course materials you have created.</p>
                                    <input
                                        type="url" name="portfolioLink" value={formData.portfolioLink}
                                        onChange={handleChange} className={styles.input}
                                        placeholder="https://github.com/your-profile" required
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Curriculum ── */}
                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.infoBox}>
                                    <strong>This is the most important step.</strong> A clear, structured curriculum is the #1 thing students look for when choosing a tutor on GDI FutureWorks.
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Proposed Curriculum Outline</label>
                                    <p className={styles.hint}>Summarize how you would deliver your chosen program: modules, key learning outcomes, and tools/software used.</p>
                                    <textarea
                                        name="curriculum" value={formData.curriculum}
                                        onChange={handleChange} className={styles.textarea}
                                        placeholder={"Module 1: Introduction to Python (Week 1–2)\n• Outcome: Students can write scripts and run data pipelines\n• Tools: Python, Jupyter, Pandas\n\nModule 2: …"}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Sample Lesson Plan (2 Lessons)</label>
                                    <p className={styles.hint}>Walk us through two consecutive lessons as you would deliver them live.</p>
                                    <textarea
                                        name="lessonPlan" value={formData.lessonPlan}
                                        onChange={handleChange} className={styles.textarea}
                                        placeholder={"Lesson 1 — Getting Started with Data (60 min)\n• Warm-up: Live data demo (10 min)\n• Theory: Types of data & sources (15 min)\n• Hands-on: Excel exercise (25 min)\n• Q&A (10 min)\n\nLesson 2 — …"}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className={styles.footer}>
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className={styles.btnSecondary}>
                                    ← Back
                                </button>
                            ) : (
                                <span />
                            )}
                            <span className={styles.stepCounter}>{step} / {STEPS.length}</span>
                            {step < 3 ? (
                                <button type="button" onClick={nextStep} className={styles.btnPrimary}>
                                    Continue →
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className={styles.btnPrimary}>
                                    {isSubmitting ? 'Submitting…' : 'Submit Application →'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
