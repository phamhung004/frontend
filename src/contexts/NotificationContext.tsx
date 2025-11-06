import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  isAdmin?: boolean;
  pollingInterval?: number; // in milliseconds, default 30 seconds
}

export const NotificationProvider = ({ 
  children, 
  isAdmin = false,
  pollingInterval = 30000 
}: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<number | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user && !isAdmin) return;

    try {
      setLoading(true);
      
      if (isAdmin) {
        const [latestNotifs, count] = await Promise.all([
          notificationService.getLatestAdminNotifications(),
          notificationService.getAdminUnreadCount()
        ]);
        setNotifications(latestNotifs);
        setUnreadCount(count);
      } else if (user) {
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        const [latestNotifs, count] = await Promise.all([
          notificationService.getLatestUserNotifications(userId),
          notificationService.getUserUnreadCount(userId)
        ]);
        setNotifications(latestNotifs);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user && !isAdmin) return;

    try {
      if (isAdmin) {
        await notificationService.markAllAdminNotificationsAsRead();
      } else if (user) {
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        await notificationService.markAllUserNotificationsAsRead(userId);
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          isRead: true, 
          readAt: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, isAdmin]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => {
        const deletedNotif = prev.find(n => n.id === notificationId);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(notif => notif.id !== notificationId);
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch and setup polling
  useEffect(() => {
    // Fetch immediately
    fetchNotifications();

    // Setup polling
    if (pollingInterval > 0) {
      pollingRef.current = setInterval(fetchNotifications, pollingInterval);
    }

    // Cleanup
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchNotifications, pollingInterval]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
