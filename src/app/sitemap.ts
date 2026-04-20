import { MetadataRoute } from 'next';
import { courses } from '@/data/courses';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://gdifuture.works';

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/courses',
        '/about',
        '/community',
        '/for-tutors',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Course Routes
    const courseRoutes = courses.map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    return [...staticRoutes, ...courseRoutes];
}
