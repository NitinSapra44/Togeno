import api, { ApiSuccessResponse, getErrorMessage } from './api';

export interface Post {
  id: string;
  expertId: string;
  productId: string;
  communityId: string;
  pitchId: string | null;
  title: string | null;
  content: string;
  rating: number;
  likesCount: number;
  commentsCount: number;
  pros: string[] | null;
  cons: string[] | null;
  verdict: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostMedia {
  id: string;
  postId: string;
  mediaUrl: string;
  mediaType: string;
  altText: string | null;
  displayOrder: number;
  createdAt: string;
}

export interface PostWithDetails extends Post {
  expert?: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  product?: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  community?: {
    id: string;
    name: string;
  };
  media?: PostMedia[];
  hasLiked?: boolean;
}

export interface CreatePostData {
  productId: string;
  communityId: string;
  pitchId?: string | null;
  title?: string | null;
  content: string;
  rating: number;
  pros?: string[] | null;
  cons?: string[] | null;
  verdict?: string | null;
  isPublished?: boolean;
}

export interface UpdatePostData {
  title?: string | null;
  content?: string;
  rating?: number;
  pros?: string[] | null;
  cons?: string[] | null;
  verdict?: string | null;
  isPublished?: boolean;
}

export interface PostsFilter {
  expertId?: string;
  productId?: string;
  communityId?: string;
  isPublished?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginatedPosts {
  data: PostWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const PostService = {
  async getMyPosts(params?: PostsFilter): Promise<PaginatedPosts> {
    try {
      const response = await api.get<ApiSuccessResponse<PaginatedPosts>>('/posts/me', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getPosts(params?: PostsFilter): Promise<PaginatedPosts> {
    try {
      const response = await api.get<ApiSuccessResponse<PaginatedPosts>>('/posts', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getPost(id: string): Promise<PostWithDetails> {
    try {
      const response = await api.get<ApiSuccessResponse<PostWithDetails>>(`/posts/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createPost(data: CreatePostData): Promise<Post> {
    try {
      const response = await api.post<ApiSuccessResponse<Post>>('/posts', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    try {
      const response = await api.patch<ApiSuccessResponse<Post>>(`/posts/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deletePost(id: string): Promise<void> {
    try {
      await api.delete(`/posts/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async likePost(id: string): Promise<void> {
    try {
      await api.post(`/posts/${id}/like`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async unlikePost(id: string): Promise<void> {
    try {
      await api.delete(`/posts/${id}/like`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default PostService;
