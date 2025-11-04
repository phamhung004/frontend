import api from './api';
import type { Coupon, CouponApplyPayload, CouponApplyResponse, CouponRequest } from '../types/coupon';

export const couponService = {
  getAllCoupons: async (active?: boolean): Promise<Coupon[]> => {
    const params = active === undefined ? undefined : { active };
    const response = await api.get<Coupon[]>('/coupons', { params });
    return response.data;
  },

  getCouponById: async (id: number): Promise<Coupon> => {
    const response = await api.get<Coupon>(`/coupons/${id}`);
    return response.data;
  },

  createCoupon: async (payload: CouponRequest): Promise<Coupon> => {
    const response = await api.post<Coupon>('/coupons', payload);
    return response.data;
  },

  updateCoupon: async (id: number, payload: CouponRequest): Promise<Coupon> => {
    const response = await api.put<Coupon>(`/coupons/${id}`, payload);
    return response.data;
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  },

  applyCoupon: async (payload: CouponApplyPayload): Promise<CouponApplyResponse> => {
    const response = await api.post<CouponApplyResponse>('/coupons/apply', payload);
    return response.data;
  },
};

export default couponService;
