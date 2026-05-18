import api, { ApiSuccessResponse, getErrorMessage } from './api';

// ============================================
// Types
// ============================================

export interface AdminStats {
  users: {
    total: number;
    consumers: number;
    experts: number;
    brands: number;
    admins: number;
    pendingExpertApprovals: number;
    pendingBrandApprovals: number;
  };
  products: {
    total: number;
    active: number;
    draft: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    pending: number;
    delivered: number;
  };
  communities: {
    total: number;
    active: number;
  };
  posts: {
    total: number;
    published: number;
  };
  pitches: {
    total: number;
    pending: number;
    accepted: number;
  };
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expert_details?: {
    is_verified: boolean;
    expertise: string[];
    bio: string | null;
    years_of_experience: number | null;
    rating: number;
    total_reviews: number;
  } | null;
  brand_details?: {
    is_verified: boolean;
    brand_name: string;
    business_type: string | null;
    website_url: string | null;
    description: string | null;
    logo_url: string | null;
  } | null;
}

export interface AdminOrderRow {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  created_at: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  stock_quantity: number;
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  created_at: string;
  brand_details: { id: string; brand_name: string } | null;
  categories: { id: string; name: string } | null;
}

export interface AdminCommunityRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  member_count: number;
  expert_count: number;
  created_at: string;
  categories: { id: string; name: string } | null;
  creator: { id: string; full_name: string | null } | null;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number };
}

// ============================================
// API functions
// ============================================

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await api.get<ApiSuccessResponse<AdminStats>>('/admin/stats');
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminUsers(params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminUserRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminUserRow>>>('/admin/users', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminPendingBrands(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminUserRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminUserRow>>>('/admin/brands/pending', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminPendingExperts(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminUserRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminUserRow>>>('/admin/experts/pending', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminBrands(params?: {
  verified?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminUserRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminUserRow>>>('/admin/brands', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminExperts(params?: {
  verified?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminUserRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminUserRow>>>('/admin/experts', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminOrderRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminOrderRow>>>('/admin/orders', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminProducts(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminProductRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminProductRow>>>('/admin/products', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdminCommunities(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<AdminCommunityRow>> {
  try {
    const res = await api.get<ApiSuccessResponse<PaginatedResult<AdminCommunityRow>>>('/admin/communities', { params });
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function adminVerifyUser(userId: string, approved: boolean): Promise<void> {
  try {
    await api.post(`/admin/users/${userId}/verify`, { approved });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function adminToggleUserActive(userId: string, active: boolean): Promise<void> {
  try {
    await api.patch(`/admin/users/${userId}/active`, { active });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  try {
    await api.delete(`/admin/products/${productId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
