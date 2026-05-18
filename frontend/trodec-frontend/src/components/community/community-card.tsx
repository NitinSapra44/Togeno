import { Card } from "@/components/ui/card";
import { Users, Share2, CheckCircle2, Tag, Loader2, LogOut } from "lucide-react";
import { Community } from "@/services";
import { Button } from "@/components/ui/button";

interface CommunityCardProps {
    community: Community & { isMember?: boolean };
    emoji: string;
    onClick: () => void;
    onJoinClick?: () => void;
    isJoining?: boolean;
    isTrending?: boolean;
}

export function CommunityCard({ community, emoji, onClick, onJoinClick, isJoining, isTrending }: CommunityCardProps) {
    const hasImage = !!community.imageUrl;
    const isMember = community.isMember === true;

    return (
        <Card
            onClick={onClick}
            className="group relative transition-all duration-300 rounded-[1.25rem] border border-white/10 bg-[#0f0f10] shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/60 hover:border-white/20 hover:bg-[#141416] cursor-pointer flex flex-col h-full overflow-hidden"
        >
            <div className="relative p-5 flex flex-col h-full">

                {/* Top: Category & Trending */}
                <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-semibold text-gray-500 capitalize tracking-wider flex items-center gap-1.5">
                       {isTrending ? (
                         <span className="text-orange-400 flex items-center gap-1">
                           <span>🔥</span> Trending
                         </span>
                       ) : (
                         <span className="flex items-center gap-1.5">
                           <Tag className="w-3 h-3" />
                           Community
                         </span>
                       )}
                    </span>
                    {isMember && (
                      <div className="flex items-center gap-1.5 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Joined
                      </div>
                    )}
                </div>

                {/* Community Info */}
                <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#0a0a0a] border border-white/10 shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 shadow-inner">
                        {hasImage ? (
                            <img
                                src={community.imageUrl!}
                                alt={community.name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl">{emoji}</span>
                        )}
                    </div>

                    <div className="flex flex-col flex-grow min-w-0 justify-center">
                        <h3 className="text-base font-bold text-white group-hover:text-white transition-colors line-clamp-1 leading-tight mb-1">
                            {community.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-snug">
                            {community.description || "A dedicated space for product enthusiasts."}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-5 mt-auto">
                    <span className="text-gray-400 text-xs font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        {community.memberCount} members
                    </span>
                    {community.expertCount > 0 && (
                      <span className="text-gray-400 text-xs font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {community.expertCount} expert{community.expertCount !== 1 ? "s" : ""}
                      </span>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-3 relative z-10">
                    <Button
                        className={`flex-1 font-semibold rounded-xl h-11 transition-all active:scale-[0.98] ${
                            isMember
                            ? "bg-emerald-600 text-white hover:bg-emerald-500"
                            : "bg-white text-black hover:bg-gray-200"
                        }`}
                        disabled={isJoining}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onJoinClick) onJoinClick();
                        }}
                    >
                        {isJoining ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isMember ? "Leaving..." : "Joining..."}
                            </span>
                        ) : isMember ? (
                            <span className="flex items-center gap-1.5">
                              <LogOut className="w-4 h-4" /> Leave
                            </span>
                        ) : "Join Community"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-11 h-11 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors active:scale-[0.98] shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>

            </div>
        </Card>
    );
}
