'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CourseCarousel.module.css';

interface Props {
    children: React.ReactNode;
}

export default function CourseCarousel({ children }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateButtons = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateButtons();
        el.addEventListener('scroll', updateButtons, { passive: true });
        const ro = new ResizeObserver(updateButtons);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', updateButtons);
            ro.disconnect();
        };
    }, [updateButtons]);

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const card = el.querySelector(':scope > *') as HTMLElement | null;
        const step = card ? card.offsetWidth + 24 : 320;
        el.scrollBy({ left: dir === 'right' ? step : -step, behavior: 'smooth' });
    };

    return (
        <div className={styles.wrap}>
            <button
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={() => scroll('left')}
                aria-label="Previous courses"
                disabled={!canScrollLeft}
                tabIndex={canScrollLeft ? 0 : -1}
            >
                <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            <div className={styles.carousel} ref={scrollRef}>
                {children}
            </div>

            <button
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={() => scroll('right')}
                aria-label="Next courses"
                disabled={!canScrollRight}
                tabIndex={canScrollRight ? 0 : -1}
            >
                <ChevronRight size={22} strokeWidth={2.5} />
            </button>
        </div>
    );
}
