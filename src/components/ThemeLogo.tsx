'use client';
import { useTheme } from './ThemeProvider';

interface ThemeLogoProps {
    className?: string;
    style?: React.CSSProperties;
    alt?: string;
    forceDark?: boolean;
}

/**
 * A theme-aware Logo component that switches between /logo-final.webp (light)
 * and /logo-dark.webp (dark) based on the current theme or a forced override.
 */
export default function ThemeLogo({ className, style, alt = "GDI FutureWorks Logo", forceDark = false }: ThemeLogoProps) {
    const { theme } = useTheme();
    
    // Choose logo based on forced preference or current theme
    const isDark = forceDark || theme === 'dark';
    const logoSrc = isDark ? '/LOGO_FW_dark.svg' : '/LOGO_FW.svg';
    
    return (
        <img 
            src={logoSrc} 
            alt={alt} 
            className={className} 
            style={style}
        />
    );
}
