import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Privacy Policy — GDI FutureWorks',
    description: 'Learn how GDI FutureWorks collects, uses, and protects your personal data in accordance with Indonesian data protection law (UU PDP) and international standards.',
    alternates: { canonical: 'https://gdifuture.works/privacy' },
    openGraph: {
        title: 'Privacy Policy — GDI FutureWorks',
        description: 'How we collect, use, and protect your personal data.',
        url: 'https://gdifuture.works/privacy',
        siteName: 'GDI FutureWorks',
    },
};

const sections = [
    {
        title: '1. Who We Are',
        content: `GDI FutureWorks is operated by PT Global Digital Informasi, a technology education company based in Indonesia. We provide live online IT courses to students across Southeast Asia.

Contact: hello@gdifuture.works | gdifuture.works`,
    },
    {
        title: '2. What Data We Collect',
        content: `We collect the following types of personal data:

**When you enroll or register:**
- Full name
- Email address
- WhatsApp / phone number
- Country of residence
- Payment information (processed securely via third parties)

**When you use our website:**
- Browser type and device information
- Pages visited and time spent
- IP address (anonymised)
- Cookie identifiers

**When you apply as a tutor:**
- Professional background, LinkedIn profile, and video introduction`,
    },
    {
        title: '3. How We Use Your Data',
        content: `We use your data only for the following purposes:

- To process your course enrollment and confirm booking
- To send you session links and course materials via WhatsApp/email
- To issue your certificate of completion
- To improve our courses and website experience
- To send relevant updates about new courses (you can opt out at any time)
- To comply with legal obligations`,
    },
    {
        title: '4. Cookies & Tracking Technologies',
        content: `Our website uses the following tracking technologies:

**Google Analytics (G-HJ7BSBB2SF):** Measures website traffic and user behaviour. Data is anonymised and aggregated. You can opt out via Google's opt-out tool.

**Meta Pixel (933830285795477):** Used to measure the effectiveness of our advertising on Facebook and Instagram, and to show relevant ads to people who have visited our site. We do not share your personal details with Meta — only anonymised event data.

You can manage or disable cookies at any time via your browser settings or by using the Google Analytics Opt-out Add-on.`,
    },
    {
        title: '5. Data Sharing',
        content: `We do not sell your personal data. We may share data with:

- **Payment processors** (to complete transactions)
- **Google** (Analytics, authentication)
- **Meta** (advertising measurement via Pixel)
- **WhatsApp/Twilio** (to send session links)
- **Law enforcement** if required by Indonesian law (UU PDP No. 27/2022)

All third-party providers are contractually bound to protect your data and may not use it for any other purpose.`,
    },
    {
        title: '6. Data Retention',
        content: `We retain your personal data for as long as necessary to provide our services and comply with legal requirements:

- **Enrollment records:** 5 years (tax compliance)
- **Website analytics:** 26 months (Google Analytics default)
- **Email/WhatsApp communication:** until you request deletion

You may request deletion of your data at any time by contacting us.`,
    },
    {
        title: '7. Your Rights',
        content: `Under Indonesian law (UU PDP) and applicable international standards, you have the right to:

- **Access** the personal data we hold about you
- **Correct** inaccurate or incomplete data
- **Delete** your data ("right to be forgotten")
- **Withdraw consent** at any time without affecting prior processing
- **Object** to data processing for marketing purposes
- **Data portability** — receive your data in a structured format

To exercise any of these rights, contact us at: hello@gdifuture.works`,
    },
    {
        title: '8. Data Security',
        content: `We implement appropriate technical and organisational measures to protect your data, including:

- HTTPS encryption on all pages
- Secure database storage with access controls
- Limited internal access on a need-to-know basis
- Regular security reviews

No method of transmission over the internet is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.`,
    },
    {
        title: '9. Children\'s Privacy',
        content: `Our services are not directed to individuals under the age of 17. We do not knowingly collect personal data from minors. If you believe a minor has submitted data through our platform, please contact us immediately and we will delete it.`,
    },
    {
        title: '10. Changes to This Policy',
        content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. For significant changes, we will notify enrolled students via email or WhatsApp.

We encourage you to review this policy periodically.`,
    },
    {
        title: '11. Contact Us',
        content: `If you have questions about this Privacy Policy or how we handle your data, please contact:

PT Global Digital Informasi
Email: hello@gdifuture.works
Website: https://gdifuture.works
WhatsApp: +62 821-1704-707`,
    },
];

export default function PrivacyPage() {
    const lastUpdated = 'April 7, 2026';

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <div className="container">
                    <p className="section-label">Legal</p>
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.subtitle}>
                        We are committed to protecting your personal data and being transparent about how we use it.
                    </p>
                    <div className={styles.meta}>
                        <span>Last updated: <strong>{lastUpdated}</strong></span>
                        <span className={styles.dot}>·</span>
                        <span>Effective: <strong>{lastUpdated}</strong></span>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className={styles.content}>
                <div className="container">
                    <div className={styles.layout}>
                        {/* Table of Contents */}
                        <aside className={styles.toc}>
                            <p className={styles.tocTitle}>Contents</p>
                            <nav>
                                {sections.map((s, i) => (
                                    <a key={i} href={`#section-${i}`} className={styles.tocLink}>
                                        {s.title}
                                    </a>
                                ))}
                            </nav>
                        </aside>

                        {/* Sections */}
                        <div className={styles.body}>
                            {sections.map((s, i) => (
                                <div key={i} id={`section-${i}`} className={styles.section}>
                                    <h2 className={styles.sectionTitle}>{s.title}</h2>
                                    <div className={styles.sectionBody}>
                                        {s.content.split('\n\n').map((block, j) => {
                                            if (block.startsWith('**') && block.endsWith('**')) {
                                                return null;
                                            }
                                            // Render bold inline text
                                            const rendered = block.split(/(\*\*[^*]+\*\*)/).map((part, k) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={k}>{part.slice(2, -2)}</strong>;
                                                }
                                                return part;
                                            });

                                            if (block.startsWith('- ') || block.includes('\n- ')) {
                                                const items = block.split('\n').filter(l => l.startsWith('- '));
                                                return (
                                                    <ul key={j} className={styles.list}>
                                                        {items.map((item, k) => (
                                                            <li key={k}>{item.slice(2).split(/(\*\*[^*]+\*\*)/).map((part, m) =>
                                                                part.startsWith('**') && part.endsWith('**')
                                                                    ? <strong key={m}>{part.slice(2, -2)}</strong>
                                                                    : part
                                                            )}</li>
                                                        ))}
                                                    </ul>
                                                );
                                            }

                                            return <p key={j} className={styles.para}>{rendered}</p>;
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* CTA */}
                            <div className={styles.cta}>
                                <p>Have a question about your data?</p>
                                <a href="mailto:hello@gdifuture.works" className={styles.ctaBtn}>
                                    Contact Us → hello@gdifuture.works
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
