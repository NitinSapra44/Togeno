"use client";

import { FC } from "react";
import { Users, ShieldCheck, ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore, useCommunityStore } from "@/stores";
import { useModalStore } from "@/stores/modal.store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  members: string;
  discussions: number;
  trustIndex: number;
  emoji: string;
  expertAvatars: string[];
}

const mockCommunities: CommunityCardProps[] = [
  {
    id: "com_1",
    name: "Audiophiles Elite",
    description: "The premier destination for high-end audio gear reviews and soundstage debates.",
    members: "12.5k",
    discussions: 142,
    trustIndex: 98,
    emoji: "🎧",
    expertAvatars: ["https://i.pravatar.cc/100?img=11", "https://i.pravatar.cc/100?img=32", "https://i.pravatar.cc/100?img=44"],
  },
  {
    id: "com_2",
    name: "PC Build Enthusiasts",
    description: "Hardware benchmarks, custom loops, and extreme overclocking insights.",
    members: "34.2k",
    discussions: 389,
    trustIndex: 96,
    emoji: "💻",
    expertAvatars: ["https://i.pravatar.cc/100?img=15", "https://i.pravatar.cc/100?img=68"],
  },
  {
    id: "com_3",
    name: "Mechanical Keebs",
    description: "Discussing switches, keycap profiles, and the best custom acoustic boards.",
    members: "28.9k",
    discussions: 215,
    trustIndex: 99,
    emoji: "⌨️",
    expertAvatars: ["https://i.pravatar.cc/100?img=47", "https://i.pravatar.cc/100?img=12", "https://i.pravatar.cc/100?img=5"],
  },
  {
    id: "com_4",
    name: "Indie Dev Setup",
    description: "Workspace optimization, workflow tools, and setups for software creators.",
    members: "8.1k",
    discussions: 89,
    trustIndex: 95,
    emoji: "🚀",
    expertAvatars: ["https://i.pravatar.cc/100?img=33", "https://i.pravatar.cc/100?img=21"],
  },
];

export const MarketplaceTrendingCommunities: FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { joinedCommunities, joinCommunity, joiningIds } = useCommunityStore();
  const { openLoginModal } = useModalStore();

  const handleJoinClick = async (e: React.MouseEvent, communityId: string, communityName: string) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      openLoginModal({
        message: "Login to join the community",
        onComplete: () => {
          // After login, we could try to join again, but for now just redirect or let user click again
          router.push("/consumer/communities");
        }
      });
      return;
    }

    if (joinedCommunities.includes(communityId)) return;

    try {
      await joinCommunity(communityId);
      toast.success(`Joined ${communityName}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join community");
    }
  };

  const handleCardClick = (communityId: string) => {
    router.push(`/consumer/communities/${communityId}`);
  };

  return (
    <section className="py-32 relative z-10 w-full overflow-hidden bg-[#0a0a0a]">
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
              Trending Communities
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide leading-relaxed">
             Expert circles of verified enthusiasts. Enter private domains where trust is the ultimate currency.
            </p>
          </div>
          <button 
            onClick={() => router.push("/consumer/communities")}
            className="text-white hidden md:flex items-center gap-3 group px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-xl hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] text-sm uppercase tracking-widest font-semibold flex-shrink-0"
          >
            View Communities <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Cinematic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockCommunities.map((community, idx) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleCardClick(community.id)}
              className="group relative overflow-hidden bg-[#111] border border-white/10 rounded-[1.5rem] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer flex flex-col h-full hover:border-white/20 hover:bg-[#141416] shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] active:scale-[0.98] p-6"
            >
                {/* Top Headers: Category & Trust Badge */}
                <div className="flex items-start justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 border border-orange-400/20">
                       🔥 Active Now
                    </span>
                    {/* Trust Verified Badge */}
                    <div className="flex items-center gap-1.5 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                    </div>
                </div>

                {/* General Info */}
                <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-[#0a0a0a] border border-white/10 shrink-0 flex items-center justify-center text-4xl overflow-hidden group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <span>{community.emoji}</span>
                    </div>

                    <div className="flex flex-col flex-grow min-w-0 justify-center">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 leading-tight mb-1.5">
                            {community.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-snug">
                            {community.description}
                        </p>
                    </div>
                </div>

                {/* Led by Expert Module with Overlapping Avatars */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-3 relative z-10">
                      <div className="flex -space-x-2 shrink-0">
                        {community.expertAvatars.map((avatar, i) => (
                           <img key={i} src={avatar} alt="Expert" loading="lazy" className="w-8 h-8 rounded-full border-2 border-[#141416] object-cover" />
                        ))}
                      </div>
                      <div>
                         <p className="text-white text-[13px] font-bold leading-none mb-1">Expert </p>
                         <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold leading-none">Guiding the discussion</p>
                      </div>
                   </div>
                </div>

                {/* Social Proof & Activity Metric */}
                <div className="flex items-center justify-between gap-3 mb-6 mt-auto px-1">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-300 text-xs font-bold whitespace-nowrap">
                            {community.members}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold whitespace-nowrap">
                            {community.discussions} today
                        </span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto relative z-10">
                    <button 
                        onClick={(e) => handleJoinClick(e, community.id, community.name)}
                        disabled={joinedCommunities.includes(community.id) || joiningIds.includes(community.id)}
                        className={`w-full font-bold rounded-xl h-12 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 ${
                            joinedCommunities.includes(community.id) 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default" 
                            : "bg-white text-black hover:bg-zinc-200"
                        }`}
                    >
                        {joiningIds.includes(community.id) ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Joining...
                            </>
                        ) : joinedCommunities.includes(community.id) ? (
                            "Joined"
                        ) : (
                            "Join Community"
                        )}
                    </button>
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
