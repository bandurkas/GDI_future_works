import { Metadata } from 'next';
import styles from '../privacy/page.module.css';

export const metadata: Metadata = {
    title: 'Terms of Service — GDI FutureWorks',
    description: 'Terms and conditions for enrolling in GDI FutureWorks courses. Please read before purchasing.',
    alternates: { canonical: 'https://gdifuture.works/terms' },
    openGraph: {
        title: 'Terms of Service — GDI FutureWorks',
        description: 'Terms and conditions for enrolling in GDI FutureWorks courses.',
        url: 'https://gdifuture.works/terms',
        siteName: 'GDI FutureWorks',
    },
};

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: `By enrolling in any course offered by GDI FutureWorks (operated by PT Global Digital Informasi), you agree to be bound by these Terms of Service. If you do not agree, please do not proceed with enrollment.

These terms apply to all students, tutor applicants, and visitors of gdifuture.works.`,
    },
    {
        title: '2. Course Enrollment',
        content: `Enrollment is confirmed only upon receipt of full payment. A WhatsApp confirmation message will be sent to your registered number within 2 hours of payment.

**Seat availability:** Courses are limited to a maximum of 12 students per cohort. Enrollment is on a first-paid, first-served basis.

**Session links:** Your Zoom/Google Meet session link will be sent via WhatsApp at least 30 minutes before the first session.`,
    },
    {
        title: '3. Payment',
        content: `All prices are listed in Indonesian Rupiah (IDR) or Malaysian Ringgit (MYR) depending on your region. Prices are inclusive of all course materials.

**Accepted payment methods:** QRIS, bank transfer, PayPal, and other methods displayed at checkout.

**Payment confirmation:** If payment is not automatically confirmed within 1 hour, please send your payment receipt to our WhatsApp: +62 821-1704-707.

All payments are processed securely. GDI FutureWorks does not store card or bank account details.`,
    },
    {
        title: '4. Refund Policy',
        content: `**Full refund:** Available if requested at least 48 hours before the first session starts.

**Partial refund (50%):** Available if requested between 24–48 hours before the first session.

**No refund:** Requests made less than 24 hours before the session, or after the session has started, are not eligible for a refund.

To request a refund, contact us via WhatsApp or email at hello@gdifuture.works with your order ID and reason. Refunds are processed within 5–7 business days.`,
    },
    {
        title: '5. Rescheduling',
        content: `If you are unable to attend a scheduled session, you may request to reschedule to another available cohort date, subject to availability.

Rescheduling requests must be made at least 12 hours before the session starts. Contact us via WhatsApp: +62 821-1704-707.

Students may reschedule a maximum of **1 time** per enrollment.`,
    },
    {
        title: '6. Course Content & Certificates',
        content: `**Course materials** (slides, recorded summaries, and project templates) are provided for personal learning purposes only and may not be redistributed or sold.

**Certificates** are issued upon completion of all required sessions and the portfolio project. Digital certificates are provided in PDF format and are verifiable via a unique code.

GDI FutureWorks reserves the right to update course content without prior notice to maintain relevance to industry standards.`,
    },
    {
        title: '7. Student Conduct',
        content: `Students are expected to:

- Attend sessions on time and participate respectfully
- Not record, screenshot, or distribute live sessions without prior written consent
- Not engage in disruptive, abusive, or discriminatory behaviour
- Use course materials for personal learning only

GDI FutureWorks reserves the right to remove a student from a session or cancel their enrollment without a refund if these conduct standards are violated.`,
    },
    {
        title: '8. Intellectual Property',
        content: `All course content, materials, branding, and website content are the intellectual property of PT Global Digital Informasi. You may not reproduce, distribute, or create derivative works from any GDI FutureWorks content without explicit written permission.

Student-created portfolio projects remain the property of the student.`,
    },
    {
        title: '9. Limitation of Liability',
        content: `GDI FutureWorks provides courses for educational purposes. We do not guarantee specific employment outcomes, salary increases, or career results following course completion.

To the extent permitted by law, GDI FutureWorks shall not be liable for:
- Indirect or consequential losses
- Technical issues outside our control (internet outages, third-party platform downtime)
- Loss of data or business opportunities

Our total liability to you shall not exceed the amount you paid for the course.`,
    },
    {
        title: '10. Privacy',
        content: `Your personal data is handled in accordance with our Privacy Policy, available at gdifuture.works/privacy. By enrolling, you consent to the collection and use of your data as described therein.`,
    },
    {
        title: '11. Changes to Terms',
        content: `We reserve the right to update these Terms at any time. Changes will be posted on this page with an updated date. Continued use of our services after changes constitutes acceptance of the new terms.

For significant changes, we will notify enrolled students via email or WhatsApp.`,
    },
    {
        title: '12. Governing Law',
        content: `These Terms are governed by the laws of the Republic of Indonesia. Any disputes shall be subject to the jurisdiction of the courts of Indonesia.

For disputes, we encourage first attempting resolution via direct communication at hello@gdifuture.works.`,
    },
    {
        title: '13. Contact',
        content: `PT Global Digital Informasi
Email: hello@gdifuture.works
WhatsApp: +62 821-1704-707
Website: https://gdifuture.works`,
    },
];

export default function TermsPage() {
    const lastUpdated = 'April 7, 2026';

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <div className="container">
                    <p className="section-label">Legal</p>
                    <h1 className={styles.title}>Terms of Service</h1>
                    <p className={styles.subtitle}>
                        Please read these terms carefully before enrolling in any GDI FutureWorks course.
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
                                            const rendered = block.split(/(\*\*[^*]+\*\*)/).map((part, k) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={k}>{part.slice(2, -2)}</strong>;
                                                }
                                                return part;
                                            });
                                            return <p key={j} className={styles.para}>{rendered}</p>;
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* CTA */}
                            <div className={styles.cta}>
                                <p>Questions about these terms?</p>
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
