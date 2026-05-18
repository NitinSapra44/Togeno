import { Router } from "express";
import { commissionController } from "@/controllers/commission.controller";
import { authenticate, requireRole } from "@/middleware";

const router = Router();

// ── Expert routes ────────────────────────────────────────────────────────────

// GET /commissions/me — paginated list of my commissions + stats
router.get("/me", authenticate, requireRole("expert"), commissionController.getMyCommissions);

// GET /commissions/me/stats — just the stats summary
router.get("/me/stats", authenticate, requireRole("expert"), commissionController.getMyStats);

// GET /commissions/me/bank-accounts
router.get("/me/bank-accounts", authenticate, requireRole("expert"), commissionController.getBankAccounts);

// POST /commissions/me/bank-accounts
router.post("/me/bank-accounts", authenticate, requireRole("expert"), commissionController.saveBankAccount);

// GET /commissions/me/withdrawals
router.get("/me/withdrawals", authenticate, requireRole("expert"), commissionController.getMyWithdrawals);

// POST /commissions/me/withdrawals
router.post("/me/withdrawals", authenticate, requireRole("expert"), commissionController.requestWithdrawal);

// ── Admin routes ─────────────────────────────────────────────────────────────

// GET /commissions — all commissions with platform stats
router.get("/", authenticate, requireRole("admin"), commissionController.getAllCommissions);

// GET /commissions/withdrawals — all withdrawal requests (must be before /:id)
router.get("/withdrawals", authenticate, requireRole("admin"), commissionController.getAllWithdrawals);

// PATCH /commissions/withdrawals/:id — approve/pay/reject (must be before /:id/mark-paid)
router.patch("/withdrawals/:id", authenticate, requireRole("admin"), commissionController.processWithdrawal);

// PATCH /commissions/:id/mark-paid
router.patch("/:id/mark-paid", authenticate, requireRole("admin"), commissionController.markCommissionPaid);

export default router;
