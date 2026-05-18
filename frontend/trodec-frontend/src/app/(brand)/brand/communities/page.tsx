"use client";

import { useEffect, useState } from "react";
import { Button, Input, Badge } from "@/components/ui";
import {
  Search,
  Users,
  TrendingUp,
  Filter,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCommunities, Community } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";

/* ============================= */
/* HELPERS */
/* ============================= */

function getCommunityEmoji(name: string): string {
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

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function CommunitiesPage() {
  const router = useRouter();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCommunities() {
      try {
        setIsLoading(true);
        const result = await getCommunities();
        if (!controller.signal.aborted) {
          setCommunities(result.data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Failed to load communities"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchCommunities();
    return () => controller.abort();
  }, []);

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (c.description?.toLowerCase() || "").includes(
        debouncedSearchQuery.toLowerCase()
      )
  );

  function handleSendPitch(community: Community, e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/brand/pitches/new?communityId=${community.id}`);
  }

  /* ============================= */
  /* LOADING SKELETONS */
  /* ============================= */

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3 mb-5">
            <Skeleton className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <Skeleton className="h-3 w-1/3 bg-white/5" />
            </div>
          </div>
          <Skeleton className="h-3 w-full mb-2 bg-white/5" />
          <Skeleton className="h-3 w-2/3 mb-6 bg-white/5" />
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Skeleton className="h-3 w-20 bg-white/5" />
            <Skeleton className="h-8 w-24 bg-white/5 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  /* ============================= */
  /* ERROR */
  /* ============================= */

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-400">{error}</p>
        <Button
          className="bg-white text-black hover:bg-zinc-200"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-16">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Communities
          </h1>
          <p className="text-zinc-400 mt-2 text-base">
            Discover expert-led communities. Send pitches to get your products reviewed.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button className="bg-white text-black hover:bg-zinc-200 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending Now
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group/search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/search:text-zinc-300 transition-colors duration-200" />
          <Input
            placeholder="Search communities..."
            className="pl-11 pr-10 bg-[#111111] border-white/5 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/20 h-12 text-white transition-all rounded-xl shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchQuery("");
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 rounded-full transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <Button
          variant="outline"
          className="border-white/10 hover:bg-white/5 h-12 rounded-xl transition-all"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* RESULTS COUNT */}
      {!isLoading && filteredCommunities.length > 0 && (
        <p className="text-xs text-zinc-600 -mt-4">
          {filteredCommunities.length} {filteredCommunities.length === 1 ? "community" : "communities"} found
        </p>
      )}

      {/* GRID */}
      {isLoading ? (
        renderSkeletons()
      ) : filteredCommunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#0b0b0b] rounded-3xl border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
          <p className="text-zinc-400 text-center max-w-sm mb-6">
            We couldn&apos;t find any communities matching &quot;{debouncedSearchQuery}&quot;. Try adjusting your search term.
          </p>
          <Button
            onClick={() => setSearchQuery("")}
            variant="outline"
            className="rounded-xl border-white/10 text-white hover:bg-white/5 transition-all"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => {
            const emoji = getCommunityEmoji(community.name);
            const isTrending = community.memberCount > 100;
            const hasExperts = community.expertCount > 0;
            const creatorName = community.creator?.full_name;

            return (
              <div
                key={community.id}
                className="group relative bg-[#0f0f0f] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-purple-500/35 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(168,85,247,0.1)] transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/brand/communities/${community.id}`)}
              >
                {/* Top gradient line on hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-6 flex flex-col h-full">

                  {/* Header: icon + name + trending badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-2xl shrink-0 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 group-hover:scale-110 transition-all duration-300">
                        {emoji}
                      </div>
                      <div className="min-w-0">
                        {community.category?.name && (
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-400/70 mb-0.5 truncate">
                            {community.category.name}
                          </p>
                        )}
                        <h3 className="text-sm font-bold text-white leading-snug truncate group-hover:text-purple-300 transition-colors duration-300">
                          {community.name}
                        </h3>
                      </div>
                    </div>

                    {isTrending && (
                      <Badge className="shrink-0 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                        🔥 Hot
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {community.description || "A curated community for experts and enthusiasts."}
                  </p>

                  {/* Expert / creator row */}
                  {(creatorName || hasExperts) && (
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        {creatorName ? creatorName[0].toUpperCase() : "E"}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {creatorName ? `Led by ${creatorName}` : "Expert-led"}
                      </span>
                      {hasExperts && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/8 border border-emerald-400/15 px-2 py-0.5 rounded-full font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          {community.expertCount} Verified {community.expertCount === 1 ? "Expert" : "Experts"}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats + CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] mt-auto">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatCount(community.memberCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-500/50" />
                        {community.expertCount}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleSendPitch(community, e)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600/15 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/25 hover:border-purple-500 transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,85,247,0.35)] active:scale-95"
                    >
                      <Send className="w-3 h-3" />
                      Send Pitch
                    </button>
                  </div>
                </div>

                {/* Ambient glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-purple-500/[0.04] via-transparent to-transparent transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
