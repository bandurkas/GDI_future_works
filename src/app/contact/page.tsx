import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
    title: 'Contact Us — GDI FutureWorks',
    description: 'Connect with GDI FutureWorks for inquiries, partnerships, and support. Our team responds within minutes via WhatsApp or Email.',
};

export default function ContactPage() {
    return <ContactPageClient />;
}
