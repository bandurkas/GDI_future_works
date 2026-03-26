'use client';

import { useEffect } from 'react';

/**
 * Next.js App Router error boundary.
 * Catches ChunkLoadError (stale JS chunks after a new deploy) and
 * forces a hard reload so the browser fetches the latest chunks.
 * Also handles any other unexpected client-side errors gracefully.
 */
export default function Error({
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
            // Hard reload fetches the latest JS assets from the new deploy
            window.location.reload();
        } else {
            console.error('[AppError]', error);
        }
    }, [error]);

    const isChunkError =
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('ChunkLoadError') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module');

    if (isChunkError) {
        // Show nothing while auto-reloading
        return null;
    }

    return (
        <div style={{
            minHeight: '60vh',
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
                An unexpected error occurred. Please try again.
            </p>
            <button
                onClick={reset}
                style={{
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
        </div>
    );
}
