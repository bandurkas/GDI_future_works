'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styles from './NavbarPremium.module.css';
import { useLanguage, Translate } from './LanguageContext';
import { useCart } from './CartContext';
import { useTheme } from './ThemeProvider';
import { useCurrency } from './CurrencyContext';
import ThemeLogo from './ThemeLogo';
import {
    Home,
    BookOpen,
    Calendar,
    Info,
    Users,
    MessageSquare,
    User,
    BarChart3,
    LogOut,
    GraduationCap,
    Globe,
    Banknote,
    Palette
} from 'lucide-react';

export default function NavbarPremium() {
    const [isMounted, setIsMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [legacyLoggedIn, setLegacyLoggedIn] = useState(false);
    const isLoggedIn = status === 'authenticated' || legacyLoggedIn;
    const [sessionType, setSessionType] = useState<string | null>(null);

    const { language, setLanguage } = useLanguage();
    const { currency, setCurrency } = useCurrency();
    const { totalItems } = useCart();

    useEffect(() => {
        setIsMounted(true);
        // Check legacy gdi_session cookie via session-ping API
        fetch('/api/auth/session-ping')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user) setLegacyLoggedIn(true);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        if (session?.user) {
            setSessionType((session.user as any).role || 'student');
        } else {
            setSessionType(null);
        }
    }, [pathname, isMounted, session]);

    useEffect(() => {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
    }, [pathname]);

    useEffect(() => {
        if (!isMounted) return;
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMounted]);

    const toggleLanguage = () => {
        const nextLang = language === 'en' ? 'id' : 'en';
        setLanguage(nextLang);
        
        // Auto-sync currency IF user hasn't manually set one yet
        const manualCurrency = localStorage.getItem('GDI_CURRENCY');
        if (!manualCurrency) {
            setCurrency(nextLang === 'id' ? 'IDR' : 'MYR');
        }
    };

    const toggleMenu = () => {
        const next = !isMenuOpen;
        setIsMenuOpen(next);
        document.body.style.overflow = next ? 'hidden' : '';
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
    };

    if (!isMounted) {
        return <header className={styles.header}><div className={styles.container}></div></header>;
    }

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                {/* Fixed Logo Marker for Verification */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, opacity: 0 }} id="navbar-v3-marker"></div>

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

                    <Link href="/" className={styles.logo} aria-label="GDI FutureWorks Home">
                        <ThemeLogo className={styles.logoImage} />
                    </Link>

                    <nav className={styles.nav} aria-label="Main navigation">
                        <Link href="/about" className={styles.navLink}><Translate tKey="nav.about" defaultText="About" /></Link>
                        <Link href="/for-tutors" className={styles.navLink}><Translate tKey="nav.forTutors" defaultText="For Tutors" /></Link>
                        <Link href="/community" className={styles.navLink}><Translate tKey="nav.community" defaultText="Community" /></Link>
                        <Link href="/contact" className={styles.navLink}><Translate tKey="nav.contact" defaultText="Contact" /></Link>
                    </nav>
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.desktopActions}>
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className={styles.navActionBtn}>
                                    Dashboard
                                </Link>
                                <button
                                    onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); signOut({ callbackUrl: '/' }); setLegacyLoggedIn(false); }}
                                    className={styles.navActionBtn}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <Translate tKey="nav.logout" defaultText="Log out" />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className={styles.navActionBtn}>
                                <Translate tKey="nav.login" defaultText="Log in" />
                            </Link>
                        )}

                        <a href="https://wa.me/628211704707" target="_blank" rel="noopener noreferrer" className={styles.navActionBtn} aria-label="Chat with us on WhatsApp">
                            <IconChat />
                            <span>Chat us</span>
                        </a>

                        <Link href="/cart" className={styles.iconBtn} aria-label="View shopping cart">
                            <IconCart />
                            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                        </Link>

                        <div className={styles.controlsDivider} aria-hidden="true" />

                        <button
                            className={styles.chipBtn}
                            onClick={() => setCurrency(currency === 'IDR' ? 'MYR' : 'IDR')}
                            aria-label={`Switch currency, current: ${currency}`}
                            title={currency === 'IDR' ? 'Switch to MYR' : 'Switch to IDR'}
                        >
                            {currency === 'IDR' ? <FlagID className={styles.flagIcon} /> : <FlagMY className={styles.flagIcon} />}
                            <span>{currency}</span>
                        </button>

                        <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'dark' ? <IconSun /> : <IconMoon />}
                        </button>

                        <button
                            className={styles.chipBtn}
                            onClick={toggleLanguage}
                            aria-label={`Switch language, current: ${language.toUpperCase()}`}
                            title={language === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
                        >
                            {language === 'en' ? <FlagUK className={styles.flagIcon} /> : <FlagID className={styles.flagIcon} />}
                            <span>{language.toUpperCase()}</span>
                        </button>
                    </div>

                    {/* Mobile top-bar utility controls */}
                    <div className={styles.mobileHeaderActions}>
                        {/* Currency toggle */}
                        <button
                            className={styles.mobileToggleChip}
                            onClick={() => setCurrency(currency === 'IDR' ? 'MYR' : 'IDR')}
                            aria-label={`Currency: ${currency}`}
                        >
                            <span className={styles.mobileToggleActive}>{currency}</span>
                            <span className={styles.mobileToggleSep}>·</span>
                            <span className={styles.mobileToggleInactive}>{currency === 'IDR' ? 'MYR' : 'IDR'}</span>
                        </button>

                        {/* Language toggle */}
                        <button
                            className={styles.mobileToggleChip}
                            onClick={toggleLanguage}
                            aria-label={`Language: ${language.toUpperCase()}`}
                        >
                            <span className={styles.mobileToggleActive}>{language.toUpperCase()}</span>
                            <span className={styles.mobileToggleSep}>·</span>
                            <span className={styles.mobileToggleInactive}>{language === 'en' ? 'ID' : 'EN'}</span>
                        </button>

                        {/* Theme toggle */}
                        <button className={styles.mobileIconBtn} onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'dark' ? <IconSun /> : <IconMoon />}
                        </button>

                        {/* Cart */}
                        <Link href="/cart" className={styles.mobileIconBtn} aria-label="View shopping cart">
                            <IconCart />
                            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Backdrop — tap outside to close */}
            {isMenuOpen && (
                <div className={styles.menuBackdrop} onClick={closeMenu} aria-hidden="true" />
            )}

            <div className={`${styles.menuOverlay} ${isMenuOpen ? styles.menuOpen : ''}`} aria-modal="true" role="dialog" aria-label="Navigation menu">
                {/* Close button */}
                <button className={styles.menuCloseBtn} onClick={closeMenu} aria-label="Close menu">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <nav className={styles.mobileNav}>

                    {/* ── PREFERENCES ── */}
                    <div className={styles.mobileMenuSection}>
                        <h4 className={styles.mobileMenuLabel}>Preferences</h4>

                        {/* Currency */}
                        <div className={styles.prefRow}>
                            <div className={styles.prefRowLeft}>
                                <span className={styles.prefRowIcon}><Banknote size={16} /></span>
                                <span className={styles.prefRowLabel}>Currency</span>
                            </div>
                            <div className={styles.prefSegmented}>
                                <button
                                    className={`${styles.prefSegBtn} ${currency === 'IDR' ? styles.prefSegBtnActive : ''}`}
                                    onClick={() => setCurrency('IDR')}
                                >
                                    <FlagID className={styles.flagIcon} />
                                    <span>IDR</span>
                                </button>
                                <button
                                    className={`${styles.prefSegBtn} ${currency === 'MYR' ? styles.prefSegBtnActive : ''}`}
                                    onClick={() => setCurrency('MYR')}
                                >
                                    <FlagMY className={styles.flagIcon} />
                                    <span>MYR</span>
                                </button>
                            </div>
                        </div>

                        {/* Language */}
                        <div className={styles.prefRow}>
                            <div className={styles.prefRowLeft}>
                                <span className={styles.prefRowIcon}><Globe size={16} /></span>
                                <span className={styles.prefRowLabel}>Language</span>
                            </div>
                            <div className={styles.prefSegmented}>
                                <button
                                    className={`${styles.prefSegBtn} ${language === 'en' ? styles.prefSegBtnActive : ''}`}
                                    onClick={() => { if (language !== 'en') toggleLanguage(); }}
                                >
                                    <FlagUK className={styles.flagIcon} />
                                    <span>EN</span>
                                </button>
                                <button
                                    className={`${styles.prefSegBtn} ${language === 'id' ? styles.prefSegBtnActive : ''}`}
                                    onClick={() => { if (language !== 'id') toggleLanguage(); }}
                                >
                                    <FlagID className={styles.flagIcon} />
                                    <span>ID</span>
                                </button>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className={styles.prefRow}>
                            <div className={styles.prefRowLeft}>
                                <span className={styles.prefRowIcon}><Palette size={16} /></span>
                                <span className={styles.prefRowLabel}>Appearance</span>
                            </div>
                            <div className={styles.prefSegmented}>
                                <button
                                    className={`${styles.prefSegBtn} ${theme === 'light' ? styles.prefSegBtnActive : ''}`}
                                    onClick={() => { if (theme === 'dark') toggleTheme(); }}
                                >
                                    <IconSun />
                                    <span>Light</span>
                                </button>
                                <button
                                    className={`${styles.prefSegBtn} ${theme === 'dark' ? styles.prefSegBtnActive : ''}`}
                                    onClick={() => { if (theme === 'light') toggleTheme(); }}
                                >
                                    <IconMoon />
                                    <span>Dark</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── EXPLORE ── */}
                    <div className={styles.mobileMenuSection}>
                        <h4 className={styles.mobileMenuLabel}>Explore</h4>
                        <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>
                            <span className={styles.mobileLinkIcon}><Home size={20} /></span> Home
                        </Link>
                        <Link href="/courses" className={styles.mobileNavLink} onClick={closeMenu}>
                            <span className={styles.mobileLinkIcon}><BookOpen size={20} /></span> Courses
                        </Link>
                        <Link href="/schedule" className={styles.mobileNavLink} onClick={closeMenu}>
                            <span className={styles.mobileLinkIcon}><Calendar size={20} /></span> Live Schedule
                        </Link>
                    </div>

                    {/* ── COMPANY ── */}
                    <div className={styles.mobileMenuSection}>
                        <h4 className={styles.mobileMenuLabel}>Company</h4>
                        <Link href="/about" className={styles.mobileNavLink} onClick={closeMenu}>
                            <span className={styles.mobileLinkIcon}><Info size={20} /></span> About Us
                        </Link>
                        <Link href="/community" className={styles.mobileNavLink} onClick={closeMenu}>
                            <span className={styles.mobileLinkIcon}><Users size={20} /></span> Community
                        </Link>
                        <Link href="/for-tutors" className={styles.mobileNavLink} onClick={closeMenu}>
                            <span className={styles.mobileLinkIcon}><GraduationCap size={20} /></span> Teach with Us
                        </Link>
                        <Link href="/contact" className={styles.mobileNavLink} onClick={closeMenu}>
                            <span className={styles.mobileLinkIcon}><MessageSquare size={20} /></span> Contact
                        </Link>
                    </div>

                    {/* ── ACCOUNT ── */}
                    <div className={styles.mobileMenuFooter}>
                        {isLoggedIn ? (
                            <>
                                <Link href="/profile" className={styles.mobileNavLink} onClick={closeMenu}>
                                    <span className={styles.mobileLinkIcon}><User size={20} /></span> Profile Settings
                                </Link>
                                <Link href="/dashboard" className={styles.mobileNavLink} onClick={closeMenu}>
                                    <span className={styles.mobileLinkIcon}><BarChart3 size={20} /></span> Learning Dashboard
                                </Link>
                                <button className={styles.mobileLogoutBtn} onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); signOut({ callbackUrl: '/' }); setLegacyLoggedIn(false); closeMenu(); }}>
                                    <span className={styles.mobileLinkIcon}><LogOut size={20} /></span>
                                    <Translate tKey="nav.logout" defaultText="Log out" />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className={styles.mobileAuthBtn} onClick={closeMenu}>Join GDI FutureWorks</Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

const IconChat = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const IconCart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
    </svg>
);

const FlagID = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="11" viewBox="0 0 24 16">
        <rect width="24" height="8" fill="#FF0000" />
        <rect y="8" width="24" height="8" fill="#FFFFFF" />
    </svg>
);

const FlagMY = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="11" viewBox="0 0 24 16">
        <rect width="24" height="16" fill="#FFFFFF" />
        <rect width="24" height="2" fill="#FF0000" />
        <rect y="3.5" width="24" height="2" fill="#FF0000" />
        <rect y="7" width="24" height="2" fill="#FF0000" />
        <rect y="10.5" width="24" height="2" fill="#FF0000" />
        <rect y="14" width="24" height="2" fill="#FF0000" />
        <rect width="11" height="8.5" fill="#000066" />
        <circle cx="4" cy="4" r="2.2" fill="#FFFF00" />
        <circle cx="5" cy="4" r="2.2" fill="#000066" />
    </svg>
);

const FlagUK = ({ className }: { className?: string }) => (
    <svg className={className} width="18" height="12" viewBox="0 0 24 16">
        <rect width="24" height="16" fill="#00247D" />
        <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3" />
        <path d="M0 0l24 16M24 0L0 16" stroke="#CF142B" strokeWidth="2" />
        <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
        <path d="M12 0v16M0 8h24" stroke="#CF142B" strokeWidth="3" />
    </svg>
);

const IconMoon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const IconSun = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);
