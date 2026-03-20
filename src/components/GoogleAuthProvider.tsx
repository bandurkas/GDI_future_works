"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export default function GoogleAuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  // Hardcoding the Client ID as a fallback to prevent Next.js build-time stripping 
  // (NEXT_PUBLIC variables are public anyway)
  const fallbackId = "993052151141-p1urqse4iiv4v2s8q6b95d4b7cjmfvb5.apps.googleusercontent.com";
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || fallbackId;
  
  if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined. Google Authentication will not work.");
  }

  return (
    <SessionProvider session={session}>
      <GoogleOAuthProvider clientId={clientId}>
        {children}
      </GoogleOAuthProvider>
    </SessionProvider>
  );
}
