import api from './api';
import type { ActiveDiscountSummary } from '../types/discountCampaign';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productSlug: string;
  variantId?: number;
  variantName?: string;
  variantImage?: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  stockQuantity: number;
  activeDiscount?: ActiveDiscountSummary | null;
}

export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  originalSubtotal: number;
  discountTotal: number;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

const cartService = {
  // Get cart
  getCart: async (userId?: number, sessionId?: string): Promise<Cart> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await api.get(`/cart?${params.toString()}`);
    return response.data;
  },

  // Add item to cart
  addToCart: async (
    request: AddToCartRequest,
    userId?: number,
    sessionId?: string
  ): Promise<Cart> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await api.post(`/cart/items?${params.toString()}`, request);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (
    cartItemId: number,
    request: UpdateCartItemRequest
  ): Promise<Cart> => {
    const response = await api.put(`/cart/items/${cartItemId}`, request);
    return response.data;
  },

  // Remove item from cart
  removeCartItem: async (cartItemId: number): Promise<Cart> => {
    const response = await api.delete(`/cart/items/${cartItemId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (userId?: number, sessionId?: string): Promise<void> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (sessionId) params.append('sessionId', sessionId);
    
    await api.delete(`/cart?${params.toString()}`);
  },

  // Merge guest cart with user cart on login
  mergeCart: async (userId: number, sessionId: string): Promise<Cart> => {
    const params = new URLSearchParams();
    params.append('userId', userId.toString());
    params.append('sessionId', sessionId);
    
    const response = await api.post(`/cart/merge?${params.toString()}`);
    return response.data;
  },
};

export default cartService;
