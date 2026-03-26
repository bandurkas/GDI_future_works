'use client';
import dynamic from 'next/dynamic';
import { Course } from '@/data/courses';

// Lazy-load the heavy CourseCard component — keeps it out of the initial JS bundle
const CourseCard = dynamic(() => import('./CourseCard'), {
    ssr: false,
    loading: () => (
        <div style={{
            minHeight: 280,
            borderRadius: 24,
            background: 'var(--bg-secondary)',
            animation: 'shimmer 1.4s ease infinite',
        }} />
    ),
});

interface Props {
    course: Course;
    featured?: boolean;
}

export default function CourseCardLazy(props: Props) {
    return <CourseCard {...props} />;
}
