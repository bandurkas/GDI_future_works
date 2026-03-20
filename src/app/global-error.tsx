'use client';

import { useEffect } from 'react';

/**
 * Root-level error boundary (wraps the layout itself).
 * Must use <html> and <body> tags directly since the layout won't render.
 * Same ChunkLoadError auto-reload logic as error.tsx.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        const isChunkError =
            error?.name === 'ChunkLoadError' ||
            error?.message?.includes('ChunkLoadError') ||
            error?.message?.includes('Loading chunk') ||
            error?.message?.includes('Failed to fetch dynamically imported module');

        if (isChunkError) {
            window.location.reload();
        } else {
            console.error('[GlobalError]', error);
        }
    }, [error]);

    const isChunkError =
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('ChunkLoadError') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module');

    return (
        <html lang="en">
            <body>
                {isChunkError ? null : (
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        textAlign: 'center',
                        fontFamily: 'system-ui, sans-serif',
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            A critical error occurred. Please refresh the page.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                marginRight: '1rem',
                                padding: '0.75rem 1.5rem',
                                background: '#e63946',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.replace('/')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#f1f5f9',
                                color: '#1e293b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                )}
            </body>
        </html>
    );
}
