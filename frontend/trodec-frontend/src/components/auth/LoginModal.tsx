"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { UserRole, AuthMode, roleConfigs } from "@/types/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useModalStore } from "@/stores/modal.store";
import { getGoogleOAuthUrl } from "@/services/auth.service";
import { toast } from "sonner";

interface FormData {
  email: string;
  password: string;
  fullName?: string;
  expertise?: string;
  linkedinUrl?: string;
  brandName?: string;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginMessage, pendingAction } = useModalStore();
  const { signIn, signUp, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<UserRole>("consumer");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  const shakeControls = useAnimation();

  const config = roleConfigs[role];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    reset();
    clearError();
    setTermsAccepted(false);
    setTermsError(false);
    setShowSuccess(false);
  }, [role, mode, isLoginModalOpen, reset, clearError]);

  if (!isLoginModalOpen) return null;

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      toast.success("Welcome to Trodec!");
      closeLoginModal();
      if (pendingAction) pendingAction();
    }, 800);
  };

  const rejectWithTermsError = () => {
    setTermsError(true);
    shakeControls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
    termsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const onSubmit = async (data: FormData) => {
    if (!termsAccepted) {
      rejectWithTermsError();
      return;
    }
    try {
      clearError();
      if (mode === "signin") {
        await signIn({ email: data.email, password: data.password });
      } else {
        const expertise = data.expertise
          ? data.expertise.split(",").map((e) => e.trim()).filter(Boolean)
          : undefined;
        await signUp({
          email: data.email,
          password: data.password,
          role,
          fullName: data.fullName,
          expertise,
          linkedinUrl: data.linkedinUrl,
          brandName: data.brandName,
        });
      }
      handleSuccess();
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!termsAccepted) {
      rejectWithTermsError();
      return;
    }
    setGoogleLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const url = await getGoogleOAuthUrl(redirectTo);
      window.location.href = url;
    } catch (err) {
      console.error("Google OAuth error:", err);
      toast.error("Failed to connect to Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={closeLoginModal}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[#080808] border border-white/8 shadow-[0_32px_100px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden overflow-y-auto max-h-[92vh]"
        >
          {/* Top glow line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-blue-500/15 blur-[60px] rounded-full pointer-events-none" />

          {/* Close */}
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/8 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Success overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-[#080808]/95 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, type: "spring", bounce: 0.4 }}
                  className="flex flex-col items-center gap-3"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  <p className="text-white font-semibold text-lg">Welcome back!</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-3">TRODEC</div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {loginMessage || (mode === "signin" ? "Welcome back" : "Create your account")}
              </h2>
              <p className="text-zinc-500 text-sm">
                {mode === "signin"
                  ? "Sign in to continue your experience"
                  : "Join Trodec and start discovering"}
              </p>
            </div>

            {/* Error */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2.5 p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm"
                >
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role tabs */}
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
              <TabsList className="flex w-full justify-center bg-white/4 border border-white/8 p-1 rounded-xl mb-5">
                {(Object.keys(roleConfigs) as UserRole[]).map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className={cn(
                      "flex-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 rounded-lg",
                      "data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm",
                      "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {roleConfigs[r].label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Signup-only fields */}
                <AnimatePresence mode="wait">
                  {mode === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {config.signupFields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                          <Label htmlFor={field.name} className="text-xs font-medium text-zinc-400 ml-1">
                            {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                          </Label>
                          <Input
                            id={field.name}
                            placeholder={field.placeholder}
                            {...register(field.name as keyof FormData, {
                              required: field.required ? `${field.label} is required` : false,
                            })}
                            className="bg-[#0d0d0f] border-white/8 text-white h-11 rounded-lg placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-white/25 hover:border-white/15 transition-colors"
                          />
                          {errors[field.name as keyof FormData] && (
                            <p className="text-red-400 text-xs ml-1">{errors[field.name as keyof FormData]?.message}</p>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-zinc-400 ml-1">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                    })}
                    className="bg-[#0d0d0f] border-white/8 text-white h-11 rounded-lg placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-white/25 hover:border-white/15 transition-colors"
                  />
                  {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-zinc-400 ml-1">
                      Password <span className="text-red-400">*</span>
                    </Label>
                    {mode === "signin" && (
                      <button type="button" className="text-xs text-zinc-500 hover:text-white transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Password is required",
                        minLength: mode === "signup" ? { value: 8, message: "At least 8 characters" } : undefined,
                      })}
                      className="bg-[#0d0d0f] border-white/8 text-white h-11 rounded-lg placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-white/25 hover:border-white/15 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
                </div>

                {/* Remember me (signin only) */}
                {mode === "signin" && (
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="remember"
                      className="border-white/15 bg-transparent data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <label htmlFor="remember" className="text-xs text-zinc-400 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                )}

                {/* Terms consent — always required */}
                <motion.div
                  ref={termsRef}
                  animate={shakeControls}
                  className="space-y-2 pt-0.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTermsAccepted(!termsAccepted);
                      setTermsError(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 group",
                      termsError
                        ? "border-red-500/40 bg-red-500/[0.06]"
                        : termsAccepted
                        ? "border-white/20 bg-white/[0.05]"
                        : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    )}
                    aria-label="Accept Terms and Privacy Policy"
                  >
                    {/* Custom checkbox */}
                    <span
                      className={cn(
                        "mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all duration-200",
                        termsAccepted
                          ? "bg-white border-white shadow-[0_0_0_3px_rgba(255,255,255,0.08)]"
                          : termsError
                          ? "border-red-400/60 bg-red-500/5"
                          : "border-white/25 bg-transparent group-hover:border-white/45 group-hover:bg-white/5"
                      )}
                      aria-hidden
                    >
                      {termsAccepted && (
                        <svg className="w-[9px] h-[9px] text-black" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>

                    <span className="text-[13px] text-zinc-400 leading-snug select-none">
                      I agree to Trodec&apos;s{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="text-zinc-200 underline underline-offset-2 hover:text-white transition-colors"
                      >
                        Terms & Conditions
                      </Link>
                      {" "}and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="text-zinc-200 underline underline-offset-2 hover:text-white transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </button>

                  {/* Validation error */}
                  <AnimatePresence>
                    {termsError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/[0.18]">
                          <AlertCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-[12px] text-red-400 leading-snug">
                            You must accept the Terms &amp; Conditions and Privacy Policy to continue.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-white text-black font-bold rounded-lg hover:bg-zinc-100 active:bg-zinc-200 transition-all mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : mode === "signin" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/6" />
                  </div>
                  <span className="relative bg-[#080808] px-3 text-xs font-medium text-zinc-600">
                    Or continue with
                  </span>
                </div>

                {/* Google */}
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className={cn(
                    "w-full h-11 bg-white/4 border hover:bg-white/8 text-white font-medium rounded-lg transition-all duration-200",
                    termsError ? "border-red-500/30" : "border-white/8 hover:border-white/15"
                  )}
                >
                  {googleLoading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <span className="flex items-center gap-2.5">
                      <GoogleIcon />
                      Continue with Google
                    </span>
                  )}
                </Button>
              </form>

              {/* Toggle mode */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  {mode === "signin" ? (
                    <>Don&apos;t have an account? <span className="text-white font-medium">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="text-white font-medium">Sign in</span></>
                  )}
                </button>
              </div>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
