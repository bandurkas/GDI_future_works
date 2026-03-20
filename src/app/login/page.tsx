import GoogleSignInButton from "@/components/GoogleSignInButton";
import Link from "next/link";
import styles from "./Auth.module.css";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className={styles.authContainer}>
            <div className={styles.authWrapper}>
                
                <Link href="/" className={styles.logoText}>
                    GDI <span>FutureWorks</span>
                </Link>

                <div className={styles.card}>
                    <h2 className={styles.title}>Log in to your account</h2>
                    <p className={styles.subtitle}>Welcome back to GDI FutureWorks</p>
                    
                    <div className={styles.buttonWrapper}>
                        <GoogleSignInButton />
                    </div>

                    <div className={styles.divider}>
                        <div className={styles.dividerLine} />
                        <span className={styles.dividerText}>or</span>
                        <div className={styles.dividerLine} />
                    </div>

                    <p className={styles.footerText}>
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className={styles.link}>
                            Sign up here
                        </Link>
                    </p>
                </div>
                
            </div>
        </div>
    );
}
