import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { logisticsController } from "@/controllers/logistics.controller";
import { env } from "@/config";

const router = Router();

router.get("/:id/track", authenticate, logisticsController.trackShipment);

if (env.NODE_ENV !== 'production') {
  router.get("/test-shiprocket", authenticate, logisticsController.testShiprocket);
}

export default router;
