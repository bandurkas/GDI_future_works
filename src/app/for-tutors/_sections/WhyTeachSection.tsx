'use client';

import { Wallet, Clock, Users, TrendingUp, Shield, Megaphone } from 'lucide-react';
import styles from '../page.module.css';
import { useLanguage } from '@/components/LanguageContext';

const BENEFIT_KEYS = [
  { icon: Wallet,    titleKey: 'tutor.why.b1.title', descKey: 'tutor.why.b1.desc' },
  { icon: Clock,     titleKey: 'tutor.why.b2.title', descKey: 'tutor.why.b2.desc' },
  { icon: Users,     titleKey: 'tutor.why.b3.title', descKey: 'tutor.why.b3.desc' },
  { icon: TrendingUp,titleKey: 'tutor.why.b4.title', descKey: 'tutor.why.b4.desc' },
  { icon: Shield,    titleKey: 'tutor.why.b5.title', descKey: 'tutor.why.b5.desc' },
  { icon: Megaphone, titleKey: 'tutor.why.b6.title', descKey: 'tutor.why.b6.desc' },
];

export default function WhyTeachSection() {
  const { t } = useLanguage();

  return (
    <section className={styles.whySection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t('tutor.why.label')}</span>
          <h2 className={styles.sectionTitle}>{t('tutor.why.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('tutor.why.subtitle')}</p>
        </div>

        <div className={styles.benefitsGrid}>
          {BENEFIT_KEYS.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className={styles.benefitCard}>
              <div className={styles.benefitIconWrap}>
                <Icon size={22} />
              </div>
              <div>
                <div className={styles.benefitTitle}>{t(titleKey)}</div>
                <div className={styles.benefitDesc}>{t(descKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
