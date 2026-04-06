'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2 } from 'lucide-react';
import PathCard from '@/components/PathCard';
import { useLanguage } from '@/components/LanguageContext';
import pageStyles from '@/app/page.module.css';
import styles from './PartnershipSection.module.css';

function InterestDrawer({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        country: '',
        interest: '',
        goal: '',
        budget: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit');
            }
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={e => e.stopPropagation()}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Register Your Interest</h3>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.panelBody}>
                    <p className={styles.panelSubhead}>
                        Be the first to receive updates, programme details, and early access when enrolment opens.
                    </p>

                    {submitted ? (
                        <div className={styles.success}>
                            <div className={styles.successIcon}>
                                <CheckCircle2 size={28} />
                            </div>
                            <h4 className={styles.successTitle}>You&apos;re on the list!</h4>
                            <p className={styles.successDesc}>
                                Thank you for registering your interest. We&apos;ll be in touch with programme details and early access information.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="interest-name">Full Name</label>
                                <input
                                    id="interest-name"
                                    className={styles.input}
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="interest-email">Email</label>
                                <input
                                    id="interest-email"
                                    className={styles.input}
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="interest-country">Country of Residence</label>
                                <input
                                    id="interest-country"
                                    className={styles.input}
                                    type="text"
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    placeholder="e.g. Indonesia, Malaysia…"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="interest-interest">I am interested in</label>
                                <select
                                    id="interest-interest"
                                    className={styles.select}
                                    name="interest"
                                    value={form.interest}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">— Select —</option>
                                    <option value="Improving my English (General/IELTS/Professional)">Improving my English (General/IELTS/Professional)</option>
                                    <option value="Teaching English as a new skill">Teaching English as a new skill</option>
                                    <option value="Exploring both learning and teaching opportunities">Exploring both learning and teaching opportunities</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="interest-goal">Primary Goal</label>
                                <select
                                    id="interest-goal"
                                    className={styles.select}
                                    name="goal"
                                    value={form.goal}
                                    onChange={handleChange}
                                >
                                    <option value="">— Select (optional) —</option>
                                    <option value="Study abroad">Study abroad</option>
                                    <option value="Career advancement / Global work opportunities">Career advancement / Global work opportunities</option>
                                    <option value="Remote income / Teaching online">Remote income / Teaching online</option>
                                    <option value="Personal development">Personal development</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="interest-budget">Expected Investment</label>
                                <select
                                    id="interest-budget"
                                    className={styles.select}
                                    name="budget"
                                    value={form.budget}
                                    onChange={handleChange}
                                >
                                    <option value="">— Select (optional) —</option>
                                    <option value="< USD 200">&lt; USD 200</option>
                                    <option value="USD 200–500">USD 200–500</option>
                                    <option value="USD 500–1,000">USD 500–1,000</option>
                                    <option value="> USD 1,000">&gt; USD 1,000</option>
                                </select>
                            </div>

                            <p className={styles.scarcity}>Limited early access will be offered to selected applicants.</p>

                            {error && (
                                <p style={{ color: '#e53e3e', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                            )}

                            <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'Sending…' : 'Register your interest'}
                            </button>

                            <ul className={styles.disclaimer}>
                                <li>Programmes are currently in development</li>
                                <li>Details, structure, and certification pathways will be shared upon launch</li>
                            </ul>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PartnershipSection() {
    const { t } = useLanguage();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <section className={pageStyles.greatEnglishSection}>
            <div className="container">
                <div className={pageStyles.greatEnglishCard}>
                    <h2 className={pageStyles.geTitle}>{t('partner.title')}</h2>
                    <p className={pageStyles.geDesc}>{t('partner.desc')}</p>

                    <div className={pageStyles.geGrid}>
                        <PathCard
                            title={t('partner.learn.title')}
                            description={t('partner.learn.desc')}
                            list={[
                                t('partner.learn.i1'),
                                t('partner.learn.i2'),
                                t('partner.learn.i3'),
                                t('partner.learn.i4'),
                            ]}
                            variant="secondary"
                        />

                        <PathCard
                            title={t('partner.teach.title')}
                            description={t('partner.teach.desc')}
                            variant="primary"
                            accentBar
                            highlights={[
                                { icon: '🌍', text: 'Work in 150+ countries' },
                                { icon: '💻', text: 'Teach online, anywhere' },
                                { icon: '📜', text: 'Internationally recognised' },
                                { icon: '💰', text: 'Build flexible income' },
                            ]}
                        />
                    </div>

                    <div className={styles.geActionRow}>
                        <p className={styles.geActionNote}>Be the first to receive updates when our programmes launch.</p>
                        <button className={styles.geRegisterBtn} onClick={() => setDrawerOpen(true)}>
                            Register your interest →
                        </button>
                    </div>
                </div>
            </div>

            {drawerOpen && typeof window !== 'undefined' &&
                createPortal(
                    <InterestDrawer onClose={() => setDrawerOpen(false)} />,
                    document.body
                )
            }
        </section>
    );
}
