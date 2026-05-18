"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, Users, Award, User } from "lucide-react";
import { toast } from "sonner";
import { getAdminCommunities, AdminCommunityRow, PaginatedResult } from "@/services/admin.service";

export default function AdminCommunitiesPage() {
  const [data, setData] = useState<PaginatedResult<AdminCommunityRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const result = await getAdminCommunities();
        setData(result);
      } catch {
        toast.error("Failed to load communities");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      );
    }

    if ((data?.data ?? []).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <MessageSquare className="h-8 w-8 mb-3" />
          <p className="text-sm">No communities found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data?.data ?? []).map((community, i) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-5 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-zinc-700 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{community.name}</p>
                {community.categories && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">{community.categories.name}</p>
                )}
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${
                community.is_active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {community.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {community.description && (
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{community.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {community.member_count.toLocaleString()} members
              </span>
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                {community.expert_count} experts
              </span>
            </div>

            <div className="flex items-center gap-1 mt-3 text-[10px] text-zinc-500">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {community.creator?.full_name ?? "Unknown expert"}
              </span>
            </div>

            <p className="text-[10px] text-zinc-600 mt-1">
              Created {new Date(community.created_at).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-white">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f1f1f]">
        <h1 className="text-2xl font-semibold tracking-tight">Communities</h1>
        <p className="text-sm text-zinc-400 mt-1">All platform communities</p>
      </div>

      {data && (
        <p className="text-xs text-zinc-500">{data.pagination.total} communities total</p>
      )}

      {renderContent()}
    </div>
  );
}
