"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { roleConfigs, UserRole, AuthMode } from "@/types/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { getGoogleOAuthUrl } from "@/services/auth.service";

interface AuthFormProps {
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  password: string;
  fullName?: string;
  expertise?: string;
  linkedinUrl?: string;
  brandName?: string;
}

const inputClass = cn(
  "h-12 rounded-xl",
  "bg-[#0d0d0f] border border-white/[0.08] text-white",
  "placeholder:text-zinc-600",
  "hover:border-white/[0.15]",
  "focus-visible:ring-0 focus-visible:border-white/30",
  "focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_20px_rgba(255,255,255,0.04)]",
  "transition-all duration-200"
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const roleRoutes: Record<string, string> = {
  consumer: "/consumer/dashboard",
  expert: "/expert/dashboard",
  brand_admin: "/brand/dashboard",
  admin: "/admin/dashboard",
};

export function AuthForm({ onSuccess }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, signOut, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<UserRole>("consumer");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
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
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    reset();
    clearError();
    setRoleError(null);
    setTermsAccepted(false);
    setTermsError(false);
    setShowSuccess(false);
  }, [role, mode, reset, clearError]);

  const busy = isLoading || isSubmitting;
  const displayError = roleError ?? error;

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
        const actualRole = useAuthStore.getState().profile?.role;
        if (actualRole && actualRole !== role) {
          await signOut();
          setRoleError("These credentials belong to a different account type. Please select the correct tab.");
          return;
        }
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

      setShowSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          const r = useAuthStore.getState().profile?.role ?? "consumer";
          router.push(roleRoutes[r] ?? "/consumer/dashboard");
        }
      }, 900);
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
      // The callback page reads `intended_role` from the query and enforces
      // it against the user's stored profile — preventing a consumer-tab
      // Google sign-in from landing on the brand dashboard when the same
      // email is also linked to a brand profile.
      const redirectTo = `${window.location.origin}/auth/callback?intended_role=${encodeURIComponent(role)}`;
      const url = await getGoogleOAuthUrl(redirectTo);
      window.location.href = url;
    } catch (err) {
      console.error("Google OAuth error:", err);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden py-10 px-4">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-500/[0.07] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/[0.05] blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-block text-xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRODEC
          </Link>
        </div>

        <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
          <TabsList className="flex w-full justify-center bg-white/[0.04] backdrop-blur-md border border-white/[0.08] p-1 h-auto gap-1 mb-5 rounded-2xl">
            {(Object.keys(roleConfigs) as UserRole[]).map((r) => (
              <TabsTrigger
                key={r}
                value={r}
                className={cn(
                  "relative flex-1 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 z-10 rounded-xl",
                  "text-zinc-500 hover:text-zinc-300",
                  "data-[state=active]:text-white",
                  "border-none bg-transparent"
                )}
              >
                {role === r && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/[0.08] rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                {roleConfigs[r].label}
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
          >
            <Card className="border border-white/[0.08] bg-white/[0.025] backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden">

              {/* Success overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-[#080808]/95 backdrop-blur-sm rounded-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, type: "spring", bounce: 0.4 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                      <p className="text-white font-semibold text-lg">
                        {mode === "signin" ? "Welcome back!" : "Account created!"}
                      </p>
                      <p className="text-zinc-500 text-sm">Redirecting you now...</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <CardContent className="p-6 md:p-8 space-y-5">

                {/* Heading */}
                <div className="space-y-1 pb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {mode === "signin" ? "Welcome back" : "Create account"}
                  </h2>
                  <p className="text-zinc-500 text-sm">
                    {mode === "signin"
                      ? "Sign in to continue your journey"
                      : "Join and start your experience"}
                  </p>
                </div>

                {/* Error alert */}
                <AnimatePresence mode="wait">
                  {displayError && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-2.5 p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-400 text-sm"
                    >
                      <AlertCircle size={15} className="mt-0.5 shrink-0" />
                      <span>{displayError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                  {/* Signup-only role fields */}
                  <AnimatePresence mode="wait">
                    {mode === "signup" && (
                      <motion.div
                        key="signup-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {config.signupFields.map((field) => (
                          <div key={field.name} className="space-y-1.5">
                            <Label htmlFor={field.name} className="text-xs font-medium text-zinc-400 ml-1">
                              {field.label}
                              {field.required && <span className="text-red-400 ml-1">*</span>}
                            </Label>
                            <Input
                              id={field.name}
                              placeholder={field.placeholder}
                              {...register(field.name as keyof FormData, {
                                required: field.required ? `${field.label} is required` : false,
                              })}
                              className={inputClass}
                            />
                            {errors[field.name as keyof FormData] && (
                              <p className="text-red-400 text-xs mt-1 ml-1">
                                {errors[field.name as keyof FormData]?.message}
                              </p>
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
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={inputClass}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
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
                          minLength:
                            mode === "signup"
                              ? { value: 8, message: "Password must be at least 8 characters" }
                              : undefined,
                        })}
                        className={cn(inputClass, "pr-10")}
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
                    {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
                    {mode === "signup" && !errors.password && (
                      <p className="text-zinc-600 text-[10px] mt-1 ml-1">Minimum 8 characters</p>
                    )}
                  </div>

                  {/* Remember me (signin only) */}
                  {mode === "signin" && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 rounded border-white/20 bg-transparent accent-white cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-xs text-zinc-400 cursor-pointer select-none">
                        Remember me
                      </label>
                    </div>
                  )}

                  {/* Terms & Conditions — always required for both modes */}
                  <motion.div
                    ref={termsRef}
                    animate={shakeControls}
                    className="space-y-2"
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
                          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
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
                            <path
                              d="M2 6.5l2.5 2.5 5.5-5.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
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

                    {/* Validation error box */}
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
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="w-full pt-1">
                    <Button
                      type="submit"
                      className="w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50"
                      disabled={busy}
                    >
                      {busy ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : mode === "signin" ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </motion.div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/[0.06]" />
                    </div>
                    <span className="relative bg-[#0a0a0a] px-3 text-xs font-medium text-zinc-600">
                      Or continue with
                    </span>
                  </div>

                  {/* Google */}
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className={cn(
                      "w-full h-12 bg-white/[0.04] border hover:bg-white/[0.08] text-white font-medium rounded-xl backdrop-blur-md transition-all duration-200",
                      termsError ? "border-red-500/30" : "border-white/[0.08] hover:border-white/[0.15]"
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

                {/* Toggle sign in / sign up */}
                <div className="text-center pt-1">
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
              </CardContent>
            </Card>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
}
