"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, MessageSquare, Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/services/notification.service";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function resolveConsumerUrl(notification: Notification): string | null {
  const { type, data } = notification;
  const productId = data.productId as string | undefined;
  const discussionId = data.discussionId as string | undefined;

  if (type === "discussion_reply" && productId) {
    const hash = discussionId ? `#discussion-${discussionId}` : "#discussions";
    return `/consumer/products/${productId}${hash}`;
  }
  return null;
}

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (url: string) => void;
}) {
  const url = resolveConsumerUrl(notification);

  function handleClick() {
    if (!notification.isRead) onRead(notification.id);
    if (url) onNavigate(url);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={handleClick}
      className={`group flex items-start gap-4 px-5 py-4 border-b border-white/[0.06] transition-all duration-200 ${
        url ? "cursor-pointer" : "cursor-default"
      } ${
        notification.isRead
          ? "bg-transparent hover:bg-white/[0.02]"
          : "bg-white/[0.04] hover:bg-white/[0.06]"
      }`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          notification.isRead ? "bg-zinc-800" : "bg-white/10 group-hover:bg-white/15"
        }`}
      >
        <MessageSquare
          className={`w-4 h-4 ${notification.isRead ? "text-zinc-500" : "text-white"}`}
        />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium leading-snug transition-colors ${
              notification.isRead
                ? "text-zinc-400 group-hover:text-zinc-300"
                : "text-white"
            }`}
          >
            {notification.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {!notification.isRead && (
              <span className="w-2 h-2 mt-1.5 rounded-full bg-white/70" />
            )}
            {url && (
              <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-0.5 opacity-0 group-hover:opacity-100" />
            )}
          </div>
        </div>
        {notification.message && (
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">
            {notification.message}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-[10px] text-zinc-600">{timeAgo(notification.createdAt)}</p>
          {url && (
            <p className="text-[10px] text-zinc-600 group-hover:text-purple-400 transition-colors">
              View discussion →
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login?redirectTo=/consumer/notifications");
      return;
    }
    fetchNotifications();
  }, []);

  function handleNavigate(url: string) {
    router.push(url);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-zinc-500">{unreadCount} unread</p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500">No notifications yet</p>
            <p className="text-xs text-zinc-700 mt-1">
              You&apos;ll be notified when someone replies to your discussions
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
                onNavigate={handleNavigate}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
