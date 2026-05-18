import { z } from "zod";

/**
 * Schema for creating an address
 */
export const createAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
  phoneNumber: z.string().min(1, "Phone number is required").max(20),
  addressLine1: z.string().min(1, "Address line 1 is required").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

/**
 * Schema for updating an address
 */
export const updateAddressSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  phoneNumber: z.string().min(1).max(20).optional(),
  addressLine1: z.string().min(1).max(255).optional(),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: z.string().min(1).max(100).optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
