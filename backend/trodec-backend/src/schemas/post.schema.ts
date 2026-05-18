import { z } from "zod";

// Create post schema (expert creates a review post)
export const createPostSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  communityId: z.string().uuid("Invalid community ID"),
  pitchId: z.string().uuid("Invalid pitch ID").optional().nullable(),
  title: z.string().max(200, "Title must be at most 200 characters").optional().nullable(),
  content: z.string().min(1, "Content is required").max(10000, "Content must be at most 10000 characters"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  pros: z.array(z.string().max(200)).max(10, "Maximum 10 pros allowed").optional().nullable(),
  cons: z.array(z.string().max(200)).max(10, "Maximum 10 cons allowed").optional().nullable(),
  verdict: z.string().max(1000, "Verdict must be at most 1000 characters").optional().nullable(),
  isPublished: z.boolean().default(true),
});

// Update post schema
export const updatePostSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(10).max(10000).optional(),
  rating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string().max(200)).max(10).optional().nullable(),
  cons: z.array(z.string().max(200)).max(10).optional().nullable(),
  verdict: z.string().max(1000).optional().nullable(),
  isPublished: z.boolean().optional(),
});

// Query params for listing posts
export const listPostsQuerySchema = z.object({
  expertId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  communityId: z.string().uuid().optional(),
  isPublished: z.enum(["true", "false"]).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["created_at", "updated_at", "rating", "likes_count"]).optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Add post media schema
export const createPostMediaSchema = z.object({
  mediaUrl: z.string().url("Invalid media URL"),
  mediaType: z.enum(["image", "video"]).default("image"),
  altText: z.string().max(200).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
});

// Update post media schema
export const updatePostMediaSchema = z.object({
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  altText: z.string().max(200).optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
});

// Type exports
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type CreatePostMediaInput = z.infer<typeof createPostMediaSchema>;
export type UpdatePostMediaInput = z.infer<typeof updatePostMediaSchema>;
