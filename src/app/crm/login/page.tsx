'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function CrmLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Primary login: credentials via NextAuth
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        setError('Неверный email или пароль. Попробуйте ещё раз.');
        setLoading(false);
      } else {
        // Successful — hard navigate to CRM dashboard
        window.location.replace('/students');
      }
    } catch {
      setError('Произошла ошибка. Обновите страницу и попробуйте снова.');
      setLoading(false);
    }
  }

  // Secondary: Google OAuth — routes through main domain to avoid
  // OAuth redirect URI whitelist issues on subdomains
  function handleGoogleLogin() {
    setGoogleLoading(true);
    const callbackUrl = encodeURIComponent('https://crm.gdifuture.works/students');
    window.location.href = `https://gdifuture.works/api/auth/signin/google?callbackUrl=${callbackUrl}`;
  }

  const isAnyLoading = loading || googleLoading;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', 'Inter', -apple-system, sans-serif",
      padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .crm-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.08);
          padding: 44px 40px 40px;
          width: 100%;
          max-width: 420px;
        }
        .crm-input-wrap { position: relative; }
        .crm-input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 16px;
          font-size: 14px;
          font-family: inherit;
          border: 1.5px solid #e4e4e7;
          border-radius: 12px;
          background: #ffffff;
          color: #09090b;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          -webkit-appearance: none;
        }
        .crm-input::placeholder { color: #a1a1aa; }
        .crm-input:focus {
          border-color: #e43a3d;
          box-shadow: 0 0 0 3px rgba(228, 58, 61, 0.1);
        }
        .crm-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #a1a1aa;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .toggle-pw:hover { color: #71717a; }

        .btn-signin {
          width: 100%;
          padding: 14px 20px;
          background: #e43a3d;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(228, 58, 61, 0.3);
          letter-spacing: -0.01em;
        }
        .btn-signin:hover:not(:disabled) {
          background: #c9292c;
          box-shadow: 0 4px 16px rgba(228, 58, 61, 0.35);
          transform: translateY(-1px);
        }
        .btn-signin:active:not(:disabled) { transform: translateY(0); }
        .btn-signin:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: #d4d4d8;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e4e4e7;
        }

        .btn-google {
          width: 100%;
          padding: 13px 20px;
          background: white;
          color: #09090b;
          border: 1.5px solid #e4e4e7;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: -0.01em;
        }
        .btn-google:hover:not(:disabled) {
          background: #fafafa;
          border-color: #d4d4d8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .btn-google:active:not(:disabled) { transform: translateY(0); }
        .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          color: #dc2626;
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 480px) {
          .crm-card { padding: 32px 24px 28px; border-radius: 16px; }
        }
      `}</style>

      <div className="crm-card">
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #e43a3d 0%, #c9292c 100%)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(228,58,61,0.25)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em' }}>
            Sign in to CRM
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#71717a', fontWeight: 400 }}>
            GDI FutureWorks · Administrative Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#09090b', marginBottom: '7px' }}>
              Email <span style={{ color: '#e43a3d' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="bandurkas@gmail.com"
              required
              disabled={isAnyLoading}
              autoComplete="email"
              className="crm-input"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                Password <span style={{ color: '#e43a3d' }}>*</span>
              </label>
              <span style={{ fontSize: '12px', color: '#a1a1aa', cursor: 'default' }}>
                Forgot password?
              </span>
            </div>
            <div className="crm-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isAnyLoading}
                autoComplete="current-password"
                className="crm-input"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isAnyLoading} className="btn-signin">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">or</div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isAnyLoading}
          className="btn-google"
        >
          {googleLoading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.05 13.56c-.806.54-1.836.86-3.05.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.709a5.41 5.41 0 010-3.418V4.959H.957a8.997 8.997 0 000 8.082l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.117.957 5.148L3.964 7.48C4.672 5.353 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '11px', color: '#d4d4d8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          V3.0 Enterprise · Secure Access
        </p>
      </div>
    </div>
  );
}
