'use client';

import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
    scene: string;
    className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span
                        style={{
                            width: 28,
                            height: 28,
                            border: '3px solid rgba(255,255,255,0.25)',
                            borderTopColor: '#fff',
                            borderRadius: '50%',
                            animation: 'gdiSplineSpin 0.8s linear infinite',
                        }}
                    />
                    <style>{`@keyframes gdiSplineSpin{to{transform:rotate(360deg)}}`}</style>
                </div>
            }
        >
            <Spline scene={scene} className={className} />
        </Suspense>
    );
}
