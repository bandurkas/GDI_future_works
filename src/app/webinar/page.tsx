import { Metadata } from 'next';
import WebinarClient from './WebinarClient';

export const metadata: Metadata = {
    title: 'Webinar AI Vibe Coding · Rp 400rb · Master AI-Assisted Coding Workflow',
    description:
        'Webinar live 60 menit · Rp 400.000. Pelajari cara developer modern memakai Claude, Gemini, Cursor, dan GPT untuk planning, coding, debugging, review, dan shipping aplikasi end-to-end. Bonus 30+ AI Prompts Pack + akses replay 24 jam.',
    openGraph: {
        title: 'Webinar AI Vibe Coding — Master AI-Assisted Coding Workflow',
        description:
            'Pelajari workflow end-to-end developer modern pakai Claude, Gemini, Cursor, dan GPT: planning, coding, debugging, review, shipping. 60 menit · Live · Investasi Rp 400rb.',
        type: 'website',
        url: 'https://gdifuture.works/webinar',
    },
    robots: { index: true, follow: true },
};

export default function WebinarPage() {
    return <WebinarClient />;
}
