import prisma from '@/lib/prisma';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export async function getActiveStorefrontConfig() {
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const branchConfig = await prisma.storeConfig.findFirst({
    where: { businessId: business.id, branchId: activeBranch.id },
    select: { templateKey: true, themeConfig: true },
  });
  const businessConfig = branchConfig ? null : await prisma.storeConfig.findFirst({
    where: { businessId: business.id, branchId: null },
    select: { templateKey: true, themeConfig: true },
  });
  const config = branchConfig ?? businessConfig;
  const configTheme = config?.themeConfig;
  const fallbackTheme = activeBranch.brandColors ?? business.brandColors;
  const theme = (configTheme && typeof configTheme === 'object' && !Array.isArray(configTheme))
    ? configTheme as Record<string, unknown>
    : (fallbackTheme && typeof fallbackTheme === 'object' && !Array.isArray(fallbackTheme)
      ? fallbackTheme as Record<string, unknown>
      : {});
  const color = (value: unknown, fallback: string) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  return {
    templateKey: config?.templateKey || 'classic',
    theme: {
      primary: color(theme.primary, '#475569'),
      secondary: color(theme.secondary, '#e2e8f0'),
      accent: color(theme.accent, '#0f172a'),
    },
  };
}
