import { Metadata } from 'next';
import PartnershipSection from '@/components/PartnershipSection';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Study English — GDI FutureWorks',
    description: 'Explore English learning & teaching pathways. Build academic English, prepare for IELTS, or become a certified English teacher with GDI FutureWorks.',
};

export const revalidate = 60;

export default function StudyEnglishPage() {
    return (
        <div className={styles.page}>
            <PartnershipSection />
        </div>
    );
}
