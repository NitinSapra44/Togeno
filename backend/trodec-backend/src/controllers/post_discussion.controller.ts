import { Response, NextFunction } from "express";
import { postDiscussionService } from "@/services/post_discussion.service";
import { sendSuccess } from "@/utils/response";
import { AuthenticatedRequest } from "@/types";
import { CreateDiscussionInput, CreateReplyInput } from "@/schemas/discussion.schema";

class PostDiscussionController {

  async listDiscussions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params["postId"] as string;
      const discussions = await postDiscussionService.listForPost(postId);
      sendSuccess(res, discussions);
    } catch (error) { next(error); }
  }

  async createDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params["postId"] as string;
      const { content } = req.body as CreateDiscussionInput;
      const discussion = await postDiscussionService.create(postId, req.user!.id, content);
      sendSuccess(res, discussion, 201, "Discussion created");
    } catch (error) { next(error); }
  }

  async deleteDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const discussionId = req.params["discussionId"] as string;
      await postDiscussionService.delete(discussionId, req.user!.id);
      sendSuccess(res, null, 200, "Discussion deleted");
    } catch (error) { next(error); }
  }

  async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const discussionId = req.params["discussionId"] as string;
      const result = await postDiscussionService.toggleLike(discussionId, req.user!.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async createReply(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params["postId"] as string | undefined;
      const discussionId = req.params["discussionId"] as string;
      const { content } = req.body as CreateReplyInput;
      const reply = await postDiscussionService.createReply(discussionId, req.user!.id, content, postId);
      sendSuccess(res, reply, 201, "Reply created");
    } catch (error) { next(error); }
  }

  async toggleReplyLike(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const replyId = req.params["replyId"] as string;
      const result = await postDiscussionService.toggleReplyLike(replyId, req.user!.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }
}

export const postDiscussionController = new PostDiscussionController();
