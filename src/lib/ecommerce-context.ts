import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { createTenantContext, createInternalRequestHeaders } from '@zaiko/contracts';
import { ECOMMERCE_BRANCH_COOKIE } from '@/lib/ecommerce-branch';
const LEGACY_BRANCH_COOKIE = 'festamas_branch_id';

export async function getEcommerceContextFromCookie() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get('x-forwarded-host');
  const rawHost = (forwardedHost ?? requestHeaders.get('host') ?? '').split(',')[0].trim();
  const host = rawHost.replace(/:\d+$/, '').toLowerCase();
  const isLocalHost = host === '' || host === 'localhost' || host === '127.0.0.1';
  const legacyBusinessId = process.env.ECOMMERCE_BUSINESS_ID ?? process.env.NEXT_PUBLIC_BUSINESS_ID;

  // En producción el host debe pertenecer explícitamente a un negocio. La
  // variable legacy queda solo para desarrollo, pruebas locales y despliegues
  // monotenancy ya existentes.
  const business = (!isLocalHost && host)
    ? await prisma.business.findUnique({ where: { storefrontDomain: host } })
    : legacyBusinessId
      ? await prisma.business.findUnique({ where: { id: legacyBusinessId } })
      : null;

  if (!business) {
    throw new Error(isLocalHost
      ? 'Configura ECOMMERCE_BUSINESS_ID para ejecutar el ecommerce localmente'
      : 'No existe un negocio ecommerce activo para el dominio solicitado');
  }

  const businessWithBranches = await prisma.business.findUnique({
    where: { id: business.id },
    include: {
      branches: {
        where: { ecommerceCode: { not: null } },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!businessWithBranches || businessWithBranches.branches.length === 0) {
    throw new Error('No se encontraron sucursales e-commerce para el negocio configurado');
  }

  const cookieStore = await cookies();
  // Se conserva la lectura del nombre histórico solo para no romper sesiones
  // existentes; todas las escrituras nuevas usan la cookie genérica.
  const cookieBranchId = cookieStore.get(ECOMMERCE_BRANCH_COOKIE)?.value
    ?? cookieStore.get(LEGACY_BRANCH_COOKIE)?.value;
  const activeBranch =
    businessWithBranches.branches.find((branch) => branch.id === cookieBranchId) ?? businessWithBranches.branches[0];

  const contractContext = createTenantContext({
    businessId: businessWithBranches.id,
    branchId: activeBranch.id,
    source: 'ECOMMERCE',
    requestId: crypto.randomUUID(),
  });

  return {
    business: businessWithBranches,
    branches: businessWithBranches.branches,
    activeBranch,
    contractContext,
    createInternalHeaders: (secret: string) => createInternalRequestHeaders(contractContext, secret),
  };
}
