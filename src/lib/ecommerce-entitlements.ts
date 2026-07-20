import prisma from '@/lib/prisma';

export async function canBusinessUseEcommerce(businessId: string) {
  if (process.env.SAAS_ENTITLEMENTS_ENABLED !== 'true') return true;
  const now = new Date();
  const override = await prisma.tenantEntitlement.findUnique({
    where: { businessId_featureKey: { businessId, featureKey: 'ecommerce.store' } },
  });
  if (override && override.startsAt <= now && (!override.endsAt || override.endsAt >= now)) return override.enabled;

  const subscription = await prisma.subscription.findFirst({
    where: { businessId, status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] }, currentPeriodStart: { lte: now }, currentPeriodEnd: { gte: now } },
    orderBy: { createdAt: 'desc' },
    include: { plan: { include: { features: { where: { featureKey: 'ecommerce.store' } } } } },
  });
  return subscription?.plan.features[0]?.enabled === true;
}
