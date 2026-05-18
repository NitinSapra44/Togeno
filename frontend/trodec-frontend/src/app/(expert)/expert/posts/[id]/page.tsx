"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquare, ThumbsUp, User, Send, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PostService, PostWithDetails } from "@/services/post.service";
import {
  PostDiscussion,
  getPostDiscussions,
  createPostDiscussion,
  togglePostDiscussionLike,
  createPostDiscussionReply,
} from "@/services/post_discussion.service";
import { useAuthStore } from "@/stores/auth.store";
import { AppImage } from "@/components/ui/app-image";

export default function ExpertPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();

  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [discussions, setDiscussions] = useState<PostDiscussion[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const p = await PostService.getPost(id);
        setPost(p as PostWithDetails);
      } catch {
        toast.error("Failed to load post");
      } finally {
        setLoadingPost(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    // On mount, read URL hash and schedule highlight + scroll
    const hash = window.location.hash;
    const match = hash.match(/^#discussion-(.+)$/);
    if (match) {
      setHighlightedId(match[1]);
      setTimeout(() => setHighlightedId(null), 3000);
    }
  }, []);

  useEffect(() => {
    async function loadDiscussions() {
      try {
        const d = await getPostDiscussions(id);
        setDiscussions(d);
        // Scroll to highlighted discussion after data loads
        const hash = window.location.hash;
        const match = hash.match(/^#discussion-(.+)$/);
        if (match) {
          setTimeout(() => {
            document.getElementById(`discussion-${match[1]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      } catch {
        toast.error("Failed to load discussions");
      } finally {
        setLoadingDiscussions(false);
      }
    }
    loadDiscussions();

    // Poll every 20 seconds so expert sees new consumer comments without a manual refresh
    const interval = setInterval(async () => {
      try {
        const d = await getPostDiscussions(id);
        setDiscussions(d);
      } catch {
        // silent — don't interrupt the expert
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [id]);

  async function handleAddComment() {
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const d = await createPostDiscussion(id, newComment.trim());
      setDiscussions((prev) => [d, ...prev]);
      setNewComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleToggleLike(discussionId: string) {
    try {
      const result = await togglePostDiscussionLike(id, discussionId);
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? { ...d, likesCount: result.likesCount, likedByMe: result.liked }
            : d
        )
      );
    } catch {
      toast.error("Failed to toggle like");
    }
  }

  async function handleAddReply(discussionId: string) {
    if (!replyContent.trim()) return;
    try {
      setSubmittingReply(true);
      const reply = await createPostDiscussionReply(id, discussionId, replyContent.trim());
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? { ...d, replies: [...(d.replies ?? []), reply] }
            : d
        )
      );
      setReplyingTo(null);
      setReplyContent("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add reply");
    } finally {
      setSubmittingReply(false);
    }
  }

  if (loadingPost) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center text-zinc-500 py-20">Post not found.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-white">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="h-9 w-9 p-0 text-zinc-400"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{post.title || "Untitled Post"}</h1>
      </div>

      {/* Post Card */}
      <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {post.product && (
            <span className="text-xs text-emerald-400 font-medium">{post.product.name}</span>
          )}
          <Badge
            variant="outline"
            className={post.isPublished
              ? "border-emerald-500/30 text-emerald-400"
              : "border-yellow-500/30 text-yellow-400"}
          >
            {post.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < post.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"}`}
            />
          ))}
          <span className="text-sm text-zinc-400 ml-1">{post.rating}/5</span>
        </div>

        {/* Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.media.length === 1
                ? "grid-cols-1"
                : post.media.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {post.media.map((m, idx) => (
              <div
                key={m.id}
                className={`overflow-hidden rounded-xl bg-[#0a0a0c] border border-white/[0.06] ${
                  post.media!.length === 1 ? "aspect-video" : "aspect-square"
                }`}
              >
                {m.mediaType?.startsWith("video") ? (
                  <video
                    src={m.mediaUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AppImage
                    src={m.mediaUrl}
                    alt={m.altText || post.title || "Post media"}
                    variant="cover"
                    containerClassName="rounded-none w-full h-full"
                    priority={idx === 0}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.pros && post.pros.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-400 mb-1">Pros</p>
            <ul className="list-disc list-inside space-y-1">
              {post.pros.map((p, i) => (
                <li key={i} className="text-sm text-zinc-300">{p}</li>
              ))}
            </ul>
          </div>
        )}

        {post.cons && post.cons.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-400 mb-1">Cons</p>
            <ul className="list-disc list-inside space-y-1">
              {post.cons.map((c, i) => (
                <li key={i} className="text-sm text-zinc-300">{c}</li>
              ))}
            </ul>
          </div>
        )}

        {post.verdict && (
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs font-semibold text-zinc-400 mb-1">Verdict</p>
            <p className="text-sm text-zinc-300 italic">"{post.verdict}"</p>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 text-xs text-zinc-500 border-t border-white/5">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" /> {post.likesCount} likes
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> {post.commentsCount} comments
          </span>
          <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {/* Discussions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-500" />
          Discussions ({discussions.length})
        </h2>

        {/* Add Comment */}
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-[#111] border-zinc-700 text-white min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={submittingComment || !newComment.trim()}
              className="bg-white text-black hover:bg-zinc-200 h-8 text-sm"
            >
              {submittingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Post
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Discussion List */}
        {loadingDiscussions ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            No discussions yet. Be the first to comment.
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                id={`discussion-${discussion.id}`}
                className={`rounded-xl p-4 space-y-3 border transition-all duration-500 ${
                  highlightedId === discussion.id
                    ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20"
                    : "bg-[#0b0b0b] border-[#1a1a1a]"
                }`}
              >
                {/* Author */}
                <div className="flex items-center gap-2 flex-wrap">
                  {discussion.author?.avatarUrl ? (
                    <img
                      src={discussion.author.avatarUrl}
                      className="h-7 w-7 rounded-full object-cover shrink-0"
                      alt=""
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {discussion.author?.fullName || "Anonymous"}
                  </span>
                  {discussion.author?.role === "expert" && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Expert
                    </span>
                  )}
                  <span className="text-xs text-zinc-500 ml-auto shrink-0">
                    {new Date(discussion.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>

                <p className="text-sm text-zinc-300">{discussion.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <button
                    onClick={() => handleToggleLike(discussion.id)}
                    className={`flex items-center gap-1 hover:text-white transition-colors ${discussion.likedByMe ? "text-emerald-400" : ""}`}
                  >
                    <ThumbsUp className="h-3 w-3" /> {discussion.likesCount}
                  </button>
                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === discussion.id ? null : discussion.id)
                    }
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" /> Reply
                  </button>
                </div>

                {/* Replies */}
                {discussion.replies && discussion.replies.length > 0 && (
                  <div className="ml-4 border-l border-[#1a1a1a] pl-4 space-y-3">
                    {discussion.replies.map((reply) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {reply.author?.avatarUrl ? (
                            <img src={reply.author.avatarUrl} className="h-5 w-5 rounded-full object-cover shrink-0" alt="" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                              <User className="h-3 w-3 text-zinc-400" />
                            </div>
                          )}
                          <span className="text-xs font-medium text-white">
                            {reply.author?.fullName || "Anonymous"}
                          </span>
                          {reply.author?.role === "expert" && (
                            <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-2 h-2" /> Expert
                            </span>
                          )}
                          <span className="text-xs text-zinc-500 ml-auto shrink-0">
                            {new Date(reply.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === discussion.id && (
                  <div className="ml-4 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="bg-[#111] border-zinc-700 text-white min-h-[60px] resize-none text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        className="h-7 text-xs text-zinc-400"
                        onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleAddReply(discussion.id)}
                        disabled={submittingReply || !replyContent.trim()}
                        className="h-7 text-xs bg-white text-black hover:bg-zinc-200"
                      >
                        {submittingReply ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reply"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
