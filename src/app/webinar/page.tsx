import { Metadata } from 'next';
import WebinarClient from './WebinarClient';

export const metadata: Metadata = {
    title: 'Webinar AI Vibe Coding · Rp 400rb · Bangun App Tanpa Ngetik Tiap Baris',
    description:
        'Webinar live 60 menit · Rp 400.000. Pelajari workflow AI Vibe Coding yang dipakai developer pro tiap hari. Bonus 30+ AI Prompts Pack + akses replay 24 jam. Slot terbatas.',
    openGraph: {
        title: 'Webinar AI Vibe Coding — Bareng Bayu Sedana',
        description:
            'Stop ngetik tiap baris pakai tangan. Direct Claude, Gemini, dan GPT buat nulis code production. 60 menit · Live · Investasi Rp 400rb.',
        type: 'website',
        url: 'https://gdifuture.works/webinar',
    },
    robots: { index: true, follow: true },
};

export default function WebinarPage() {
    return <WebinarClient />;
}
