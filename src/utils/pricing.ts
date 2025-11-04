import type { Product, ProductVariant } from '../types/product';
import type { ActiveDiscountSummary } from '../types/discountCampaign';

export interface ResolvedPricing {
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercent: number | null;
  hasDiscount: boolean;
  activeDiscount: ActiveDiscountSummary | null;
}

const toNumber = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }
  return null;
};

const EPSILON = 0.005;

export const resolveProductPricing = (
  product: Product,
  variant?: ProductVariant | null
): ResolvedPricing => {
  const variantFinal = toNumber(variant?.finalPrice ?? variant?.price);
  const productFinal = toNumber(product.finalPrice ?? product.salePrice ?? product.regularPrice);
  const finalPrice = variantFinal ?? productFinal ?? 0;

  const variantBase = toNumber(variant?.basePrice ?? variant?.price);
  const productBase = toNumber(product.basePrice ?? product.regularPrice ?? product.salePrice);
  const basePrice = variantBase ?? productBase ?? finalPrice;

  const rawDiscountAmount = toNumber(variant?.discountAmount ?? product.discountAmount);
  const computedDiscount = basePrice - finalPrice;
  const discountAmount = rawDiscountAmount ?? (computedDiscount > 0 ? computedDiscount : 0);

  const hasDiscount = basePrice - finalPrice > EPSILON;
  const discountPercent = hasDiscount && basePrice > 0
    ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
    : null;

  const activeDiscount: ActiveDiscountSummary | null = variant?.activeDiscount
    ?? product.activeDiscount
    ?? null;

  return {
    basePrice,
    finalPrice,
    discountAmount,
    discountPercent,
    hasDiscount,
    activeDiscount,
  };
};
