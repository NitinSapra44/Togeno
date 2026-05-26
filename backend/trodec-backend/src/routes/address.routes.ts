import { Router } from "express";
import { addressController } from "@/controllers/address.controller";
import { authenticate, validateBody } from "@/middleware";
import { createAddressSchema, updateAddressSchema } from "@/schemas";

const router = Router();

// ============================================
// AUTHENTICATED ROUTES (Authentication Required)
// ============================================

/**
 * POST /addresses
 * Create address
 */
router.post(
  "/",
  authenticate,
  validateBody(createAddressSchema),
  addressController.createAddress
);

/**
 * GET /addresses
 * Get user's addresses
 */
router.get("/", authenticate, addressController.getAddresses);

/**
 * GET /addresses/default/shipping
 * Get default shipping address (MUST come before /:id)
 */
router.get("/default/shipping", authenticate, addressController.getDefaultShipping);

/**
 * GET /addresses/warehouse
 * Get expert warehouse address (MUST come before /:id)
 */
router.get("/warehouse", authenticate, addressController.getWarehouse);

/**
 * GET /addresses/default/billing
 * Get default billing address (MUST come before /:id)
 */
router.get("/default/billing", authenticate, addressController.getDefaultBilling);

/**
 * GET /addresses/:id
 * Get address by ID
 */
router.get("/:id", authenticate, addressController.getAddress);

/**
 * PATCH /addresses/:id
 * Update address
 */
router.patch(
  "/:id",
  authenticate,
  validateBody(updateAddressSchema),
  addressController.updateAddress
);

/**
 * DELETE /addresses/:id
 * Delete address
 */
router.delete("/:id", authenticate, addressController.deleteAddress);

/**
 * POST /addresses/:id/set-default-shipping
 * Set address as default shipping
 */
router.post(
  "/:id/set-default-shipping",
  authenticate,
  addressController.setDefaultShipping
);

/**
 * POST /addresses/:id/set-default-billing
 * Set address as default billing
 */
router.post(
  "/:id/set-default-billing",
  authenticate,
  addressController.setDefaultBilling
);

/**
 * POST /addresses/:id/set-warehouse
 * Mark as expert warehouse address
 */
router.post("/:id/set-warehouse", authenticate, addressController.setWarehouse);

export default router;
