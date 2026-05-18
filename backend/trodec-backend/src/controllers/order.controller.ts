import { Response, NextFunction } from "express";
import { orderService } from "@/services/order.service";
import { ApiError, sendSuccess } from "@/utils";
import { AuthenticatedRequest } from "@/types";

class OrderController {
  /**
   * POST /api/orders
   * Create order from cart
   */
  async createOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const { shippingAddressId, billingAddressId, notes, items, sourcePostId } = req.body;

      const order = await orderService.createOrderFromCart({
        userId,
        shippingAddressId,
        billingAddressId,
        notes,
        items,
        sourcePostId,
      });

      sendSuccess(res, order, 201, "Order created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders
   * Get user's orders
   */
  async getOrders(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await orderService.getUserOrders(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
      });

      sendSuccess(res, result, 200, "Orders fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   * Get order by ID
   */
  async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const order = await orderService.getOrder(id, userId);
      if (!order) {
        throw ApiError.notFound("Order not found");
      }

      sendSuccess(res, order, 200, "Order fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/number/:orderNumber
   * Get order by order number
   */
  async getOrderByNumber(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const orderNumber = req.params.orderNumber as string;

      const order = await orderService.getOrderByNumber(orderNumber, userId);
      if (!order) {
        throw ApiError.notFound("Order not found");
      }

      sendSuccess(res, order, 200, "Order fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/orders/:id/status
   * Update order status
   */
  async updateOrderStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(id, status, userId);

      sendSuccess(res, order, 200, "Order status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/cancel
   * Cancel order
   */
  async cancelOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const order = await orderService.cancelOrder(id, userId);

      sendSuccess(res, order, 200, "Order cancelled successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/orders/:id
   * Update order
   */
  async updateOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { status, notes } = req.body;

      const order = await orderService.updateOrder(
        id,
        { status, notes },
        userId,
      );

      sendSuccess(res, order, 200, "Order updated successfully");
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /orders/validate-promo
   * Validate a promo code and return discount info.
   */
  async validatePromo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { code } = req.body as { code?: string };
      if (!code) throw ApiError.badRequest("Promo code is required");

      const PROMO_CODES: Record<string, { discountPct: number; label: string }> = {
        TRODEC10: { discountPct: 10, label: "10% off your order" },
        TRODEC20: { discountPct: 20, label: "20% off your order" },
        WELCOME:  { discountPct: 5,  label: "5% welcome discount" },
      };

      const promo = PROMO_CODES[code.trim().toUpperCase()];
      if (!promo) throw ApiError.badRequest("Invalid or expired promo code");

      sendSuccess(res, { code: code.trim().toUpperCase(), ...promo }, 200, "Promo code valid");
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
