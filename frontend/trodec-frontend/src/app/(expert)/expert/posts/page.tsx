"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Search,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  ThumbsUp,
  BarChart2,
  CheckCircle2,
  PenTool,
  Clock,
  Images,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PostService, PostWithDetails } from "@/services/post.service";
import { AppImage } from "@/components/ui/app-image";

function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111] overflow-hidden animate-pulse flex flex-col h-full">
      <div className="h-40 bg-white/[0.03] w-full" />
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="h-5 bg-white/[0.05] rounded w-3/4" />
        <div className="h-4 bg-white/[0.05] rounded w-full" />
        <div className="h-4 bg-white/[0.05] rounded w-5/6" />
        <div className="mt-auto pt-4 border-t border-white/[0.04] flex justify-between">
          <div className="h-4 bg-white/[0.05] rounded w-16" />
          <div className="h-4 bg-white/[0.05] rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default function ExpertPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [communityFilter, setCommunityFilter] = useState<string>("all");
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setIsLoading(true);
      const result = await PostService.getMyPosts({ limit: 100 });
      setPosts(result.data);
    } catch (error: any) {
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeletingId(id);
      await PostService.deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
      toast.success("Post deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  }

  // Extract unique communities from posts for the filter dropdown
  const uniqueCommunities = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach(p => {
      if (p.community) {
        map.set(p.community.id, p.community.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [posts]);

  // Derived Analytics
  const analytics = useMemo(() => {
    const total = posts.length;
    const published = posts.filter(p => p.isPublished).length;
    const draft = total - published;
    const engagement = posts.reduce((acc, p) => acc + (p.likesCount || 0) + (p.commentsCount || 0), 0);
    // Mocked views calculation based on engagement + base factor
    const views = posts.reduce((acc, p) => acc + ((p.likesCount || 0) * 12) + ((p.commentsCount || 0) * 25) + 42, 0);
    
    return { total, published, draft, engagement, views };
  }, [posts]);

  // Apply filters
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch = 
        (p.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.community?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ? true :
        statusFilter === "published" ? p.isPublished :
        !p.isPublished;
        
      const matchesCommunity = 
        communityFilter === "all" ? true :
        p.communityId === communityFilter;
        
      return matchesSearch && matchesStatus && matchesCommunity;
    });
  }, [posts, searchQuery, statusFilter, communityFilter]);

  return (
    <div className="space-y-8 text-white max-w-7xl mx-auto pb-20 bg-[#000] min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 px-4 sm:px-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-white">My Posts</h1>
          <p className="text-zinc-400 font-medium">
            Manage and track your content performance across all platforms
          </p>
        </div>
        <Button
          onClick={() => router.push("/expert/posts/new")}
          className="h-11 px-6 bg-purple-600 text-white hover:bg-purple-500 font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Post
        </Button>
      </div>

      {/* ANALYTICS STRIP */}
      {!isLoading && posts.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
          <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.08] space-y-2 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-zinc-300" />
              Total Posts
            </div>
            <p className="text-3xl font-black text-white">{analytics.total}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.08] space-y-2 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4 text-blue-400" />
              Total Views
            </div>
            <p className="text-3xl font-black text-white">{analytics.views.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.08] space-y-2 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Engagement
            </div>
            <p className="text-3xl font-black text-white">{analytics.engagement.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.08] space-y-2 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Published / Draft
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-white">{analytics.published}</p>
              <p className="text-lg font-bold text-zinc-500 mb-0.5">/ {analytics.draft}</p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 px-4 sm:px-0">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
          <Input
            placeholder="Search by title, content, or community..."
            className="pl-10 h-11 bg-[#111] border-white/[0.08] text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-11 px-4 rounded-xl bg-[#111] border border-white/[0.08] text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 outline-none appearance-none cursor-pointer pr-10 relative"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <select 
            value={communityFilter}
            onChange={(e) => setCommunityFilter(e.target.value)}
            className="h-11 px-4 rounded-xl bg-[#111] border border-white/[0.08] text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 outline-none appearance-none cursor-pointer pr-10 relative hidden sm:block max-w-[200px]"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
          >
            <option value="all">All Communities</option>
            {uniqueCommunities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="px-4 sm:px-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#111] border border-white/[0.08] flex items-center justify-center mb-6 shadow-xl">
              <PenTool className="h-10 w-10 text-zinc-700" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              {searchQuery || statusFilter !== 'all' || communityFilter !== 'all' 
                ? "No matching posts found" 
                : "You haven’t created any posts yet"}
            </h3>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || communityFilter !== 'all'
                ? "Try adjusting your filters or search term."
                : "Share your expertise, write reviews, and engage with your communities."}
            </p>
            {!searchQuery && statusFilter === 'all' && communityFilter === 'all' && (
              <Button
                onClick={() => router.push("/expert/posts/new")}
                className="bg-purple-600 hover:bg-purple-500 h-12 px-8 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="bg-[#111] border-white/[0.08] hover:border-purple-500/30 transition-all duration-300 group flex flex-col hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer"
                onClick={() => router.push(`/expert/posts/${post.id}`)}
              >
                {/* Image & Badges */}
                <div className="h-44 relative bg-[#0a0a0c] border-b border-white/[0.04] overflow-hidden shrink-0">
                  {post.media?.[0] ? (
                    post.media[0].mediaType?.startsWith("video") ? (
                      <video
                        src={post.media[0].mediaUrl}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        muted
                        playsInline
                      />
                    ) : (
                      <AppImage
                        src={post.media[0].mediaUrl}
                        alt={post.title || "Post"}
                        variant="cover"
                        containerClassName="absolute inset-0 rounded-none"
                        className="opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0c] flex items-center justify-center">
                      <FileText className="w-10 h-10 text-zinc-800" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={`backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                        post.isPublished
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                          : "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {/* Multi-media count badge */}
                  {(post.media?.length ?? 0) > 1 && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-white/[0.12] px-2 py-0.5 rounded-md text-[10px] font-bold text-white">
                      <Images className="w-3 h-3" />
                      {post.media!.length}
                    </div>
                  )}

                  {/* Community Tag */}
                  {post.community && (
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/[0.1] px-2.5 py-1 rounded-lg text-xs font-bold text-white max-w-[80%] truncate">
                      {post.community.name}
                    </div>
                  )}
                </div>

                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex-1 mb-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-white text-lg leading-tight group-hover:text-purple-300 transition-colors line-clamp-2">
                        {post.title || "Untitled Post"}
                      </h3>
                      
                      {/* Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/5 shrink-0 -mr-2 -mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#111] border-white/[0.08] text-zinc-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={() => router.push(`/expert/posts/${post.id}`)}
                            className="cursor-pointer focus:bg-white/5 focus:text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/expert/posts/${post.id}/edit`)}
                            className="cursor-pointer focus:bg-white/5 focus:text-white"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(post.id)}
                            className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                            disabled={deletingId === post.id}
                          >
                            {deletingId === post.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Draft Action Hint */}
                  {!post.isPublished && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/expert/posts/${post.id}/edit`);
                      }}
                      className="w-full mt-4 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 h-9 font-bold text-xs"
                    >
                      Continue Editing Draft
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
