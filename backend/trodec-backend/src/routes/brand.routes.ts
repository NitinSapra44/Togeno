import { Router } from 'express';
import { brandController } from '@/controllers/brand.controller';
import { authenticate, requireRole, validateBody, validateQuery } from '@/middleware';
import {
  createBrandSchema,
  updateBrandSchema,
  listBrandsQuerySchema,
  verifyBrandSchema,
  updatePickupSettingsSchema,
} from '@/schemas';

const router = Router();

// ============================================
// AUTHENTICATED ROUTES (Current User - Brand Admin)
// ============================================

/**
 * GET /brands/me
 * Get current user's brand details (brand_admin only)
 */
router.get('/me', authenticate, requireRole('brand_admin'), brandController.getMyBrand);

/**
 * POST /brands/me
 * Create brand details for current user (brand_admin only)
 */
router.post(
  '/me',
  authenticate,
  requireRole('brand_admin'),
  validateBody(createBrandSchema),
  brandController.createMyBrand
);

/**
 * PATCH /brands/me
 * Update current user's brand details (brand_admin only)
 */
router.patch(
  '/me',
  authenticate,
  requireRole('brand_admin'),
  validateBody(updateBrandSchema),
  brandController.updateMyBrand
);

/**
 * DELETE /brands/me
 * Delete current user's brand details (brand_admin only)
 */
router.delete('/me', authenticate, requireRole('brand_admin'), brandController.deleteMyBrand);

/**
 * GET /brands/me/products
 * Get current brand's products (brand_admin only)
 */
router.get('/me/products', authenticate, requireRole('brand_admin'), brandController.getMyProducts);

/**
 * GET /brands/me/stats
 * Get current brand's dashboard stats (brand_admin only)
 */
router.get('/me/stats', authenticate, requireRole('brand_admin'), brandController.getMyStats);

/**
 * GET /brands/me/orders
 * Get orders containing current brand's products (brand_admin only)
 */
router.get('/me/orders', authenticate, requireRole('brand_admin'), brandController.getMyOrders);

/**
 * GET /brands/me/pickup-settings
 * Get brand's Shiprocket pickup location + available locations from Shiprocket.
 */
router.get('/me/pickup-settings', authenticate, requireRole('brand_admin'), brandController.getPickupSettings);

/**
 * PUT /brands/me/pickup-settings
 * Save the Shiprocket pickup location name for this brand.
 */
router.put(
  '/me/pickup-settings',
  authenticate,
  requireRole('brand_admin'),
  validateBody(updatePickupSettingsSchema),
  brandController.updatePickupSettings
);

// ============================================
// PUBLIC ROUTES (Listings)
// ============================================

/**
 * GET /brands
 * List all brands (public, filterable by verification status, business type, etc.)
 */
router.get(
  '/',
  validateQuery(listBrandsQuerySchema),
  brandController.listBrands
);

/**
 * GET /brands/:id
 * Get brand details by ID (public)
 */
router.get('/:id', brandController.getBrandById);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * POST /brands/:id/verify
 * Verify/unverify a brand (admin only)
 */
router.post(
  '/:id/verify',
  authenticate,
  requireRole('admin'),
  validateBody(verifyBrandSchema),
  brandController.verifyBrand
);

/**
 * DELETE /brands/:id
 * Delete brand by ID (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  brandController.deleteBrand
);

export default router;
