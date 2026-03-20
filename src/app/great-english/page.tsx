import { Metadata } from 'next';
import Link from 'next/link';
import EnrollButton from '@/components/EnrollButton';
import { Translate } from '@/components/ClientTranslations';
import PriceBadge from '@/components/PriceBadge';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Great English (iTTi) — GDI FutureWorks',
    description: 'Get TEFL / TESOL certified and travel the world with Great English and iTTi.',
};

export default function GreatEnglishPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.heroLayout}>
                        <div className={styles.heroContent}>
                            <p className="section-label">International Partnership</p>
                            <h1 className={styles.heroTitle}>Great English <br />& iTTi</h1>
                            <p className={styles.heroSubtitle}>
                                GET TEFL/TESOL CERTIFIED AND TRAVEL THE WORLD! iTTi offers the gold standard in TEFL certification for teaching English abroad. We are proud to offer you the finest internationally accredited TEFL-classes online.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">

                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <h3>Authentication</h3>
                            <p>Our accreditation certificate is officially authenticated by the U.S. government with a notary public seal and signatures, ensuring its validity in all Hague Convention countries. This streamlined process guarantees your credential is universally recognized, so you can pursue teaching opportunities worldwide with confidence.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Support</h3>
                            <p>We help non-native English speakers bring out their best. If you can dream it, you can achieve it. One of our non-native English-speaking graduates works in the public school system of Stockholm, Sweden. Our graduate from Venezuela was hired by a U.S. public school to work in South Carolina. A Brazilian graduate opened her own English school in Brazil and operates it successfully.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Quality</h3>
                            <p>We as the official partner of International TEFL Training Institute understand that and deliver an excellent, demanding training experience for the serious teacher trainee. We take pride in providing schools with enthusiastic teaching professionals who demonstrate clear leadership qualities, excellence in professional knowledge and love and commitment to the teaching profession.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Practicum</h3>
                            <p>Unlike organizations that send trainees to community centers and have them observed by any teacher that is willing to observe them, our trainees can be certain to receive expert guidance during teaching practice. Here is the reason why our graduates are so successful in the industry. You cannot replace the expertise of a TEFL trainer by any teacher.</p>
                        </div>
                    </div>

                    <h2 className={styles.sectionTitle}>iTTi On-Line Programs</h2>

                    <div className={styles.productGrid}>

                        {/* Certifications Category */}
                        <div className={styles.categoryCol}>
                            <h3 className={styles.catTitle}>On-line TESOL Certification</h3>

                            <div className={styles.courseCard}>
                                <h4>120-Hour TEFL Certification (With Tutor)</h4>
                                <ul>
                                    <li><strong>Duration:</strong> 4 weeks</li>
                                    <li><strong>Fee:</strong> <PriceBadge priceIDR={6720000} priceMYR={1980} /></li>
                                </ul>
                                <EnrollButton courseId="tefl-120-tutor" courseName="120-Hour TEFL Certification (With Tutor)" price={350} />
                            </div>

                            <div className={styles.courseCard}>
                                <h4>120-Hour TEFL Certification (Without Tutor)</h4>
                                <ul>
                                    <li><strong>Duration:</strong> 2 weeks</li>
                                    <li><strong>Fee:</strong> <PriceBadge priceIDR={4512000} priceMYR={1320} /></li>
                                </ul>
                                <EnrollButton courseId="tefl-120-notutor" courseName="120-Hour TEFL Certification (Without Tutor)" price={235} />
                            </div>

                            <div className={styles.courseCard}>
                                <h4>220-Hour Master TEFL Certification</h4>
                                <ul>
                                    <li><strong>Duration:</strong> 6–8 weeks</li>
                                    <li><strong>Fee:</strong> <PriceBadge priceIDR={7656000} priceMYR={2250} /></li>
                                </ul>
                                <EnrollButton courseId="tefl-220-master" courseName="220-Hour Master TEFL Certification" price={399} />
                            </div>
                        </div>

                        {/* Specializations Category */}
                        <div className={styles.categoryCol}>
                            <h3 className={styles.catTitle}>iTTi Specialization Programs</h3>

                            <div className={styles.courseCard}>
                                <h4>50-Hour TOEFL / IELTS Specialization</h4>
                                <ul>
                                    <li><strong>Duration:</strong> 2 weeks</li>
                                    <li><strong>Fee:</strong> <PriceBadge priceIDR={2688000} priceMYR={792} /></li>
                                </ul>
                                <EnrollButton courseId="tefl-50-toefl" courseName="50-Hour TOEFL / IELTS Specialization" price={140} />
                            </div>

                            <div className={styles.courseCard}>
                                <h4>50-Hour Teach Young Learners</h4>
                                <ul>
                                    <li><strong>Duration:</strong> 1 week</li>
                                    <li><strong>Fee:</strong> <PriceBadge priceIDR={1824000} priceMYR={540} /></li>
                                </ul>
                                <EnrollButton courseId="tefl-50-young" courseName="50-Hour Teach Young Learners" price={95} />
                            </div>

                            <div className={styles.courseCard}>
                                <h4>50-Hour Teach Business English</h4>
                                <ul>
                                    <li><strong>Duration:</strong> 1 week</li>
                                    <li><strong>Fee:</strong> <PriceBadge priceIDR={1824000} priceMYR={540} /></li>
                                </ul>
                                <EnrollButton courseId="tefl-50-biz" courseName="50-Hour Teach Business English" price={95} />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
