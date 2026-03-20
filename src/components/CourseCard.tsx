'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/data/courses';
import styles from './CourseCard.module.css';
import { useLanguage } from './LanguageContext';

interface Props {
    course: Course;
    featured?: boolean;
}

const getFeatureIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('live') || t.includes('interactive')) return '🎥';
    if (t.includes('question') || t.includes('q&a')) return '💬';
    if (t.includes('exercise') || t.includes('practical') || t.includes('script')) return '💻';
    if (t.includes('certificate')) return '🎓';
    if (t.includes('portfolio') || t.includes('project')) return '🚀';
    if (t.includes('community')) return '🤝';
    if (t.includes('career') || t.includes('job')) return '📈';
    return '✨';
};

const getValueIcon = (idx: number) => {
    const icons = ['💡', '🔥', '⏱️', '💪', '🚀'];
    return icons[idx % icons.length];
};

export default function CourseCard({ course, featured }: Props) {
    const [outcomesOpen, setOutcomesOpen] = useState(false);
    const [showSyllabusDetails, setShowSyllabusDetails] = useState(false);
    const [showSeatInfo, setShowSeatInfo] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const { language } = useLanguage();

    const isID = language === 'id';
    const displayPrice = isID
        ? `Rp ${course.priceIDR.toLocaleString('id-ID')}`
        : `RM ${course.priceMYR}`;
    const displayOriginal = isID
        ? `Rp ${course.originalPriceIDR.toLocaleString('id-ID')}`
        : `RM ${course.originalPriceMYR}`;
    const savePct = Math.round((1 - (isID ? course.priceIDR / course.originalPriceIDR : course.priceMYR / course.originalPriceMYR)) * 100);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isRightSwipe) {
            setOutcomesOpen(false);
        }
    };

    const openOutcomes = (e: React.MouseEvent) => {
        e.preventDefault();
        setOutcomesOpen(true);
    };

    const closeOutcomes = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOutcomesOpen(false);
        // Reset to default front view when drawer closes
        setTimeout(() => setShowSyllabusDetails(false), 300);
    };

    // Use a subset of ultra-specific outcomes for the drawer
    const specificOutcomes = course.outcomes.slice(0, 3);

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.card}
                id={`course-card-${course.slug}`}
                onClick={openOutcomes}
            >


                <div className={styles.cardContent}>
                    <h3 className={styles.title}>{course.title}</h3>
                    <p className={styles.description}>{course.subtitle || course.outcomes[0]}</p>

                    <div className={styles.tagsContainer}>
                        {course.tags?.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className={styles.tagBadge}>{tag}</span>
                        ))}
                    </div>

                    {/* Price Block */}
                    <div className={styles.priceBlock}>
                        <div className={styles.priceRow}>
                            <span className={styles.priceMain}>{displayPrice}</span>
                            <span className={styles.priceOriginal}>{displayOriginal}</span>
                        </div>
                        <p className={styles.priceNote}>
                            {isID ? '🎓 Satu kali bayar · Akses seumur hidup' : '🎓 One-time fee · Lifetime access'}
                        </p>
                    </div>

                    <div className={styles.metaDivider} />

                    {/* Career outcome row */}
                    {course.targetRoles && (
                        <div className={styles.outcomeRow}>
                            <span className={styles.outcomeArrow}>→</span>
                            <span className={styles.outcomeText}>{course.targetRoles[0]}</span>
                        </div>
                    )}

                    <p className={styles.metadata}>
                        {course.duration} • Certificate included
                    </p>
                </div>
            </div>

            {/* Outcomes Drawer / Pop-up */}
            {outcomesOpen && typeof document !== 'undefined' && createPortal(
                <div className={styles.drawerOverlay} onClick={closeOutcomes}>
                    <div
                        className={styles.drawerContent}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className={styles.dragHandle} />
                        <div className={styles.drawerHeader}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span className={styles.drawerBadge}>{course.category}</span>
                                    <button className={styles.closeBtn} onClick={closeOutcomes} aria-label="Close">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                                <h4 className={styles.drawerTitle}>{course.title}</h4>
                                <div className={styles.drawerTrust}>
                                    <span style={{ color: '#F59E0B', marginRight: '6px' }}>★</span>
                                    <span>Trusted by {course.studentsCount}+ students</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.drawerBody}>
                            <div className={styles.drawerSection}>
                                <h5 className={styles.drawerQuestion}>About Course</h5>
                                <p className={styles.drawerDesc}>{course.description}</p>
                            </div>

                            {course.syllabusDetails && showSyllabusDetails ? (
                                <>
                                    {course.syllabusDetails.sessions.map((session, idx) => (
                                        <div key={idx} className={styles.drawerSection}>
                                            <h5 className={styles.drawerQuestion}>{session.title}</h5>
                                            <ul className={styles.drawerList}>
                                                {session.items.map((item, i) => (
                                                    <li key={i} className={styles.drawerListItem}>
                                                        <div className={styles.checkIcon}>✓</div>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>Your Project</h5>
                                        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                            <p className={styles.drawerDesc} style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.5 }}>
                                                {course.syllabusDetails.project}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>Career Outcomes</h5>
                                        <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                            <ul className={styles.drawerList} style={{ gap: '12px' }}>
                                                {course.syllabusDetails.careerOutcomes.roles.map((role, i) => (
                                                    <li key={i} className={styles.drawerListItem} style={{ alignItems: 'flex-start' }}>
                                                        <span style={{ marginRight: '8px', fontSize: '1.25rem', lineHeight: 1 }}>📈</span>
                                                        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#166534' }}>{role}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>What you&apos;ll learn</h5>
                                        <div className={styles.drawerMicrotext}>Practical skills you&apos;ll gain</div>
                                        <ul className={styles.drawerList}>
                                            {specificOutcomes.map((outcome, idx) => (
                                                <li key={idx} className={styles.drawerListItem}>
                                                    <div className={styles.checkIcon}>✓</div>
                                                    <span>{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>What you&apos;ll get</h5>
                                        <div className={styles.infoGraphicCard}>
                                            {/* Fix #20 — images only load after drawer opens */}
                                            <Image src="/assets/info_what.png" alt="What you get" width={400} height={200} className={styles.infoImage} loading="lazy" />
                                            <div className={styles.infoList}>
                                                {course.whatYouGet.slice(0, 6).map((item, idx) => (
                                                    <div key={idx} className={styles.infoItem}>
                                                        <span className={styles.infoCheck}>✓</span> {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>Who this course is for</h5>
                                        <div className={styles.infoGraphicCard}>
                                            <Image src="/assets/info_who.png" alt="Who is it for" width={400} height={200} className={styles.infoImage} loading="lazy" />
                                            <div className={styles.infoList}>
                                                {course.whoFor.slice(0, 4).map((item, idx) => (
                                                    <div key={idx} className={styles.infoItem}>
                                                        <span className={styles.infoCheck}>✓</span> {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>Why this course is worth it</h5>
                                        <div className={styles.infoGraphicCard}>
                                            <Image src="/assets/info_why.png" alt="Why worth it" width={400} height={200} className={styles.infoImage} loading="lazy" />
                                            <div className={styles.infoList}>
                                                {course.whyWorthIt.slice(0, 4).map((item, idx) => (
                                                    <div key={idx} className={styles.infoItem}>
                                                        <span className={styles.infoCheck}>✓</span> {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className={styles.instructorRow}>
                                <div className={styles.avatar} style={{ background: course.instructor.bgGradient }}>
                                    {course.instructor.initials}
                                </div>
                                <div>
                                    <div className={styles.instructorName}>Led by {course.instructor.name}</div>
                                    <div className={styles.instructorCompany}>{course.instructor.company}</div>
                                </div>
                            </div>

                            {course.testimonialQuote && (
                                <div className={styles.testimonialBlock}>
                                    <p className={styles.testimonialQuote}>&ldquo;{course.testimonialQuote}&rdquo;</p>
                                    <p className={styles.testimonialAuthor}>— {course.testimonialAuthor}</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.drawerFooter}>
                            <div className={styles.actionRow}>
                                <button
                                    className={styles.urgencyAlertBtn}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowSeatInfo(!showSeatInfo);
                                    }}
                                    aria-label="Seat availability info"
                                >
                                    ⚠
                                </button>
                                <div className={styles.drawerButtons}>
                                    {/* If course has syllabus details and we aren't showing them yet, let user toggle them. Otherwise link to contact. */}
                                    {course.syllabusDetails && !showSyllabusDetails ? (
                                        <button
                                            className={`btn ${styles.downloadBtn}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowSyllabusDetails(true);
                                                // Scroll drawer to top so they see the first session
                                                const drawerBody = e.currentTarget.closest(`.${styles.drawerContent}`)?.querySelector(`.${styles.drawerBody}`);
                                                if (drawerBody) {
                                                    drawerBody.scrollTop = 0;
                                                }
                                            }}
                                        >
                                            Get Details
                                        </button>
                                    ) : (
                                        <a
                                            href={`https://wa.me/60112345678?text=Hi%2C%20I%27d%20like%20more%20details%20about%20${encodeURIComponent(course.title)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`btn ${styles.downloadBtn}`}
                                        >
                                            {showSyllabusDetails ? 'Ask Question' : 'Ask Question'}
                                        </a>
                                    )}
                                    <Link href={`/courses/${course.slug}/schedule`} className={`btn btn-primary ${styles.scheduleBtn}`}>
                                        Schedule
                                    </Link>
                                </div>
                            </div>

                            {showSeatInfo && (
                                <div className={styles.urgencyTooltip}>
                                    <strong>Limited Seats Available</strong>
                                    <p>Select your dates in the full schedule. The final step is payment to secure your spot!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
