import { use } from 'react';
import Link from 'next/link';
import { getCourseBySlug } from '@/data/courses';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export default function ConfirmationPage({ params }: Props) {
    const { slug } = use(params);
    const course = getCourseBySlug(slug);

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.inner}>

                    {/* Success animation */}
                    <div className={styles.successRing}>
                        <div className={styles.successIcon}>✓</div>
                    </div>
                    <div className={styles.confettiRow} aria-hidden>
                        {['🎉', '🎊', '⭐', '🚀', '🎯'].map((e, i) => <span key={i} className={styles.confetti} style={{ animationDelay: `${i * 0.12}s` }}>{e}</span>)}
                    </div>

                    <div className={styles.text}>
                        <h1 className={styles.title}>You&apos;re enrolled! 🎉</h1>
                        <p className={styles.subtitle}>
                            Your session is confirmed. You&apos;ll receive your access link on WhatsApp in the next <strong>2–5 minutes</strong>.
                        </p>
                    </div>

                    {/* What was booked */}
                    <div className={styles.sessionCard}>
                        {course && (
                            <div className={styles.sessionHeader}>
                                <div className={styles.sessionIcon} style={{ background: course.iconBg }}>{course.icon}</div>
                                <div>
                                    <h3 className={styles.sessionTitle}>{course.title}</h3>
                                    <p className={styles.sessionSub}>{course.subtitle}</p>
                                </div>
                            </div>
                        )}
                        <div className={styles.divider} />
                        <div className={styles.details}>
                            {[
                                { icon: '📅', label: 'Date', val: `${course?.nextSession ?? 'TBD'} · 19:00–21:00 WIB` },
                                { icon: '💻', label: 'Format', val: 'Live Online Session — join by link' },
                                { icon: '📱', label: 'Access', val: 'Sent to your WhatsApp in 2–5 min' },
                                { icon: '🎓', label: 'Certificate', val: 'Issued after course completion' },
                                { icon: '💬', label: 'Community', val: 'WhatsApp group link in your welcome message' },
                            ].map((d) => (
                                <div key={d.label} className={styles.detail}>
                                    <span className={styles.detailIcon}>{d.icon}</span>
                                    <div>
                                        <span className={styles.detailLabel}>{d.label}</span>
                                        <span className={styles.detailVal}>{d.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Primary CTAs */}
                    <div className={styles.actions}>
                        <a
                            href="https://wa.me/6282258720974"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`btn btn-primary btn-lg btn-full`}
                            id="confirmation-whatsapp-btn"
                        >
                            💬 Open WhatsApp Chat
                        </a>
                        <button className={`btn btn-secondary btn-lg btn-full`} id="confirmation-calendar-btn">
                            📅 Add to Google Calendar
                        </button>
                    </div>

                    {/* What happens next */}
                    <div className={styles.nextSteps}>
                        <h4 className={styles.nextTitle}>What happens next?</h4>
                        {[
                            { icon: '📱', step: 'WhatsApp confirmation arrives in 2–5 minutes.' },
                            { icon: '⏰', step: 'Reminder sent 24h before class, and again 1h before.' },
                            { icon: '🔗', step: 'Click your session link at start time — instructor will be live.' },
                            { icon: '📁', step: 'Project files and materials shared during the session.' },
                        ].map((item, i) => (
                            <div key={i} className={styles.nextItem}>
                                <span className={styles.nextNum}>{i + 1}</span>
                                <span className={styles.nextIcon}>{item.icon}</span>
                                <span>{item.step}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.browseRow}>
                        <p className={styles.browseText}>Want to learn more?</p>
                        <Link href="/" className={styles.browseLink}>Browse other courses →</Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
