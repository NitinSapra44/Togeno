import api, { ApiSuccessResponse, getErrorMessage } from './api';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  coverImageUrl: string | null;
  categoryId: string;
  memberCount: number;
  expertCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isMember?: boolean;
  category?: { name: string };
  creator?: { id: string; full_name: string | null; email: string };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function getCommunities(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  mine?: boolean;
}): Promise<PaginatedResponse<Community>> {
  try {
    const response = await api.get<ApiSuccessResponse<PaginatedResponse<Community>>>('/communities', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getCommunityById(id: string): Promise<Community> {
  try {
    const response = await api.get<ApiSuccessResponse<Community>>(`/communities/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getCommunityBySlug(slug: string): Promise<Community> {
  try {
    const response = await api.get<ApiSuccessResponse<Community>>(`/communities/slug/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export interface CreateCommunityData {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  categoryId: string;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  isActive?: boolean;
}

export async function createCommunity(data: CreateCommunityData): Promise<Community> {
  try {
    const response = await api.post<ApiSuccessResponse<Community>>('/communities', data);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateCommunity(id: string, data: UpdateCommunityData): Promise<Community> {
  try {
    const response = await api.patch<ApiSuccessResponse<Community>>(`/communities/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteCommunity(id: string): Promise<void> {
  try {
    await api.delete(`/communities/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function joinCommunity(id: string, isExpert: boolean = false): Promise<void> {
  try {
    await api.post(`/communities/${id}/join`, { isExpert });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function leaveCommunity(id: string): Promise<void> {
  try {
    await api.delete(`/communities/${id}/leave`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  isExpert: boolean;
  joinedAt: string;
  user?: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export async function getCommunityMembers(id: string, params?: { isExpert?: boolean; page?: number; limit?: number }): Promise<{ data: CommunityMember[]; pagination: any }> {
  try {
    const response = await api.get<ApiSuccessResponse<any>>(`/communities/${id}/members`, { params });
    const raw = response.data.data;
    const data: CommunityMember[] = (raw.data ?? []).map((item: any) => ({
      id: item.member.id,
      userId: item.member.userId,
      communityId: item.member.communityId,
      isExpert: item.member.isExpert,
      joinedAt: item.member.joinedAt,
      user: item.profile
        ? {
            id: item.profile.id,
            fullName: item.profile.full_name,
            email: item.profile.email,
            avatarUrl: item.profile.avatar_url,
          }
        : undefined,
    }));
    return { data, pagination: raw.pagination };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getJoinedCommunities(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<{ membership: CommunityMember; community: Community }>> {
  try {
    const response = await api.get<ApiSuccessResponse<PaginatedResponse<{ membership: CommunityMember; community: Community }>>>('/users/me/communities', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// ============================================
// Categories API
// ============================================

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<ApiSuccessResponse<Category[]>>('/communities/categories');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
