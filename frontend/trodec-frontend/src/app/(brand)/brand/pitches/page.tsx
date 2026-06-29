"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Plus,
  Search,
  Loader2,
  MoreVertical,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  getSentPitches,
  deletePitch,
  getPitchStatusColor,
  getPitchStatusLabel,
  PitchWithDetails,
} from "@/services";

export default function BrandPitchesPage() {
  const router = useRouter();
  const [pitches, setPitches] = useState<PitchWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPitches();
  }, []);

  async function loadPitches() {
    try {
      setIsLoading(true);
      const result = await getSentPitches();
      setPitches(result.data);
    } catch (error) {
      console.error("Failed to fetch pitches:", error);
      toast.error("Failed to load pitches");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this pitch?")) return;

    try {
      setDeletingId(id);
      await deletePitch(id);
      setPitches((prev) => prev.filter((p) => p.id !== id));
      toast.success("Pitch deleted successfully");
    } catch (error) {
      toast.error("Failed to delete pitch");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredPitches = pitches.filter((p) => {
    const matchesSearch =
      p.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.expert?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.community?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-8 text-white">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Pitches
          </h1>
          <p className="text-sm text-zinc-400">
            Create and manage your campaign pitches
          </p>
        </div>

        <Button
          onClick={() => router.push("/brand/pitches/new")}
          className="h-9 text-sm bg-white text-black hover:bg-zinc-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Pitch
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#1f1f1f] pb-4 overflow-x-auto">
          {["all", "pending", "accepted", "declined", "shipped", "delivered", "posted", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${statusFilter === status
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white bg-[#111111] hover:bg-[#1a1a1a]"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search pitches..."
            className="pl-9 bg-[#111111] border-[#1f1f1f] text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-[#0b0b0b] border border-[#1f1f1f] overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between mb-4">
                  <Skeleton className="w-10 h-10 rounded-lg bg-white/5" />
                  <Skeleton className="w-8 h-8 rounded-md bg-white/5" />
                </div>
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-5/6 bg-white/5" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 bg-white/5" />
                    <Skeleton className="h-6 w-20 bg-white/5" />
                  </div>
                </div>
                <div className="pt-4 border-t border-[#1f1f1f] mt-4 flex justify-between">
                  <Skeleton className="h-5 w-20 bg-white/5" />
                  <Skeleton className="h-4 w-24 bg-white/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPitches.length === 0 ? (
        <Card className="bg-[#0b0b0b] border border-[#1f1f1f] shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
              <Megaphone className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              {searchQuery ? "No pitches match your search" : "No pitches yet"}
            </h3>
            <p className="text-zinc-400 mb-8 max-w-sm">
              {searchQuery
                ? `We couldn't find any pitches matching "${searchQuery}".`
                : "Start collaborating with communities by creating your first pitch."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push("/brand/communities")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl px-8 h-12 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                Explore Communities to Pitch
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPitches.map((pitch) => (
            <Card
              key={pitch.id}
              className="bg-[#0b0b0b] border border-[#1f1f1f] hover:border-zinc-700 transition-all group flex flex-col"
            >
              <CardContent className="p-6 flex-1 flex flex-col">

                {/* Top */}
                <div className="flex justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Megaphone className="w-5 h-5" />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="bg-[#111111] border-[#1f1f1f]"
                    >
                      <DropdownMenuItem
                        onClick={() => router.push(`/brand/pitches/${pitch.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleDelete(pitch.id)}
                        disabled={deletingId === pitch.id}
                        className="text-red-400"
                      >
                        {deletingId === pitch.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Body */}
                <div className="flex-1">
                  {pitch.product ? (
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">
                      {pitch.product.name}
                    </h3>
                  ) : (
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white line-clamp-1">
                        Community Pitch
                      </h3>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs border-white/20 bg-white/5 hover:bg-white/10"
                        onClick={() => router.push(`/brand/products/new?pitchId=${pitch.id}`)}
                      >
                        Add Product
                      </Button>
                    </div>
                  )}

                  <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                    {pitch.message ||
                      pitch.offerDetails ||
                      "No description provided"}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {pitch.expert && (
                      <div className="flex items-center text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                        <Users className="w-3 h-3 mr-1" />
                        {pitch.expert.fullName}
                      </div>
                    )}

                    {pitch.community && (
                      <div className="bg-zinc-800/50 px-2 py-1 rounded text-zinc-500">
                        {pitch.community.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-[#1f1f1f] mt-4 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`capitalize ${getPitchStatusColor(
                      pitch.status
                    )}`}
                  >
                    {getPitchStatusLabel(pitch.status)}
                  </Badge>

                  <div className="text-xs text-zinc-500">
                    {new Date(pitch.createdAt).toLocaleDateString()}
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
