export default function CartLoading() {
    return (
        <div style={{ paddingTop: 'var(--nav-height)', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '960px' }}>
                <div className="skeleton" style={{ height: '32px', width: '160px', borderRadius: '8px', marginBottom: '32px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
                    {/* Cart items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1,2].map(i => (
                            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
                        ))}
                    </div>
                    {/* Summary panel */}
                    <div className="skeleton" style={{ height: '260px', borderRadius: '20px' }} />
                </div>
            </div>
            <style>{`
                .skeleton {
                    background: linear-gradient(90deg, var(--border-light) 25%, var(--bg-secondary) 50%, var(--border-light) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
