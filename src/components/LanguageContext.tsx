'use client';
// Force re-compile for multi-currency refined state sync


import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // NAV
        'nav.courses': 'Courses',
        'nav.about': 'About',
        'nav.community': 'Community',
        'nav.contact': 'Contact',

        // BUTTONS
        'btn.enroll': 'Enroll Now',
        'btn.checkout': 'Proceed to Checkout',
        'btn.chat': 'Chat us',

        // CHECKOUT / PAYMENT
        'summary.title': 'Order Summary',
        'summary.total': 'Total Due',
        'course.duration': 'Duration',
        'course.format': 'Format',
        'course.nextSession': 'Next Session',
        'payment.choose': 'Choose a payment method',
        'payment.card': 'Credit Card',
        'payment.qris': 'QRIS / E-Wallet',
        'payment.va': 'Bank Transfer (VA)',
        'progress.step1': 'Select Time',
        'progress.step2': 'Your Details',
        'progress.step3': 'Payment',
        'courses.available': 'courses available',

        // GREAT ENGLISH CARD
        'ge.special': 'Special Partnership',
        'ge.title': 'Great English & iTTi',
        'ge.desc': 'Study English with a clear goal — become confident, fluent, and fully prepared to pass internationally recognized TESOL / TEFL certification.',
        'ge.btn': 'Discover the Opportunity →',

        // ── NEW HOMEPAGE SECTIONS ──

        // Proof Bar
        'proof.bar': 'Our instructors currently work at',

        // Career Outcomes
        'outcomes.h2': 'Real Career Outcomes — Not Just Certificates',
        'outcomes.sub': 'Pick your track. Build real projects. Get hired.',
        'outcomes.roles': 'Target Roles',
        'outcomes.tools': 'Tools You Master',
        'outcomes.project': 'Portfolio Project',
        'outcomes.cta': 'View Course →',

        // Instructor Authority
        'inst.h2': 'Taught by Practitioners, Not Just Teachers',
        'inst.sub': 'Every instructor is currently employed at a top tech company. You learn what they use on the job — today.',
        'inst.badge': 'Currently Active',

        // Testimonials
        'test.h2': 'Real Results. Real People.',
        'test.sub': 'From career switchers to data analysts — here\'s what students achieved.',
        'test.before': 'Before:',
        'test.after': 'After:',

        // Cohort Urgency
        'cohort.h2': 'Next Cohort Starting Soon',
        'cohort.sub': 'Small groups mean real mentorship. 12 seats max per cohort.',
        'cohort.seats': 'seats left',
        'cohort.format': 'Live Online · Small Group',
        'cohort.cta': 'Reserve Your Spot →',
        'cohort.full': 'Cohort Full',

        // Mini FAQ
        'faq.h2': 'Questions Before You Enroll?',
        'faq.sub': 'We answer the most common ones below.',
        'faq.q1': 'Is this suitable for complete beginners?',
        'faq.a1': 'Yes — no prior experience needed. Instructors build from the ground up. If you can use a computer, you can follow along.',
        'faq.q2': 'How much time do I need per week?',
        'faq.a2': 'Just 4 hours total — 2 sessions of 2 hours each. Most students finish over 2 weekends. Designed to fit around your current job.',
        'faq.q3': 'Will I actually become job-ready?',
        'faq.a3': 'Every lesson and project is built around what hiring managers test in interviews — real tools, real workflows, real deliverables.',
        'faq.q4': 'Is there a money-back guarantee?',
        'faq.a4': '100% yes. Attend your first session and if you\'re not satisfied, we refund in full — no questions asked.',
        'faq.q5': 'Who are the instructors?',
        'faq.a5': 'All instructors hold active senior roles at companies like Google, Microsoft, Tokopedia, and Gojek. They teach what they use at work today.',
        'faq.footer': 'Still have a question?',
        'faq.wa': 'Ask us on WhatsApp',

        // Hero
        'hero.badge': 'Trusted by 500+ Professionals in Southeast Asia',
        'hero.title1': 'Choose your path into tech.',
        'hero.title2': 'For The Modern World',
        'hero.subhead': 'Real skills. Live training. Industry experts. Fast-track your career with practical courses designed for the modern workplace.',
        'hero.cta1': 'Enroll Now (3 mins)',
        'hero.cta2': 'Explore Courses',
        'hero.taught': 'Taught by Active Tech Leads & Industry Experts',

        // Problem section
        'problem.h2': 'The world is moving fast. Traditional education is falling behind.',
        'problem.intro': 'We bridge the gap between what you know and what the modern workplace actually demands.',
        'pain.grad.h3': 'For Graduates',
        'pain.grad.p': 'Degrees don\'t guarantee jobs anymore. We give you the practical, hard skills employers are looking for right now.',
        'pain.pro.h3': 'For Professionals',
        'pain.pro.p': 'Stuck in your career? Upskill in high-demand areas like AI and data to become indispensable and future-proof your income.',
        'pain.org.h3': 'For Organizations',
        'pain.org.p': 'Stop wasting time on theoretical training. Reskill your teams efficiently with workflows they can apply on Monday morning.',
        'solution.h3': 'The GDI FutureWorks Solution',
        'solution.p': 'A learning platform that is simple, structured, and relentlessly practical. No fluff. Just real-world application.',

        // Infographic
        'info.old.badge': 'The Old Way',
        'info.old.1': '3–4 years of academic theory',
        'info.old.2': 'Outdated curriculum',
        'info.old.3': 'Massive debt & high fees',
        'info.old.4': 'Left stranded to find a job',
        'info.new.badge': 'GDI FutureWorks',
        'info.new.1': '2–4 weeks of intense reskilling',
        'info.new.2': 'Taught by active tech experts',
        'info.new.3': 'Affordable, immediate ROI',
        'info.new.4': 'Built to get you hired instantly',

        // Courses section
        'courses.h2': 'Skills for the Future of Work',
        'courses.sub': 'Choose your course to see schedules & secure your spot',
        'courses.sub.link': 'Consult Advisor',

        // Differentiators
        'diff.h2': 'Why Professionals Choose Us',
        'benefit1.title': 'Corporate-Tested Tracks',
        'benefit1.desc': 'Learn exactly what enterprise companies demand, bypassing outdated academic theory.',
        'benefit2.title': 'Immediate Practical Use',
        'benefit2.desc': 'Apply what you learn today to your job tomorrow. No waiting for graduation.',
        'benefit3.title': 'Small Cohorts',
        'benefit3.desc': 'Get personalized attention and dedicated feedback from instructors who know your name.',
        'benefit4.title': 'Structured Learning',
        'benefit4.desc': 'Step-by-step guidance so you never feel lost or overwhelmed.',
        'benefit5.title': 'Real-World Application',
        'benefit5.desc': 'Build a portfolio of actual projects, not just multiple-choice quizzes.',
        'benefit6.title': 'Community Support',
        'benefit6.desc': 'Join a network of driven professionals across Malaysia and Indonesia.',

        // Enroll steps
        'enroll.h2': 'Start Your Journey Today',
        'enroll.sub': 'No long forms. Instant access. Enroll in just 3 minutes.',
        'step1.h3': 'Choose',
        'step1.p': 'Select the path that matches your career goals or let our advisors guide you.',
        'step2.h3': 'Commit',
        'step2.p': 'Lock in your spot before the cohort fills up. A fast, secure checkout stands between you and your next career leap.',
        'step3.h3': 'Commence',
        'step3.p': 'Get instant access to your student dashboard and community immediately.',

        // Vision & Founders
        'vision.h2': 'Our Vision',
        'vision.quote': '"We believe education must move at the speed of the world. GDI FutureWorks was built to eliminate the noise and deliver the high-impact skills that professionals actually need to thrive."',
        'feonna.name': 'Feonna Watford',
        'feonna.role': 'Co-Founder',
        'feonna.bio': 'With over 20 years of corporate leadership in digital transformation and operations, Feonna builds the systems that ensure our training delivers measurable career impact.',
        'sergei.name': 'Sergei Bandurka',
        'sergei.role': 'Co-Founder',
        'sergei.bio': 'A veteran in corporate strategy and tech execution, Sergei brings two decades of experience designing programs that empower organizations and individuals to lead their industries.',
        'founders.combined': 'Together, they bring over 40 years of combined Fortune 500-level strategy and execution directly to your screen, actively building and refining the platform you use today.',

        // Final CTA
        'cta.h2': 'The future will not slow down.',
        'cta.h2b': 'But you can move ahead of it.',
        'cta.p': 'Join hundreds of professionals across Southeast Asia who are transforming their careers today.',
        'cta.btn': 'Enrol in 3 Minutes →',
        'cta.guarantee': '100% satisfaction guarantee',
    },

    id: {
        // NAV
        'nav.courses': 'Kursus',
        'nav.about': 'Tentang Kami',
        'nav.community': 'Komunitas',
        'nav.contact': 'Kontak',

        // BUTTONS
        'btn.enroll': 'Daftar Sekarang',
        'btn.checkout': 'Lanjut Pembayaran',
        'btn.chat': 'Chat kami',

        // CHECKOUT / PAYMENT
        'summary.title': 'Ringkasan Pesanan',
        'summary.total': 'Total Tagihan',
        'course.duration': 'Durasi',
        'course.format': 'Format',
        'course.nextSession': 'Sesi Berikutnya',
        'payment.choose': 'Pilih metode pembayaran',
        'payment.card': 'Kartu Kredit',
        'payment.qris': 'QRIS / E-Wallet',
        'payment.va': 'Transfer Bank (VA)',
        'progress.step1': 'Pilih Waktu',
        'progress.step2': 'Data Diri',
        'progress.step3': 'Pembayaran',
        'courses.available': 'kursus tersedia',

        // GREAT ENGLISH CARD
        'ge.special': 'Kemitraan Khusus',
        'ge.title': 'Great English & iTTi',
        'ge.desc': 'Belajar bahasa Inggris dengan tujuan yang jelas — menjadi percaya diri, fasih, dan sepenuhnya siap untuk lulus sertifikasi TESOL / TEFL yang diakui secara internasional.',
        'ge.btn': 'Pelajari Peluang Ini →',

        // ── NEW HOMEPAGE SECTIONS (ID) ──

        // Proof Bar
        'proof.bar': 'Instruktur kami saat ini bekerja di',

        // Career Outcomes
        'outcomes.h2': 'Hasil Karier Nyata — Bukan Sekadar Sertifikat',
        'outcomes.sub': 'Pilih jalur kamu. Bangun proyek nyata. Dapatkan pekerjaan.',
        'outcomes.roles': 'Target Peran',
        'outcomes.tools': 'Tools Yang Kamu Kuasai',
        'outcomes.project': 'Proyek Portofolio',
        'outcomes.cta': 'Lihat Kursus →',

        // Instructor Authority
        'inst.h2': 'Diajarkan oleh Praktisi, Bukan Sekadar Pengajar',
        'inst.sub': 'Setiap instruktur saat ini bekerja di perusahaan teknologi terkemuka. Kamu belajar apa yang mereka gunakan di tempat kerja — hari ini.',
        'inst.badge': 'Aktif Berkarier',

        // Testimonials
        'test.h2': 'Hasil Nyata. Orang Nyata.',
        'test.sub': 'Dari career switcher hingga data analis — inilah pencapaian para alumni.',
        'test.before': 'Sebelum:',
        'test.after': 'Sesudah:',

        // Cohort Urgency
        'cohort.h2': 'Kohort Berikutnya Segera Dimulai',
        'cohort.sub': 'Kelompok kecil berarti mentoring nyata. Maksimal 12 peserta per kohort.',
        'cohort.seats': 'kursi tersisa',
        'cohort.format': 'Live Online · Kelompok Kecil',
        'cohort.cta': 'Pesan Tempat Kamu →',
        'cohort.full': 'Kohort Penuh',

        // Mini FAQ
        'faq.h2': 'Pertanyaan Sebelum Mendaftar?',
        'faq.sub': 'Kami menjawab yang paling sering ditanyakan di bawah ini.',
        'faq.q1': 'Apakah ini cocok untuk pemula total?',
        'faq.a1': 'Ya — tidak perlu pengalaman sebelumnya. Instruktur membangun dari dasar. Jika kamu bisa menggunakan komputer, kamu bisa mengikutinya.',
        'faq.q2': 'Berapa banyak waktu yang dibutuhkan per minggu?',
        'faq.a2': 'Hanya 4 jam total — 2 sesi masing-masing 2 jam. Kebanyakan siswa menyelesaikan kursus dalam 2 akhir pekan. Dirancang agar sesuai dengan pekerjaan kamu.',
        'faq.q3': 'Apakah saya benar-benar akan siap kerja?',
        'faq.a3': 'Setiap pelajaran dan proyek dibangun berdasarkan apa yang diuji manajer rekrutmen — alat nyata, alur kerja nyata, hasil nyata.',
        'faq.q4': 'Apakah ada garansi uang kembali?',
        'faq.a4': '100% ya. Hadiri sesi pertama dan jika tidak puas, kami kembalikan uangmu sepenuhnya — tanpa pertanyaan.',
        'faq.q5': 'Siapa instrukturnya?',
        'faq.a5': 'Semua instruktur memegang jabatan senior aktif di Google, Microsoft, Tokopedia, dan Gojek. Mereka mengajarkan apa yang mereka gunakan di tempat kerja hari ini.',
        'faq.footer': 'Masih ada pertanyaan?',
        'faq.wa': 'Tanya kami di WhatsApp',

        // ── HOMEPAGE ──

        // Hero
        'hero.badge': 'Dipercaya oleh 500+ Profesional di Asia Tenggara',

        'hero.title1': 'Keterampilan Masa Depan',
        'hero.title2': 'Untuk Dunia Modern',
        'hero.subhead': 'Jalur Anda Menuju Kesuksesan',
        'hero.cta1': 'Daftar Sekarang (3 menit)',
        'hero.cta2': 'Lihat Kursus',
        'hero.taught': 'Kuasai Tekno, AI, dan Komunikasi Profesional untuk Pelajar & Profesional',

        // Problem section
        'problem.h2': 'Dunia bergerak cepat. Pendidikan tradisional tertinggal.',
        'problem.intro': 'Kami menjembatani kesenjangan antara apa yang kamu ketahui dan apa yang sebenarnya dibutuhkan oleh dunia kerja modern.',
        'pain.grad.h3': 'Untuk Lulusan',
        'pain.grad.p': 'Gelar tidak lagi menjamin pekerjaan. Kami memberikan kamu keterampilan praktis yang dicari perusahaan sekarang.',
        'pain.pro.h3': 'Untuk Profesional',
        'pain.pro.p': 'Karier stagnan? Tingkatkan keahlian di bidang yang diminati seperti AI dan data agar kamu tidak tergantikan dan penghasilanmu terlindungi.',
        'pain.org.h3': 'Untuk Organisasi',
        'pain.org.p': 'Hentikan pelatihan yang hanya teori. Reskill tim kamu secara efisien dengan alur kerja yang bisa langsung diterapkan Senin pagi.',
        'solution.h3': 'Solusi GDI FutureWorks',
        'solution.p': 'Platform pembelajaran yang sederhana, terstruktur, dan sangat praktis. Tanpa basa-basi. Hanya penerapan nyata.',

        // Infographic
        'info.old.badge': 'Cara Lama',
        'info.old.1': '3–4 tahun teori akademis',
        'info.old.2': 'Kurikulum yang sudah usang',
        'info.old.3': 'Hutang besar & biaya tinggi',
        'info.old.4': 'Ditinggal berjuang sendiri mencari kerja',
        'info.new.badge': 'GDI FutureWorks',
        'info.new.1': '2–4 minggu reskilling intensif',
        'info.new.2': 'Diajarkan oleh pakar teknologi aktif',
        'info.new.3': 'Terjangkau, ROI langsung terasa',
        'info.new.4': 'Dirancang agar kamu segera diterima kerja',

        // Courses section
        'courses.h2': 'Keahlian untuk Masa Depan Pekerjaan',
        'courses.sub': 'Pilih kursusmu di bawah untuk melihat jadwal dan daftar',
        'courses.sub.link': 'Bicara dengan Konsultan',

        // Differentiators
        'diff.h2': 'Mengapa Para Profesional Memilih Kami',
        'benefit1.title': 'Kurikulum Teruji Korporat',
        'benefit1.desc': 'Pelajari persis apa yang dibutuhkan perusahaan besar, melampaui teori akademis yang sudah ketinggalan zaman.',
        'benefit2.title': 'Langsung Bisa Digunakan',
        'benefit2.desc': 'Terapkan apa yang kamu pelajari hari ini di pekerjaanmu besok. Tidak perlu menunggu wisuda.',
        'benefit3.title': 'Kelompok Belajar Kecil',
        'benefit3.desc': 'Dapatkan perhatian personal dan umpan balik langsung dari instruktur yang mengenalmu.',
        'benefit4.title': 'Pembelajaran Terstruktur',
        'benefit4.desc': 'Panduan langkah demi langkah agar kamu tidak pernah merasa kebingungan atau kewalahan.',
        'benefit5.title': 'Penerapan di Dunia Nyata',
        'benefit5.desc': 'Bangun portofolio proyek asli, bukan sekadar kuis pilihan ganda.',
        'benefit6.title': 'Dukungan Komunitas',
        'benefit6.desc': 'Bergabunglah dengan jaringan profesional bersemangat dari Malaysia dan Indonesia.',

        // Enroll steps
        'enroll.h2': 'Mulai Perjalananmu Hari Ini',
        'enroll.sub': 'Tanpa formulir panjang. Akses langsung. Daftar hanya dalam 3 menit.',
        'step1.h3': 'Pilih',
        'step1.p': 'Pilih jalur yang sesuai dengan tujuan kariermu atau biarkan konsultan kami membimbingmu.',
        'step2.h3': 'Komitmen',
        'step2.p': 'Amankan tempatmu sebelum kuota penuh. Proses pembayaran cepat dan aman.',
        'step3.h3': 'Mulai (Commence)',
        'step3.p': 'Dapatkan akses langsung ke dashboard mahasiswa dan komunitas begitu pembayaran selesai.',

        // Vision & Founders
        'vision.h2': 'Visi Kami',
        'vision.quote': '"Kami percaya bahwa pendidikan harus bergerak secepat dunia. GDI FutureWorks dibangun untuk menyingkirkan kebisingan dan menghadirkan keterampilan berdampak tinggi yang benar-benar dibutuhkan para profesional untuk berkembang."',
        'feonna.name': 'Feonna Watford',
        'feonna.role': 'Co-Founder',
        'feonna.bio': 'Dengan pengalaman lebih dari 20 tahun sebagai pemimpin korporat di bidang transformasi digital dan operasional, Feonna membangun sistem yang memastikan pelatihan kami memberikan dampak nyata pada karier para peserta.',
        'sergei.name': 'Sergei Bandurka',
        'sergei.role': 'Co-Founder',
        'sergei.bio': 'Seorang veteran dalam strategi korporat dan eksekusi teknologi, Sergei membawa dua dekade pengalaman merancang program yang memberdayakan organisasi dan individu untuk memimpin industri mereka.',
        'founders.combined': 'Bersama, mereka membawa lebih dari 40 tahun strategi dan eksekusi tingkat Fortune 500 langsung ke layarmu, secara aktif membangun dan menyempurnakan platform yang kamu gunakan hari ini.',

        // Final CTA
        'cta.h2': 'Masa depan tidak akan melambat.',
        'cta.h2b': 'Tapi kamu bisa melangkah lebih maju.',
        'cta.p': 'Bergabunglah dengan ratusan profesional di Asia Tenggara yang sedang mengubah karier mereka hari ini.',
        'cta.btn': 'Daftar dalam 3 Menit →',
        'cta.guarantee': 'Garansi kepuasan 100%',
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    t: (k) => k,
});

export const LanguageProvider = ({ children, initialLanguage = 'en' }: { children: React.ReactNode, initialLanguage?: Language }) => {
    const [language, setLanguageState] = useState<Language>(initialLanguage);

    useEffect(() => {
        // Sync with localStorage if different (client-side preference)
        const saved = localStorage.getItem('gdi_lang') as Language;
        if (saved && (saved === 'en' || saved === 'id') && saved !== initialLanguage) {
            setLanguageState(saved);
        }
    }, [initialLanguage]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('gdi_lang', lang);
        // Sync with cookie for SSR consistency on next loads
        document.cookie = `GDI_LANG=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export function useLanguage() {
    const context = useContext(LanguageContext);
    return context;
}

export function Translate({ tKey, defaultText }: { tKey: string, defaultText?: string }) {
    const { t } = useLanguage();
    const translated = t(tKey);
    return <span>{translated !== tKey ? translated : defaultText || tKey}</span>;
}
