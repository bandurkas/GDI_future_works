import { Metadata } from 'next';
import WebinarClient from './WebinarClient';
import MixpanelScript from './MixpanelScript';

export const metadata: Metadata = {
    title: 'Webinar AI Vibe Coding · GRATIS (sebelumnya Rp 400rb) · Master AI-Assisted Coding Workflow',
    description:
        'Webinar live 60 menit — sebelumnya Rp 400.000, sekarang GRATIS. Pelajari cara developer modern memakai Claude, Gemini, Cursor, dan GPT untuk planning, coding, debugging, review, dan shipping aplikasi end-to-end. Bonus 30+ AI Prompts Pack + akses replay 24 jam. Slot terbatas.',
    openGraph: {
        title: 'Webinar AI Vibe Coding — GRATIS · Master AI-Assisted Coding Workflow',
        description:
            'Sebelumnya Rp 400.000, sekarang GRATIS. Workflow end-to-end developer modern pakai Claude, Gemini, Cursor, dan GPT: planning, coding, debugging, review, shipping. 60 menit · Live · Slot terbatas.',
        type: 'website',
        url: 'https://gdifuture.works/webinar',
    },
    robots: { index: true, follow: true },
};

export default function WebinarPage() {
    return (
        <>
            <MixpanelScript />
            <WebinarClient />
        </>
    );
}
