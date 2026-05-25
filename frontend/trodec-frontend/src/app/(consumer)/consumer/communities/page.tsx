"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  Search,
  TrendingUp,
  Filter,
  Loader2,
  UsersRound,
  Compass,
  BookMarked,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { getCommunities, Community } from "@/services";
import { CommunityCard } from "@/components/community/community-card";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useModalStore } from "@/stores/modal.store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunityStore } from "@/stores";
import { uniqueById } from "@/lib/utils";

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

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

type ActiveTab = "mine" | "explore";

export default function CommunitiesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const {
    joinedCommunities,
    fetchJoinedCommunities,
    joinCommunity: storeJoinCommunity,
    leaveCommunity: storeLeaveCommunity,
    joiningIds,
  } = useCommunityStore();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("mine");
  const [leaveConfirmCommunity, setLeaveConfirmCommunity] = useState<Community | null>(null);

  // Explore tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("members");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleLeaveClick = (community: Community) => {
    if (!isAuthenticated) {
      openLoginModal({
        message: "Login to join communities and interact with experts.",
        onComplete: () => handleLeaveClick(community),
      });
      return;
    }
    const isCurrentlyMember = joinedCommunities.includes(community.id);
    if (isCurrentlyMember) {
      setLeaveConfirmCommunity(community);
    } else {
      handleJoinToggle(community);
    }
  };

  const handleJoinToggle = async (community: Community) => {
    if (!isAuthenticated) {
      openLoginModal({
        message: "Login to join communities and interact with experts.",
        onComplete: () => handleJoinToggle(community),
      });
      return;
    }

    const isCurrentlyMember = joinedCommunities.includes(community.id);
    if (joiningIds.includes(community.id)) return;

    try {
      if (isCurrentlyMember) {
        await storeLeaveCommunity(community.id);
        toast.success(`Left ${community.name}`);
      } else {
        await storeJoinCommunity(community.id);
        toast.success(`Joined ${community.name}`);
      }
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id
            ? {
                ...c,
                memberCount: isCurrentlyMember
                  ? Math.max(0, c.memberCount - 1)
                  : c.memberCount + 1,
              }
            : c
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await getCommunities();
        setCommunities(uniqueById(result.data));
        if (isAuthenticated) {
          await fetchJoinedCommunities();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load communities");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated, fetchJoinedCommunities]);

  // Derived lists
  const joinedCommunitiesList = communities.filter((c) =>
    joinedCommunities.includes(c.id)
  );

  let exploreList = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );
  if (categoryFilter !== "all") {
    exploreList = exploreList.filter(
      (c) =>
        c.categoryId === categoryFilter ||
        c.name.toLowerCase().includes(categoryFilter)
    );
  }
  if (sortBy === "members") {
    exploreList.sort((a, b) => b.memberCount - a.memberCount);
  } else if (sortBy === "newest") {
    exploreList.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const recommended = exploreList.filter((c) => !joinedCommunities.includes(c.id));
  const trending = [...exploreList].sort((a, b) => b.memberCount - a.memberCount);

  const hasActiveFilters = categoryFilter !== "all" || sortBy !== "members";
  const clearFilters = () => {
    setCategoryFilter("all");
    setSortBy("members");
    setIsFilterOpen(false);
  };

  const FilterControls = ({ isMobileView }: { isMobileView?: boolean }) => (
    <div className={`flex ${isMobileView ? "flex-col space-y-4" : "flex-wrap items-center gap-3"} w-full`}>
      <div className={isMobileView ? "space-y-2" : ""}>
        {isMobileView && (
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Category
          </label>
        )}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger
            className={`${isMobileView ? "w-full" : "w-[140px]"} backdrop-blur-md transition-all duration-300 h-10 rounded-lg border px-4 ${
              categoryFilter !== "all"
                ? "bg-white/10 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="tech">Tech & Gear</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={`${isMobileView ? "space-y-2 pt-2 border-t border-white/10" : "flex items-center gap-3"}`}>
        {isMobileView && (
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Sort By
          </label>
        )}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger
            className={`group ${isMobileView ? "w-full" : "w-[160px]"} backdrop-blur-md transition-all duration-300 h-10 rounded-lg border px-4 focus:ring-0 shadow-none ${
              sortBy !== "members"
                ? "bg-white/10 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <Filter className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl align-end">
            <SelectItem value="members">Most Members</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
          </SelectContent>
        </Select>
        {!isMobileView && hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error}</p>
        <Button
          className="bg-white text-black hover:bg-zinc-200 rounded-full px-6"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Communities
          </h1>
          <p className="text-gray-400 text-lg">
            Join curated spaces built by experts & enthusiasts
          </p>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("mine")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === "mine"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <BookMarked className="w-4 h-4" />
          My Communities
          {joinedCommunities.length > 0 && (
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                activeTab === "mine"
                  ? "bg-black/10 text-black"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {joinedCommunities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === "explore"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Compass className="w-4 h-4" />
          Explore
        </button>
      </div>

      {/* ===================== MY COMMUNITIES TAB ===================== */}
      <AnimatePresence mode="wait">
        {activeTab === "mine" && (
          <motion.div
            key="mine"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {joinedCommunitiesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 bg-[#0a0a0a] rounded-3xl border border-white/10">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <UsersRound className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No communities joined yet
                </h3>
                <p className="text-gray-400 text-center max-w-sm mb-8">
                  Explore and join communities to see expert reviews and curated products.
                </p>
                <Button
                  onClick={() => setActiveTab("explore")}
                  className="bg-white text-black hover:bg-gray-200 font-extrabold rounded-xl px-10 h-12 shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Explore Communities
                </Button>
              </div>
            ) : (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              >
                {joinedCommunitiesList.map((community) => (
                  <motion.div key={community.id} variants={itemVariants} layout>
                    <CommunityCard
                      community={{ ...community, isMember: true }}
                      emoji={getCommunityEmoji(community.name)}
                      onClick={() =>
                        router.push(`/consumer/communities/${community.id}`)
                      }
                      onJoinClick={() => handleLeaveClick(community)}
                      isJoining={joiningIds.includes(community.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===================== EXPLORE TAB ===================== */}
        {activeTab === "explore" && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {/* SEARCH + FILTER */}
            <div className="flex flex-col gap-4 bg-white/[0.03] backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative w-full z-10 group/search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/search:text-gray-300 transition-colors duration-200" />
                <Input
                  placeholder="Search communities..."
                  className="pl-11 pr-10 h-12 bg-[#0d0d0f] border border-white/10 hover:border-white/20 focus-visible:border-white/30 focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_20px_rgba(255,255,255,0.08)] text-white placeholder:text-gray-500 font-medium text-base rounded-xl transition-all duration-300 shadow-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex-1 w-full overflow-x-auto z-10 pt-2 border-t border-white/5 md:border-t-0 md:pt-0">
                <div className="hidden md:block">
                  <FilterControls />
                </div>
                <div className="block md:hidden">
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 relative"
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="bottom"
                      className="bg-[#0a0a0a] border-t-white/10 text-white rounded-t-[2rem] max-h-[85vh] overflow-y-auto"
                    >
                      <SheetHeader className="mb-6">
                        <div className="flex items-center justify-between">
                          <SheetTitle className="text-white text-xl font-bold">
                            Filters
                          </SheetTitle>
                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="text-sm font-semibold text-zinc-400 hover:text-white"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </SheetHeader>
                      <div className="pb-24">
                        <FilterControls isMobileView />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10">
                        <Button
                          onClick={() => setIsFilterOpen(false)}
                          className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold h-12 rounded-xl text-base"
                        >
                          Show Results
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {exploreList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 px-6 bg-[#0a0a0a] rounded-3xl border border-white/10"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <UsersRound className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No communities found
                </h3>
                <p className="text-gray-400 text-center max-w-sm mb-6">
                  Try adjusting your search to discover new spaces.
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="rounded-full border-white/[0.12] text-white hover:bg-white/[0.05]"
                >
                  Clear Search
                </Button>
              </motion.div>
            ) : (
              <>
                {/* RECOMMENDED */}
                {recommended.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      Recommended for You
                    </h2>
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-2"
                    >
                      {recommended.map((community) => (
                        <motion.div key={community.id} variants={itemVariants} layout>
                          <CommunityCard
                            community={{
                              ...community,
                              isMember: joinedCommunities.includes(community.id),
                            }}
                            emoji={getCommunityEmoji(community.name)}
                            onClick={() =>
                              router.push(`/consumer/communities/${community.id}`)
                            }
                            onJoinClick={() => handleLeaveClick(community)}
                            isJoining={joiningIds.includes(community.id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* TRENDING */}
                {trending.length > 0 && (
                  <div className="space-y-6 pt-8 border-t border-white/[0.04]">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-orange-400" /> Trending
                      Communities
                    </h2>
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-2"
                    >
                      {trending.map((community) => (
                        <motion.div key={community.id} variants={itemVariants} layout>
                          <CommunityCard
                            community={{
                              ...community,
                              isMember: joinedCommunities.includes(community.id),
                            }}
                            isTrending={true}
                            emoji={getCommunityEmoji(community.name)}
                            onClick={() =>
                              router.push(`/consumer/communities/${community.id}`)
                            }
                            onJoinClick={() => handleLeaveClick(community)}
                            isJoining={joiningIds.includes(community.id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Community Confirmation Modal */}
      <Dialog open={!!leaveConfirmCommunity} onOpenChange={(open) => { if (!open) setLeaveConfirmCommunity(null); }}>
        <DialogContent className="bg-[#0b0b0b] border border-white/10 text-white rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle className="text-lg font-bold">Leave Community?</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Are you sure you want to leave this community?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
              onClick={() => setLeaveConfirmCommunity(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold"
              disabled={leaveConfirmCommunity ? joiningIds.includes(leaveConfirmCommunity.id) : false}
              onClick={async () => {
                if (!leaveConfirmCommunity) return;
                const community = leaveConfirmCommunity;
                setLeaveConfirmCommunity(null);
                await handleJoinToggle(community);
              }}
            >
              {leaveConfirmCommunity && joiningIds.includes(leaveConfirmCommunity.id) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Leave Community"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
