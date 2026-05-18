import { z } from 'zod';

// Create brand details schema
export const createBrandSchema = z.object({
  brandName: z.string().min(2, 'Brand name must be at least 2 characters'),
  businessType: z.string().optional().nullable(),
  websiteUrl: z.string().url('Invalid website URL').optional().nullable(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional().nullable(),
  logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
});

// Update brand details schema
export const updateBrandSchema = z.object({
  brandName: z.string().min(2, 'Brand name must be at least 2 characters').optional(),
  businessType: z.string().optional().nullable(),
  websiteUrl: z.string().url('Invalid website URL').optional().nullable(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional().nullable(),
  logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
  isVerified: z.boolean().optional(),
});

// Query params for listing brands
export const listBrandsQuerySchema = z.object({
  verified: z.enum(['true', 'false']).optional(),
  businessType: z.string().optional(),
  search: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(['brand_name', 'created_at', 'updated_at', 'verification_date']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Brand verification schema (for admin use)
export const verifyBrandSchema = z.object({
  isVerified: z.boolean(),
  verificationNotes: z.string().max(500, 'Verification notes must be less than 500 characters').optional(),
});

// Pickup settings schema — brand sets their Shiprocket pickup location name
// The location must first be registered in the Shiprocket dashboard, then the
// name entered here so orders are picked up from the brand's address.
export const updatePickupSettingsSchema = z.object({
  shiprocketPickupLocation: z.string().min(1, "Pickup location name is required").max(100),
});

// Type exports
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type ListBrandsQuery = z.infer<typeof listBrandsQuerySchema>;
export type VerifyBrandInput = z.infer<typeof verifyBrandSchema>;
export type UpdatePickupSettingsInput = z.infer<typeof updatePickupSettingsSchema>;
