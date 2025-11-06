export interface Notification {
  id: number;
  userId: number | null;
  orderId: number | null;
  type: string;
  title: string;
  message: string;
  relatedEntityId: number | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationCreateRequest {
  userId: number | null;
  orderId: number | null;
  type: string;
  title: string;
  message: string;
  relatedEntityId?: number | null;
  actionUrl?: string | null;
}
