'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import styles from './LearningHub.module.css';

interface Props {
  firstName: string;
  isAdmin?: boolean;
}

const CATEGORIES = [
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    description: 'Master Excel, SQL, and Python to make data-driven decisions.',
    iconBg: '#E8F0FE',
    iconColor: '#1A56C4',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
    ),
  },
  {
    id: 'programming',
    title: 'Programming',
    description: 'Learn modern web development and software engineering.',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Build intelligent systems and learn prompt engineering.',
    iconBg: '#FFF3E0',
    iconColor: '#E65100',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 'digital-skills',
    title: 'Digital Skills',
    description: 'Enhance your career with digital marketing and design.',
    iconBg: '#F3E5F5',
    iconColor: '#6A1B9A',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  }
];

export default function LearningHubOnboarding({ firstName, isAdmin }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { trackLead } = useMetaPixel();

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const hasSelection = selectedIds.size > 0;

  const handleContinue = () => {
    if (hasSelection) {
      router.push('/schedule');
    }
  };

  return (
    <div className={styles.container}>
      {/* Progress Step Indicator */}
      <div className={styles.progressContainer} role="progressbar" aria-valuenow={33} aria-valuemin={0} aria-valuemax={100} aria-valuetext="Step 1 of 3: Choose your interest">
        <div className={styles.progressLabel}>
          <span className={styles.progressStep}>Step 1 of 3</span>
          <span className={styles.progressDesc}>— Choose your interest</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill}></div>
        </div>
      </div>

      {/* Admin Panel Button */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px',
              background: '#1a1a1a', color: 'white',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              letterSpacing: '0.3px',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Admin Panel
          </Link>
        </div>
      )}

      {/* Personalized Welcome Header */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          Welcome, {firstName} <span className={styles.wave}>👋</span>
        </h1>
        <h2 className={styles.headerSubtitle}>
          Let&apos;s personalize your learning journey.
        </h2>
      </div>

      {/* Course Categories Grid */}
      <div className={styles.grid} role="group" aria-label="Course Categories">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedIds.has(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleSelection(cat.id)}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className={styles.cardCheck}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}

              <div 
                className={styles.iconBox}
                style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}
              >
                {cat.icon}
              </div>
              
              <h3 className={styles.cardTitle}>{cat.title}</h3>
              <p className={styles.cardDesc}>{cat.description}</p>
            </button>
          );
        })}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionContainer}>
            <div className={styles.ctaWrapper}>
                <button
                    onClick={handleContinue}
                    disabled={!hasSelection}
                    className={`${styles.btnPrimary} ${hasSelection ? styles.btnActive : styles.btnDisabled}`}
                    aria-disabled={!hasSelection}
                >
                    {hasSelection ? 'See My Courses' : 'Continue'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={styles.ctaIcon}>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>
            
            <Link href="/courses" className={styles.skipLink}>
                Skip for now &rarr;
            </Link>
        </div>
      </div>

      {/* WhatsApp Floating Action Button */}
      <a
        href="https://wa.me/628211704707"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.fab}
        aria-label="Chat with a Learning Advisor on WhatsApp"
        onClick={() => trackLead('dashboard_onboarding_wa')}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className={styles.fabTooltip}>
          Talk to a Learning Advisor
          <span className={styles.fabTooltipSub}>Mon–Fri 9AM–6PM</span>
        </span>
      </a>

      {/* Screen Reader Only Live Region for Selections */}
      <div className="sr-only" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        {selectedIds.size === 0 
          ? 'No categories selected. Select a category to continue.'
          : `${selectedIds.size} categories selected. Press Continue to proceed.`
        }
      </div>
    </div>
  );
}
