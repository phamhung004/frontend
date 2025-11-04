import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService, { type Cart, type AddToCartRequest } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  sessionId: string;
  addToCart: (request: AddToCartRequest) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to generate session ID
const generateSessionId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const backendUserId = user?.backendUserId;

  // Initialize session ID - use auth user ID if logged in, otherwise generate guest session
  useEffect(() => {
    if (user) {
      setSessionId(`user_${user.id}`);
    } else {
      const storedSessionId = localStorage.getItem('guestSessionId');
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = generateSessionId();
        localStorage.setItem('guestSessionId', newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [user]);

  // Fetch cart on mount and when sessionId changes
  const fetchCart = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      // Use sessionId for both guest and authenticated users
      const fetchedCart = await cartService.getCart(backendUserId, sessionId);
      setCart(fetchedCart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, backendUserId]);

  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId, fetchCart]);

  const addToCart = async (request: AddToCartRequest) => {
    try {
      setLoading(true);
      const updatedCart = await cartService.addToCart(
        request,
        backendUserId,
        sessionId
      );
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      setLoading(true);
      const updatedCart = await cartService.updateCartItem(cartItemId, { quantity });
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      setLoading(true);
      const updatedCart = await cartService.removeCartItem(cartItemId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart(backendUserId, sessionId);
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const getCartItemsCount = () => {
    return cart?.items?.length || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        getCartItemsCount,
        sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
