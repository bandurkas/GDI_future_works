import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/data/courses';
import PrintTrigger from './PrintTrigger';
import styles from './syllabus.module.css';

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ print?: string; lang?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function SyllabusPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { print, lang } = await searchParams;
    const course = getCourseBySlug(slug);
    if (!course) notFound();

    const isID = lang === 'id';
    const title = isID ? (course.titleID || course.title) : course.title;
    const subtitle = isID ? (course.subtitleID || course.subtitle) : course.subtitle;
    const description = isID ? (course.descriptionID || course.description) : course.description;
    const outcomes = isID ? (course.outcomesID || course.outcomes) : course.outcomes;
    const whoFor = isID ? (course.whoForID || course.whoFor) : course.whoFor;
    const whatYouGet = isID ? (course.whatYouGetID || course.whatYouGet) : course.whatYouGet;
    const whyWorthIt = isID ? (course.whyWorthItID || course.whyWorthIt) : course.whyWorthIt;
    const duration = isID ? (course.durationID || course.duration) : course.duration;
    const syllabus = isID ? (course.syllabusDetailsID || course.syllabusDetails) : course.syllabusDetails;
    const instructor = isID ? (course.instructorID || course.instructor) : course.instructor;

    const labels = isID ? {
        syllabus: 'Silabus Kursus',
        format: 'Format',
        duration: 'Durasi',
        sessions: 'Sesi',
        whatYoullLearn: 'Yang Akan Kamu Pelajari',
        whoFor: 'Untuk Siapa Kursus Ini',
        whatYouGet: 'Yang Kamu Dapatkan',
        whyWorthIt: 'Kenapa Layak Diambil',
        project: 'Proyek Akhir',
        careerOutcomes: 'Peran Karier Setelah Lulus',
        instructor: 'Instruktur',
        printHint: 'Ctrl/Cmd + P untuk simpan sebagai PDF',
    } : {
        syllabus: 'Course Syllabus',
        format: 'Format',
        duration: 'Duration',
        sessions: 'Sessions',
        whatYoullLearn: "What You'll Learn",
        whoFor: 'Who This Is For',
        whatYouGet: 'What You Get',
        whyWorthIt: 'Why It’s Worth It',
        project: 'Final Project',
        careerOutcomes: 'Career Outcomes',
        instructor: 'Instructor',
        printHint: 'Ctrl/Cmd + P to save as PDF',
    };

    return (
        <div className={styles.page}>
            {print === '1' && <PrintTrigger />}

            <div className={styles.printBar}>
                <span>{labels.printHint}</span>
                <button onClick={() => typeof window !== 'undefined' && window.print()} className={styles.printBtn}>
                    Save as PDF
                </button>
            </div>

            <article className={styles.sheet}>
                <header className={styles.header}>
                    <div className={styles.brand}>GDI FutureWorks</div>
                    <div className={styles.sectionLabel}>{labels.syllabus}</div>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>
                    <div className={styles.meta}>
                        <span>{labels.format}: <strong>{course.format}</strong></span>
                        <span>{labels.duration}: <strong>{duration}</strong></span>
                    </div>
                </header>

                <section className={styles.section}>
                    <p className={styles.lead}>{description}</p>
                </section>

                {syllabus && syllabus.sessions.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.h2}>{labels.sessions}</h2>
                        {syllabus.sessions.map((s, i) => (
                            <div key={i} className={styles.sessionBlock}>
                                <h3 className={styles.h3}>{s.title}</h3>
                                <ul className={styles.list}>
                                    {s.items.map((item, j) => (<li key={j}>{item}</li>))}
                                </ul>
                            </div>
                        ))}
                    </section>
                )}

                <section className={styles.section}>
                    <h2 className={styles.h2}>{labels.whatYoullLearn}</h2>
                    <ul className={styles.list}>
                        {outcomes.map((o, i) => (<li key={i}>{o}</li>))}
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.h2}>{labels.whoFor}</h2>
                    <ul className={styles.list}>
                        {whoFor.map((w, i) => (<li key={i}>{w}</li>))}
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.h2}>{labels.whatYouGet}</h2>
                    <ul className={styles.list}>
                        {whatYouGet.map((w, i) => (<li key={i}>{w}</li>))}
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.h2}>{labels.whyWorthIt}</h2>
                    <ul className={styles.list}>
                        {whyWorthIt.map((w, i) => (<li key={i}>{w}</li>))}
                    </ul>
                </section>

                {syllabus?.project && (
                    <section className={styles.section}>
                        <h2 className={styles.h2}>{labels.project}</h2>
                        <p>{syllabus.project}</p>
                    </section>
                )}

                {syllabus?.careerOutcomes?.roles && syllabus.careerOutcomes.roles.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.h2}>{labels.careerOutcomes}</h2>
                        <ul className={styles.list}>
                            {syllabus.careerOutcomes.roles.map((r, i) => (<li key={i}>{r}</li>))}
                        </ul>
                    </section>
                )}

                {instructor && (
                    <section className={styles.section}>
                        <h2 className={styles.h2}>{labels.instructor}</h2>
                        <div className={styles.instructorCard}>
                            <div className={styles.instructorName}>{instructor.name}</div>
                            <div className={styles.instructorRole}>{instructor.role}{instructor.company ? ` · ${instructor.company}` : ''}</div>
                            {instructor.experience && <p className={styles.instructorExp}>{instructor.experience}</p>}
                            {instructor.credentials?.length > 0 && (
                                <ul className={styles.list}>
                                    {instructor.credentials.map((c, i) => (<li key={i}>{c}</li>))}
                                </ul>
                            )}
                        </div>
                    </section>
                )}

                <footer className={styles.footer}>
                    <div>gdifuture.works · /courses/{course.slug}</div>
                    <div>{new Date().toLocaleDateString(isID ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </footer>
            </article>
        </div>
    );
}
