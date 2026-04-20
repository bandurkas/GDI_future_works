import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
    title: 'About Us — GDI FutureWorks',
    description: 'GDI FutureWorks was built by Feonna Watford and Sergei Bandurka — two industry veterans with over 40 years of combined experience — to deliver real-world tech skills that accelerate careers across Southeast Asia.'
};

export const revalidate = 60;

export default function AboutPage() {
    return <AboutPageClient />;
}
