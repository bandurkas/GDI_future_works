'use client';

import React from 'react';
import styles from '../page.module.css';
import { useLanguage } from '@/components/LanguageContext';

const STEP_KEYS = [
  { num: '1', titleKey: 'tutor.how.step1.title', descKey: 'tutor.how.step1.desc' },
  { num: '2', titleKey: 'tutor.how.step2.title', descKey: 'tutor.how.step2.desc' },
  { num: '3', titleKey: 'tutor.how.step3.title', descKey: 'tutor.how.step3.desc' },
];

export default function HowItWorksSection() {
  const { t } = useLanguage();

  return (
    <section className={styles.howSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t('tutor.how.label')}</span>
          <h2 className={styles.sectionTitle}>{t('tutor.how.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('tutor.how.subtitle')}</p>
          <div className={styles.howFastBadge}>{t('tutor.how.badge')}</div>
        </div>

        <div className={styles.stepsRow}>
          {STEP_KEYS.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className={styles.stepWrap}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepTitle}>{t(step.titleKey)}</div>
                <div className={styles.stepDesc}>{t(step.descKey)}</div>
              </div>
              {i < STEP_KEYS.length - 1 && (
                <div className={styles.stepConnectorLine} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
