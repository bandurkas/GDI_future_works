"use client";

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        
        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Invalid email or password');
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <div style={{ padding: '100px 20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px', fontSize: '2rem' }}>CRM Login</h2>
            <p style={{ color: 'var(--gray3)', marginBottom: '32px', fontSize: '14px' }}>Sign in to manage cohorts and clients.</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px' }} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px' }} 
                />
                <button type="submit" style={{ 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    background: '#e43a3d', 
                    color: 'white', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: '15px',
                    marginTop: '8px'
                }}>
                    Access CRM
                </button>
                {error && <p style={{ color: '#e43a3d', marginTop: '8px', fontSize: '14px', fontWeight: 500 }}>{error}</p>}
            </form>
        </div>
    );
}
