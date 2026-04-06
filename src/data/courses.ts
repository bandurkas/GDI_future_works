export interface Instructor {
    name: string;
    role: string;
    company: string;
    experience: string;
    credentials: string[];
    initials: string;
    accentColor: string;
    bgGradient: string;
    photoUrl?: string;
    linkedin?: string;
    github?: string;
    loom?: string;
}

export interface Schedule {
    id: string;
    date: string;
    dayOfWeek: string;
    month: string;
    day: number;
    time: string;
    timeEnd: string;
    seatsLeft: number;
}

export interface SyllabusSession {
    title: string;
    items: string[];
}

export interface SyllabusDetails {
    sessions: SyllabusSession[];
    project: string;
    careerOutcomes: {
        roles: string[];
    };
}

export interface Course {
    id: string;
    slug: string;
    category: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    iconBg: string;
    imageIcon?: string;
    duration: string;
    format: string;
    price: number;
    originalPrice: number;
    currency: string;
    rating: number;
    studentsCount: number;
    nextSession: string;
    tutorEmail?: string;
    seatsLeft: number;
    targetRoles: string[];
    priceMYR: number;
    originalPriceMYR: number;
    priceIDR: number;
    originalPriceIDR: number;
    outcomes: string[];
    whoFor: string[];
    whatYouGet: string[];
    whyWorthIt: string[];
    instructor: Instructor;
    schedules: Schedule[];
    tags: string[];
    testimonialQuote: string;
    testimonialAuthor: string;
    syllabusDetails?: SyllabusDetails;
    // Indonesian translations
    titleID?: string;
    subtitleID?: string;
    descriptionID?: string;
    outcomesID?: string[];
    whoForID?: string[];
    whatYouGetID?: string[];
    whyWorthItID?: string[];
    targetRolesID?: string[];
    durationID?: string;
    testimonialQuoteID?: string;
    syllabusDetailsID?: SyllabusDetails;
}

export const courses: Course[] = [
    {
        id: 'data-analytics',
        slug: 'data-analytics',
        tutorEmail: 'bayusedana26@gmail.com',
        category: 'Data Analytics',
        title: 'Basic Data Analyst',
        subtitle: 'From Raw Data to Business Insights',
        description: 'Learn how analysts turn raw data into clear business insights. In this live session, you\u2019ll work with real datasets using Python and Pandas, clean messy data, and create visual dashboards used in real companies.',
        icon: '\ud83d\udcca',
        iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        imageIcon: '/assets/icons/data.png',
        duration: '4 hours',
        format: '2 days \xd7 2 hours',
        price: 49,
        originalPrice: 99,
        currency: 'USD',
        rating: 4.9,
        studentsCount: 1247,
        nextSession: 'Apr 9\u201310',
        seatsLeft: 3,
        targetRoles: ['Data Analyst', 'BI Analyst', 'Reporting Analyst'],
        priceMYR: 129,
        originalPriceMYR: 359,
        priceIDR: 400000,
        originalPriceIDR: 1500000,
        testimonialQuote: 'After the course I built my first dashboard and landed a data analyst role within 3 weeks.',
        testimonialAuthor: 'Arif S. \u2014 Junior Analyst',
        outcomes: [
            'Analyze real datasets using Python & Pandas',
            'Clean and structure messy, unorganized data',
            'Build interactive dashboards with Plotly & Matplotlib',
        ],
        whoFor: [
            'Beginners entering data analytics',
            'Professionals switching careers',
            'Students & recent graduates',
            'Anyone working with data in business',
        ],
        whatYouGet: [
            'Live interactive session with expert guidance',
            'Ability to ask questions in real time',
            'Step-by-step practical exercises',
            'Certificate of completion',
            'Portfolio-ready project',
            'Access to student community',
        ],
        whyWorthIt: [
            'Learn practical skills used in real jobs',
            'Build a project you can show employers',
            'Save months of self-learning and confusion',
            'Gain confidence working with real data',
        ],
        // Indonesian
        titleID: 'Analis Data Dasar',
        subtitleID: 'Dari Data Mentah ke Wawasan Bisnis',
        descriptionID: 'Pelajari bagaimana analis mengubah data mentah menjadi wawasan bisnis yang jelas. Dalam sesi langsung ini, kamu akan bekerja dengan dataset nyata menggunakan Python dan Pandas, membersihkan data berantakan, dan membuat dashboard visual yang digunakan di perusahaan nyata.',
        outcomesID: [
            'Menganalisis dataset nyata dengan Python & Pandas',
            'Membersihkan dan menyusun data yang berantakan',
            'Membangun dashboard interaktif dengan Plotly & Matplotlib',
        ],
        whoForID: [
            'Pemula yang memasuki analitik data',
            'Profesional yang beralih karier',
            'Pelajar & lulusan baru',
            'Siapa pun yang bekerja dengan data dalam bisnis',
        ],
        whatYouGetID: [
            'Sesi langsung interaktif dengan bimbingan ahli',
            'Kemampuan bertanya secara real-time',
            'Latihan praktis langkah demi langkah',
            'Sertifikat penyelesaian',
            'Proyek siap portofolio',
            'Akses ke komunitas pelajar',
        ],
        whyWorthItID: [
            'Pelajari keterampilan praktis yang digunakan di pekerjaan nyata',
            'Bangun proyek yang bisa kamu tunjukkan ke perusahaan',
            'Hemat berbulan-bulan belajar sendiri',
            'Dapatkan kepercayaan diri bekerja dengan data nyata',
        ],
        targetRolesID: ['Analis Data', 'Analis BI', 'Analis Pelaporan'],
        durationID: '4 jam',
        testimonialQuoteID: 'Setelah kursus ini saya membangun dashboard pertama saya dan mendapat posisi analis data dalam 3 minggu.',
        instructor: {
            name: 'Bayu Sedana',
            role: 'Senior Data Analyst & IT Trainer',
            company: 'IT Consultant',
            experience: '6 years in software engineering, data analysis & QA',
            credentials: [
                'Backend developer with 6 years experience (Python, Node.js, Flask, FastAPI)',
                'Certified instructor at 2 Indonesian institutions',
                'Advanced SQL certified — proficient in MySQL, PostgreSQL, SQLite',
                '23+ GitHub projects covering Python automation, QA, and full-stack',
            ],
            initials: 'BS',
            accentColor: '#667eea',
            bgGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
            linkedin: 'https://www.linkedin.com/in/bayusedana/',
            github: 'https://github.com/bayusedana26',
            loom: 'https://www.loom.com/share/02fd0509dbd24954a22d67c1a7c94d6d',
        },
        schedules: [
            { id: 's1', date: 'Mar 12\u201313', dayOfWeek: 'Wed\u2013Thu', month: 'Mar', day: 12, time: '19:00', timeEnd: '21:00', seatsLeft: 3 },
            { id: 's2', date: 'Mar 19\u201320', dayOfWeek: 'Wed\u2013Thu', month: 'Mar', day: 19, time: '19:00', timeEnd: '21:00', seatsLeft: 8 },
            { id: 's3', date: 'Mar 26\u201327', dayOfWeek: 'Wed\u2013Thu', month: 'Mar', day: 26, time: '14:00', timeEnd: '16:00', seatsLeft: 12 },
            { id: 's4', date: 'Apr 2\u20133', dayOfWeek: 'Wed\u2013Thu', month: 'Apr', day: 2, time: '19:00', timeEnd: '21:00', seatsLeft: 12 },
        ],
        tags: ['Python', 'Pandas', 'Data', 'Analytics', 'Visualization'],
        syllabusDetails: {
            sessions: [
                {
                    title: 'Session 1 (2 Hours): Data Cleaning & Preparation',
                    items: [
                        'Load real-world CSV datasets into Python.',
                        'Identify and fix missing values, duplicates, and inconsistencies.',
                        'Reshape and filter data with Pandas.',
                    ]
                },
                {
                    title: 'Session 2 (2 Hours): Visualization & Insights',
                    items: [
                        'Create bar charts, line graphs, and heatmaps with Matplotlib & Plotly.',
                        'Build a multi-chart dashboard to tell a data story.',
                        'Export your visuals for use in reports or presentations.',
                    ]
                }
            ],
            project: 'Build a complete data dashboard from a raw CSV file\u2014cleaning the data, running analysis, and presenting visual insights that could be used in a real business report.',
            careerOutcomes: {
                roles: [
                    'Data Analyst, BI Analyst, or Reporting Specialist.',
                    'Entry-level roles at tech, finance, or e-commerce companies.'
                ]
            }
        },
        syllabusDetailsID: {
            sessions: [
                {
                    title: 'Sesi 1 (2 Jam): Pembersihan & Persiapan Data',
                    items: [
                        'Memuat dataset CSV dunia nyata ke Python.',
                        'Mengidentifikasi dan memperbaiki nilai yang hilang, duplikat, dan inkonsistensi.',
                        'Membentuk ulang dan memfilter data dengan Pandas.',
                    ]
                },
                {
                    title: 'Sesi 2 (2 Jam): Visualisasi & Wawasan',
                    items: [
                        'Membuat grafik batang, grafik garis, dan heatmap dengan Matplotlib & Plotly.',
                        'Membangun dashboard multi-grafik untuk menceritakan kisah data.',
                        'Mengekspor visual untuk digunakan dalam laporan atau presentasi.',
                    ]
                }
            ],
            project: 'Bangun dashboard data lengkap dari file CSV mentah\u2014membersihkan data, menjalankan analisis, dan menyajikan wawasan visual yang bisa digunakan dalam laporan bisnis nyata.',
            careerOutcomes: {
                roles: [
                    'Analis Data, Analis BI, atau Spesialis Pelaporan.',
                    'Peran entry-level di perusahaan teknologi, keuangan, atau e-commerce.'
                ]
            }
        },
    },
    {
        id: 'python-programming',
        slug: 'python-programming',
        category: 'Python Programming',
        title: 'Python for Professionals',
        subtitle: 'Automate Tasks & Build Smart Tools',
        description: 'Stop doing repetitive work by hand. In 4 hours, you\u2019ll learn Python basics and immediately apply them to automate real-world tasks\u2014from renaming hundreds of files to pulling data from websites.',
        icon: '\ud83d\udc0d',
        iconBg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        imageIcon: '/assets/icons/python.png',
        duration: '4 hours',
        format: '2 days \xd7 2 hours',
        price: 49,
        originalPrice: 99,
        currency: 'USD',
        rating: 4.8,
        studentsCount: 983,
        nextSession: 'Apr 12',
        seatsLeft: 2,
        targetRoles: ['Python Developer', 'Automation Engineer', 'Data Engineer'],
        priceMYR: 119,
        originalPriceMYR: 380,
        priceIDR: 400000,
        originalPriceIDR: 1500000,
        testimonialQuote: 'Python finally clicked for me. I automated half my monthly report process after just 2 sessions.',
        testimonialAuthor: 'Mei R. \u2014 Business Analyst',
        outcomes: [
            'Write clean, readable Python from scratch',
            'Automate repetitive business tasks and workflows',
            'Process and analyze data files (CSV, Excel, JSON)',
            'Build useful scripts and tools for your daily work',
            'Connect to APIs and pull live data automatically',
        ],
        whoFor: [
            'Business analysts, marketers, or operations professionals who deal with repetitive data tasks.',
            'Anyone who wants to add coding to their toolkit without becoming a full-time developer.',
            'Career switchers aiming for Python-related roles.',
        ],
        whatYouGet: [
            'Live interactive training (4 hours total)',
            'Real-time Q&A with your instructor',
            'Certificate of completion',
            'Portfolio automation project',
            'Private student community access',
            'Session recording for replay',
            'Career guidance & job opportunity alerts',
        ],
        whyWorthIt: [
            'Most in-demand programming language globally in 2025',
            'Start building real tools from day one \u2014 no fluff',
            'No prior coding experience whatsoever required',
            'Instructor has automated workflows at enterprise scale',
            'Skills that apply in any industry, any company',
        ],
        // Indonesian
        titleID: 'Python untuk Profesional',
        subtitleID: 'Otomatiskan Tugas & Bangun Alat Cerdas',
        descriptionID: 'Berhenti mengerjakan pekerjaan berulang secara manual. Dalam 4 jam, kamu akan mempelajari dasar-dasar Python dan langsung menerapkannya untuk mengotomatiskan tugas dunia nyata\u2014dari mengganti nama ratusan file hingga mengambil data dari website.',
        outcomesID: [
            'Menulis Python yang bersih dan mudah dibaca dari nol',
            'Mengotomatiskan tugas bisnis dan alur kerja yang berulang',
            'Memproses dan menganalisis file data (CSV, Excel, JSON)',
            'Membangun skrip dan alat berguna untuk pekerjaan harian',
            'Terhubung ke API dan mengambil data langsung secara otomatis',
        ],
        whoForID: [
            'Analis bisnis, pemasar, atau profesional operasi yang berurusan dengan tugas data berulang.',
            'Siapa pun yang ingin menambahkan coding ke toolkit mereka tanpa menjadi developer penuh waktu.',
            'Peralih karier yang menargetkan peran terkait Python.',
        ],
        whatYouGetID: [
            'Pelatihan langsung interaktif (total 4 jam)',
            'Tanya jawab real-time dengan instruktur',
            'Sertifikat penyelesaian',
            'Proyek otomatisasi portofolio',
            'Akses komunitas pelajar privat',
            'Rekaman sesi untuk diputar ulang',
            'Bimbingan karier & notifikasi peluang kerja',
        ],
        whyWorthItID: [
            'Bahasa pemrograman paling diminati secara global di 2025',
            'Mulai membangun alat nyata sejak hari pertama \u2014 tanpa basa-basi',
            'Tidak diperlukan pengalaman coding sebelumnya',
            'Instruktur telah mengotomatiskan alur kerja di skala enterprise',
            'Keterampilan yang berlaku di industri dan perusahaan apa pun',
        ],
        targetRolesID: ['Developer Python', 'Engineer Otomatisasi', 'Engineer Data'],
        durationID: '4 jam',
        testimonialQuoteID: 'Python akhirnya mudah dipahami. Saya mengotomatiskan setengah proses laporan bulanan saya hanya dalam 2 sesi.',
        instructor: {
            name: 'Hassan Hanif',
            role: 'Python Developer & Automation Specialist',
            company: 'IT Consultant',
            experience: '5+ years in Python development, automation & data engineering',
            credentials: [
                'Python automation expert — scripts deployed across multiple industries',
                'Certified instructor with hands-on teaching experience',
                'Proficient in Python, FastAPI, Pandas, and automation frameworks',
                'Helped 200+ professionals automate their workflows with Python',
            ],
            initials: 'HH',
            accentColor: '#11998e',
            bgGradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
            loom: 'https://www.loom.com/share/95d5a844acc84001bfd1e784169222f6',
        },
        schedules: [
            { id: 's1', date: 'Apr 4',  dayOfWeek: 'Saturday', month: 'Apr', day: 4,  time: '10:00', timeEnd: '12:00', seatsLeft: 0  },
            { id: 's2', date: 'Apr 5',  dayOfWeek: 'Sunday',   month: 'Apr', day: 5,  time: '14:00', timeEnd: '16:00', seatsLeft: 0  },
            { id: 's3', date: 'Apr 11', dayOfWeek: 'Saturday', month: 'Apr', day: 11, time: '10:00', timeEnd: '12:00', seatsLeft: 0  },
            { id: 's4', date: 'Apr 12', dayOfWeek: 'Sunday',   month: 'Apr', day: 12, time: '19:00', timeEnd: '21:00', seatsLeft: 2  },
            { id: 's5', date: 'Apr 18', dayOfWeek: 'Saturday', month: 'Apr', day: 18, time: '14:00', timeEnd: '16:00', seatsLeft: 7  },
            { id: 's6', date: 'Apr 26', dayOfWeek: 'Sunday',   month: 'Apr', day: 26, time: '10:00', timeEnd: '12:00', seatsLeft: 12 },
        ],
        tags: ['Python', 'Automation', 'Scripting', 'APIs', 'Productivity'],
        syllabusDetails: {
            sessions: [
                {
                    title: 'Session 1 (2 Hours): Python Fundamentals',
                    items: [
                        'Write your first Python scripts (no prior coding needed).',
                        'Work with variables, loops, and functions.',
                        'Read and write files automatically.'
                    ]
                },
                {
                    title: 'Session 2 (2 Hours): Automation in Action',
                    items: [
                        'Automate Excel/CSV report generation.',
                        'Use libraries like os and pandas to manipulate data.',
                        'Scrape simple web data (e.g., competitor prices, news headlines).'
                    ]
                }
            ],
            project: 'Create a custom automation tool that solves a problem you face at work\u2014like consolidating weekly sales reports or extracting key figures from emails.',
            careerOutcomes: {
                roles: [
                    'Python Automation Specialist, Data Analyst, or Junior Developer.',
                    '40%+ salary increases reported by past students.'
                ]
            }
        },
        syllabusDetailsID: {
            sessions: [
                {
                    title: 'Sesi 1 (2 Jam): Dasar-Dasar Python',
                    items: [
                        'Tulis skrip Python pertamamu (tidak perlu pengalaman coding).',
                        'Bekerja dengan variabel, perulangan, dan fungsi.',
                        'Membaca dan menulis file secara otomatis.'
                    ]
                },
                {
                    title: 'Sesi 2 (2 Jam): Otomatisasi dalam Aksi',
                    items: [
                        'Mengotomatiskan pembuatan laporan Excel/CSV.',
                        'Menggunakan library seperti os dan pandas untuk memanipulasi data.',
                        'Mengambil data web sederhana (misalnya harga kompetitor, berita terkini).'
                    ]
                }
            ],
            project: 'Buat alat otomatisasi kustom yang memecahkan masalah yang kamu hadapi di tempat kerja\u2014seperti menggabungkan laporan penjualan mingguan atau mengekstrak angka penting dari email.',
            careerOutcomes: {
                roles: [
                    'Spesialis Otomatisasi Python, Analis Data, atau Junior Developer.',
                    'Kenaikan gaji 40%+ dilaporkan oleh siswa terdahulu.'
                ]
            }
        },
    },
    {
        id: 'graphic-design-ai',
        slug: 'graphic-design-ai',
        tutorEmail: 'anumzulfiqar2@gamil.com',
        category: 'Graphic Design & AI',
        title: 'Graphic Design with AI',
        subtitle: 'Create Stunning Visuals \u2014 Faster',
        description: 'Leverage AI tools to produce high-quality designs in a fraction of the time. You\u2019ll learn how to prompt AI generators (like Midjourney, DALL\u00b7E) and refine outputs into professional-grade assets for social media, branding, and client work.',
        icon: '\ud83c\udfa8',
        iconBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        imageIcon: '/assets/icons/design.png',
        duration: '4 hours',
        format: '2 days \xd7 2 hours',
        price: 49,
        originalPrice: 99,
        currency: 'USD',
        rating: 4.9,
        studentsCount: 754,
        nextSession: 'Apr 5\u20136',
        seatsLeft: 6,
        targetRoles: ['AI Designer', 'Creative Director', 'Brand Designer'],
        priceMYR: 119,
        originalPriceMYR: 380,
        priceIDR: 400000,
        originalPriceIDR: 1500000,
        testimonialQuote: 'By day 2 I was making assets I used in real client projects. Nothing comes close to this format.',
        testimonialAuthor: 'Budi S. \u2014 Freelance Designer',
        outcomes: [
            'Master Midjourney, DALL-E, and Adobe Firefly',
            'Apply professional design theory to AI-generated outputs',
            'Create brand identity assets and social media content',
            'Build a diverse portfolio of high-quality design work',
            'Design for web, social, and marketing in minutes not hours',
        ],
        whoFor: [
            'Freelance designers wanting to multiply their output.',
            'Small business owners who need in-house design skills.',
            'Marketers and content creators who want eye-catching visuals fast.',
        ],
        whatYouGet: [
            'Live interactive training (4 hours total)',
            'Real-time Q&A with your instructor',
            'Certificate of completion',
            'Portfolio-ready design collection',
            'Private student community access',
            'AI tool prompt library (200+ tested prompts)',
            'Career guidance & job opportunity alerts',
        ],
        whyWorthIt: [
            'AI tools have fundamentally changed what one person can create',
            'Design + AI = multiplied output, speed, and market value',
            'Instructor has worked with Google, Unilever, and Samsung',
            'Build a real portfolio by the end of day 2',
            'Fastest-growing creative skill set in SEA jobs market',
        ],
        // Indonesian
        titleID: 'Desain Grafis dengan AI',
        subtitleID: 'Buat Visual Memukau \u2014 Lebih Cepat',
        descriptionID: 'Manfaatkan alat AI untuk menghasilkan desain berkualitas tinggi dalam waktu lebih singkat. Kamu akan belajar cara memberi prompt pada generator AI (seperti Midjourney, DALL\u00b7E) dan menyempurnakan hasilnya menjadi aset profesional untuk media sosial, branding, dan proyek klien.',
        outcomesID: [
            'Kuasai Midjourney, DALL-E, dan Adobe Firefly',
            'Terapkan teori desain profesional pada output yang dihasilkan AI',
            'Buat aset identitas merek dan konten media sosial',
            'Bangun portofolio desain berkualitas tinggi yang beragam',
            'Desain untuk web, sosial, dan pemasaran dalam menit bukan jam',
        ],
        whoForID: [
            'Desainer freelance yang ingin melipatgandakan output mereka.',
            'Pemilik bisnis kecil yang membutuhkan keterampilan desain in-house.',
            'Pemasar dan pembuat konten yang ingin visual menarik dengan cepat.',
        ],
        whatYouGetID: [
            'Pelatihan langsung interaktif (total 4 jam)',
            'Tanya jawab real-time dengan instruktur',
            'Sertifikat penyelesaian',
            'Koleksi desain siap portofolio',
            'Akses komunitas pelajar privat',
            'Perpustakaan prompt alat AI (200+ prompt yang telah diuji)',
            'Bimbingan karier & notifikasi peluang kerja',
        ],
        whyWorthItID: [
            'Alat AI telah mengubah secara fundamental apa yang bisa diciptakan satu orang',
            'Desain + AI = output berlipat, kecepatan, dan nilai pasar',
            'Instruktur telah bekerja dengan Google, Unilever, dan Samsung',
            'Bangun portofolio nyata pada akhir hari ke-2',
            'Keterampilan kreatif yang paling cepat berkembang di pasar kerja SEA',
        ],
        targetRolesID: ['Desainer AI', 'Direktur Kreatif', 'Desainer Merek'],
        durationID: '4 jam',
        testimonialQuoteID: 'Pada hari ke-2 saya sudah membuat aset yang digunakan di proyek klien nyata. Tidak ada yang menandingi format ini.',
        instructor: {
            name: 'Siti Nurhaliza',
            role: 'Creative Director & AI Design Lead',
            company: 'Top Regional Creative Agency',
            experience: '10+ years in brand design and AI-augmented workflows',
            credentials: [
                'Creative work for Google, Unilever, and Samsung campaigns',
                'Trained 300+ designers on AI-augmented workflows',
                'Adobe Certified Expert (ACE)',
                'Featured in Behance Top 1% creators',
            ],
            initials: 'SN',
            accentColor: '#f093fb',
            bgGradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
        },
        schedules: [
            { id: 's1', date: 'Mar 15\u201316', dayOfWeek: 'Sat\u2013Sun', month: 'Mar', day: 15, time: '10:00', timeEnd: '12:00', seatsLeft: 0 },
            { id: 's2', date: 'Mar 22\u201323', dayOfWeek: 'Sat\u2013Sun', month: 'Mar', day: 22, time: '13:00', timeEnd: '15:00', seatsLeft: 9 },
            { id: 's3', date: 'Apr 5\u20136', dayOfWeek: 'Sat\u2013Sun', month: 'Apr', day: 5, time: '10:00', timeEnd: '12:00', seatsLeft: 12 },
            { id: 's4', date: 'Apr 12\u201313', dayOfWeek: 'Sat\u2013Sun', month: 'Apr', day: 12, time: '10:00', timeEnd: '12:00', seatsLeft: 8 },
            { id: 's5', date: 'Apr 19\u201320', dayOfWeek: 'Sat\u2013Sun', month: 'Apr', day: 19, time: '13:00', timeEnd: '15:00', seatsLeft: 12 },
            { id: 's6', date: 'Apr 26\u201327', dayOfWeek: 'Sat\u2013Sun', month: 'Apr', day: 26, time: '10:00', timeEnd: '12:00', seatsLeft: 12 },
        ],
        tags: ['Midjourney', 'DALL-E', 'Branding', 'Social Media', 'Creative AI'],
        syllabusDetails: {
            sessions: [
                {
                    title: 'Session 1 (2 Hours): AI Prompt Mastery',
                    items: [
                        'Craft effective prompts to generate logos, illustrations, and social media graphics.',
                        'Understand design principles (composition, color, typography) to guide AI.',
                        'Explore the best AI tools for different design needs.'
                    ]
                },
                {
                    title: 'Session 2 (2 Hours): From AI to Final Product',
                    items: [
                        'Edit and enhance AI-generated images using Canva or Photoshop.',
                        'Combine AI assets into cohesive branding kits.',
                        'Create mockups for client presentations.'
                    ]
                }
            ],
            project: 'Produce a complete brand identity package for a fictional or real business: logo, social media templates, and a promotional flyer\u2014all co-created with AI.',
            careerOutcomes: {
                roles: [
                    'AI-Augmented Designer, Social Media Manager, or Creative Lead.',
                    'Charge 2\u20133\xd7 your previous rates by delivering faster.'
                ]
            }
        },
        syllabusDetailsID: {
            sessions: [
                {
                    title: 'Sesi 1 (2 Jam): Penguasaan Prompt AI',
                    items: [
                        'Membuat prompt efektif untuk menghasilkan logo, ilustrasi, dan grafik media sosial.',
                        'Memahami prinsip desain (komposisi, warna, tipografi) untuk memandu AI.',
                        'Menjelajahi alat AI terbaik untuk berbagai kebutuhan desain.'
                    ]
                },
                {
                    title: 'Sesi 2 (2 Jam): Dari AI ke Produk Akhir',
                    items: [
                        'Mengedit dan menyempurnakan gambar yang dihasilkan AI menggunakan Canva atau Photoshop.',
                        'Menggabungkan aset AI menjadi kit branding yang kohesif.',
                        'Membuat mockup untuk presentasi klien.'
                    ]
                }
            ],
            project: 'Hasilkan paket identitas merek lengkap untuk bisnis fiktif atau nyata: logo, template media sosial, dan flyer promosi\u2014semua dibuat bersama AI.',
            careerOutcomes: {
                roles: [
                    'Desainer Bertenaga AI, Manajer Media Sosial, atau Creative Lead.',
                    'Kenakan tarif 2\u20133\xd7 lebih tinggi dari sebelumnya dengan menyelesaikan lebih cepat.'
                ]
            }
        },
    },
    {
        id: 'llm-ai-engineering',
        slug: 'llm-ai-engineering',
        tutorEmail: 'hassan.hanif2014@gmail.com',
        category: 'LLM & AI Engineering',
        title: 'LLM & AI Engineering',
        subtitle: 'Build Intelligent AI-Powered Products',
        description: 'Go beyond ChatGPT\u2014learn how to integrate large language models (LLMs) into applications. In 4 hours, you\u2019ll understand how LLMs work, master prompt engineering, and build a simple AI-powered tool.',
        icon: '\ud83e\udd16',
        iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        imageIcon: '/assets/icons/llm.png',
        duration: '4 hours',
        format: '2 days \xd7 2 hours',
        price: 79,
        originalPrice: 149,
        currency: 'USD',
        rating: 5.0,
        studentsCount: 412,
        nextSession: 'Apr 8\u20139',
        seatsLeft: 4,
        targetRoles: ['AI Engineer', 'LLM Developer', 'ML Engineer'],
        priceMYR: 155,
        originalPriceMYR: 499,
        priceIDR: 400000,
        originalPriceIDR: 1500000,
        testimonialQuote: 'Shipped my first AI feature to production 2 weeks after the course. The instructor makes it approachable.',
        testimonialAuthor: 'Rizal H. \u2014 Full-Stack Developer',
        outcomes: [
            'Understand how LLMs actually work under the hood',
            'Build custom AI chatbots and intelligent assistants',
            'Integrate the OpenAI API into real web applications',
            'Master prompt engineering for reliable, consistent outputs',
            'Deploy AI-powered features to production environments',
        ],
        whoFor: [
            'Developers, product managers, or entrepreneurs who want to add AI features to products.',
            'Tech-savvy professionals looking to future-proof their careers.',
            'Anyone curious about building with AI, not just using it.',
        ],
        whatYouGet: [
            'Live interactive AI engineering session (4 hours)',
            'Real-time Q&A with your instructor',
            'Certificate of completion',
            'Working AI application portfolio project',
            'Private AI engineering community access',
            'Session recording for replay',
            'Career guidance in the AI engineering field',
        ],
        whyWorthIt: [
            'AI engineering is the single most in-demand skill in 2026',
            'Build a real, deployed AI app you can demo to employers',
            'Learn from a practitioner who ships AI to 1M+ users',
            'Companies are paying 40\u201360% premiums for AI skills now',
            'Position yourself ahead of the AI skill wave \u2014 today',
        ],
        // Indonesian
        titleID: 'Rekayasa LLM & AI',
        subtitleID: 'Bangun Produk Cerdas Bertenaga AI',
        descriptionID: 'Lampaui ChatGPT\u2014pelajari cara mengintegrasikan model bahasa besar (LLM) ke dalam aplikasi. Dalam 4 jam, kamu akan memahami cara kerja LLM, menguasai rekayasa prompt, dan membangun alat bertenaga AI sederhana.',
        outcomesID: [
            'Memahami cara kerja LLM sesungguhnya',
            'Membangun chatbot AI kustom dan asisten cerdas',
            'Mengintegrasikan API OpenAI ke dalam aplikasi web nyata',
            'Menguasai rekayasa prompt untuk output yang andal dan konsisten',
            'Men-deploy fitur bertenaga AI ke lingkungan produksi',
        ],
        whoForID: [
            'Developer, manajer produk, atau wirausaha yang ingin menambahkan fitur AI ke produk.',
            'Profesional melek teknologi yang ingin memfuture-proof karier mereka.',
            'Siapa pun yang penasaran tentang membangun dengan AI, bukan hanya menggunakannya.',
        ],
        whatYouGetID: [
            'Sesi rekayasa AI langsung interaktif (4 jam)',
            'Tanya jawab real-time dengan instruktur',
            'Sertifikat penyelesaian',
            'Proyek portofolio aplikasi AI yang berfungsi',
            'Akses komunitas rekayasa AI privat',
            'Rekaman sesi untuk diputar ulang',
            'Bimbingan karier di bidang rekayasa AI',
        ],
        whyWorthItID: [
            'Rekayasa AI adalah keterampilan paling diminati di tahun 2026',
            'Bangun aplikasi AI nyata yang di-deploy dan bisa didemokan ke perusahaan',
            'Belajar dari praktisi yang mengirimkan AI ke 1 juta+ pengguna',
            'Perusahaan membayar premium 40\u201360% untuk keahlian AI sekarang',
            'Posisikan dirimu di depan gelombang keterampilan AI \u2014 mulai hari ini',
        ],
        targetRolesID: ['Engineer AI', 'Developer LLM', 'Engineer ML'],
        durationID: '4 jam',
        testimonialQuoteID: 'Meluncurkan fitur AI pertama saya ke produksi 2 minggu setelah kursus. Instrukturnya membuat semuanya mudah dipahami.',
        instructor: {
            name: 'Rizky Firmansyah',
            role: 'AI Engineering Lead',
            company: 'Global AI Company',
            experience: '6+ years in ML systems and AI product development',
            credentials: [
                'Built AI products used by 1M+ users globally',
                'Engineering experience at Microsoft AI and Tokopedia',
                'Conference speaker at AI/ML events across Southeast Asia',
                'Google Cloud AI Certified Professional',
            ],
            initials: 'RF',
            accentColor: '#4facfe',
            bgGradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        },
        schedules: [
            { id: 's1', date: 'Mar 18\u201319', dayOfWeek: 'Tue\u2013Wed', month: 'Mar', day: 18, time: '19:00', timeEnd: '21:00', seatsLeft: 4 },
            { id: 's2', date: 'Mar 25\u201326', dayOfWeek: 'Tue\u2013Wed', month: 'Mar', day: 25, time: '19:00', timeEnd: '21:00', seatsLeft: 8 },
            { id: 's3', date: 'Apr 1\u20132', dayOfWeek: 'Tue\u2013Wed', month: 'Apr', day: 1, time: '14:00', timeEnd: '16:00', seatsLeft: 12 },
        ],
        tags: ['OpenAI', 'LLM', 'ChatGPT', 'AI Engineering', 'APIs'],
        syllabusDetails: {
            sessions: [
                {
                    title: 'Session 1 (2 Hours): Foundations of LLMs',
                    items: [
                        'How GPT and similar models work (simplified).',
                        'Advanced prompt engineering: role-playing, chain-of-thought, and context management.',
                        'Ethics and limitations of AI.'
                    ]
                },
                {
                    title: 'Session 2 (2 Hours): Building with AI',
                    items: [
                        'Access LLMs via APIs (OpenAI, Hugging Face).',
                        'Build a simple chatbot or content generator.',
                        'Deploy your AI app (no-code or low-code options).'
                    ]
                }
            ],
            project: 'Create a functional AI prototype\u2014for example, a customer support bot, a personalized email writer, or a data extractor from text.',
            careerOutcomes: {
                roles: [
                    'AI Engineer, Prompt Engineer, or AI Product Manager.',
                    'High-demand roles across tech and enterprise.'
                ]
            }
        },
        syllabusDetailsID: {
            sessions: [
                {
                    title: 'Sesi 1 (2 Jam): Fondasi LLM',
                    items: [
                        'Cara kerja GPT dan model serupa (disederhanakan).',
                        'Rekayasa prompt tingkat lanjut: role-playing, chain-of-thought, dan manajemen konteks.',
                        'Etika dan keterbatasan AI.'
                    ]
                },
                {
                    title: 'Sesi 2 (2 Jam): Membangun dengan AI',
                    items: [
                        'Mengakses LLM melalui API (OpenAI, Hugging Face).',
                        'Membangun chatbot sederhana atau generator konten.',
                        'Men-deploy aplikasi AI (opsi no-code atau low-code).'
                    ]
                }
            ],
            project: 'Buat prototipe AI yang berfungsi\u2014misalnya bot dukungan pelanggan, penulis email personal, atau ekstraktor data dari teks.',
            careerOutcomes: {
                roles: [
                    'Engineer AI, Prompt Engineer, atau Manajer Produk AI.',
                    'Peran permintaan tinggi di seluruh teknologi dan enterprise.'
                ]
            }
        },
    },
    {
        id: "intermediate-data-analytics",
        slug: "intermediate-data-analytics",
        category: "Data Analytics",
        title: "Intermediate Data Analyst",
        subtitle: "Advanced SQL & Predictive Modeling",
        description: "Take your analysis skills to the next level. Learn advanced SQL, complex data modeling, and predictive analytics. Master automated reporting and tell deeper stories with data.",
        icon: "\ud83d\udcc8",
        iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        duration: "4 hours",
        format: "2 days \xd7 2 hours",
        price: 69,
        originalPrice: 129,
        currency: "USD",
        rating: 4.9,
        studentsCount: 856,
        nextSession: "Apr 19\u201320",
        seatsLeft: 5,
        targetRoles: ["Senior Data Analyst", "Data Scientist", "Business Intelligence Lead"],
        priceMYR: 499,
        originalPriceMYR: 499,
        priceIDR: 800000,
        originalPriceIDR: 1800000,
        testimonialQuote: "The advanced SQL modules alone were worth the price. I optimized our monthly reporting by 80%.",
        testimonialAuthor: "Siti K. \u2014 BI Developer",
        outcomes: [
            "Master complex SQL queries and window functions",
            "Build predictive models for business forecasting",
            "Design scalable data architectures for small teams",
        ],
        whoFor: [
            "Basic analysts ready to level up",
            "Business managers improving data literacy",
            "Tech leads overseeing data teams",
        ],
        whatYouGet: [
            "Deep-dive intermediate live session",
            "Advanced SQL cheat sheet and templates",
            "Complex dataset for practice",
            "Certificate of competency",
            "Direct access to senior analytics mentor",
        ],
        whyWorthIt: [
            "Master the skills that distinguish senior analysts",
            "Learn to automate 50% of your current manual work",
            "Build a portfolio piece that handles 1M+ rows",
        ],
        // Indonesian
        titleID: "Analis Data Menengah",
        subtitleID: "SQL Tingkat Lanjut & Pemodelan Prediktif",
        descriptionID: "Tingkatkan kemampuan analisis ke level berikutnya. Pelajari SQL tingkat lanjut, pemodelan data kompleks, dan analitik prediktif. Kuasai pelaporan otomatis dan ceritakan kisah lebih mendalam dengan data.",
        outcomesID: [
            "Menguasai kueri SQL kompleks dan fungsi window",
            "Membangun model prediktif untuk peramalan bisnis",
            "Merancang arsitektur data yang skalabel untuk tim kecil",
        ],
        whoForID: [
            "Analis dasar yang siap naik level",
            "Manajer bisnis yang meningkatkan literasi data",
            "Tech lead yang mengawasi tim data",
        ],
        whatYouGetID: [
            "Sesi langsung menengah yang mendalam",
            "Cheat sheet dan template SQL tingkat lanjut",
            "Dataset kompleks untuk latihan",
            "Sertifikat kompetensi",
            "Akses langsung ke mentor analitik senior",
        ],
        whyWorthItID: [
            "Kuasai keterampilan yang membedakan analis senior",
            "Pelajari cara mengotomatiskan 50% pekerjaan manual saat ini",
            "Bangun proyek portofolio yang menangani 1 juta+ baris",
        ],
        targetRolesID: ["Analis Data Senior", "Data Scientist", "Pimpinan Business Intelligence"],
        durationID: "4 jam",
        testimonialQuoteID: "Modul SQL tingkat lanjut saja sudah sepadan dengan harganya. Saya mengoptimalkan pelaporan bulanan kami sebesar 80%.",
        instructor: {
            name: "Arman Rahman",
            role: "Senior Data Analyst",
            company: "Global Technology Company",
            experience: "8+ years in enterprise analytics & data engineering",
            credentials: [
                "Clients include Google, Microsoft, and Mars",
                "Built analytics systems used by Fortune 500 companies",
                "Certified Data Professional (CDP)",
                "Regional data conference speaker",
            ],
            initials: "AR",
            accentColor: "#667eea",
            bgGradient: "linear-gradient(135deg, #667eea, #764ba2)",
        },
        schedules: [
            { id: "s1", date: "Mar 15\u201316", dayOfWeek: "Sat\u2013Sun", month: "Mar", day: 15, time: "14:00", timeEnd: "16:00", seatsLeft: 5 },
        ],
        tags: ["SQL", "Modeling", "Analytics", "Intermediate"],
    },
    {
        id: "advanced-data-analytics",
        slug: "advanced-data-analytics",
        category: "Data Analytics",
        title: "Advanced Data Analyst",
        subtitle: "Enterprise Analytics & Big Data",
        description: "Become a lead analyst. Master machine learning for business, big data architectures, and strategic decision support. Build a full-scale enterprise analytics solution.",
        icon: "\ud83d\udc8e",
        iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        duration: "8 hours",
        format: "4 days \xd7 2 hours",
        price: 299,
        originalPrice: 499,
        currency: "USD",
        rating: 5.0,
        studentsCount: 312,
        nextSession: "May 1\u20134",
        seatsLeft: 3,
        targetRoles: ["Lead Data Analyst", "Head of Data", "Analytics Consultant"],
        priceMYR: 499,
        originalPriceMYR: 499,
        priceIDR: 5000000,
        originalPriceIDR: 9000000,
        testimonialQuote: "This course gave me the confidence to lead our entire data department transformation.",
        testimonialAuthor: "Kevin J. \u2014 Head of Analytics",
        outcomes: [
            "Deploy machine learning models to production",
            "Architect big data pipelines for enterprise scale",
            "Lead strategic data-driven business reviews",
        ],
        whoFor: [
            "Intermediate analysts moving to leadership roles",
            "Entrepreneurs building data-first products",
            "Consultants specializing in digital transformation",
        ],
        whatYouGet: [
            "Intensive advanced live sessions (8 hours)",
            "Enterprise-grade project templates",
            "1-on-1 strategy session with instructor",
            "Elite certificate of mastery",
            "Priority job referral network access",
        ],
        whyWorthIt: [
            "Command the highest salaries in the data field",
            "Learn to manage entire data team workflows",
            "Build a project using actual big data technologies",
        ],
        // Indonesian
        titleID: "Analis Data Lanjutan",
        subtitleID: "Analitik Enterprise & Big Data",
        descriptionID: "Jadilah analis pemimpin. Kuasai machine learning untuk bisnis, arsitektur big data, dan dukungan keputusan strategis. Bangun solusi analitik enterprise skala penuh.",
        outcomesID: [
            "Men-deploy model machine learning ke produksi",
            "Merancang pipeline big data untuk skala enterprise",
            "Memimpin tinjauan bisnis berbasis data yang strategis",
        ],
        whoForID: [
            "Analis menengah yang bergerak menuju peran kepemimpinan",
            "Wirausaha yang membangun produk berbasis data",
            "Konsultan yang spesialisasi dalam transformasi digital",
        ],
        whatYouGetID: [
            "Sesi langsung lanjutan intensif (8 jam)",
            "Template proyek kelas enterprise",
            "Sesi strategi 1-on-1 dengan instruktur",
            "Sertifikat keunggulan elite",
            "Akses jaringan referral pekerjaan prioritas",
        ],
        whyWorthItID: [
            "Peroleh gaji tertinggi di bidang data",
            "Pelajari cara mengelola seluruh alur kerja tim data",
            "Bangun proyek menggunakan teknologi big data sesungguhnya",
        ],
        targetRolesID: ["Analis Data Utama", "Kepala Data", "Konsultan Analitik"],
        durationID: "8 jam",
        testimonialQuoteID: "Kursus ini memberi saya kepercayaan diri untuk memimpin transformasi seluruh departemen data kami.",
        instructor: {
            name: "Arman Rahman",
            role: "Senior Data Analyst",
            company: "Global Technology Company",
            experience: "8+ years in enterprise analytics & data engineering",
            credentials: [
                "Clients include Google, Microsoft, and Mars",
                "Built analytics systems used by Fortune 500 companies",
                "Certified Data Professional (CDP)",
                "Regional data conference speaker",
            ],
            initials: "AR",
            accentColor: "#667eea",
            bgGradient: "linear-gradient(135deg, #667eea, #764ba2)",
        },
        schedules: [
            { id: "s1", date: "Apr 2\u20135", dayOfWeek: "Thu\u2013Sun", month: "Apr", day: 2, time: "19:00", timeEnd: "21:00", seatsLeft: 3 },
        ],
        tags: ["Big Data", "Machine Learning", "Leadership", "Advanced"],
    },
];

export function getCourseBySlug(slug: string): Course | undefined {
    return courses.find(c => c.slug === slug);
}

export const testimonials = [
    {
        id: 1,
        quote: 'After the course, I built my first dashboard and added it to my portfolio. I landed a data analyst job within 3 weeks.',
        name: 'Arif Setiyawan',
        role: 'Junior Data Analyst',
        company: 'Tech Startup, Jakarta',
        rating: 5,
        course: 'Data Analytics',
        initials: 'AS',
        accentColor: '#667eea',
    },
    {
        id: 2,
        quote: "Python finally clicked. The instructor's live explanations made everything so clear. I automated half my monthly reporting.",
        name: 'Mei Rahayu',
        role: 'Business Analyst',
        company: 'FMCG Company',
        rating: 5,
        course: 'Python Programming',
        initials: 'MR',
        accentColor: '#11998e',
    },
    {
        id: 3,
        quote: 'I was skeptical, but by day 2 I was creating visuals I used in actual client projects. Nothing comes close to this format.',
        name: 'Budi Santoso',
        role: 'Freelance Designer',
        company: 'Independent',
        rating: 5,
        course: 'Graphic Design & AI',
        initials: 'BS',
        accentColor: '#f093fb',
    },
];

export const companyLogos = [
    { name: 'Google', color: '#4285F4' },
    { name: 'Microsoft', color: '#00A4EF' },
    { name: 'Mars', color: '#E8001D' },
    { name: 'Gojek', color: '#00AA5B' },
    { name: 'Tokopedia', color: '#03AC0E' },
    { name: 'Grab', color: '#00B14F' },
];
