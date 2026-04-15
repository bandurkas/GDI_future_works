'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function WhatsAppWarningPopup({
  onClose,
  onFix,
  onContinue,
}: {
  onClose: () => void;
  onFix?: () => void;
  onContinue?: () => void;
}) {
  const handleFix = onFix ?? onClose;
  const handleContinue = onContinue ?? onClose;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483647,
        padding: 16,
        pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: 24,
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, margin: '0 0 12px' }}>
          Nomor tidak terdeteksi di WhatsApp
        </h3>

        <p style={{ fontSize: 14, marginBottom: 18, color: '#444', lineHeight: 1.6 }}>
          Tim kami biasanya menghubungi Anda melalui WhatsApp untuk membantu memilih kursus dan menjawab pertanyaan Anda.
          <br /><br />
          Jika nomor ini tidak aktif di WhatsApp, kami mungkin tidak bisa menghubungi Anda.
          <br /><br />
          Gunakan nomor WhatsApp aktif agar Anda tidak melewatkan informasi penting.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            autoFocus
            onClick={handleFix}
            style={{
              flex: 1,
              border: '1px solid #111',
              borderRadius: 10,
              padding: '10px 14px',
              background: '#fff',
              color: '#111',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Perbaiki nomor
          </button>

          <button
            type="button"
            onClick={handleContinue}
            style={{
              flex: 1,
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 14px',
              cursor: 'pointer',
              fontSize: 14,
              opacity: 0.8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          >
            Lanjutkan tanpa WhatsApp
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#888', marginTop: 14, textAlign: 'center', marginBottom: 0 }}>
          ⚡ Biasanya kami merespon dalam beberapa menit di WhatsApp
        </p>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
