"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Loader2,
  Zap,
  CheckCircle2,
  Heart,
  Clock,
  Lightbulb,
  Award,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { getCommunities, Community } from "@/services";
import { PostService, PostWithDetails } from "@/services/post.service";
import { getReceivedPitches, PitchWithDetails } from "@/services/pitch.service";
import { AvatarImage, CommunityImage } from "@/components/ui/app-image";

export default function ExpertDashboardPage() {
  const router = useRouter();
  const { profile, expertDetails } = useAuthStore();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [pitches, setPitches] = useState<PitchWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [communitiesResult, postsResult, pitchesResult] = await Promise.all([
          getCommunities({ limit: 50, mine: true }),
          PostService.getMyPosts({ limit: 100 }),
          getReceivedPitches({ limit: 20, status: "pending" }),
        ]);
        setCommunities(communitiesResult.data);
        setPosts(postsResult.data);
        setPitches(pitchesResult.data);
      } catch {
        // non-fatal — dashboard degrades gracefully
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [profile]);

  // Derived stats
  const totalCommunities = communities.length;
  const totalPosts = posts.length;
  const reviews = posts.filter((p) => p.rating && p.rating > 0);
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : "0.0";
  const totalMembers = communities.reduce((acc, c) => acc + (c.memberCount || 0), 0);
  const pendingPitches = pitches.filter((p) => p.status === "pending");

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const topPost =
    posts.length > 0
      ? [...posts].sort(
          (a, b) =>
            (b.likesCount || 0) + (b.commentsCount || 0) - ((a.likesCount || 0) + (a.commentsCount || 0))
        )[0]
      : null;

  const activeCommunities = [...communities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "EX";

  const stats = [
    {
      title: "Communities",
      value: totalCommunities.toString(),
      icon: Users,
      gradient: "from-emerald-500/10 to-transparent",
      glowColor: "hover:shadow-emerald-500/10",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/20",
    },
    {
      title: "Posts",
      value: totalPosts.toString(),
      icon: MessageSquare,
      gradient: "from-blue-500/10 to-transparent",
      glowColor: "hover:shadow-blue-500/10",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      borderHover: "hover:border-blue-500/20",
    },
    {
      title: "Reviews",
      value: totalReviews.toString(),
      icon: Star,
      gradient: "from-amber-500/10 to-transparent",
      glowColor: "hover:shadow-amber-500/10",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      borderHover: "hover:border-amber-500/20",
    },
    {
      title: "Avg Rating",
      value: avgRating,
      icon: TrendingUp,
      gradient: "from-purple-500/10 to-transparent",
      glowColor: "hover:shadow-purple-500/10",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
      borderHover: "hover:border-purple-500/20",
    },
  ];

  const quickActions = [
    {
      label: "New Post",
      icon: MessageSquare,
      href: "/expert/posts/new",
      color: "text-blue-400",
      bg: "bg-blue-500/8 hover:bg-blue-500/15",
      border: "border-blue-500/15 hover:border-blue-500/30",
    },
    {
      label: "New Community",
      icon: Users,
      href: "/expert/communities/new",
      color: "text-emerald-400",
      bg: "bg-emerald-500/8 hover:bg-emerald-500/15",
      border: "border-emerald-500/15 hover:border-emerald-500/30",
    },
    {
      label: "Pitches",
      icon: Lightbulb,
      href: "/expert/pitches",
      color: "text-amber-400",
      bg: "bg-amber-500/8 hover:bg-amber-500/15",
      border: "border-amber-500/15 hover:border-amber-500/30",
      badge: pendingPitches.length,
    },
    {
      label: "Earnings",
      icon: DollarSign,
      href: "/expert/earnings",
      color: "text-purple-400",
      bg: "bg-purple-500/8 hover:bg-purple-500/15",
      border: "border-purple-500/15 hover:border-purple-500/30",
    },
  ];

  return (
    <div className="space-y-8 text-white max-w-[1600px] mx-auto pb-20">

      {/* Expert Identity Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0e0e0e] p-7">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="ring-2 ring-emerald-500/20 rounded-full">
              <AvatarImage
                src={profile?.avatarUrl}
                alt={profile?.fullName || "Expert"}
                initials={initials}
                size="w-16 h-16"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">
                  {profile?.fullName || "Expert"}
                </h1>
                {expertDetails?.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Expert
                  </span>
                )}
              </div>

              {expertDetails?.bio && (
                <p className="text-sm text-zinc-400 mt-1 max-w-md line-clamp-1">
                  {expertDetails.bio}
                </p>
              )}

              {expertDetails?.expertise && expertDetails.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {expertDetails.expertise.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-zinc-400 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trust indicators */}
          {!isLoading && (
            <div className="flex flex-row md:flex-col gap-5 md:gap-2 md:items-end shrink-0">
              {totalMembers > 0 && (
                <div className="md:text-right">
                  <p className="text-2xl font-bold text-emerald-400">
                    {totalMembers.toLocaleString()}+
                  </p>
                  <p className="text-xs text-zinc-500">community members</p>
                </div>
              )}
              {expertDetails?.yearsOfExperience && (
                <div className="md:text-right">
                  <p className="text-lg font-semibold text-white">
                    {expertDetails.yearsOfExperience} yrs
                  </p>
                  <p className="text-xs text-zinc-500">experience</p>
                </div>
              )}
              {totalMembers === 0 && !expertDetails?.yearsOfExperience && (
                <p className="text-xs text-zinc-600 italic">Build your reputation by creating communities and posts.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border ${action.border} ${action.bg} transition-all duration-200 hover:-translate-y-0.5 text-left`}
          >
            <div className={`p-2 rounded-lg ${action.bg} shrink-0`}>
              <action.icon className={`h-4 w-4 ${action.color}`} />
            </div>
            <span className="text-sm font-medium text-zinc-300">{action.label}</span>
            {!!action.badge && action.badge > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-black text-[10px] font-bold px-1 leading-none">
                {action.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className={`bg-gradient-to-br ${stat.gradient} bg-[#111111] border-[#1f1f1f] ${stat.borderHover} hover:shadow-xl ${stat.glowColor} hover:-translate-y-0.5 transition-all duration-300 cursor-default`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <BarChart3 className="h-3.5 w-3.5 text-zinc-800" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                  <p className="text-[11px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content Grid: Recent Posts + Right Sidebar */}
      {!isLoading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent Posts — 2 cols */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Recent Posts</h2>
                <p className="text-xs text-zinc-600 mt-0.5">{totalPosts} post{totalPosts !== 1 ? "s" : ""} published</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/expert/posts")}
                className="text-zinc-500 hover:text-white text-xs h-7"
              >
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {recentPosts.length === 0 ? (
              <Card className="bg-[#111111] border-[#1f1f1f]">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                  <p className="text-sm text-zinc-500">No posts yet. Share your expertise!</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs"
                    onClick={() => router.push("/expert/posts/new")}
                  >
                    Write First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/expert/posts/${post.id}`)}
                    className="flex items-start gap-4 p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] hover:border-white/8 hover:bg-white/[0.015] transition-all duration-200 cursor-pointer group"
                  >
                    {post.product?.imageUrl && (
                      <div className="w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-white/5">
                        <img
                          src={post.product.imageUrl}
                          alt={post.product.name || ""}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors duration-200">
                          {post.title || post.product?.name || "Review"}
                        </p>
                        {post.community?.name && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400/80 bg-emerald-500/8 border border-emerald-500/15 px-2 py-0.5 rounded-md whitespace-nowrap">
                            <Users className="h-2.5 w-2.5" />
                            {post.community.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{post.content}</p>

                      <div className="flex items-center gap-3 mt-2">
                        {post.rating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {post.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-zinc-600">
                          <Heart className="h-3 w-3" />
                          {post.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-600">
                          <MessageSquare className="h-3 w-3" />
                          {post.commentsCount || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-700 ml-auto">
                          <Clock className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Top Post + Pitches */}
          <div className="space-y-5">

            {/* Top Performing Post */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3">Top Performing Post</h2>
              {topPost ? (
                <Card
                  onClick={() => router.push(`/expert/posts/${topPost.id}`)}
                  className="bg-[#111111] border-[#1f1f1f] hover:border-emerald-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs text-amber-400 font-medium">Best Engagement</span>
                    </div>

                    {topPost.product?.imageUrl && (
                      <div className="w-full h-28 rounded-lg overflow-hidden bg-white/5 mb-3">
                        <img
                          src={topPost.product.imageUrl}
                          alt={topPost.product.name || ""}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {topPost.title || topPost.product?.name || "Review"}
                    </p>

                    {topPost.community?.name && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400/80 bg-emerald-500/8 border border-emerald-500/15 px-2 py-0.5 rounded-md">
                          <Users className="h-2.5 w-2.5" />
                          {topPost.community.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1a1a1a]">
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {topPost.rating?.toFixed(1) || "—"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Heart className="h-3 w-3" />
                        {topPost.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <MessageSquare className="h-3 w-3" />
                        {topPost.commentsCount || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#111111] border-[#1f1f1f]">
                  <CardContent className="py-8 text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-zinc-700" />
                    <p className="text-xs text-zinc-600">Write posts to see top performance</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pending Pitches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Pitch Requests</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/expert/pitches")}
                  className="text-zinc-500 hover:text-white text-xs h-7"
                >
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>

              {pendingPitches.length === 0 ? (
                <Card className="bg-[#111111] border-[#1f1f1f]">
                  <CardContent className="py-8 text-center">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-zinc-700" />
                    <p className="text-xs text-zinc-600">No pending pitch requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {pendingPitches.slice(0, 4).map((pitch) => (
                    <div
                      key={pitch.id}
                      onClick={() => router.push("/expert/pitches")}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-amber-500/15 hover:border-amber-500/35 transition-all duration-200 cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-500/10 shrink-0">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {pitch.product?.name || "Product Pitch"}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5 truncate">
                          {pitch.brand?.brandName || "Brand"}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/12 border border-amber-500/20 text-amber-400 text-[10px] font-medium shrink-0">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Communities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Active Communities</h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              {totalCommunities} {totalCommunities === 1 ? "community" : "communities"} managed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/expert/communities")}
              className="text-zinc-500 hover:text-white text-xs h-7"
            >
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/expert/communities/new")}
              className="h-7 text-xs bg-white text-black hover:bg-zinc-200 font-medium"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : activeCommunities.length === 0 ? (
          <Card className="bg-[#111111] border-[#1f1f1f]">
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No communities yet.</p>
              <Button
                variant="outline"
                className="mt-6 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-sm"
                onClick={() => router.push("/expert/communities/new")}
              >
                Create First Community
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeCommunities.map((community) => (
              <Card
                key={community.id}
                className="bg-[#111111] border-[#1f1f1f] hover:border-white/8 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden group"
                onClick={() => router.push(`/expert/communities/${community.id}`)}
              >
                {/* Cover banner */}
                {(community.coverImageUrl || community.imageUrl) && (
                  <div className="h-24 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={community.coverImageUrl || community.imageUrl || ""}
                      alt={community.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                      loading="lazy"
                    />
                  </div>
                )}

                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <CommunityImage
                      src={community.imageUrl}
                      alt={community.name}
                      size="w-9 h-9"
                      className={
                        community.coverImageUrl
                          ? "-mt-7 ring-2 ring-[#111111] shrink-0"
                          : "shrink-0"
                      }
                    />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-semibold text-white text-sm truncate leading-tight">
                        {community.name}
                      </h3>
                      {community.category?.name && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-zinc-500 text-[10px]">
                          {community.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {community.description || "A community for passionate enthusiasts"}
                  </p>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#191919]">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Users className="h-3 w-3" />
                      {(community.memberCount || 0).toLocaleString()} members
                    </span>
                    {(community.expertCount || 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs text-emerald-500/60">
                        <Zap className="h-3 w-3" />
                        {community.expertCount} experts
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
