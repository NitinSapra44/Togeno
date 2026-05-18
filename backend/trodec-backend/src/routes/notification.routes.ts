import { Router } from "express";
import { notificationController } from "@/controllers/notification.controller";
import { authenticate } from "@/middleware";

const router = Router();

// GET  /notifications             — list user's notifications (newest first, max 50)
router.get("/", authenticate, notificationController.getNotifications);

// GET  /notifications/unread-count — lightweight badge count
router.get("/unread-count", authenticate, notificationController.getUnreadCount);

// PATCH /notifications/read-all   — mark every unread notification as read
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

// PATCH /notifications/:id/read   — mark one notification as read
router.patch("/:id/read", authenticate, notificationController.markAsRead);

export default router;
