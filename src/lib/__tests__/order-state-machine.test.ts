import { canTransitionOrder } from '@/lib/order-state-machine';

describe('order state machine', () => {
  it('allows the normal paid-to-delivery flow', () => {
    expect(canTransitionOrder('PENDING', 'PAID')).toBe(true);
    expect(canTransitionOrder('PAID', 'PROCESSING')).toBe(true);
    expect(canTransitionOrder('PROCESSING', 'SHIPPED')).toBe(true);
    expect(canTransitionOrder('SHIPPED', 'DELIVERED')).toBe(true);
  });

  it('rejects dangerous backwards transitions', () => {
    expect(canTransitionOrder('PAID', 'PENDING')).toBe(false);
    expect(canTransitionOrder('DELIVERED', 'PROCESSING')).toBe(false);
    expect(canTransitionOrder('CANCELLED', 'PAID')).toBe(false);
  });

  it('allows idempotent writes of the current state', () => {
    expect(canTransitionOrder('PROCESSING', 'PROCESSING')).toBe(true);
  });

  it('permite cancelación solo antes de la entrega y nunca reabre estados terminales', () => {
    expect(canTransitionOrder('PENDING', 'CANCELLED')).toBe(true);
    expect(canTransitionOrder('PAID', 'CANCELLED')).toBe(true);
    expect(canTransitionOrder('PROCESSING', 'CANCELLED')).toBe(true);
    expect(canTransitionOrder('SHIPPED', 'CANCELLED')).toBe(true);
    expect(canTransitionOrder('READY_FOR_PICKUP', 'CANCELLED')).toBe(true);
    expect(canTransitionOrder('DELIVERED', 'CANCELLED')).toBe(false);
    expect(canTransitionOrder('CANCELLED', 'PROCESSING')).toBe(false);
  });

  it('no permite saltar etapas de fulfillment', () => {
    expect(canTransitionOrder('PENDING', 'PROCESSING')).toBe(false);
    expect(canTransitionOrder('PENDING', 'SHIPPED')).toBe(false);
    expect(canTransitionOrder('PAID', 'DELIVERED')).toBe(false);
    expect(canTransitionOrder('READY_FOR_PICKUP', 'SHIPPED')).toBe(false);
  });
});
