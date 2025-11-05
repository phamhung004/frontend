import api from './api';
import type { DiscountType } from '../types/coupon';

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  country: string;
  postcode: string;
}

export interface CheckoutRequestPayload {
  userId?: number;
  sessionId: string;
  billing: CheckoutAddress;
  shipping?: CheckoutAddress;
  shipToDifferentAddress: boolean;
  createAccount: boolean;
  paymentMethod?: string;
  notes?: string;
  shippingFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  couponCode?: string;
}

export interface CheckoutItemSummary {
  productId?: number;
  variantId?: number;
  productName: string;
  variantName?: string | null;
  thumbnailUrl?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutResponsePayload {
  orderId: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotalAmount: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponId?: number | null;
  couponCode?: string | null;
  couponDiscountType?: DiscountType | null;
  couponDiscountValue?: number | null;
  shipToDifferentAddress: boolean;
  createAccountRequested: boolean;
  billing: CheckoutAddress;
  shipping: CheckoutAddress;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  placedAt?: string;
  items: CheckoutItemSummary[];
}

export interface AdminOrderSummary {
  id: number;
  orderNumber: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  itemsCount: number;
  placedAt?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const orderService = {
  placeOrder: async (payload: CheckoutRequestPayload): Promise<CheckoutResponsePayload> => {
    const response = await api.post('/orders', payload);
    return response.data;
  },
  getOrderSummary: async (orderNumber: string): Promise<CheckoutResponsePayload> => {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
  },
  getUserOrders: async (userId: number): Promise<CheckoutResponsePayload[]> => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },
  getOrders: async (params: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<AdminOrderSummary>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  updateOrderStatus: async (
    orderId: number,
    payload: { status?: string; paymentStatus?: string }
  ): Promise<CheckoutResponsePayload> => {
    const response = await api.patch(`/orders/${orderId}/status`, payload);
    return response.data;
  },
  getOrderDetail: async (orderId: number): Promise<CheckoutResponsePayload> => {
    const response = await api.get(`/orders/detail/${orderId}`);
    return response.data;
  },
};

export default orderService;
