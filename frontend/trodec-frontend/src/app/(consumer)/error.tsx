"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConsumerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="text-sm text-zinc-400 max-w-xs">
          This page ran into an error. Try refreshing or go back to the dashboard.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
        <button
          onClick={() => router.push("/consumer/dashboard")}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
