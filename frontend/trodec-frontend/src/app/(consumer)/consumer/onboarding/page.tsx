"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Sparkles,
    Users,
    CheckCircle2,
    ArrowRight,
    Tag,
} from "lucide-react";
import { toast } from "sonner";
import { getCommunities, getCategories, Community, Category } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import { useCommunityStore } from "@/stores/community.store";
import { cn, uniqueById } from "@/lib/utils";

const onboardingFlag = (userId: string) => `trodec-consumer-onboarded-${userId}`;

function getCommunityEmoji(name: string): string {
    if (!name) return "👥";
    const lower = name.toLowerCase();
    if (lower.includes("audio") || lower.includes("music")) return "🎧";
    if (lower.includes("tech") || lower.includes("review")) return "💻";
    if (lower.includes("chef") || lower.includes("food")) return "👨‍🍳";
    if (lower.includes("fitness") || lower.includes("gym")) return "💪";
    if (lower.includes("beauty")) return "✨";
    if (lower.includes("gaming")) return "🎮";
    if (lower.includes("photo") || lower.includes("camera")) return "📸";
    if (lower.includes("home")) return "🏠";
    return "👥";
}

export default function ConsumerOnboardingPage() {
    const router = useRouter();
    const { user, profile } = useAuthStore();
    const {
        joinedCommunities,
        joinCommunity,
        fetchJoinedCommunities,
    } = useCommunityStore();

    const [loading, setLoading] = useState(true);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
    const [selectedCommunityIds, setSelectedCommunityIds] = useState<Set<string>>(new Set());
    const [step, setStep] = useState<"interests" | "communities">("interests");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [comms, cats] = await Promise.all([
                    getCommunities({ limit: 100 }),
                    getCategories(),
                ]);
                setCommunities(uniqueById(comms.data));
                setCategories(uniqueById(cats));
                await fetchJoinedCommunities(true);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load communities");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [fetchJoinedCommunities]);

    // If user already has at least one joined community, treat onboarding as complete.
    useEffect(() => {
        if (loading) return;
        if (joinedCommunities.length > 0 && user?.id) {
            try {
                localStorage.setItem(onboardingFlag(user.id), "1");
            } catch { /* ignore */ }
        }
    }, [loading, joinedCommunities, user?.id]);

    const filteredCommunities = useMemo(() => {
        if (selectedCategoryIds.size === 0) return communities;
        return communities.filter((c) => selectedCategoryIds.has(c.categoryId));
    }, [communities, selectedCategoryIds]);

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleCommunity = (id: string) => {
        setSelectedCommunityIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleNext = () => {
        if (selectedCategoryIds.size === 0) {
            toast.error("Pick at least one area you're interested in.");
            return;
        }
        setStep("communities");
    };

    const handleFinish = async () => {
        if (submitting) return;
        if (selectedCommunityIds.size === 0) {
            toast.error("Join at least one community to personalise your feed.");
            return;
        }

        setSubmitting(true);
        try {
            const ids = Array.from(selectedCommunityIds);
            // Join sequentially so backend doesn't get overwhelmed and so we
            // can recover gracefully if any one fails.
            for (const id of ids) {
                if (joinedCommunities.includes(id)) continue;
                try {
                    await joinCommunity(id);
                } catch (err) {
                    console.error("Failed to join community", id, err);
                }
            }

            if (user?.id) {
                try {
                    localStorage.setItem(onboardingFlag(user.id), "1");
                } catch { /* ignore */ }
            }

            toast.success("Welcome — your feed is ready.");
            router.replace("/consumer/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Couldn't join those communities";
            toast.error(message);
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (user?.id) {
            try {
                localStorage.setItem(onboardingFlag(user.id), "1");
            } catch { /* ignore */ }
        }
        router.replace("/consumer/dashboard");
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
        );
    }

    const firstName = profile?.fullName?.split(" ")[0] || "there";

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Welcome, {firstName}
                </h1>
                <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                    Tell us what you&apos;re into so we can personalise your dashboard with expert reviews and product picks.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-3">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    step === "interests"
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                )}>
                    {step === "communities" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>1</span>}
                    Interests
                </div>
                <div className="w-10 h-px bg-white/10" />
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    step === "communities"
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-zinc-500 border border-white/10"
                )}>
                    <span>2</span>
                    Communities
                </div>
            </div>

            {step === "interests" && (
                <Card className="bg-[#0b0b0b] border-[#1f1f1f]">
                    <CardContent className="p-6 space-y-5">
                        <div>
                            <h2 className="text-lg font-bold text-white">What interests you?</h2>
                            <p className="text-zinc-500 text-xs mt-1">
                                Pick a few categories — we&apos;ll show communities that match.
                            </p>
                        </div>

                        {categories.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No categories available yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {categories.map((cat) => {
                                    const selected = selectedCategoryIds.has(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={cn(
                                                "flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                                                selected
                                                    ? "bg-purple-500/10 border-purple-500 text-purple-300"
                                                    : "bg-[#111] border-[#1f1f1f] text-zinc-300 hover:border-zinc-700"
                                            )}
                                        >
                                            <span className="flex items-center gap-2 min-w-0">
                                                <Tag className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{cat.name}</span>
                                            </span>
                                            {selected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3">
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="text-xs text-zinc-500 hover:text-zinc-300"
                            >
                                Skip for now
                            </button>
                            <Button
                                onClick={handleNext}
                                className="bg-purple-600 hover:bg-purple-500 text-white h-11 px-6 font-semibold gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === "communities" && (
                <Card className="bg-[#0b0b0b] border-[#1f1f1f]">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-white">Join your first communities</h2>
                                <p className="text-zinc-500 text-xs mt-1">
                                    Pick at least one — your dashboard pulls reviews & picks from these.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep("interests")}
                                className="text-[11px] text-zinc-500 hover:text-zinc-300 underline-offset-4 hover:underline"
                            >
                                Back
                            </button>
                        </div>

                        {filteredCommunities.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500 text-sm">
                                No communities match those interests yet. Try{" "}
                                <button
                                    type="button"
                                    onClick={() => setStep("interests")}
                                    className="text-purple-400 hover:underline"
                                >
                                    different categories
                                </button>.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                                {filteredCommunities.map((c) => {
                                    const selected = selectedCommunityIds.has(c.id);
                                    const alreadyJoined = joinedCommunities.includes(c.id);
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => !alreadyJoined && toggleCommunity(c.id)}
                                            disabled={alreadyJoined}
                                            className={cn(
                                                "group relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200",
                                                alreadyJoined
                                                    ? "bg-emerald-500/5 border-emerald-500/30 cursor-default"
                                                    : selected
                                                    ? "bg-purple-500/10 border-purple-500"
                                                    : "bg-[#111] border-[#1f1f1f] hover:border-zinc-700"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                                                {c.imageUrl ? (
                                                    <img
                                                        src={c.imageUrl}
                                                        alt={c.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <span>{getCommunityEmoji(c.name)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{c.name}</p>
                                                <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                                    <Users className="w-3 h-3" />
                                                    {c.memberCount} members
                                                </p>
                                            </div>
                                            {alreadyJoined ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                                                    Joined
                                                </span>
                                            ) : selected ? (
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <span className="text-xs text-zinc-500">
                                {selectedCommunityIds.size} selected
                            </span>
                            <Button
                                onClick={handleFinish}
                                disabled={submitting || selectedCommunityIds.size === 0}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-6 font-semibold gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Join & continue <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
