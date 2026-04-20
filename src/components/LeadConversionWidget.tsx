'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Download, Calendar, MessageCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { trackConversion, trackEvent, getGAClientId, getFbc, getFbp } from '@/lib/analytics';
import styles from './LeadConversionWidget.module.css';

interface LeadConversionWidgetProps {
    courseId?: string;
    courseTitle?: string;
    isOpen: boolean;
    onClose: () => void;
}

type Scenario = 'Syllabus' | 'Consultation' | null;
type Step = 'choice' | 'fields' | 'success';

export default function LeadConversionWidget({ courseId, courseTitle, isOpen, onClose }: LeadConversionWidgetProps) {
    const [scenario, setScenario] = useState<Scenario>(null);
    const [step, setStep] = useState<Step>('choice');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        preferredTime: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('choice');
            setScenario(null);
            trackEvent('lead_widget_open', { course_title: courseTitle });
        }
    }, [isOpen]);

    const handleChoice = (s: Scenario) => {
        setScenario(s);
        setStep('fields');
        trackEvent('lead_widget_choice', { scenario: s, course_title: courseTitle });
    };

    const handleBack = () => {
        if (step === 'fields') {
            setStep('choice');
            setScenario(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Get tracking IDs
            const [gaClientId, fbClientId, fbBrowserId] = await Promise.all([
                getGAClientId(),
                Promise.resolve(getFbc()),
                Promise.resolve(getFbp())
            ]);

            // Capture UTMs from URL
            const urlParams = new URLSearchParams(window.location.search);

            const res = await fetch('/api/leads/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    scenario,
                    courseTitle,
                    courseId,
                    gaClientId,
                    fbClientId,
                    fbBrowserId,
                    utmSource: urlParams.get('utm_source'),
                    utmMedium: urlParams.get('utm_medium'),
                    utmCampaign: urlParams.get('utm_campaign'),
                }),
            });

            if (res.ok) {
                trackConversion('lead_magnet_capture', scenario || 'consultation');
                setStep('success');
            }
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for Mobile */}
                    <motion.div 
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Widget Container */}
                    <motion.div 
                        className={styles.widget}
                        initial={{ x: '100%', y: 0 }} // Desktop default
                        animate={{ x: 0, y: 0 }}
                        exit={{ x: '100%', y: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.header}>
                            {step === 'fields' && (
                                <button onClick={handleBack} className={styles.backBtn}>
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <div className={styles.titleGroup}>
                                <h3 className={styles.title}>
                                    {step === 'choice' ? 'How can we help?' : 
                                     step === 'success' ? 'Success!' : 
                                     scenario === 'Syllabus' ? 'Download Syllabus' : 'Book Consultation'}
                                </h3>
                                {courseTitle && step !== 'success' && (
                                    <span className={styles.subtitle}>{courseTitle}</span>
                                )}
                            </div>
                            <button onClick={onClose} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <AnimatePresence mode="wait">
                                {step === 'choice' && (
                                    <motion.div 
                                        key="choice"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={styles.stepContent}
                                    >
                                        <p className={styles.instruction}>Select an option to continue:</p>
                                        <div className={styles.options}>
                                            <button 
                                                className={styles.optionCard}
                                                onClick={() => handleChoice('Syllabus')}
                                            >
                                                <div className={styles.optionIcon}><Download size={24} /></div>
                                                <div className={styles.optionText}>
                                                    <span className={styles.optionTitle}>Get Full Syllabus</span>
                                                    <span className={styles.optionDesc}>We'll send the detailed curriculum to your email.</span>
                                                </div>
                                                <ChevronRight size={18} className={styles.chevron} />
                                            </button>

                                            <button 
                                                className={styles.optionCard}
                                                onClick={() => handleChoice('Consultation')}
                                            >
                                                <div className={styles.optionIcon}><Calendar size={24} /></div>
                                                <div className={styles.optionText}>
                                                    <span className={styles.optionTitle}>Free Consultation</span>
                                                    <span className={styles.optionDesc}>Talk to an expert about your career goals.</span>
                                                </div>
                                                <ChevronRight size={18} className={styles.chevron} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'fields' && (
                                    <motion.form 
                                        key="fields"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleSubmit}
                                        className={styles.form}
                                    >
                                        <div className={styles.field}>
                                            <label>Your Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="Enter your name"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>

                                        {scenario === 'Syllabus' ? (
                                            <div className={styles.field}>
                                                <label>Email Address</label>
                                                <input 
                                                    type="email" 
                                                    placeholder="where@should.we.send.it"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className={styles.field}>
                                                    <label>WhatsApp / Phone</label>
                                                    <input 
                                                        type="tel" 
                                                        placeholder="+62..."
                                                        required
                                                        value={formData.phone}
                                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                                    />
                                                </div>
                                                <div className={styles.field}>
                                                    <label>Convenient Time</label>
                                                    <select 
                                                        required
                                                        value={formData.preferredTime}
                                                        onChange={e => setFormData({...formData, preferredTime: e.target.value})}
                                                    >
                                                        <option value="">Select a time</option>
                                                        <option value="morning">Morning (9:00 - 12:00)</option>
                                                        <option value="afternoon">Afternoon (14:00 - 17:00)</option>
                                                        <option value="evening">Evening (18:00 - 21:00)</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <button className={styles.submitBtn} disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending...' : scenario === 'Syllabus' ? 'Send me the Syllabus' : 'Book My Session'}
                                        </button>
                                        <p className={styles.privacyNote}>We respect your privacy. No spam, only value.</p>
                                    </motion.form>
                                )}

                                {step === 'success' && (
                                    <motion.div 
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={styles.successState}
                                    >
                                        <div className={styles.successIcon}><CheckCircle2 size={48} /></div>
                                        <h4>{scenario === 'Syllabus' ? 'Syllabus is on the way!' : 'Consultation Booked!'}</h4>
                                        <p>
                                            {scenario === 'Syllabus' 
                                                ? `We've sent the PDF to ${formData.email}. Check your inbox shortly.`
                                                : "Our advisor will reach out to you at the preferred time."}
                                        </p>
                                        
                                        <div className={styles.postActions}>
                                            {scenario === 'Syllabus' && (
                                                <button className={styles.downloadBtn}>
                                                    <Download size={18} /> Download Now
                                                </button>
                                            )}
                                            <button className={styles.waBtn}>
                                                <MessageCircle size={18} /> Chat was faster? Talk on WhatsApp
                                            </button>
                                            <button className={styles.secondaryBtn} onClick={onClose}>
                                                Back to Course
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
