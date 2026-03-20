import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { courses, getCourseBySlug } from '@/data/courses';
import StickyBookingBar from '@/components/StickyBookingBar';
import CoursePriceCard from '@/components/CoursePriceCard';
import { Translate } from '@/components/LanguageContext';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) return {};
    return {
        title: `${course.title} — GDI FutureWorks`,
        description: course.description,
    };
}

export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) notFound();

    return (
        <div className={`${styles.page} page-with-sticky-bottom`}>
            {/* ===== HERO ===== */}
            <section className={styles.hero}>
                <div className="container">
                    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                        <Link href="/">Courses</Link>
                        <span aria-hidden> › </span>
                        <span>{course.category}</span>
                    </nav>

                    <div className={styles.heroGrid}>
                        <div className={styles.heroLeft}>
                            <div className={styles.heroIconRow}>
                                <div className={styles.heroIcon} style={{ background: course.iconBg }}>{course.icon}</div>
                                <span className="badge badge-accent">{course.category}</span>
                                {course.seatsLeft <= 5 && (
                                    <span className="badge" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                                        🔴 Only {course.seatsLeft} seats left
                                    </span>
                                )}
                            </div>
                            <h1 className={styles.heroTitle}>{course.title}</h1>
                            <p className={styles.heroSubtitle}>{course.subtitle}</p>
                            <p className={styles.heroDesc}>{course.description}</p>

                            <div className={styles.heroMeta}>
                                {[
                                    { icon: '📅', label: 'Next session', val: course.nextSession },
                                    { icon: '⏱', label: 'Duration', val: course.format },
                                    { icon: '👥', label: 'Format', val: 'Live · max 15 students' },
                                ].map((m) => (
                                    <div key={m.label} className={styles.metaItem}>
                                        <span>{m.icon}</span>
                                        <div>
                                            <span className={styles.metaLabel}>{m.label}</span>
                                            <span className={styles.metaVal}>{m.val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.heroRating}>
                                <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                                <strong>{course.rating}</strong>
                                <span className={styles.ratingCount}>({course.studentsCount.toLocaleString()} students)</span>
                            </div>
                        </div>

                        {/* Price card — desktop hero */}
                        <div className={styles.priceCard}>
                            <CoursePriceCard course={course} slug={slug} variant="hero" styles={styles} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BODY ===== */}
            <div className={styles.body}>
                <div className="container">
                    <div className={styles.bodyGrid}>
                        <div className={styles.bodyMain}>

                            {/* BLOCK 1 — INSTRUCTOR (placed HIGH — first block for instant trust) */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>Meet Your Instructor</h2>
                                <div className={styles.instructorCard}>
                                    <div className={styles.instructorTop}>
                                        <div className={styles.instructorAvatar} style={{ background: course.instructor.bgGradient }}>
                                            {course.instructor.initials}
                                        </div>
                                        <div>
                                            <h3 className={styles.instructorName}>{course.instructor.name}</h3>
                                            <p className={styles.instructorRole}>{course.instructor.role}</p>
                                            <p className={styles.instructorCompany}>🏢 {course.instructor.company}</p>
                                        </div>
                                    </div>

                                    {/* TRUST ENGINEERING: Verification Badges */}
                                    <div className={styles.trustBadges}>
                                        <div className={styles.trustBadgeItem}>⭐ Verified Industry Expert</div>
                                        <div className={styles.trustBadgeItem}>🔬 Currently at {course.instructor.company}</div>
                                        <div className={styles.trustBadgeItem}>📊 5+ Years Experience</div>
                                        <div className={styles.trustBadgeItem}>👥 500+ Students Taught</div>
                                    </div>

                                    <p className={styles.instructorExp}>✦ {course.instructor.experience}</p>
                                    <div className="check-list">
                                        {course.instructor.credentials.map((c, i) => (
                                            <div key={i} className="check-item">
                                                <div className="check-icon">✓</div>
                                                <span>{c}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* RETENTION: Learning Path Bundle */}
                            <section className={styles.learningPathBlock}>
                                <div>
                                    <div className={styles.pathBadge}>LEARNING PATH</div>
                                    <h3 className={styles.pathTitle}>Unlock the Full {course.category} Career Path</h3>
                                    <p className={styles.pathDesc}>Bundle this course with two advanced modules and get <strong>25% off</strong> the total price. Master the skills that employers are actively hiring for.</p>
                                </div>
                                <button className={styles.pathBtn}>Claim Bundle Offer</button>
                            </section>

                            {/* BLOCK 2 — OUTCOMES */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>What You&apos;ll Learn</h2>
                                <p className={styles.blockDesc}>After this course, you will be able to:</p>
                                <div className="check-list">
                                    {course.outcomes.map((o, i) => (
                                        <div key={i} className="check-item">
                                            <div className="check-icon">✓</div>
                                            <span>{o}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 3 — SOCIAL PROOF */}
                            <section className={`${styles.block} ${styles.proofBlock}`}>
                                <div className={styles.proofStat}>
                                    <div className={styles.proofNum}>{course.studentsCount.toLocaleString()}+</div>
                                    <div className={styles.proofLabel}>students have completed this course</div>
                                </div>
                                <div className={styles.pullQuote}>
                                    <span className={styles.quoteMarks}>&ldquo;</span>
                                    <p>{course.testimonialQuote}</p>
                                    <span className={styles.quoteAuthor}>— {course.testimonialAuthor}</span>
                                </div>
                            </section>

                            {/* BLOCK 4 — WHAT YOU GET */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>What You Get</h2>
                                <div className={styles.getsGrid}>
                                    {course.whatYouGet.map((item, i) => (
                                        <div key={i} className={styles.getItem}>
                                            <div className="check-icon">✓</div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 5 — FORMAT */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>Learning Format</h2>
                                <div className={styles.formatGrid}>
                                    {[
                                        { icon: '💻', title: 'Live Online', desc: 'Join via video — interactive, not pre-recorded.' },
                                        { icon: '🙋', title: 'Ask Anything', desc: 'Q&A throughout the entire session.' },
                                        { icon: '👥', title: 'Max 15 Students', desc: 'Small group for real attention.' },
                                        { icon: '⏱', title: course.format, desc: 'Compact, focused, and effective.' },
                                    ].map((f, i) => (
                                        <div key={i} className={styles.formatItem}>
                                            <span className={styles.formatIcon}>{f.icon}</span>
                                            <h4 className={styles.formatTitle}>{f.title}</h4>
                                            <p className={styles.formatDesc}>{f.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 6 — WHY IT'S WORTH IT */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>Why It&apos;s Worth It</h2>
                                <div className="check-list">
                                    {course.whyWorthIt.map((item, i) => (
                                        <div key={i} className="check-item">
                                            <div className="check-icon">✓</div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* BLOCK 7 — WHO IT'S FOR */}
                            <section className={styles.block}>
                                <h2 className={styles.blockTitle}>Who This Course Is For</h2>
                                <div className={styles.whoGrid}>
                                    {course.whoFor.map((who, i) => (
                                        <div key={i} className={styles.whoItem}>
                                            <span>👤</span>
                                            <span>{who}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* MOBILE bottom CTA (inside content for scrollers) */}
                            <div className={styles.mobileCta}>
                                <Link href={`/courses/${slug}/schedule`} className="btn btn-primary btn-xl btn-full" id="mobile-inline-cta">
                                    Choose Date & Time →
                                </Link>
                                <p className={styles.mobileCtaNote}>🔒 Secure · Confirmed via WhatsApp in &lt;2 min</p>
                            </div>

                        </div>

                        {/* ===== STICKY SIDEBAR (desktop) ===== */}
                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarCard}>
                                <CoursePriceCard course={course} slug={slug} variant="sidebar" styles={styles} />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* Sticky bottom bar (mobile) */}
            <StickyBookingBar course={course} />
        </div>
    );
}
