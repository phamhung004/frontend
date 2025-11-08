import api from './api';
import type { 
  ProductTrackingEventRequest, 
  ProductTrackingStats,
  TopProduct 
} from '../types/tracking';

/**
 * Service for tracking product events
 */
class ProductTrackingService {
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Get or create a session ID for anonymous tracking
   */
  private getOrCreateSessionId(): string {
    const storageKey = 'tracking_session_id';
    let sessionId = sessionStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Track a product event
   */
  async trackEvent(request: Omit<ProductTrackingEventRequest, 'sessionId' | 'userAgent' | 'referrerUrl'>): Promise<void> {
    try {
      const payload: ProductTrackingEventRequest = {
        ...request,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        referrerUrl: document.referrer || undefined,
      };

      await api.post('/tracking/event', payload);
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track product view
   */
  async trackView(productId: number, variantId?: number, eventData?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      productId,
      variantId,
      eventType: 'VIEW',
      eventData,
    });
  }

  /**
   * Track product click
   */
  async trackClick(productId: number, variantId?: number, eventData?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      productId,
      variantId,
      eventType: 'CLICK',
      eventData,
    });
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(productId: number, variantId?: number, eventData?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      productId,
      variantId,
      eventType: 'ADD_TO_CART',
      eventData,
    });
  }

  /**
   * Track time spent on product page
   */
  async trackTimeSpent(productId: number, timeSpentSeconds: number, variantId?: number): Promise<void> {
    return this.trackEvent({
      productId,
      variantId,
      eventType: 'TIME_SPENT',
      timeSpentSeconds,
    });
  }

  /**
   * Get product tracking statistics
   */
  async getProductStats(
    productId: number,
    startDate?: string,
    endDate?: string
  ): Promise<ProductTrackingStats> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get(`/tracking/stats/${productId}`, { params });
    return response.data;
  }

  /**
   * Get top products by event type
   */
  async getTopProducts(eventType: string = 'VIEW', limit: number = 10): Promise<TopProduct[]> {
    const response = await api.get('/tracking/top-products', {
      params: { eventType, limit },
    });
    return response.data;
  }

  /**
   * Create a time tracker for a product page
   * Returns a cleanup function to call when leaving the page
   */
  createTimeTracker(productId: number, variantId?: number): () => void {
    const startTime = Date.now();
    let tracked = false;

    const trackTime = async () => {
      if (tracked) return;
      tracked = true;

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Only track if user spent at least 3 seconds
      if (timeSpent >= 3) {
        await this.trackTimeSpent(productId, timeSpent, variantId);
      }
    };

    // Track on page unload
    const handleUnload = () => {
      if (!tracked) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        if (timeSpent >= 3) {
          // Use sendBeacon for reliable tracking on page unload
          const payload = JSON.stringify({
            productId,
            variantId,
            eventType: 'TIME_SPENT',
            timeSpentSeconds: timeSpent,
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            referrerUrl: document.referrer || undefined,
          });

          navigator.sendBeacon(`${api.defaults.baseURL}/tracking/event`, payload);
        }
      }
    };

    // Track on visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackTime();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackTime();
    };
  }
}

export default new ProductTrackingService();
