import type { ActiveDiscountSummary } from './discountCampaign';

export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'PDF';

export interface Product {
  id: number;
  categoryId: number | null;
  categoryName?: string | null;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  regularPrice: number;
  salePrice?: number | null;
  basePrice?: number | null;
  finalPrice?: number | null;
  discountAmount?: number | null;
  activeDiscount?: ActiveDiscountSummary | null;
  badgeLabel?: string | null;
  thumbnailUrl?: string | null;
  stockQuantity: number;
  isPublished: boolean;
  landingPageEnabled?: boolean;
  productType?: ProductType;
  fileUrl?: string | null;
  fileSize?: string | null;
  pageCount?: number | null;
  fileFormat?: string | null;
  isDownloadable?: boolean;
  requiresLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductMedia {
  id?: number;
  productId?: number;
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface ProductVariant {
  id?: number;
  productId?: number;
  productName?: string | null;
  name: string;
  sku?: string | null;
  price?: number | null;
  basePrice?: number | null;
  finalPrice?: number | null;
  discountAmount?: number | null;
  activeDiscount?: ActiveDiscountSummary | null;
  stockQuantity: number;
  imageUrl?: string | null;
  attributes?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetail extends Product {
  media?: ProductMedia[];
  variants?: ProductVariant[];
}

export interface ProductRequest {
  categoryId: number | null;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  regularPrice: number;
  salePrice?: number | null;
  badgeLabel?: string | null;
  thumbnailUrl?: string | null;
  stockQuantity: number;
  isPublished: boolean;
  landingPageEnabled?: boolean;
  productType?: ProductType;
  fileUrl?: string | null;
  fileSize?: string | null;
  pageCount?: number | null;
  fileFormat?: string | null;
  isDownloadable?: boolean;
  requiresLogin?: boolean;
  media?: ProductMedia[];
  variants?: ProductVariant[];
}

export interface ProductFormMedia {
  id?: number;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
  previewUrl?: string | null;
  isUploading?: boolean;
  sourceVariantKey?: string;
}

export interface ProductFormVariant {
  id?: number;
  clientId: string;
  name: string;
  sku: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
  attributes: string;
  previewUrl?: string | null;
  isUploading?: boolean;
}

export interface ProductFormData {
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  regularPrice: string;
  salePrice: string;
  badgeLabel: string;
  thumbnailUrl: string;
  stockQuantity: string;
  isPublished: boolean;
  landingPageEnabled: boolean;
  productType: ProductType;
  fileUrl: string;
  fileSize: string;
  pageCount: string;
  fileFormat: string;
  isDownloadable: boolean;
  requiresLogin: boolean;
  media: ProductFormMedia[];
  variants: ProductFormVariant[];
}
