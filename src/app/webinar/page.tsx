import { Metadata } from 'next';
import WebinarClient from './WebinarClient';

export const metadata: Metadata = {
    title: 'Webinar Gratis: AI Vibe Coding — Bangun App Tanpa Ngetik Tiap Baris',
    description:
        'Webinar live 60 menit. Pelajari workflow AI Vibe Coding yang dipakai developer pro tiap hari. Bonus: 30+ AI Prompts Pack siap pakai. Daftar gratis sekarang.',
    openGraph: {
        title: 'Webinar AI Vibe Coding — Bareng Bayu Sedana',
        description:
            'Stop ngetik tiap baris pakai tangan. Direct Claude, Gemini, dan GPT buat nulis code production. 60 menit · Live · Gratis.',
        type: 'website',
        url: 'https://gdifuture.works/webinar',
    },
    robots: { index: true, follow: true },
};

export default function WebinarPage() {
    return <WebinarClient />;
}
