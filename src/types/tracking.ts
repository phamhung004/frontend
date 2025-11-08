/**
 * Product tracking types for frontend
 */

export type TrackingEventType = 'VIEW' | 'CLICK' | 'ADD_TO_CART' | 'PURCHASE' | 'TIME_SPENT';

export interface ProductTrackingEventRequest {
  productId: number;
  variantId?: number;
  sessionId?: string;
  eventType: TrackingEventType;
  eventData?: Record<string, any>;
  timeSpentSeconds?: number;
  referrerUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  count: number;
  eventType: string;
}

export interface ReferrerData {
  referrerUrl: string;
  count: number;
}

export interface VariantStats {
  variantId: number;
  variantName: string;
  views: number;
  clicks: number;
  purchases: number;
}

export interface ProductTrackingStats {
  productId: number;
  productName: string;
  totalViews: number;
  totalClicks: number;
  totalAddToCarts: number;
  totalPurchases: number;
  uniqueViewers: number;
  averageTimeSpent: number;
  totalTimeSpent: number;
  conversionRate: number;
  addToCartRate: number;
  clickThroughRate: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  hourlyData?: TimeSeriesData[];
  dailyData?: TimeSeriesData[];
  eventBreakdown?: Record<string, number>;
  topReferrers?: ReferrerData[];
  variantStats?: VariantStats[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  productSlug: string;
  thumbnailUrl: string;
  eventCount: number;
}
