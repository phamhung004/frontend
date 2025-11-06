import api from './api';
import type { Notification, NotificationCreateRequest } from '../types/notification';

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const notificationService = {
  // Get user notifications (paginated)
  getUserNotifications: async (userId: number, page = 0, size = 20): Promise<PagedResponse<Notification>> => {
    const response = await api.get(`/notifications/user/${userId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get unread user notifications
  getUserUnreadNotifications: async (userId: number, page = 0, size = 20): Promise<PagedResponse<Notification>> => {
    const response = await api.get(`/notifications/user/${userId}/unread`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get latest user notifications (for dropdown)
  getLatestUserNotifications: async (userId: number): Promise<Notification[]> => {
    const response = await api.get(`/notifications/user/${userId}/latest`);
    return response.data;
  },

  // Get unread count for user
  getUserUnreadCount: async (userId: number): Promise<number> => {
    const response = await api.get(`/notifications/user/${userId}/unread-count`);
    return response.data.unreadCount;
  },

  // Get admin notifications (paginated)
  getAdminNotifications: async (page = 0, size = 20): Promise<PagedResponse<Notification>> => {
    const response = await api.get('/notifications/admin', {
      params: { page, size }
    });
    return response.data;
  },

  // Get unread admin notifications
  getAdminUnreadNotifications: async (page = 0, size = 20): Promise<PagedResponse<Notification>> => {
    const response = await api.get('/notifications/admin/unread', {
      params: { page, size }
    });
    return response.data;
  },

  // Get latest admin notifications (for dropdown)
  getLatestAdminNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/admin/latest');
    return response.data;
  },

  // Get unread count for admin
  getAdminUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/admin/unread-count');
    return response.data.unreadCount;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all user notifications as read
  markAllUserNotificationsAsRead: async (userId: number): Promise<void> => {
    await api.put(`/notifications/user/${userId}/read-all`);
  },

  // Mark all admin notifications as read
  markAllAdminNotificationsAsRead: async (): Promise<void> => {
    await api.put('/notifications/admin/read-all');
  },

  // Delete a notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Create a notification (for testing)
  createNotification: async (data: NotificationCreateRequest): Promise<Notification> => {
    const response = await api.post('/notifications', data);
    return response.data;
  }
};
