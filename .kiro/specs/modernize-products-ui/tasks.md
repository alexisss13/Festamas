# Implementation Plan: Modernize Products UI

## Overview

Este plan de implementación transforma el módulo de productos desde un Server Component a un Client Component interactivo, aplicando el mismo diseño moderno y experiencia de usuario del módulo de pedidos (OrdersView.tsx). La implementación incluye sistema de tabs con filtros, búsqueda mejorada, contador visual, tabla moderna con estilos actualizados, y paginación integrada.

## Tasks

- [x] 1. Crear ProductsView client component con estructura base
  - Crear archivo src/app/(admin)/admin/products/ProductsView.tsx
  - Definir interfaces TypeScript: Product, ProductsViewProps, FilterState
  - Implementar estructura base del componente con 'use client' directive
  - Configurar hooks de estado: activeTab, searchTerm, page
  - Implementar funciones helper: formatPrice, toTitleCase
  - _Requirements: 10.1, 10.7, 10.9_

- [x] 2. Implementar sistema de tabs con filtros inteligentes
  - [x] 2.1 Crear TabsList con 4 opciones de filtro
    - Implementar tabs: "Todos", "Stock Bajo", "Con Descuento", "Archivados"
    - Agregar iconos: Package, AlertTriangle, TrendingDown, Archive
    - Aplicar estilos: bg-white, border, shadow-sm, active state con bg-slate-900
    - _Requirements: 1.1, 1.5, 1.6_
  
  - [x] 2.2 Implementar lógica de filtrado por tab
    - Crear función getFilteredByTab con switch para cada filtro
    - Stock Bajo: filtrar productos con stock < 5
    - Con Descuento: filtrar productos con discountPercentage > 0
    - Archivados: filtrar productos con isAvailable === false
    - _Requirements: 1.2, 10.10_
  
  - [ ]* 2.3 Write property test for tab filtering
    - **Property 1: Tab Filtering Correctness**
    - **Validates: Requirements 1.2**
  
  - [x] 2.4 Implementar contadores dinámicos por tab
    - Calcular counts para cada tab: all, lowStock, discounted, archived
    - Renderizar badges con contadores dentro de cada TabsTrigger
    - Aplicar estilos: bg-slate-100 para inactivos, bg-slate-700 para activos
    - _Requirements: 1.3, 1.7_
  
  - [ ]* 2.5 Write property test for tab counter accuracy
    - **Property 2: Tab Counter Accuracy**
    - **Validates: Requirements 1.3**
  
  - [x] 2.6 Implementar reset de estado al cambiar tab
    - Crear handler handleTabChange que limpia searchTerm y resetea page a 1
    - Conectar handler con onValueChange del Tabs component
    - _Requirements: 1.4_
  
  - [ ]* 2.7 Write property test for tab switch state reset
    - **Property 3: Tab Switch State Reset**
    - **Validates: Requirements 1.4**

- [x] 3. Implementar buscador mejorado con visual feedback
  - [x] 3.1 Crear Search Bar con icono y estilos modernos
    - Agregar Search icon de lucide-react posicionado a la izquierda
    - Aplicar estilos: h-10, bg-white, border-slate-200, focus-visible:border-primary
    - Configurar placeholder: "Buscar por nombre, SKU o etiqueta..."
    - _Requirements: 2.1, 2.5, 2.6_
  
  - [x] 3.2 Implementar lógica de filtrado por búsqueda
    - Crear función getFilteredBySearch que filtra por title, slug, tags, barcode
    - Implementar búsqueda case-insensitive para campos de texto
    - Crear handler handleSearch que resetea page a 1
    - _Requirements: 2.2, 2.7_
  
  - [ ]* 3.3 Write property test for search filter correctness
    - **Property 4: Search Filter Correctness**
    - **Validates: Requirements 2.2**
  
  - [x] 3.4 Implementar botón de limpiar búsqueda
    - Renderizar X icon condicionalmente cuando searchTerm no está vacío
    - Posicionar botón a la derecha dentro del input
    - Implementar onClick que limpia searchTerm y resetea filtros
    - Aplicar hover effects: hover:text-primary transition-colors
    - _Requirements: 2.3, 2.4_

- [x] 4. Implementar contador visual de resultados
  - [x] 4.1 Crear Visual Counter badge
    - Agregar Package icon de lucide-react
    - Renderizar formato: "[icon] [number] producto(s)"
    - Aplicar estilos: bg-slate-100, border-slate-200, rounded-lg
    - Posicionar en top right usando flex layout
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 4.2 Implementar lógica de pluralización
    - Crear función que retorna "producto" para count === 1
    - Retornar "productos" para todos los demás valores (incluyendo 0)
    - _Requirements: 3.4_
  
  - [ ]* 4.3 Write property test for visual counter pluralization
    - **Property 5: Visual Counter Pluralization**
    - **Validates: Requirements 3.4**
  
  - [ ]* 4.4 Write property test for visual counter synchronization
    - **Property 6: Visual Counter Synchronization**
    - **Validates: Requirements 3.6**

- [x] 5. Checkpoint - Verificar filtros y búsqueda
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Aplicar estilos modernos a la tabla
  - [x] 6.1 Actualizar TableHeader con estilos modernos
    - Aplicar bg-slate-50 background a TableRow del header
    - Agregar border-b border-slate-200
    - Aplicar font-semibold y text-slate-700 a TableHead
    - Configurar spacing: py-3 px-4 para celdas
    - _Requirements: 4.1, 4.6, 4.7_
  
  - [x] 6.2 Aplicar hover effects a las filas
    - Agregar hover:bg-slate-50 a TableRow del body
    - Implementar transition-colors para smooth effects
    - _Requirements: 4.2_
  
  - [x] 6.3 Envolver tabla en card moderno
    - Crear wrapper div con bg-white, rounded-lg, border-slate-200, shadow-sm
    - Configurar overflow-hidden para rounded corners
    - Agregar overflow-x-auto para scroll horizontal en mobile
    - Aplicar min-w-[860px] a la tabla
    - _Requirements: 4.3, 9.4_

- [x] 7. Implementar badges con colores semánticos
  - [x] 7.1 Actualizar category badge con colores por división
    - Aplicar festamas-primary para JUGUETERIA division
    - Aplicar fiestasya-accent para FIESTASYA division
    - Mantener text-[10px] font-bold para tamaño consistente
    - _Requirements: 5.1, 5.6_
  
  - [ ]* 7.2 Write property test for division color consistency
    - **Property 7: Division Color Consistency**
    - **Validates: Requirements 5.1, 5.4, 10.8**
  
  - [x] 7.3 Implementar stock badge con color condicional
    - Aplicar text-red-500 cuando stock < 5
    - Aplicar text-slate-700 para stock normal
    - _Requirements: 5.2_
  
  - [ ]* 7.4 Write property test for stock badge color rule
    - **Property 8: Stock Badge Color Rule**
    - **Validates: Requirements 5.2**
  
  - [x] 7.5 Actualizar "Archivado" badge con colores semánticos
    - Aplicar bg-red-50, text-red-500, border-red-200
    - Mantener text-[10px] para consistencia
    - _Requirements: 5.3, 5.6_
  
  - [x] 7.6 Actualizar discount badge en imagen de producto
    - Aplicar background color según división (festamas-primary o fiestasya-accent)
    - Mantener text-[9px] font-black para texto
    - _Requirements: 5.4_
  
  - [x] 7.7 Actualizar SKU badge con outline variant
    - Aplicar text-slate-400 y border-slate-200
    - Mantener text-[10px] para consistencia
    - _Requirements: 5.5, 5.6_
  
  - [ ]* 7.8 Write property test for badge size consistency
    - **Property 9: Badge Size Consistency**
    - **Validates: Requirements 5.6**

- [x] 8. Implementar botones de acción con iconos
  - [x] 8.1 Actualizar estructura de Action Buttons
    - Organizar botones horizontalmente con gap-1
    - Aplicar ghost variant con h-8 w-8 sizing
    - _Requirements: 6.2, 6.5_
  
  - [x] 8.2 Configurar iconos para cada acción
    - Eye icon para view (link a detalle)
    - Pencil icon para edit (link a /admin/products/[slug])
    - Trash2 icon para delete (DeleteProductBtn)
    - Barcode icon para print (BarcodeControl)
    - _Requirements: 6.1_
  
  - [x] 8.3 Implementar hover effects diferenciados
    - Aplicar hover:text-primary y hover:bg-primary/10 para view y edit
    - Aplicar hover:text-red-600 y hover:bg-red-50 para delete
    - Agregar transition-colors para smooth effects
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 8.4 Write unit tests for action buttons
    - Test rendering de todos los botones
    - Test hover effects aplicados correctamente
    - Test funcionalidad de cada botón preservada
    - _Requirements: 6.6_

- [x] 9. Implementar paginación integrada dentro de la tabla
  - [x] 9.1 Crear estructura de paginación integrada
    - Posicionar dentro del card de la tabla con border-t border-slate-100
    - Aplicar bg-slate-50/50 background
    - Configurar layout: flex items-center justify-between
    - Agregar padding: px-4 lg:px-6 py-3
    - _Requirements: 7.1, 7.7_
  
  - [x] 9.2 Implementar información de página actual
    - Mostrar "Página X de Y"
    - Mostrar total de items: "N productos en total"
    - Aplicar estilos: text-xs text-slate-500
    - Usar hidden sm:inline para texto detallado en mobile
    - _Requirements: 7.2, 9.6_
  
  - [x] 9.3 Implementar botones de navegación prev/next
    - Agregar ChevronLeft y ChevronRight icons
    - Configurar h-8 w-8 sizing con ghost variant
    - Implementar disabled state en primera y última página
    - Aplicar hover effects: hover:text-primary hover:bg-primary/10
    - _Requirements: 7.3, 7.6_
  
  - [x] 9.4 Implementar números de página con ellipsis
    - Crear función getPageNumbers que genera array con ellipsis
    - Mostrar: primera página, última página, página actual, páginas adyacentes
    - Insertar "..." entre páginas no adyacentes
    - _Requirements: 7.4_
  
  - [ ]* 9.5 Write property test for pagination page number display
    - **Property 10: Pagination Page Number Display**
    - **Validates: Requirements 7.4**
  
  - [x] 9.6 Implementar active page styling
    - Aplicar bg-primary con white text para página activa
    - Aplicar text-slate-600 para páginas inactivas
    - Agregar hover effects para páginas inactivas
    - _Requirements: 7.5_
  
  - [ ]* 9.7 Write property test for pagination button disable state
    - **Property 11: Pagination Button Disable State**
    - **Validates: Requirements 7.6**
  
  - [x] 9.8 Implementar navegación y scroll to top
    - Crear handler para click en número de página
    - Actualizar state de page
    - Implementar scroll to top al cambiar página
    - _Requirements: 7.8_
  
  - [ ]* 9.9 Write property test for pagination navigation
    - **Property 12: Pagination Navigation**
    - **Validates: Requirements 7.8**

- [x] 10. Checkpoint - Verificar tabla y paginación
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implementar estados vacíos mejorados
  - [x] 11.1 Crear Empty State component
    - Agregar Package icon con opacity-20
    - Mostrar mensaje primario: "No se encontraron productos"
    - Aplicar estilos: text-slate-400 para icon, text-slate-500 para texto
    - Centrar vertical y horizontalmente
    - _Requirements: 8.1, 8.2, 8.6, 8.7_
  
  - [x] 11.2 Implementar mensaje contextual con search term
    - Mostrar mensaje secundario cuando searchTerm está activo
    - Formato: "Sin resultados para '[searchTerm]'"
    - _Requirements: 8.4_
  
  - [x] 11.3 Agregar botón "Limpiar filtros"
    - Renderizar link button condicionalmente cuando hay searchTerm
    - Implementar onClick que limpia searchTerm y resetea filtros
    - _Requirements: 8.5_
  
  - [ ]* 11.4 Write unit tests for empty states
    - Test rendering con array vacío
    - Test mensaje contextual con search term
    - Test botón limpiar filtros funciona correctamente
    - _Requirements: 8.1, 8.4, 8.5_

- [x] 12. Implementar diseño responsive
  - [x] 12.1 Configurar responsive layout para tabs
    - Aplicar flex-wrap a TabsList para wrapping en mobile
    - Ajustar gap y padding para pantallas pequeñas
    - _Requirements: 9.2_
  
  - [x] 12.2 Configurar responsive layout para search y counter
    - Stack verticalmente en mobile usando flex-col
    - Aplicar flex-row en desktop con sm: breakpoint
    - _Requirements: 9.3_
  
  - [x] 12.3 Configurar responsive layout para header actions
    - Stack botones verticalmente en mobile
    - Aplicar flex-1 width en mobile para botones full-width
    - Usar flex-row en desktop
    - _Requirements: 9.5_
  
  - [x] 12.4 Verificar scroll horizontal de tabla en mobile
    - Confirmar overflow-x-auto funciona correctamente
    - Verificar min-w-[860px] aplicado a tabla
    - _Requirements: 9.4_
  
  - [ ]* 12.5 Write unit tests for responsive behavior
    - Test layout changes en diferentes breakpoints
    - Test scroll horizontal en mobile
    - Test stacking de elementos en mobile
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 13. Refactorizar ProductsPage para usar ProductsView
  - [x] 13.1 Actualizar ProductsPage server component
    - Mantener toda la lógica de fetching existente (getProducts, categories)
    - Pasar products, categories, y division como props a ProductsView
    - Remover lógica de rendering de tabla (mover a ProductsView)
    - Mantener header con título y botones de acción
    - _Requirements: 10.1, 10.4, 10.5, 10.7_
  
  - [x] 13.2 Preservar AdminProductToolbar en ProductsView
    - Integrar AdminProductToolbar dentro de ProductsView
    - Pasar categories como prop
    - Mantener funcionalidad de filtros de categoría y sort
    - _Requirements: 10.1_
  
  - [ ]* 13.3 Write property test for AdminProductToolbar preservation
    - **Property 13: AdminProductToolbar Preservation**
    - **Validates: Requirements 10.1**
  
  - [x] 13.4 Preservar componentes existentes
    - Mantener BarcodeControl component con misma funcionalidad
    - Mantener DeleteProductBtn component con misma funcionalidad
    - Verificar links a /admin/products/bulk y /admin/products/new
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 13.5 Write property test for data fetching preservation
    - **Property 14: Data Fetching Preservation**
    - **Validates: Requirements 10.7**
  
  - [ ]* 13.6 Write property test for archived products visibility
    - **Property 15: Archived Products Visibility**
    - **Validates: Requirements 10.10**

- [ ] 14. Implementar property-based tests adicionales
  - [ ]* 14.1 Setup fast-check y configuración de arbitraries
    - Instalar fast-check como dev dependency
    - Crear productArbitrary generator con todos los campos
    - Configurar numRuns: 100 para todos los tests
    - _Requirements: All_
  
  - [ ]* 14.2 Write remaining property tests
    - Implementar tests para propiedades no cubiertas en tareas anteriores
    - Verificar todos los tests tienen tag format correcto
    - Ejecutar suite completa de property tests
    - _Requirements: All_

- [ ] 15. Implementar unit tests adicionales
  - [ ]* 15.1 Write component rendering tests
    - Test rendering de tabs, search bar, counter
    - Test rendering de tabla con productos
    - Test rendering de paginación
    - _Requirements: All_
  
  - [ ]* 15.2 Write interaction tests
    - Test click en tabs cambia filtro
    - Test typing en search filtra productos
    - Test click en página navega correctamente
    - _Requirements: All_
  
  - [ ]* 15.3 Write edge case tests
    - Test array vacío de productos
    - Test productos sin imágenes
    - Test single product (pluralización)
    - Test invalid page number clamping
    - _Requirements: All_
  
  - [ ]* 15.4 Write integration tests
    - Test AdminProductToolbar con tabs
    - Test BarcodeControl rendering
    - Test DeleteProductBtn rendering
    - _Requirements: All_
  
  - [ ]* 15.5 Write division theme tests
    - Test festamas-primary colors para JUGUETERIA
    - Test fiestasya-accent colors para FIESTASYA
    - _Requirements: All_

- [x] 16. Final checkpoint - Verificar implementación completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- La implementación usa TypeScript/React con Next.js App Router
- Se mantiene compatibilidad con el sistema de divisiones (JUGUETERIA/FIESTASYA)
- Todos los componentes existentes (BarcodeControl, DeleteProductBtn, AdminProductToolbar) se preservan
