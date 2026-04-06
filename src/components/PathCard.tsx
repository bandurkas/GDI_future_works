'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import styles from './PathCard.module.css';

interface PathCardProps {
  title: string;
  description: string;
  list?: string[];
  ctaText?: string;
  ctaHref?: string;
  variant?: 'primary' | 'secondary';
}

const PathCard: React.FC<PathCardProps> = ({
  title,
  description,
  list,
  ctaText,
  ctaHref,
  variant = 'primary'
}) => {
  return (
    <div className={styles.card}>
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
