import { Response, NextFunction } from "express";
import { discussionService } from "@/services/discussion.service";
import { sendSuccess } from "@/utils/response";
import { AuthenticatedRequest } from "@/types";
import { CreateDiscussionInput, CreateReplyInput } from "@/schemas/discussion.schema";

class DiscussionController {

  async listDiscussions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params["productId"] as string;
      const discussions = await discussionService.listForProduct(productId);
      sendSuccess(res, discussions);
    } catch (error) {
      next(error);
    }
  }

  async createDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params["productId"] as string;
      const { content } = req.body as CreateDiscussionInput;
      const discussion = await discussionService.create(productId, req.user!.id, content);
      sendSuccess(res, discussion, 201, "Discussion created");
    } catch (error) {
      next(error);
    }
  }

  async deleteDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const discussionId = req.params["discussionId"] as string;
      await discussionService.delete(discussionId, req.user!.id);
      sendSuccess(res, null, 200, "Discussion deleted");
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const discussionId = req.params["discussionId"] as string;
      const result = await discussionService.toggleLike(discussionId, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createReply(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const discussionId = req.params["discussionId"] as string;
      const { content } = req.body as CreateReplyInput;
      const reply = await discussionService.createReply(discussionId, req.user!.id, content);
      sendSuccess(res, reply, 201, "Reply created");
    } catch (error) {
      next(error);
    }
  }

  async toggleReplyLike(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const replyId = req.params["replyId"] as string;
      const result = await discussionService.toggleReplyLike(replyId, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const discussionController = new DiscussionController();
