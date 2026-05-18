"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  Search,
  Shield,
  Building2,
  Award,
  ShoppingBag,
  PowerOff,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getAdminUsers,
  adminToggleUserActive,
  AdminUserRow,
  PaginatedResult,
} from "@/services/admin.service";

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  consumer: { label: "Consumer", color: "text-blue-400 bg-blue-500/10", icon: ShoppingBag },
  expert: { label: "Expert", color: "text-purple-400 bg-purple-500/10", icon: Award },
  brand_admin: { label: "Brand", color: "text-orange-400 bg-orange-500/10", icon: Building2 },
  admin: { label: "Admin", color: "text-emerald-400 bg-emerald-500/10", icon: Shield },
};

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResult<AdminUserRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminUsers({
        role: roleFilter || undefined,
        search: search || undefined,
      });
      setData(result);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(loadData, 300);
    return () => clearTimeout(timeout);
  }, [loadData]);

  async function handleToggleActive(userId: string, currentlyActive: boolean) {
    setActionLoading(userId);
    try {
      await adminToggleUserActive(userId, !currentlyActive);
      toast.success(currentlyActive ? "User deactivated" : "User activated");
      await loadData();
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="w-full space-y-8 text-white">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f1f1f]">
        <h1 className="text-2xl font-semibold tracking-tight">All Users</h1>
        <p className="text-sm text-zinc-400 mt-1">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#111111] border border-[#1f1f1f] rounded-md text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-[#111111] border border-[#1f1f1f] rounded-md text-white focus:outline-none focus:border-zinc-600"
        >
          <option value="">All roles</option>
          <option value="consumer">Consumer</option>
          <option value="expert">Expert</option>
          <option value="brand_admin">Brand</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <Users className="h-8 w-8 mb-3" />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#1f1f1f] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f1f1f] bg-[#0b0b0b]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((row, i) => {
                const roleInfo = ROLE_LABELS[row.role] ?? { label: row.role, color: "text-zinc-400 bg-zinc-500/10", icon: Users };
                const RoleIcon = roleInfo.icon;
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-[#1a1a1a] bg-[#111111] hover:bg-white/[0.02] transition"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{row.full_name ?? "—"}</p>
                        <p className="text-xs text-zinc-500">{row.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleInfo.color}`}>
                        <RoleIcon className="h-2.5 w-2.5" />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-zinc-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        row.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {row.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={actionLoading === row.id || row.role === "admin"}
                        onClick={() => handleToggleActive(row.id, row.is_active)}
                        className={`h-7 text-xs ${
                          row.is_active
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        }`}
                      >
                        {actionLoading === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : row.is_active ? (
                          <><PowerOff className="h-3.5 w-3.5 mr-1" />Deactivate</>
                        ) : (
                          <><Power className="h-3.5 w-3.5 mr-1" />Activate</>
                        )}
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <p className="text-xs text-zinc-600 text-center">
          Showing {data.data.length} of {data.pagination.total} users
        </p>
      )}
    </div>
  );
}
