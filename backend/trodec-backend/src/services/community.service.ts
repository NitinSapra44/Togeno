import { supabaseAdmin } from "../config";
import { ApiError } from "../utils";
import { logger } from "../utils/logger";

// Community types (these would typically be in a separate types file)
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  coverImageUrl: string | null;
  categoryId: string;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  category_id: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  isExpert: boolean;
  joinedAt: string;
}

export interface CommunityMemberRow {
  id: string;
  community_id: string;
  user_id: string;
  is_expert: boolean;
  joined_at: string;
}

export interface CommunityWithMembers extends Community {
  memberCount: number;
  expertCount: number;
}

// Helper function to convert snake_case to camelCase
export function toCommunity(row: CommunityRow): Community {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    coverImageUrl: row.cover_image_url,
    categoryId: row.category_id,
    isActive: row.is_active,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCommunityMember(row: CommunityMemberRow): CommunityMember {
  return {
    id: row.id,
    communityId: row.community_id,
    userId: row.user_id,
    isExpert: row.is_expert,
    joinedAt: row.joined_at,
  };
}

interface CreateCommunityData {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  categoryId: string;
  createdBy?: string | null;
}

interface UpdateCommunityData {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  isActive?: boolean;
}

interface JoinCommunityData {
  userId: string;
  isExpert?: boolean;
}

class CommunityService {
  /**
   * Create a new community
   */
  async createCommunity(data: CreateCommunityData): Promise<Community> {
    const { name, slug, description, imageUrl, coverImageUrl, categoryId, createdBy } =
      data;

    // Enforce 1-community limit per expert
    if (createdBy) {
      const { count, error: countError } = await supabaseAdmin
        .from("communities")
        .select("id", { count: "exact", head: true })
        .eq("created_by", createdBy);

      if (!countError && (count ?? 0) >= 1) {
        throw ApiError.badRequest("You can only create one community");
      }
    }

    const { data: communityRow, error } = await supabaseAdmin
      .from("communities")
      .insert({
        name,
        slug,
        description,
        image_url: imageUrl,
        cover_image_url: coverImageUrl,
        category_id: categoryId,
        is_active: true,
        created_by: createdBy ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        throw ApiError.badRequest("Community with this slug already exists");
      }
      if (error.code === "23503") {
        // Foreign key violation
        throw ApiError.badRequest("Invalid category ID");
      }
      logger.error("Failed to create community", {
        error: error.message,
        data,
      });
      throw ApiError.internal("Failed to create community");
    }

    return toCommunity(communityRow as CommunityRow);
  }

  /**
   * Get community by ID
   */
  async getCommunity(communityId: string): Promise<(Community & { memberCount: number; expertCount: number }) | null> {
    const { data: communityRow, error } = await supabaseAdmin
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .single();

    if (error) {
      // PGRST116 = no rows found; 22P02 = invalid UUID format
      if (error.code === "PGRST116" || error.code === "22P02") {
        return null;
      }
      logger.error("Failed to fetch community", {
        error: error.message,
        code: error.code,
        communityId,
      });
      throw ApiError.internal("Failed to fetch community");
    }

    const { count: memberCount } = await supabaseAdmin
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId);

    const { count: expertCount } = await supabaseAdmin
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("is_expert", true);

    return {
      ...toCommunity(communityRow as CommunityRow),
      memberCount: memberCount ?? 0,
      expertCount: expertCount ?? 0,
    };
  }

  /**
   * Get community by slug
   */
  async getCommunityBySlug(slug: string): Promise<Community | null> {
    const { data: communityRow, error } = await supabaseAdmin
      .from("communities")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Failed to fetch community by slug", {
        error: error.message,
        slug,
      });
      throw ApiError.internal("Failed to fetch community");
    }

    return toCommunity(communityRow as CommunityRow);
  }

  /**
   * Update community
   */
  async updateCommunity(
    communityId: string,
    data: UpdateCommunityData,
  ): Promise<Community> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.imageUrl !== undefined) {
      updateData.image_url = data.imageUrl;
    }
    if (data.coverImageUrl !== undefined) {
      updateData.cover_image_url = data.coverImageUrl;
    }
    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest("No fields to update");
    }

    const { data: communityRow, error } = await supabaseAdmin
      .from("communities")
      .update(updateData)
      .eq("id", communityId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Community not found");
      }
      logger.error("Failed to update community", {
        error: error.message,
        communityId,
      });
      throw ApiError.internal("Failed to update community");
    }

    return toCommunity(communityRow as CommunityRow);
  }

  /**
   * Delete community (soft delete by setting is_active to false)
   */
  async deleteCommunity(communityId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("communities")
      .update({ is_active: false })
      .eq("id", communityId);

    if (error) {
      if (error.code === "PGRST116") {
        throw ApiError.notFound("Community not found");
      }
      logger.error("Failed to delete community", {
        error: error.message,
        communityId,
      });
      throw ApiError.internal("Failed to delete community");
    }
  }

  /**
   * List communities with pagination and filtering
   */
  async listCommunities(
    options: {
      categoryId?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
      search?: string;
      expertId?: string; // when set, only returns communities the expert belongs to
      createdBy?: string; // when set, only returns communities created by this user
    } = {},
  ) {
    const { categoryId, isActive, page = 1, limit = 20, search, expertId, createdBy } = options;
    const offset = (page - 1) * limit;

    // If filtering by expert membership, fetch their community IDs first
    let expertCommunityIds: string[] | null = null;
    if (expertId) {
      const { data: memberships } = await supabaseAdmin
        .from("community_members")
        .select("community_id")
        .eq("user_id", expertId);
      expertCommunityIds = memberships?.map((m) => m.community_id) ?? [];
      // Expert has no communities — return empty early
      if (expertCommunityIds.length === 0) {
        return { data: [], pagination: { page, limit, total: 0 } };
      }
    }

    let query = supabaseAdmin
      .from("communities")
      .select(`
        *,
        creator:created_by (id, full_name, email),
        community_members (is_expert)
      `, { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (expertCommunityIds) {
      query = query.in("id", expertCommunityIds);
    }

    if (createdBy) {
      query = query.eq("created_by", createdBy);
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (isActive !== undefined) {
      query = query.eq("is_active", isActive);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Failed to list communities", { error: error.message });
      throw ApiError.internal("Failed to fetch communities");
    }

    return {
      data: data?.map((row) => {
        const members: { is_expert: boolean }[] = row.community_members ?? [];
        return {
          ...toCommunity(row),
          creator: row.creator ?? null,
          memberCount: members.length,
          expertCount: members.filter((m) => m.is_expert).length,
        };
      }) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Join a community
   */
  async joinCommunity(
    communityId: string,
    data: JoinCommunityData,
  ): Promise<CommunityMember> {
    const { userId, isExpert = false } = data;

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from("community_members")
      .select("*")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      throw ApiError.badRequest("User is already a member of this community");
    }

    const { data: memberRow, error } = await supabaseAdmin
      .from("community_members")
      .insert({
        community_id: communityId,
        user_id: userId,
        is_expert: isExpert,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23503") {
        // Foreign key violation
        throw ApiError.badRequest("Invalid community ID or user ID");
      }
      logger.error("Failed to join community", {
        error: error.message,
        communityId,
        userId,
      });
      throw ApiError.internal("Failed to join community");
    }

    return toCommunityMember(memberRow as CommunityMemberRow);
  }

  /**
   * Leave a community
   */
  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);

    if (error) {
      logger.error("Failed to leave community", {
        error: error.message,
        communityId,
        userId,
      });
      throw ApiError.internal("Failed to leave community");
    }
  }

  /**
   * Get community members
   */
  async getCommunityMembers(
    communityId: string,
    options: { isExpert?: boolean; page?: number; limit?: number } = {},
  ) {
    const { isExpert, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("community_members")
      .select(
        `
        *,
        profiles!community_members_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url,
          role
        )
      `,
        { count: "exact" },
      )
      .eq("community_id", communityId)
      .range(offset, offset + limit - 1)
      .order("joined_at", { ascending: false });

    if (isExpert !== undefined) {
      query = query.eq("is_expert", isExpert);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Failed to fetch community members", {
        error: error.message,
        communityId,
      });
      throw ApiError.internal("Failed to fetch community members");
    }

    return {
      data:
        data?.map((row) => ({
          member: toCommunityMember(row as CommunityMemberRow),
          profile: row.profiles,
        })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Check if user is a member of a community
   */
  async isCommunityMember(
    communityId: string,
    userId: string,
  ): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      logger.error("Failed to check community membership", {
        error: error.message,
        communityId,
        userId,
      });
      throw ApiError.internal("Failed to check community membership");
    }

    return !!data;
  }

  /**
   * Get all categories
   */
  async getCategories() {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Failed to fetch categories", { error: error.message });
      throw ApiError.internal("Failed to fetch categories");
    }

    return data?.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.image_url,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
    })) || [];
  }

  /**
   * Get communities for a user
   */
  async getUserCommunities(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from("community_members")
      .select(
        `
        *,
        communities!community_members_community_id_fkey (*)
      `,
        { count: "exact" },
      )
      .eq("user_id", userId)
      .range(offset, offset + limit - 1)
      .order("joined_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch user communities", {
        error: error.message,
        userId,
      });
      throw ApiError.internal("Failed to fetch user communities");
    }

    return {
      data:
        data?.map((row) => ({
          membership: toCommunityMember(row as CommunityMemberRow),
          community: row.communities
            ? toCommunity(row.communities as CommunityRow)
            : null,
        })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }
}

export const communityService = new CommunityService();
