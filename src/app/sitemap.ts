import { MetadataRoute } from 'next';
import { courses } from '@/data/courses';

export default function sitemap(): MetadataRoute.Sitemap {
    const base = 'https://gdifuture.works';

    const staticPages: MetadataRoute.Sitemap = [
        { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${base}/courses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${base}/for-tutors`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${base}/for-tutors/apply`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${base}/community`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${base}/data-deletion`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ];

    const coursePages: MetadataRoute.Sitemap = courses.flatMap((course) => [
        {
            url: `${base}/courses/${course.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${base}/courses/${course.slug}/schedule`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        },
    ]);

    return [...staticPages, ...coursePages];
}
