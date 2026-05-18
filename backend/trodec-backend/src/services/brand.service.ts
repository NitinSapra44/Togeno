import { supabaseAdmin } from "@/config/supabase";
import { ApiError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import {
  BrandDetails,
  BrandDetailsRow,
  toBrandDetails,
} from "@/types";
import {
  CreateBrandInput,
  UpdateBrandInput,
  ListBrandsQuery,
  VerifyBrandInput,
  UpdatePickupSettingsInput,
} from "@/schemas";
import { shiprocketClient } from "./logistics.service";

class BrandService {
  /**
   * Create brand details for a user
   */
  async createBrand(userId: string, data: CreateBrandInput): Promise<BrandDetails> {
    // First check if user exists in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, is_active")
      .eq("id", userId)
      .single();

    if (profileError) {
      logger.error("User profile not found or inaccessible", {
        error: profileError.message,
        code: profileError.code,
        userId,
      });
      throw ApiError.badRequest("User profile not found. Please ensure you are registered and have a brand_admin role.");
    }

    if (!profile.is_active) {
      logger.error("User profile is not active", { userId });
      throw ApiError.badRequest("User profile is not active");
    }

    if (profile.role !== 'brand_admin') {
      logger.error("User does not have brand_admin role", { userId, role: profile.role });
      throw ApiError.forbidden("Only brand_admin users can create brand details");
    }

    // Check if brand already exists
    const { data: existingBrand, error: checkError } = await supabaseAdmin
      .from("brand_details")
      .select("id")
      .eq("id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      logger.error("Error checking existing brand", {
        error: checkError.message,
        code: checkError.code,
        userId,
      });
    }

    if (existingBrand) {
      logger.error("Brand already exists for user", { userId });
      throw ApiError.badRequest("Brand details already exist for this user");
    }

    const insertData: Record<string, unknown> = {
      id: userId,
      brand_name: data.brandName,
      business_type: data.businessType || null,
      website_url: data.websiteUrl || null,
      description: data.description || null,
      logo_url: data.logoUrl || null,
      is_verified: false, // Default to unverified
    };

    logger.info("Attempting to create brand", { userId, insertData });

    const { data: brandRow, error } = await supabaseAdmin
      .from("brand_details")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logger.error("Failed to create brand details", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
        insertData,
      });
      
      // Provide more specific error messages based on the error code
      if (error.code === "42501") {
        throw ApiError.forbidden("Permission denied. Check RLS policies and service role permissions.");
      } else if (error.code === "23503") {
        throw ApiError.badRequest("Foreign key constraint violation. User profile may not exist.");
      } else if (error.code === "23505") {
        throw ApiError.badRequest("Brand details already exist for this user.");
      } else {
        throw ApiError.internal(`Failed to create brand details: ${error.message}`);
      }
    }

    logger.info("Brand created successfully", { userId, brandId: brandRow.id });
    return toBrandDetails(brandRow as BrandDetailsRow);
  }

  /**
   * Get brand details by user ID
   */
  async getBrandByUserId(userId: string): Promise<BrandDetails | null> {
    const { data: brandRow, error } = await supabaseAdmin
      .from("brand_details")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch brand details", {
        error: error.message,
        userId,
      });
      throw ApiError.internal("Failed to fetch brand details");
    }

    return toBrandDetails(brandRow as BrandDetailsRow);
  }

  /**
   * Get brand details by brand ID
   */
  async getBrandById(brandId: string): Promise<BrandDetails | null> {
    const { data: brandRow, error } = await supabaseAdmin
      .from("brand_details")
      .select("*")
      .eq("id", brandId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch brand details", {
        error: error.message,
        brandId,
      });
      throw ApiError.internal("Failed to fetch brand details");
    }

    return toBrandDetails(brandRow as BrandDetailsRow);
  }

  /**
   * Update brand details
   */
  async updateBrand(
    userId: string,
    data: UpdateBrandInput,
  ): Promise<BrandDetails> {
    const updateData: Record<string, unknown> = {};

    if (data.brandName !== undefined) {
      updateData.brand_name = data.brandName;
    }
    if (data.businessType !== undefined) {
      updateData.business_type = data.businessType;
    }
    if (data.websiteUrl !== undefined) {
      updateData.website_url = data.websiteUrl;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.logoUrl !== undefined) {
      updateData.logo_url = data.logoUrl;
    }
    if (data.isVerified !== undefined) {
      updateData.is_verified = data.isVerified;
    }

    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest("No fields to update");
    }

    const { data: brandRow, error } = await supabaseAdmin
      .from("brand_details")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Brand details not found");
      }
      logger.error("Failed to update brand details", {
        error: error.message,
        userId,
      });
      throw ApiError.internal("Failed to update brand details");
    }

    return toBrandDetails(brandRow as BrandDetailsRow);
  }

  /**
   * List brands with filtering and pagination
   */
  async listBrands(query: ListBrandsQuery) {
    const {
      verified,
      businessType,
      search,
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "desc",
    } = query;

    const offset = (page - 1) * limit;

    let dbQuery = supabaseAdmin
      .from("brand_details")
      .select("*, profiles!inner(email, full_name, is_active)", {
        count: "exact",
      })
      .eq("profiles.is_active", true)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (verified !== undefined) {
      dbQuery = dbQuery.eq("is_verified", verified === "true");
    }

    if (businessType) {
      dbQuery = dbQuery.ilike("business_type", `%${businessType}%`);
    }

    if (search) {
      dbQuery = dbQuery.or(
        `brand_name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Apply sorting
    const validSortFields = [
      "brand_name",
      "created_at",
      "updated_at",
      "verification_date",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    dbQuery = dbQuery.order(sortField, { ascending: sortOrder === "asc" });

    const { data, error, count } = await dbQuery;

    if (error) {
      logger.error("Failed to list brands", { error: error.message });
      throw ApiError.internal("Failed to fetch brands");
    }

    return {
      data:
        data?.map((row) => ({
          brandDetails: toBrandDetails(row as BrandDetailsRow),
          profile: {
            email: row.profiles.email,
            fullName: row.profiles.full_name,
            isActive: row.profiles.is_active,
          },
        })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Verify/unverify a brand (admin only)
   */
  async verifyBrand(brandId: string, data: VerifyBrandInput): Promise<BrandDetails> {
    const updateData: Record<string, unknown> = {
      is_verified: data.isVerified,
    };

    if (data.isVerified) {
      updateData.verification_date = new Date().toISOString();
    } else {
      updateData.verification_date = null;
    }

    const { data: brandRow, error } = await supabaseAdmin
      .from("brand_details")
      .update(updateData)
      .eq("id", brandId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Brand not found");
      }
      logger.error("Failed to verify brand", {
        error: error.message,
        brandId,
      });
      throw ApiError.internal("Failed to update brand verification status");
    }

    return toBrandDetails(brandRow as BrandDetailsRow);
  }

  /**
   * Get brand's current pickup settings (Shiprocket location name + default address).
   */
  async getPickupSettings(brandId: string): Promise<{
    shiprocketPickupLocation: string | null;
    pickupAddress: Record<string, unknown> | null;
    shiprocketLocations: Array<{ name: string; city: string; status: number }>;
  }> {
    const [brandRow, addrRow, shiprocketLocations] = await Promise.all([
      supabaseAdmin
        .from("brand_details")
        .select("shiprocket_pickup_location")
        .eq("id", brandId)
        .maybeSingle(),
      supabaseAdmin
        .from("addresses")
        .select("full_name, phone, address_line1, address_line2, city, state, postal_code, country")
        .eq("user_id", brandId)
        .eq("is_default", true)
        .maybeSingle(),
      shiprocketClient
        .getPickupLocations()
        .catch(() => [] as Array<{ name: string; city: string; status: number }>),
    ]);

    return {
      shiprocketPickupLocation: (brandRow.data as any)?.shiprocket_pickup_location ?? null,
      pickupAddress: addrRow.data ?? null,
      shiprocketLocations,
    };
  }

  /**
   * Auto-register the brand's default shipping address as a Shiprocket pickup location
   * and save the location name. Safe to call on every address save — idempotent.
   * No-op if the user has no brand_details row (i.e. not a brand).
   */
  async syncPickupLocation(brandId: string): Promise<void> {
    const { data: brandRow } = await supabaseAdmin
      .from("brand_details")
      .select("id")
      .eq("id", brandId)
      .maybeSingle();

    if (!brandRow) return;

    const { data: addrRow } = await supabaseAdmin
      .from("addresses")
      .select("full_name, phone_number, address_line1, address_line2, city, state, postal_code, country")
      .eq("user_id", brandId)
      .eq("is_default_shipping", true)
      .maybeSingle();

    if (!addrRow) {
      logger.warn("Brand has no default shipping address, skipping Shiprocket pickup sync", { brandId });
      return;
    }

    const locationName = `trodec-brand-${brandId.replace(/-/g, "").slice(0, 12)}`;

    const { data: profileRow } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", brandId)
      .maybeSingle();

    const brandEmail = (profileRow as any)?.email ?? "";

    try {
      await shiprocketClient.addPickupLocation({
        locationName,
        name: (addrRow as any).full_name,
        email: brandEmail,
        phone: (addrRow as any).phone_number,
        address: (addrRow as any).address_line1,
        address2: (addrRow as any).address_line2 ?? "",
        city: (addrRow as any).city,
        state: (addrRow as any).state,
        country: (addrRow as any).country || "India",
        pinCode: (addrRow as any).postal_code,
      });

      await supabaseAdmin
        .from("brand_details")
        .update({ shiprocket_pickup_location: locationName })
        .eq("id", brandId);

      logger.info("Brand Shiprocket pickup location synced", { brandId, locationName });
    } catch (err) {
      logger.error("Failed to sync Shiprocket pickup location for brand", { brandId, err });
    }
  }

  /**
   * Manually override the Shiprocket pickup location name for a brand (admin use).
   */
  async updatePickupSettings(brandId: string, data: UpdatePickupSettingsInput): Promise<void> {
    const { error } = await supabaseAdmin
      .from("brand_details")
      .update({ shiprocket_pickup_location: data.shiprocketPickupLocation })
      .eq("id", brandId);

    if (error) {
      logger.error("Failed to update pickup settings", { brandId, error: error.message });
      throw ApiError.internal("Failed to update pickup settings");
    }

    logger.info("Brand pickup settings updated", { brandId, location: data.shiprocketPickupLocation });
  }

  /**
   * Delete brand details (admin only or self)
   */
  async deleteBrand(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("brand_details")
      .delete()
      .eq("id", userId);

    if (error) {
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Brand details not found");
      }
      logger.error("Failed to delete brand details", {
        error: error.message,
        userId,
      });
      throw ApiError.internal("Failed to delete brand details");
    }
  }
}

export const brandService = new BrandService();
