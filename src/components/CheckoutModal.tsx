'use client';

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import styles from './CheckoutModal.module.css';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; phone: string; email?: string }) => Promise<void>;
    totalAmount: string;
    currency: string;
}

export default function CheckoutModal({ isOpen, onClose, onSubmit, totalAmount, currency }: CheckoutModalProps) {
    const { data: session } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [email, setEmail] = useState(session?.user?.email || '');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simplified: only name and phone are strictly required for initial lead capture
        if (!name || !phone) {
            setError('Please fill in your name and phone number');
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            await onSubmit({ name, phone, email });
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
                
                <div className={styles.header}>
                    <h2>Complete Your Enrollment</h2>
                    <p>Enter your details to proceed to secure payment.</p>
                </div>

                {!session && (
                    <div className={styles.socialAuth}>
                        <button 
                            className={styles.googleBtn}
                            onClick={() => signIn('google')}
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18">
                                <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.7l2.91 2.26c1.7-1.57 2.69-3.88 2.69-6.59z"/>
                                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7L1.04 13.3c1.48 2.94 4.52 4.7 7.96 4.7z"/>
                                <path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72L1.04 4.98C.38 6.3.01 7.82.01 9.4s.37 3.1.13 4.42l2.96-2.3c-.09-.32-.13-.6-.13-.8z"/>
                                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.47 1.03 11.43.2 9 .2 5.56.2 2.52 1.96 1.04 4.9l2.93 2.3c.71-2.12 2.69-3.7 5.03-3.7z"/>
                            </svg>
                            <span>Quick Fill with Google</span>
                        </button>
                        <div className={styles.divider}>
                            <span>or enter manually</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Full Name</label>
                        <input 
                            id="name"
                            type="text" 
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                            disabled={loading}
                        />
                    </div>
                    
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="phone">Phone Number (WhatsApp preferred)</label>
                        <input 
                            id="phone"
                            type="tel" 
                            placeholder="+62 812..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.footer}>
                        <div className={styles.priceInfo}>
                            <span>Total Due:</span>
                            <strong>{totalAmount}</strong>
                        </div>
                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                'Proceed to Payment →'
                            )}
                        </button>
                    </div>
                </form>
                
                <p className={styles.disclaimer}>
                    By proceeding, you agree to our Terms of Service. 
                    <br />
                    Secure encryption active 🔒
                </p>
            </div>
        </div>
    );
}
