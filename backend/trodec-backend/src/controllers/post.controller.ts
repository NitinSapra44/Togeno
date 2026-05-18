import { Response, NextFunction } from "express";
import { postService } from "@/services/post.service";
import { sendSuccess } from "@/utils/response";
import { ApiError } from "@/utils/errors";
import { AuthenticatedRequest } from "@/types";
import {
  CreatePostInput,
  UpdatePostInput,
  ListPostsQuery,
  CreatePostMediaInput,
  UpdatePostMediaInput,
} from "@/schemas/post.schema";

class PostController {
  // ============================================
  // POST CRUD OPERATIONS
  // ============================================

  /**
   * POST /posts
   * Create a new post (verified expert only)
   */
  async createPost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body as CreatePostInput;

      const post = await postService.createPost({
        expertId: req.user!.id,
        productId: data.productId,
        communityId: data.communityId,
        pitchId: data.pitchId,
        title: data.title,
        content: data.content,
        rating: data.rating,
        pros: data.pros,
        cons: data.cons,
        verdict: data.verdict,
        isPublished: data.isPublished,
      });

      sendSuccess(res, post, 201, "Post created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /posts
   * List posts with pagination and filtering (public)
   */
  async listPosts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req as any).validatedQuery || req.query;
      const typedQuery = query as ListPostsQuery;

      const result = await postService.listPosts(
        {
          expertId: typedQuery.expertId,
          productId: typedQuery.productId,
          communityId: typedQuery.communityId,
          isPublished:
            typedQuery.isPublished === "true"
              ? true
              : typedQuery.isPublished === "false"
                ? false
                : undefined,
          isFeatured:
            typedQuery.isFeatured === "true"
              ? true
              : typedQuery.isFeatured === "false"
                ? false
                : undefined,
          minRating: typedQuery.minRating,
          maxRating: typedQuery.maxRating,
          page: typedQuery.page,
          limit: typedQuery.limit,
          sortBy: typedQuery.sortBy,
          sortOrder: typedQuery.sortOrder,
        },
        req.user?.id // Pass current user ID for hasLiked check
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /posts/me
   * List current expert's posts (expert only)
   */
  async listMyPosts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req as any).validatedQuery || req.query;
      const typedQuery = query as ListPostsQuery;

      const result = await postService.listExpertPosts(req.user!.id, {
        isPublished:
          typedQuery.isPublished === "true"
            ? true
            : typedQuery.isPublished === "false"
              ? false
              : undefined,
        page: typedQuery.page,
        limit: typedQuery.limit,
        sortBy: typedQuery.sortBy,
        sortOrder: typedQuery.sortOrder,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /posts/:id
   * Get post by ID (public for published, owner for unpublished)
   */
  async getPost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;

      const post = await postService.getPostWithDetails(postId, req.user?.id);

      if (!post) {
        throw ApiError.notFound("Post not found");
      }

      // Check if unpublished post - only owner can view
      if (!post.isPublished && post.expertId !== req.user?.id) {
        throw ApiError.notFound("Post not found");
      }

      sendSuccess(res, post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /posts/:id
   * Update post (expert owner only)
   */
  async updatePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;
      const data = req.body as UpdatePostInput;

      const post = await postService.updatePost(postId, req.user!.id, data);

      sendSuccess(res, post, 200, "Post updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /posts/:id
   * Delete post (expert owner only)
   */
  async deletePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;

      await postService.deletePost(postId, req.user!.id);

      sendSuccess(res, null, 200, "Post deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // POST MEDIA OPERATIONS
  // ============================================

  /**
   * GET /posts/:id/media
   * Get post media (public)
   */
  async getPostMedia(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;

      const media = await postService.getPostMedia(postId);

      sendSuccess(res, { data: media });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /posts/:id/media
   * Add media to post (expert owner only)
   */
  async addPostMedia(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;
      const data = req.body as CreatePostMediaInput;

      const media = await postService.addPostMedia(
        {
          postId,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          altText: data.altText,
          displayOrder: data.displayOrder,
        },
        req.user!.id
      );

      sendSuccess(res, media, 201, "Media added successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /posts/:postId/media/:mediaId
   * Update post media (expert owner only)
   */
  async updatePostMedia(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { mediaId } = req.params;
      const postMediaId = Array.isArray(mediaId) ? mediaId[0] : mediaId;
      const data = req.body as UpdatePostMediaInput;

      const media = await postService.updatePostMedia(
        postMediaId,
        req.user!.id,
        data
      );

      sendSuccess(res, media, 200, "Media updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /posts/:postId/media/:mediaId
   * Delete post media (expert owner only)
   */
  async deletePostMedia(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { mediaId } = req.params;
      const postMediaId = Array.isArray(mediaId) ? mediaId[0] : mediaId;

      await postService.deletePostMedia(postMediaId, req.user!.id);

      sendSuccess(res, null, 200, "Media deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // LIKE OPERATIONS
  // ============================================

  /**
   * POST /posts/:id/like
   * Like a post (authenticated users only)
   */
  async likePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;

      const like = await postService.likePost(postId, req.user!.id);

      sendSuccess(res, like, 201, "Post liked successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /posts/:id/like
   * Unlike a post (authenticated users only)
   */
  async unlikePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;

      await postService.unlikePost(postId, req.user!.id);

      sendSuccess(res, null, 200, "Post unliked successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
