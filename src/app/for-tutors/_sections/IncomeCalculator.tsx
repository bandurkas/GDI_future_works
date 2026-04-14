'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from '../page.module.css';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatMYR = (n: number) =>
  new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(n);

const formatUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const getUsdEquivalent = (localAmount: number, isMYR: boolean) => {
  return formatUSD(localAmount / (isMYR ? 4.5 : 16000));
};

const RATE_IDR_MIN = 50_000;
const RATE_IDR_MAX = 500_000;
const RATE_IDR_STEP = 10_000;
const RATE_IDR_DEFAULT = 150_000;

const RATE_MYR_MIN = 15;
const RATE_MYR_MAX = 150;
const RATE_MYR_STEP = 5;
const RATE_MYR_DEFAULT = 45;

const SESSIONS_MIN = 1;
const SESSIONS_MAX = 20;
const SESSIONS_DEFAULT = 2;

function pct(val: number, min: number, max: number) {
  return (((val - min) / (max - min)) * 100).toFixed(1) + '%';
}

export default function IncomeCalculator() {
  const { t, language } = useLanguage();

  const isMYR = language !== 'id';
  const rateMin = isMYR ? RATE_MYR_MIN : RATE_IDR_MIN;
  const rateMax = isMYR ? RATE_MYR_MAX : RATE_IDR_MAX;
  const rateStep = isMYR ? RATE_MYR_STEP : RATE_IDR_STEP;
  const rateDefault = isMYR ? RATE_MYR_DEFAULT : RATE_IDR_DEFAULT;
  const formatCurrency = isMYR ? formatMYR : formatIDR;
  const rateMinLabel = isMYR ? 'RM 15' : 'Rp 50K';
  const rateMaxLabel = isMYR ? 'RM 150' : 'Rp 500K';

  const [rate, setRate] = useState(rateDefault);
  const [hours, setHours] = useState(2);
  const [sessions, setSessions] = useState(SESSIONS_DEFAULT);

  // Reset rate to default when currency switches
  useEffect(() => {
    setRate(isMYR ? RATE_MYR_DEFAULT : RATE_IDR_DEFAULT);
  }, [isMYR]);

  const effectiveRate = rate;

  const weekly = effectiveRate * hours * sessions;
  const monthly = weekly * 4;
  const yearly = monthly * 12;

  const onRate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setRate(v);
    e.target.style.setProperty('--slider-fill', pct(v, rateMin, rateMax));
  }, [rateMin, rateMax]);

  const onSessions = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setSessions(v);
    e.target.style.setProperty('--slider-fill', pct(v, SESSIONS_MIN, SESSIONS_MAX));
  }, []);

  return (
    <section id="calculator" className={styles.calculatorSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t('tutor.calc.label')}</span>
          <h2 className={styles.sectionTitle}>{t('tutor.calc.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('tutor.calc.subtitle')}</p>
        </div>

        <div className={styles.calculatorCard}>
          {/* ── Inputs ── */}
          <div className={styles.calcInputs}>
            {/* Hourly Rate */}
            <div className={styles.calcField}>
              <label className={styles.calcLabel}>
                {isMYR ? t('tutor.calc.rate.myr') : t('tutor.calc.rate.idr')}
                <span className={styles.calcLabelValue}>{formatCurrency(effectiveRate)}</span>
              </label>
              <input
                type="range"
                className={styles.calcSlider}
                min={rateMin}
                max={rateMax}
                step={rateStep}
                value={effectiveRate}
                onChange={onRate}
                style={{ '--slider-fill': pct(effectiveRate, rateMin, rateMax) } as React.CSSProperties}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{rateMinLabel}</span>
                <span>{rateMaxLabel}</span>
              </div>
            </div>

            {/* Hours Per Lesson */}
            <div className={styles.calcField}>
              <label className={styles.calcLabel}>
                {t('tutor.calc.hourslesson')}
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
                {t('tutor.calc.lessonsweek')}
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
            <div className={styles.calcOutputTitle}>{t('tutor.calc.output.title')}</div>

            <div className={styles.calcOutputRow}>
              <span className={styles.calcOutputLabel}>{t('tutor.calc.weekly')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className={styles.calcOutputAmount}>{formatCurrency(weekly)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(~{getUsdEquivalent(weekly, isMYR)} USD)</span>
              </div>
            </div>

            <div className={`${styles.calcOutputRow} ${styles.calcOutputRowHighlight}`}>
              <span className={styles.calcOutputLabel}>{t('tutor.calc.monthly')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className={`${styles.calcOutputAmount} ${styles.calcOutputAmountHighlight}`}>
                  {formatCurrency(monthly)}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>(~{getUsdEquivalent(monthly, isMYR)} USD)</span>
              </div>
            </div>

            <div className={styles.calcOutputRow}>
              <span className={styles.calcOutputLabel}>{t('tutor.calc.yearly')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className={styles.calcOutputAmount}>{formatCurrency(yearly)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(~{getUsdEquivalent(yearly, isMYR)} USD)</span>
              </div>
            </div>

            <p className={styles.calcDisclaimer}>{t('tutor.calc.disclaimer')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
