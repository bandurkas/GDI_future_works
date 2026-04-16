'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, User, Mail, Globe, MessageCircle, Target, Briefcase, TrendingUp } from 'lucide-react';
import PathCard from '@/components/PathCard';
import { useLanguage } from '@/components/LanguageContext';
import { trackConversion } from '@/lib/analytics';
import { getStoredUTMs } from '@/lib/utm';
import pageStyles from '@/app/page.module.css';
import styles from './PartnershipSection.module.css';

function InterestDrawer({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
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
            const utms = getStoredUTMs();
            const res = await fetch('/api/interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, ...utms }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit');
            }
            
            trackConversion('partnership_form');
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
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.panelBody}>
                    {submitted ? (
                        <div className={styles.success}>
                            <div className={styles.successIcon}>
                                <CheckCircle2 size={40} />
                            </div>
                            <h4 className={styles.successTitle}>You&apos;re on the list!</h4>
                            <p className={styles.successDesc}>
                                Thank you for registering your interest. We&apos;ll be in touch with programme details and early access information.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className={styles.panelSubhead}>
                                Be the first to receive updates, programme details, and early access when enrolment opens.
                            </p>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.field} style={{ animationDelay: '0.1s' }}>
                                    <label className={styles.label} htmlFor="interest-name">Full Name</label>
                                    <div className={styles.inputGroup}>
                                        <User className={styles.inputIcon} size={18} />
                                        <input
                                            id="interest-name"
                                            className={`${styles.input} ${styles.inputWithIcon}`}
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.field} style={{ animationDelay: '0.15s' }}>
                                    <label className={styles.label} htmlFor="interest-email">Email</label>
                                    <div className={styles.inputGroup}>
                                        <Mail className={styles.inputIcon} size={18} />
                                        <input
                                            id="interest-email"
                                            className={`${styles.input} ${styles.inputWithIcon}`}
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.field} style={{ animationDelay: '0.2s' }}>
                                    <label className={styles.label} htmlFor="interest-phone">WhatsApp / Phone Number</label>
                                    <div className={styles.inputGroup}>
                                        <MessageCircle className={styles.inputIcon} size={18} />
                                        <input
                                            id="interest-phone"
                                            className={`${styles.input} ${styles.inputWithIcon}`}
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. +62 812..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.field} style={{ animationDelay: '0.25s' }}>
                                    <label className={styles.label} htmlFor="interest-country">Country of Residence</label>
                                    <div className={styles.inputGroup}>
                                        <Globe className={styles.inputIcon} size={18} />
                                        <input
                                            id="interest-country"
                                            className={`${styles.input} ${styles.inputWithIcon}`}
                                            type="text"
                                            name="country"
                                            value={form.country}
                                            onChange={handleChange}
                                            placeholder="e.g. Indonesia, Malaysia…"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.field} style={{ animationDelay: '0.3s' }}>
                                    <label className={styles.label} htmlFor="interest-interest">I am interested in</label>
                                    <div className={styles.inputGroup}>
                                        <TrendingUp className={styles.inputIcon} size={18} />
                                        <select
                                            id="interest-interest"
                                            className={`${styles.select} ${styles.inputWithIcon}`}
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
                                </div>

                                <div className={styles.field} style={{ animationDelay: '0.35s' }}>
                                    <label className={styles.label} htmlFor="interest-goal">Primary Goal</label>
                                    <div className={styles.inputGroup}>
                                        <Target className={styles.inputIcon} size={18} />
                                        <select
                                            id="interest-goal"
                                            className={`${styles.select} ${styles.inputWithIcon}`}
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
                                </div>

                                <div className={styles.field} style={{ animationDelay: '0.4s' }}>
                                    <label className={styles.label} htmlFor="interest-budget">Expected Investment</label>
                                    <div className={styles.inputGroup}>
                                        <Briefcase className={styles.inputIcon} size={18} />
                                        <select
                                            id="interest-budget"
                                            className={`${styles.select} ${styles.inputWithIcon}`}
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
                                </div>

                                <p className={styles.scarcity} style={{ animationDelay: '0.45s', animationFillMode: 'both', animationName: 'fadeInUp' }}>
                                    Limited early access will be offered to selected applicants.
                                </p>

                                {error && (
                                    <p style={{ color: '#e53e3e', fontSize: '0.875rem', margin: '0 0 12px' }}>{error}</p>
                                )}

                                <button 
                                    type="submit" 
                                    className={styles.submitBtn} 
                                    disabled={submitting}
                                    style={{ animationDelay: '0.5s', animationFillMode: 'both', animationName: 'fadeInUp' }}
                                >
                                    {submitting ? 'Sending…' : 'Register your interest'}
                                </button>

                                <ul className={styles.disclaimer} style={{ animationDelay: '0.6s', animationFillMode: 'both', animationName: 'fadeIn' }}>
                                    <li>Programmes are currently in development</li>
                                    <li>Details, structure, and certification pathways will be shared upon launch</li>
                                </ul>
                            </form>
                        </>
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
                            list={[
                                t('partner.teach.b1'),
                                t('partner.teach.b2'),
                                t('partner.teach.b3'),
                                t('partner.teach.b4'),
                            ]}
                        />
                    </div>

                    <div className={styles.geActionRow}>
                        <p className={styles.geActionNote}>{t('partner.actionNote')}</p>
                        <button className={styles.geRegisterBtn} onClick={() => setDrawerOpen(true)}>
                            {t('partner.registerBtn')}
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
