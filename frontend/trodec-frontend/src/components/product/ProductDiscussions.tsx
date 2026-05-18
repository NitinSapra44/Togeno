"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, ThumbsUp, Loader2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import {
  Discussion,
  DiscussionReply,
  getDiscussions,
  createDiscussion,
  toggleDiscussionLike,
  createReply,
  toggleReplyLike,
} from "@/services/discussion.service";
import { useAuthStore } from "@/stores/auth.store";
import { useModalStore } from "@/stores/modal.store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

function updateReplyLikeState(
  discussions: Discussion[],
  discussionId: string,
  replyId: string,
  result: { liked: boolean; likesCount: number }
): Discussion[] {
  return discussions.map(d => {
    if (d.id !== discussionId) return d;
    return {
      ...d,
      replies: (d.replies ?? []).map(r =>
        r.id === replyId ? { ...r, likesCount: result.likesCount, likedByMe: result.liked } : r
      ),
    };
  });
}

export function ProductDiscussions({ productId }: Readonly<{ productId: string }>) {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyPosting, setReplyPosting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        setDiscussionsLoading(true);
        const data = await getDiscussions(productId);
        setDiscussions(data);
        const expanded: Record<string, boolean> = {};
        data.forEach(d => { if ((d.replies?.length ?? 0) > 0) expanded[d.id] = true; });
        setShowReplies(expanded);
      } catch {
        // ignore
      } finally {
        setDiscussionsLoading(false);
      }
    }
    load();
  }, [productId]);

  async function handlePost() {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to post a discussion", onComplete: handlePost });
      return;
    }
    if (!newPost.trim()) return;
    try {
      setPosting(true);
      const created = await createDiscussion(productId, newPost.trim());
      setDiscussions(prev => [created, ...prev]);
      setNewPost("");
      toast.success("Discussion posted!");
    } catch {
      toast.error("Failed to post discussion");
    } finally {
      setPosting(false);
    }
  }

  async function handleToggleLike(discussionId: string) {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to like", onComplete: () => handleToggleLike(discussionId) });
      return;
    }
    try {
      const result = await toggleDiscussionLike(productId, discussionId);
      setDiscussions(prev =>
        prev.map(d => d.id === discussionId ? { ...d, likesCount: result.likesCount, likedByMe: result.liked } : d)
      );
    } catch {
      toast.error("Failed to update like");
    }
  }

  async function handlePostReply(discussionId: string): Promise<boolean> {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to reply", onComplete: () => handlePostReply(discussionId) });
      return false;
    }
    const text = replyText[discussionId]?.trim();
    if (!text) return false;
    try {
      setReplyPosting(prev => ({ ...prev, [discussionId]: true }));
      const reply = await createReply(productId, discussionId, text);
      setDiscussions(prev =>
        prev.map(d => d.id === discussionId ? { ...d, replies: [...(d.replies ?? []), reply] } : d)
      );
      setReplyText(prev => ({ ...prev, [discussionId]: "" }));
      setShowReplies(prev => ({ ...prev, [discussionId]: true }));
      return true;
    } catch {
      toast.error("Failed to post reply");
      return false;
    } finally {
      setReplyPosting(prev => ({ ...prev, [discussionId]: false }));
    }
  }

  async function handleToggleReplyLike(discussionId: string, replyId: string) {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to like", onComplete: () => handleToggleReplyLike(discussionId, replyId) });
      return;
    }
    try {
      const result = await toggleReplyLike(productId, replyId);
      setDiscussions(prev => updateReplyLikeState(prev, discussionId, replyId, result));
    } catch {
      toast.error("Failed to update like");
    }
  }

  function openReply(discussionId: string) {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to reply", onComplete: () => setReplyOpen(prev => ({ ...prev, [discussionId]: true })) });
      return;
    }
    setReplyOpen(prev => ({ ...prev, [discussionId]: !prev[discussionId] }));
  }

  return (
    <div id="discussions" className="pt-16 mt-16 border-t border-white/5 space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <MessageSquare className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Community Discussions</h3>
          <p className="text-zinc-500 text-sm mt-0.5">{discussions.length} discussion{discussions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* New discussion composer */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl space-y-3 hover:border-white/15 transition-colors">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Start a Discussion</p>
        <textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={3}
          className="w-full bg-[#111] text-sm text-white placeholder-zinc-500 rounded-xl p-4 border border-white/10 outline-none focus:border-purple-500/50 resize-none transition-colors"
        />
        <div className="flex justify-end">
          <Button
            onClick={handlePost}
            disabled={posting || !newPost.trim()}
            className="h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl px-6 shadow-lg shadow-purple-500/20"
          >
            {posting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Send className="w-3.5 h-3.5 mr-2" />Post Discussion</>
            )}
          </Button>
        </div>
      </div>

      {/* Discussion list */}
      <div className="space-y-4">
        {discussionsLoading && (
          <div className="p-12 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
            <p className="text-zinc-500 text-sm">Loading discussions...</p>
          </div>
        )}

        {!discussionsLoading && discussions.length === 0 && (
          <div className="p-12 text-center border border-white/5 rounded-2xl bg-[#0a0a0a] flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-zinc-600" />
            </div>
            <div>
              <p className="text-white font-bold">No discussions yet</p>
              <p className="text-zinc-500 text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          </div>
        )}

        {!discussionsLoading && discussions.map(d => {
          const replies = d.replies ?? [];
          const repliesOpen = showReplies[d.id] ?? false;
          const isReplyOpen = replyOpen[d.id] ?? false;
          const isExpertAuthor = d.author?.role === "expert" || d.author?.role === "admin";

          return (
            <div
              key={d.id}
              className="bg-[#0a0a0a] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-5 space-y-4 transition-colors"
            >
              {/* Author */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 text-xs text-purple-300 font-bold flex items-center justify-center shrink-0">
                  {getInitials(d.author?.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-white">{d.author?.fullName ?? "Community Member"}</span>
                    {isExpertAuthor && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Expert
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-600 font-medium ml-auto">{timeAgo(d.createdAt)}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{d.content}</p>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04] flex-wrap">
                <button
                  onClick={() => handleToggleLike(d.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition px-2.5 py-1.5 rounded-lg ${
                    d.likedByMe
                      ? "text-purple-300 bg-purple-500/15"
                      : "text-zinc-500 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {d.likesCount} {d.likesCount === 1 ? "Like" : "Likes"}
                </button>

                {replies.length > 0 && (
                  <button
                    onClick={() => setShowReplies(prev => ({ ...prev, [d.id]: !prev[d.id] }))}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05]"
                  >
                    {repliesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                  </button>
                )}

                <button
                  onClick={() => openReply(d.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition px-3 py-1.5 rounded-lg border ml-auto ${
                    isReplyOpen
                      ? "text-purple-300 bg-purple-500/15 border-purple-500/30"
                      : "text-zinc-400 hover:text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/25 border-white/[0.08]"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {isReplyOpen ? "Cancel" : "Reply to Discussion"}
                </button>
              </div>

              {/* Nested replies */}
              {repliesOpen && replies.length > 0 && (
                <div className="space-y-3 border-l-2 border-white/[0.06] ml-4 pl-4">
                  {replies.map((r: DiscussionReply) => {
                    const isReplyExpert = r.author?.role === "expert" || r.author?.role === "admin";
                    return (
                      <div key={r.id} className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/[0.06] text-[10px] font-bold flex items-center justify-center shrink-0 text-zinc-300">
                          {getInitials(r.author?.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-xs font-bold text-white">{r.author?.fullName ?? "User"}</span>
                            {isReplyExpert && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-2 h-2" /> Expert
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-600">{timeAgo(r.createdAt)}</span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{r.content}</p>
                          <button
                            onClick={() => handleToggleReplyLike(d.id, r.id)}
                            className={`flex items-center gap-1 text-[11px] mt-1.5 font-semibold transition ${
                              r.likedByMe ? "text-purple-400" : "text-zinc-600 hover:text-white"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {r.likesCount}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Animated reply input */}
              <AnimatePresence>
                {isReplyOpen && (
                  <motion.div
                    key={`reply-input-${d.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 pt-1 ml-4">
                      <input
                        value={replyText[d.id] ?? ""}
                        onChange={e => setReplyText(prev => ({ ...prev, [d.id]: e.target.value }))}
                        placeholder="Write your reply..."
                        autoFocus
                        className="flex-1 bg-[#111] border border-purple-500/20 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handlePostReply(d.id).then(ok => { if (ok) setReplyOpen(prev => ({ ...prev, [d.id]: false })); });
                          }
                        }}
                      />
                      <Button
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 px-4 rounded-xl text-sm shrink-0 shadow-md shadow-purple-500/20"
                        onClick={() => handlePostReply(d.id).then(ok => { if (ok) setReplyOpen(prev => ({ ...prev, [d.id]: false })); })}
                        disabled={!replyText[d.id]?.trim() || replyPosting[d.id]}
                      >
                        {replyPosting[d.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Send className="w-3.5 h-3.5 mr-1.5" />Send Reply</>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
