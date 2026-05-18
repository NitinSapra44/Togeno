import { supabaseAdmin } from "../config";
import { ApiError } from "../utils";
import { logger } from "../utils/logger";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

class NotificationService {
  // Creates a notification — non-throwing, logs on error (used fire-and-forget from reply flows)
  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from("notifications")
      .insert({ user_id: userId, type, title, message, data });

    if (error) {
      logger.error("createNotification error", error);
    }
  }

  async listForUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      logger.error("listForUser notifications error", error);
      throw new ApiError("Failed to fetch notifications", 500);
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data ?? {},
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at,
    }));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      logger.error("getUnreadCount error", error);
      return 0;
    }

    return count ?? 0;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      logger.error("markAsRead error", error);
      throw new ApiError("Failed to mark notification as read", 500);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      logger.error("markAllAsRead error", error);
      throw new ApiError("Failed to mark all notifications as read", 500);
    }
  }
}

export const notificationService = new NotificationService();
