"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MobileProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email: string; name: string; avatar?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch session data (the server component could do this, but for simplicity of logout state we use ping)
        const fetchUser = async () => {
            try {
                // In a real scenario we'd hit a /api/auth/me, but we can just ask the dashboard page parser
                const res = await fetch("/api/auth/session-ping");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    router.push("/login");
                }
            } catch (err) {
                console.error(err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <div style={{ width: "30px", height: "30px", border: "3px solid var(--border)", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 20px 100px", minHeight: "80vh", fontFamily: "var(--font-body)" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, marginBottom: "30px" }}>Your Profile</h1>
            
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={80} height={80} style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid #eee" }} />
                ) : (
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--brand-light, #e0f2fe)", color: "var(--brand, #0369a1)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "32px", fontWeight: 700 }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                )}
                
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 4px", color: "var(--foreground)" }}>{user.name}</h2>
                    <p style={{ fontSize: "14px", color: "var(--gray3)", margin: 0 }}>{user.email}</p>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button 
                    onClick={() => router.push("/dashboard")}
                    style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, color: "var(--foreground)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <span>My Courses</span>
                    <span style={{ color: "var(--gray3)" }}>→</span>
                </button>
                
                <button 
                    onClick={handleLogout}
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "16px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, color: "#dc2626", cursor: "pointer", marginTop: "20px" }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
