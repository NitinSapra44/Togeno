"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/stores/auth.store";

const ROLE_DASHBOARDS: Record<string, string> = {
  consumer: "/consumer/dashboard",
  expert: "/expert/dashboard",
  brand_admin: "/brand/dashboard",
  admin: "/admin/dashboard",
};

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");

  const handleSuccess = () => {
    if (explicitRedirect) {
      router.push(explicitRedirect);
      return;
    }
    const role = useAuthStore.getState().profile?.role || "consumer";
    router.push(ROLE_DASHBOARDS[role] ?? "/consumer/dashboard");
  };

  return <AuthForm onSuccess={handleSuccess} />;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
