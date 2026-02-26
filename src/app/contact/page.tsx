import { Metadata } from 'next';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Contact | GDI FutureWorks',
};

export default function ContactPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.heroLayout}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.headerTitle}>We're here to help.</h1>
                        <p className={styles.headerSubtitle}>Have a question, partnership idea, or need support? Pick your preferred way to reach us.</p>
                    </div>
                    <div className={styles.heroVisual}>
                        <Image src="/assets/info_contact.png" alt="Contact Us" width={400} height={400} unoptimized />
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.card}>
                    <div className={styles.iconWrap}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                            <path d="M2 6l10 7 10-7"></path>
                        </svg>
                    </div>

                    <div className={styles.badgeWrap}>
                        <div className={styles.badge}>&lt; 24h</div>
                    </div>

                    <h2 className={styles.title}>Email Us</h2>
                    <p className={styles.desc}>
                        For partnerships, corporate training, or general inquiries.
                    </p>

                    <a href="mailto:hello@gdieduhub.com" className={styles.button}>
                        Send Email
                    </a>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconWrap}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                    </div>

                    <div className={styles.badgeWrap}>
                        <div className={styles.badgeWhatsapp}>&lt; 2 min</div>
                    </div>

                    <h2 className={styles.title}>WhatsApp Us</h2>
                    <p className={styles.desc}>
                        Fastest way to reach us. Get an answer in under 2 minutes.
                    </p>

                    <a href="https://wa.me/62000000000" target="_blank" rel="noopener noreferrer" className={styles.buttonWhatsapp}>
                        Open WhatsApp
                    </a>
                </div>
            </main>
        </div>
    );
}
