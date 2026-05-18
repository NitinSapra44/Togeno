"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Plus,
  Search,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  LayoutGrid,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCommunities, deleteCommunity, Community } from "@/services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ExpertCommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchCommunities() {
    try {
      setIsLoading(true);
      const result = await getCommunities({ limit: 50, mine: true });
      setCommunities(result.data);
    } catch {
      toast.error("Failed to fetch communities");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this community?")) return;

    try {
      setDeletingId(id);
      await deleteCommunity(id);
      setCommunities((prev) => prev.filter((c) => c.id !== id));
      toast.success("Community deleted");
    } catch {
      toast.error("Failed to delete community");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCommunities = useMemo(() => {
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
  }, [communities, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = communities.length;
    const members = communities.reduce((acc, curr) => acc + (curr.memberCount || 0), 0);
    const active = communities.filter((c) => c.isActive).length;
    return { total, members, active };
  }, [communities]);

  return (
    <div className="space-y-10 text-white max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-white">My Communities</h1>
          <p className="text-zinc-400 font-medium">
            Manage and grow your communities
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            <Input
              placeholder="Search your communities..."
              className="pl-10 h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {communities.length === 0 && (
            <Button
              onClick={() => router.push("/expert/communities/new")}
              className="h-11 px-6 bg-emerald-500 text-white hover:bg-emerald-400 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Community
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {!isLoading && communities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
              <LayoutGrid className="w-3.5 h-3.5" />
              Total Communities
            </div>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Total Members
            </div>
            <p className="text-2xl font-black text-white">{stats.members.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Active Communities
            </div>
            <p className="text-2xl font-black text-white">{stats.active}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-zinc-500 animate-pulse font-medium">Fetching your communities...</p>
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6 shadow-xl">
            <Users className="h-10 w-10 text-zinc-700" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            {searchQuery
              ? "No communities found"
              : "You haven’t created any communities yet"}
          </h3>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any community matching "${searchQuery}"`
              : "Start by creating your first community and invite experts and users to join your movement."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push("/expert/communities/new")}
              className="bg-emerald-500 hover:bg-emerald-400 h-12 px-8 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Community
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCommunities.map((community) => (
            <Card
              key={community.id}
              className="bg-[#0a0a0c] border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 group overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Cover Image */}
              <div className="h-28 relative overflow-hidden bg-white/[0.03] shrink-0">
                {community.coverImageUrl ? (
                  <img
                    src={community.coverImageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="outline"
                    className={`backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                      community.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                    }`}
                  >
                    {community.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Avatar Overlap */}
                <div className="absolute -bottom-6 left-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0a0c] border-4 border-[#0a0a0c] shadow-xl overflow-hidden group-hover:border-emerald-500/20 transition-colors">
                    {community.imageUrl ? (
                      <img
                        src={community.imageUrl}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                        <Users className="h-6 w-6 text-zinc-700" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-6 pt-10 flex-1 flex flex-col space-y-4">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {community.name}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/5 -mt-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#0f0f0f] border-white/[0.08] text-zinc-300"
                      >
                        <DropdownMenuItem
                          onClick={() => router.push(`/expert/communities/${community.id}`)}
                          className="cursor-pointer focus:bg-white/5 focus:text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Page
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/expert/communities/${community.id}/edit`)}
                          className="cursor-pointer focus:bg-white/5 focus:text-white"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(community.id)}
                          className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                          disabled={deletingId === community.id}
                        >
                          {deletingId === community.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed h-10">
                    {community.description || "No description provided for this community."}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-white">{community.memberCount || 0}</span> Members
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/expert/communities/${community.id}`);
                    }}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05] hover:text-white hover:border-white/[0.12] transition-all font-bold text-xs"
                  >
                    View
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/expert/communities/${community.id}/edit`);
                    }}
                    className="flex-1 h-10 rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.12] transition-all font-bold text-xs"
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
