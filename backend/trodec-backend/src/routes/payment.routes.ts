import { Router } from "express";
import { paymentController } from "@/controllers/payment.controller";
import { authenticate, createRateLimit } from "@/middleware";

const router = Router();

const verifyRateLimit = createRateLimit({
  windowMs: 60_000,
  max: 10,
  message: "Too many payment verification attempts. Please wait a moment and try again.",
});

router.post("/initiate", authenticate, paymentController.initiatePayment);
router.post("/verify", authenticate, verifyRateLimit, paymentController.verifyPayment);
router.get("/order/:orderId", authenticate, paymentController.getPaymentForOrder);

export default router;
