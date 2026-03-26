'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '../page.module.css';
import { useLanguage } from '@/components/LanguageContext';

export default function FinalCtaSection() {
  const { t } = useLanguage();

  const REASSURANCE_KEYS = ['tutor.cta.r1', 'tutor.cta.r2', 'tutor.cta.r3'];

  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaSocialProofBadge}>{t('tutor.cta.proof')}</div>
        <h2 className={styles.ctaSectionTitle}>{t('tutor.cta.title')}</h2>
        <p className={styles.ctaSectionSub}>{t('tutor.cta.sub')}</p>
        <Link href="/for-tutors/apply" className={styles.ctaWhiteBtn}>
          {t('tutor.cta.btn')} <ArrowRight size={18} />
        </Link>
        <div className={styles.ctaReassurances}>
          {REASSURANCE_KEYS.map((key) => (
            <span key={key} className={styles.ctaReassuranceItem}>
              <CheckCircle2 size={14} />
              {t(key)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
