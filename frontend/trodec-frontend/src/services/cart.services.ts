import api, { ApiSuccessResponse, getErrorMessage } from './api';
import { Product } from './products.service';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedSize: string | null;
  product?: Product;
  price?: number;
  subtotal?: number;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
  selectedSize?: string | null;
}

export interface UpdateCartItemData {
  quantity: number;
  selectedSize?: string | null;
}

export const CartService = {
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get<ApiSuccessResponse<CartItem[]>>('/products/cart/items');
      return response.data.data ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async addToCart(data: AddToCartData): Promise<CartItem> {
    try {
      const response = await api.post<ApiSuccessResponse<CartItem>>('/products/cart/items', {
        productId: data.productId,
        quantity: data.quantity,
        selectedSize: data.selectedSize ?? null,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateItemQuantity(productId: string, quantity: number, selectedSize?: string | null): Promise<CartItem> {
    try {
      const response = await api.patch<ApiSuccessResponse<CartItem>>(`/products/cart/items/${productId}`, {
        quantity,
        selectedSize: selectedSize ?? null,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async removeItem(productId: string, selectedSize?: string | null): Promise<void> {
    try {
      const params = selectedSize ? { selectedSize } : {};
      await api.delete(`/products/cart/items/${productId}`, { params });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async clearCart(): Promise<void> {
    try {
      await api.delete('/products/cart/items');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default CartService;
