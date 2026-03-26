'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CrmLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/crm/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.replace('/crm/students');
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f6fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '48px 44px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
        border: '1px solid #eee',
      }}>
        <div style={{
          width: '52px', height: '52px', background: '#e43a3d',
          borderRadius: '14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '6px', color: '#111' }}>
          GDI CRM
        </h1>
        <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
          Sign in to manage students & tutors
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%', padding: '11px 14px', border: '1px solid #ddd',
                borderRadius: '10px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="bandurkas@gmail.com"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '11px 14px', border: '1px solid #ddd',
                borderRadius: '10px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p style={{ color: '#e43a3d', fontSize: '13px', marginBottom: '14px', textAlign: 'center' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', background: loading ? '#999' : '#111',
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
