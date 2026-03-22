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
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
      if (process.env.NODE_ENV === 'development') {
          console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined. Google Authentication will not work.");
      }
      return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
      );
  }

  return (
    <SessionProvider session={session}>
      <GoogleOAuthProvider clientId={clientId}>
        {children}
      </GoogleOAuthProvider>
    </SessionProvider>
  );
}
