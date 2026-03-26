import { Wallet, Clock, Users, TrendingUp, Shield, Megaphone } from 'lucide-react';
import styles from '../page.module.css';

const BENEFITS = [
  {
    icon: Wallet,
    title: 'Earn Flexible Income',
    desc: 'Set your own hourly rate. Earn on your schedule — part-time or full-time, you decide.',
  },
  {
    icon: Clock,
    title: 'Teach on Your Terms',
    desc: 'Pick your time slots and availability. No fixed contracts, no minimum commitments.',
  },
  {
    icon: Users,
    title: 'We Bring the Students',
    desc: 'We handle all marketing and student acquisition. You focus entirely on delivering great lessons.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Reputation',
    desc: 'Build a verified tutor profile, collect student reviews, and grow your online teaching career.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    desc: 'Get paid reliably. We manage enrollment, billing, and payouts — zero admin work for you.',
  },
  {
    icon: Megaphone,
    title: 'Regional Reach',
    desc: 'Access a growing community of learners across Malaysia, Indonesia, and Singapore.',
  },
];

export default function WhyTeachSection() {
  return (
    <section className={styles.whySection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Why GDI FutureWorks</span>
          <h2 className={styles.sectionTitle}>Why Tutors Choose Us</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to teach professionally — without the admin overhead.
          </p>
        </div>

        <div className={styles.benefitsGrid}>
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className={styles.benefitCard}>
              <div className={styles.benefitIconWrap}>
                <Icon size={22} />
              </div>
              <div>
                <div className={styles.benefitTitle}>{title}</div>
                <div className={styles.benefitDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
