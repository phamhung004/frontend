import type { DiscountType } from './coupon';

export interface CampaignProduct {
  id: number;
  name: string;
  sku?: string | null;
  thumbnailUrl?: string | null;
}

export interface CampaignVariant {
  id: number;
  productId: number;
  productName?: string | null;
  name: string;
  sku?: string | null;
}

export interface ActiveDiscountSummary {
  campaignId: number;
  campaignName: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  discountAmount: number;
  finalPrice: number;
  variantLevel: boolean;
}

export interface DiscountCampaign {
  id: number;
  name: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  products: CampaignProduct[];
  variants: CampaignVariant[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DiscountCampaignRequest {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  productIds: number[];
  variantIds: number[];
}
