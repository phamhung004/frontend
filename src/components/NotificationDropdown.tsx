import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  CheckIcon, 
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationDropdownProps {
  isAdmin?: boolean;
}

const NotificationDropdown = ({ isAdmin = false }: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} day ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notificationId: number, actionUrl: string | null, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
    
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    // Return different icons based on notification type
    switch (type) {
      case 'ORDER_CREATED':
      case 'ORDER_CONFIRMED':
      case 'ORDER_PROCESSING':
        return '📦';
      case 'ORDER_SHIPPED':
        return '🚚';
      case 'ORDER_DELIVERED':
        return '✅';
      case 'ORDER_CANCELLED':
      case 'ORDER_RETURNED':
        return '❌';
      case 'PAYMENT_RECEIVED':
        return '💰';
      case 'PAYMENT_FAILED':
        return '⚠️';
      case 'LOW_STOCK':
        return '📉';
      case 'NEW_REVIEW':
        return '⭐';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-1 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellIcon className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red rounded-full text-white text-[10px] flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({unreadCount} new)
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-brand-purple hover:text-brand-orange transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-purple-50 ${
                      !notification.isRead ? 'border-l-2 border-brand-purple bg-purple-25' : 'bg-white'
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.actionUrl, notification.isRead)}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-brand-purple transition-colors"
                          title="Mark as read"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      {notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-brand-purple rounded-full"></div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(isAdmin ? '/admin/notifications' : '/account/notifications');
                  }}
                  className="w-full text-center text-xs text-brand-purple hover:text-brand-orange font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
