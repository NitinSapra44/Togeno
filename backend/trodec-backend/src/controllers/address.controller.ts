import { Response, NextFunction } from "express";
import { addressService } from "@/services/address.service";
import { brandService } from "@/services/brand.service";
import { ApiError, sendSuccess } from "@/utils";
import { AuthenticatedRequest } from "@/types";

class AddressController {
  /**
   * POST /api/addresses
   * Create address
   */
  async createAddress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const addressData = req.body;

      const address = await addressService.createAddress({
        userId,
        ...addressData,
      });

      if (address.isDefaultShipping) {
        brandService.syncPickupLocation(userId).catch(() => {});
      }

      sendSuccess(res, address, 201, "Address created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/addresses
   * Get user's addresses
   */
  async getAddresses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const addresses = await addressService.getUserAddresses(userId);

      sendSuccess(res, addresses, 200, "Addresses fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/addresses/default/shipping
   * Get default shipping address
   */
  async getDefaultShipping(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const address = await addressService.getDefaultShippingAddress(userId);

      if (!address) {
        throw ApiError.notFound("No default shipping address found");
      }

      sendSuccess(
        res,
        address,
        200,
        "Default shipping address fetched successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/addresses/default/billing
   * Get default billing address
   */
  async getDefaultBilling(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const address = await addressService.getDefaultBillingAddress(userId);

      if (!address) {
        throw ApiError.notFound("No default billing address found");
      }

      sendSuccess(
        res,
        address,
        200,
        "Default billing address fetched successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/addresses/:id
   * Get address by ID
   */
  async getAddress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const address = await addressService.getAddress(id, userId);
      if (!address) {
        throw ApiError.notFound("Address not found");
      }

      sendSuccess(res, address, 200, "Address fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/addresses/:id
   * Update address
   */
  async updateAddress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const addressData = req.body;

      const address = await addressService.updateAddress(
        id,
        userId,
        addressData,
      );

      if (address.isDefaultShipping) {
        brandService.syncPickupLocation(userId).catch(() => {});
      }

      sendSuccess(res, address, 200, "Address updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/addresses/:id
   * Delete address
   */
  async deleteAddress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      await addressService.deleteAddress(id, userId);

      sendSuccess(res, null, 200, "Address deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/addresses/:id/set-default-shipping
   * Set address as default shipping
   */
  async setDefaultShipping(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const address = await addressService.setDefaultShippingAddress(
        id,
        userId,
      );

      brandService.syncPickupLocation(userId).catch(() => {});

      sendSuccess(
        res,
        address,
        200,
        "Default shipping address set successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/addresses/:id/set-default-billing
   * Set address as default billing
   */
  async setDefaultBilling(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const address = await addressService.setDefaultBillingAddress(id, userId);

      sendSuccess(res, address, 200, "Default billing address set successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/addresses/:id/set-warehouse
   * Mark address as expert warehouse address (expert only)
   */
  async setWarehouse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      const address = await addressService.setWarehouseAddress(id, userId);

      sendSuccess(res, address, 200, "Warehouse address set successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/addresses/warehouse
   * Get expert warehouse address
   */
  async getWarehouse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;
      const address = await addressService.getWarehouseAddress(userId);

      sendSuccess(res, address, 200, "Warehouse address fetched successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const addressController = new AddressController();
