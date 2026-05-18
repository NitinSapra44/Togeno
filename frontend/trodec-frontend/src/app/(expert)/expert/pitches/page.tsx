"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  Check,
  X,
  Calendar,
  Megaphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getReceivedPitches,
  respondToPitch,
  PitchWithDetails,
  getPitchStatusColor,
  getPitchStatusLabel,
} from "@/services";

export default function ExpertPitchesPage() {
  const router = useRouter();
  const [pitches, setPitches] = useState<PitchWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPitches();
  }, []);

  async function loadPitches() {
    try {
      setIsLoading(true);
      const result = await getReceivedPitches();
      setPitches(result.data);
    } catch (error: any) {
      console.error("Failed to fetch pitches:", error);
      toast.error("Failed to load pitches");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccept(pitchId: string) {
    try {
      setUpdatingId(pitchId);
      await respondToPitch(pitchId, "accepted");
      toast.success("Pitch accepted!");
      loadPitches();
    } catch (error: any) {
      toast.error("Failed to accept pitch");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReject(pitchId: string) {
    try {
      setUpdatingId(pitchId);
      await respondToPitch(pitchId, "declined");
      toast.success("Pitch declined");
      loadPitches();
    } catch (error: any) {
      toast.error("Failed to decline pitch");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredPitches = pitches.filter(
    (p) =>
      (p.product?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (p.community?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (p.message || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Received Pitches</h1>
        <p className="text-zinc-500 mt-1">
          Review and respond to product pitches from brands
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
        <Input
          placeholder="Search pitches..."
          className="pl-9 bg-[#0f0f0f] border-[#1a1a1a] text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredPitches.length === 0 ? (
        <Card className="bg-[#0b0b0b] border-[#1a1a1a]">
          <CardContent className="py-16 text-center">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery ? "No pitches found" : "No pitches yet"}
            </h3>
            <p className="text-zinc-500">
              {searchQuery
                ? "Try a different search term"
                : "Brands will send you pitches when they want you to review their products."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPitches.map((pitch) => (
            <Card
              key={pitch.id}
              className="bg-[#0b0b0b] border-[#1a1a1a] hover:border-emerald-500/30 transition-all duration-200 cursor-pointer group"
              onClick={() =>
                router.push(`/expert/pitches/${pitch.id}`)
              }
            >
              <CardContent className="p-6">
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Megaphone className="h-5 w-5" />
                  </div>

                  <Badge
                    variant="outline"
                    className={`capitalize ${getPitchStatusColor(
                      pitch.status
                    )}`}
                  >
                    {getPitchStatusLabel(pitch.status)}
                  </Badge>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="font-semibold text-white mb-1 truncate group-hover:text-emerald-400 transition-colors">
                    {pitch.product?.name || "Product Pitch"}
                  </h3>

                  {pitch.community && (
                    <p className="text-xs text-zinc-500 mb-1">
                      Community:{" "}
                      <span className="text-zinc-300">
                        {pitch.community.name}
                      </span>
                    </p>
                  )}

                  {(pitch as any).brand && (
                    <p className="text-xs text-zinc-500 mb-2">
                      From:{" "}
                      <span className="text-zinc-300">
                        {(pitch as any).brand.brandName}
                      </span>
                    </p>
                  )}

                  <p className="text-sm text-zinc-500 line-clamp-2 min-h-[40px]">
                    {pitch.message ||
                      pitch.offerDetails ||
                      "No message"}
                  </p>
                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center text-xs text-zinc-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(pitch.createdAt).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" }
                    )}
                  </div>

                  {pitch.status === "pending" && (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => handleAccept(pitch.id)}
                        disabled={updatingId === pitch.id}
                      >
                        {updatingId === pitch.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleReject(pitch.id)}
                        disabled={updatingId === pitch.id}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
