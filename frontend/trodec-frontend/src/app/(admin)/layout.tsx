"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore, useAuthHydrated } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Award,
  ShoppingBag,
  Package,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Loader2,
  Shield,
  TrendingUp,
  Lightbulb,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutConfirmModal } from "@/components/ui/logout-confirm-modal";

const sidebarItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/experts", label: "Experts", icon: Award },
  { href: "/admin/users", label: "All Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/shipments", label: "Shipments", icon: Truck },
  { href: "/admin/pitches", label: "Pitches", icon: Lightbulb },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/communities", label: "Communities", icon: MessageSquare },
  { href: "/admin/commissions", label: "Commissions", icon: TrendingUp },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const { user, profile, isAuthenticated, fetchCurrentUser, signOut } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const roleRoutes: Record<string, string> = {
    consumer: "/consumer/dashboard",
    expert: "/expert/dashboard",
    brand_admin: "/brand/dashboard",
  };

  useEffect(() => {
    if (!hydrated) return;
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      if (useAuthStore.getState().isAuthenticated) {
        const currentProfile = useAuthStore.getState().profile;
        if (currentProfile && currentProfile.role !== "admin") {
          router.push(roleRoutes[currentProfile.role] ?? "/consumer/dashboard");
          return;
        }
        setIsChecking(false);
        return;
      }

      await fetchCurrentUser();

      if (!useAuthStore.getState().isAuthenticated) {
        router.push("/admin/login");
        return;
      }

      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile && currentProfile.role !== "admin") {
        router.push(roleRoutes[currentProfile.role] ?? "/consumer/dashboard");
        return;
      }

      setIsChecking(false);
    };
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!isChecking && profile) {
      const role = profile.role;
      if (role !== "admin") {
        router.push(roleRoutes[role] ?? "/consumer/dashboard");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, profile, router]);

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    await signOut();
    router.push("/admin/login");
  };

  // Block rendering for non-admin roles while the redirect above completes,
  // so admin-only content doesn't flash for the wrong account.
  const wrongRoleForAdmin = Boolean(profile && profile.role !== "admin");

  if (!hydrated || isChecking || !isAuthenticated || wrongRoleForAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[240px] bg-[#0b0b0b] border-r border-[#1a1a1a] flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#1a1a1a]">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Trodec Logo"
                width={36}
                height={36}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-white group-hover:text-emerald-400 transition-colors duration-300">
                TRODEC
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">
            Management
          </p>

          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all relative",
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-emerald-500 rounded-r-full" />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-3 w-3 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.fullName || "Admin"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-500/5"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0b0b0b] border-b border-[#1a1a1a] flex items-center justify-between px-4 z-50">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Trodec" width={28} height={28} className="object-contain" />
          <span className="text-sm font-semibold text-white">TRODEC <span className="text-zinc-500">Admin</span></span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 bg-[#0b0b0b] border-r border-[#1a1a1a] w-64 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all",
                  isActive ? "bg-white/5 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-emerald-500" : "text-zinc-600")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-screen overflow-auto lg:pt-0 pt-14">
        <main className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
