"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydrated } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const [isChecking, setIsChecking] = useState(true);
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      if (useAuthStore.getState().isAuthenticated) {
        setIsChecking(false);
        return;
      }

      await fetchCurrentUser();

      if (!useAuthStore.getState().isAuthenticated) {
        router.push("/login");
        return;
      }
      setIsChecking(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || isChecking || !useAuthStore.getState().isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return <>{children}</>;
}
