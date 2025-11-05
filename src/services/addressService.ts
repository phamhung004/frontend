import api from './api';
import type { SavedAddress, CreateAddressRequest, UpdateAddressRequest } from '../types/address';

const addressService = {
  /**
   * Get all saved addresses for a user
   */
  getUserAddresses: async (userId: number): Promise<SavedAddress[]> => {
    const response = await api.get(`/addresses`, {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Get a specific address by ID
   */
  getAddressById: async (addressId: number, userId: number): Promise<SavedAddress> => {
    const response = await api.get(`/addresses/${addressId}`, {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Get the default address for a user
   */
  getDefaultAddress: async (userId: number): Promise<SavedAddress | null> => {
    try {
      const response = await api.get(`/addresses/default`, {
        params: { userId },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new saved address
   */
  createAddress: async (userId: number, data: CreateAddressRequest): Promise<SavedAddress> => {
    const response = await api.post(`/addresses`, data, {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Update an existing address
   */
  updateAddress: async (
    addressId: number,
    userId: number,
    data: UpdateAddressRequest
  ): Promise<SavedAddress> => {
    const response = await api.put(`/addresses/${addressId}`, data, {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Set an address as default
   */
  setDefaultAddress: async (addressId: number, userId: number): Promise<SavedAddress> => {
    const response = await api.patch(`/addresses/${addressId}/default`, null, {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Delete an address
   */
  deleteAddress: async (addressId: number, userId: number): Promise<void> => {
    await api.delete(`/addresses/${addressId}`, {
      params: { userId },
    });
  },
};

export default addressService;
