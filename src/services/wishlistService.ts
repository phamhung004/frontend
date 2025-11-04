import api from './api';

export interface WishlistItem {
  id: number;
  userId: number;
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    regularPrice: number;
    salePrice: number | null;
    badgeLabel: string | null;
    thumbnailUrl: string | null;
    stockQuantity: number;
    isPublished: boolean;
    categoryId: number;
    categoryName: string;
  };
  createdAt: string;
}

class WishlistService {
  /**
   * Get all wishlist items for a user
   */
  async getUserWishlist(userId: number): Promise<WishlistItem[]> {
    try {
      const response = await api.get(`/wishlist?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  /**
   * Add a product to wishlist
   */
  async addToWishlist(userId: number, productId: number): Promise<WishlistItem> {
    try {
      const response = await api.post('/wishlist', {
        userId,
        productId,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  /**
   * Remove a product from wishlist
   */
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    try {
      await api.delete(`/wishlist?userId=${userId}&productId=${productId}`);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  /**
   * Check if a product is in wishlist
   */
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    try {
      const response = await api.get(`/wishlist/check?userId=${userId}&productId=${productId}`);
      return response.data.isInWishlist;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  /**
   * Get wishlist count for a user
   */
  async getWishlistCount(userId: number): Promise<number> {
    try {
      const response = await api.get(`/wishlist/count?userId=${userId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }

  /**
   * Toggle wishlist status (add if not in wishlist, remove if already in)
   */
  async toggleWishlist(userId: number, productId: number): Promise<boolean> {
    try {
      const isInWishlist = await this.isInWishlist(userId, productId);
      if (isInWishlist) {
        await this.removeFromWishlist(userId, productId);
        return false; // Removed from wishlist
      } else {
        await this.addToWishlist(userId, productId);
        return true; // Added to wishlist
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  }
}

export const wishlistService = new WishlistService();
