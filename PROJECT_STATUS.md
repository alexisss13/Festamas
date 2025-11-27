# PROJECT_STATUS.md

## 1. Funcionalidad Actual

### 🔐 Seguridad & Auth (NUEVO)
- **NextAuth v5 Implementado:** Sistema de autenticación robusto.
- **Protección de Rutas:** Middleware (`middleware.ts`) que bloquea `/admin/*` a usuarios no logueados.
- **Login Profesional:**
  - Diseño "Glassmorphism" Central (Fondo abstracto CSS, sin imágenes externas).
  - Manejo de estados de carga y error.
  - Server Action `authenticate` para login seguro.
- **Base de Datos:**
  - Modelo `User` con roles (ADMIN/USER).
  - Seed actualizado para crear usuario Admin por defecto (`admin@fiestasya.com`).
  - Passwords encriptados con `bcryptjs`.

### 🛒 Tienda (Frontend)
- **Catálogo:**
  - Home Page (`/`) con grilla dinámica de productos.
  - Filtrado por Categorías (`/category/[slug]`).
  - Detalle de Producto (`/product/[slug]`) con SEO metadata automática.
  - **Filtro de Disponibilidad:** Solo muestra productos con `isAvailable: true`.
- **Carrito & Checkout:**
  - Estado Global persistente (Zustand + LocalStorage).
  - `CartSidebar` (Sheet) para gestión rápida sin salir de la navegación.
  - Página `/cart` con formulario de contacto (Nombre/Celular).
  - **Validación Robusta:** Zod en backend y feedback visual en frontend (bordes rojos, limpieza al escribir).
  - **Persistencia de Pedidos:** Los pedidos se guardan en Neon DB (`PENDING`) antes de redirigir.
  - **Smart Link WhatsApp:** Redirección con mensaje pre-llenado incluyendo ID de pedido real (ej: #A1B2).

### ⚙️ Administración (Backend Dashboard)
- **Layout Diferenciado:**
  - Arquitectura de Layouts separada: `(shop)` con Navbar vs `(admin)` con Sidebar lateral.
  - Navbar eliminado de las rutas administrativas.
  - Sidebar inteligente (Active States) y Layout separado del cliente.
- **Gestión de Pedidos:**
  - Vista de Tabla (`/admin/orders`) conectada a la BD.
  - Visualización de estado (Pendiente/Pagado) con Badges.
  - Formato de moneda (PEN) y fechas localizados.
- **Gestión de Productos (NUEVO):**
  - Vista de Tabla (`/admin/products`) con imágenes y stock.
  - **Borrado Lógico (Soft Delete):** Los productos no se borran, se archivan (`isAvailable: false`).
  - Visualización de estado (Activo/Archivado) con Badges.

### 🏗️ Arquitectura & Core
- **Server Actions:**
  - `getProducts`: Soporta filtro `includeInactive` para el admin.
  - `getProduct`: Búsqueda por slug.
  - `createOrder`: Validaciones de integridad referencial.
  - `getOrders`: Consulta para el panel admin.
  - `deleteProduct`: Implementa Soft Delete (Update flag + Slug change).
- **Base de Datos:**
  - Modelos: Product, Category, Order, OrderItem.
  - Schema actualizado: Campo `isAvailable` en Product.
  - Seeding inicial ejecutado.
  - Soft Delete implementado a nivel de arquitectura.

## 2. Estructura de Carpetas (Actualizada)
src/
├── actions/
│   ├── auth-actions.ts     # Login Action
│   ├── products.ts         # CRUD Productos (Soft Delete)
│   └── order.ts            # Gestión de Pedidos + Zod
├── app/
│   ├── (admin)/            # Grupo Privado
│   │   ├── layout.tsx      # Sidebar Layout (Client Component)
│   │   └── admin/
│   │       ├── orders/     # Lista de pedidos
│   │       └── products/   # (NUEVO) Lista de productos + Delete
│   ├── (shop)/             # Grupo Público
│   │   ├── layout.tsx      # Navbar Layout
│   │   ├── page.tsx        # Home
│   │   ├── product/[slug]/ # Detalle
│   │   ├── category/[slug]/# Categorías
│   │   └── cart/           # Checkout Form
│   ├── auth/login/         # Login Glassmorphism
│   ├── api/auth/[...]/     # NextAuth Handler
│   ├── layout.tsx          # Root Layout (Limpio)
│   └── globals.css         # Estilos globales
├── auth.ts                 # (NUEVO) Lógica Auth + BD
├── auth.config.ts          # (NUEVO) Config Auth Edge-compatible
├── middleware.ts           # (NUEVO) Guardián de rutas
├── components/
│   ├── ui/                 # Shadcn (Input, Label, Table, Sheet, etc.)
│   ├── layout/
│   │   └── Navbar.tsx      # Navbar inteligente (Client Component)
│   └── features/
│       ├── ProductCard.tsx # Tarjeta de producto
│       └── CartSidebar.tsx # Drawer lateral
├── lib/
│   ├── prisma.ts           # Singleton DB
│   └── utils.ts
├── store/
│   └── cart.ts             # Estado global (Zustand)
└── prisma/
    └── schema.prisma       # Schema DB

## 3. Stack Técnico
- Framework: Next.js 15 (App Router)
- Lenguaje: TypeScript (Strict)
- Estilos: Tailwind CSS v4 + shadcn/ui
- Iconos: Lucide React (Exclusivo)
- BD & ORM: Neon Tech (PostgreSQL) + Prisma v5.22
- **Validación:** Zod (Backend) + React State (Frontend)
- **Estado:** Zustand (Persist Middleware)
- **UX:** Toasts (Pendiente), Sheets, Skeletons.
- **Seguridad:** NextAuth.js v5 (Beta) + BcryptJS.
- **Validación:** Zod.
- **Estilos:** Tailwind Grid (Split Layout).
- **Arquitectura de Datos:** Soft Delete (Borrado Lógico)

## 4. Dependencias Clave
- next: latest
- prisma: 5.22.0
- zod: latest (NUEVO)
- zustand: latest
- date-fns: (Opcional, usando Intl nativo por ahora)
- lucide-react: latest
- next-auth: beta
- bcryptjs: latest

## 5. Próximo Paso
- **Formulario de Producto:** Crear la página `/admin/products/new` para:
  - Subir imágenes a Cloudinary (Widget o API).
  - Crear y Editar productos (CRUD completo).
  - Validar datos de entrada.