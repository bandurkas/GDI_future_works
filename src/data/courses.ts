export interface Instructor {
    name: string;
    role: string;
    company: string;
    experience: string;
    credentials: string[];
    initials: string;
    accentColor: string;
    bgGradient: string;
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
    seatsLeft: number;
    outcomes: string[];
    whoFor: string[];
    whatYouGet: string[];
    whyWorthIt: string[];
    instructor: Instructor;
    schedules: Schedule[];
    tags: string[];
    testimonialQuote: string;
    testimonialAuthor: string;
}

export const courses: Course[] = [
    {
        id: '1',
        slug: 'data-analytics',
        category: 'Data Analytics',
        title: 'Data Analytics Essentials',
        subtitle: 'From Raw Data to Business Insights',
        description: 'Learn how analysts turn raw data into clear business insights. In this live session, you’ll work with real datasets using Python and Pandas, clean messy data, and create visual dashboards used in real companies.',
        icon: '📊',
        iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        imageIcon: '/assets/icons/data.png',
        duration: '4 hours',
        format: '2 days × 2 hours',
        price: 49,
        originalPrice: 99,
        currency: 'USD',
        rating: 4.9,
        studentsCount: 1247,
        nextSession: 'Mar 12–13',
        seatsLeft: 3,
        testimonialQuote: 'After the course I built my first dashboard and landed a data analyst role within 3 weeks.',
        testimonialAuthor: 'Arif S. — Junior Analyst',
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
        instructor: {
            name: 'Arman Rahman',
            role: 'Senior Data Analyst',
            company: 'Global Technology Company',
            experience: '8+ years in enterprise analytics & data engineering',
            credentials: [
                'Clients include Google, Microsoft, and Mars',
                'Built analytics systems used by Fortune 500 companies',
                'Certified Data Professional (CDP)',
                'Regional data conference speaker',
            ],
            initials: 'AR',
            accentColor: '#667eea',
            bgGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
        },
        schedules: [
            { id: 's1', date: 'Mar 12–13', dayOfWeek: 'Wed–Thu', month: 'Mar', day: 12, time: '19:00', timeEnd: '21:00', seatsLeft: 3 },
            { id: 's2', date: 'Mar 19–20', dayOfWeek: 'Wed–Thu', month: 'Mar', day: 19, time: '19:00', timeEnd: '21:00', seatsLeft: 8 },
            { id: 's3', date: 'Mar 26–27', dayOfWeek: 'Wed–Thu', month: 'Mar', day: 26, time: '14:00', timeEnd: '16:00', seatsLeft: 12 },
            { id: 's4', date: 'Apr 2–3', dayOfWeek: 'Wed–Thu', month: 'Apr', day: 2, time: '19:00', timeEnd: '21:00', seatsLeft: 15 },
        ],
        tags: ['Python', 'Pandas', 'Data', 'Analytics', 'Visualization'],
    },
    {
        id: '2',
        slug: 'python-programming',
        category: 'Python Programming',
        title: 'Python for Professionals',
        subtitle: 'Automate Tasks & Build Smart Tools',
        description: 'Master Python to automate repetitive work, process data files, and build tools that save your team hours every week.',
        icon: '🐍',
        iconBg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        imageIcon: '/assets/icons/python.png',
        duration: '4 hours',
        format: '2 days × 2 hours',
        price: 49,
        originalPrice: 99,
        currency: 'USD',
        rating: 4.8,
        studentsCount: 983,
        nextSession: 'Mar 14–15',
        seatsLeft: 5,
        testimonialQuote: 'Python finally clicked for me. I automated half my monthly report process after just 2 sessions.',
        testimonialAuthor: 'Mei R. — Business Analyst',
        outcomes: [
            'Write clean, readable Python from scratch',
            'Automate repetitive business tasks and workflows',
            'Process and analyze data files (CSV, Excel, JSON)',
            'Build useful scripts and tools for your daily work',
            'Connect to APIs and pull live data automatically',
        ],
        whoFor: [
            'Non-programmers in business or analyst roles',
            'Professionals who want to stop doing manual work',
            'Students starting their first coding journey',
            'Anyone who keeps hearing "just automate it" at work',
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
            'Start building real tools from day one — no fluff',
            'No prior coding experience whatsoever required',
            'Instructor has automated workflows at enterprise scale',
            'Skills that apply in any industry, any company',
        ],
        instructor: {
            name: 'Dian Pratiwi',
            role: 'Senior Software Engineer',
            company: 'Leading Tech Company',
            experience: '7+ years in Python, backend & automation engineering',
            credentials: [
                'Trained 500+ professionals in Python',
                'Engineering experience at Google, Gojek, and regional startups',
                'Python open-source contributor (2,000+ GitHub stars)',
                'AWS Certified Developer',
            ],
            initials: 'DP',
            accentColor: '#11998e',
            bgGradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
        },
        schedules: [
            { id: 's1', date: 'Mar 14–15', dayOfWeek: 'Fri–Sat', month: 'Mar', day: 14, time: '10:00', timeEnd: '12:00', seatsLeft: 5 },
            { id: 's2', date: 'Mar 21–22', dayOfWeek: 'Fri–Sat', month: 'Mar', day: 21, time: '19:00', timeEnd: '21:00', seatsLeft: 10 },
            { id: 's3', date: 'Apr 4–5', dayOfWeek: 'Fri–Sat', month: 'Apr', day: 4, time: '14:00', timeEnd: '16:00', seatsLeft: 14 },
        ],
        tags: ['Python', 'Automation', 'Scripting', 'APIs', 'Productivity'],
    },
    {
        id: '3',
        slug: 'graphic-design-ai',
        category: 'Graphic Design & AI',
        title: 'Graphic Design with AI',
        subtitle: 'Create Stunning Visuals — Faster',
        description: 'Combine design principles with cutting-edge AI tools to create professional-quality visuals at 10x speed.',
        icon: '🎨',
        iconBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        imageIcon: '/assets/icons/design.png',
        duration: '4 hours',
        format: '2 days × 2 hours',
        price: 49,
        originalPrice: 99,
        currency: 'USD',
        rating: 4.9,
        studentsCount: 754,
        nextSession: 'Mar 15–16',
        seatsLeft: 6,
        testimonialQuote: 'By day 2 I was making assets I used in real client projects. Nothing comes close to this format.',
        testimonialAuthor: 'Budi S. — Freelance Designer',
        outcomes: [
            'Master Midjourney, DALL-E, and Adobe Firefly',
            'Apply professional design theory to AI-generated outputs',
            'Create brand identity assets and social media content',
            'Build a diverse portfolio of high-quality design work',
            'Design for web, social, and marketing in minutes not hours',
        ],
        whoFor: [
            'Aspiring designers and creative professionals',
            'Marketers who want to own their asset creation',
            'Entrepreneurs building a personal brand',
            'Anyone wanting to leverage modern AI creative tools',
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
            { id: 's1', date: 'Mar 15–16', dayOfWeek: 'Sat–Sun', month: 'Mar', day: 15, time: '10:00', timeEnd: '12:00', seatsLeft: 6 },
            { id: 's2', date: 'Mar 22–23', dayOfWeek: 'Sat–Sun', month: 'Mar', day: 22, time: '13:00', timeEnd: '15:00', seatsLeft: 9 },
            { id: 's3', date: 'Apr 5–6', dayOfWeek: 'Sat–Sun', month: 'Apr', day: 5, time: '10:00', timeEnd: '12:00', seatsLeft: 15 },
        ],
        tags: ['Midjourney', 'DALL-E', 'Branding', 'Social Media', 'Creative AI'],
    },
    {
        id: '4',
        slug: 'llm-ai-engineering',
        category: 'LLM & AI Engineering',
        title: 'LLM & AI Engineering',
        subtitle: 'Build Intelligent AI-Powered Products',
        description: 'Design, build, and deploy real AI applications powered by Large Language Models. The most in-demand skill of 2025.',
        icon: '🤖',
        iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        imageIcon: '/assets/icons/llm.png',
        duration: '4 hours',
        format: '2 days × 2 hours',
        price: 79,
        originalPrice: 149,
        currency: 'USD',
        rating: 5.0,
        studentsCount: 412,
        nextSession: 'Mar 18–19',
        seatsLeft: 4,
        testimonialQuote: 'Shipped my first AI feature to production 2 weeks after the course. The instructor makes it approachable.',
        testimonialAuthor: 'Rizal H. — Full-Stack Developer',
        outcomes: [
            'Understand how LLMs actually work under the hood',
            'Build custom AI chatbots and intelligent assistants',
            'Integrate the OpenAI API into real web applications',
            'master prompt engineering for reliable, consistent outputs',
            'Deploy AI-powered features to production environments',
        ],
        whoFor: [
            'Developers wanting to add AI to their product toolbox',
            'Product managers exploring AI implementation strategies',
            'Tech founders building AI-first products or features',
            'Engineers transitioning into AI engineering roles',
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
            'AI engineering is the single most in-demand skill in 2025',
            'Build a real, deployed AI app you can demo to employers',
            'Learn from a practitioner who ships AI to 1M+ users',
            'Companies are paying 40–60% premiums for AI skills now',
            'Position yourself ahead of the AI skill wave — today',
        ],
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
            { id: 's1', date: 'Mar 18–19', dayOfWeek: 'Tue–Wed', month: 'Mar', day: 18, time: '19:00', timeEnd: '21:00', seatsLeft: 4 },
            { id: 's2', date: 'Mar 25–26', dayOfWeek: 'Tue–Wed', month: 'Mar', day: 25, time: '19:00', timeEnd: '21:00', seatsLeft: 8 },
            { id: 's3', date: 'Apr 1–2', dayOfWeek: 'Tue–Wed', month: 'Apr', day: 1, time: '14:00', timeEnd: '16:00', seatsLeft: 12 },
        ],
        tags: ['OpenAI', 'LLM', 'ChatGPT', 'AI Engineering', 'APIs'],
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
