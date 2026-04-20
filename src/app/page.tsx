import { Metadata } from 'next';
import { cookies } from 'next/headers';
import HomeClient from './HomeClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = cookieStore.get('GDI_LANG')?.value === 'id' ? 'id' : 'en';
    const isID = lang === 'id';

    const title = isID
        ? 'Kursus IT Online Terbaik Indonesia | GDI FutureWorks — Bootcamp Live Interaktif'
        : 'GDI FutureWorks — IT Courses That Get You Hired';

    const description = isID
        ? 'Bootcamp IT live online untuk pemula & profesional. Belajar Python, Data Analytics, AI & Desain Grafis dengan mentor ahli bersertifikat. Mulai dari Rp 400.000. Garansi kepuasan 100%.'
        : 'Live online IT courses led by industry professionals. Learn data analytics, Python, AI, and graphic design. Build real projects. Start your tech career faster.';

    const keywords = isID
        ? 'Kursus IT online Indonesia, Bootcamp coding Indonesia terbaik, Belajar Python online, Kursus data analytics bersertifikat, Pelatihan AI untuk pemula, Kursus desain grafis AI, Bootcamp live interaktif, Kursus programming dari nol, Upskilling IT profesional, GDI FutureWorks'
        : 'IT courses online, data analytics bootcamp, Python for beginners, AI course, live online training, Southeast Asia, Indonesia, tech career';

    const url = 'https://gdifuture.works';
    const ogImage = 'https://gdifuture.works/assets/og-courses-premium.png';

    return {
        title,
        description,
        keywords,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: 'GDI FutureWorks',
            type: 'website',
            images: [{ url: ogImage, width: 1200, height: 630, alt: 'GDI FutureWorks — Kursus IT Online Terbaik Indonesia' }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
        },
    };
}

export default async function Page() {
    const cookieStore = await cookies();
    const lang = cookieStore.get('GDI_LANG')?.value === 'id' ? 'id' : 'en';
    const isID = lang === 'id';

    // ── JSON-LD: Organization ──────────────────────────────────────────────────
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'GDI FutureWorks',
        url: 'https://gdifuture.works',
        logo: 'https://gdifuture.works/logo.png',
        description: isID
            ? 'Platform bootcamp IT live online untuk profesional dan pemula di Indonesia dan Asia Tenggara.'
            : 'Live online IT bootcamp for professionals and beginners across Indonesia and Southeast Asia.',
        foundingDate: '2023',
        areaServed: ['Indonesia', 'Malaysia', 'Singapore', 'Southeast Asia'],
        knowsLanguage: ['id', 'en'],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['Indonesian', 'English'],
            contactOption: 'TollFree',
        },
        sameAs: [
            'https://wa.me/628211704707',
        ],
    };

    // ── JSON-LD: WebSite ───────────────────────────────────────────────────────
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'GDI FutureWorks',
        url: 'https://gdifuture.works',
        inLanguage: [lang],
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://gdifuture.works/courses?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };

    // ── JSON-LD: ItemList (Courses) ────────────────────────────────────────────
    const courseListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: isID ? 'Kursus IT Live Online — GDI FutureWorks' : 'Live IT Courses — GDI FutureWorks',
        description: isID
            ? 'Program bootcamp online live interaktif di bidang Data Analytics, Python, AI, dan Desain Grafis'
            : 'Live interactive online bootcamp programs in Data Analytics, Python, AI, and Graphic Design',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                item: {
                    '@type': 'Course',
                    name: isID ? 'Analis Data Dasar: Bootcamp Data Analytics Terbaik' : 'Basic Data Analyst: Data Analytics Bootcamp',
                    description: isID
                        ? 'Belajar Python, Pandas, dan visualisasi data dalam sesi live interaktif. Sertifikat resmi. Mulai Rp 400.000.'
                        : 'Learn Python, Pandas, and data visualization in live sessions. Official certificate.',
                    url: 'https://gdifuture.works/courses/data-analytics',
                    provider: { '@type': 'Organization', name: 'GDI FutureWorks' },
                    offers: { '@type': 'Offer', price: isID ? '400000' : '49', priceCurrency: isID ? 'IDR' : 'USD' },
                },
            },
            {
                '@type': 'ListItem',
                position: 2,
                item: {
                    '@type': 'Course',
                    name: isID ? 'Python untuk Pemula: Bootcamp Programming Online' : 'Python for Beginners: Online Programming Bootcamp',
                    description: isID
                        ? 'Otomatiskan tugas harian dengan Python. Cocok untuk pemula tanpa latar belakang coding.'
                        : 'Automate daily tasks with Python. Perfect for complete beginners.',
                    url: 'https://gdifuture.works/courses/python-programming',
                    provider: { '@type': 'Organization', name: 'GDI FutureWorks' },
                    offers: { '@type': 'Offer', price: isID ? '400000' : '49', priceCurrency: isID ? 'IDR' : 'USD' },
                },
            },
            {
                '@type': 'ListItem',
                position: 3,
                item: {
                    '@type': 'Course',
                    name: isID ? 'Desain Grafis dengan AI: Kursus Design Online' : 'Graphic Design with AI: Online Design Course',
                    description: isID
                        ? 'Kuasai Midjourney, DALL-E, dan Adobe Firefly. Buat visual profesional dengan kecerdasan buatan.'
                        : 'Master Midjourney, DALL-E, and Adobe Firefly. Create professional visuals using AI.',
                    url: 'https://gdifuture.works/courses/graphic-design-ai',
                    provider: { '@type': 'Organization', name: 'GDI FutureWorks' },
                    offers: { '@type': 'Offer', price: isID ? '400000' : '49', priceCurrency: isID ? 'IDR' : 'USD' },
                },
            },
            {
                '@type': 'ListItem',
                position: 4,
                item: {
                    '@type': 'Course',
                    name: isID ? 'Rekayasa LLM & AI: Bootcamp AI Engineering' : 'LLM & AI Engineering Bootcamp',
                    description: isID
                        ? 'Bangun aplikasi AI menggunakan OpenAI API dan LangChain. Untuk developer dan product manager.'
                        : 'Build AI applications using OpenAI API and LangChain. For developers and product managers.',
                    url: 'https://gdifuture.works/courses/llm-ai-engineering',
                    provider: { '@type': 'Organization', name: 'GDI FutureWorks' },
                    offers: { '@type': 'Offer', price: isID ? '400000' : '49', priceCurrency: isID ? 'IDR' : 'USD' },
                },
            },
        ],
    };

    // ── JSON-LD: FAQPage ───────────────────────────────────────────────────────
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: isID ? [
            {
                '@type': 'Question',
                name: 'Apakah kursus ini cocok untuk pemula total?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ya — tidak perlu pengalaman sebelumnya. Instruktur membangun dari dasar. Jika kamu bisa menggunakan komputer, kamu bisa mengikutinya.',
                },
            },
            {
                '@type': 'Question',
                name: 'Berapa banyak waktu yang dibutuhkan untuk menyelesaikan kursus?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Hanya 4 jam total — 2 sesi masing-masing 2 jam. Kebanyakan peserta menyelesaikan kursus dalam 2 akhir pekan. Dirancang agar sesuai dengan jadwal pekerjaan kamu.',
                },
            },
            {
                '@type': 'Question',
                name: 'Apakah saya akan benar-benar siap kerja setelah kursus ini?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Setiap pelajaran dan proyek dibangun berdasarkan apa yang diuji manajer rekrutmen — alat nyata, alur kerja nyata, hasil nyata.',
                },
            },
            {
                '@type': 'Question',
                name: 'Apakah ada garansi uang kembali?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '100% ya. Hadiri sesi pertama dan jika tidak puas, kami kembalikan uangmu sepenuhnya — tanpa pertanyaan.',
                },
            },
            {
                '@type': 'Question',
                name: 'Siapa instruktur GDI FutureWorks?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Semua instruktur memegang jabatan senior aktif di perusahaan teknologi terkemuka seperti Google, Microsoft, Tokopedia, dan Gojek. Mereka mengajarkan apa yang mereka gunakan di tempat kerja hari ini.',
                },
            },
        ] : [
            {
                '@type': 'Question',
                name: 'Is this suitable for complete beginners?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes — no prior experience needed. Instructors build from the ground up. If you can use a computer, you can follow along.',
                },
            },
            {
                '@type': 'Question',
                name: 'How much time do I need per week?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Just 4 hours total — 2 sessions of 2 hours each. Most students finish over 2 weekends. Designed to fit around your current job.',
                },
            },
            {
                '@type': 'Question',
                name: 'Will I actually become job-ready?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Every lesson and project is built around what hiring managers test in interviews — real tools, real workflows, real deliverables.',
                },
            },
            {
                '@type': 'Question',
                name: 'Is there a money-back guarantee?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: '100% yes. Attend your first session and if you\'re not satisfied, we refund in full — no questions asked.',
                },
            },
            {
                '@type': 'Question',
                name: 'Who are the instructors?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'All instructors hold active senior roles at companies like Google, Microsoft, Tokopedia, and Gojek. They teach what they use at work today.',
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseListSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <HomeClient />
        </>
    );
}

