import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import styles from '../page.module.css';

const TIERS = [
  {
    badge: 'Starter',
    name: 'Starter Tutor',
    featured: false,
    details: [
      { icon: BookOpen, text: '2 lessons per week' },
      { icon: Clock, text: '2 hours per lesson' },
      { icon: TrendingUp, text: 'Rp 150,000 / hour' },
    ],
    income: 'Rp 2,400,000',
    period: 'per month',
  },
  {
    badge: 'Most Popular',
    name: 'Active Tutor',
    featured: true,
    details: [
      { icon: BookOpen, text: '4 lessons per week' },
      { icon: Clock, text: '2 hours per lesson' },
      { icon: TrendingUp, text: 'Rp 150,000 / hour' },
    ],
    income: 'Rp 4,800,000',
    period: 'per month',
  },
  {
    badge: 'Pro',
    name: 'Pro Tutor',
    featured: false,
    details: [
      { icon: BookOpen, text: '10 lessons per week' },
      { icon: Clock, text: '2 hours per lesson' },
      { icon: TrendingUp, text: 'Rp 150,000+ / hour' },
    ],
    income: 'Rp 12,000,000+',
    period: 'per month',
  },
];

export default function EarningsSection() {
  return (
    <section className={styles.earningsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Earning Potential</span>
          <h2 className={styles.sectionTitle}>How Much Can You Earn?</h2>
          <p className={styles.sectionSubtitle}>
            Real income estimates based on tutor activity levels. You control how much you work.
          </p>
        </div>

        <div className={styles.earningsGrid}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`${styles.earningsCard} ${tier.featured ? styles.earningsCardFeatured : ''}`}
            >
              <span className={`${styles.tierBadge} ${tier.featured ? styles.tierBadgeFeatured : ''}`}>
                {tier.badge}
              </span>

              <div className={styles.tierName}>{tier.name}</div>

              <div className={styles.tierDetails}>
                {tier.details.map(({ icon: Icon, text }) => (
                  <div key={text} className={styles.tierDetail}>
                    <Icon size={14} className={styles.tierDetailIcon} />
                    {text}
                  </div>
                ))}
              </div>

              <div className={styles.tierIncome}>
                <div className={styles.tierIncomeLabel}>Monthly Income</div>
                <div className={styles.tierIncomeAmount}>{tier.income}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {tier.period}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
