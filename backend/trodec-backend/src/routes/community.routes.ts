import { Router } from "express";
import multer from "multer";
import { communityController } from "@/controllers/community.controller";
import { uploadController } from "@/controllers/upload.controller";
import { authenticate, optionalAuth, validateBody, validateQuery } from "@/middleware";
import {
  createCommunitySchema,
  updateCommunitySchema,
  listCommunitiesQuerySchema,
  joinCommunitySchema,
} from "@/schemas";

// Multer configured with memory storage (files kept in buffer for Supabase upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max (validated further in controller)
});

const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * GET /communities/categories
 * Get all active categories
 */
router.get("/categories", communityController.getCategories);

/**
 * GET /communities
 * List communities with pagination and filtering
 */
router.get(
  "/",
  optionalAuth,
  validateQuery(listCommunitiesQuerySchema),
  communityController.listCommunities
);

/**
 * GET /communities/slug/:slug
 * Get community by slug (MUST come before /:id)
 */
router.get("/slug/:slug", communityController.getCommunityBySlug);

/**
 * GET /communities/:id/members
 * Get community members
 */
router.get("/:id/members", communityController.getCommunityMembers);

/**
 * GET /communities/:id
 * Get community by ID
 */
router.get("/:id", communityController.getCommunity);

// ============================================
// AUTHENTICATED ROUTES (Authentication Required)
// ============================================

/**
 * POST /communities
 * Create a new community
 */
router.post(
  "/",
  authenticate,
  validateBody(createCommunitySchema),
  communityController.createCommunity
);

/**
 * PATCH /communities/:id
 * Update community (authorization would be handled by middleware)
 */
router.patch(
  "/:id",
  authenticate,
  validateBody(updateCommunitySchema),
  communityController.updateCommunity
);

/**
 * DELETE /communities/:id
 * Delete community (soft delete - authorization would be handled by middleware)
 */
router.delete("/:id", authenticate, communityController.deleteCommunity);

/**
 * POST /communities/:id/join
 * Join a community
 */
router.post(
  "/:id/join",
  authenticate,
  validateBody(joinCommunitySchema),
  communityController.joinCommunity
);

/**
 * DELETE /communities/:id/leave
 * Leave a community
 */
router.delete("/:id/leave", authenticate, communityController.leaveCommunity);

/**
 * GET /communities/:id/membership
 * Check if current user is a member of the community
 */
router.get("/:id/membership", authenticate, communityController.checkMembership);

// ============================================
// IMAGE UPLOAD ROUTES
// ============================================

/**
 * POST /communities/:id/upload-image
 * Upload community avatar or cover image (multipart/form-data)
 * Body fields: file (binary), type ("avatar" | "cover")
 */
router.post(
  "/:id/upload-image",
  authenticate,
  upload.single("file"),
  uploadController.uploadCommunityImage
);

/**
 * DELETE /communities/:id/remove-image
 * Remove a community image
 * Body: { type: "avatar" | "cover" }
 */
router.delete(
  "/:id/remove-image",
  authenticate,
  uploadController.removeCommunityImage
);

export default router;
