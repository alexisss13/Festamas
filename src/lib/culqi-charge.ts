// Lógica pura extraída del webhook de Culqi (src/app/api/webhooks/culqi/route.ts)
// para poder probarla sin mockear fetch/Prisma — el webhook solo la invoca.

export type CulqiChargeData = {
  id?: string;
  object?: string;
  metadata?: { order_id?: string };
  outcome?: { type?: string };
  paid?: boolean;
  status?: string;
};

export function isChargeApproved(charge: CulqiChargeData | null | undefined): boolean {
  return charge?.paid === true || charge?.status === 'paid' || charge?.outcome?.type === 'venta_exitosa';
}

export function extractOrderId(charge: CulqiChargeData | null | undefined, fallbackMetadata?: { order_id?: string }): string | undefined {
  return charge?.metadata?.order_id || fallbackMetadata?.order_id;
}
