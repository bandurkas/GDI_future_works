import React from 'react';
import styles from '../page.module.css';

const STEPS = [
  {
    num: '1',
    title: 'Create Your Profile',
    desc: 'Fill out your tutor application with your expertise, availability, and teaching style.',
  },
  {
    num: '2',
    title: 'Set Price & Schedule',
    desc: 'Choose your hourly rate and weekly availability. We match you with the right students.',
  },
  {
    num: '3',
    title: 'Start Teaching',
    desc: 'Deliver live online sessions and get paid automatically. We handle everything else.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className={styles.howSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Process</span>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Three simple steps to start earning. Most tutors are approved and teaching within 48 hours.
          </p>
          <div className={styles.howFastBadge}>⚡ Average approval: 48 hours</div>
        </div>

        <div className={styles.stepsRow}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className={styles.stepWrap}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={styles.stepConnectorLine} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
