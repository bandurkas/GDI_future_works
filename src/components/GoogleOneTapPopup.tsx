"use client";

import { useGoogleOneTapLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function GoogleOneTapPopup() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useGoogleOneTapLogin({
        onSuccess: async (credentialResponse) => {
            try {
                const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ credential: credentialResponse.credential }),
                });

                if (res.ok) {
                    router.push("/dashboard");
                    router.refresh();
                } else {
                    console.error("Failed to authenticate with backend");
                }
            } catch (error) {
                console.error("One Tap Login Error:", error);
            }
        },
        onError: () => {
            console.error("Google One Tap Failed");
        },
        // Wait until mounted to prevent hydration errors, and avoid popping up on auth pages
        disabled: !isMounted || typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup'),
    });

    return null; // This is a headless component that triggers the Google iframe
}
