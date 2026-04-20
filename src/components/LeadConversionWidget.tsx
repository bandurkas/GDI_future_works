'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Download, Calendar, MessageCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { trackConversion, trackEvent, getGAClientId, getFbc, getFbp } from '@/lib/analytics';
import styles from './LeadConversionWidget.module.css';
import { useLanguage } from './LanguageContext';

interface LeadConversionWidgetProps {
    courseId?: string;
    courseTitle?: string;
    isOpen: boolean;
    onClose: () => void;
}

type Scenario = 'Syllabus' | 'Consultation' | null;
type Step = 'choice' | 'fields' | 'success';

export default function LeadConversionWidget({ courseId, courseTitle, isOpen, onClose }: LeadConversionWidgetProps) {
    const { language } = useLanguage();
    const isID = language === 'id';
    
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
            trackEvent('lead_widget_open', { course_title: courseTitle, lang: language });
        }
    }, [isOpen, courseTitle, language]);

    const handleChoice = (s: Scenario) => {
        setScenario(s);
        setStep('fields');
        trackEvent('lead_widget_choice', { scenario: s, course_title: courseTitle, lang: language });
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
            const [gaClientId, fbClientId, fbBrowserId] = await Promise.all([
                getGAClientId(),
                Promise.resolve(getFbc()),
                Promise.resolve(getFbp())
            ]);

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
                    lang: language,
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

    const t = {
        help: isID ? 'Apa yang bisa kami bantu?' : 'How can we help?',
        success: isID ? 'Berhasil!' : 'Success!',
        syllabus: isID ? 'Unduh Silabus' : 'Download Syllabus',
        consult: isID ? 'Konsultasi Gratis' : 'Book Consultation',
        select: isID ? 'Pilih opsi untuk melanjutkan:' : 'Select an option to continue:',
        fullSyllabus: isID ? 'Dapatkan Silabus Lengkap' : 'Get Full Syllabus',
        syllabusDesc: isID ? 'Kami akan mengirimkan kurikulum detail ke email Anda.' : "We'll send the detailed curriculum to your email.",
        freeConsult: isID ? 'Konsultasi Karir Gratis' : 'Free Career Consultation',
        consultDesc: isID ? 'Bicaralah dengan ahli tentang tujuan karir Anda.' : 'Talk to an expert about your career goals.',
        name: isID ? 'Nama Lengkap' : 'Your Name',
        namePlaceholder: isID ? 'Masukkan nama lengkap' : 'Enter your name',
        email: isID ? 'Alamat Email' : 'Email Address',
        emailPlaceholder: isID ? 'alamat@email.com' : 'where@should.we.send.it',
        whatsapp: isID ? 'WhatsApp / Telepon' : 'WhatsApp / Phone',
        time: isID ? 'Waktu yang Nyaman' : 'Convenient Time',
        selectTime: isID ? 'Pilih waktu' : 'Select a time',
        times: {
            morning: isID ? 'Pagi (09:00 - 12:00)' : 'Morning (9:00 - 12:00)',
            afternoon: isID ? 'Siang (14:00 - 17:00)' : 'Afternoon (14:00 - 17:00)',
            evening: isID ? 'Sore/Malam (18:00 - 21:00)' : 'Evening (18:00 - 21:00)',
        },
        submitSyllabus: isID ? 'Kirim Silabus ke Saya' : 'Send me the Syllabus',
        submitConsult: isID ? 'Jadwalkan Sesi Saya' : 'Book My Session',
        sending: isID ? 'Mengirim...' : 'Sending...',
        privacy: isID ? 'Kami menghormati privasi Anda. Tanpa spam, hanya manfaat.' : 'We respect your privacy. No spam, only value.',
        successSyllabus: isID ? 'Silabus dalam perjalanan!' : 'Syllabus is on the way!',
        successConsult: isID ? 'Sesi Terjadwal!' : 'Consultation Booked!',
        sentTo: isID ? 'Kami telah mengirimkan PDF ke' : "We've sent the PDF to",
        checkInbox: isID ? 'Silakan cek kotak masuk Anda segera.' : 'Check your inbox shortly.',
        advisorReach: isID ? 'Konsultan kami akan menghubungi Anda pada waktu yang dipilih.' : 'Our advisor will reach out to you at the preferred time.',
        downloadNow: isID ? 'Unduh Sekarang' : 'Download Now',
        waFast: isID ? 'Butuh respon cepat? Chat di WhatsApp' : 'Chat was faster? Talk on WhatsApp',
        back: isID ? 'Kembali ke Materi' : 'Back to Course'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div 
                        className={styles.widget}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        <div className={styles.header}>
                            {step === 'fields' && (
                                <button onClick={handleBack} className={styles.backBtn}>
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <div className={styles.titleGroup}>
                                <h3 className={styles.title}>
                                    {step === 'choice' ? t.help : 
                                     step === 'success' ? t.success : 
                                     scenario === 'Syllabus' ? t.syllabus : t.consult}
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
                                        <p className={styles.instruction}>{t.select}</p>
                                        <div className={styles.options}>
                                            <button 
                                                className={styles.optionCard}
                                                onClick={() => handleChoice('Syllabus')}
                                            >
                                                <div className={styles.optionIcon}><Download size={24} /></div>
                                                <div className={styles.optionText}>
                                                    <span className={styles.optionTitle}>{t.fullSyllabus}</span>
                                                    <span className={styles.optionDesc}>{t.syllabusDesc}</span>
                                                </div>
                                                <ChevronRight size={18} className={styles.chevron} />
                                            </button>

                                            <button 
                                                className={styles.optionCard}
                                                onClick={() => handleChoice('Consultation')}
                                            >
                                                <div className={styles.optionIcon}><Calendar size={24} /></div>
                                                <div className={styles.optionText}>
                                                    <span className={styles.optionTitle}>{t.freeConsult}</span>
                                                    <span className={styles.optionDesc}>{t.consultDesc}</span>
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
                                            <label>{t.name}</label>
                                            <input 
                                                type="text" 
                                                placeholder={t.namePlaceholder}
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>

                                        {scenario === 'Syllabus' ? (
                                            <div className={styles.field}>
                                                <label>{t.email}</label>
                                                <input 
                                                    type="email" 
                                                    placeholder={t.emailPlaceholder}
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className={styles.field}>
                                                    <label>{t.whatsapp}</label>
                                                    <input 
                                                        type="tel" 
                                                        placeholder="+62..."
                                                        required
                                                        value={formData.phone}
                                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                                    />
                                                </div>
                                                <div className={styles.field}>
                                                    <label>{t.time}</label>
                                                    <select 
                                                        required
                                                        value={formData.preferredTime}
                                                        onChange={e => setFormData({...formData, preferredTime: e.target.value})}
                                                    >
                                                        <option value="">{t.selectTime}</option>
                                                        <option value="morning">{t.times.morning}</option>
                                                        <option value="afternoon">{t.times.afternoon}</option>
                                                        <option value="evening">{t.times.evening}</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <button className={styles.submitBtn} disabled={isSubmitting}>
                                            {isSubmitting ? t.sending : scenario === 'Syllabus' ? t.submitSyllabus : t.submitConsult}
                                        </button>
                                        <p className={styles.privacyNote}>{t.privacy}</p>
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
                                        <h4>{scenario === 'Syllabus' ? t.successSyllabus : t.successConsult}</h4>
                                        <p>
                                            {scenario === 'Syllabus' 
                                                ? `${t.sentTo} ${formData.email}. ${t.checkInbox}`
                                                : t.advisorReach}
                                        </p>
                                        
                                        <div className={styles.postActions}>
                                            {scenario === 'Syllabus' && (
                                                <button className={styles.downloadBtn}>
                                                    <Download size={18} /> {t.downloadNow}
                                                </button>
                                            )}
                                            <a 
                                                href="https://api.whatsapp.com/send/?phone=628211704707&text=Hi%2C%20I%20just%20filled%20the%20form%20for%20Data%20Analytics"
                                                target="_blank"
                                                className={styles.waBtn}
                                            >
                                                <MessageCircle size={18} /> {t.waFast}
                                            </a>
                                            <button className={styles.secondaryBtn} onClick={onClose}>
                                                {t.back}
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
