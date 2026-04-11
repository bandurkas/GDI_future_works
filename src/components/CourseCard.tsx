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
import { trackConversion } from '@/lib/analytics';
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

                        {/* ── GRADIENT HERO ── */}
                        <div className={styles.drawerHero} style={{ background: course.iconBg }}>
                            {/* Ambient orbs */}
                            <div className={styles.heroOrb1} />
                            <div className={styles.heroOrb2} />

                            {/* SVG geometric lines */}
                            <svg className={styles.heroSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                                <path d="M0 100 L30 40 L70 60 L100 0" stroke="white" strokeWidth="0.12" fill="none" />
                                <path d="M0 0 L50 100 L100 20"         stroke="white" strokeWidth="0.12" fill="none" />
                                <circle cx="80" cy="70" r="20"         stroke="white" strokeWidth="0.08" fill="none" />
                                <circle cx="15" cy="25" r="12"         stroke="white" strokeWidth="0.08" fill="none" />
                            </svg>

                            {/* Top row */}
                            <div className={styles.drawerHeroTop}>
                                <span className={styles.drawerBadge}>{course.category}</span>
                                <div className={styles.drawerHeroActions}>
                                    {course.seatsLeft > 0 && course.seatsLeft <= 8 && (
                                        <span className={`${styles.seatsChip} ${course.seatsLeft <= 3 ? styles.seatsUrgent : ''}`}>
                                            <span className={styles.seatsDot} />
                                            {course.seatsLeft} {isID ? 'kursi tersisa' : 'seats left'}
                                        </span>
                                    )}
                                    <button className={styles.closeBtn} onClick={closeOutcomes} aria-label="Close">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Small echo bubble — left */}
                            <div className={styles.heroBubbleSmall}>
                                <span className={styles.heroBubbleSmallEmoji}>{course.icon}</span>
                            </div>

                            {/* Main glass bubble — right-center */}
                            <div className={styles.heroBubbleMain}>
                                <div className={styles.heroBubbleHighlight} />
                                <span className={styles.drawerHeroEmoji}>{course.icon}</span>
                            </div>

                            {/* Bottom: title + trust */}
                            <div className={styles.drawerHeroBottom}>
                                <h4 className={styles.drawerTitle}>{title}</h4>
                                <div className={styles.drawerTrust}>
                                    <Star size={13} fill="rgba(255,255,255,0.95)" color="rgba(255,255,255,0.95)" style={{ marginRight: '6px' }} />
                                    <span>{course.rating} · {t('card.trustedBy')} {course.studentsCount}+ {t('card.students')}</span>
                                </div>
                            </div>

                            {/* Corner sparkle */}
                            <Sparkles size={18} className={styles.heroSparkle} aria-hidden />
                        </div>

                        {/* ── PRICE STRIP ── */}
                        <div className={styles.priceStrip}>
                            <span className={styles.priceStripMain}>{displayPrice}</span>
                            <span className={styles.priceStripOriginal}>{displayOriginal}</span>
                            <span className={styles.priceStripSave}>−{savePct}%</span>
                            <span className={styles.priceStripNote}>{isID ? '· Akses seumur hidup' : '· Lifetime access'}</span>
                        </div>

                        <div className={styles.drawerBody}>

                            {/* Description */}
                            <div className={styles.drawerSection}>
                                <p className={styles.drawerDesc}>{description}</p>
                            </div>

                            {/* ── VIDEO CTA — HIGH CONVERSION ── */}
                            {course.instructor.loom && (
                                <a
                                    href={course.instructor.loom}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.videoCtaCard}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Watch ${course.instructor.name} intro video`}
                                >
                                    <div className={styles.videoCtaAvatar} style={{ background: course.instructor.bgGradient }}>
                                        <span className={styles.videoCtaInitials}>{course.instructor.initials}</span>
                                        <div className={styles.videoCtaPlayRing}>
                                            <Play size={18} fill="white" color="white" />
                                        </div>
                                    </div>
                                    <div className={styles.videoCtaInfo}>
                                        <div className={styles.videoCtaLabel}>▶ {isID ? 'KENALI INSTRUKTUR ANDA' : 'MEET YOUR INSTRUCTOR'}</div>
                                        <div className={styles.videoCtaName}>{course.instructor.name}</div>
                                        <div className={styles.videoCtaRole}>{course.instructor.role}</div>
                                    </div>
                                    <div className={styles.videoCtaArrow}>→</div>
                                </a>
                            )}

                            {/* Syllabus view OR default view */}
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
                                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
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

                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>{t('card.whoFor')}</h5>
                                        <div className={styles.infoList}>
                                            {whoFor.slice(0, 4).map((item, idx) => (
                                                <div key={idx} className={styles.infoItem}>
                                                    <CheckCircle2 size={14} className={styles.infoCheck} /> {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* What you'll learn */}
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

                                    {/* What's included — chip grid */}
                                    <div className={styles.drawerSection}>
                                        <h5 className={styles.drawerQuestion}>{t('card.whatGet')}</h5>
                                        <div className={styles.featureChipGrid}>
                                            {whatYouGet.slice(0, 6).map((item, idx) => (
                                                <div key={idx} className={styles.featureChip}>
                                                    <span className={styles.featureChipIcon}>{getFeatureIcon(item)}</span>
                                                    <span className={styles.featureChipText}>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Testimonial — editorial pull quote */}
                            {testimonialQuote && (
                                <div className={styles.testimonialBlock}>
                                    <div className={styles.testimonialMark}>&ldquo;</div>
                                    <p className={styles.testimonialQuote}>{testimonialQuote}</p>
                                    <p className={styles.testimonialAuthor}>— {course.testimonialAuthor}</p>
                                </div>
                            )}

                            {/* Instructor card */}
                            <div className={styles.instructorCard}>
                                <div className={styles.instructorCardTop}>
                                    <div className={styles.avatar} style={{ background: course.instructor.bgGradient }}>
                                        {course.instructor.initials}
                                    </div>
                                    <div className={styles.instructorInfo}>
                                        <div className={styles.instructorName}>{t('card.ledBy')} {course.instructor.name}</div>
                                        <div className={styles.instructorRole}>{course.instructor.role}</div>
                                    </div>
                                </div>
                                {course.instructor.credentials && course.instructor.credentials.length > 0 && (
                                    <div className={styles.credentialPills}>
                                        {course.instructor.credentials.slice(0, 2).map((cred, i) => (
                                            <span key={i} className={styles.credentialPill}>{cred}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* ── FOOTER ── */}
                        <div className={styles.drawerFooter}>
                            <div className={styles.drawerButtons}>
                                {course.syllabusDetails && !showSyllabusDetails ? (
                                    <button
                                        className={`btn ${styles.downloadBtn}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowSyllabusDetails(true);
                                            const drawerBody = e.currentTarget.closest(`.${styles.drawerContent}`)?.querySelector(`.${styles.drawerBody}`);
                                            if (drawerBody) drawerBody.scrollTop = 0;
                                        }}
                                    >
                                        {t('card.getDetails')}
                                    </button>
                                ) : (
                                    <a
                                        href={`/api/whatsapp?text=Hi%2C%20I%27d%20like%20more%20details%20about%20${encodeURIComponent(course.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`btn ${styles.downloadBtn}`}
                                        onClick={() => trackConversion('whatsapp_click', 'wa_course_card')}
                                    >
                                        {t('card.askQuestion')}
                                    </a>
                                )}
                                <Link href={`/courses/${course.slug}/schedule`} className={`btn btn-primary ${styles.scheduleBtn}`}>
                                    {t('card.schedule')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
}
