"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useCommunityStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import {
  User,
  Mail,
  Shield,
  Package,
  Star,
  LogOut,
  Settings,
  Edit,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
  MapPin,
  CheckCircle2,
  ShoppingBag,
  DollarSign,
  Clock,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { OrderService, Order } from "@/services/order.service";
import { motion } from "framer-motion";

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  confirmed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pending: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function ConsumerProfilePage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const { joinedCommunities, fetchJoinedCommunities, hasFetched } = useCommunityStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingOrders(true);
        const [ordersData] = await Promise.all([
          OrderService.getMyOrders({ limit: 10 }),
          !hasFetched ? fetchJoinedCommunities() : Promise.resolve(),
        ]);
        setOrders(ordersData.data);
      } catch {
        // silently fail — zeros are fine
      } finally {
        setIsLoadingOrders(false);
      }
    }
    loadData();
  }, [hasFetched, fetchJoinedCommunities]);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const stats = [
    {
      title: "Orders Placed",
      value: isLoadingOrders ? "—" : orders.length.toString(),
      icon: ShoppingBag,
      sub: `${deliveredCount} delivered`,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Spent",
      value: isLoadingOrders ? "—" : formatPrice(totalSpent),
      icon: DollarSign,
      sub: "lifetime purchases",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Communities",
      value: joinedCommunities.length.toString(),
      icon: Users,
      sub: "joined spaces",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 space-y-10 pb-24">

      {/* HERO PROFILE */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-[#0f0f10] border border-white/10 rounded-[2rem] p-6 sm:p-8 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#141416] to-black border border-white/10 flex items-center justify-center text-4xl font-black text-white shadow-[0_0_30px_rgba(0,0,0,0.6)] overflow-hidden">
              {profile?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="text-center sm:text-left mt-2 sm:mt-0">
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                {profile?.fullName || "Consumer"}
              </h1>
              <p className="text-gray-500 font-medium">{user?.email || "No email linked"}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                <span className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Verified Consumer
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-bold rounded-xl h-11 px-6 shadow-[0_4px_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
              onClick={() => router.push("/consumer/profile/edit")}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto text-gray-400 hover:text-white hover:bg-white/5 rounded-xl h-11 px-6 transition-colors"
              onClick={() => { signOut(); router.push("/"); }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="bg-[#0f0f10] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl shadow-lg shadow-black/40"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            {isLoadingOrders && stat.title !== "Communities" ? (
              <div className="h-9 w-24 rounded-lg skeleton shimmer mb-1" />
            ) : (
              <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</h3>
            )}
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.title}</p>
            <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* STATS + TRUST SIDE BY SIDE */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* PURCHASE OVERVIEW */}
        <div className="lg:col-span-2 bg-[#0f0f10] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Purchase Overview
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Avg. Order Value</p>
              <p className="text-xl font-black text-white">
                {isLoadingOrders ? "—" : orders.length > 0 ? formatPrice(totalSpent / orders.length) : "₹0.00"}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Delivered</p>
              <p className="text-xl font-black text-white">
                {isLoadingOrders ? "—" : deliveredCount}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">In Progress</p>
              <p className="text-xl font-black text-white">
                {isLoadingOrders ? "—" : orders.filter((o) => ["confirmed", "processing", "shipped"].includes(o.status)).length}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Communities</p>
              <p className="text-xl font-black text-white">{joinedCommunities.length}</p>
            </div>
          </div>
        </div>

        {/* TRUST SECTION */}
        <div className="lg:col-span-1 bg-[#141416] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 relative z-10">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Trust Score
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Verified Consumer</span>
            </div>
            <div className="flex items-center gap-3">
              <Package className={`w-4 h-4 ${orders.length > 0 ? "text-emerald-400" : "text-gray-500"}`} />
              <span className={`text-sm font-bold ${orders.length > 0 ? "text-white" : "text-gray-400"}`}>
                {orders.length} Order{orders.length !== 1 ? "s" : ""} Placed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Award className={`w-4 h-4 ${joinedCommunities.length > 0 ? "text-emerald-400" : "text-gray-500"}`} />
              <span className={`text-sm font-bold ${joinedCommunities.length > 0 ? "text-white" : "text-gray-400"}`}>
                {joinedCommunities.length} Communit{joinedCommunities.length !== 1 ? "ies" : "y"} Joined
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Star className={`w-4 h-4 ${deliveredCount > 0 ? "text-amber-400" : "text-gray-500"}`} />
              <span className={`text-sm font-bold ${deliveredCount > 0 ? "text-white" : "text-gray-400"}`}>
                {deliveredCount} Delivered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS / ACTIVITY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" /> Recent Orders
          </h2>
          {orders.length > 0 && (
            <button
              onClick={() => router.push("/consumer/orders")}
              className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="bg-[#0f0f10] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          {isLoadingOrders ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Loader2 className="w-7 h-7 animate-spin text-zinc-600" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">No orders yet</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6">
                Join communities, explore expert-reviewed products and place your first order.
              </p>
              <Button
                onClick={() => router.push("/consumer/products")}
                className="bg-white text-black hover:bg-gray-200 font-bold rounded-xl h-10 px-6 active:scale-95 transition-all shadow-md"
              >
                Explore Marketplace
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  onClick={() => router.push(`/consumer/orders/${order.id}`)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {order.orderNumber ? `Order #${order.orderNumber}` : `Order #${order.id.slice(0, 8).toUpperCase()}`}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                        {(order.items ?? []).length} item{(order.items ?? []).length === 1 ? "" : "s"} &bull; {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        STATUS_STYLES[order.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-black text-white hidden sm:block">
                      {formatPrice(order.total)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ACCOUNT SETTINGS */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 px-1">
          <Settings className="w-5 h-5 text-gray-400" /> Account Settings
        </h2>
        <div className="bg-[#0f0f10] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          <button
            type="button"
            className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group text-left"
            onClick={() => router.push("/consumer/profile/email")}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Email Address</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{user?.email}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group text-left"
            onClick={() => router.push("/consumer/profile/security")}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Security & Password</p>
                <p className="text-xs text-zinc-500 mt-0.5">Change your account password</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group text-left"
            onClick={() => router.push("/consumer/profile/edit")}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Personal Information</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Update your name and avatar</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group text-left"
            onClick={() => router.push("/consumer/profile/addresses")}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Saved Addresses</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Manage delivery and billing addresses</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

    </div>
  );
}
