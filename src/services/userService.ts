import api from './api';
import type { AdminUser, UpdateUserPayload } from '../types/user';
import { getSupabaseClient } from './supabaseClient';

export interface ProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
}

const userService = {
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  
  updateUser: async (userId: number, payload: UpdateUserPayload): Promise<AdminUser> => {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data;
  },

  /**
   * Get current user profile from backend
   */
  getCurrentProfile: async (authUserId: string): Promise<AdminUser> => {
    const response = await api.get(`/users/auth/${authUserId}`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (authUserId: string, data: ProfileUpdateRequest): Promise<AdminUser> => {
    const response = await api.put(`/users/auth/${authUserId}`, {
      authUserId,
      fullName: data.fullName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
    });
    return response.data;
  },

  /**
   * Upload avatar to Supabase Storage
   */
  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Validate file
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 1MB');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG and PNG files are allowed');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload avatar');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  /**
   * Delete old avatar from storage
   */
  deleteAvatar: async (avatarUrl: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (!supabase || !avatarUrl) return;

    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/user-avatars/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      
      await supabase.storage
        .from('user-avatars')
        .remove([`avatars/${filePath}`]);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      // Don't throw error, just log it
    }
  },
};

export default userService;
