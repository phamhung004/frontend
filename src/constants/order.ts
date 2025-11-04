export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];
