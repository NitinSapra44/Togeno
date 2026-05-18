import { Response, NextFunction } from "express";
import { notificationService } from "@/services/notification.service";
import { sendSuccess } from "@/utils/response";
import { AuthenticatedRequest } from "@/types";

class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationService.listForUser(req.user!.id);
      sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount(req.user!.id);
      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params["id"] as string;
      await notificationService.markAsRead(id, req.user!.id);
      sendSuccess(res, null, 200, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, null, 200, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
