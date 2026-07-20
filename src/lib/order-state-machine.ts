import type { OrderStatus } from '@prisma/client';

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'READY_FOR_PICKUP', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  READY_FOR_PICKUP: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return from === to || ALLOWED_ORDER_TRANSITIONS[from].includes(to);
}
