'use client';
import GoogleSignInButton from "@/components/GoogleSignInButton";
import Link from "next/link";
import styles from "./Auth.module.css";
import ThemeLogo from "@/components/ThemeLogo";
import { useLanguage } from "@/components/LanguageContext";

export default function LoginPage() {
    const { t } = useLanguage();
    return (
        <div className={styles.authContainer}>
            <div className={styles.authWrapper}>
                
                <Link href="/" className={styles.logoLink}>
                    <ThemeLogo className={styles.logoImg} />
                </Link>

                <div className={styles.card}>
                    <h2 className={styles.title}>{t('auth.login.title')}</h2>
                    <p className={styles.subtitle}>{t('auth.login.sub')}</p>
                    
                    <div className={styles.buttonWrapper}>
                        <GoogleSignInButton />
                    </div>

                    <div className={styles.divider}>
                        <div className={styles.dividerLine} />
                        <span className={styles.dividerText}>{t('auth.login.or')}</span>
                        <div className={styles.dividerLine} />
                    </div>

                    <p className={styles.footerText}>
                        {t('auth.login.noAccount')}{" "}
                        <Link href="/signup" className={styles.link}>
                            {t('auth.login.signup')}
                        </Link>
                    </p>
                </div>
                
            </div>
        </div>
    );
}
