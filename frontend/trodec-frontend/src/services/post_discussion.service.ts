import api, { ApiSuccessResponse, getErrorMessage } from './api';

export interface PostDiscussionAuthor {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  role?: string;
}

export interface PostDiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  author?: PostDiscussionAuthor;
  likedByMe?: boolean;
}

export interface PostDiscussion {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  author?: PostDiscussionAuthor;
  replies?: PostDiscussionReply[];
  likedByMe?: boolean;
}

export async function getPostDiscussions(postId: string): Promise<PostDiscussion[]> {
  try {
    const res = await api.get<ApiSuccessResponse<PostDiscussion[]>>(`/posts/${postId}/discussions`);
    return res.data.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
}

export async function createPostDiscussion(postId: string, content: string): Promise<PostDiscussion> {
  try {
    const res = await api.post<ApiSuccessResponse<PostDiscussion>>(`/posts/${postId}/discussions`, { content });
    return res.data.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
}

export async function togglePostDiscussionLike(postId: string, discussionId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const res = await api.post<ApiSuccessResponse<{ liked: boolean; likesCount: number }>>(
      `/posts/${postId}/discussions/${discussionId}/like`
    );
    return res.data.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
}

export async function createPostDiscussionReply(postId: string, discussionId: string, content: string): Promise<PostDiscussionReply> {
  try {
    const res = await api.post<ApiSuccessResponse<PostDiscussionReply>>(
      `/posts/${postId}/discussions/${discussionId}/replies`, { content }
    );
    return res.data.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
}

export async function togglePostDiscussionReplyLike(postId: string, replyId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const res = await api.post<ApiSuccessResponse<{ liked: boolean; likesCount: number }>>(
      `/posts/${postId}/discussions/replies/${replyId}/like`
    );
    return res.data.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
}
