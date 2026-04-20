import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { courses, getCourseBySlug } from '@/data/courses';
import { cookies, headers } from 'next/headers';
import CourseLandingClient from './CourseLandingClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    return courses.map((c) => ({ slug: c.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) return {};

    const cookieStore = await cookies();
    const lang = cookieStore.get('GDI_LANG')?.value === 'id' ? 'id' : 'en';

    const isID = lang === 'id';
    const title = isID && course.titleID 
        ? `${course.titleID} | Bootcamp Data Analytics Terbaik Indonesia` 
        : `${course.title} | GDI FutureWorks Live Training`;
    
    const description = isID && course.descriptionID 
        ? `${course.descriptionID.substring(0, 150)}... Daftar bootcamp data analytics bersertifikat untuk pemula dan umum.`
        : `${course.description.substring(0, 160)}...`;

    const keywords = isID && course.seoKeywordsID 
        ? course.seoKeywordsID.join(', ')
        : course.tags.join(', ');

    const url = `https://gdifuture.works/courses/${slug}`;
    const imageUrl = 'https://gdifuture.works/assets/og-courses-premium.png';

    return {
        title,
        description,
        keywords,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: 'GDI FutureWorks',
            type: 'website',
            images: [{ url: imageUrl, width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        }
    };
}

export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) notFound();

    const cookieStore = await cookies();
    const lang = cookieStore.get('GDI_LANG')?.value === 'id' ? 'id' : 'en';
    const isID = lang === 'id';

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": isID && course.titleID ? course.titleID : course.title,
        "description": isID && course.descriptionID ? course.descriptionID : course.description,
        "provider": {
            "@type": "Organization",
            "name": "GDI FutureWorks",
            "sameAs": "https://gdifuture.works"
        },
        "offers": {
            "@type": "Offer",
            "price": isID ? course.priceIDR : course.price,
            "priceCurrency": isID ? "IDR" : "USD"
        },
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "Online",
            "instructor": {
                "@type": "Person",
                "name": isID && course.instructorID ? course.instructorID.name : course.instructor.name
            }
        }
    };

    const faqJsonLd = isID && course.faqsID ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": course.faqsID.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
            }
        }))
    } : null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {faqJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}
            <CourseLandingClient course={course} slug={slug} />
        </>
    );
}
