import { Response, NextFunction } from "express";
import { communityService } from "@/services/community.service";
import { sendSuccess } from "@/utils/response";
import { ApiError } from "@/utils/errors";
import { AuthenticatedRequest } from "@/types";
import {
  CreateCommunityInput,
  UpdateCommunityInput,
  ListCommunitiesQuery,
  JoinCommunityInput,
} from "@/schemas";

class CommunityController {
  /**
   * POST /communities
   * Create a new community (authentication required)
   */
  async createCommunity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Body is already validated by middleware
      const data = req.body as CreateCommunityInput;

      const community = await communityService.createCommunity({
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        categoryId: data.categoryId,
        createdBy: req.user!.id,
      });

      // Auto-join the creator as an expert member
      await communityService.joinCommunity(community.id, {
        userId: req.user!.id,
        isExpert: true,
      });

      sendSuccess(res, community, 201, "Community created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /communities
   * List communities with pagination and filtering (public endpoint)
   */
  async listCommunities(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query = req.query as ListCommunitiesQuery;

      // If ?mine=true and user is authenticated, only return communities they created
      const createdBy =
        req.query.mine === "true" && req.user?.id
          ? req.user.id
          : undefined;

      const result = await communityService.listCommunities({
        categoryId: query.categoryId,
        isActive:
          query.isActive === "true"
            ? true
            : query.isActive === "false"
              ? false
              : undefined,
        page: query.page,
        limit: query.limit,
        search: query.search,
        createdBy,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /communities/:id
   * Get community by ID (public endpoint)
   */
  async getCommunity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const communityId = Array.isArray(id) ? id[0] : id;

      const community = await communityService.getCommunity(communityId);

      if (!community) {
        throw ApiError.notFound("Community not found");
      }

      sendSuccess(res, community);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /communities/slug/:slug
   * Get community by slug (public endpoint)
   */
  async getCommunityBySlug(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const communitySlug = Array.isArray(slug) ? slug[0] : slug;

      const community =
        await communityService.getCommunityBySlug(communitySlug);

      if (!community) {
        throw ApiError.notFound("Community not found");
      }

      sendSuccess(res, community);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /communities/:id
   * Update community (authentication and authorization required)
   */
  async updateCommunity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const communityId = Array.isArray(id) ? id[0] : id;
      const data = req.body as UpdateCommunityInput;

      const community = await communityService.updateCommunity(
        communityId,
        data,
      );

      sendSuccess(res, community, 200, "Community updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /communities/:id
   * Delete community (soft delete - authentication and authorization required)
   */
  async deleteCommunity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const communityId = Array.isArray(id) ? id[0] : id;

      await communityService.deleteCommunity(communityId);

      sendSuccess(res, null, 200, "Community deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /communities/:id/join
   * Join a community (authentication required)
   */
  async joinCommunity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const communityId = Array.isArray(id) ? id[0] : id;
      const data = req.body as JoinCommunityInput;

      const membership = await communityService.joinCommunity(communityId, {
        userId: req.user!.id,
        isExpert: data.isExpert,
      });

      sendSuccess(res, membership, 201, "Joined community successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /communities/:id/leave
   * Leave a community (authentication required)
   */
  async leaveCommunity(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const communityId = Array.isArray(id) ? id[0] : id;

      await communityService.leaveCommunity(communityId, req.user!.id);

      sendSuccess(res, null, 200, "Left community successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /communities/:id/members
   * Get community members (public endpoint)
   */
  async getCommunityMembers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const communityId = Array.isArray(id) ? id[0] : id;
      const { isExpert, page, limit } = req.query;

      const result = await communityService.getCommunityMembers(communityId, {
        isExpert:
          isExpert === "true" ? true : isExpert === "false" ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /communities/:id/membership
   * Check if current user is a member of the community (authentication required)
   */
  async checkMembership(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const communityId = Array.isArray(id) ? id[0] : id;

      const isMember = await communityService.isCommunityMember(
        communityId,
        req.user!.id,
      );

      sendSuccess(res, { isMember });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/me/communities
   * Get communities for the current user (authentication required)
   */
  async getMyCommunities(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit } = req.query;

      const result = await communityService.getUserCommunities(req.user!.id, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /communities/categories
   * Get all active categories (public endpoint)
   */
  async getCategories(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categories = await communityService.getCategories();
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }
}

export const communityController = new CommunityController();
