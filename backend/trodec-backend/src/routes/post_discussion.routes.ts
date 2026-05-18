import { Router } from "express";
import { postDiscussionController } from "@/controllers/post_discussion.controller";
import { authenticate, validateBody } from "@/middleware";
import { createDiscussionSchema, createReplySchema } from "@/schemas/discussion.schema";

const router = Router({ mergeParams: true });

router.get("/", postDiscussionController.listDiscussions);
router.post("/", authenticate, validateBody(createDiscussionSchema), postDiscussionController.createDiscussion);
router.delete("/:discussionId", authenticate, postDiscussionController.deleteDiscussion);
router.post("/:discussionId/like", authenticate, postDiscussionController.toggleLike);
router.post("/:discussionId/replies", authenticate, validateBody(createReplySchema), postDiscussionController.createReply);
router.post("/replies/:replyId/like", authenticate, postDiscussionController.toggleReplyLike);

export default router;
