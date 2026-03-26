'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin');
      return;
    }
    // If user is already logged in via student session, auto-trigger Google OAuth
    if (status === 'unauthenticated') {
      const hasStudentSession = document.cookie.includes('gdi_session');
      if (hasStudentSession) {
        setLoading(true);
        signIn('google', { callbackUrl: '/admin' });
      }
    }
  }, [status, router]);

  async function handleGoogle() {
    setLoading(true);
    await signIn('google', { callbackUrl: '/admin' });
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f6fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '52px 44px',
        textAlign: 'center', maxWidth: '400px', width: '100%',
        border: '1px solid #eee', boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
      }}>
        <div style={{ width: '56px', height: '56px', background: '#111', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#111' }}>Admin Login</h1>
        <p style={{ color: '#999', fontSize: '14px', marginBottom: '36px', lineHeight: 1.5 }}>
          Sign in with your authorised Google account to access the control panel.
        </p>
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', background: loading ? '#555' : '#111',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'background 0.2s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>
        <p style={{ marginTop: '24px', fontSize: '12px', color: '#ccc' }}>
          Only authorised accounts can access this panel.
        </p>
      </div>
    </div>
  );
}
