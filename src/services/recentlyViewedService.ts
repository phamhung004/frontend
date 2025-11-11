import type { Product } from '../types/product';

const STORAGE_KEY = 'recentlyViewedProducts';
const MAX_ITEMS = 10;

interface RecentProduct {
  id: number;
  name: string;
  thumbnailUrl: string | null;
  regularPrice: number;
  salePrice: number | null;
  finalPrice: number | null;
  categoryName: string | null;
  timestamp: number;
}

const recentlyViewedService = {
  // Add a product to recently viewed
  addProduct: (product: Product): void => {
    try {
      const recentProduct: RecentProduct = {
        id: product.id,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl || null,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice || null,
        finalPrice: product.finalPrice || null,
        categoryName: product.categoryName || null,
        timestamp: Date.now()
      };

      let recentProducts = recentlyViewedService.getProducts();

      // Remove if already exists
      recentProducts = recentProducts.filter(p => p.id !== product.id);

      // Add to beginning
      recentProducts.unshift(recentProduct);

      // Keep only MAX_ITEMS
      if (recentProducts.length > MAX_ITEMS) {
        recentProducts = recentProducts.slice(0, MAX_ITEMS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentProducts));
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  },

  // Get all recently viewed products
  getProducts: (): RecentProduct[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const products: RecentProduct[] = JSON.parse(data);
      
      // Filter out items older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return products.filter(p => p.timestamp > thirtyDaysAgo);
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  },

  // Get product IDs only
  getProductIds: (): number[] => {
    return recentlyViewedService.getProducts().map(p => p.id);
  },

  // Clear all recently viewed
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  },

  // Remove a specific product
  removeProduct: (productId: number): void => {
    try {
      let recentProducts = recentlyViewedService.getProducts();
      recentProducts = recentProducts.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentProducts));
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  }
};

export default recentlyViewedService;
export type { RecentProduct };
