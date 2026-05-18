"use client";

import { FC, use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui";
import {
  Users,
  MessageSquare,
  Loader2,
  Star,
  ThumbsUp,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import {
  getCommunityById,
  Community,
} from "@/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api, { ApiSuccessResponse } from "@/services/api";
import { PostService, PostWithDetails } from "@/services/post.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CommunityMember {
  id: string;
  userId: string;
  isExpert: boolean;
  joinedAt: string;
  profile?: {
    fullName: string;
  };
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

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function PostCard({ post }: Readonly<{ post: PostWithDetails }>) {
  const router = useRouter();
  return (
    <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-xl">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(post.expert?.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{post.expert?.fullName ?? "Expert"}</p>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">Expert</span>
              </div>
              <p className="text-zinc-500 text-xs">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {post.product && (
            <button
              onClick={() => router.push(`/brand/products/${post.product!.id}`)}
              className="group flex items-center gap-2 text-xs font-semibold text-white bg-white/[0.05] hover:bg-emerald-500/10 border border-white/[0.1] hover:border-emerald-500/30 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[160px] truncate">{post.product.name}</span>
              <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          )}
        </div>

        {post.title && <h3 className="font-bold text-white">{post.title}</h3>}
        <p className="text-zinc-300 text-sm leading-relaxed">{post.content}</p>

        <div className="flex gap-0.5">
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <Star key={s} className={`w-4 h-4 ${s <= post.rating ? "fill-orange-400 text-orange-400" : "text-zinc-700"}`} />
          ))}
        </div>

        {(post.pros?.length || post.cons?.length) ? (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {post.pros?.length ? (
              <div className="space-y-1">
                <p className="text-emerald-400 font-semibold">Pros</p>
                {post.pros.map((p) => <p key={p} className="text-zinc-400">+ {p}</p>)}
              </div>
            ) : null}
            {post.cons?.length ? (
              <div className="space-y-1">
                <p className="text-red-400 font-semibold">Cons</p>
                {post.cons.map((c) => <p key={c} className="text-zinc-400">- {c}</p>)}
              </div>
            ) : null}
          </div>
        ) : null}

        {post.verdict && (
          <p className="text-sm italic text-zinc-400 border-l-2 border-emerald-500/40 pl-3">
            &quot;{post.verdict}&quot;
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4" />
            {post.likesCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

const CommunityDetailPage: FC<PageProps> = ({ params }) => {
  const { id } = use(params);
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    loadCommunity();
  }, [id]);

  async function loadCommunity() {
    try {
      setLoading(true);

      const data = await getCommunityById(id);
      setCommunity(data);

      try {
        const membersRes =
          await api.get<ApiSuccessResponse<CommunityMember[]>>(
            `/communities/${id}/members`
          );
        setMembers(membersRes.data.data);
      } catch {}
    } catch (error) {
      toast.error("Community not found");
      router.push("/brand/communities");
    } finally {
      setLoading(false);
    }

    // Load community posts
    try {
      setPostsLoading(true);
      const result = await PostService.getPosts({
        communityId: id,
        isPublished: "true",
        limit: 50,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setPosts(result.data);
    } catch {
      // non-fatal
    } finally {
      setPostsLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!community) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-16">

      {/* 🔥 HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 shadow-2xl">

        {/* Cover */}
        <div className="h-52 bg-gradient-to-r from-purple-800/40 via-blue-800/40 to-emerald-800/40" />

        <div className="px-8 pb-8 -mt-16 flex flex-col md:flex-row items-end gap-6">

          {/* Community Avatar */}
          <div className="w-32 h-32 rounded-3xl bg-black border-4 border-black flex items-center justify-center text-5xl shadow-xl overflow-hidden shrink-0">
            {community.imageUrl ? (
              <img
                src={community.imageUrl}
                alt={community.name}
                loading="eager"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>👥</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              {community.name}
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              {community.description ||
                "A community for enthusiasts and experts."}
            </p>
          </div>

         
          
          

            

        </div>

        {/* Stats */}
        <div className="px-8 py-6 border-t border-white/5 flex gap-8">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-bold">{community.memberCount}</span>
            <span className="text-zinc-500">Members</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="font-bold">{community.expertCount}</span>
            <span className="text-zinc-500">Experts</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-400" />
            <span className="font-bold">{posts.length}</span>
            <span className="text-zinc-500">Reviews</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold">Expert Reviews</h2>

          {postsLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p className="font-medium">No expert reviews yet.</p>
              <p className="text-sm text-zinc-600 mt-1">
                Experts in this community haven&apos;t posted any product reviews yet.
              </p>
            </div>
          )}

          {!postsLoading && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-xl">
            <CardContent className="p-6 space-y-6">

              <div>
                <h3 className="font-bold text-lg mb-2">About Community</h3>
                <p className="text-sm text-zinc-400">
                  {community.description ||
                    "A community for enthusiasts and experts."}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created</span>
                  <span>
                    {new Date(community.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Members</span>
                  <span className="font-bold">
                    {community.memberCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reviews</span>
                  <span className="font-bold">{posts.length}</span>
                </div>
              </div>

              {members.length > 0 && (
                <>
                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-sm uppercase text-zinc-500 mb-4">
                      Members
                    </h4>

                    <div className="space-y-3">
                      {members.slice(0, 6).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              member.isExpert
                                ? "bg-white text-black"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {(member.profile?.fullName || "U")[0].toUpperCase()}
                          </div>

                          <span className="text-sm">
                            {member.profile?.fullName || "Member"}
                            {member.isExpert && (
                              <span className="ml-2 text-xs text-white/60">
                                Expert
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default CommunityDetailPage;
