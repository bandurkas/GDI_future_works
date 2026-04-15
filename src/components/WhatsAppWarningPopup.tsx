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
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
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
            autoFocus
            onClick={onClose}
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
              opacity: 0.8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          >
            Lanjutkan tanpa WhatsApp
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#888', marginTop: 14, textAlign: 'center' }}>
          ⚡ Biasanya kami merespon dalam beberapa menit di WhatsApp
        </p>
      </div>
    </div>
  );
}
