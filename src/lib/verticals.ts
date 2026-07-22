/** Configuración central de verticales del storefront. */
export const VERTICAL_KEYS = ['RETAIL', 'RESTAURANT', 'SERVICES', 'QUOTES'] as const;
export type VerticalKey = (typeof VERTICAL_KEYS)[number];
export type StoredVerticalKey = VerticalKey | 'COMMERCE' | 'PROFESSIONALS';

export const VERTICAL_MODULES = [
  'catalog', 'checkout', 'orders', 'restaurant.tables', 'restaurant.kitchen',
  'services.appointments', 'services.quotes',
] as const;
export type VerticalModule = (typeof VERTICAL_MODULES)[number];

export type VerticalDefinition = {
  key: VerticalKey;
  label: string;
  catalogLabel: string;
  modules: readonly VerticalModule[];
};

const DEFINITIONS: Record<VerticalKey, VerticalDefinition> = {
  RETAIL: { key: 'RETAIL', label: 'Retail', catalogLabel: 'Productos', modules: ['catalog', 'checkout', 'orders'] },
  RESTAURANT: { key: 'RESTAURANT', label: 'Restaurante', catalogLabel: 'Menú', modules: ['catalog', 'checkout', 'orders', 'restaurant.tables', 'restaurant.kitchen'] },
  SERVICES: { key: 'SERVICES', label: 'Servicios', catalogLabel: 'Servicios', modules: ['catalog', 'checkout', 'orders', 'services.appointments'] },
  QUOTES: { key: 'QUOTES', label: 'Cotizaciones', catalogLabel: 'Servicios y productos', modules: ['catalog', 'orders', 'services.quotes'] },
};

export function normalizeVerticalKey(value: string | null | undefined): VerticalKey {
  switch (value) {
    case 'RESTAURANT': return 'RESTAURANT';
    case 'SERVICES':
    case 'PROFESSIONALS': return 'SERVICES';
    case 'QUOTES': return 'QUOTES';
    case 'RETAIL':
    case 'COMMERCE':
    default: return 'RETAIL';
  }
}

export function getVerticalDefinition(value: string | null | undefined): VerticalDefinition {
  return DEFINITIONS[normalizeVerticalKey(value)];
}

export function verticalSupports(value: string | null | undefined, module: VerticalModule): boolean {
  return getVerticalDefinition(value).modules.includes(module);
}
