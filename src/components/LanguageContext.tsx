'use client';
// Force re-compile for multi-currency refined state sync


import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCountryCode } from '@/lib/geoDetect';

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
        'nav.logout': 'Log out',

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
        'cart.empty': 'Your cart is empty',
        'cart.emptySub': 'Unlock your potential with expert-led training. Your future starts with a single course.',
        'cart.browse': 'Browse Courses',
        'cart.review': 'Review Your Cart',
        'cart.reviewSub': 'Ready to start your journey? You have',
        'cart.subtotal': 'Subtotal',
        'cart.platformFee': 'Platform Fee',
        'cart.total': 'Total Amount',
        'cart.secure': 'Secure Checkout • 256-bit Encryption',
        'cart.addMore': 'Add another course',
        'cart.back': 'Back to Courses',

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

        // ── FOR TUTORS PAGE ──
        'tutor.hero.eyebrow': 'Now accepting tutors across SEA',
        'tutor.hero.title1': 'Turn Your Expertise Into',
        'tutor.hero.month': 'Month',
        'tutor.hero.subtitle': 'Teach what you know online. Set your own schedule and rate — we bring the students, handle payments, and take care of everything else.',
        'tutor.hero.bullet1': 'Set your own hourly rate',
        'tutor.hero.bullet2': 'Fully flexible schedule',
        'tutor.hero.bullet3': 'Teach 100% online',
        'tutor.hero.bullet4': 'We handle marketing & payments',
        'tutor.hero.cta1': 'Apply to Teach',
        'tutor.hero.cta2': 'Calculate Your Income',
        'tutor.trust.stat1.label': 'Tutors earning',
        'tutor.trust.stat1.sub': 'across SEA',
        'tutor.trust.stat2.label': 'Avg. approval',
        'tutor.trust.stat2.sub': 'from application',
        'tutor.trust.stat3.value': 'Zero',
        'tutor.trust.stat3.label': 'Upfront fees',
        'tutor.trust.stat3.sub': 'ever',

        'tutor.why.label': 'Why GDI FutureWorks',
        'tutor.why.title': 'Why Tutors Choose Us',
        'tutor.why.subtitle': 'Everything you need to teach professionally — without the admin overhead.',
        'tutor.why.b1.title': 'Earn Flexible Income',
        'tutor.why.b1.desc': 'Set your own hourly rate. Earn on your schedule — part-time or full-time, you decide.',
        'tutor.why.b2.title': 'Teach on Your Terms',
        'tutor.why.b2.desc': 'Pick your time slots and availability. No fixed contracts, no minimum commitments.',
        'tutor.why.b3.title': 'We Bring the Students',
        'tutor.why.b3.desc': 'We handle all marketing and student acquisition. You focus entirely on delivering great lessons.',
        'tutor.why.b4.title': 'Grow Your Reputation',
        'tutor.why.b4.desc': 'Build a verified tutor profile, collect student reviews, and grow your online teaching career.',
        'tutor.why.b5.title': 'Secure Payments',
        'tutor.why.b5.desc': 'Get paid reliably. We manage enrollment, billing, and payouts — zero admin work for you.',
        'tutor.why.b6.title': 'Regional Reach',
        'tutor.why.b6.desc': 'Access a growing community of learners across Malaysia, Indonesia, and Singapore.',

        'tutor.topics.label': 'Topics',
        'tutor.topics.title': 'Teach What You Know',
        'tutor.topics.subtitle': 'We welcome tutors from a wide range of practical, career-focused disciplines.',
        'tutor.topics.footnote': "Don't see your topic? Apply anyway — we're expanding our categories every month.",
        'tutor.topic.design.label': 'Design',
        'tutor.topic.design.sub': 'Graphic & visual',
        'tutor.topic.ai.label': 'AI Tools',
        'tutor.topic.ai.sub': 'Prompting & automation',
        'tutor.topic.canva.label': 'Canva',
        'tutor.topic.canva.sub': 'Templates & content',
        'tutor.topic.code.label': 'Programming',
        'tutor.topic.code.sub': 'Web & app dev',
        'tutor.topic.marketing.label': 'Digital Marketing',
        'tutor.topic.marketing.sub': 'SEO, ads & growth',
        'tutor.topic.english.label': 'English',
        'tutor.topic.english.sub': 'Business & communication',
        'tutor.topic.uiux.label': 'UI / UX',
        'tutor.topic.uiux.sub': 'Figma & prototyping',
        'tutor.topic.business.label': 'Business',
        'tutor.topic.business.sub': 'Strategy & ops',
        'tutor.topic.excel.label': 'Excel',
        'tutor.topic.excel.sub': 'Data & spreadsheets',
        'tutor.topic.data.label': 'Data Analysis',
        'tutor.topic.data.sub': 'Insights & reporting',
        'tutor.topic.soft.label': 'Soft Skills',
        'tutor.topic.soft.sub': 'Leadership & comms',

        'tutor.how.label': 'Process',
        'tutor.how.title': 'How It Works',
        'tutor.how.subtitle': 'Three simple steps to start earning. Most tutors are approved and teaching within 48 hours.',
        'tutor.how.badge': '⚡ Average approval: 48 hours',
        'tutor.how.step1.title': 'Create Your Profile',
        'tutor.how.step1.desc': 'Fill out your tutor application with your expertise, availability, and teaching style.',
        'tutor.how.step2.title': 'Set Price & Schedule',
        'tutor.how.step2.desc': 'Choose your hourly rate and weekly availability. We match you with the right students.',
        'tutor.how.step3.title': 'Start Teaching',
        'tutor.how.step3.desc': 'Deliver live online sessions and get paid automatically. We handle everything else.',

        'tutor.earn.label': 'Earning Potential',
        'tutor.earn.title': 'How Much Can You Earn?',
        'tutor.earn.subtitle': 'Real income estimates based on tutor activity levels. You control how much you work.',
        'tutor.earn.monthly': 'Monthly Income',
        'tutor.earn.permonth': 'per month',
        'tutor.earn.tier1.badge': 'Starter',
        'tutor.earn.tier1.name': 'Starter Tutor',
        'tutor.earn.tier2.badge': 'Most Popular',
        'tutor.earn.tier2.name': 'Active Tutor',
        'tutor.earn.tier3.badge': 'Pro',
        'tutor.earn.tier3.name': 'Pro Tutor',

        'tutor.calc.label': 'Income Calculator',
        'tutor.calc.title': 'Calculate Your Tutor Income',
        'tutor.calc.subtitle': 'Adjust the sliders to see your estimated earnings based on your preferred schedule.',
        'tutor.calc.rate.idr': 'Hourly Rate (IDR)',
        'tutor.calc.rate.myr': 'Hourly Rate (MYR)',
        'tutor.calc.hourslesson': 'Hours Per Lesson',
        'tutor.calc.lessonsweek': 'Lessons Per Week',
        'tutor.calc.output.title': 'Your Estimated Income',
        'tutor.calc.weekly': 'Weekly',
        'tutor.calc.monthly': 'Monthly',
        'tutor.calc.yearly': 'Yearly',
        'tutor.calc.disclaimer': '* Estimates based on your input. Actual earnings depend on student demand, session completion, and platform activity.',

        'tutor.cta.proof': '1,200+ tutors already earning',
        'tutor.cta.title': 'Start Teaching This Week',
        'tutor.cta.sub': 'Apply in minutes. Get approved in 48 hours. Start earning on your own schedule.',
        'tutor.cta.btn': 'Apply to Teach Now',
        'tutor.cta.r1': 'No upfront fees',
        'tutor.cta.r2': 'No lock-in contracts',
        'tutor.cta.r3': 'First payout within 30 days',

        // ── TUTOR APPLY PAGE ──
        'apply.eyebrow': 'Tutor Application',
        'apply.title.pre': 'Become a ',
        'apply.title.brand': 'GDI',
        'apply.title.post': ' Tutor',
        'apply.subtitle': 'Apply to join our curated network of expert educators and start earning by teaching the skills you know.',
        'apply.step.badge': 'Step',
        'apply.step.of': 'of',
        'apply.step1.label': 'Your Profile',
        'apply.step2.label': 'Availability',
        'apply.step3.label': 'Your Work',
        'apply.step4.label': 'Teaching Plan',
        'apply.step5.label': 'Agreement',
        'apply.step1.title': 'Tell us about yourself',
        'apply.step2.title': 'When can you teach?',
        'apply.step3.title': 'Share your credentials',
        'apply.step4.title': 'Outline your curriculum',
        'apply.step5.title': 'Terms & Conditions',
        'apply.f.name': 'Full Name',
        'apply.f.email': 'Professional Email',
        'apply.f.expertise': 'Expertise Area',
        'apply.f.expertise.ph': 'Select your teaching area…',
        'apply.f.bio': 'Professional Bio',
        'apply.f.bio.hint': 'Tell us about your industry background and teaching experience.',
        'apply.f.linkedin': 'LinkedIn Profile URL',
        'apply.f.tz': 'Your Timezone',
        'apply.avail.info': 'Tap cells to mark your availability. Click a day header to select all slots for that day, or a row label to select that time across all days.',
        'apply.avail.none': 'No slots selected yet — tap cells above',
        'apply.avail.slots': 'slot',
        'apply.avail.slotsP': 'slots',
        'apply.avail.selected': 'selected',
        'apply.slot.morning': 'Morning',
        'apply.slot.midday': 'Midday',
        'apply.slot.afternoon': 'Afternoon',
        'apply.slot.evening': 'Evening',
        'apply.f.video': 'Introduction Video (3–5 mins)',
        'apply.f.video.hint': 'Record yourself teaching a short concept. Upload to YouTube, Loom, Google Drive, Vimeo, or any public video link.',
        'apply.f.portfolio': 'Portfolio / Work Examples',
        'apply.f.portfolio.opt': '— optional',
        'apply.f.portfolio.hint': 'Link to your GitHub, Behance, portfolio site, or previous course materials.',
        'apply.work.info': 'Why do we ask for this? Our community selects tutors based on real credibility. A short video and portfolio help students choose the right teacher for them.',
        'apply.f.curriculum': 'Proposed Curriculum Outline',
        'apply.f.curriculum.hint': 'Summarize your modules, key learning outcomes, and tools/software used.',
        'apply.f.lesson': 'Sample Lesson Plan (2 Lessons)',
        'apply.f.lesson.hint': 'Walk us through two consecutive lessons as you would deliver them live.',
        'apply.plan.info': 'This is the most important step. A clear, structured curriculum is the #1 thing students look for when choosing a tutor.',
        'apply.terms.title': 'Tutor Code of Conduct',
        'apply.terms.1': 'You will deliver sessions on time and as scheduled with students.',
        'apply.terms.2': "You will not share students' personal data with any third party.",
        'apply.terms.3': 'All curriculum content you submit must be your original work or properly licensed.',
        'apply.terms.4': "You agree to GDI FutureWorks' platform fee structure (as communicated in your onboarding).",
        'apply.terms.5': 'GDI FutureWorks reserves the right to remove tutors who violate community standards.',
        'apply.terms.6': 'You confirm that all information in this application is accurate and truthful.',
        'apply.terms.tos': 'Terms of Service',
        'apply.terms.pp': 'Privacy Policy',
        'apply.terms.footer': 'By submitting, you also agree to our',
        'apply.terms.and': 'and',
        'apply.agree.info': 'Almost there! Please read and agree to our tutor terms before submitting your application.',
        'apply.agree.label': 'I have read and agree to the Tutor Code of Conduct, Terms of Service, and Privacy Policy.',
        'apply.btn.back': '← Back',
        'apply.btn.continue': 'Continue →',
        'apply.btn.submit': 'Submit Application →',
        'apply.btn.submitting': 'Submitting…',
        'apply.btn.agree.first': 'Agree to terms to continue',
        'apply.success.title': 'Application Received!',
        'apply.success.text': 'Thank you for applying to join the GDI FutureWorks tutor network. Our team will review your profile, video, and curriculum outline.',
        'apply.success.meta': 'We typically respond within 3–5 business days',
        'apply.success.home': 'Return to Homepage',
    },

    id: {
        // NAV
        'nav.courses': 'Kursus',
        'nav.about': 'Tentang Kami',
        'nav.community': 'Komunitas',
        'nav.contact': 'Kontak',
        'nav.logout': 'Keluar',

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
        'cart.empty': 'Keranjang Anda kosong',
        'cart.emptySub': 'Buka potensi Anda dengan pelatihan ahli. Masa depan Anda dimulai dari satu kursus.',
        'cart.browse': 'Lihat Kursus',
        'cart.review': 'Tinjau Keranjang Anda',
        'cart.reviewSub': 'Siap memulai perjalanan? Anda memiliki',
        'cart.subtotal': 'Subtotal',
        'cart.platformFee': 'Biaya Platform',
        'cart.total': 'Total Pembayaran',
        'cart.secure': 'Pembayaran Aman • Enkripsi 256-bit',
        'cart.addMore': 'Tambah kursus lainnya',
        'cart.back': 'Kembali ke Kursus',

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

        // ── FOR TUTORS PAGE ──
        'tutor.hero.eyebrow': 'Buka slot tutor baru',
        'tutor.hero.title1': 'Ubah Keahlianmu Menjadi',
        'tutor.hero.month': 'Bulan',
        'tutor.hero.subtitle': 'Ajarkan apa yang kamu tahu secara online. Atur jadwal & tarifmu — kami cari siswa, urus pembayaran, dan semua hal lainnya.',
        'tutor.hero.bullet1': 'Atur tarif per jam sendiri',
        'tutor.hero.bullet2': 'Jadwal bebas & fleksibel',
        'tutor.hero.bullet3': 'Mengajar 100% online',
        'tutor.hero.bullet4': 'Marketing & bayar kami urus',
        'tutor.hero.cta1': 'Daftar Mengajar',
        'tutor.hero.cta2': 'Hitung Penghasilan',
        'tutor.trust.stat1.label': 'Tutor aktif',
        'tutor.trust.stat1.sub': 'di seluruh SEA',
        'tutor.trust.stat2.label': 'Rata-rata persetujuan',
        'tutor.trust.stat2.sub': 'dari pendaftaran',
        'tutor.trust.stat3.value': 'Nol',
        'tutor.trust.stat3.label': 'Biaya awal',
        'tutor.trust.stat3.sub': 'sama sekali',

        'tutor.why.label': 'Mengapa GDI FutureWorks',
        'tutor.why.title': 'Mengapa Tutor Memilih Kami',
        'tutor.why.subtitle': 'Semua yang kamu butuhkan untuk mengajar profesional — tanpa repot urusan admin.',
        'tutor.why.b1.title': 'Penghasilan Fleksibel',
        'tutor.why.b1.desc': 'Atur tarifmu sendiri. Hasilkan sesuai jadwal — paruh waktu atau penuh waktu, kamu yang tentukan.',
        'tutor.why.b2.title': 'Mengajar Sesukamu',
        'tutor.why.b2.desc': 'Pilih slot waktu dan ketersediaanmu. Tanpa kontrak tetap, tanpa komitmen minimum.',
        'tutor.why.b3.title': 'Kami Cari Siswanya',
        'tutor.why.b3.desc': 'Kami urus semua marketing dan akuisisi siswa. Kamu fokus penuh pada mengajar.',
        'tutor.why.b4.title': 'Bangun Reputasi',
        'tutor.why.b4.desc': 'Profil terverifikasi, ulasan siswa, dan karier mengajar online yang terus berkembang.',
        'tutor.why.b5.title': 'Pembayaran Aman',
        'tutor.why.b5.desc': 'Terima bayaran terjamin. Tagihan & pencairan kami yang kelola.',
        'tutor.why.b6.title': 'Jangkauan Regional',
        'tutor.why.b6.desc': 'Akses komunitas pelajar di Malaysia, Indonesia, dan Singapura.',

        'tutor.topics.label': 'Topik',
        'tutor.topics.title': 'Ajarkan Apa yang Kamu Kuasai',
        'tutor.topics.subtitle': 'Kami menerima tutor dari berbagai bidang praktis dan berorientasi karier.',
        'tutor.topics.footnote': 'Topikmu belum ada? Daftar saja — kategori kami terus bertambah.',
        'tutor.topic.design.label': 'Desain',
        'tutor.topic.design.sub': 'Grafis & visual',
        'tutor.topic.ai.label': 'Alat AI',
        'tutor.topic.ai.sub': 'Prompting & otomasi',
        'tutor.topic.canva.label': 'Canva',
        'tutor.topic.canva.sub': 'Template & konten',
        'tutor.topic.code.label': 'Pemrograman',
        'tutor.topic.code.sub': 'Dev web & aplikasi',
        'tutor.topic.marketing.label': 'Marketing Digital',
        'tutor.topic.marketing.sub': 'SEO, iklan & growth',
        'tutor.topic.english.label': 'Bahasa Inggris',
        'tutor.topic.english.sub': 'Bisnis & komunikasi',
        'tutor.topic.uiux.label': 'UI / UX',
        'tutor.topic.uiux.sub': 'Figma & prototipe',
        'tutor.topic.business.label': 'Bisnis',
        'tutor.topic.business.sub': 'Strategi & operasional',
        'tutor.topic.excel.label': 'Excel',
        'tutor.topic.excel.sub': 'Data & spreadsheet',
        'tutor.topic.data.label': 'Analisis Data',
        'tutor.topic.data.sub': 'Insight & laporan',
        'tutor.topic.soft.label': 'Soft Skills',
        'tutor.topic.soft.sub': 'Kepemimpinan & komuni.',

        'tutor.how.label': 'Proses',
        'tutor.how.title': 'Cara Kerjanya',
        'tutor.how.subtitle': 'Tiga langkah mudah untuk mulai menghasilkan. Kebanyakan tutor disetujui dalam 48 jam.',
        'tutor.how.badge': '⚡ Persetujuan rata-rata: 48 jam',
        'tutor.how.step1.title': 'Buat Profilmu',
        'tutor.how.step1.desc': 'Isi formulir tutor dengan keahlian, ketersediaan, dan gaya mengajarmu.',
        'tutor.how.step2.title': 'Atur Harga & Jadwal',
        'tutor.how.step2.desc': 'Pilih tarif per jam dan jadwal mingguanmu. Kami cocokkan dengan siswa yang tepat.',
        'tutor.how.step3.title': 'Mulai Mengajar',
        'tutor.how.step3.desc': 'Berikan sesi live online dan terima bayaran otomatis. Sisanya kami yang urus.',

        'tutor.earn.label': 'Potensi Penghasilan',
        'tutor.earn.title': 'Berapa Bisa Kamu Hasilkan?',
        'tutor.earn.subtitle': 'Estimasi penghasilan nyata berdasarkan tingkat aktivitas tutor. Kamu yang tentukan intensitasnya.',
        'tutor.earn.monthly': 'Penghasilan Bulanan',
        'tutor.earn.permonth': 'per bulan',
        'tutor.earn.tier1.badge': 'Pemula',
        'tutor.earn.tier1.name': 'Tutor Pemula',
        'tutor.earn.tier2.badge': 'Terpopuler',
        'tutor.earn.tier2.name': 'Tutor Aktif',
        'tutor.earn.tier3.badge': 'Pro',
        'tutor.earn.tier3.name': 'Tutor Pro',

        'tutor.calc.label': 'Kalkulator Penghasilan',
        'tutor.calc.title': 'Hitung Penghasilan Tutormu',
        'tutor.calc.subtitle': 'Geser slider untuk melihat estimasi pendapatanmu sesuai jadwal pilihan.',
        'tutor.calc.rate.idr': 'Tarif per Jam (IDR)',
        'tutor.calc.rate.myr': 'Tarif per Jam (MYR)',
        'tutor.calc.hourslesson': 'Jam per Sesi',
        'tutor.calc.lessonsweek': 'Sesi per Minggu',
        'tutor.calc.output.title': 'Estimasi Penghasilanmu',
        'tutor.calc.weekly': 'Mingguan',
        'tutor.calc.monthly': 'Bulanan',
        'tutor.calc.yearly': 'Tahunan',
        'tutor.calc.disclaimer': '* Estimasi berdasarkan input. Penghasilan aktual tergantung permintaan siswa dan aktivitas platform.',

        'tutor.cta.proof': '1.200+ tutor sudah berpenghasilan',
        'tutor.cta.title': 'Mulai Mengajar Minggu Ini',
        'tutor.cta.sub': 'Daftar dalam menit. Disetujui 48 jam. Mulai hasilkan sesuai jadwalmu.',
        'tutor.cta.btn': 'Daftar Mengajar Sekarang',
        'tutor.cta.r1': 'Tanpa biaya awal',
        'tutor.cta.r2': 'Tanpa kontrak terikat',
        'tutor.cta.r3': 'Pencairan pertama 30 hari',

        // ── TUTOR APPLY PAGE ──
        'apply.eyebrow': 'Daftar Tutor',
        'apply.title.pre': 'Jadilah Tutor ',
        'apply.title.brand': 'GDI',
        'apply.title.post': '',
        'apply.subtitle': 'Bergabunglah sebagai tutor ahli dan mulai menghasilkan dari keahlianmu.',
        'apply.step.badge': 'Langkah',
        'apply.step.of': 'dari',
        'apply.step1.label': 'Profil Kamu',
        'apply.step2.label': 'Jadwal',
        'apply.step3.label': 'Portofolio',
        'apply.step4.label': 'Rencana Ajar',
        'apply.step5.label': 'Persetujuan',
        'apply.step1.title': 'Ceritakan tentang dirimu',
        'apply.step2.title': 'Kapan kamu bisa mengajar?',
        'apply.step3.title': 'Tunjukkan kredensialmu',
        'apply.step4.title': 'Rancang kurikulummu',
        'apply.step5.title': 'Syarat & Ketentuan',
        'apply.f.name': 'Nama Lengkap',
        'apply.f.email': 'Email Profesional',
        'apply.f.expertise': 'Bidang Keahlian',
        'apply.f.expertise.ph': 'Pilih bidang mengajarmu…',
        'apply.f.bio': 'Bio Profesional',
        'apply.f.bio.hint': 'Ceritakan latar belakang industri dan pengalaman mengajarmu.',
        'apply.f.linkedin': 'URL Profil LinkedIn',
        'apply.f.tz': 'Zona Waktu',
        'apply.avail.info': 'Ketuk sel untuk tandai ketersediaanmu. Klik hari untuk pilih semua slot, atau klik baris waktu untuk pilih semua hari.',
        'apply.avail.none': 'Belum ada slot dipilih — ketuk sel di atas',
        'apply.avail.slots': 'slot',
        'apply.avail.slotsP': 'slot',
        'apply.avail.selected': 'dipilih',
        'apply.slot.morning': 'Pagi',
        'apply.slot.midday': 'Siang',
        'apply.slot.afternoon': 'Sore',
        'apply.slot.evening': 'Malam',
        'apply.f.video': 'Video Perkenalan (3–5 menit)',
        'apply.f.video.hint': 'Rekam dirimu mengajar konsep singkat. Upload ke YouTube, Loom, Google Drive, Vimeo, atau tautan video publik manapun.',
        'apply.f.portfolio': 'Portofolio / Contoh Karya',
        'apply.f.portfolio.opt': '— opsional',
        'apply.f.portfolio.hint': 'Tautan ke GitHub, Behance, situs portofolio, atau materi kursus sebelumnya.',
        'apply.work.info': 'Mengapa kami meminta ini? Komunitas kami memilih tutor berdasarkan kredibilitas nyata. Video singkat dan portofolio membantu siswa memilih pengajar yang tepat.',
        'apply.f.curriculum': 'Outline Kurikulum',
        'apply.f.curriculum.hint': 'Ringkasan modul, capaian belajar, dan alat/software yang digunakan.',
        'apply.f.lesson': 'Rencana Pelajaran (2 Sesi)',
        'apply.f.lesson.hint': 'Jelaskan dua pelajaran berurutan seperti yang akan kamu sampaikan secara langsung.',
        'apply.plan.info': 'Ini adalah langkah terpenting. Kurikulum yang jelas dan terstruktur adalah hal #1 yang dicari siswa saat memilih tutor.',
        'apply.terms.title': 'Kode Etik Tutor',
        'apply.terms.1': 'Kamu akan mengadakan sesi tepat waktu sesuai jadwal yang disepakati.',
        'apply.terms.2': 'Kamu tidak akan membagikan data pribadi siswa kepada pihak ketiga.',
        'apply.terms.3': 'Semua konten kurikulum yang kamu kirimkan harus karya asli atau berlisensi.',
        'apply.terms.4': 'Kamu menyetujui struktur biaya platform GDI FutureWorks (sesuai onboarding).',
        'apply.terms.5': 'GDI FutureWorks berhak menghapus tutor yang melanggar standar komunitas.',
        'apply.terms.6': 'Kamu memastikan semua informasi dalam lamaran ini akurat dan jujur.',
        'apply.terms.tos': 'Ketentuan Layanan',
        'apply.terms.pp': 'Kebijakan Privasi',
        'apply.terms.footer': 'Dengan mengirimkan, kamu juga menyetujui',
        'apply.terms.and': 'dan',
        'apply.agree.info': 'Hampir selesai! Baca dan setujui ketentuan tutor sebelum mengirimkan lamaranmu.',
        'apply.agree.label': 'Saya telah membaca dan menyetujui Kode Etik Tutor, Ketentuan Layanan, dan Kebijakan Privasi.',
        'apply.btn.back': '← Kembali',
        'apply.btn.continue': 'Lanjutkan →',
        'apply.btn.submit': 'Kirim Lamaran →',
        'apply.btn.submitting': 'Mengirim…',
        'apply.btn.agree.first': 'Setujui ketentuan untuk lanjut',
        'apply.success.title': 'Lamaran Diterima!',
        'apply.success.text': 'Terima kasih telah mendaftar ke jaringan tutor GDI FutureWorks. Tim kami akan meninjau profil, video, dan outline kurikulummu.',
        'apply.success.meta': 'Kami biasanya merespons dalam 3–5 hari kerja',
        'apply.success.home': 'Kembali ke Beranda',
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
        // Priority 1: localStorage (user preference)
        const saved = localStorage.getItem('gdi_lang') as Language;
        if (saved && (saved === 'en' || saved === 'id')) {
            if (saved !== initialLanguage) setLanguageState(saved);
            return;
        }

        // Priority 2: Geolocation detection (shared fetch — one request for both currency + language)
        getCountryCode().then(countryCode => {
            setLanguage(countryCode === 'ID' ? 'id' : 'en');
        });
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
