import { Router } from "express";
import { orderController } from "@/controllers/order.controller";
import { authenticate, validateBody, validateQuery } from "@/middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderSchema,
  listOrdersQuerySchema,
} from "@/schemas";

const router = Router();

// ============================================
// AUTHENTICATED ROUTES (Authentication Required)
// ============================================

/**
 * POST /orders
 * Create order from cart
 */
router.post(
  "/",
  authenticate,
  validateBody(createOrderSchema),
  orderController.createOrder
);

/**
 * GET /orders
 * Get user's orders
 */
router.get(
  "/",
  authenticate,
  validateQuery(listOrdersQuerySchema),
  orderController.getOrders
);

/**
 * GET /orders/number/:orderNumber
 * Get order by order number (MUST come before /:id)
 */
router.get(
  "/number/:orderNumber",
  authenticate,
  orderController.getOrderByNumber
);

/**
 * POST /orders/validate-promo
 * Validate a promo code (must be before /:id)
 */
router.post("/validate-promo", authenticate, orderController.validatePromo);

/**
 * GET /orders/:id
 * Get order by ID
 */
router.get("/:id", authenticate, orderController.getOrder);

/**
 * PATCH /orders/:id/status
 * Update order status
 */
router.patch(
  "/:id/status",
  authenticate,
  validateBody(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

/**
 * POST /orders/:id/cancel
 * Cancel order
 */
router.post("/:id/cancel", authenticate, orderController.cancelOrder);

/**
 * PATCH /orders/:id
 * Update order
 */
router.patch(
  "/:id",
  authenticate,
  validateBody(updateOrderSchema),
  orderController.updateOrder
);

export default router;
