"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { updateExpertDetails } from "@/services/auth.service";

const ONBOARDING_FLAG = (userId: string) => `trodec-expert-onboarded-${userId}`;

export default function ExpertOnboardingPage() {
    const router = useRouter();
    const { user, expertDetails, fetchCurrentUser } = useAuthStore();

    // Initialize from whatever expertDetails is in the store at first render.
    // The expert layout always calls fetchCurrentUser() before navigating here,
    // so these are populated for an existing-but-incomplete profile.
    const [loading, setLoading] = useState(false);
    const [bio, setBio] = useState<string>(() => expertDetails?.bio ?? "");
    const [yearsOfExperience, setYearsOfExperience] = useState<string>(() =>
        expertDetails?.yearsOfExperience != null
            ? String(expertDetails.yearsOfExperience)
            : ""
    );
    const [expertise, setExpertise] = useState<string>(() =>
        (expertDetails?.expertise ?? []).join(", ")
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!bio.trim()) {
            toast.error("Please add a short bio so consumers know who you are.");
            return;
        }

        setLoading(true);

        try {
            const expertiseList = expertise
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            await updateExpertDetails({
                bio: bio.trim(),
                yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : null,
                expertise: expertiseList.length > 0 ? expertiseList : undefined,
            });

            await fetchCurrentUser();

            if (user?.id) {
                try {
                    localStorage.setItem(ONBOARDING_FLAG(user.id), "1");
                } catch {
                    /* private mode — ignore */
                }
            }

            toast.success("All set — let's create your first community.");
            router.replace("/expert/communities/new");
        } catch (error: unknown) {
            console.error("Expert onboarding error:", error);
            const message = error instanceof Error ? error.message : "Failed to save your profile";
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4 py-10">
            <Card className="w-full max-w-2xl bg-[#0b0b0b] border-[#1f1f1f] text-white">
                <CardContent className="p-8 space-y-8">

                    <div className="text-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <Sparkles className="w-7 h-7 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome aboard, expert.</h1>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                            You&apos;ve been approved. Tell consumers a bit about yourself, then create your first community to start sharing reviews and picks.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">Approved</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[10px] text-emerald-100 font-bold">2</span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-300">Profile</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <span className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-bold">3</span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Community</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-sm font-medium text-zinc-300">
                                Short bio <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="bio"
                                placeholder="e.g. 8 years reviewing audio gear and home theatre setups."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="bg-[#111] border-[#1f1f1f] min-h-[110px] resize-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expertise" className="text-sm font-medium text-zinc-300">
                                Areas of expertise
                            </Label>
                            <Input
                                id="expertise"
                                placeholder="audio, fitness, photography (comma separated)"
                                value={expertise}
                                onChange={(e) => setExpertise(e.target.value)}
                                className="bg-[#111] border-[#1f1f1f] focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="years" className="text-sm font-medium text-zinc-300">
                                Years of experience
                            </Label>
                            <Input
                                id="years"
                                type="number"
                                min={0}
                                max={70}
                                placeholder="e.g. 5"
                                value={yearsOfExperience}
                                onChange={(e) => setYearsOfExperience(e.target.value)}
                                className="bg-[#111] border-[#1f1f1f] focus:border-emerald-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-base font-semibold gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Continue to create community
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
