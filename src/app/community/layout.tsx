import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community — GDI FutureWorks',
    description: 'Join the GDI FutureWorks student community. Get access to exclusive job opportunities, peer networking, career mentorship, and a support network across Indonesia and Malaysia.'
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
