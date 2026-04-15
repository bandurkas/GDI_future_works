'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './DigitalAdvisor.module.css';
import { X, MessageCircle, Calendar } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { trackConversion, getGAClientId, getFbc, getFbp } from '@/lib/analytics';
import { useWhatsAppCheck } from '@/hooks/useWhatsAppCheck';
import { validatePhone, buildFullPhone, phoneErrorText } from '@/lib/phone';
import WhatsAppWarningPopup from './WhatsAppWarningPopup';

export default function DigitalAdvisor() {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
    const [countryCode, setCountryCode] = useState('+62');
    const [phone, setPhone] = useState('');
    const [phoneTouched, setPhoneTouched] = useState(false);
    const fullPhone = buildFullPhone(countryCode, phone);
    const phoneValidation = validatePhone(countryCode, phone);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { check: checkWA, loading: waLoading, exists: waExists } = useWhatsAppCheck();
    const [showWAPopup, setShowWAPopup] = useState(false);
    const [waConfirmed, setWaConfirmed] = useState(false);
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const shouldResubmitRef = useRef(false);
    const submitInFlightRef = useRef(false);

    const handlePhoneBlur = async () => {
        setPhoneTouched(true);
        if (!phoneValidation.valid) return;
        await checkWA(fullPhone);
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
        if (waConfirmed && shouldResubmitRef.current && formRef.current) {
            shouldResubmitRef.current = false;
            formRef.current.requestSubmit();
        }
    }, [waConfirmed]);

    useEffect(() => {
        // Delay appearance by 4 seconds
        const timer = setTimeout(() => {
            if (!isDismissed) {
                setIsVisible(true);
                setIsExpanded(true);
            }
        }, 4000);

        return () => clearTimeout(timer);
    }, [isDismissed]);

    if (!isVisible || isDismissed) return null;

    const handleWhatsApp = () => {
        trackConversion('whatsapp_click', 'digital_advisor_maya');
        window.open('https://api.whatsapp.com/send/?phone=628211704707&text=Hi%20Maya%2C%20I%20need%20help%20choosing%20an%20IT%20course.', '_blank');
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneTouched(true);
        if (!phoneValidation.valid) return;
        if (submitInFlightRef.current) return;
        submitInFlightRef.current = true;

        try {
            const waOk = await checkWA(fullPhone);
            if (waOk === false && !waConfirmed) {
                setShowWAPopup(true);
                return;
            }
            const waStatus = waOk === true ? 'VERIFIED' : waConfirmed ? 'BYPASSED' : null;

            setIsSubmitting(true);
            const [gaClientId, fbClientId, fbBrowserId] = await Promise.all([
                getGAClientId(),
                Promise.resolve(getFbc()),
                Promise.resolve(getFbp())
            ]);

            const res = await fetch('/api/leads/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: fullPhone,
                    waStatus,
                    courseTitle: 'General Consultation',
                    courseSlug: 'consultation',
                    source: 'Digital Advisor: Maya',
                    gaClientId,
                    fbClientId,
                    fbBrowserId
                }),
            });

            if (res.ok) {
                trackConversion('lead_capture_maya', 'consultation_form');
                setStep('success');
            }
        } catch (err) {
            console.error('Lead submission failed', err);
        } finally {
            setIsSubmitting(false);
            submitInFlightRef.current = false;
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
        // If it was already small, dismiss completely
        if (!isExpanded) {
            setIsDismissed(true);
        }
    };

    if (!isExpanded) {
        return (
            <div className={styles.container}>
                <button 
                    className={styles.minimizedBubble}
                    onClick={() => {
                        setIsExpanded(true);
                        setStep('intro');
                    }}
                    aria-label="Open Advisor"
                >
                    <img 
                        src="/assets/advisor_premium.png" 
                        alt="Maya" 
                        className={styles.minimizedAvatar} 
                    />
                    <div className={styles.onlineDot} />
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.widget}>
                <button className={styles.closeBtn} onClick={handleClose} aria-label="Minimize">
                    <X size={14} />
                </button>
                
                <div className={styles.header}>
                    <div className={styles.avatarWrapper}>
                        <img 
                            src="/assets/advisor_premium.png" 
                            alt="Maya" 
                            className={styles.avatar} 
                        />
                        <div className={styles.onlineDot} />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.name}>Maya</span>
                        <span className={styles.role}>{t('maya.role')}</span>
                    </div>
                </div>

                {step === 'intro' && (
                    <>
                        <div className={styles.message}>
                            {t('maya.intro')}
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.btnPrimary} onClick={handleWhatsApp}>
                                <MessageCircle size={18} />
                                {t('maya.chatBtn')}
                            </button>
                            <button className={styles.btnSecondary} onClick={() => setStep('form')}>
                                <Calendar size={18} />
                                {t('maya.consultBtn')}
                            </button>
                        </div>
                    </>
                )}

                {step === 'form' && (
                    <form className={styles.form} onSubmit={handleLeadSubmit} ref={formRef}>
                        <div className={styles.message}>
                            Sure! Leave your WhatsApp/Phone number and I'll call you back soon.
                        </div>
                        <div className={styles.phoneInputGroup}>
                            <select
                                className={styles.countrySelect}
                                value={countryCode}
                                onChange={(e) => {
                                    setCountryCode(e.target.value);
                                    if (waConfirmed) setWaConfirmed(false);
                                }}
                                aria-label="Country code"
                            >
                                <option value="+62">🇮🇩 +62</option>
                                <option value="+60">🇲🇾 +60</option>
                                <option value="+65">🇸🇬 +65</option>
                                <option value="+1">🇺🇸 +1</option>
                            </select>
                            <input
                                ref={phoneInputRef}
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                placeholder={countryCode === '+62' ? '812 3456 7890' : '12 3456 7890'}
                                className={styles.phoneInput}
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value.replace(/[^\d\s]/g, ''));
                                    if (waConfirmed) setWaConfirmed(false);
                                }}
                                onBlur={handlePhoneBlur}
                                autoFocus
                                required
                            />
                        </div>
                        <div style={{ fontSize: 11, minHeight: 16, marginTop: -4 }}>
                            {phoneTouched && !phoneValidation.valid && phoneValidation.errorId && phoneValidation.errorId !== 'empty' && (
                                <span style={{ color: '#dc2626' }}>⚠ {phoneErrorText(phoneValidation.errorId, 'id')}</span>
                            )}
                            {phoneValidation.valid && waLoading && <span style={{ color: '#888' }}>Checking WhatsApp…</span>}
                            {phoneValidation.valid && !waLoading && waExists === true && <span style={{ color: '#16a34a' }}>✓ WhatsApp OK</span>}
                            {phoneValidation.valid && !waLoading && waExists === false && <span style={{ color: '#dc2626' }}>⚠ Not on WhatsApp</span>}
                        </div>
                        <button className={styles.btnSubmit} disabled={isSubmitting}>
                            {isSubmitting ? t('maya.submitting') : t('maya.submitBtn')}
                        </button>
                    </form>
                )}

                {step === 'success' && (
                    <div className={styles.successState}>
                        <span className={styles.successIcon}>✨</span>
                        <div className={styles.successTitle}>{t('maya.successTitle')}</div>
                        <div className={styles.successSub}>{t('maya.successSub')}</div>
                    </div>
                )}
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
