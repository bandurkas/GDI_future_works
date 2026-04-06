export default function CourseLoading() {
    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Hero skeleton */}
            <div style={{ background: 'var(--bg-secondary)', padding: '60px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="skeleton" style={{ height: '20px', width: '120px', borderRadius: '8px' }} />
                            <div className="skeleton" style={{ height: '48px', width: '80%', borderRadius: '8px' }} />
                            <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '8px' }} />
                            <div className="skeleton" style={{ height: '80px', width: '100%', borderRadius: '8px' }} />
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {[1,2,3].map(i => (
                                    <div key={i} className="skeleton" style={{ height: '60px', width: '120px', borderRadius: '12px' }} />
                                ))}
                            </div>
                        </div>
                        <div className="skeleton" style={{ height: '380px', borderRadius: '20px' }} />
                    </div>
                </div>
            </div>
            {/* Content skeleton */}
            <div className="container" style={{ padding: '48px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1,2,3,4].map(i => (
                        <div key={i} className="skeleton" style={{ height: '20px', width: `${90 - i * 10}%`, borderRadius: '8px' }} />
                    ))}
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
