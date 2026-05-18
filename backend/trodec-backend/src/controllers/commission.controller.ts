import { Response, NextFunction } from "express";
import { commissionService } from "@/services/commission.service";
import { sendSuccess } from "@/utils/response";
import { ApiError } from "@/utils/errors";
import { AuthenticatedRequest } from "@/types";

class CommissionController {

  // ── Expert: my earnings ─────────────────────────────────────────────────────

  async getMyCommissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status } = req.query as Record<string, string>;
      const result = await commissionService.getExpertCommissions(req.user!.id, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        status,
      });
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async getMyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stats } = await commissionService.getExpertCommissions(req.user!.id, { limit: 1 });
      sendSuccess(res, stats);
    } catch (error) { next(error); }
  }

  // ── Expert: bank accounts ───────────────────────────────────────────────────

  async getBankAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await commissionService.getBankAccounts(req.user!.id);
      sendSuccess(res, accounts);
    } catch (error) { next(error); }
  }

  async saveBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        throw ApiError.badRequest("accountHolderName, accountNumber, ifscCode and bankName are required");
      }
      const account = await commissionService.saveBankAccount(req.user!.id, {
        accountHolderName, accountNumber, ifscCode, bankName, upiId,
      });
      sendSuccess(res, account, 201, "Bank account saved");
    } catch (error) { next(error); }
  }

  // ── Expert: withdrawal requests ─────────────────────────────────────────────

  async getMyWithdrawals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query as Record<string, string>;
      const result = await commissionService.getWithdrawalRequests(req.user!.id, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async requestWithdrawal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, bankAccountId } = req.body;
      if (!amount || !bankAccountId) throw ApiError.badRequest("amount and bankAccountId are required");
      const withdrawal = await commissionService.requestWithdrawal(req.user!.id, {
        amount: Number(amount),
        bankAccountId,
      });
      sendSuccess(res, withdrawal, 201, "Withdrawal request submitted");
    } catch (error) { next(error); }
  }

  // ── Admin: all commissions ──────────────────────────────────────────────────

  async getAllCommissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status, expertId } = req.query as Record<string, string>;
      const result = await commissionService.getAllCommissions({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        status,
        expertId,
      });
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async markCommissionPaid(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params["id"] as string;
      const commission = await commissionService.markAsPaid(id);
      sendSuccess(res, commission, 200, "Commission marked as paid");
    } catch (error) { next(error); }
  }

  // ── Admin: all withdrawals ──────────────────────────────────────────────────

  async getAllWithdrawals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status } = req.query as Record<string, string>;
      const result = await commissionService.getAllWithdrawalRequests({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        status,
      });
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async processWithdrawal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params["id"] as string;
      const { action, transactionRef, rejectionReason } = req.body;
      if (!["approved", "paid", "rejected"].includes(action)) {
        throw ApiError.badRequest("action must be approved, paid, or rejected");
      }
      const withdrawal = await commissionService.processWithdrawal(id, action, { transactionRef, rejectionReason });
      sendSuccess(res, withdrawal, 200, `Withdrawal ${action}`);
    } catch (error) { next(error); }
  }
}

export const commissionController = new CommissionController();
