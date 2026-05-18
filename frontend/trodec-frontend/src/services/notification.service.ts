import { api, ApiSuccessResponse } from "./api";

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

export const NotificationService = {
  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiSuccessResponse<Notification[]>>("/notifications");
    return res.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiSuccessResponse<{ count: number }>>("/notifications/unread-count");
    return res.data.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};
