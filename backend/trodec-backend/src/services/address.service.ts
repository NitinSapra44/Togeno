import { supabaseAdmin } from "../config";
import { ApiError } from "../utils";
import { logger } from "../utils/logger";

// Address types
export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;          // legacy column
  phone_number: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;    // legacy column
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

// Helper functions
export function toAddress(row: AddressRow): Address {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefaultShipping: row.is_default_shipping,
    isDefaultBilling: row.is_default_billing,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface CreateAddressData {
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

interface UpdateAddressData {
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

class AddressService {
  /**
   * Create address
   */
  async createAddress(data: CreateAddressData): Promise<Address> {
    const {
      userId,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefaultShipping = false,
      isDefaultBilling = false,
    } = data;

    // If setting as default, unset other defaults
    if (isDefaultShipping) {
      await this.unsetDefaultShipping(userId);
    }
    if (isDefaultBilling) {
      await this.unsetDefaultBilling(userId);
    }

    const { data: addressRow, error } = await supabaseAdmin
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: fullName,
        phone_number: phoneNumber,
        phone: phoneNumber,           // legacy NOT NULL column
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
        is_default_shipping: isDefaultShipping,
        is_default_billing: isDefaultBilling,
        is_default: isDefaultShipping, // legacy NOT NULL column
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to create address", { error: error.message, data });
      throw ApiError.internal("Failed to create address");
    }

    return toAddress(addressRow as AddressRow);
  }

  /**
   * Get address by ID
   */
  async getAddress(addressId: string, userId: string): Promise<Address | null> {
    const { data: addressRow, error } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch address", {
        error: error.message,
        addressId,
      });
      throw ApiError.internal("Failed to fetch address");
    }

    return toAddress(addressRow as AddressRow);
  }

  /**
   * Get user addresses
   */
  async getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch user addresses", {
        error: error.message,
        userId,
      });
      throw ApiError.internal("Failed to fetch addresses");
    }

    return data?.map((row) => toAddress(row as AddressRow)) || [];
  }

  /**
   * Get default shipping address
   */
  async getDefaultShippingAddress(userId: string): Promise<Address | null> {
    const { data: addressRow, error } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default_shipping", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch default shipping address", {
        error: error.message,
        userId,
      });
      throw ApiError.internal("Failed to fetch default shipping address");
    }

    return toAddress(addressRow as AddressRow);
  }

  /**
   * Get default billing address
   */
  async getDefaultBillingAddress(userId: string): Promise<Address | null> {
    const { data: addressRow, error } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default_billing", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch default billing address", {
        error: error.message,
        userId,
      });
      throw ApiError.internal("Failed to fetch default billing address");
    }

    return toAddress(addressRow as AddressRow);
  }

  /**
   * Update address
   */
  async updateAddress(
    addressId: string,
    userId: string,
    data: UpdateAddressData
  ): Promise<Address> {
    const updateData: Record<string, unknown> = {};

    if (data.fullName !== undefined) {
      updateData.full_name = data.fullName;
    }
    if (data.phoneNumber !== undefined) {
      updateData.phone_number = data.phoneNumber;
    }
    if (data.addressLine1 !== undefined) {
      updateData.address_line1 = data.addressLine1;
    }
    if (data.addressLine2 !== undefined) {
      updateData.address_line2 = data.addressLine2;
    }
    if (data.city !== undefined) {
      updateData.city = data.city;
    }
    if (data.state !== undefined) {
      updateData.state = data.state;
    }
    if (data.postalCode !== undefined) {
      updateData.postal_code = data.postalCode;
    }
    if (data.country !== undefined) {
      updateData.country = data.country;
    }
    if (data.isDefaultShipping !== undefined) {
      updateData.is_default_shipping = data.isDefaultShipping;
      updateData.is_default = data.isDefaultShipping; // keep legacy column in sync
      if (data.isDefaultShipping) {
        await this.unsetDefaultShipping(userId);
      }
    }
    if (data.isDefaultBilling !== undefined) {
      updateData.is_default_billing = data.isDefaultBilling;
      if (data.isDefaultBilling) {
        await this.unsetDefaultBilling(userId);
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest("No fields to update");
    }

    const { data: addressRow, error } = await supabaseAdmin
      .from("addresses")
      .update(updateData)
      .eq("id", addressId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Address not found");
      }
      logger.error("Failed to update address", {
        error: error.message,
        addressId,
      });
      throw ApiError.internal("Failed to update address");
    }

    return toAddress(addressRow as AddressRow);
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", userId);

    if (error) {
      logger.error("Failed to delete address", {
        error: error.message,
        addressId,
      });
      throw ApiError.internal("Failed to delete address");
    }
  }

  /**
   * Set default shipping address
   */
  async setDefaultShippingAddress(addressId: string, userId: string): Promise<Address> {
    // First, unset all other default shipping addresses
    await this.unsetDefaultShipping(userId);

    // Then set this one as default
    return this.updateAddress(addressId, userId, { isDefaultShipping: true });
  }

  /**
   * Set default billing address
   */
  async setDefaultBillingAddress(addressId: string, userId: string): Promise<Address> {
    // First, unset all other default billing addresses
    await this.unsetDefaultBilling(userId);

    // Then set this one as default
    return this.updateAddress(addressId, userId, { isDefaultBilling: true });
  }

  /**
   * Unset all default shipping addresses for user
   */
  private async unsetDefaultShipping(userId: string): Promise<void> {
    await supabaseAdmin
      .from("addresses")
      .update({ is_default_shipping: false, is_default: false })
      .eq("user_id", userId)
      .eq("is_default_shipping", true);
  }

  /**
   * Unset all default billing addresses for user
   */
  private async unsetDefaultBilling(userId: string): Promise<void> {
    await supabaseAdmin
      .from("addresses")
      .update({ is_default_billing: false })
      .eq("user_id", userId)
      .eq("is_default_billing", true);
  }
}

export const addressService = new AddressService();
