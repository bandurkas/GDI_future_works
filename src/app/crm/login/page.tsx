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
      minHeight: '100vh',
      background: '#0d0d0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        .crm-login-input { transition: border-color 0.15s, box-shadow 0.15s; }
        .crm-login-input:focus { border-color: #e43a3d !important; outline: none !important; box-shadow: 0 0 0 3px rgba(228,58,61,0.12) !important; }
        .crm-login-btn:hover:not(:disabled) { background: #cc2e31 !important; }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse at center, rgba(228,58,61,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '400px',
        padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '48px', height: '48px', background: '#e43a3d',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 18px',
          }}>
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>G</span>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: 'white', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
            GDI CRM
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Sign in to manage students & tutors
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '28px',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="crm-login-input"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '9px', fontSize: '14px',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                placeholder="admin@gdifuture.works"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="crm-login-input"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '9px', fontSize: '14px',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(228,58,61,0.1)', border: '1px solid rgba(228,58,61,0.2)',
                fontSize: '12px', color: '#f87171', textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="crm-login-btn"
              style={{
                width: '100%', padding: '12px',
                background: loading ? 'rgba(255,255,255,0.1)' : '#e43a3d',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.15s',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>
          GDI FutureWorks · V3.0 Enterprise
        </p>
      </div>
    </div>
  );
}
