import type { Product } from '../types/product';

const STORAGE_KEY = 'productComparison';
const MAX_COMPARE_ITEMS = 4;

// Helper to trigger UI updates
const triggerUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('comparisonUpdated'));
  }
};

const productComparisonService = {
  // Add a product to comparison
  addProduct: (product: Product): boolean => {
    try {
      const products = productComparisonService.getProducts();
      
      // Check if already exists
      if (products.some(p => p.id === product.id)) {
        return false;
      }

      // Check max limit
      if (products.length >= MAX_COMPARE_ITEMS) {
        throw new Error(`Chỉ có thể so sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm`);
      }

      products.push(product);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      triggerUpdate();
      return true;
    } catch (error) {
      console.error('Error adding to comparison:', error);
      throw error;
    }
  },

  // Get all products in comparison
  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting comparison products:', error);
      return [];
    }
  },

  // Remove a product from comparison
  removeProduct: (productId: number): void => {
    try {
      const products = productComparisonService.getProducts();
      const filtered = products.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      triggerUpdate();
    } catch (error) {
      console.error('Error removing from comparison:', error);
    }
  },

  // Check if product is in comparison
  isInComparison: (productId: number): boolean => {
    const products = productComparisonService.getProducts();
    return products.some(p => p.id === productId);
  },

  // Clear all comparison products
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      triggerUpdate();
    } catch (error) {
      console.error('Error clearing comparison:', error);
    }
  },

  // Get count of products in comparison
  getCount: (): number => {
    return productComparisonService.getProducts().length;
  },

  // Check if can add more products
  canAddMore: (): boolean => {
    return productComparisonService.getCount() < MAX_COMPARE_ITEMS;
  }
};

export default productComparisonService;
export { MAX_COMPARE_ITEMS };
