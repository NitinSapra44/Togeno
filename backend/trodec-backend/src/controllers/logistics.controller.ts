import { Request, Response, NextFunction } from "express";
import { logisticsService, shiprocketClient } from "@/services/logistics.service";
import { sendSuccess } from "@/utils";
import { AuthenticatedRequest } from "@/types";
import { logger } from "@/utils/logger";

class LogisticsController {
  /**
   * GET /api/shipments/:id/track
   * Get tracking info for a shipment (authenticated).
   */
  async trackShipment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const shipmentId = req.params["id"] as string;
      const result = await logisticsService.trackShipment(shipmentId);
      sendSuccess(res, result, 200, "Tracking info fetched");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/webhook/shiprocket
   * Shiprocket webhook — public, no auth.
   * Shiprocket posts shipment status updates here.
   */
  async testShiprocket(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const locations = await shiprocketClient.getPickupLocations();
      sendSuccess(res, { pickupLocations: locations }, 200, "Shiprocket connection OK");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/shipments/:id/refresh-label
   * Regenerate and save a shipping label from Shiprocket.
   */
  async refreshLabel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const shipmentId = req.params["id"] as string;
      const labelUrl = await logisticsService.refreshLabel(shipmentId);
      sendSuccess(res, { labelUrl }, 200, "Label generated successfully");
    } catch (error) {
      next(error);
    }
  }

  async shiprocketWebhook(req: Request, res: Response) {
    try {
      const payload = req.body as Record<string, unknown>;
      logger.info("Shiprocket webhook received", {
        status: payload.current_status,
        awb: payload.awb,
        orderId: payload.order_id,
      });
      await logisticsService.handleShiprocketWebhook(payload);
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error("Shiprocket webhook handler error", { error });
      res.status(200).json({ received: false });
    }
  }
}

export const logisticsController = new LogisticsController();
