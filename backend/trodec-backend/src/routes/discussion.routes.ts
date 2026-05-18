import { Router } from "express";
import { discussionController } from "@/controllers/discussion.controller";
import { authenticate, validateBody } from "@/middleware";
import { createDiscussionSchema, createReplySchema } from "@/schemas/discussion.schema";

const router = Router({ mergeParams: true }); // mergeParams to access :productId from parent

// GET /products/:productId/discussions — public
router.get("/", discussionController.listDiscussions);

// POST /products/:productId/discussions — authenticated
router.post("/", authenticate, validateBody(createDiscussionSchema), discussionController.createDiscussion);

// DELETE /products/:productId/discussions/:discussionId — owner only
router.delete("/:discussionId", authenticate, discussionController.deleteDiscussion);

// POST /products/:productId/discussions/:discussionId/like — authenticated
router.post("/:discussionId/like", authenticate, discussionController.toggleLike);

// POST /products/:productId/discussions/:discussionId/replies — authenticated
router.post("/:discussionId/replies", authenticate, validateBody(createReplySchema), discussionController.createReply);

// POST /products/:productId/discussions/replies/:replyId/like — authenticated
router.post("/replies/:replyId/like", authenticate, discussionController.toggleReplyLike);

export default router;
