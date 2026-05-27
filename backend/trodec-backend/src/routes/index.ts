import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth.routes";
import userRouter from "./user.routes";
import brandRouter from "./brand.routes";
import communityRouter from "./community.routes";
import productRouter from "./product.routes";
import orderRouter from "./order.routes";
import addressRouter from "./address.routes";
import pitchRouter from "./pitch.routes";
import postRouter from "./post.routes";
import adminRouter from "./admin.routes";
import paymentRouter from "./payment.routes";
import webhookRouter from "./webhook.routes";
import commissionRouter from "./commission.routes";
import shipmentRouter from "./shipment.routes";
import notificationRouter from "./notification.routes";
import invoiceRouter from "./invoice.routes";

const router = Router();

// Mount route modules
router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/brands", brandRouter);
router.use("/communities", communityRouter);
router.use("/products", productRouter);
router.use("/orders", orderRouter);
router.use("/addresses", addressRouter);
router.use("/pitches", pitchRouter);
router.use("/posts", postRouter);
router.use("/admin", adminRouter);
router.use("/payments", paymentRouter);
// Webhook routes — public, no auth (signature verified inside handler)
router.use("/webhook", webhookRouter);
router.use("/commissions", commissionRouter);
router.use("/shipments", shipmentRouter);
router.use("/notifications", notificationRouter);
router.use("/invoices", invoiceRouter);

// Export aggregated router as default
export default router;
