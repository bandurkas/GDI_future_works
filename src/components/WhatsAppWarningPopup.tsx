'use client';

export default function WhatsAppWarningPopup({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: 24,
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          Nomor tidak terdaftar di WhatsApp
        </h3>

        <p style={{ fontSize: 14, marginBottom: 18, color: '#444', lineHeight: 1.5 }}>
          Silakan gunakan nomor WhatsApp aktif agar kami bisa menghubungi Anda.
          Anda tetap dapat melanjutkan jika ini benar nomor Anda.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              border: '1px solid #ddd',
              borderRadius: 10,
              padding: '10px 14px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Ubah nomor
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 14px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Lanjutkan saja
          </button>
        </div>
      </div>
    </div>
  );
}
