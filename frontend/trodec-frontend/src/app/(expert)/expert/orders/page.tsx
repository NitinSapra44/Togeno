"use client";

import { useState, useEffect } from "react";
import { OrderService } from "@/services/order.service";
import { Loader2, ShoppingBag, TrendingUp, Package, Star } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  processing:"bg-purple-500/10 text-purple-400",
  shipped:   "bg-cyan-500/10 text-cyan-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

interface ExpertOrdersData {
  orders: any[];
  total: number;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    topProducts: Array<{ productId: string; productName: string; count: number }>;
  };
}

export default function ExpertOrdersPage() {
  const [data, setData] = useState<ExpertOrdersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderService.getExpertOrders()
      .then(setData)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-white pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders Dashboard</h1>
        <p className="text-zinc-500">Track orders placed through your community posts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <ShoppingBag className="w-4 h-4" /> Total Orders
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalOrders ?? 0}</p>
        </div>
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <TrendingUp className="w-4 h-4" /> Revenue Driven
          </div>
          <p className="text-2xl font-bold text-emerald-400">₹{(stats?.totalRevenue ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <Star className="w-4 h-4" /> Top Product
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {stats?.topProducts?.[0]?.productName ?? "—"}
          </p>
        </div>
      </div>

      {/* Top Products */}
      {(stats?.topProducts ?? []).length > 0 && (
        <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            {stats!.topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 text-xs w-4">{i + 1}.</span>
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                    <Package className="w-3 h-3 text-zinc-500" />
                  </div>
                  <p className="text-zinc-300 text-sm">{p.productName}</p>
                </div>
                <span className="text-xs text-zinc-500">{p.count} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-4">Recent Orders</h2>
        {(data?.orders ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-zinc-600">
            <ShoppingBag className="w-8 h-8 mb-3" />
            <p className="text-sm">No orders from your communities yet.</p>
            <p className="text-xs mt-1 text-zinc-700">Orders appear here when consumers purchase products via your posts.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-[#1f1f1f] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#0b0b0b]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Order #</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {data!.orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">#{order.orderNumber ?? order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {(order.items ?? []).map((i: any) => i.productName).join(", ").slice(0, 50) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLES[order.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium text-xs">₹{Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
