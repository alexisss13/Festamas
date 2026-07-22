import { getVerticalDefinition, normalizeVerticalKey, verticalSupports } from '@/lib/verticals';

describe('vertical storefront configuration', () => {
  it('normalizes historical keys', () => {
    expect(normalizeVerticalKey('COMMERCE')).toBe('RETAIL');
    expect(normalizeVerticalKey('PROFESSIONALS')).toBe('SERVICES');
  });
  it('exposes only supported modules', () => {
    expect(verticalSupports('RESTAURANT', 'restaurant.kitchen')).toBe(true);
    expect(verticalSupports('RETAIL', 'restaurant.kitchen')).toBe(false);
    expect(verticalSupports('QUOTES', 'services.quotes')).toBe(true);
  });
  it('provides vertical-specific labels', () => {
    expect(getVerticalDefinition('RESTAURANT').catalogLabel).toBe('Menú');
    expect(getVerticalDefinition('RETAIL').catalogLabel).toBe('Productos');
  });
});
