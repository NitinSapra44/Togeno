"use client";

import { FC, useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Star,
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  Loader2,
  MessageSquare,
  ThumbsUp,
  Send,
  Play,
  CheckCircle2,
  X,
  ShieldCheck,
  Flame,
  TrendingUp,
  Camera,
  Video,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { RecentlyViewedSection } from "@/components/product/RecentlyViewedSection";
import { ProductAttributesCard } from "@/components/product/ProductAttributesCard";
import { toast } from "sonner";
import { getProductById, Product } from "@/services";
import { useCart } from "@/hooks/useCart";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import {
  Discussion,
  DiscussionReply,
  getDiscussions,
  createDiscussion,
  toggleDiscussionLike,
  createReply,
} from "@/services/discussion.service";
import { PostService, PostWithDetails } from "@/services/post.service";
import { useAuthStore } from "@/stores/auth.store";
import { useModalStore } from "@/stores/modal.store";
import { useFunnel } from "@/hooks/useFunnel";
import { analytics } from "@/services/analytics.service";

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface MediaItem {
  type: "video" | "image";
  url: string;
  id: string;
  isExpert: boolean;
  title: string;
  thumbnail: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MediaPanelProps {
  heroMedia: MediaItem;
  videoItems: MediaItem[];
  expertImageItems: MediaItem[];
  imageItems: MediaItem[];
  productName: string;
  onSelectMedia: (item: MediaItem) => void;
  onOpenModal: (item: MediaItem) => void;
}

function MediaPanel({ heroMedia, videoItems, expertImageItems, imageItems, productName, onSelectMedia, onOpenModal }: Readonly<MediaPanelProps>) {
  return (
    <div className="lg:col-span-7 space-y-5">
      <button
        type="button"
        className="relative w-full aspect-4/3 rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-xl flex items-center justify-center group cursor-pointer"
        onClick={() => onOpenModal(heroMedia)}
      >
        {heroMedia.type === "video" ? (
          <>
            <video
              src={heroMedia.url}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              autoPlay muted loop playsInline
            >
              <track kind="captions" />
            </video>
            <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
              <Play className="w-3.5 h-3.5 text-white fill-white" />
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Expert Review</span>
            </div>
          </>
        ) : (
          <img
            src={heroMedia.url}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>
      </button>

      {(videoItems.length > 0 || expertImageItems.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Expert Review</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x pb-1">
            {[...videoItems, ...expertImageItems].map(item => (
              <button
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className={cn(
                  "snap-start relative w-20 h-20 shrink-0 rounded-xl overflow-hidden transition-all duration-300 bg-[#0a0a0a] group/thumb",
                  heroMedia.id === item.id
                    ? "border-2 border-purple-500 ring-2 ring-purple-500/20"
                    : "border border-white/10 opacity-60 hover:opacity-100"
                )}
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="Expert review" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <Play className="w-5 h-5 text-zinc-600" />
                  </div>
                )}
                {item.type === "video" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white drop-shadow-lg" />
                  </div>
                )}
                {heroMedia.id === item.id && (
                  <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {imageItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Product Photos <span className="text-zinc-700">({imageItems.length})</span>
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x pb-1">
            {imageItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className={cn(
                  "snap-start relative w-20 h-20 shrink-0 rounded-xl overflow-hidden transition-all duration-300 bg-[#0a0a0a] group/thumb",
                  heroMedia.id === item.id
                    ? "border-2 border-white/70 ring-2 ring-white/10"
                    : "border border-white/10 opacity-50 hover:opacity-100"
                )}
              >
                <img
                  src={item.thumbnail}
                  alt={`${idx + 1}`}
                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                />
                {heroMedia.id === item.id && (
                  <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {imageItems.length === 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Product Photos</span>
          </div>
          <div className="flex gap-2.5">
            {["p0", "p1", "p2"].map(k => (
              <div key={k} className="w-20 h-20 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center">
                <Camera className="w-6 h-6 text-zinc-700" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FormattedReviewContent({ content }: Readonly<{ content: string }>) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (/^[A-Za-z][^:]{0,30}:$/.test(trimmed)) {
          return (
            <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-4 first:mt-0">
              {trimmed}
            </p>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={i} className="flex items-start gap-2 text-zinc-300 text-sm pl-1">
              <span className="text-purple-400 font-bold mt-0.5 shrink-0">•</span>
              <span className="leading-relaxed">{trimmed.slice(2)}</span>
            </div>
          );
        }
        return <p key={i} className="text-zinc-300 text-sm leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

function ExpertReviewSection({ post }: Readonly<{ post: PostWithDetails }>) {
  const expert = post.expert!;
  return (
    <div className="pt-12 mt-12 border-t border-white/5 space-y-6">
      <h3 className="text-2xl font-black text-white flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-purple-400" />
        Expert Review
      </h3>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img
              src={expert.avatarUrl || `https://ui-avatars.com/api/?name=${expert.fullName || "Expert"}&background=random`}
              alt={expert.fullName || "Expert"}
              className="w-12 h-12 rounded-full border border-white/10 object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-[15px]">{expert.fullName}</span>
                <span className="text-purple-400 text-[9px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED EXPERT
                </span>
              </div>
              {post.community && (
                <span className="text-xs text-emerald-400/80 font-medium mt-0.5 block">
                  Community: <strong className="text-emerald-400">{post.community.name}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= (post.rating ?? 5) ? "fill-amber-400 text-amber-400" : "fill-white/10 text-white/10"}`} />
            ))}
            <span className="text-sm font-bold text-white ml-1">{post.rating ? post.rating.toFixed(1) : "5.0"}</span>
          </div>
        </div>
        {post.title && (
          <div className="bg-white/3 border border-white/5 rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Why We Tested This</p>
            <p className="text-zinc-200 text-sm font-medium leading-relaxed">{post.title}</p>
          </div>
        )}
        {post.verdict && (
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1.5">Expert Opinion</p>
            <p className="text-zinc-200 text-sm italic leading-relaxed">&quot;{post.verdict}&quot;</p>
          </div>
        )}
        {post.content && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Usage Experience</p>
            <FormattedReviewContent content={post.content} />
          </div>
        )}
        {(post.pros?.length || post.cons?.length) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            {post.pros?.length ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Pros</p>
                {post.pros.map((p) => (
                  <p key={p} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-0.5">+</span>{p}
                  </p>
                ))}
              </div>
            ) : null}
            {post.cons?.length ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Cons</p>
                {post.cons.map((c) => (
                  <p key={c} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">−</span>{c}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DiscussionReplyItem({ reply }: Readonly<{ reply: DiscussionReply }>) {
  const isExpert = reply.author?.role === "expert";
  return (
    <div className="flex gap-3 pl-4 border-l border-white/[0.06]">
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5",
        isExpert ? "bg-purple-500/20 border border-purple-500/30 text-purple-400" : "bg-zinc-800 text-zinc-400"
      )}>
        {getInitials(reply.author?.fullName)}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-zinc-300">{reply.author?.fullName ?? "Member"}</span>
          {isExpert && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Expert
            </span>
          )}
          <span className="text-[10px] text-zinc-600 ml-auto shrink-0">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{reply.content}</p>
      </div>
    </div>
  );
}

function DiscussionCard({
  discussion,
  productId,
  highlighted,
  onLike,
  onReplyAdded,
}: Readonly<{
  discussion: Discussion;
  productId: string;
  highlighted: boolean;
  onLike: (id: string, liked: boolean, count: number) => void;
  onReplyAdded: (discussionId: string, reply: DiscussionReply) => void;
}>) {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const isExpert = discussion.author?.role === "expert";

  async function handleLike() {
    if (!isAuthenticated) { openLoginModal({ message: "Login to like" }); return; }
    if (liking) return;
    setLiking(true);
    try {
      const res = await toggleDiscussionLike(productId, discussion.id);
      onLike(discussion.id, res.liked, res.likesCount);
    } catch {
      toast.error("Failed to like");
    } finally {
      setLiking(false);
    }
  }

  async function handleReply() {
    if (!isAuthenticated) { openLoginModal({ message: "Login to reply" }); return; }
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const reply = await createReply(productId, discussion.id, replyText.trim());
      onReplyAdded(discussion.id, reply);
      setReplyText("");
      setReplying(false);
      toast.success("Reply posted!");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      id={`discussion-${discussion.id}`}
      className={cn(
        "rounded-xl p-5 space-y-3 border transition-all duration-500",
        highlighted
          ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20"
          : "bg-[#0a0a0a] border-white/5 hover:border-white/10"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 border",
            isExpert
              ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
              : "bg-white/5 border-white/10 text-zinc-400"
          )}>
            {getInitials(discussion.author?.fullName)}
          </div>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-bold text-zinc-200 truncate">{discussion.author?.fullName ?? "Community Member"}</span>
            {isExpert && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5" /> Expert
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-zinc-600 shrink-0 font-medium">{timeAgo(discussion.createdAt)}</span>
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-300 leading-relaxed">{discussion.content}</p>

      {/* Actions */}
      <div className="pt-2 border-t border-white/5 flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={liking}
          className={cn(
            "text-[11px] font-bold flex items-center gap-1.5 transition-colors",
            discussion.likedByMe ? "text-purple-400" : "text-zinc-500 hover:text-purple-400"
          )}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> {discussion.likesCount || 0}
        </button>
        <button
          onClick={() => setReplying(r => !r)}
          className="text-[11px] font-bold text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {(discussion.replies?.length || 0) > 0
            ? `${discussion.replies!.length} ${discussion.replies!.length === 1 ? "Reply" : "Replies"}`
            : "Reply"}
        </button>
        {(discussion.replies?.length || 0) > 0 && (
          <button
            onClick={() => setShowReplies(s => !s)}
            className="text-[11px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors ml-auto"
          >
            {showReplies ? "Hide" : "Show replies"}
          </button>
        )}
      </div>

      {/* Replies */}
      {showReplies && (discussion.replies?.length || 0) > 0 && (
        <div className="space-y-3 pt-1">
          {discussion.replies!.map(reply => (
            <DiscussionReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}

      {/* Reply input */}
      {replying && (
        <div className="pt-2 space-y-2">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full bg-[#111] text-xs text-white placeholder-zinc-600 rounded-lg p-3 border border-white/10 outline-none focus:border-purple-500/40 resize-none min-h-16"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => { setReplying(false); setReplyText(""); }}
              className="text-[11px] text-zinc-500 hover:text-white transition px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
            <Button
              onClick={handleReply}
              disabled={submitting || !replyText.trim()}
              className="h-7 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-lg px-4"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3 mr-1" />Reply</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscussionsSection({ productId }: Readonly<{ productId: string }>) {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    // On mount, check if URL hash points to a discussion and schedule highlight
    const hash = window.location.hash;
    const match = hash.match(/^#discussion-(.+)$/);
    if (match) {
      const targetId = match[1];
      setHighlightedId(targetId);
      // Clear the highlight after 3 s
      setTimeout(() => setHighlightedId(null), 3000);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setDiscussionsLoading(true);
        const data = await getDiscussions(productId);
        setDiscussions(data);
        // After loading, scroll to the highlighted discussion if any
        const hash = window.location.hash;
        const match = hash.match(/^#discussion-(.+)$/);
        if (match) {
          setTimeout(() => {
            document.getElementById(`discussion-${match[1]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      } catch {
        // ignore
      } finally {
        setDiscussionsLoading(false);
      }
    }
    load();

    // Poll every 20 seconds so consumer sees expert replies without a manual refresh
    const interval = setInterval(async () => {
      try {
        const data = await getDiscussions(productId);
        setDiscussions(data);
      } catch {
        // silent
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [productId]);

  function handleLike(id: string, liked: boolean, count: number) {
    setDiscussions(prev => prev.map(d => d.id === id ? { ...d, likedByMe: liked, likesCount: count } : d));
  }

  function handleReplyAdded(discussionId: string, reply: DiscussionReply) {
    setDiscussions(prev => prev.map(d =>
      d.id === discussionId ? { ...d, replies: [...(d.replies ?? []), reply] } : d
    ));
  }

  async function handlePost() {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to post a discussion", onComplete: handlePost });
      return;
    }
    if (!newPost.trim()) return;
    try {
      setPosting(true);
      const created = await createDiscussion(productId, newPost.trim());
      setDiscussions((prev) => [created, ...prev]);
      setNewPost("");
      toast.success("Discussion posted!");
    } catch {
      toast.error("Failed to post discussion");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div id="discussions" className="pt-16 mt-16 border-t border-white/5 space-y-6">
      <h3 className="text-2xl font-black text-white flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-purple-400" />
        Community Discussions
        {discussions.length > 0 && (
          <span className="text-sm font-normal text-zinc-500">({discussions.length})</span>
        )}
      </h3>

      <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl space-y-3">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Write a comment..."
          className="w-full bg-[#111] text-sm text-white placeholder-zinc-500 rounded-lg p-3 border border-white/10 outline-none focus:border-purple-500/50 resize-none min-h-20"
        />
        <div className="flex justify-end">
          <Button
            onClick={handlePost}
            disabled={posting || !newPost.trim()}
            className="h-9 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg px-6"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1.5" />Post Comment</>}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {discussionsLoading && (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
          </div>
        )}
        {!discussionsLoading && discussions.length === 0 && (
          <div className="p-8 text-center text-sm font-medium text-zinc-500 border border-white/5 rounded-xl bg-[#0a0a0a]">
            No discussions yet. Be the first!
          </div>
        )}
        {!discussionsLoading && discussions.map((d) => (
          <DiscussionCard
            key={d.id}
            discussion={d}
            productId={productId}
            highlighted={highlightedId === d.id}
            onLike={handleLike}
            onReplyAdded={handleReplyAdded}
          />
        ))}
      </div>
    </div>
  );
}

const HIDDEN_TOP_LEVEL_KEYS = new Set([
  "estimatedDelivery",
  "returnPolicy",
  "categoryDisplay",
  "tags",
  "stockStatus",
]);

const HIDDEN_ATTR_KEYS = new Set([
  "color",
  "sleeveType",
]);

function sanitizeProductMetadata(
  metadata: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!metadata) return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (HIDDEN_TOP_LEVEL_KEYS.has(key)) continue;
    if (key === "attributes" && value && typeof value === "object" && !Array.isArray(value)) {
      const attrs = value as Record<string, unknown>;
      const filtered: Record<string, unknown> = {};
      for (const [attrKey, attrVal] of Object.entries(attrs)) {
        if (!HIDDEN_ATTR_KEYS.has(attrKey)) filtered[attrKey] = attrVal;
      }
      if (Object.keys(filtered).length > 0) out[key] = filtered;
    } else {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

function extractSizes(metadata: Record<string, unknown> | null | undefined): string[] {
  if (!metadata) return [];
  // Check common size keys at root level or inside attributes
  const candidates = [
    metadata.sizes,
    metadata.availableSizes,
    metadata.size,
    (metadata.attributes as Record<string, unknown> | undefined)?.sizes,
    (metadata.attributes as Record<string, unknown> | undefined)?.size,
  ];
  for (const val of candidates) {
    if (Array.isArray(val) && val.length > 0) return val.map(String);
    if (typeof val === "string" && val.trim()) {
      return val.split(",").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

const ProductDetailPage: FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const { addViewedProduct } = useRecentlyViewed();

  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [expertPost, setExpertPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);

  const { advanceTo } = useFunnel();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      setSelectedSize(null);
      setSelectedMedia(null);
      const data = await getProductById(productId);
      setProduct(data);
      addViewedProduct(data);

      analytics.track("product_view", {
        product_id: data.id,
        product_name: data.name,
        category: data.category?.name,
      });
      advanceTo("Product");

      try {
        const postsResponse = await PostService.getPosts({
          productId: data.id,
          isPublished: "true",
          limit: 1,
        });
        if (postsResponse.data.length > 0) {
          setExpertPost(postsResponse.data[0]);
        }
      } catch {
        // expert post optional
      }
    } catch {
      toast.error("Product not found");
      router.push("/consumer/products");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to add to cart", onComplete: handleAddToCart });
      return;
    }
    if (!product || isAddingToCart) return;
    const sizes = extractSizes(product.metadata);
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    setIsAddingToCart(true);
    addToCart(product, quantity, selectedSize ?? undefined);
    setIsAddingToCart(false);
    setIsAdded(true);
    setShowMiniCart(true);
    setTimeout(() => setIsAdded(false), 2000);
    setTimeout(() => setShowMiniCart(false), 5000);
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to buy now", onComplete: handleBuyNow });
      return;
    }
    if (!product || isBuyingNow) return;
    const sizes = extractSizes(product.metadata);
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    setIsBuyingNow(true);
    try {
      addToCart(product, quantity, selectedSize ?? undefined);
      router.push("/consumer/checkout");
    } catch {
      toast.error("Failed to proceed to checkout");
    } finally {
      setIsBuyingNow(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-300 mx-auto px-4 lg:px-8 pt-10 space-y-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-4/3 skeleton shimmer rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-20 skeleton rounded-xl" />)}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-10 w-3/4 skeleton rounded-lg" />
            <div className="h-4 w-1/3 skeleton rounded-lg" />
            <div className="h-24 w-full skeleton rounded-xl" />
            <div className="h-14 w-full skeleton rounded-xl" />
            <div className="h-14 w-full skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images ?? [];
  const expertMedia = expertPost?.media ?? [];
  const availableSizes = extractSizes(product.metadata);

  const videoItems: MediaItem[] = expertMedia
    .filter(m => m.mediaType === "video")
    .map(m => ({
      type: "video" as const,
      url: m.mediaUrl,
      id: m.id,
      isExpert: true,
      title: "Expert Review",
      thumbnail: images[0]?.imageUrl || "",
    }));

  const expertImageItems: MediaItem[] = expertMedia
    .filter(m => m.mediaType === "image")
    .map(m => ({
      type: "image" as const,
      url: m.mediaUrl,
      id: m.id,
      isExpert: true,
      title: "",
      thumbnail: m.mediaUrl,
    }));

  const imageItems: MediaItem[] = images.map(img => ({
    type: "image" as const,
    url: img.imageUrl,
    id: img.id,
    isExpert: false,
    title: "",
    thumbnail: img.imageUrl,
  }));

  const allMedia: MediaItem[] = [...videoItems, ...expertImageItems, ...imageItems];
  const heroMedia: MediaItem = selectedMedia ?? (videoItems[0] || imageItems[0] || expertImageItems[0]);

  let addToCartLabel;
  if (isAddingToCart) {
    addToCartLabel = <Loader2 className="w-5 h-5 animate-spin" />;
  } else if (isAdded) {
    addToCartLabel = <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Added</span>;
  } else {
    addToCartLabel = "Add to Cart";
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-300 mx-auto px-4 lg:px-8 pb-32 pt-6">

        <button
          className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold flex items-center gap-1.5 mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* 2-COL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          <MediaPanel
            heroMedia={heroMedia}
            videoItems={videoItems}
            expertImageItems={expertImageItems}
            imageItems={imageItems}
            productName={product.name}
            onSelectMedia={setSelectedMedia}
            onOpenModal={(m) => { setSelectedMedia(m); setIsModalOpen(true); }}
          />

          {/* RIGHT: INFO & ACTIONS */}
          <div className="lg:col-span-5 relative space-y-6">

            {/* COMMUNITY TAG */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Trending in <strong className="text-white">{product.category?.name || "Tech Enthusiasts"}</strong></span>
              </div>
              <button className="text-[10px] uppercase font-bold text-white hover:text-purple-300 tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded transition">
                Join
              </button>
            </div>

            {/* PRODUCT INFO — Brand → Name → Trust → Rating → Description → Specs */}
            <div className="space-y-4">

              {/* Brand name above product name */}
              {product.brand?.brandName && (
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  {product.brand.brandName}
                </p>
              )}

              <h1 className="text-3xl md:text-[32px] font-black text-white leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              {/* Trust indicators — immediately after title for instant credibility */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Expert Verified</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Community Trusted</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Real Reviews</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(product.averageRating) ? "fill-amber-400 text-amber-400" : "fill-white/10 text-white/10"}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="text-sm font-bold text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-white transition-colors"
                  onClick={() => document.getElementById("discussions")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {product.averageRating > 0 ? product.averageRating.toFixed(1) : "0.0"} ({product.reviewCount} reviews)
                </button>
              </div>

              {/* Full product description */}
              {(product.description || product.shortDescription) && (
                <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">About this product</p>
                  <p className="text-zinc-200 text-sm leading-relaxed font-medium whitespace-pre-line">
                    {product.shortDescription || product.description}
                  </p>
                  {product.shortDescription && product.description && product.description !== product.shortDescription && (
                    <p className="text-zinc-400 text-sm leading-relaxed pt-1 whitespace-pre-line">{product.description}</p>
                  )}
                </div>
              )}

              {/* Product specifications from metadata */}
              <ProductAttributesCard metadata={sanitizeProductMetadata(product.metadata)} />
            </div>

            {/* PRICE */}
            <div className="space-y-2 py-2">
              <div className="text-4xl font-black text-white tracking-tight flex items-end gap-3">
                ₹{product.price.toFixed(2)}
                {product.compareAtPrice && (
                  <span className="text-lg text-zinc-500 line-through mb-1">₹{product.compareAtPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1 text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded">
                  <Flame className="w-3.5 h-3.5" /> Selling Fast
                </div>
              </div>
            </div>

            {/* SIZE SELECTION */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Size
                    {selectedSize && <span className="ml-2 text-white normal-case tracking-normal font-semibold">— {selectedSize}</span>}
                  </p>
                  {!selectedSize && (
                    <span className="text-[10px] text-amber-400 font-semibold">Select a size</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={cn(
                        "h-9 min-w-[2.5rem] px-3 rounded-lg text-sm font-bold border transition-all duration-150 active:scale-95",
                        selectedSize === size
                          ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                          : "bg-transparent text-zinc-300 border-white/20 hover:border-white/50 hover:text-white"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CART CTAs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 rounded-xl p-1 w-28 h-12">
                  <button
                    className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-white transition"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-white text-sm">{quantity}</span>
                  <button
                    className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-white transition"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  className={cn(
                    "flex-1 h-12 text-sm font-bold tracking-wide rounded-xl transition-all duration-300",
                    isAdded
                      ? "bg-emerald-500 text-white"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-[0.98]"
                  )}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isBuyingNow || isAdded}
                >
                  {addToCartLabel}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 border border-white/20 text-white bg-[#0a0a0a] hover:bg-[#111] text-sm font-bold tracking-wide rounded-xl transition-all active:scale-[0.98]"
                onClick={handleBuyNow}
                disabled={isBuyingNow || isAddingToCart}
              >
                {isBuyingNow ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Buy Now"}
              </Button>
            </div>

            {/* BRAND */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  {product.brand?.logoUrl
                    ? <img src={product.brand.logoUrl} className="w-full h-full object-contain" alt={product.brand?.brandName ?? "Brand"} />
                    : <ShieldCheck className="w-5 h-5 text-zinc-500" />
                  }
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{product.brand?.brandName || "Premium Tech Co."}</h4>
                  <p className="text-[11px] text-zinc-500 font-medium">Official Partner &bull; Verified Brand</p>
                </div>
              </div>
            </div>
          </div>
          {/* END RIGHT */}

        </div>

        {expertPost?.expert && <ExpertReviewSection post={expertPost} />}

        <DiscussionsSection productId={productId} />

        {/* RELATED */}
        <div className="pt-16 mt-16 border-t border-white/5">
          <RecentlyViewedSection />
        </div>

      </div>

      {/* MEDIA LIGHTBOX MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-5xl bg-[#050505] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-purple-500/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-video">
                {selectedMedia.type === "video" ? (
                  <video src={selectedMedia.url} className="w-full h-full object-contain" controls autoPlay>
                    <track kind="captions" />
                  </video>
                ) : (
                  <img src={selectedMedia.url} className="w-full h-full object-contain" alt="Gallery" />
                )}
              </div>

              {/* Thumbnail strip in modal */}
              {allMedia.length > 1 && (
                <div className="flex gap-2 p-3 bg-black/60 overflow-x-auto scrollbar-hide">
                  {allMedia.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={cn(
                        "relative w-14 h-14 shrink-0 rounded-lg overflow-hidden transition-all",
                        selectedMedia.id === item.id
                          ? "border-2 border-purple-500 opacity-100"
                          : "border border-white/10 opacity-40 hover:opacity-80"
                      )}
                    >
                      <img src={item.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                      {item.type === "video" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full p-2.5 transition border border-white/10"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINI CART - Desktop */}
      <AnimatePresence>
        {showMiniCart && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-24 right-8 z-90 w-[320px] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-4 hidden lg:block ring-1 ring-purple-500/20"
          >
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                </div>
                <span className="font-bold text-white text-xs uppercase tracking-wide">Added to Cart</span>
              </div>
              <button onClick={() => setShowMiniCart(false)} className="text-zinc-500 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-900 shrink-0 border border-white/5">
                <img
                  src={imageItems[0]?.url || videoItems[0]?.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h4 className="font-bold text-white text-xs truncate">{product.name}</h4>
                <p className="text-zinc-500 text-[10px] mt-0.5 font-medium">
                  Qty: {quantity} &times; ₹{product.price}
                  {selectedSize && <span className="ml-1">· Size: {selectedSize}</span>}
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg h-9 text-xs"
              onClick={() => router.push("/consumer/checkout")}
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Checkout Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE STICKY BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#050505]/90 backdrop-blur-xl z-50 lg:hidden pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button
            className="flex-1 h-12 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold tracking-wide rounded-xl shadow-lg active:scale-[0.98] transition-all"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isBuyingNow}
          >
            {isAddingToCart ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 border-white/20 text-white bg-[#0a0a0a] hover:bg-[#111] rounded-xl active:scale-[0.98] transition-all font-bold tracking-wide text-sm"
            onClick={handleBuyNow}
            disabled={isBuyingNow || isAddingToCart}
          >
            {isBuyingNow ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Buy Now"}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ProductDetailPage;
