"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!currentPassword) { setError("Current password is required."); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError("New password must contain uppercase, lowercase, and a number.");
      return;
    }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword === currentPassword) { setError("New password must differ from current password."); return; }

    try {
      setIsSaving(true);
      await api.patch("/auth/change-password", { currentPassword, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/consumer/profile"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  }

  const rules = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", ok: /[a-z]/.test(newPassword) },
    { label: "One number", ok: /\d/.test(newPassword) },
  ];

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
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8 ml-[52px]">Keep your account secure with a strong password.</p>

        {success ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <p className="text-white font-bold text-lg">Password changed!</p>
            <p className="text-gray-400 text-sm">Redirecting to your profile…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              disabled={isSaving}
            />

            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              disabled={isSaving}
            />

            {/* Password strength rules */}
            {newPassword && (
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {rules.map((r) => (
                  <div key={r.label} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${r.ok ? "text-emerald-400" : "text-gray-600"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${r.ok ? "bg-emerald-400" : "bg-gray-700"}`} />
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              disabled={isSaving}
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-11 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                onClick={() => router.push("/consumer/profile")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-white text-black hover:bg-gray-200 font-bold active:scale-95 transition-all"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 h-11 bg-[#0d0d0f] border border-white/10 hover:border-white/20 focus-visible:border-white/30 text-white placeholder:text-gray-600 rounded-xl"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
