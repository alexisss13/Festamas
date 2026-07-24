import { isChargeApproved, extractOrderId } from '@/lib/culqi-charge';

describe('culqi charge — decisión de aprobación', () => {
  it('aprueba cuando paid=true', () => {
    expect(isChargeApproved({ paid: true })).toBe(true);
  });

  it('aprueba cuando status="paid"', () => {
    expect(isChargeApproved({ status: 'paid' })).toBe(true);
  });

  it('aprueba cuando outcome.type="venta_exitosa"', () => {
    expect(isChargeApproved({ outcome: { type: 'venta_exitosa' } })).toBe(true);
  });

  it('rechaza cargos sin ninguna señal de aprobación', () => {
    expect(isChargeApproved({ paid: false, status: 'declined', outcome: { type: 'venta_rechazada' } })).toBe(false);
  });

  it('rechaza charge null/undefined sin lanzar', () => {
    expect(isChargeApproved(null)).toBe(false);
    expect(isChargeApproved(undefined)).toBe(false);
  });
});

describe('culqi charge — extracción de orderId', () => {
  it('prioriza el order_id del cargo confirmado sobre el del body del webhook', () => {
    const orderId = extractOrderId({ metadata: { order_id: 'from-charge' } }, { order_id: 'from-webhook-body' });
    expect(orderId).toBe('from-charge');
  });

  it('cae al metadata del body si el cargo no trae order_id', () => {
    const orderId = extractOrderId({}, { order_id: 'from-webhook-body' });
    expect(orderId).toBe('from-webhook-body');
  });

  it('devuelve undefined si ninguno trae order_id', () => {
    expect(extractOrderId({}, {})).toBeUndefined();
    expect(extractOrderId(null, undefined)).toBeUndefined();
  });
});
