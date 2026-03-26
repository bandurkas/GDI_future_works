import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '../page.module.css';

const REASSURANCES = [
  'No upfront fees',
  'No lock-in contracts',
  'First payout within 30 days',
];

export default function FinalCtaSection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaSocialProofBadge}>1,200+ tutors already earning</div>
        <h2 className={styles.ctaSectionTitle}>Start Teaching This Week</h2>
        <p className={styles.ctaSectionSub}>
          Apply in minutes. Get approved in 48 hours. Start earning on your own schedule.
        </p>
        <Link href="/for-tutors/apply" className={styles.ctaWhiteBtn}>
          Apply to Teach Now <ArrowRight size={18} />
        </Link>
        <div className={styles.ctaReassurances}>
          {REASSURANCES.map((r) => (
            <span key={r} className={styles.ctaReassuranceItem}>
              <CheckCircle2 size={14} />
              {r}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
