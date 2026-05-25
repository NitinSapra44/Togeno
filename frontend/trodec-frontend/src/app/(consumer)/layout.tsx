"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CartProvider, useCart } from "@/hooks/useCart";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useAuthStore, useAuthHydrated } from "@/stores/auth.store";
import { useCommunityStore } from "@/stores/community.store";
import { LogoutConfirmModal } from "@/components/ui/logout-confirm-modal";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/consumer/dashboard",
  },
  {
    name: "Products",
    icon: ShoppingBag,
    path: "/consumer/products",
  },
  {
    name: "Communities",
    icon: Users,
    path: "/consumer/communities",
  },
  {
    name: "Orders",
    icon: Package,
    path: "/consumer/orders",
  },
  {
    name: "Cart",
    icon: ShoppingCart,
    path: "/consumer/cart",
  },
  {
    name: "Profile",
    icon: User,
    path: "/consumer/profile",
  },
];

function getPageTitle(pathname: string): string {
  const found = navItems.find((item) => pathname.startsWith(item.path));
  return found?.name ?? "Dashboard";
}

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const { user, profile, isAuthenticated, fetchCurrentUser, signOut } = useAuthStore();
  const { joinedCommunities, fetchJoinedCommunities, hasFetched } = useCommunityStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    if (!hydrated) return;

    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login?redirect=/consumer/dashboard");
        return;
      }

      if (useAuthStore.getState().isAuthenticated) {
        setIsChecking(false);
        return;
      }

      await fetchCurrentUser();

      if (!useAuthStore.getState().isAuthenticated) {
        router.push("/login?redirect=/consumer/dashboard");
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
      if (role !== "consumer" && role !== "admin") {
        const roleRoutes: Record<string, string> = {
          expert: "/expert/dashboard",
          brand_admin: "/brand/dashboard",
        };
        router.push(roleRoutes[role] || "/consumer/dashboard");
      }
    }
  }, [isChecking, profile, router]);

  /* Make sure joined-community state is loaded so the onboarding gate
     below has accurate data before deciding to redirect. */
  useEffect(() => {
    if (!isChecking && isAuthenticated && !hasFetched) {
      fetchJoinedCommunities();
    }
  }, [isChecking, isAuthenticated, hasFetched, fetchJoinedCommunities]);

  /* New-user onboarding gate: first-time consumers pick interests and
     join at least one community before landing on the dashboard. */
  useEffect(() => {
    if (isChecking || !isAuthenticated || !user?.id) return;
    if (profile?.role && profile.role !== "consumer") return;
    if (!hasFetched) return;
    if (typeof window === "undefined") return;

    const flagKey = `trodec-consumer-onboarded-${user.id}`;
    let onboarded = false;
    try {
      onboarded = localStorage.getItem(flagKey) === "1";
    } catch { /* private mode */ }

    if (joinedCommunities.length > 0 && !onboarded) {
      try { localStorage.setItem(flagKey, "1"); } catch { /* ignore */ }
      onboarded = true;
    }

    const onOnboarding = pathname === "/consumer/onboarding";
    if (!onboarded && !onOnboarding) {
      router.push("/consumer/onboarding");
    } else if (onboarded && onOnboarding) {
      router.replace("/consumer/dashboard");
    }
  }, [
    isChecking,
    isAuthenticated,
    user?.id,
    profile?.role,
    joinedCommunities,
    hasFetched,
    pathname,
    router,
  ]);

  // Block rendering (and any child data-fetches) for non-consumer roles while
  // the role-based redirect above completes. Without this, a brand_admin who
  // briefly hits /consumer/* would still mount <CartProvider> and trigger a
  // cart fetch under the wrong account context.
  const wrongRoleForConsumer = Boolean(
    profile && profile.role !== "consumer" && profile.role !== "admin"
  );

  if (!hydrated || isChecking || !isAuthenticated || wrongRoleForConsumer) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <CartProvider>
       <ConsumerLayoutContent 
          pathname={pathname}
          router={router}
          profile={profile}
          signOut={signOut}
          isLogoutModalOpen={isLogoutModalOpen}
          setIsLogoutModalOpen={setIsLogoutModalOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          pageTitle={pageTitle}
       >
          {children}
       </ConsumerLayoutContent>
    </CartProvider>
  );
}

function ConsumerLayoutContent({
  children,
  pathname,
  router,
  profile,
  signOut,
  isLogoutModalOpen,
  setIsLogoutModalOpen,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  pageTitle
}: any) {
  const { itemCount } = useCart();
  const [cartBounce, setCartBounce] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
     if (itemCount > 0) {
        setCartBounce(true);
        const timer = setTimeout(() => setCartBounce(false), 500);
        return () => clearTimeout(timer);
     }
  }, [itemCount]);

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR — always mounted; CSS handles mobile slide in/out */}
      <motion.aside
        initial={false}
        animate={{
          x: 0,
          width: sidebarCollapsed ? 72 : 240,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col border-r border-white/10 bg-[#0a0a0a]",
          "transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ width: sidebarCollapsed ? 72 : 240 }}
      >
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

            {/* Logo area */}
            <div className="relative flex items-center justify-between px-5 h-16 border-b border-white/[0.06] shrink-0">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2.5"
                >
                  <Image src="/Logo.jpeg" alt="Trodec" width={28} height={28} className="rounded-lg" />
                  <span className="font-semibold text-sm tracking-tight">Trodec</span>
                </motion.div>
              )}
              {sidebarCollapsed && (
                <Image src="/Logo.jpeg" alt="Trodec" width={28} height={28} className="rounded-lg mx-auto" />
              )}
              {/* Collapse toggle — desktop only */}
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {/* Mobile close */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-6 h-6 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Expand button when collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="hidden lg:flex w-full items-center justify-center py-2 text-zinc-500 hover:text-white transition"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* NAV */}
            <nav className="relative flex-1 py-6 px-3 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.path);
                      setSidebarOpen(false);
                    }}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group relative",
                      isActive
                        ? "bg-white/5 text-white border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5",
                      sidebarCollapsed && "justify-center"
                    )}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-white/[0.04] blur-sm pointer-events-none" />
                    )}
                    <item.icon
                      className={cn(
                        "shrink-0 transition-colors",
                        sidebarCollapsed ? "w-5 h-5" : "w-4 h-4",
                        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span className="relative">{item.name}</span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom: User + Logout */}
            <div className="relative px-3 py-5 border-t border-white/[0.06] shrink-0">
              {!sidebarCollapsed ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#0f0f10] border border-white/10 flex items-center justify-center text-xs font-semibold shrink-0 text-white">
                      {(profile?.fullName?.[0] ?? "U").toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300 truncate">
                      {profile?.fullName || "User"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition text-xs shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center justify-center text-zinc-500 hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
      </motion.aside>

      {/* MAIN WRAPPER */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          "lg:ml-60",
          sidebarCollapsed && "lg:ml-[72px]"
        )}
      >
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-5 lg:px-8 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
          {/* Left: Mobile hamburger + Page title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-white tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Notification + Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/consumer/notifications")}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-white text-black text-[9px] font-bold px-1 leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push("/consumer/profile")}
              className="w-8 h-8 rounded-full bg-[#0f0f10] border border-white/10 flex items-center justify-center text-xs font-semibold hover:border-white/30 transition text-white"
            >
              {(profile?.fullName?.[0] ?? "U").toUpperCase()}
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-10 bg-[#050505] overflow-y-auto pb-28 lg:pb-10">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-t border-white/[0.08] pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.filter(item => ["Dashboard", "Products", "Communities", "Cart", "Profile"].includes(item.name)).map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                  isActive ? "text-white" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <motion.div
                  animate={item.name === "Cart" && cartBounce ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative"
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-purple-400")} />
                  {item.name === "Cart" && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-purple-500 text-white text-[8px] font-black px-0.5 leading-none">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </motion.div>
                <span className="text-[10px] font-semibold">{item.name === "Dashboard" ? "Home" : item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-400 rounded-b-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

    </div>
  );
}
