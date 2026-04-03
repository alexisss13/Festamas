# Requirements Document

## Introduction

Este documento define los requerimientos para modernizar el módulo de productos del sistema administrativo, aplicando el mismo nivel de diseño visual y experiencia de usuario que actualmente tiene el módulo de pedidos (OrdersView.tsx). El objetivo es mejorar significativamente la presentación visual y la usabilidad del módulo de productos, manteniendo toda la funcionalidad existente.

## Glossary

- **Products_Module**: El módulo administrativo de gestión de productos ubicado en src/app/(admin)/admin/products/page.tsx
- **Orders_Module**: El módulo administrativo de gestión de pedidos ubicado en src/app/(admin)/admin/orders/OrdersView.tsx que sirve como referencia de diseño
- **Tab_System**: Sistema de pestañas con filtros inteligentes y contadores dinámicos
- **Search_Bar**: Barra de búsqueda mejorada con icono, botón de limpiar y placeholder descriptivo
- **Visual_Counter**: Badge que muestra la cantidad de items filtrados con icono
- **Modern_Table**: Tabla con diseño limpio, headers con fondo, hover effects y badges semánticos
- **Integrated_Pagination**: Sistema de paginación dentro del card de la tabla con números de página
- **Empty_States**: Mensajes amigables cuando no hay resultados de búsqueda o filtros
- **Division**: División del negocio (JUGUETERIA/Festamas o FIESTASYA) con colores específicos
- **Action_Buttons**: Botones de acción con iconos (Eye, Pencil, Trash2, Barcode)

## Requirements

### Requirement 1: Sistema de Tabs con Filtros Inteligentes

**User Story:** Como administrador, quiero filtrar productos por estado usando tabs con contadores dinámicos, para poder visualizar rápidamente diferentes segmentos del inventario.

#### Acceptance Criteria

1. THE Products_Module SHALL display a Tab_System with at least four filter options: "Todos", "Stock Bajo", "Con Descuento", and "Archivados"
2. WHEN a tab is selected, THE Products_Module SHALL display only products matching that filter criteria
3. FOR EACH tab, THE Products_Module SHALL display a dynamic counter showing the number of products in that category
4. WHEN the user switches tabs, THE Products_Module SHALL reset the search term and pagination to page 1
5. THE Tab_System SHALL use the same visual style as Orders_Module with bg-white, border, shadow-sm, and active state styling
6. THE active tab SHALL display with bg-slate-900 background and white text
7. THE counter badges SHALL display with bg-slate-100 for inactive tabs and bg-slate-700 for active tabs

### Requirement 2: Buscador Mejorado

**User Story:** Como administrador, quiero buscar productos con una interfaz mejorada, para encontrar productos más fácilmente.

#### Acceptance Criteria

1. THE Search_Bar SHALL display a search icon (Search from lucide-react) positioned at the left inside the input
2. WHEN the user types in the Search_Bar, THE Products_Module SHALL filter products by title, SKU, or tags
3. WHEN the search term is not empty, THE Search_Bar SHALL display a clear button (X icon) on the right side
4. WHEN the clear button is clicked, THE Products_Module SHALL clear the search term and reset the filter
5. THE Search_Bar SHALL use placeholder text "Buscar por nombre, SKU o etiqueta..."
6. THE Search_Bar SHALL apply the same styling as Orders_Module: h-10, bg-white, border-slate-200, focus-visible:border-primary
7. THE search functionality SHALL maintain debounced behavior to avoid excessive filtering operations

### Requirement 3: Contador Visual de Resultados

**User Story:** Como administrador, quiero ver cuántos productos están siendo mostrados después de aplicar filtros, para tener contexto sobre los resultados.

#### Acceptance Criteria

1. THE Products_Module SHALL display a Visual_Counter showing the number of filtered products
2. THE Visual_Counter SHALL include a Package icon from lucide-react
3. THE Visual_Counter SHALL display the format: "[icon] [number] producto(s)"
4. THE Visual_Counter SHALL use singular "producto" when count is 1, and plural "productos" otherwise
5. THE Visual_Counter SHALL be styled with bg-slate-100, border-slate-200, rounded-lg, and positioned at the top right
6. WHEN filters or search change, THE Visual_Counter SHALL update automatically to reflect the new count

### Requirement 4: Tabla Moderna con Diseño Mejorado

**User Story:** Como administrador, quiero ver los productos en una tabla con diseño moderno y limpio, para mejorar la legibilidad y experiencia visual.

#### Acceptance Criteria

1. THE Modern_Table SHALL use headers with bg-slate-50 background and border-b border-slate-200
2. THE Modern_Table rows SHALL display hover:bg-slate-50 effect for better visual feedback
3. THE Modern_Table SHALL be wrapped in a card with bg-white, rounded-lg, border-slate-200, and shadow-sm
4. THE Modern_Table SHALL display product status badges with semantic colors matching the Division theme
5. THE Modern_Table SHALL maintain all existing columns: Image, Product Info, Stock, Wholesale Price, Retail Price, and Actions
6. THE Modern_Table headers SHALL use font-semibold and text-slate-700 styling
7. THE Modern_Table SHALL apply consistent spacing with py-3 px-4 for cells

### Requirement 5: Badges con Colores Semánticos

**User Story:** Como administrador, quiero ver badges con colores que comuniquen claramente el estado y categoría de cada producto, para identificar información importante rápidamente.

#### Acceptance Criteria

1. THE category badge SHALL use Division-specific colors: festamas-primary for JUGUETERIA and fiestasya-accent for FIESTASYA
2. THE stock badge SHALL display in red (text-red-500) when stock is below 5 units
3. THE "Archivado" badge SHALL use red-50 background with red-500 text and red-200 border
4. THE discount badge SHALL display on product images with Division-specific background colors
5. THE SKU badge SHALL use outline variant with slate-400 text and slate-200 border
6. ALL badges SHALL use consistent sizing: text-[10px] for small badges and text-xs for standard badges

### Requirement 6: Botones de Acción con Iconos

**User Story:** Como administrador, quiero botones de acción con iconos claros y efectos hover, para realizar acciones sobre productos de manera intuitiva.

#### Acceptance Criteria

1. THE Action_Buttons SHALL include icons: Eye (view), Pencil (edit), Trash2 (delete), and Barcode (print barcode)
2. THE Action_Buttons SHALL use ghost variant with h-8 w-8 sizing
3. WHEN hovering over an Action_Button, THE button SHALL display hover:text-primary and hover:bg-primary/10 effects
4. THE delete button SHALL display hover:text-red-600 and hover:bg-red-50 when hovered
5. THE Action_Buttons SHALL be arranged horizontally with gap-1 spacing
6. THE Action_Buttons SHALL maintain all existing functionality from the current implementation

### Requirement 7: Paginación Integrada

**User Story:** Como administrador, quiero un sistema de paginación integrado dentro de la tabla, para navegar entre páginas de productos de manera fluida.

#### Acceptance Criteria

1. THE Integrated_Pagination SHALL be positioned inside the table card, separated by a top border (border-t border-slate-100)
2. THE Integrated_Pagination SHALL display current page, total pages, and total items count
3. THE Integrated_Pagination SHALL include previous and next buttons with ChevronLeft and ChevronRight icons
4. THE Integrated_Pagination SHALL display page numbers with ellipsis (...) for non-adjacent pages
5. THE active page button SHALL use bg-primary background with white text
6. THE Integrated_Pagination SHALL disable previous button on first page and next button on last page
7. THE Integrated_Pagination SHALL use bg-slate-50/50 background for the pagination container
8. WHEN a page number is clicked, THE Products_Module SHALL navigate to that page and scroll to top

### Requirement 8: Estados Vacíos Mejorados

**User Story:** Como administrador, quiero ver mensajes amigables cuando no hay resultados, para entender por qué la tabla está vacía y qué puedo hacer.

#### Acceptance Criteria

1. WHEN no products match the filters, THE Products_Module SHALL display an Empty_States message
2. THE Empty_States SHALL include a Package icon with opacity-20 styling
3. THE Empty_States SHALL display a primary message "No se encontraron productos"
4. WHEN a search term is active, THE Empty_States SHALL display a secondary message showing the search term
5. WHEN a search term is active, THE Empty_States SHALL display a "Limpiar filtros" link button
6. THE Empty_States SHALL be centered vertically and horizontally within the table area
7. THE Empty_States SHALL use text-slate-400 for icons and text-slate-500 for primary text

### Requirement 9: Diseño Responsive

**User Story:** Como administrador, quiero que el módulo de productos sea completamente responsive, para poder gestionar productos desde diferentes dispositivos.

#### Acceptance Criteria

1. THE Products_Module SHALL adapt the layout for mobile, tablet, and desktop screen sizes
2. THE Tab_System SHALL wrap tabs on smaller screens using flex-wrap
3. THE Search_Bar and Visual_Counter SHALL stack vertically on mobile devices
4. THE Modern_Table SHALL be horizontally scrollable on small screens with min-w-[860px]
5. THE header actions (Carga Masiva and Nuevo buttons) SHALL stack vertically on mobile with flex-1 width
6. THE Integrated_Pagination SHALL hide detailed text on small screens using hidden sm:inline classes
7. THE responsive behavior SHALL match the patterns used in Orders_Module

### Requirement 10: Preservación de Funcionalidad Existente

**User Story:** Como administrador, quiero que todas las funcionalidades actuales del módulo de productos se mantengan, para no perder capacidades existentes.

#### Acceptance Criteria

1. THE Products_Module SHALL maintain the existing AdminProductToolbar functionality for category and sort filters
2. THE Products_Module SHALL preserve the barcode printing functionality via BarcodeControl component
3. THE Products_Module SHALL keep the delete product functionality via DeleteProductBtn component
4. THE Products_Module SHALL maintain the "Carga Masiva" (bulk upload) link to /admin/products/bulk
5. THE Products_Module SHALL preserve the "Nuevo" button link to /admin/products/new
6. THE Products_Module SHALL keep the edit functionality linking to /admin/products/[slug]
7. THE Products_Module SHALL maintain all existing data fetching logic via getProducts server action
8. THE Products_Module SHALL preserve Division-specific color theming for JUGUETERIA and FIESTASYA
9. THE Products_Module SHALL keep all existing product information display: images, title, SKU, category, tags, stock, prices, and discount
10. THE Products_Module SHALL maintain the archived products visibility toggle functionality
