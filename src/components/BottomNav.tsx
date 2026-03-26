'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();

    const isDeepCoursePage = pathname.startsWith('/courses/') && pathname.split('/').length > 2;

    if (isDeepCoursePage) {
        return null;
    }

    const tabs = [
        {
            name: 'HOME',
            href: '/',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3l9 8h-3v8h-4v-6H10v6H6v-8H3l9-8z" />
                </svg>
            ),
        },
        {
            name: 'LEARN',
            href: '/#cohort',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6v14a2 2 0 0 0 2 2h14v-2H6V6z" />
                    <path d="M8 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2H8zm12 14H10V4h10v12z" />
                </svg>
            ),
        },
        {
            name: 'PLAN',
            href: '/schedule',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                </svg>
            ),
        },
        {
            name: 'PROFILE',
            href: '/profile',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            ),
        }
    ];

    return (
        <nav className={styles.bottomNav}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        onClick={(e) => {
                            if (tab.name === 'HOME' && pathname === '/') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else if (tab.name === 'LEARN' && pathname === '/') {
                                const el = document.getElementById('cohort');
                                if (el) {
                                    e.preventDefault();
                                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                            }
                        }}
                    >
                        <div className={styles.iconWrapper}>
                            {tab.icon}
                        </div>
                        <span className={styles.label}>{tab.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
