'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import styles from './PathCard.module.css';

interface Highlight {
  icon: string;
  text: string;
}

interface PathCardProps {
  title: string;
  description: string;
  list?: string[];
  highlights?: Highlight[];
  ctaText?: string;
  ctaHref?: string;
  variant?: 'primary' | 'secondary';
  accentBar?: boolean;
}

const PathCard: React.FC<PathCardProps> = ({
  title,
  description,
  list,
  highlights,
  ctaText,
  ctaHref,
  variant = 'primary',
  accentBar = false,
}) => {
  return (
    <div className={`${styles.card} ${accentBar ? styles.cardAccent : ''}`}>
      {accentBar && <div className={styles.accentBar} />}
      <div className={styles.topContent}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.description}>{description}</p>

        {list && list.length > 0 && (
          <ul className={styles.list}>
            {list.map((item, index) => (
              <li key={index} className={styles.listItem}>
                <span className={styles.checkIcon}><CheckCircle2 size={16} /></span>
                {item}
              </li>
            ))}
          </ul>
        )}

        {highlights && highlights.length > 0 && (
          <div className={styles.highlights}>
            {highlights.map((h, i) => (
              <div key={i} className={styles.highlightPill}>
                <span className={styles.highlightIcon}>{h.icon}</span>
                <span className={styles.highlightText}>{h.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {ctaText && ctaHref && (
        <div className={styles.ctaWrapper}>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={variant === 'primary' ? styles.btnPrimary : styles.btnSecondary}
          >
            {ctaText}
          </a>
        </div>
      )}
    </div>
  );
};

export default PathCard;
