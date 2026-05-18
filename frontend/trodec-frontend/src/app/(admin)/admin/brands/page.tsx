"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Building2,
  Globe,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getAdminBrands,
  getAdminPendingBrands,
  adminVerifyUser,
  AdminUserRow,
  PaginatedResult,
} from "@/services/admin.service";

type Tab = "all" | "pending" | "verified";

export default function AdminBrandsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "all";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [data, setData] = useState<PaginatedResult<AdminUserRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      let result: PaginatedResult<AdminUserRow>;
      if (tab === "pending") {
        result = await getAdminPendingBrands();
      } else if (tab === "verified") {
        result = await getAdminBrands({ verified: true });
      } else {
        result = await getAdminBrands();
      }
      setData(result);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setIsLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleVerify(userId: string, approved: boolean) {
    setActionLoading(userId);
    try {
      await adminVerifyUser(userId, approved);
      toast.success(approved ? "Brand approved" : "Brand rejected");
      await loadData();
    } catch {
      toast.error("Failed to update brand status");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = (data?.data ?? []).filter((row) => {
    if (!search) return true;
    const name = row.brand_details?.brand_name ?? "";
    const email = row.email ?? "";
    const fullName = row.full_name ?? "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      fullName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All Brands" },
    { key: "pending", label: "Pending Approval" },
    { key: "verified", label: "Verified" },
  ];

  return (
    <div className="w-full space-y-8 text-white">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f1f1f]">
        <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage brand accounts and approvals
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-[#111111] p-1 rounded-lg border border-[#1f1f1f]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                tab === t.key
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#111111] border border-[#1f1f1f] rounded-md text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <Building2 className="h-8 w-8 mb-3" />
          <p className="text-sm">No brands found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row, i) => {
            const bd = row.brand_details;
            const isVerified = bd?.is_verified ?? false;
            const isPending = !isVerified;

            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-zinc-700 transition"
              >
                {/* Logo / Avatar */}
                <div className="h-10 w-10 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                  {bd?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bd.logo_url} alt={bd.brand_name} loading="lazy" className="h-10 w-10 rounded-md object-contain p-0.5" />
                  ) : (
                    <Building2 className="h-5 w-5 text-zinc-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">
                      {bd?.brand_name ?? "Unnamed Brand"}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isVerified
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {isVerified ? "Verified" : "Pending"}
                    </span>
                    {bd?.business_type && (
                      <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                        {bd.business_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {row.full_name ?? "No name"} · {row.email}
                  </p>
                  {bd?.description && (
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{bd.description}</p>
                  )}
                </div>

                {/* Website */}
                {bd?.website_url && (
                  <a
                    href={bd.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition flex-shrink-0"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {isPending ? (
                    <>
                      <Button
                        size="sm"
                        disabled={actionLoading === row.id}
                        onClick={() => handleVerify(row.id, true)}
                        className="h-8 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
                        variant="ghost"
                      >
                        {actionLoading === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionLoading === row.id}
                        onClick={() => handleVerify(row.id, false)}
                        className="h-8 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                        variant="ghost"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      disabled={actionLoading === row.id}
                      onClick={() => handleVerify(row.id, false)}
                      className="h-8 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                      variant="ghost"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {data && (
        <p className="text-xs text-zinc-600 text-center">
          Showing {filtered.length} of {data.pagination.total} brands
        </p>
      )}
    </div>
  );
}
