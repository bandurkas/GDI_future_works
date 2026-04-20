import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'GDI FutureWorks — IT Courses That Get You Hired',
    description: 'Live online IT courses led by industry professionals. Learn data analytics, Python, AI, and more. Build real projects. Start your tech career faster.',
};

export default function Page() {
    return <HomeClient />;
}
