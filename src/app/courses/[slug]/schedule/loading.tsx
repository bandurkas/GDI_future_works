export default function ScheduleLoading() {
    return (
        <div style={{ paddingTop: 'var(--nav-height)', padding: '60px 20px' }}>
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto' }}>
                    <div className="skeleton" style={{ height: '36px', width: '50%', borderRadius: '8px' }} />
                    <div className="skeleton" style={{ height: '20px', width: '70%', borderRadius: '8px' }} />
                    {[1,2,3].map(i => (
                        <div key={i} className="skeleton" style={{ height: '80px', width: '100%', borderRadius: '16px' }} />
                    ))}
                    <div className="skeleton" style={{ height: '52px', width: '100%', borderRadius: '12px', marginTop: '8px' }} />
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
