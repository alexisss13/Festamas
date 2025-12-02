# PROJECT_STATUS.md

## 1. Funcionalidad Actual

### 🔐 Seguridad & Auth
- **NextAuth v5 Implementado:** Sistema de autenticación robusto basado en sesiones encriptadas.
- **Protección de Rutas:** Middleware (`middleware.ts`) que intercepta y bloquea el acceso a `/admin/*`.
- **Login Profesional:** Diseño "Glassmorphism" Central con Server Action `authenticate`.
- **Base de Datos:** Modelo `User` con roles (ADMIN/USER) y Seed de admin.

### 🛒 Tienda (Frontend)
- **Navegación Dinámica:**
  - El menú (Desktop y Móvil) carga las categorías reales desde la Base de Datos (Server Component Wrapper).
  - **Buscador Integrado:** Barra de búsqueda en Desktop y dentro del Menú Móvil con redirección a `/search`.
- **Catálogo:**
  - Home Page (`/`) con grilla dinámica.
  - Filtrado por Categorías y Detalle de Producto.
  - Página de Resultados de Búsqueda (`/search?q=...`).
- **Carrito & Checkout:**
  - Estado Global persistente (Zustand).
  - `CartSidebar` (Sheet) para gestión rápida.
  - Validación de Stock en tiempo real antes de crear la orden.
  - **Integración WhatsApp:** Link inteligente usando el número configurado en el Admin.

### ⚙️ Administración (Backend Dashboard)
- **Configuración Dinámica:**
  - Página `/admin/settings` para cambiar el Teléfono de WhatsApp y Mensaje de Bienvenida sin tocar código.
- **Gestión de Pedidos:**
  - Tablero Kanban/Lista con filtros (Por Despachar, Por Pagar, Historial).
  - Control de estados (Pendiente/Pagado/Entregado).
- **Gestión de Inventario (CRUD Completo):**
  - **Productos:** Crear, Editar, Soft Delete, Imágenes (Cloudinary Unsigned).
  - **Categorías:** Crear, Editar, Eliminar (con protección si tiene productos).
- **Dashboard KPI:** Métricas financieras reales basadas en pagos confirmados.

## 2. Estructura de Carpetas (Resumen)
src/
├── actions/
│   ├── auth-actions.ts     # Login
│   ├── products.ts         # Productos (Public + Admin)
│   ├── categories.ts       # Categorías (NUEVO)
│   ├── product-form.ts     # Lógica Formulario Producto
│   ├── settings.ts         # Configuración Tienda
│   ├── dashboard.ts        # KPIs
│   └── order.ts            # Pedidos
├── app/
│   ├── (admin)/            # Panel Privado
│   │   ├── admin/
│   │   │   ├── categories/ # CRUD Categorías
│   │   │   ├── products/   # CRUD Productos
│   │   │   ├── orders/     # Gestión Pedidos
│   │   │   ├── settings/   # Configuración General
│   │   │   └── dashboard/  # Métricas
│   ├── (shop)/             # Tienda Pública
│   │   ├── search/         # Resultados Búsqueda
│   │   ├── category/       # Filtro Categorías
│   │   ├── product/        # Detalle
│   │   └── cart/           # Checkout
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Server Component (Data Fetching)
│   │   └── NavbarClient.tsx# Client Component (UI + Search)
│   ├── features/
│   │   ├── ProductForm.tsx
│   │   ├── CategoryForm.tsx
│   │   └── OrdersView.tsx
└── prisma/
    └── schema.prisma       # Modelos: Product, Category, Order, User, StoreConfig

## 3. Stack Técnico
- **Framework:** Next.js 15 (App Router)
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **BD:** Neon Tech (PostgreSQL) + Prisma v5.22
- **Estado:** Zustand (Persist)
- **Seguridad:** NextAuth v5 + Zod
- **Imágenes:** Cloudinary
- **UX:** Sonner (Toasts) + Skeletons

## 4. Dependencias Clave
- next: latest
- prisma: 5.22.0
- zod: latest
- zustand: latest
- next-auth: beta
- next-cloudinary: latest
- react-hook-form: latest
- sonner: latest

## 5. Próximo Paso (Sugerencias Futuras)
- **Reportes:** Exportar pedidos a Excel/PDF.
- **Cupones:** Sistema de descuentos simples.
- **SEO Avanzado:** Generar sitemap.xml y robots.txt.