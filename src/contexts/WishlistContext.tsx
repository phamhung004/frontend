import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { wishlistService, type WishlistItem } from '../services/wishlistService';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist when user logs in
  const loadWishlist = useCallback(async () => {
    if (!user?.backendUserId) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const items = await wishlistService.getUserWishlist(user.backendUserId);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.backendUserId]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Check if a product is in wishlist
  const isInWishlist = useCallback((productId: number): boolean => {
    return wishlistItems.some(item => item.product.id === productId);
  }, [wishlistItems]);

  // Add product to wishlist
  const addToWishlist = useCallback(async (productId: number) => {
    if (!user?.backendUserId) {
      throw new Error('User must be logged in to add to wishlist');
    }

    try {
      const newItem = await wishlistService.addToWishlist(user.backendUserId, productId);
      setWishlistItems(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }, [user?.backendUserId]);

  // Remove product from wishlist
  const removeFromWishlist = useCallback(async (productId: number) => {
    if (!user?.backendUserId) {
      throw new Error('User must be logged in to remove from wishlist');
    }

    try {
      await wishlistService.removeFromWishlist(user.backendUserId, productId);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }, [user?.backendUserId]);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (productId: number): Promise<boolean> => {
    if (!user?.backendUserId) {
      throw new Error('User must be logged in to use wishlist');
    }

    try {
      const isAdded = await wishlistService.toggleWishlist(user.backendUserId, productId);
      
      if (isAdded) {
        // Reload wishlist to get the new item with full details
        await loadWishlist();
      } else {
        // Remove from local state
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      }
      
      return isAdded;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  }, [user?.backendUserId, loadWishlist]);

  // Refresh wishlist
  const refreshWishlist = useCallback(async () => {
    await loadWishlist();
  }, [loadWishlist]);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
