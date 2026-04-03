# Design Document: Modernize Products UI

## Overview

This design document outlines the technical approach for modernizing the Products module UI by applying the same design patterns, visual style, and user experience currently implemented in the Orders module (OrdersView.tsx). The modernization will transform the Products module from a server-side rendered page into a client-side interactive component with advanced filtering, search, and pagination capabilities.

### Goals

- Transform Products module from Server Component to Client Component for state management
- Implement tab-based filtering system with dynamic counters
- Enhance search functionality with visual feedback and clear button
- Add visual counter badge showing filtered results
- Modernize table design with improved styling and hover effects
- Integrate pagination within the table card
- Improve empty states with friendly messages
- Ensure full responsive design across all screen sizes
- Preserve all existing functionality and components

### Non-Goals

- Modifying the underlying data fetching logic (getProducts server action)
- Changing the AdminProductToolbar component structure
- Altering existing components (BarcodeControl, DeleteProductBtn)
- Modifying database schema or product data model
- Implementing real-time updates or WebSocket connections

## Architecture

### Component Structure

The modernized Products module will follow a client-side architecture similar to OrdersView:

```
ProductsPage (Server Component)
└── ProductsView (Client Component) ← NEW
    ├── Tabs System
    │   ├── TabsList with 4 filters
    │   └── Dynamic counters per tab
    ├── Search Bar
    │   ├── Search icon
    │   └── Clear button (conditional)
    ├── Visual Counter Badge
    ├── AdminProductToolbar (existing)
    │   ├── Category filter
    │   └── Sort dropdown
    ├── Modern Table
    │   ├── Table Header (styled)
    │   ├── Table Body (product rows)
    │   └── Empty State (conditional)
    └── Integrated Pagination
        ├── Page info
        ├── Page numbers
        └── Navigation buttons
```

### Data Flow

1. **Server-Side Initial Load**
   - ProductsPage (server component) fetches initial data via getProducts
   - Fetches categories for AdminProductToolbar
   - Passes data as props to ProductsView client component

2. **Client-Side State Management**
   - ProductsView manages local state for:
     - Active tab filter
     - Search term
     - Current page number
   - State changes trigger client-side filtering and pagination
   - No additional server requests after initial load

3. **Filtering Pipeline**
   ```
   All Products → Tab Filter → Search Filter → Pagination → Display
   ```

### State Management

The component will use React hooks for state management:

```typescript
const [activeTab, setActiveTab] = useState<'all' | 'low-stock' | 'discounted' | 'archived'>('all');
const [searchTerm, setSearchTerm] = useState('');
const [page, setPage] = useState(1);
```

State transitions:
- Tab change → Reset search term and page to 1
- Search change → Reset page to 1
- Page change → Maintain current filters

## Components and Interfaces

### ProductsView Component

**Type Definition:**
```typescript
interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isAvailable: boolean;
  wholesalePrice: number;
  wholesaleMinCount: number | null;
  discountPercentage: number;
  tags: string[];
  division: 'JUGUETERIA' | 'FIESTASYA';
  createdAt: Date;
  barcode: string | null;
  category: {
    name: string;
    slug: string;
  };
}

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  division: 'JUGUETERIA' | 'FIESTASYA';
}
```

**Component Signature:**
```typescript
'use client';

export function ProductsView({ products, categories, division }: ProductsViewProps) {
  // Implementation
}
```

### Tab System

**Tab Configuration:**
```typescript
const tabs = [
  { value: 'all', label: 'Todos', icon: null },
  { value: 'low-stock', label: 'Stock Bajo', icon: AlertTriangle },
  { value: 'discounted', label: 'Con Descuento', icon: TrendingDown },
  { value: 'archived', label: 'Archivados', icon: Archive }
];
```

**Filter Logic:**
```typescript
const getFilteredByTab = (products: Product[], tab: string) => {
  switch (tab) {
    case 'low-stock':
      return products.filter(p => p.stock < 5);
    case 'discounted':
      return products.filter(p => p.discountPercentage > 0);
    case 'archived':
      return products.filter(p => !p.isAvailable);
    default:
      return products;
  }
};
```

### Search Functionality

**Search Filter Logic:**
```typescript
const getFilteredBySearch = (products: Product[], term: string) => {
  if (!term) return products;
  
  const lowerTerm = term.toLowerCase();
  return products.filter(product =>
    product.title.toLowerCase().includes(lowerTerm) ||
    product.slug.toLowerCase().includes(lowerTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
    product.barcode?.includes(term)
  );
};
```

### Pagination Logic

**Configuration:**
```typescript
const PAGE_SIZE = 12; // Match current server-side pagination
```

**Pagination Calculation:**
```typescript
const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
const safePage = Math.min(page, totalPages);
const paginatedProducts = filteredProducts.slice(
  (safePage - 1) * PAGE_SIZE,
  safePage * PAGE_SIZE
);
```

**Page Number Display Logic:**
```typescript
// Display: 1 ... 4 5 [6] 7 8 ... 20
const getPageNumbers = (current: number, total: number) => {
  return Array.from({ length: total }, (_, i) => i + 1)
    .filter(n => n === 1 || n === total || Math.abs(n - current) <= 1)
    .reduce<(number | '...')[]>((acc, n, idx, arr) => {
      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...');
      acc.push(n);
      return acc;
    }, []);
};
```

## Data Models

### Product Model (from Prisma)

```typescript
model Product {
  id                  String    @id @default(cuid())
  title               String
  slug                String    @unique
  description         String
  price               Decimal   @db.Decimal(10, 2)
  stock               Int       @default(0)
  images              String[]
  tags                String[]
  isAvailable         Boolean   @default(true)
  wholesalePrice      Decimal?  @db.Decimal(10, 2)
  wholesaleMinCount   Int?
  discountPercentage  Int       @default(0)
  barcode             String?
  division            Division
  categoryId          String
  category            Category  @relation(fields: [categoryId], references: [id])
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

### Filter State Model

```typescript
interface FilterState {
  tab: 'all' | 'low-stock' | 'discounted' | 'archived';
  searchTerm: string;
  page: number;
}

interface FilterCounts {
  all: number;
  lowStock: number;
  discounted: number;
  archived: number;
}
```

### Pagination Model

```typescript
interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tab Filtering Correctness

*For any* product set and any tab selection, all displayed products SHALL match the filter criteria for that tab (low-stock: stock < 5, discounted: discountPercentage > 0, archived: !isAvailable, all: no filter).

**Validates: Requirements 1.2**

### Property 2: Tab Counter Accuracy

*For any* product set and any tab, the counter badge SHALL display a number equal to the count of products matching that tab's filter criteria.

**Validates: Requirements 1.3**

### Property 3: Tab Switch State Reset

*For any* tab switch operation, the search term SHALL be cleared and the page number SHALL be reset to 1.

**Validates: Requirements 1.4**

### Property 4: Search Filter Correctness

*For any* search term and product set, all displayed products SHALL have the search term present in their title, slug, tags array, or barcode field (case-insensitive for text fields).

**Validates: Requirements 2.2**

### Property 5: Visual Counter Pluralization

*For any* filtered product count, the visual counter SHALL display "producto" when count equals 1, and "productos" for all other count values (including 0).

**Validates: Requirements 3.4**

### Property 6: Visual Counter Synchronization

*For any* filter or search state change, the visual counter SHALL update to display the exact count of products in the filtered result set.

**Validates: Requirements 3.6**

### Property 7: Division Color Consistency

*For any* product with a division value, all division-themed UI elements (category badges, discount badges, price text) SHALL use the color scheme corresponding to that division (festamas-primary for JUGUETERIA, fiestasya-accent for FIESTASYA).

**Validates: Requirements 4.4, 5.1, 5.4, 10.8**

### Property 8: Stock Badge Color Rule

*For any* product, the stock badge SHALL display in red (text-red-500) if and only if the stock value is less than 5.

**Validates: Requirements 5.2**

### Property 9: Badge Size Consistency

*For any* badge element in the product table, the text size SHALL be either text-[10px] for small badges (SKU, category, archived) or text-xs for standard badges, with no other text sizes used.

**Validates: Requirements 5.6**

### Property 10: Pagination Page Number Display

*For any* pagination state with total pages > 2, the displayed page numbers SHALL include the first page, last page, current page, and all pages within distance 1 of current page, with ellipsis (...) inserted between non-adjacent page numbers.

**Validates: Requirements 7.4**

### Property 11: Pagination Button Disable State

*For any* pagination state, the previous button SHALL be disabled if and only if current page equals 1, and the next button SHALL be disabled if and only if current page equals total pages.

**Validates: Requirements 7.6**

### Property 12: Pagination Navigation

*For any* valid page number click, the displayed products SHALL be the subset of filtered products from index (pageNumber - 1) * PAGE_SIZE to pageNumber * PAGE_SIZE.

**Validates: Requirements 7.8**

### Property 13: AdminProductToolbar Preservation

*For any* category or sort selection in AdminProductToolbar, the filtering and sorting behavior SHALL remain identical to the original implementation.

**Validates: Requirements 10.1**

### Property 14: Data Fetching Preservation

*For any* initial page load, the products data SHALL be fetched using the same getProducts server action with the same parameters (includeInactive, division, page, take, query, categoryId, sort) as the original implementation.

**Validates: Requirements 10.7**

### Property 15: Archived Products Visibility

*For any* product set containing both available and archived products, the "Archivados" tab SHALL display only products where isAvailable equals false, and all other tabs SHALL display only products where isAvailable equals true (except "Todos" which shows all).

**Validates: Requirements 10.10**

## Error Handling

### Client-Side Error Scenarios

#### 1. Empty Product Set

**Scenario:** Server returns empty array or no products match filters

**Handling:**
- Display empty state component with Package icon
- Show contextual message based on active filters
- Provide "Limpiar filtros" button if search term is active
- Ensure pagination displays "Page 1 of 1" gracefully

**Implementation:**
```typescript
{filteredProducts.length === 0 && (
  <div className="py-16 text-center bg-slate-50/50">
    <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
    <p className="text-sm text-slate-500 font-medium">
      No se encontraron productos
    </p>
    {searchTerm && (
      <>
        <p className="text-xs text-slate-400 mt-1">
          Sin resultados para "{searchTerm}"
        </p>
        <Button variant="link" onClick={() => setSearchTerm('')}>
          Limpiar filtros
        </Button>
      </>
    )}
  </div>
)}
```

#### 2. Invalid Page Number

**Scenario:** User navigates to page number greater than total pages (e.g., via URL manipulation)

**Handling:**
- Use `Math.min(page, totalPages)` to clamp to valid range
- Display the last valid page instead of error
- Update URL to reflect actual page shown

**Implementation:**
```typescript
const safePage = Math.min(page, totalPages);
const paginatedProducts = filteredProducts.slice(
  (safePage - 1) * PAGE_SIZE,
  safePage * PAGE_SIZE
);
```

#### 3. Missing Product Data

**Scenario:** Product object missing required fields (image, category, etc.)

**Handling:**
- Use fallback values for missing data
- Display placeholder icon for missing images
- Show "Sin Categoría" for missing category
- Use "—" for missing prices

**Implementation:**
```typescript
{product.images[0] ? (
  <Image src={product.images[0]} alt={product.title} fill />
) : (
  <div className="flex items-center justify-center h-full">
    <Package className="h-6 w-6 opacity-40 text-slate-300" />
  </div>
)}
```

#### 4. Division Mismatch

**Scenario:** Product division doesn't match expected values

**Handling:**
- Default to JUGUETERIA theme if division is undefined
- Log warning to console for debugging
- Continue rendering with fallback theme

**Implementation:**
```typescript
const isFestamas = division === 'JUGUETERIA';
const primaryColor = isFestamas ? 'festamas-primary' : 'fiestasya-accent';
```

### State Management Errors

#### 5. Rapid State Changes

**Scenario:** User rapidly switches tabs or types in search

**Handling:**
- Debounce search input (already implemented in AdminProductToolbar)
- Use React's batched state updates for tab switches
- Ensure state transitions are atomic

#### 6. Concurrent Filter Operations

**Scenario:** Multiple filters applied simultaneously

**Handling:**
- Apply filters in consistent order: tab → search → pagination
- Ensure each filter operates on result of previous filter
- Reset dependent state (page) when parent state (tab, search) changes

### Integration Errors

#### 7. Server Action Failure

**Scenario:** getProducts server action returns error

**Handling:**
- Server component should handle error before passing to client
- Pass empty array with error flag if needed
- Display user-friendly error message in empty state

#### 8. Category Data Missing

**Scenario:** Categories array is empty or undefined

**Handling:**
- AdminProductToolbar should handle empty categories gracefully
- Show "Todas las Categorías" option even if no categories exist
- Disable category filter if no categories available

## Testing Strategy

### Dual Testing Approach

This feature will employ both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, UI rendering, and component integration
- **Property tests**: Verify universal properties across all possible inputs using randomized data

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs and verify specific behaviors, while property tests validate general correctness across a wide input space.

### Property-Based Testing

**Library:** fast-check (for TypeScript/JavaScript)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: modernize-products-ui, Property {number}: {property_text}`

**Property Test Examples:**

```typescript
import fc from 'fast-check';

// Property 1: Tab Filtering Correctness
test('Feature: modernize-products-ui, Property 1: Tab filtering correctness', () => {
  fc.assert(
    fc.property(
      fc.array(productArbitrary),
      fc.constantFrom('all', 'low-stock', 'discounted', 'archived'),
      (products, tab) => {
        const filtered = getFilteredByTab(products, tab);
        
        if (tab === 'low-stock') {
          return filtered.every(p => p.stock < 5);
        } else if (tab === 'discounted') {
          return filtered.every(p => p.discountPercentage > 0);
        } else if (tab === 'archived') {
          return filtered.every(p => !p.isAvailable);
        } else {
          return filtered.length === products.length;
        }
      }
    ),
    { numRuns: 100 }
  );
});

// Property 2: Tab Counter Accuracy
test('Feature: modernize-products-ui, Property 2: Tab counter accuracy', () => {
  fc.assert(
    fc.property(
      fc.array(productArbitrary),
      fc.constantFrom('all', 'low-stock', 'discounted', 'archived'),
      (products, tab) => {
        const filtered = getFilteredByTab(products, tab);
        const count = getTabCount(products, tab);
        return count === filtered.length;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 4: Search Filter Correctness
test('Feature: modernize-products-ui, Property 4: Search filter correctness', () => {
  fc.assert(
    fc.property(
      fc.array(productArbitrary),
      fc.string(),
      (products, searchTerm) => {
        const filtered = getFilteredBySearch(products, searchTerm);
        const lowerTerm = searchTerm.toLowerCase();
        
        return filtered.every(p =>
          p.title.toLowerCase().includes(lowerTerm) ||
          p.slug.toLowerCase().includes(lowerTerm) ||
          p.tags.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
          p.barcode?.includes(searchTerm)
        );
      }
    ),
    { numRuns: 100 }
  );
});

// Property 5: Visual Counter Pluralization
test('Feature: modernize-products-ui, Property 5: Visual counter pluralization', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1000 }),
      (count) => {
        const text = getCounterText(count);
        if (count === 1) {
          return text.includes('producto') && !text.includes('productos');
        } else {
          return text.includes('productos');
        }
      }
    ),
    { numRuns: 100 }
  );
});

// Property 8: Stock Badge Color Rule
test('Feature: modernize-products-ui, Property 8: Stock badge color rule', () => {
  fc.assert(
    fc.property(
      productArbitrary,
      (product) => {
        const hasRedColor = getStockBadgeColor(product).includes('red');
        return (product.stock < 5) === hasRedColor;
      }
    ),
    { numRuns: 100 }
  );
});
```

**Arbitraries (Data Generators):**

```typescript
const productArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  slug: fc.string({ minLength: 5, maxLength: 50 }),
  price: fc.float({ min: 0.01, max: 10000 }),
  stock: fc.integer({ min: 0, max: 1000 }),
  images: fc.array(fc.webUrl(), { maxLength: 5 }),
  isAvailable: fc.boolean(),
  wholesalePrice: fc.float({ min: 0, max: 10000 }),
  wholesaleMinCount: fc.option(fc.integer({ min: 1, max: 100 })),
  discountPercentage: fc.integer({ min: 0, max: 90 }),
  tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 10 }),
  division: fc.constantFrom('JUGUETERIA', 'FIESTASYA'),
  createdAt: fc.date(),
  barcode: fc.option(fc.string({ minLength: 8, maxLength: 13 })),
  category: fc.record({
    name: fc.string({ minLength: 3, maxLength: 50 }),
    slug: fc.string({ minLength: 3, maxLength: 50 })
  })
});
```

### Unit Testing

**Framework:** Jest with React Testing Library

**Test Categories:**

#### 1. Component Rendering Tests

```typescript
describe('ProductsView - Rendering', () => {
  test('renders all tab options', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
    expect(screen.getByText('Con Descuento')).toBeInTheDocument();
    expect(screen.getByText('Archivados')).toBeInTheDocument();
  });

  test('renders search bar with correct placeholder', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    expect(screen.getByPlaceholderText('Buscar por nombre, SKU o etiqueta...')).toBeInTheDocument();
  });

  test('renders visual counter with Package icon', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    expect(screen.getByText(/productos?/)).toBeInTheDocument();
    // Check for Package icon presence
  });
});
```

#### 2. Interaction Tests

```typescript
describe('ProductsView - Interactions', () => {
  test('clicking tab changes active filter', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    fireEvent.click(screen.getByText('Stock Bajo'));
    // Verify only low stock products are shown
  });

  test('typing in search filters products', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    const searchInput = screen.getByPlaceholderText('Buscar por nombre, SKU o etiqueta...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    // Verify filtered results
  });

  test('clicking clear button resets search', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    const searchInput = screen.getByPlaceholderText('Buscar por nombre, SKU o etiqueta...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(searchInput).toHaveValue('');
  });

  test('clicking page number navigates to that page', () => {
    const manyProducts = Array(50).fill(null).map((_, i) => ({ ...mockProduct, id: `${i}` }));
    render(<ProductsView products={manyProducts} categories={mockCategories} division="JUGUETERIA" />);
    fireEvent.click(screen.getByText('2'));
    // Verify page 2 products are shown
  });
});
```

#### 3. Edge Case Tests

```typescript
describe('ProductsView - Edge Cases', () => {
  test('handles empty product array', () => {
    render(<ProductsView products={[]} categories={mockCategories} division="JUGUETERIA" />);
    expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
  });

  test('handles products with missing images', () => {
    const productNoImage = { ...mockProduct, images: [] };
    render(<ProductsView products={[productNoImage]} categories={mockCategories} division="JUGUETERIA" />);
    // Verify placeholder icon is shown
  });

  test('handles single product (pluralization)', () => {
    render(<ProductsView products={[mockProduct]} categories={mockCategories} division="JUGUETERIA" />);
    expect(screen.getByText(/1 producto$/)).toBeInTheDocument();
  });

  test('clamps invalid page number to valid range', () => {
    const manyProducts = Array(50).fill(null).map((_, i) => ({ ...mockProduct, id: `${i}` }));
    render(<ProductsView products={manyProducts} categories={mockCategories} division="JUGUETERIA" />);
    // Simulate navigation to page 999
    // Verify it shows last valid page instead
  });
});
```

#### 4. Integration Tests

```typescript
describe('ProductsView - Integration', () => {
  test('AdminProductToolbar category filter works with tabs', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    // Select category in toolbar
    // Select tab
    // Verify both filters are applied
  });

  test('BarcodeControl component renders and functions', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    const barcodeButtons = screen.getAllByRole('button', { name: /barcode/i });
    expect(barcodeButtons.length).toBeGreaterThan(0);
  });

  test('DeleteProductBtn component renders for available products', () => {
    const availableProduct = { ...mockProduct, isAvailable: true };
    render(<ProductsView products={[availableProduct]} categories={mockCategories} division="JUGUETERIA" />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
```

#### 5. Division Theme Tests

```typescript
describe('ProductsView - Division Theming', () => {
  test('applies festamas-primary colors for JUGUETERIA', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="JUGUETERIA" />);
    // Verify festamas-primary classes are applied
  });

  test('applies fiestasya-accent colors for FIESTASYA', () => {
    render(<ProductsView products={mockProducts} categories={mockCategories} division="FIESTASYA" />);
    // Verify fiestasya-accent classes are applied
  });
});
```

### Test Coverage Goals

- **Line Coverage:** Minimum 85%
- **Branch Coverage:** Minimum 80%
- **Function Coverage:** Minimum 90%
- **Property Tests:** All 15 correctness properties implemented
- **Unit Tests:** Minimum 30 test cases covering rendering, interactions, edge cases, and integration

### Continuous Integration

- Run all tests on every pull request
- Block merge if any test fails
- Generate coverage report and require minimum thresholds
- Run property tests with increased iterations (500) in CI environment for deeper validation

