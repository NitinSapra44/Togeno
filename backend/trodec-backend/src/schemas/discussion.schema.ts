import { z } from "zod";

export const createDiscussionSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be at most 2000 characters")
    .trim(),
});

export const createReplySchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content must be at most 1000 characters")
    .trim(),
});

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
