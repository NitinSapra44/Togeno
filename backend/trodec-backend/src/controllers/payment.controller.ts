import { Request, Response, NextFunction } from "express";
import { paymentService } from "@/services/payment.service";
import { orderService } from "@/services/order.service";
import { ApiError, sendSuccess } from "@/utils";
import { AuthenticatedRequest } from "@/types";
import { logger } from "@/utils/logger";

class PaymentController {
  /**
   * POST /api/payments/initiate
   * Initiates a Razorpay order for an existing DB order.
   * The order must belong to the authenticated user and be in 'pending' state.
   */
  async initiatePayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.id;
      const { orderId } = req.body as { orderId: string };

      if (!orderId) {
        throw ApiError.badRequest("orderId is required");
      }

      // Verify the order belongs to this user
      const order = await orderService.getOrder(orderId, userId);
      if (!order) {
        throw ApiError.notFound("Order not found");
      }

      if (order.status !== "pending") {
        throw ApiError.badRequest(`Order is already in status: ${order.status}`);
      }

      const result = await paymentService.initiatePayment(orderId, order.total);

      sendSuccess(res, result, 200, "Payment initiated");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/verify
   * Verify Razorpay signature after client-side checkout completes.
   */
  async verifyPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.id;
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
        req.body as {
          orderId: string;
          razorpayOrderId: string;
          razorpayPaymentId: string;
          razorpaySignature: string;
        };

      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw ApiError.badRequest("orderId, razorpayOrderId, razorpayPaymentId and razorpaySignature are required");
      }

      // Verify the order belongs to this user
      const order = await orderService.getOrder(orderId, userId);
      if (!order) {
        throw ApiError.notFound("Order not found");
      }

      const payment = await paymentService.verifyPayment({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      sendSuccess(res, payment, 200, "Payment verified successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/webhook
   * Razorpay webhook handler.
   * NOTE: This route must receive the raw request body for signature verification.
   * The route is registered BEFORE express.json() in app.ts (see routes/index.ts).
   */
  async webhook(req: Request, res: Response) {
    try {
      const signature = Array.isArray(req.headers["x-razorpay-signature"])
        ? req.headers["x-razorpay-signature"][0]
        : (req.headers["x-razorpay-signature"] ?? "");
      const eventId = Array.isArray(req.headers["x-razorpay-event-id"])
        ? req.headers["x-razorpay-event-id"][0]
        : (req.headers["x-razorpay-event-id"] ?? "");

      if (!signature) {
        throw ApiError.badRequest("Missing Razorpay signature header");
      }

      // rawBody is attached by express.raw() middleware registered for this route
      const rawBody = (req as Request & { rawBody?: string }).rawBody ?? "";

      await paymentService.handleWebhook({
        event: (req.body as { event?: string }).event ?? "",
        payload: (req.body as { payload?: Record<string, unknown> }).payload ?? {},
        eventId: eventId ?? "",
        rawBody,
        signature,
      });

      // Always return 200 to Razorpay so it doesn't retry
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error("Webhook handler error", { error });
      // Return 200 anyway to prevent Razorpay retries on our own validation errors
      res.status(200).json({ received: false });
    }
  }

  /**
   * GET /api/payments/order/:orderId
   * Get payment info for an order (authenticated, own orders only).
   */
  async getPaymentForOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.id;
      const orderId = req.params.orderId as string;

      // Verify ownership
      const order = await orderService.getOrder(orderId, userId);
      if (!order) {
        throw ApiError.notFound("Order not found");
      }

      const payment = await paymentService.getPaymentByOrderId(orderId);
      sendSuccess(res, payment, 200, "Payment fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
