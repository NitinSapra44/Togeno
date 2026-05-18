"use client";

import { useEffect, useState } from "react";
import { getBrandOrders, BrandOrder } from "@/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  MoreHorizontal,
  Search,
  Download,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BrandOrdersPage() {
  const [orders, setOrders] = useState<BrandOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const result = await getBrandOrders();
      setOrders(result.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "processing":
      case "confirmed":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "pending":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f1f] pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-zinc-400">
            Manage and track your customer orders.
          </p>
        </div>

        <Button
          variant="outline"
          className="h-9 border-[#1f1f1f] bg-[#0b0b0b] text-zinc-300 hover:text-white hover:bg-white/5"
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-[#0b0b0b] border-[#1f1f1f] text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#1f1f1f] bg-[#0b0b0b] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#111111]">
            <TableRow className="border-[#1f1f1f] hover:bg-transparent">
              <TableHead className="text-zinc-500">Order #</TableHead>
              <TableHead className="text-zinc-500">Date</TableHead>
              <TableHead className="text-zinc-500">Product</TableHead>
              <TableHead className="text-zinc-500">Size</TableHead>
              <TableHead className="text-zinc-500">Qty</TableHead>
              <TableHead className="text-zinc-500">Amount</TableHead>
              <TableHead className="text-zinc-500">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Package className="h-6 w-6 text-zinc-700" />
                    No orders found
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow
                  key={order.itemId ?? order.id}
                  className="border-[#1f1f1f] hover:bg-[#111111]"
                >
                  <TableCell className="font-mono text-sm text-white">
                    {order.orderNumber}
                  </TableCell>

                  <TableCell className="text-zinc-300 text-sm">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>

                  <TableCell className="text-zinc-300 text-sm">
                    <div className="flex items-center gap-2">
                      {order.productImage && (
                        <img
                          src={order.productImage}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      {order.productName || "—"}
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-300 text-sm font-mono">
                    {order.selectedSize || "—"}
                  </TableCell>

                  <TableCell className="text-zinc-300 text-sm">
                    {order.quantity || 1}
                  </TableCell>

                  <TableCell className="text-white font-medium text-sm">
                    ₹{order.total.toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        getStatusColor(order.status)
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
