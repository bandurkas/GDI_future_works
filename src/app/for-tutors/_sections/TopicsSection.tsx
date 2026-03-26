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

const TOPICS = [
  { icon: Palette,        label: 'Design',            sub: 'Graphic & visual' },
  { icon: Sparkles,       label: 'AI Tools',          sub: 'Prompting & automation' },
  { icon: Layers,         label: 'Canva',             sub: 'Templates & content' },
  { icon: Code2,          label: 'Programming',       sub: 'Web & app dev' },
  { icon: Megaphone,      label: 'Digital Marketing', sub: 'SEO, ads & growth' },
  { icon: Languages,      label: 'English',           sub: 'Business & communication' },
  { icon: LayoutTemplate, label: 'UI / UX',           sub: 'Figma & prototyping' },
  { icon: Briefcase,      label: 'Business',          sub: 'Strategy & ops' },
  { icon: Table2,         label: 'Excel',             sub: 'Data & spreadsheets' },
  { icon: BarChart2,      label: 'Data Analysis',     sub: 'Insights & reporting' },
  { icon: BrainCircuit,   label: 'Soft Skills',       sub: 'Leadership & comms' },
];

export default function TopicsSection() {
  return (
    <section className={styles.topicsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Topics</span>
          <h2 className={styles.sectionTitle}>Teach What You Know</h2>
          <p className={styles.sectionSubtitle}>
            We welcome tutors from a wide range of practical, career-focused disciplines.
          </p>
        </div>

        <div className={styles.topicsGrid}>
          {TOPICS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className={styles.topicCard}>
              <div className={styles.topicCardIcon}>
                <Icon size={20} />
              </div>
              <div className={styles.topicCardLabel}>{label}</div>
              <div className={styles.topicCardSub}>{sub}</div>
            </div>
          ))}
        </div>

        <p className={styles.topicsFootnote}>
          Don&apos;t see your topic? <strong>Apply anyway</strong> — we&apos;re expanding our categories every month.
        </p>
      </div>
    </section>
  );
}
