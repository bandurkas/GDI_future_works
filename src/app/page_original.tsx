
import { Metadata } from 'next';
import { courses } from '@/data/courses';
import CourseCard from '@/components/CourseCard';
import Link from 'next/link';
import Image from 'next/image';
import { Translate, ClientPrice } from '@/components/ClientTranslations';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'All Courses — GDI FutureWorks',
    description: 'Browse live IT courses: Data Analytics, Python, AI Design, LLM Engineering.',
};

const categories = [
    { icon: '/assets/icons/data.png', name: 'Data Analytics' },
    { icon: '/assets/icons/python.png', name: 'Python\nProgramming' },
    { icon: '/assets/icons/design.png', name: 'Graphic Design & AI' },
    { icon: '/assets/icons/llm.png', name: 'LLM & AI\nEngineering' },
];

export default function CoursesPage() {
    return (
        <div className={styles.page}>
            <section className={styles.header}>
                <div className="container">
                    <div className={styles.sliderCard}>
                        {/* Text Content */}
                        <div className={styles.sliderContent}>
                            <div className={styles.sliderTopIndicators}>
                                <div className={`${styles.indicator} ${styles.indicatorActive} `} />
                                <div className={styles.indicator} />
                                <div className={styles.indicator} />
                            </div>
                            <h1 className={styles.sliderTitle}>Choose your path<br />into tech.</h1>
                            <p className={styles.sliderDesc}>
                                Short, practical live courses designed to give you real skills fast — taught by industry professionals.
                            </p>
                            <button className={styles.sliderBtn}>Explore Courses</button>
                        </div>

                        {/* Image overlay */}
                        <div className={styles.sliderImageWrap}>
                            <Image src="/assets/course_hero.png" alt="Tech workspace with laptop" fill className={styles.sliderImage} priority unoptimized />
                        </div>

                        {/* Arrow Controls */}
                        <div className={styles.sliderControls}>
                            <button className={styles.sliderArrow}>‹</button>
                            <button className={styles.sliderArrow}>›</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Region Operation */}
            <section className={styles.regionSection}>
                <div className="container">
                    <div className={styles.regionCard}>
                        <div className={styles.regionText}>
                            <h2>Proudly Operating in Southeast Asia</h2>
                            <p>We are a localized tech and education hub with active student communities and reliable tech enterprise partnerships.</p>
                        </div>
                        <div className={styles.regionFlags}>
                            <div className={styles.flagItem}>
                                <div className={styles.flagIcon}>🇮🇩</div>
                                <span>Indonesia</span>
                            </div>
                            <div className={styles.flagItem}>
                                <div className={styles.flagIcon}>🇲🇾</div>
                                <span>Malaysia</span>
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
            <section className="section-sm">
                <div className="container">
                    <p className={styles.count}>{courses.length} courses available</p>
                    <div className="grid-2" style={{ marginTop: 'var(--space-6)' }}>
                        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
                    </div>
                </div>
            </section>
            <section className={styles.bottomHelp}>
                <div className="container">
                    <div className={styles.helpBox}>
                        <div>
                            <h3 className={styles.helpTitle}>Not sure which course is right for you?</h3>
                            <p className={styles.helpDesc}>Our advisors will match you to the perfect course based on your goals.</p>
                        </div>
                        <Link href="/contact" className="btn btn-primary">Talk to Advisor →</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
