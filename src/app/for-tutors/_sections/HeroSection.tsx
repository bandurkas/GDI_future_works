'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Calculator } from 'lucide-react';
import styles from '../page.module.css';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const { currency } = useCurrency();

  const accentAmount = currency === 'MYR' ? 'RM 1,400' : 'Rp 4,800,000';
  const accentLabel = `${accentAmount}/${t('tutor.hero.month')}`;

  const BULLETS = [
    t('tutor.hero.bullet1'),
    t('tutor.hero.bullet2'),
    t('tutor.hero.bullet3'),
    t('tutor.hero.bullet4'),
  ];

  const TRUST_STATS = [
    { value: '1,200+', label: t('tutor.trust.stat1.label'), sub: t('tutor.trust.stat1.sub') },
    { value: '48 hrs', label: t('tutor.trust.stat2.label'), sub: t('tutor.trust.stat2.sub') },
    { value: t('tutor.trust.stat3.value'), label: t('tutor.trust.stat3.label'), sub: t('tutor.trust.stat3.sub') },
  ];

  return (
    <section className={styles.hero}>
      <div className="container">
        <span className={styles.heroEyebrow}>
          <CheckCircle2 size={12} />
          {t('tutor.hero.eyebrow')}
        </span>

        <h1 className={styles.heroTitle}>
          {t('tutor.hero.title1')}<br />
          <span className={styles.heroAccent}>{accentLabel}</span>
        </h1>

        <p className={styles.heroSubtitle}>
          {t('tutor.hero.subtitle')}
        </p>

        <ul className={styles.heroBullets}>
          {BULLETS.map((b) => (
            <li key={b} className={styles.heroBulletItem}>
              <CheckCircle2 size={15} className={styles.heroBulletIcon} />
              {b}
            </li>
          ))}
        </ul>

        <div className={styles.heroCtas}>
          <Link href="/for-tutors/apply" className={styles.ctaPrimary}>
            {t('tutor.hero.cta1')} <ArrowRight size={16} />
          </Link>
          <a href="#calculator" className={styles.ctaSecondary}>
            <Calculator size={16} />
            {t('tutor.hero.cta2')}
          </a>
        </div>

        <div className={styles.heroTrustBar}>
          {TRUST_STATS.map((stat, i) => (
            <div key={stat.label} className={styles.heroTrustBarInner}>
              <div className={styles.heroTrustStat}>
                <span className={styles.heroTrustValue}>{stat.value}</span>
                <span className={styles.heroTrustLabel}>{stat.label}</span>
                <span className={styles.heroTrustSub}>{stat.sub}</span>
              </div>
              {i < TRUST_STATS.length - 1 && (
                <div className={styles.heroTrustDivider} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
