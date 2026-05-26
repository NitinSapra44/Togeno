import { Router } from "express";
import multer from "multer";
import { postController } from "@/controllers/post.controller";
import { uploadController } from "@/controllers/upload.controller";
import {
  authenticate,
  optionalAuth,
  requireRole,
  requireVerifiedExpert,
  validateBody,
  validateQuery,
} from "@/middleware";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
  createPostMediaSchema,
  updatePostMediaSchema,
} from "@/schemas/post.schema";
import postDiscussionRouter from "./post_discussion.routes";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// ============================================
// PUBLIC ROUTES (With Optional Auth)
// ============================================

/**
 * GET /posts
 * List posts with pagination and filtering (public)
 * Optional auth for hasLiked status
 */
router.get(
  "/",
  optionalAuth,
  validateQuery(listPostsQuerySchema),
  postController.listPosts
);

/**
 * GET /posts/me
 * List current expert's posts (expert only)
 * Note: This MUST come before /:id route
 */
router.get(
  "/me",
  authenticate,
  requireRole("expert"),
  validateQuery(listPostsQuerySchema),
  postController.listMyPosts
);

/**
 * GET /posts/:id
 * Get post by ID (public for published posts)
 * Optional auth for hasLiked status and unpublished access
 */
router.get("/:id", optionalAuth, postController.getPost);

/**
 * GET /posts/:id/media
 * Get post media (public)
 */
router.get("/:id/media", postController.getPostMedia);

/**
 * POST /posts
 * Create a new post (verified expert only)
 * Note: Verification check is done in service layer
 */
router.post(
  "/",
  authenticate,
  requireRole("expert"),
  requireVerifiedExpert,
  validateBody(createPostSchema),
  postController.createPost
);

/**
 * PATCH /posts/:id
 * Update post (expert owner only)
 */
router.patch(
  "/:id",
  authenticate,
  requireRole("expert"),
  validateBody(updatePostSchema),
  postController.updatePost
);

/**
 * DELETE /posts/:id
 * Delete post (expert owner only)
 */
router.delete(
  "/:id",
  authenticate,
  requireRole("expert"),
  postController.deletePost
);

// ============================================
// POST MEDIA ROUTES (Expert Owner Only)
// ============================================

/**
 * POST /posts/:id/media
 * Add media to post (expert owner only)
 */
router.post(
  "/:id/media",
  authenticate,
  requireRole("expert"),
  validateBody(createPostMediaSchema),
  postController.addPostMedia
);

/**
 * POST /posts/:id/upload-media
 * Upload a media file for a post (expert owner only)
 */
router.post(
  "/:id/upload-media",
  authenticate,
  requireRole("expert"),
  upload.single("file"),
  uploadController.uploadPostMedia
);

/**
 * PATCH /posts/:postId/media/:mediaId
 * Update post media (expert owner only)
 */
router.patch(
  "/:postId/media/:mediaId",
  authenticate,
  requireRole("expert"),
  validateBody(updatePostMediaSchema),
  postController.updatePostMedia
);

/**
 * DELETE /posts/:postId/media/:mediaId
 * Delete post media (expert owner only)
 */
router.delete(
  "/:postId/media/:mediaId",
  authenticate,
  requireRole("expert"),
  postController.deletePostMedia
);

// ============================================
// LIKE ROUTES (Authenticated Users Only)
// ============================================

/**
 * POST /posts/:id/like
 * Like a post (any authenticated user)
 */
router.post("/:id/like", authenticate, postController.likePost);

/**
 * DELETE /posts/:id/like
 * Unlike a post (any authenticated user)
 */
router.delete("/:id/like", authenticate, postController.unlikePost);

// ============================================
// DISCUSSIONS (nested under post)
// ============================================
router.use("/:postId/discussions", postDiscussionRouter);

export default router;
