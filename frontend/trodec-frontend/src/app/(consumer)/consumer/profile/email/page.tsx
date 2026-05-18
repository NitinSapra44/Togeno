"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui";
import { ArrowLeft, Mail, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function EmailPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-10 pb-24">
      <button
        onClick={() => router.push("/consumer/profile")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Email Address</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your login and notification email.</p>
          </div>
        </div>

        {/* Current email display */}
        <div className="bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-4 flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-500 shrink-0" />
          <p className="text-white font-medium text-sm">{user?.email}</p>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Verified
          </span>
        </div>

        {/* Info notice */}
        <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-400 leading-relaxed">
            <p className="font-semibold text-blue-400 mb-0.5">Want to change your email?</p>
            Email changes require identity verification for security. Please contact{" "}
            <a
              href="mailto:officialtrodec@gmail.com"
              className="text-white underline underline-offset-2 hover:text-gray-300 transition-colors"
            >
              officialtrodec@gmail.com
            </a>{" "}
            and we&apos;ll help you update it.
          </div>
        </div>

        <Button
          onClick={() => router.push("/consumer/profile")}
          variant="ghost"
          className="w-full h-11 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
        >
          Back to Profile
        </Button>
      </motion.div>
    </div>
  );
}
