'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/components/CurrencyContext';
import { useLanguage } from '@/components/LanguageContext';
import styles from './Dashboard.module.css';

export type PopularCourse = {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  priceMYR: number;
  priceIDR: number;
  nextSession: string;
  seatsLeft: number;
};

export type Spot = {
  courseSlug: string;
  courseTitle: string;
  date: string;
  dayOfWeek: string;
  day: number;
  month: string;
  time: string;
  timeEnd: string;
  seatsLeft: number;
};

export type PurchaseRecord = {
  id: string;
  courseTitle: string;
  sessionDate: string | null;
  paymentStatus: string | null;
  amount: number | null;
  currency: string | null;
};

interface Props {
  firstName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  popularCourses: PopularCourse[];
  spots: Spot[];
  purchases: PurchaseRecord[];
}

function seatsClass(n: number, styles: Record<string, string>) {
  if (n <= 3) return styles.spotSeatsLow;
  if (n <= 8) return styles.spotSeatsMed;
  return styles.spotSeatsOk;
}

function statusClass(s: string | null, styles: Record<string, string>) {
  if (s === 'PAID') return styles.statusPaid;
  if (s === 'PENDING') return styles.statusPending;
  if (s === 'FAILED') return styles.statusFailed;
  return styles.statusDefault;
}

export default function DashboardView({ firstName, avatarUrl, isAdmin, popularCourses, spots, purchases }: Props) {
  const { currency } = useCurrency();
  const { t } = useLanguage();
  const initials = firstName.slice(0, 2).toUpperCase();

  const getStatusLabel = (status: string | null) => {
    if (status === 'PAID') return t('dash.status.paid');
    if (status === 'PENDING') return t('dash.status.pending');
    if (status === 'FAILED') return t('dash.status.failed');
    return status || '—';
  };

  return (
    <div className={styles.wrap}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <div className={styles.greetLeft}>
          <div className={styles.avatar}>
            {avatarUrl
              ? <Image src={avatarUrl} alt={firstName} width={52} height={52} className={styles.avatarImg} />
              : initials}
          </div>
          <div>
            <h1 className={styles.greetName}>{t('dash.welcome')} {firstName}</h1>
            <p className={styles.greetSub}>{t('dash.sub')}</p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/admin" className={styles.adminBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            {t('dash.adminPanel')}
          </Link>
        )}
      </div>

      {/* Popular Courses */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{t('dash.popularCourses')}</h2>
          <span className={styles.sectionCount} style={{ background: '#ebebeb', color: '#555' }}>{popularCourses.length}</span>
        </div>
        <div className={styles.courseGrid}>
          {popularCourses.map(c => {
            const price = currency === 'IDR'
              ? `IDR ${c.priceIDR.toLocaleString('id-ID')}`
              : `MYR ${c.priceMYR}`;
            return (
              <div key={c.slug} className={styles.courseCard}>
                <div className={styles.courseIconWrap}>
                  {c.icon}
                </div>
                <div className={styles.courseBody}>
                  <h3 className={styles.courseTitle}>{c.title}</h3>
                  <p className={styles.courseSub}>{c.subtitle}</p>
                  <div className={styles.courseMeta}>
                    <span className={styles.coursePrice}>{price}</span>
                    {c.seatsLeft > 0
                      ? <span className={styles.courseSeats}>{c.seatsLeft} {t('dash.seatsLeft')}</span>
                      : <span className={styles.courseSeats} style={{ background: '#fee2e2', color: '#991b1b' }}>{t('dash.full')}</span>}
                  </div>
                  <Link href={`/courses/${c.slug}`} className={styles.courseLink}>
                    {t('dash.viewCourse')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Available Spots */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{t('dash.nextSpots')}</h2>
          <span className={styles.sectionCount} style={{ background: '#dbeafe', color: '#1e40af' }}>{spots.length}</span>
        </div>
        {spots.length === 0
          ? <div className={styles.empty}>{t('dash.noSessions')}</div>
          : (
            <div className={styles.spotList}>
              {spots.map((s, i) => (
                <div key={`${s.courseSlug}-${i}`} className={styles.spotRow}>
                  <div className={styles.spotDate}>
                    <span className={styles.spotDay}>{s.day}</span>
                    <span className={styles.spotMonth}>{s.month}</span>
                  </div>
                  <div className={styles.spotInfo}>
                    <div className={styles.spotCourse}>{s.courseTitle}</div>
                    <div className={styles.spotTime}>{s.dayOfWeek} · {s.time}–{s.timeEnd}</div>
                  </div>
                  <div className={styles.spotRight}>
                    <span className={`${styles.spotSeats} ${seatsClass(s.seatsLeft, styles)}`}>
                      {s.seatsLeft} {t('dash.left')}
                    </span>
                    <Link href={`/courses/${s.courseSlug}`} className={styles.spotBtn}>
                      {t('dash.book')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Purchase History */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{t('dash.myCourses')}</h2>
          <span className={styles.sectionCount} style={{ background: '#d1fae5', color: '#065f46' }}>{purchases.length}</span>
        </div>
        {purchases.length === 0
          ? <div className={styles.empty}>{t('dash.noEnrolled')}</div>
          : (
            <div className={styles.historyList}>
              {purchases.map(p => (
                <div key={p.id} className={styles.historyRow}>
                  <div className={styles.historyIcon}>📚</div>
                  <div className={styles.historyInfo}>
                    <div className={styles.historyTitle}>{p.courseTitle}</div>
                    <div className={styles.historyDate}>{p.sessionDate ?? '—'}</div>
                  </div>
                  {p.paymentStatus && (
                    <span className={`${styles.historyStatus} ${statusClass(p.paymentStatus, styles)}`}>
                      {getStatusLabel(p.paymentStatus)}
                    </span>
                  )}
                  {p.amount != null && p.currency && (
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#555', flexShrink: 0 }}>
                      {p.currency} {p.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
