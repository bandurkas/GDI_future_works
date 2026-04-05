'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/data/courses';
import styles from './CourseCard.module.css';
import { useLanguage } from './LanguageContext';
import { useCurrency } from './CurrencyContext';
import { formatPrice } from '@/lib/currency';
import {
    Video,
    MessageSquare,
    Monitor,
    GraduationCap,
    Rocket,
    Users,
    TrendingUp,
    Star,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    X,
    Lightbulb,
    Zap,
    Timer,
    Dumbbell,
    Sparkles,
    Play
} from 'lucide-react';

interface Props {
    course: Course;
    featured?: boolean;
}

const getFeatureIcon = (text: string) => {
    const t = (text || '').toLowerCase();
    const size = 16;
    if (t.includes('live') || t.includes('interactive') || t.includes('langsung')) return <Video size={size} />;
    if (t.includes('question') || t.includes('q&a') || t.includes('tanya')) return <MessageSquare size={size} />;
    if (t.includes('exercise') || t.includes('practical') || t.includes('script') || t.includes('latihan')) return <Monitor size={size} />;
    if (t.includes('certificate') || t.includes('sertifikat')) return <GraduationCap size={size} />;
    if (t.includes('portfolio') || t.includes('project') || t.includes('proyek')) return <Rocket size={size} />;
    if (t.includes('community') || t.includes('komunitas')) return <Users size={size} />;
    if (t.includes('career') || t.includes('job') || t.includes('karier') || t.includes('kerja')) return <TrendingUp size={size} />;
    return <Sparkles size={size} />;
};

const getValueIcon = (idx: number) => {
    const size = 18;
    const icons = [
        <Lightbulb size={size} key="l" />, 
        <Zap size={size} key="z" />, 
        <Timer size={size} key="t" />, 
        <Dumbbell size={size} key="d" />, 
        <Rocket size={size} key="r" />
    ];
    return icons[idx % icons.length];
};

export default function CourseCard({ course, featured }: Props) {
    const [outcomesOpen, setOutcomesOpen] = useState(false);
    const [showSyllabusDetails, setShowSyllabusDetails] = useState(false);
    const [showSeatInfo, setShowSeatInfo] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const { language, t } = useLanguage();
    const { currency } = useCurrency();

    const isID = language === 'id';

    // Localized course content
    const title = isID ? (course.titleID || course.title) : course.title;
    const subtitle = isID ? (course.subtitleID || course.subtitle) : course.subtitle;
    const description = isID ? (course.descriptionID || course.description) : course.description;
    const outcomes = isID ? (course.outcomesID || course.outcomes) : course.outcomes;
    const whoFor = isID ? (course.whoForID || course.whoFor) : course.whoFor;
    const whatYouGet = isID ? (course.whatYouGetID || course.whatYouGet) : course.whatYouGet;
    const whyWorthIt = isID ? (course.whyWorthItID || course.whyWorthIt) : course.whyWorthIt;
    const targetRoles = isID ? (course.targetRolesID || course.targetRoles) : course.targetRoles;
    const duration = isID ? (course.durationID || course.duration) : course.duration;
    const testimonialQuote = isID ? (course.testimonialQuoteID || course.testimonialQuote) : course.testimonialQuote;
    const syllabusDetails = isID ? (course.syllabusDetailsID || course.syllabusDetails) : course.syllabusDetails;
    
    // Use localized prices from the course object
    const currentPrice = currency === 'IDR' ? course.priceIDR : course.priceMYR;
    const originalPrice = currency === 'IDR' ? course.originalPriceIDR : course.originalPriceMYR;

    const displayPrice = formatPrice(currentPrice, currency);
    const displayOriginal = formatPrice(originalPrice, currency);
    
    const savePct = Math.round((1 - (currentPrice / originalPrice)) * 100);

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

    const openOutcomes = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        setOutcomesOpen(true);
    };

    const closeOutcomes = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOutcomesOpen(false);
        setTimeout(() => setShowSyllabusDetails(false), 300);
    };

    // Close drawer on Escape key
    useEffect(() => {
        if (!outcomesOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOutcomesOpen(false);
                setTimeout(() => setShowSyllabusDetails(false), 300);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [outcomesOpen]);

    // Use a subset of ultra-specific outcomes for the drawer
    const specificOutcomes = outcomes.slice(0, 3);

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.card}
                id={`course-card-${course.slug}`}
                onClick={openOutcomes}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${title}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOutcomes(e as any); } }}
            >
                <div className={styles.cardContent}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.description}>{subtitle || outcomes[0]}</p>

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
                            <GraduationCap size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                            {isID ? 'Satu kali bayar · Akses seumur hidup' : 'One-time fee · Lifetime access'}
                        </p>
                    </div>

                    <div className={styles.metaDivider} />

                    {/* Career outcome row */}
                    {targetRoles && (
                        <div className={styles.outcomeRow}>
                            <ArrowRight size={14} className={styles.outcomeArrow} />
                            <span className={styles.outcomeText}>{targetRoles[0]}</span>
                        </div>
                    )}

                    <p className={styles.metadata}>
                        {duration} • {t('card.certificate')}
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
                                        <X size={20} />
                                    </button>
                                </div>
                                <h4 className={styles.drawerTitle}>{title}</h4>
                                <div className={styles.drawerTrust}>
                                    <Star size={14} fill="#F59E0B" color="#F59E0B" style={{ marginRight: '6px' }} />
                                    <span>{t('card.trustedBy')} {course.studentsCount}+ {t('card.students')}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.drawerBody}>
                            <div className={styles.drawerSection}>
                                <h5 className={styles.drawerQuestion}>{t('card.aboutCourse')}</h5>
                                <p className={styles.drawerDesc}>{description}</p>
                            </div>

                            {syllabusDetails && showSyllabusDetails ? (
                                <>
                                    {syllabusDetails.sessions.map((session, idx) => (
                                        <div key={idx} className={styles.drawerSection}>
                                            <h5 className={styles.drawerQuestion}>{session.title}</h5>
                                            <ul className={styles.drawerList}>
                                                {session.items.map((item, i) => (
                                                    <li key={i} className={styles.drawerListItem}>
                                                         <div className={styles.checkIcon}><CheckCircle2 size={16} /></div>
                                                         <span>{item}</span>
                                                     </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>{t('card.yourProject')}</h5>
                                        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                            <p className={styles.drawerDesc} style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.5 }}>
                                                {syllabusDetails.project}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>{t('card.careerOutcomes')}</h5>
                                        <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                            <ul className={styles.drawerList} style={{ gap: '12px' }}>
                                                {syllabusDetails.careerOutcomes.roles.map((role, i) => (
                                                    <li key={i} className={styles.drawerListItem} style={{ alignItems: 'flex-start' }}>
                                                        <TrendingUp size={20} style={{ marginRight: '8px', color: '#166534' }} />
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
                                        <h5 className={styles.drawerQuestion}>{t('card.whatLearn')}</h5>
                                        <div className={styles.drawerMicrotext}>{t('card.practicalSkills')}</div>
                                        <ul className={styles.drawerList}>
                                            {specificOutcomes.map((outcome, idx) => (
                                                <li key={idx} className={styles.drawerListItem}>
                                                    <div className={styles.checkIcon}><CheckCircle2 size={16} /></div>
                                                    <span>{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>{t('card.whatGet')}</h5>
                                        <div className={styles.infoGraphicCard}>
                                            <Image src="/assets/info_what.webp" alt="What you get" width={400} height={200} className={styles.infoImage} loading="lazy" unoptimized />
                                            <div className={styles.infoList}>
                                                {whatYouGet.slice(0, 6).map((item, idx) => (
                                                    <div key={idx} className={styles.infoItem}>
                                                        <CheckCircle2 size={14} className={styles.infoCheck} /> {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>{t('card.whoFor')}</h5>
                                        <div className={styles.infoGraphicCard}>
                                            <Image src="/assets/info_who.webp" alt="Who is it for" width={400} height={200} className={styles.infoImage} loading="lazy" unoptimized />
                                            <div className={styles.infoList}>
                                                {whoFor.slice(0, 4).map((item, idx) => (
                                                    <div key={idx} className={styles.infoItem}>
                                                        <CheckCircle2 size={14} className={styles.infoCheck} /> {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>{t('card.whyWorth')}</h5>
                                        <div className={styles.infoGraphicCard}>
                                            <Image src="/assets/info_why.webp" alt="Why worth it" width={400} height={200} className={styles.infoImage} loading="lazy" unoptimized />
                                            <div className={styles.infoList}>
                                                {whyWorthIt.slice(0, 4).map((item, idx) => (
                                                    <div key={idx} className={styles.infoItem}>
                                                        <CheckCircle2 size={14} className={styles.infoCheck} /> {item}
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
                                <div className={styles.instructorInfo}>
                                    <div className={styles.instructorName}>{t('card.ledBy')} {course.instructor.name}</div>
                                    <div className={styles.instructorCompany}>{course.instructor.company}</div>
                                </div>
                                {course.instructor.loom && (
                                    <a
                                        href={course.instructor.loom}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.watchIntroBtn}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label="Watch tutor intro video"
                                    >
                                        <Play size={11} />
                                        Watch intro
                                    </a>
                                )}
                            </div>

                            {testimonialQuote && (
                                <div className={styles.testimonialBlock}>
                                    <p className={styles.testimonialQuote}>&ldquo;{testimonialQuote}&rdquo;</p>
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
                                    <AlertTriangle size={18} />
                                </button>
                                <div className={styles.drawerButtons}>
                                    {course.syllabusDetails && !showSyllabusDetails ? (
                                        <button
                                            className={`btn ${styles.downloadBtn}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowSyllabusDetails(true);
                                                const drawerBody = e.currentTarget.closest(`.${styles.drawerContent}`)?.querySelector(`.${styles.drawerBody}`);
                                                if (drawerBody) {
                                                    drawerBody.scrollTop = 0;
                                                }
                                            }}
                                        >
                                            {t('card.getDetails')}
                                        </button>
                                    ) : (
                                        <a
                                            href={`https://wa.me/628211704707?text=Hi%2C%20I%27d%20like%20more%20details%20about%20${encodeURIComponent(course.title)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`btn ${styles.downloadBtn}`}
                                        >
                                            {t('card.askQuestion')}
                                        </a>
                                    )}
                                    <Link href={`/courses/${course.slug}/schedule`} className={`btn btn-primary ${styles.scheduleBtn}`}>
                                        {t('card.schedule')}
                                    </Link>
                                </div>
                            </div>

                            {showSeatInfo && (
                                <div className={styles.urgencyTooltip}>
                                    <strong>{t('card.seatsLimited')}</strong>
                                    <p>{t('card.seatsDesc')}</p>
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
