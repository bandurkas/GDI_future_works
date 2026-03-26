'use client';

import { useState, useCallback } from 'react';
import styles from '../page.module.css';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const RATE_MIN = 50_000;
const RATE_MAX = 500_000;
const RATE_STEP = 10_000;
const RATE_DEFAULT = 150_000;

const SESSIONS_MIN = 1;
const SESSIONS_MAX = 20;
const SESSIONS_DEFAULT = 2;

function pct(val: number, min: number, max: number) {
  return (((val - min) / (max - min)) * 100).toFixed(1) + '%';
}

export default function IncomeCalculator() {
  const [rate, setRate] = useState(RATE_DEFAULT);
  const [hours, setHours] = useState(2);
  const [sessions, setSessions] = useState(SESSIONS_DEFAULT);

  const weekly = rate * hours * sessions;
  const monthly = weekly * 4;
  const yearly = monthly * 12;

  const onRate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setRate(v);
    e.target.style.setProperty('--slider-fill', pct(v, RATE_MIN, RATE_MAX));
  }, []);

  const onSessions = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setSessions(v);
    e.target.style.setProperty('--slider-fill', pct(v, SESSIONS_MIN, SESSIONS_MAX));
  }, []);

  return (
    <section id="calculator" className={styles.calculatorSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Income Calculator</span>
          <h2 className={styles.sectionTitle}>Calculate Your Tutor Income</h2>
          <p className={styles.sectionSubtitle}>
            Adjust the sliders to see your estimated earnings based on your preferred schedule.
          </p>
        </div>

        <div className={styles.calculatorCard}>
          {/* ── Inputs ── */}
          <div className={styles.calcInputs}>
            {/* Hourly Rate */}
            <div className={styles.calcField}>
              <label className={styles.calcLabel}>
                Hourly Rate (IDR)
                <span className={styles.calcLabelValue}>{formatIDR(rate)}</span>
              </label>
              <input
                type="range"
                className={styles.calcSlider}
                min={RATE_MIN}
                max={RATE_MAX}
                step={RATE_STEP}
                value={rate}
                onChange={onRate}
                style={{ '--slider-fill': pct(rate, RATE_MIN, RATE_MAX) } as React.CSSProperties}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Rp 50K</span>
                <span>Rp 500K</span>
              </div>
            </div>

            {/* Hours Per Lesson */}
            <div className={styles.calcField}>
              <label className={styles.calcLabel}>
                Hours Per Lesson
                <span className={styles.calcLabelValue}>{hours} hr{hours > 1 ? 's' : ''}</span>
              </label>
              <select
                className={styles.calcSelect}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              >
                {[1, 1.5, 2, 2.5, 3, 4].map((h) => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Lessons Per Week */}
            <div className={styles.calcField}>
              <label className={styles.calcLabel}>
                Lessons Per Week
                <span className={styles.calcLabelValue}>{sessions} lesson{sessions > 1 ? 's' : ''}</span>
              </label>
              <input
                type="range"
                className={styles.calcSlider}
                min={SESSIONS_MIN}
                max={SESSIONS_MAX}
                step={1}
                value={sessions}
                onChange={onSessions}
                style={{ '--slider-fill': pct(sessions, SESSIONS_MIN, SESSIONS_MAX) } as React.CSSProperties}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>1 lesson</span>
                <span>20 lessons</span>
              </div>
            </div>
          </div>

          {/* ── Outputs ── */}
          <div className={styles.calcOutputs}>
            <div className={styles.calcOutputTitle}>Your Estimated Income</div>

            <div className={styles.calcOutputRow}>
              <span className={styles.calcOutputLabel}>Weekly</span>
              <span className={styles.calcOutputAmount}>{formatIDR(weekly)}</span>
            </div>

            <div className={`${styles.calcOutputRow} ${styles.calcOutputRowHighlight}`}>
              <span className={styles.calcOutputLabel}>Monthly</span>
              <span className={`${styles.calcOutputAmount} ${styles.calcOutputAmountHighlight}`}>
                {formatIDR(monthly)}
              </span>
            </div>

            <div className={styles.calcOutputRow}>
              <span className={styles.calcOutputLabel}>Yearly</span>
              <span className={styles.calcOutputAmount}>{formatIDR(yearly)}</span>
            </div>

            <p className={styles.calcDisclaimer}>
              * Estimates based on your input. Actual earnings depend on student demand, session completion, and platform activity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
