"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { getAdminPitches, AdminPitchRow, PaginatedResult } from "@/services/admin.service";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-400",
  accepted:  "bg-blue-500/10 text-blue-400",
  declined:  "bg-red-500/10 text-red-400",
  shipped:   "bg-cyan-500/10 text-cyan-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  posted:    "bg-purple-500/10 text-purple-400",
};

export default function AdminPitchesPage() {
  const [data, setData] = useState<PaginatedResult<AdminPitchRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminPitches({ status: statusFilter || undefined });
      setData(result);
    } catch {
      toast.error("Failed to load pitches");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="w-full space-y-8 text-white">
      <div className="pb-6 border-b border-[#1f1f1f]">
        <h1 className="text-2xl font-semibold tracking-tight">Pitches</h1>
        <p className="text-sm text-zinc-400 mt-1">Monitor all brand → expert pitches</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-[#111111] border border-[#1f1f1f] rounded-md text-white focus:outline-none focus:border-zinc-600"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="posted">Posted</option>
        </select>
        {data && <span className="text-xs text-zinc-500">{data.pagination.total} pitches</span>}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <Lightbulb className="h-8 w-8 mb-3" />
          <p className="text-sm">No pitches found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#1f1f1f] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f1f1f] bg-[#0b0b0b]">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Expert</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Community</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Sample</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((pitch) => (
                <tr key={pitch.id} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-zinc-300 font-medium">
                    {pitch.brand?.brand_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-300">{pitch.expert?.full_name ?? "—"}</p>
                    <p className="text-xs text-zinc-600">{pitch.expert?.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{pitch.product?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{pitch.community?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{pitch.sample_type?.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[pitch.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                      {pitch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(pitch.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
