import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Translate } from '@/components/ClientTranslations';
import CourseCard from '@/components/CourseCard';
import { courses } from '@/data/courses';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'GDI FutureWorks | Skills for the Future of Work',
    description: 'Master AI, Communication & Productivity. Professional short courses in Southeast Asia.',
};

export default function HomePage() {
    return (
        <div className={styles.page}>
            {/* HERO SECTION */}
            <section className={styles.heroSection}>
                <div className={styles.heroContainer}>
                    <div className={styles.trustBadge}>
                        <span className={styles.heroIcon}>🌟</span>
                        <span>Trusted by 500+ Professionals in Southeast Asia</span>
                    </div>

                    <h1 className={styles.heroTitle}>
                        Choose your path into tech.<br />
                        <span className={styles.highlight}>Master AI, Communication & Productivity.</span>
                    </h1>

                    <p className={styles.heroSubhead}>
                        Real skills. Live training. Industry experts. Fast-track your career with practical courses designed for the modern workplace.
                    </p>

                    <div className={styles.ctaGroup}>
                        <a href="#courses" className={`${styles.btnPrimary} ${styles.btnLarge}`}>Enrol Now (3 min) ⚡</a>
                        <Link href="/contact" className={styles.btnSecondary}>Talk to Advisor &rarr;</Link>
                    </div>

                    <div className={styles.regionalPresence}>
                        <p>Taught by Active Tech Leads & Industry Experts</p>
                        <div className={styles.heroFlags}>
                            <span className={styles.heroFlag}>🇮🇩 Indonesia</span>
                            <span className={styles.heroFlag}>🇲🇾 Malaysia</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY WE EXIST SECTION */}
            <section className={styles.problemSection}>
                <div className="container">
                    <h2>The world is moving fast. Traditional education is falling behind.</h2>
                    <p className={styles.problemIntro}>We bridge the gap between what you know and what the modern workplace actually demands.</p>

                    <div className={styles.painPoints}>
                        <div className={styles.painPoint}>
                            <span className={styles.painIcon}>🎓</span>
                            <h3>For Graduates</h3>
                            <p>Degrees don't guarantee jobs anymore. We give you the practical, hard skills employers are looking for right now.</p>
                        </div>
                        <div className={styles.painPoint}>
                            <span className={styles.painIcon}>💼</span>
                            <h3>For Professionals</h3>
                            <p>Stuck in your career? Upskill in high-demand areas like AI and data to become indispensable and future-proof your income.</p>
                        </div>
                        <div className={styles.painPoint}>
                            <span className={styles.painIcon}>🏢</span>
                            <h3>For Organizations</h3>
                            <p>Stop wasting time on theoretical training. Reskill your teams efficiently with workflows they can apply on Monday morning.</p>
                        </div>
                    </div>

                    <div className={styles.theSolution}>
                        <h3>The GDI FutureWorks Solution</h3>
                        <p>A learning platform that is simple, structured, and relentlessly practical. No fluff. Just real-world application.</p>
                    </div>

                    <div className={styles.infographicContainer}>
                        <div className={styles.infographicCard}>
                            {/* Left Side: The Problem */}
                            <div className={styles.infoColOld}>
                                <div className={styles.colHeader}>
                                    <span className={styles.statusBadgeWarning}>The Old Way</span>
                                </div>
                                <ul className={styles.infoList}>
                                    <li><span className={styles.xIcon}>✕</span> 3-4 years of academic theory</li>
                                    <li><span className={styles.xIcon}>✕</span> Outdated curriculum</li>
                                    <li><span className={styles.xIcon}>✕</span> Massive debt & high fees</li>
                                    <li><span className={styles.xIcon}>✕</span> Left stranded to find a job</li>
                                </ul>
                            </div>

                            {/* Middle Divider */}
                            <div className={styles.infoSplitter}>
                                <div className={styles.arrowCircle}>&rarr;</div>
                            </div>

                            {/* Right Side: The Solution */}
                            <div className={styles.infoColNew}>
                                <div className={styles.colHeader}>
                                    <span className={styles.statusBadgeSuccess}>GDI FutureWorks</span>
                                </div>
                                <ul className={styles.infoList}>
                                    <li><span className={styles.checkIcon}>✓</span> 2-4 weeks of intense reskilling</li>
                                    <li><span className={styles.checkIcon}>✓</span> Taught by active tech experts</li>
                                    <li><span className={styles.checkIcon}>✓</span> Affordable, immediate ROI</li>
                                    <li><span className={styles.checkIcon}>✓</span> Built to get you hired instantly</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Special Opportunity feature */}
            <section className="section-sm" style={{ paddingBottom: 0 }}>
                <div className="container">
                    <div className={styles.geCard}>
                        <div className={styles.geContent}>
                            <span className={styles.geTag}><Translate tKey="ge.special" /></span>
                            <h2 className={styles.geTitle}><Translate tKey="ge.title" /></h2>
                            <p className={styles.geDesc}><Translate tKey="ge.desc" /></p>
                            <Link href="/great-english" className="btn btn-primary"><Translate tKey="ge.btn" /></Link>
                        </div>
                        <div className={styles.geVisual}>
                            <div className={styles.geEmoji}>🎓🌐</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT WE TEACH SECTION WITH INTERACTIVE CARDS */}
            <section className="section-sm" id="courses" style={{ padding: '80px 0', background: '#f8fafc' }}>
                <div className="container" style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Skills for the Future of Work</h2>
                    <p style={{ fontSize: '1.125rem', color: '#475569' }}>
                        Choose your course below to see schedules and checkout, or <Link href="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Talk to an Advisor</Link>.
                    </p>
                </div>

                <div className="container">
                    {/* Inject original Dynamic CourseCards mapping */}
                    <div className="grid-2">
                        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
                    </div>
                </div>
            </section>

            {/* OUR DIFFERENCE SECTION */}
            <section className={styles.diffSection}>
                <div className="container">
                    <h2>Why Professionals Choose Us</h2>
                    <div className={styles.benefitsGrid}>
                        <div className={styles.benefit}>
                            <div className={styles.benefitIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <strong>Corporate-Tested Tracks</strong>
                                <p>Learn exactly what enterprise companies demand, bypassing outdated academic theory.</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <div className={styles.benefitIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <strong>Immediate Practical Use</strong>
                                <p>Apply what you learn today to your job tomorrow. No waiting for graduation.</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <div className={styles.benefitIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <strong>Small Cohorts</strong>
                                <p>Get personalized attention and dedicated feedback from instructors who know your name.</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <div className={styles.benefitIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <strong>Structured Learning</strong>
                                <p>Step-by-step guidance so you never feel lost or overwhelmed.</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <div className={styles.benefitIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <strong>Real-World Application</strong>
                                <p>Build a portfolio of actual projects, not just multiple-choice quizzes.</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <div className={styles.benefitIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <strong>Community Support</strong>
                                <p>Join a network of driven professionals across Malaysia and Indonesia.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE 3-MINUTE ENROLLMENT */}
            <section className={styles.enrollStepsSection} id="enroll">
                <div className="container">
                    <h2>Start Your Journey Today</h2>
                    <p className={styles.enrollSubtitle}>No long forms. Instant access. Enroll in just 3 minutes.</p>

                    <div className={styles.stepsWrapper}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <h3>Choose</h3>
                            <p>Select the path that matches your career goals or let our advisors guide you.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <h3>Commit</h3>
                            <p>Lock in your spot before the cohort fills up. A fast, secure checkout stands between you and your next career leap.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <h3>Start</h3>
                            <p>Get instant access to your student dashboard and community immediately.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUR VISION & FOUNDERS */}
            <section className={styles.visionFounders}>
                <div className="container">
                    <div className={styles.visionStatement}>
                        <h2>Our Vision</h2>
                        <blockquote>
                            "We believe education must move at the speed of the world. GDI FutureWorks was built to eliminate the noise and deliver the high-impact skills that professionals actually need to thrive."
                        </blockquote>
                    </div>

                    <div className={styles.foundersTeam}>
                        <div className={styles.founder}>
                            <img src="/team/feonna.png" alt="Feonna Watford" className={styles.founderImg} />
                            <h3>Feonna Watford</h3>
                            <p className={styles.role}>Co-Founder</p>
                            <p className={styles.bio}>With over 20 years of corporate leadership in digital transformation and operations, Feonna builds the systems that ensure our training delivers measurable career impact.</p>
                        </div>

                        <div className={styles.founder}>
                            <img src="/team/sergei.png" alt="Sergei Bandurka" className={styles.founderImg} />
                            <h3>Sergei Bandurka</h3>
                            <p className={styles.role}>Co-Founder</p>
                            <p className={styles.bio}>A veteran in corporate strategy and tech execution, Sergei brings two decades of experience designing programs that empower organizations and individuals to lead their industries.</p>
                        </div>
                    </div>

                    <p className={styles.combinedExpertise}>Together, they bring over 40 years of combined Fortune 500-level strategy and execution directly to your screen, actively building and refining the platform you use today.</p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className={styles.finalCta}>
                <div className="container">
                    <h2>The future will not slow down.<br />But you can move ahead of it.</h2>
                    <p>Join hundreds of professionals across Southeast Asia who are transforming their careers today.</p>

                    <div className={styles.ctaAction}>
                        <a href="#courses" className={styles.btnPrimaryWhite}>Enrol in 3 Minutes &rarr;</a>
                        <p className={styles.guarantee}><span style={{ fontSize: '1.25rem' }}>🔒</span> 100% satisfaction guarantee | Instant access</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
