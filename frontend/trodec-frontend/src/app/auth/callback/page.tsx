"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { completeOAuth } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

const roleRoutes: Record<string, string> = {
  consumer: "/consumer/dashboard",
  expert: "/expert/dashboard",
  brand_admin: "/brand/dashboard",
  admin: "/admin/dashboard",
};

function AuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in query params first
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      if (errorParam) {
        setError(errorDescription || errorParam);
        setStatus("error");
        return;
      }

      // Get tokens from URL hash (Supabase returns them in the hash fragment)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setError("Authentication failed. No tokens received.");
        setStatus("error");
        return;
      }

      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      try {
        // Complete OAuth — creates or fetches the profile
        const userWithProfile = await completeOAuth();

        // Update auth store
        setUser(userWithProfile);

        setStatus("success");

        // Determine redirect based on role
        const role = userWithProfile.profile?.role;
        const destination = role
          ? (roleRoutes[role] ?? "/consumer/dashboard")
          : "/consumer/dashboard";

        setTimeout(() => {
          router.push(destination);
        }, 800);
      } catch (err) {
        console.error("OAuth completion error:", err);
        // Clear tokens on failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setError("Failed to complete sign in. Please try again.");
        setStatus("error");
      }
    };

    handleCallback();
  }, [router, searchParams, setUser]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-white font-bold text-xl">Authentication Failed</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-sm"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <div>
            <p className="text-white font-semibold text-lg">Signed in successfully!</p>
            <p className="text-zinc-500 text-sm mt-1">Taking you to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-center space-y-5">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <Loader2 className="w-12 h-12 animate-spin text-white/30" />
          <div className="absolute inset-2 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-xl font-black text-white/60">T</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-white font-medium">Completing sign in...</p>
          <p className="text-zinc-600 text-sm">Verifying your account</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/30 mx-auto" />
            <p className="text-zinc-500 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackPageContent />
    </Suspense>
  );
}
