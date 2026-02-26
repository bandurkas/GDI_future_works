'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/data/courses';
import styles from './CourseCard.module.css';

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
    const [showSeatInfo, setShowSeatInfo] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
                <div className={styles.cardIconBox}>
                    <div className={styles.iconHalo} />
                    {course.imageIcon ? (
                        <div className={styles.imageIconWrapper}>
                            <Image src={course.imageIcon} alt={course.title} width={80} height={80} style={{ objectFit: 'contain' }} className={styles.cardImage} unoptimized />
                        </div>
                    ) : (
                        <div style={{ fontSize: '3rem', position: 'relative', zIndex: 1 }}>{course.icon}</div>
                    )}
                </div>

                <div className={styles.cardContent}>
                    <h3 className={styles.title}>{course.title}</h3>
                    <p className={styles.description}>{course.subtitle || course.outcomes[0]}</p>

                    <div className={styles.tagsContainer}>
                        {course.tags?.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className={styles.tagBadge}>{tag}</span>
                        ))}
                    </div>

                    <div className={styles.metaDivider} />

                    <p className={styles.metadata}>
                        {course.duration} • Certificate included
                    </p>
                </div>
            </div>

            {/* Outcomes Drawer / Pop-up */}
            {outcomesOpen && (
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
                                    <Image src="/assets/info_what.png" alt="What you get" width={400} height={200} className={styles.infoImage} unoptimized />
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
                                    <Image src="/assets/info_who.png" alt="Who is it for" width={400} height={200} className={styles.infoImage} unoptimized />
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
                                    <Image src="/assets/info_why.png" alt="Why worth it" width={400} height={200} className={styles.infoImage} unoptimized />
                                    <div className={styles.infoList}>
                                        {course.whyWorthIt.slice(0, 4).map((item, idx) => (
                                            <div key={idx} className={styles.infoItem}>
                                                <span className={styles.infoCheck}>✓</span> {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.instructorRow}>
                                <div className={styles.avatar} style={{ background: course.instructor.bgGradient }}>
                                    {course.instructor.initials}
                                </div>
                                <div>
                                    <div className={styles.instructorName}>Led by {course.instructor.name}</div>
                                    <div className={styles.instructorCompany}>{course.instructor.company}</div>
                                </div>
                            </div>
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
                                    <a href={`/assets/brochure-${course.slug}.pdf`} download className={`btn ${styles.downloadBtn}`}>
                                        Details
                                    </a>
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
                </div>
            )}
        </div>
    );
}
