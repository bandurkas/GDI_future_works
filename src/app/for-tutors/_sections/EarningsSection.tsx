'use client';

import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import styles from '../page.module.css';
import { useLanguage } from '@/components/LanguageContext';
import { useCurrency } from '@/components/CurrencyContext';

const TIERS_IDR = [
  {
    badgeKey: 'tutor.earn.tier1.badge',
    nameKey:  'tutor.earn.tier1.name',
    featured: false,
    lessons: 2, hours: 2, rateLabel: 'Rp 150,000 / jam',
    income: 'Rp 2,400,000',
  },
  {
    badgeKey: 'tutor.earn.tier2.badge',
    nameKey:  'tutor.earn.tier2.name',
    featured: true,
    lessons: 4, hours: 2, rateLabel: 'Rp 150,000 / jam',
    income: 'Rp 4,800,000',
  },
  {
    badgeKey: 'tutor.earn.tier3.badge',
    nameKey:  'tutor.earn.tier3.name',
    featured: false,
    lessons: 10, hours: 2, rateLabel: 'Rp 150,000+ / jam',
    income: 'Rp 12,000,000+',
  },
];

const TIERS_MYR = [
  {
    badgeKey: 'tutor.earn.tier1.badge',
    nameKey:  'tutor.earn.tier1.name',
    featured: false,
    lessons: 2, hours: 2, rateLabel: 'RM 45 / hr',
    income: 'RM 700',
  },
  {
    badgeKey: 'tutor.earn.tier2.badge',
    nameKey:  'tutor.earn.tier2.name',
    featured: true,
    lessons: 4, hours: 2, rateLabel: 'RM 45 / hr',
    income: 'RM 1,400',
  },
  {
    badgeKey: 'tutor.earn.tier3.badge',
    nameKey:  'tutor.earn.tier3.name',
    featured: false,
    lessons: 10, hours: 2, rateLabel: 'RM 45+ / hr',
    income: 'RM 3,500+',
  },
];

export default function EarningsSection() {
  const { t } = useLanguage();
  const { currency } = useCurrency();

  const TIERS = currency === 'MYR' ? TIERS_MYR : TIERS_IDR;
  const permonth = t('tutor.earn.permonth');
  const monthlyLabel = t('tutor.earn.monthly');

  return (
    <section className={styles.earningsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t('tutor.earn.label')}</span>
          <h2 className={styles.sectionTitle}>{t('tutor.earn.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('tutor.earn.subtitle')}</p>
        </div>

        <div className={styles.earningsGrid}>
          {TIERS.map((tier) => (
            <div
              key={tier.nameKey}
              className={`${styles.earningsCard} ${tier.featured ? styles.earningsCardFeatured : ''}`}
            >
              <span className={`${styles.tierBadge} ${tier.featured ? styles.tierBadgeFeatured : ''}`}>
                {t(tier.badgeKey)}
              </span>

              <div className={styles.tierName}>{t(tier.nameKey)}</div>

              <div className={styles.tierDetails}>
                <div className={styles.tierDetail}>
                  <BookOpen size={14} className={styles.tierDetailIcon} />
                  {tier.lessons} {currency === 'MYR' ? 'lessons/week' : 'pelajaran/minggu'}
                </div>
                <div className={styles.tierDetail}>
                  <Clock size={14} className={styles.tierDetailIcon} />
                  {tier.hours} {currency === 'MYR' ? 'hrs/lesson' : 'jam/sesi'}
                </div>
                <div className={styles.tierDetail}>
                  <TrendingUp size={14} className={styles.tierDetailIcon} />
                  {tier.rateLabel}
                </div>
              </div>

              <div className={styles.tierIncome}>
                <div className={styles.tierIncomeLabel}>{monthlyLabel}</div>
                <div className={styles.tierIncomeAmount}>{tier.income}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {permonth}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
