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
        } catch (error) {
            alert('Error submitting application.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.success}>
                        <span className={styles.successIcon}>🚀</span>
                        <h1 className={styles.successTitle}>Application Received!</h1>
                        <p className={styles.successText}>
                            Thank you for applying to join the GDI FutureWorks tutor network. 
                            Our team will review your profile, video, and curriculum outline. 
                            We typically get back to applicants within 3-5 business days.
                        </p>
                        <Link href="/" className={styles.btnPrimary}>Return Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Become a GDI Tutor</h1>
                    <p className={styles.subtitle}>Apply to join our curated network of expert educators.</p>
                </div>

                <div className={styles.progress}>
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`${styles.progressStep} ${s <= step ? styles.progressStepActive : ''}`} />
                    ))}
                </div>

                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} placeholder="e.g. John Doe" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Professional Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} placeholder="john@example.com" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Expertise Area</label>
                                    <select name="expertise" value={formData.expertise} onChange={handleChange} className={styles.select} required>
                                        <option value="">Select your area...</option>
                                        {EXPERTISE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Professional Bio</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange} className={styles.textarea} placeholder="Tell us about your industry background and teaching experience..." required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>LinkedIn Profile URL</label>
                                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className={styles.input} placeholder="https://linkedin.com/in/..." required />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Introduction Video (3-4 mins)</label>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Paste a link to your hosting service (Loom, YouTube, Vimeo, etc.)</p>
                                    <input type="url" name="videoLink" value={formData.videoLink} onChange={handleChange} className={styles.input} placeholder="https://loom.com/..." required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tutor Portfolio / Work Examples</label>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Link to your portfolio, GitHub, or previous course materials.</p>
                                    <input type="url" name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} className={styles.input} placeholder="https://portfolio.com/..." required />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Proposed Curriculum Outline</label>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Summarize how you would deliver your chosen program.</p>
                                    <textarea name="curriculum" value={formData.curriculum} onChange={handleChange} className={styles.textarea} placeholder="Modules, key outcomes, and tools used..." required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Sample Lesson Plan (2 Lessons)</label>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Provide a mock structure demonstrating your teaching approach.</p>
                                    <textarea name="lessonPlan" value={formData.lessonPlan} onChange={handleChange} className={styles.textarea} placeholder="Lesson 1: Objective & Activity... Lesson 2: ..." required />
                                </div>
                            </div>
                        )}

                        <div className={styles.footer}>
                            {step > 1 && (
                                <button type="button" onClick={prevStep} className={styles.btnSecondary}>Back</button>
                            )}
                            <div style={{ flex: 1 }} />
                            {step < 3 ? (
                                <button type="button" onClick={nextStep} className={styles.btnPrimary}>Next Step</button>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className={styles.btnPrimary}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
