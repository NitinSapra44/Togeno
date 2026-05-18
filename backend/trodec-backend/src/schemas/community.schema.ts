import { z } from "zod";

// Create community schema
export const createCommunitySchema = z.object({
  name: z.string().min(2, "Community name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated"),
  description: z.string().max(2000).optional().nullable(),

  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  coverImageUrl: z
    .string()
    .url("Invalid cover image URL")
    .optional()
    .nullable(),

  categoryId: z.string().uuid("Invalid category ID"),
});

// Update community schema
export const updateCommunitySchema = z.object({
  name: z.string().min(2).optional(),

  description: z.string().max(2000).optional().nullable(),

  imageUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),

  isActive: z.boolean().optional(),
});

// Query params for listing communities
export const listCommunitiesQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  isActive: z.enum(["true", "false"]).optional(),

  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),

  search: z.string().min(1).optional(),
});

// Join community schema
export const joinCommunitySchema = z.object({
  isExpert: z.boolean().optional().default(false),
});

// Type exports
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
export type ListCommunitiesQuery = z.infer<typeof listCommunitiesQuerySchema>;
export type JoinCommunityInput = z.infer<typeof joinCommunitySchema>;
