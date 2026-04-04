import GoogleSignInButton from "@/components/GoogleSignInButton";
import Link from "next/link";
import styles from "./Auth.module.css";
import ThemeLogo from "@/components/ThemeLogo";

export default function SignupPage() {
    return (
        <div className={styles.authContainer}>
            <div className={styles.authWrapper}>
                
                <Link href="/" className={styles.logoLink}>
                    <ThemeLogo className={styles.logoImg} />
                </Link>

                <div className={styles.card}>
                    <h2 className={styles.title}>Create a new account</h2>
                    <p className={styles.subtitle}>Join GDI FutureWorks to launch your tech career</p>
                    
                    <div className={styles.buttonWrapper}>
                        <GoogleSignInButton />
                    </div>

                    <p className={styles.footerText}>
                        Already have an account?{" "}
                        <Link href="/login" className={styles.link}>
                            Log in here
                        </Link>
                    </p>
                </div>
                
            </div>
        </div>
    );
}
