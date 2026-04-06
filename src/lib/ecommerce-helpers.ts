export type LegacyDivision = 'JUGUETERIA' | 'FIESTAS';

export const inferLegacyDivision = (ecommerceCode?: string | null): LegacyDivision => {
  const normalized = (ecommerceCode ?? '').toLowerCase();
  if (normalized.includes('festa')) return 'JUGUETERIA';
  return 'FIESTAS';
};
