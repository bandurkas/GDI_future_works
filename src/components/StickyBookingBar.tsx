import Link from 'next/link';
import { Course } from '@/data/courses';
import { ClientPrice } from '@/components/ClientTranslations';
import styles from './StickyBookingBar.module.css';

interface Props { course: Course; }

export default function StickyBookingBar({ course }: Props) {
    return (
        <div className={styles.bar}>
            <div className={styles.inner}>
                <div className={styles.info}>
                    <div className={styles.price}><ClientPrice price={course.price} />
                        <span className={styles.priceOrig}><ClientPrice price={course.originalPrice} /></span>
                    </div>
                    <div className={styles.meta}>
                        📅 Next: {course.nextSession}
                        {course.seatsLeft <= 5 && (
                            <span className={styles.urgent}> · {course.seatsLeft} seats left</span>
                        )}
                    </div>
                </div>
                <Link
                    href={`/courses/${course.slug}/schedule`}
                    className={`btn btn-primary btn-lg ${styles.cta}`}
                    id="sticky-booking-cta"
                >
                    Choose Date & Time
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
