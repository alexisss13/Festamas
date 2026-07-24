import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { STOREFRONT_PREVIEW_COOKIE, type StoreConfigDraft } from '@/lib/store-config-draft';

export async function getActiveStorefrontConfig() {
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const branchConfig = await prisma.storeConfig.findFirst({
    where: { businessId: business.id, branchId: activeBranch.id },
    select: { templateKey: true, themeConfig: true, draftConfig: true },
  });
  const businessConfig = branchConfig ? null : await prisma.storeConfig.findFirst({
    where: { businessId: business.id, branchId: null },
    select: { templateKey: true, themeConfig: true, draftConfig: true },
  });
  const config = branchConfig ?? businessConfig;

  // Vista previa: solo si la cookie está presente Y la sesión actual sigue
  // siendo de un admin con acceso — no basta con que la cookie exista (podría
  // ser vieja, o la sesión pudo cerrarse/perder el permiso desde que se
  // activó). Un cliente real nunca tiene esta cookie ni pasa este chequeo.
  const previewRequested = (await cookies()).get(STOREFRONT_PREVIEW_COOKIE)?.value === '1';
  const draft = previewRequested ? (config?.draftConfig as StoreConfigDraft | null) : null;
  let activeDraft: StoreConfigDraft | null = null;
  if (draft) {
    const session = await auth();
    if (session?.user && canAccessEcommerceAdmin(session.user)) activeDraft = draft;
  }

  const configTheme = activeDraft?.themeConfig ?? config?.themeConfig;
  const fallbackTheme = activeBranch.brandColors ?? business.brandColors;
  const theme = (configTheme && typeof configTheme === 'object' && !Array.isArray(configTheme))
    ? configTheme as Record<string, unknown>
    : (fallbackTheme && typeof fallbackTheme === 'object' && !Array.isArray(fallbackTheme)
      ? fallbackTheme as Record<string, unknown>
      : {});
  const color = (value: unknown, fallback: string) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  return {
    templateKey: activeDraft?.templateKey || config?.templateKey || 'classic',
    theme: {
      primary: color(theme.primary, '#475569'),
      secondary: color(theme.secondary, '#e2e8f0'),
      accent: color(theme.accent, '#0f172a'),
    },
  };
}
