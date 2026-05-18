import { z } from "zod";

// Create product schema
export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen-separated"),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),

  price: z.number().positive("Price must be greater than 0"),
  compareAtPrice: z.number().positive("Compare at price must be greater than 0").optional().nullable(),
  sku: z.string().min(1, "SKU is required").optional(),
  stockQuantity: z.number().int().min(0, "Stock quantity must be non-negative").default(0),

  status: z.enum(["draft", "active", "inactive"]).default("draft"),
  isFeatured: z.boolean().default(false),

  categoryId: z.string().uuid("Invalid category ID"),

  metadata: z.record(z.any()).optional().default({}),
});

// Update product schema
export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),

  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1).optional(),
  stockQuantity: z.number().int().min(0).optional(),

  status: z.enum(["draft", "active", "inactive"]).optional(),
  isFeatured: z.boolean().optional(),

  categoryId: z.string().uuid("Invalid category ID").optional(),

  metadata: z.record(z.any()).optional(),
});

// Query params for listing products
export const listProductsQuerySchema = z.object({
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["draft", "active", "inactive"]).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),

  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.enum(["true", "false"]).optional(),

  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),

  search: z.string().min(1).optional(),
  sortBy: z.enum(["name", "price", "created_at", "updated_at", "average_rating", "review_count"]).optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  communityIds: z.string().optional(), // comma-separated community UUIDs
});

// Product image schema
export const createProductImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  altText: z.string().max(200).optional().nullable(),
  isPrimary: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

// Update product image schema
export const updateProductImageSchema = z.object({
  imageUrl: z.string().url().optional(),
  altText: z.string().max(200).optional().nullable(),
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

// Cart item schema
export const createCartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
  selectedSize: z.string().max(50).optional().nullable(),
});

// Update cart item schema
export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
  selectedSize: z.string().max(50).optional().nullable(),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;
export type CreateCartItemInput = z.infer<typeof createCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
