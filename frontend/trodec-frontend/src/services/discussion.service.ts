import api, { ApiSuccessResponse, getErrorMessage } from './api';

export interface DiscussionAuthor {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  role?: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  author?: DiscussionAuthor;
  likedByMe?: boolean;
}

export interface Discussion {
  id: string;
  productId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  author?: DiscussionAuthor;
  replies?: DiscussionReply[];
  likedByMe?: boolean;
}

export async function getDiscussions(productId: string): Promise<Discussion[]> {
  try {
    const res = await api.get<ApiSuccessResponse<Discussion[]>>(`/products/${productId}/discussions`);
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createDiscussion(productId: string, content: string): Promise<Discussion> {
  try {
    const res = await api.post<ApiSuccessResponse<Discussion>>(`/products/${productId}/discussions`, { content });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteDiscussion(productId: string, discussionId: string): Promise<void> {
  try {
    await api.delete(`/products/${productId}/discussions/${discussionId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function toggleDiscussionLike(productId: string, discussionId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const res = await api.post<ApiSuccessResponse<{ liked: boolean; likesCount: number }>>(
      `/products/${productId}/discussions/${discussionId}/like`
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createReply(productId: string, discussionId: string, content: string): Promise<DiscussionReply> {
  try {
    const res = await api.post<ApiSuccessResponse<DiscussionReply>>(
      `/products/${productId}/discussions/${discussionId}/replies`,
      { content }
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function toggleReplyLike(productId: string, replyId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const res = await api.post<ApiSuccessResponse<{ liked: boolean; likesCount: number }>>(
      `/products/${productId}/discussions/replies/${replyId}/like`
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
