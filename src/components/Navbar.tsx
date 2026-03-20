'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './Navbar.module.css';
import { useLanguage, Translate } from './LanguageContext';
import { useCart } from './CartContext';

export default function Navbar() {
    const [isMounted, setIsMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sessionType, setSessionType] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initial auth check only once on mount and on pathname change
    useEffect(() => {
        if (!isMounted) return;
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/session-ping");
                if (res.ok) {
                    const data = await res.json();
                    setIsLoggedIn(true);
                    setSessionType(data.type);
                } else {
                    setIsLoggedIn(false);
                    setSessionType(null);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            }
        };
        checkAuth();
    }, [pathname, isMounted]);

    useEffect(() => {
        setIsMenuOpen(false); // Close menu on navigation
    }, [pathname]);

    useEffect(() => {
        if (!isMounted) return;
        const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(stored ?? (prefersDark ? 'dark' : 'light'));
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMounted]);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    const { language, setLanguage } = useLanguage();
    const { totalItems } = useCart();
    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'id' : 'en');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Initial server render (blank header to avoid hydration mismatch)
    if (!isMounted) {
        return <header className={styles.header}><div className={styles.container}></div></header>;
    }

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                {/* Left Side: Hamburger & Desktop Links */}
                <div className={styles.leftSection}>
                    <button 
                        className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerActive : ''}`} 
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <nav className={styles.nav} aria-label="Main navigation">
                        <Link href="/about" className={styles.navLink}><Translate tKey="nav.about" defaultText="About" /></Link>
                        <Link href="/community" className={styles.navLink}><Translate tKey="nav.community" defaultText="Community" /></Link>
                        <Link href="/contact" className={styles.navLink}><Translate tKey="nav.contact" defaultText="Contact" /></Link>
                    </nav>
                </div>

                {/* Right Side: Actions & Logo */}
                <div className={styles.rightSection}>
                    <div className={styles.actions}>
                        {!isLoggedIn && (
                            <Link href="/login" className={styles.navChatBtn}>
                                <Translate tKey="nav.login" defaultText="Log in" />
                            </Link>
                        )}

                        <a href="https://wa.me/628211704707" target="_blank" rel="noopener noreferrer" className={styles.navChatBtn} aria-label="Chat with us on WhatsApp">
                            {/* Simple WhatsApp icon for 2026/Notion style */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span className={styles.chatText}>Chat us</span>
                        </a>

                        <Link href="/cart" className={styles.iconBtn} aria-label="View shopping cart">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
                            </svg>
                            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                        </Link>

                        <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle dark mode">
                            {theme === 'light' ? (
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                                </svg>
                            )}
                        </button>

                        <button className={styles.iconBtn} onClick={toggleLanguage} aria-label="Toggle language" style={{ fontWeight: 800, fontSize: '0.75rem' }}>
                            {language === 'en' ? 'EN' : 'ID'}
                        </button>
                    </div>

                    <Link href="/" className={styles.logo}>
                        <img src="/logo-new.png" alt="GDI FutureWorks Logo" className={styles.logoImage} />
                    </Link>
                </div>
            </div>

            {/* Hamburger Menu Overlay */}
            <div className={`${styles.menuOverlay} ${isMenuOpen ? styles.menuOpen : ''}`}>
                <nav className={styles.mobileNav}>
                    <Link href="/about" className={styles.mobileNavLink}>
                        <Translate tKey="nav.about" defaultText="About" />
                    </Link>
                    <Link href="/community" className={styles.mobileNavLink}>
                        <Translate tKey="nav.community" defaultText="Community" />
                    </Link>
                    <Link href="/contact" className={styles.mobileNavLink}>
                        <Translate tKey="nav.contact" defaultText="Contact" />
                    </Link>
                    
                    {isLoggedIn ? (
                        <>
                            <Link href="/dashboard" className={styles.mobileNavLink}>Dashboard</Link>
                            <button className={styles.mobileNavLink} onClick={async () => {
                                if (sessionType === 'admin') {
                                    await signOut({ callbackUrl: '/' });
                                } else {
                                    await fetch("/api/auth/logout", { method: "POST" });
                                    setIsLoggedIn(false);
                                    router.push("/");
                                    router.refresh();
                                }
                            }} style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className={styles.mobileAuthBtn}>
                            Get started
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
