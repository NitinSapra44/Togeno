import api, { ApiSuccessResponse, getErrorMessage } from './api';
export interface Product {
  id: string;
  brandId: string;
  communityId?: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stockQuantity: number;
  status: 'draft' | 'active' | 'inactive';
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  // Joined data
  images?: ProductImage[];
  brand?: {
    id: string;
    brandName: string;
    logoUrl: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ============================================
// Products API
// ============================================

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  featured?: boolean;
  search?: string;
  communityIds?: string[];
}): Promise<PaginatedResponse<Product>> {
  try {
    const { communityIds, ...rest } = params || {};
    const queryParams = {
      ...rest,
      ...(communityIds && communityIds.length > 0 ? { communityIds: communityIds.join(',') } : {}),
    };
    const response = await api.get<ApiSuccessResponse<PaginatedResponse<Product>>>('/products', { params: queryParams });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await api.get<ApiSuccessResponse<Product>>(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    const response = await api.get<ApiSuccessResponse<Product>>(`/products/slug/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  try {
    const response = await api.get<ApiSuccessResponse<PaginatedResponse<Product>>>('/products', {
      params: { featured: true, limit: limit || 10 }
    });
    return response.data.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export interface CreateProductData {
  name: string;
  slug?: string;
  categoryId: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity?: number;
  status?: 'draft' | 'active' | 'inactive';
  isFeatured?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateProductData {
  name?: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity?: number;
  status?: 'draft' | 'active' | 'inactive';
  isFeatured?: boolean;
  metadata?: Record<string, unknown>;
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  try {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const response = await api.post<ApiSuccessResponse<Product>>('/products', { ...data, slug });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProduct(id: string, data: UpdateProductData): Promise<Product> {
  try {
    const response = await api.patch<ApiSuccessResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  try {
    await api.delete(`/products/${productId}/images/${imageId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProductImage(
  productId: string,
  imageId: string,
  data: { isPrimary?: boolean; altText?: string; displayOrder?: number }
): Promise<ProductImage> {
  try {
    const response = await api.patch<ApiSuccessResponse<ProductImage>>(
      `/products/${productId}/images/${imageId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
