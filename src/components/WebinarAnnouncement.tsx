'use client';

import { useEffect, useRef, useState } from 'react';
import { SplineScene } from '@/components/ui/splite';
import styles from './WebinarAnnouncement.module.css';

// Homepage announcement banner for the live webinar. The interactive Spline 3D
// scene is heavy (WebGL runtime), so it's only mounted once the card scrolls
// near the viewport — keeps it off the critical path for initial load.
export default function WebinarAnnouncement() {
    const ref = useRef<HTMLDivElement>(null);
    const [load3d, setLoad3d] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setLoad3d(true);
                    io.disconnect();
                }
            },
            { rootMargin: '300px 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <section className={styles.section} aria-label="Live webinar announcement">
            <div className={styles.card} ref={ref}>
                <svg
                    className={styles.spotlight}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 3787 2842"
                    fill="none"
                    aria-hidden="true"
                >
                    <g filter="url(#gdiSpot)">
                        <ellipse
                            cx="1924.71"
                            cy="273.501"
                            rx="1924.71"
                            ry="273.501"
                            transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
                            fill="#ffffff"
                            fillOpacity="0.18"
                        />
                    </g>
                    <defs>
                        <filter
                            id="gdiSpot"
                            x="0.860352"
                            y="0.838989"
                            width="3785.16"
                            height="2840.26"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                        >
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
                        </filter>
                    </defs>
                </svg>

                <div className={styles.inner}>
                    <div className={styles.content}>
                        <span className={styles.eyebrow}>
                            <span className={styles.dot} />
                            Free Live Webinar
                        </span>
                        <h2 className={styles.title}>Master AI-Assisted Coding Workflow</h2>
                        <p className={styles.sub}>
                            Learn how modern developers plan, build, debug and ship end-to-end with
                            Claude, Cursor, GPT &amp; Gemini. Live, hands-on, limited seats.
                        </p>
                        <div className={styles.meta}>
                            <span>13 Juni 2026</span>
                            <span className={styles.metaSep}>•</span>
                            <span>10:00 WIB</span>
                            <span className={styles.metaSep}>•</span>
                            <span>Live di Zoom</span>
                        </div>
                        <a href="/webinar" className={styles.cta}>
                            Reserve Free Seat →
                        </a>
                    </div>

                    <div className={styles.spline}>
                        <div className={styles.splineHolder}>
                            {load3d ? (
                                <SplineScene
                                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                                    className={styles.splineCanvas}
                                />
                            ) : (
                                <div className={styles.placeholder}>
                                    <span className={styles.spinner} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
