import Link from 'next/link';
import { CheckCircle2, ArrowRight, Calculator } from 'lucide-react';
import styles from '../page.module.css';

const BULLETS = [
  'Set your own hourly rate',
  'Fully flexible schedule',
  'Teach 100% online',
  'We handle marketing & payments',
];

const TRUST_STATS = [
  { value: '1,200+', label: 'Tutors earning', sub: 'across SEA' },
  { value: '48 hrs', label: 'Avg. approval', sub: 'from application' },
  { value: 'Zero', label: 'Upfront fees', sub: 'ever' },
];

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <span className={styles.heroEyebrow}>
          <CheckCircle2 size={12} />
          Now accepting tutors across SEA
        </span>

        <h1 className={styles.heroTitle}>
          Turn Your Expertise Into<br />
          <span className={styles.heroAccent}>Rp 4,800,000/Month</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Teach what you know online. Set your own schedule and rate — we bring the students,
          handle payments, and take care of everything else.
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
            Apply to Teach <ArrowRight size={16} />
          </Link>
          <a href="#calculator" className={styles.ctaSecondary}>
            <Calculator size={16} />
            Calculate Your Income
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
