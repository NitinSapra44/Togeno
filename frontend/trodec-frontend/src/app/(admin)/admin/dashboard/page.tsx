"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Award,
  ShoppingBag,
  Package,
  MessageSquare,
  FileText,
  Megaphone,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminStats, AdminStats } from "@/services/admin.service";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setIsLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch {
      toast.error("Failed to load admin stats");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  const userCards = [
    { label: "Total Users", value: stats?.users.total ?? 0, icon: Users, sub: "All roles" },
    { label: "Consumers", value: stats?.users.consumers ?? 0, icon: Users, sub: "Shoppers" },
    { label: "Experts", value: stats?.users.experts ?? 0, icon: Award, sub: "Reviewers" },
    { label: "Brands", value: stats?.users.brands ?? 0, icon: Building2, sub: "Brand admins" },
  ];

  const platformCards = [
    { label: "Total Revenue", value: `₹${(stats?.orders.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, sub: "All time" },
    { label: "Total Orders", value: stats?.orders.total ?? 0, icon: ShoppingBag, sub: `${stats?.orders.pending ?? 0} pending` },
    { label: "Active Products", value: stats?.products.active ?? 0, icon: Package, sub: `${stats?.products.total ?? 0} total` },
    { label: "Communities", value: stats?.communities.active ?? 0, icon: MessageSquare, sub: `${stats?.communities.total ?? 0} total` },
    { label: "Published Posts", value: stats?.posts.published ?? 0, icon: FileText, sub: `${stats?.posts.total ?? 0} total` },
    { label: "Active Pitches", value: stats?.pitches.pending ?? 0, icon: Megaphone, sub: `${stats?.pitches.accepted ?? 0} accepted` },
  ];

  const pendingBrands = stats?.users.pendingBrandApprovals ?? 0;
  const pendingExperts = stats?.users.pendingExpertApprovals ?? 0;

  return (
    <div className="w-full space-y-10 text-white">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f1f1f]">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Platform-wide overview and statistics</p>
      </div>

      {/* Pending Approvals Alert */}
      {(pendingBrands > 0 || pendingExperts > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {pendingBrands > 0 && (
            <button
              onClick={() => router.push("/admin/brands?tab=pending")}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition text-left flex-1"
            >
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-amber-300 font-medium">
                {pendingBrands} brand{pendingBrands !== 1 ? "s" : ""} awaiting approval
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-400 ml-auto flex-shrink-0" />
            </button>
          )}
          {pendingExperts > 0 && (
            <button
              onClick={() => router.push("/admin/experts?tab=pending")}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition text-left flex-1"
            >
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-amber-300 font-medium">
                {pendingExperts} expert{pendingExperts !== 1 ? "s" : ""} awaiting approval
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-400 ml-auto flex-shrink-0" />
            </button>
          )}
        </div>
      )}

      {/* User Stats */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Users</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {userCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-zinc-700 transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <card.icon className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">{card.value.toLocaleString()}</span>
              <p className="text-xs text-zinc-500 mt-1">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Platform Stats */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Platform</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {platformCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="p-5 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-zinc-700 transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <card.icon className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </span>
              <p className="text-xs text-zinc-500 mt-1">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Review Brands", sub: "Approve or reject brand accounts", href: "/admin/brands", icon: Building2 },
            { label: "Review Experts", sub: "Approve or reject expert accounts", href: "/admin/experts", icon: Award },
            { label: "Manage Users", sub: "View and manage all platform users", href: "/admin/users", icon: Users },
            { label: "View Orders", sub: "Monitor all customer orders", href: "/admin/orders", icon: ShoppingBag },
            { label: "View Products", sub: "Browse all listed products", href: "/admin/products", icon: Package },
            { label: "Communities", sub: "View all platform communities", href: "/admin/communities", icon: MessageSquare },
          ].map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className="flex items-start gap-4 p-5 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-zinc-700 transition text-left group"
            >
              <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                <action.icon className="h-4 w-4 text-zinc-400 group-hover:text-white transition" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{action.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{action.sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600 ml-auto flex-shrink-0 mt-0.5 group-hover:text-zinc-400 transition" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
