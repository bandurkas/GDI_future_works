'use client';

import { useEffect, useRef, useState } from 'react';
import s from './WebinarHeatCard.module.css';

type Props = {
  /** Total registrations for the upcoming webinar. */
  count: number;
  /** Registrations created today (momentum). */
  today?: number;
  /** Human label, e.g. "13 Juni 2026". */
  dateLabel: string;
  /** Time label, e.g. "10:00 WIB". */
  timeLabel?: string;
  /** Webinar start as ISO string — drives the live countdown. */
  dateIso: string;
};

/** Ease-out count-up: 0 → target on mount. Honors reduced-motion. */
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target <= 0) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}

/** Whole days from now until the webinar; null until mounted (avoids SSR drift). */
function useDaysLeft(dateIso: string): number | null {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(dateIso).getTime();
    const compute = () => {
      const diff = target - Date.now();
      setDays(Math.max(0, Math.ceil(diff / 86_400_000)));
    };
    compute();
    const id = setInterval(compute, 60_000); // keep fresh across midnight
    return () => clearInterval(id);
  }, [dateIso]);
  return days;
}

export default function WebinarHeatCard({ count, today = 0, dateLabel, timeLabel, dateIso }: Props) {
  const animated = useCountUp(count);
  const daysLeft = useDaysLeft(dateIso);

  return (
    <div className={s.card} role="status" aria-label={`${count} pendaftar webinar ${dateLabel}`}>
      <div className={s.flameWrap}>
        <span className={s.flameGlow} aria-hidden />
        <span className={s.flame} aria-hidden>🔥</span>
      </div>

      <div className={s.body}>
        <div className={s.countRow}>
          <span className={s.count}>{animated.toLocaleString('id-ID')}</span>
          <span className={s.unit}>pendaftar</span>
        </div>
        <div className={s.meta}>
          Webinar <span className={s.metaStrong}>{dateLabel}</span>
          {timeLabel ? ` · ${timeLabel}` : ''}
        </div>
      </div>

      <div className={s.rail}>
        {today > 0 && (
          <span className={s.todayPill} title={`${today} pendaftar baru hari ini`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {today} hari ini
          </span>
        )}

        {daysLeft !== null && (
          <span className={s.countdown}>
            {daysLeft <= 0 ? (
              <span className={s.countdownLive}>Hari ini!</span>
            ) : (
              <>
                <span className={s.countdownNum}>{daysLeft}</span> hari lagi
              </>
            )}
          </span>
        )}

        <span className={s.liveDot} aria-hidden />
      </div>
    </div>
  );
}
