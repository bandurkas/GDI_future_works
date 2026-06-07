'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import styles from './HandWrittenTitle.module.css';

const DRAW_EASE: [number, number, number, number] = [0.43, 0.13, 0.23, 0.96];

interface HandWrittenTitleProps {
    title?: string;
    subtitle?: string;
}

/**
 * Animated "drawn by pencil" headline: a hand-drawn stroke encircles the
 * title (framer-motion pathLength draw) while the text fades in. CSS-module
 * adaptation of the shadcn/KokonutUI component — this site is CSS Modules,
 * not Tailwind utilities. Brand stroke (--red) inherits from the webinar .page.
 * Honors prefers-reduced-motion (renders the final state instantly).
 */
export function HandWrittenTitle({ title = 'Hand Written', subtitle }: HandWrittenTitleProps) {
    const reduce = useReducedMotion();

    const draw: Variants = {
        hidden: { pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: reduce
                ? { duration: 0 }
                : {
                      pathLength: { duration: 2.5, ease: DRAW_EASE },
                      opacity: { duration: 0.5 },
                  },
        },
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.svgLayer} aria-hidden="true">
                <motion.svg
                    className={styles.svg}
                    viewBox="0 0 1200 600"
                    preserveAspectRatio="none"
                    initial="hidden"
                    animate="visible"
                >
                    <motion.path
                        d="M 600 60
                           C 912 60, 1170 168, 1170 300
                           C 1170 432, 912 540, 600 540
                           C 288 540, 30 432, 30 300
                           C 30 168, 288 60, 600 60
                           C 772 60, 900 88, 968 124"
                        fill="none"
                        strokeWidth={4}
                        stroke="var(--red, #D42B2B)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        variants={draw}
                    />
                </motion.svg>
            </div>

            <div className={styles.content}>
                <motion.h1
                    className={styles.title}
                    initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0 } : { delay: 0.5, duration: 0.8 }}
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: reduce ? 1 : 0 }}
                        animate={{ opacity: 1 }}
                        transition={reduce ? { duration: 0 } : { delay: 1, duration: 0.8 }}
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
        </div>
    );
}

export default HandWrittenTitle;
