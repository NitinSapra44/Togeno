"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { updateProfile } from "@/services/auth.service";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, User, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, fetchCurrentUser } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setAvatarUrl(profile.avatarUrl ?? "");
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      await fetchCurrentUser();
      setSuccess(true);
      setTimeout(() => router.push("/consumer/profile"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = (profile?.fullName ?? profile?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-[520px] mx-auto px-4 sm:px-6 py-10 pb-24">
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
        <h1 className="text-2xl font-bold text-white mb-1">Edit Profile</h1>
        <p className="text-sm text-gray-400 mb-8">Update your display name and avatar.</p>

        {/* Avatar preview */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#141416] to-black border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl("")}
              />
            ) : (
              <span className="text-3xl font-black text-white">{initials}</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="pl-10 h-11 bg-[#0d0d0f] border border-white/10 hover:border-white/20 focus-visible:border-white/30 text-white placeholder:text-gray-600 rounded-xl"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Avatar URL <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="h-11 bg-[#0d0d0f] border border-white/10 hover:border-white/20 focus-visible:border-white/30 text-white placeholder:text-gray-600 rounded-xl"
              disabled={isSaving}
            />
            {avatarUrl && (
              <p className="text-[11px] text-gray-500">Preview shown above.</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              Profile updated! Redirecting…
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-11 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => router.push("/consumer/profile")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-white text-black hover:bg-gray-200 font-bold transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
