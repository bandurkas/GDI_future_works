"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleSignInButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
        credentials: "include", // Important: Allows setting the HttpOnly cookie
      });

      if (res.ok) {
        // Redirect to student dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.error("Google Login Component Error");
            setError("Google sign-in popup closed or failed.");
          }}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="100%"
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">
          {error}
        </p>
      )}
      {loading && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Verifying credentials...
        </p>
      )}
    </div>
  );
}
