'use client';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import styles from './page.module.css';

export default function GlobalConfirmationPage() {
    const { language } = useLanguage();

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.card}>
                    <div className={styles.icon}>🎉</div>
                    <h1 className={styles.title}>
                        {language === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!'}
                    </h1>
                    <p className={styles.subtitle}>
                        {language === 'id' 
                            ? 'Selamat! Pendaftaran Anda telah dikonfirmasi. Kami telah mengirimkan detail akses ke WhatsApp Anda.' 
                            : 'Congratulations! Your enrollment is confirmed. We have sent the access details to your WhatsApp.'}
                    </p>
                    
                    <div className={styles.nextSteps}>
                        <h3>{language === 'id' ? 'Langkah Selanjutnya:' : 'Next Steps:'}</h3>
                        <ul>
                            <li>{language === 'id' ? 'Cek pesan WhatsApp dari tim kami' : 'Check your WhatsApp for a message from our team'}</li>
                            <li>{language === 'id' ? 'Bergabung dengan grup komunitas' : 'Join the community group'}</li>
                            <li>{language === 'id' ? 'Siapkan perangkat Anda' : 'Prepare your device for the live session'}</li>
                        </ul>
                    </div>

                    <Link href="/" className="btn btn-primary btn-xl">
                        {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
