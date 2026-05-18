"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect, type FC } from "react";
import {
  Menu, X, User, LogOut, ChevronDown, LayoutDashboard,
  ShoppingBag, ShoppingCart, Users, FileText,
  Briefcase, DollarSign, Package, BarChart2, Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };
type MenuItem = { label: string; href: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function formatRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    consumer: "Consumer",
    expert: "Expert",
    brand_admin: "Brand",
    admin: "Admin",
  };
  return labels[role] ?? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ROLE_MENU_ITEMS: Record<string, MenuItem[]> = {
  consumer: [
    { label: "Dashboard", href: "/consumer/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/consumer/orders", icon: ShoppingBag },
    { label: "Cart", href: "/consumer/cart", icon: ShoppingCart },
    { label: "Profile", href: "/consumer/profile", icon: User },
  ],
  expert: [
    { label: "Dashboard", href: "/expert/dashboard", icon: LayoutDashboard },
    { label: "Communities", href: "/expert/communities", icon: Users },
    { label: "Posts", href: "/expert/posts", icon: FileText },
    { label: "Pitches", href: "/expert/pitches", icon: Briefcase },
    { label: "Earnings", href: "/expert/earnings", icon: DollarSign },
    { label: "Profile", href: "/expert/profile", icon: User },
  ],
  brand_admin: [
    { label: "Dashboard", href: "/brand/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/brand/products", icon: Package },
    { label: "Orders", href: "/brand/orders", icon: ShoppingBag },
    { label: "Pitches", href: "/brand/pitches", icon: Briefcase },
    { label: "Communities", href: "/brand/communities", icon: Users },
    { label: "Profile", href: "/brand/profile", icon: User },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Shield },
    { label: "Brands", href: "/admin/brands", icon: BarChart2 },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  ],
};

const sidebarVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.8 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.22 } },
};

const Navbar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, profile, signOut } = useAuthStore();

  /* Close sidebar on route change */
  useEffect(() => { setOpen(false); setDropdownOpen(false); }, [pathname]);

  /* Navbar shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  /* Lock body scroll when mobile sidebar is open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSignOut = async () => {
    setLogoutModalOpen(false);
    await signOut();
    router.push("/");
  };

  const role = profile?.role ?? "consumer";
  const menuItems = ROLE_MENU_ITEMS[role] ?? ROLE_MENU_ITEMS.consumer;
  const roleLabel = formatRoleLabel(role);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav
        className={cn(
          "sticky top-0 z-50 w-full",
          "bg-[#050505]/80 backdrop-blur-xl",
          "border-b border-white/10",
          "transition-shadow duration-300",
          scrolled && "shadow-[0_4px_40px_rgba(0,0,0,0.6)]"
        )}
      >
        <div className="mx-auto max-w-7xl h-16 px-5 md:px-8 flex items-center justify-between gap-6">

          {/* BRAND */}
          <button
            onClick={() => router.push("/")}
            className="font-black tracking-tighter text-xl md:text-2xl text-white hover:opacity-75 transition-opacity shrink-0"
          >
            TRODEC
          </button>

          {/* DESKTOP LINKS */}
          <nav className="hidden md:flex items-center gap-10 flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300",
                  "after:absolute after:left-1/2 after:-bottom-0.5 after:h-[2px] after:w-0 after:rounded-full",
                  "hover:after:w-full hover:after:left-0 after:transition-all after:duration-400",
                  isActive(item.href)
                    ? "text-white after:bg-white after:w-full after:left-0"
                    : "text-gray-500 hover:text-white after:bg-emerald-400"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Desktop Identity Chip */}
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={cn(
                    "hidden md:flex items-center gap-2.5",
                    "rounded-full pl-1.5 pr-4 py-1.5",
                    "bg-white/[0.04] border border-white/10",
                    "hover:bg-white/[0.08] hover:border-white/20",
                    "transition-all duration-200 group"
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 border border-white/10 text-[11px] font-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {profile?.fullName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-[13px] text-gray-300 font-semibold tracking-tight">
                    {profile?.fullName?.split(" ")[0] ?? "User"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-gray-500 transition-transform duration-300",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2.5 w-60 bg-[#0f0f10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col hidden md:flex"
                    >
                      {/* User header */}
                      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] bg-white/[0.02]">
                        <p className="text-white font-bold text-[14px] tracking-tight truncate">
                          {profile?.fullName ?? "User"}
                        </p>
                        <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-bold mt-0.5">
                          {roleLabel}
                        </p>
                      </div>

                      {/* Role links */}
                      <div className="py-2 flex flex-col gap-0.5 px-2">
                        {menuItems.map((item) => {
                          const Icon = item.icon;
                          const active = pathname.startsWith(item.href);
                          return (
                            <button
                              key={item.href}
                              onClick={() => { setDropdownOpen(false); router.push(item.href); }}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all text-left group",
                                active
                                  ? "bg-white/5 text-white"
                                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "w-4 h-4 shrink-0 transition-colors",
                                  active ? "text-emerald-400" : "text-gray-600 group-hover:text-emerald-400"
                                )}
                              />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Logout */}
                      <div className="pt-1 border-t border-white/[0.06] px-2 pb-2">
                        <button
                          onClick={() => { setDropdownOpen(false); setLogoutModalOpen(true); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 text-[13px] font-medium transition-all text-left group"
                        >
                          <LogOut className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className={cn(
                  "hidden md:inline-flex items-center",
                  "rounded-xl px-6 py-2.5 text-[13px] font-bold uppercase tracking-wider",
                  "text-black bg-white",
                  "hover:bg-zinc-100 active:scale-95 transition-all duration-150",
                  "shadow-[0_2px_16px_rgba(255,255,255,0.12)]"
                )}
              >
                Sign In
              </button>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={cn(
                "md:hidden p-2 rounded-xl",
                "bg-white/[0.06] hover:bg-white/[0.12] border border-white/10",
                "transition-all duration-150 active:scale-95"
              )}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE SIDEBAR ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "absolute right-0 top-0 h-full w-72 max-w-[85vw]",
                "bg-[#0a0a0a] border-l border-white/10",
                "flex flex-col",
                "shadow-[0_0_60px_rgba(0,0,0,0.9)]"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06] shrink-0">
                <span className="font-black tracking-tighter text-xl text-white">TRODEC</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable nav */}
              <nav className="flex-1 overflow-y-auto scrollbar-none py-6 px-4 flex flex-col gap-1">

                {/* Public links */}
                <p className="px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-3">
                  Navigation
                </p>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-all",
                      isActive(item.href)
                        ? "bg-white/[0.06] text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                {isAuthenticated && (
                  <>
                    <div className="my-4 border-t border-white/[0.06]" />

                    {/* Role badge */}
                    <p className="px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-500 mb-3">
                      {roleLabel} Workspace
                    </p>

                    {/* Role-specific links */}
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const active = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all relative",
                            active
                              ? "bg-white/[0.06] text-white"
                              : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                          )}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-500 rounded-r-full" />
                          )}
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              active ? "text-emerald-400" : "text-gray-600"
                            )}
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* Bottom CTA */}
              <div className="px-4 pb-safe pt-4 border-t border-white/[0.06] shrink-0">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setOpen(false); setLogoutModalOpen(true); }}
                    className={cn(
                      "w-full rounded-xl py-3.5 font-bold text-[12px] uppercase tracking-widest",
                      "text-red-400 bg-red-500/[0.06] border border-red-500/15",
                      "hover:bg-red-500/10 active:scale-[0.98] transition-all",
                      "flex items-center justify-center gap-2.5"
                    )}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setOpen(false); router.push("/login"); }}
                    className={cn(
                      "w-full rounded-xl py-3.5 font-bold text-[12px] uppercase tracking-widest",
                      "text-black bg-white",
                      "hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-lg"
                    )}
                  >
                    Get Started
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── LOGOUT MODAL ── */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setLogoutModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "relative w-full max-w-sm",
                "bg-[#0a0a0a]/95 backdrop-blur-3xl",
                "border border-white/10 rounded-2xl",
                "p-6 shadow-2xl ring-1 ring-white/[0.04]"
              )}
            >
              <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
                Sign out?
              </h3>
              <p className="text-[14px] text-gray-400 mb-7 leading-relaxed">
                Your session will be ended. You can always sign back in.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors border border-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
