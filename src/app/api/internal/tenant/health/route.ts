import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { failure, success, verifyInternalRequestHeaders } from '@/lib/zaiko-contracts';

export async function GET(request: Request) {
  const context = await verifyInternalRequestHeaders(request.headers, process.env.ZAIKO_INTERNAL_SECRET || '');
  if (!context) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Firma interna inválida' } }, { status: 403 });
  try {
    const business = await prisma.business.findUnique({ where: { id: context.businessId }, select: { id: true, name: true, isActive: true, storefrontDomain: true } });
    if (!business) return NextResponse.json(failure('NOT_FOUND', 'Negocio no encontrado', context), { status: 404 });
    const [branches, products, orders] = await Promise.all([
      prisma.branch.count({ where: { businessId: context.businessId, ecommerceCode: { not: null } } }),
      prisma.product.count({ where: { businessId: context.businessId, active: true, availableChannels: { in: ['ECOMMERCE', 'BOTH'] } } }),
      prisma.order.count({ where: { businessId: context.businessId, source: 'ONLINE' } }),
    ]);
    return NextResponse.json(success({ business, counts: { branches, products, onlineOrders: orders }, channel: 'ECOMMERCE' }, context));
  } catch (error) {
    console.error('[INTERNAL_ECOMMERCE_HEALTH]', error);
    return NextResponse.json(failure('INTERNAL_ERROR', 'No se pudo consultar el estado del ecommerce', context), { status: 500 });
  }
}
