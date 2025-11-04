export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: number;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CouponRequest {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

export interface CouponApplyPayload {
  code: string;
  userId?: number;
  sessionId?: string;
}

export interface CouponApplyResponse {
  couponId?: number | null;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean | null;
  subtotal: number;
  discountAmount: number;
  totalAfterDiscount: number;
}
