import { Metadata } from 'next';
import styles from './page.module.css';
import WhatsAppTrackedLink from '@/components/WhatsAppTrackedLink';

export const metadata: Metadata = {
    title: 'Data Deletion Instructions — GDI FutureWorks',
    description: 'How to request deletion of your personal data from GDI FutureWorks systems.',
    alternates: { canonical: 'https://gdifuture.works/data-deletion' },
};

export default function DataDeletionPage() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className="container">
                    <p className="section-label">Your Rights</p>
                    <h1 className={styles.title}>Data Deletion Request</h1>
                    <p className={styles.subtitle}>
                        You have the right to request deletion of your personal data from GDI FutureWorks at any time.
                    </p>
                </div>
            </section>

            <section className={styles.content}>
                <div className="container">
                    <div className={styles.singleColumn}>

                        <div className={styles.card}>
                            <div className={styles.cardIcon}>🗑️</div>
                            <h2>What gets deleted</h2>
                            <p>Upon a verified deletion request, we will permanently remove:</p>
                            <ul>
                                <li>Your name, email address, and phone number</li>
                                <li>Your enrollment records and course history</li>
                                <li>Any messages or communications stored on our platform</li>
                                <li>Your account if one was created via Google Sign-In</li>
                            </ul>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardIcon}>⚠️</div>
                            <h2>What we may retain</h2>
                            <p>Some data may be retained for legal or financial compliance purposes:</p>
                            <ul>
                                <li>Payment transaction records (required for tax compliance — up to 5 years)</li>
                                <li>Anonymised, non-identifiable usage statistics</li>
                            </ul>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardIcon}>📧</div>
                            <h2>How to submit a request</h2>
                            <p>Send a deletion request to us using any of the following methods:</p>
                            <div className={styles.methods}>
                                <a href="mailto:support@gdifuture.works?subject=Data Deletion Request" className={styles.methodBtn}>
                                    <span className={styles.methodIcon}>✉️</span>
                                    <div>
                                        <strong>Email</strong>
                                        <span>support@gdifuture.works</span>
                                    </div>
                                </a>
                                <WhatsAppTrackedLink
                                    href="https://wa.me/628211704707?text=Hi%2C%20I%20would%20like%20to%20request%20deletion%20of%20my%20personal%20data%20from%20GDI%20FutureWorks."
                                    eventSource="data_deletion_wa"
                                    className={styles.methodBtn}
                                >
                                    <span className={styles.methodIcon}>💬</span>
                                    <div>
                                        <strong>WhatsApp</strong>
                                        <span>+62 821-1704-707</span>
                                    </div>
                                </WhatsAppTrackedLink>
                            </div>
                            <p className={styles.note}>
                                Please include your <strong>registered email address</strong> in your request so we can identify and delete your data. We will confirm deletion within <strong>14 business days</strong>.
                            </p>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardIcon}>🔗</div>
                            <h2>Facebook / Meta data</h2>
                            <p>
                                Our website uses the Meta Pixel (ID: 933830285795477) to measure advertising performance.
                                Meta may have received anonymised event data (e.g. page visits) associated with your browser.
                            </p>
                            <p>
                                To delete data held by Meta directly, visit{' '}
                                <a
                                    href="https://www.facebook.com/help/contact/1573521972625163"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.link}
                                >
                                    Facebook&apos;s Data Deletion Tool →
                                </a>
                            </p>
                        </div>

                        <div className={styles.backLinks}>
                            <a href="/privacy" className={styles.backLink}>← Privacy Policy</a>
                            <a href="/terms" className={styles.backLink}>Terms of Service →</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
