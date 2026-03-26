'use client';

import {
  Palette,
  Sparkles,
  Layers,
  Code2,
  Megaphone,
  Languages,
  LayoutTemplate,
  Briefcase,
  Table2,
  BarChart2,
  BrainCircuit,
} from 'lucide-react';
import styles from '../page.module.css';
import { useLanguage } from '@/components/LanguageContext';

const TOPIC_KEYS = [
  { icon: Palette,        labelKey: 'tutor.topic.design.label',    subKey: 'tutor.topic.design.sub' },
  { icon: Sparkles,       labelKey: 'tutor.topic.ai.label',        subKey: 'tutor.topic.ai.sub' },
  { icon: Layers,         labelKey: 'tutor.topic.canva.label',     subKey: 'tutor.topic.canva.sub' },
  { icon: Code2,          labelKey: 'tutor.topic.code.label',      subKey: 'tutor.topic.code.sub' },
  { icon: Megaphone,      labelKey: 'tutor.topic.marketing.label', subKey: 'tutor.topic.marketing.sub' },
  { icon: Languages,      labelKey: 'tutor.topic.english.label',   subKey: 'tutor.topic.english.sub' },
  { icon: LayoutTemplate, labelKey: 'tutor.topic.uiux.label',      subKey: 'tutor.topic.uiux.sub' },
  { icon: Briefcase,      labelKey: 'tutor.topic.business.label',  subKey: 'tutor.topic.business.sub' },
  { icon: Table2,         labelKey: 'tutor.topic.excel.label',     subKey: 'tutor.topic.excel.sub' },
  { icon: BarChart2,      labelKey: 'tutor.topic.data.label',      subKey: 'tutor.topic.data.sub' },
  { icon: BrainCircuit,   labelKey: 'tutor.topic.soft.label',      subKey: 'tutor.topic.soft.sub' },
];

export default function TopicsSection() {
  const { t } = useLanguage();

  return (
    <section className={styles.topicsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t('tutor.topics.label')}</span>
          <h2 className={styles.sectionTitle}>{t('tutor.topics.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('tutor.topics.subtitle')}</p>
        </div>

        <div className={styles.topicsGrid}>
          {TOPIC_KEYS.map(({ icon: Icon, labelKey, subKey }) => (
            <div key={labelKey} className={styles.topicCard}>
              <div className={styles.topicCardIcon}>
                <Icon size={20} />
              </div>
              <div className={styles.topicCardLabel}>{t(labelKey)}</div>
              <div className={styles.topicCardSub}>{t(subKey)}</div>
            </div>
          ))}
        </div>

        <p className={styles.topicsFootnote}>{t('tutor.topics.footnote')}</p>
      </div>
    </section>
  );
}
