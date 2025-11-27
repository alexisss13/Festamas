# PROJECT_STATUS.md

## 1. Funcionalidad Actual

### 🔐 Seguridad & Auth (NUEVO)
- **NextAuth v5 Implementado:** Sistema de autenticación robusto.
- **Protección de Rutas:** Middleware (`middleware.ts`) que bloquea `/admin/*` a usuarios no logueados.
- **Login Profesional:**
  - UI "Split Screen" con imagen de marca.
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
- **Gestión de Pedidos:**
  - Vista de Tabla (`/admin/orders`) conectada a la BD.
  - Visualización de estado (Pendiente/Pagado) con Badges.
  - Formato de moneda (PEN) y fechas localizados.

### 🏗️ Arquitectura & Core
- **Server Actions:**
  - `getProducts`: Listado general y por categoría.
  - `getProduct`: Búsqueda por slug.
  - `createOrder`: Transacción segura con validación Zod.
  - `getOrders`: Consulta para el panel admin.
- **Base de Datos:**
  - Modelos: Product, Category, Order, OrderItem.
  - Seeding inicial ejecutado.

## 2. Estructura de Carpetas (Actualizada)
src/
├── actions/
│   ├── auth-actions.ts     # (NUEVO) Login Action
│   ├── products.ts         # Lectura de catálogo
│   └── order.ts            # (NUEVO) Creación y lectura de pedidos + Validación Zod
├── app/
│   ├── (admin)/            # (NUEVO) Grupo Privado
│   │   ├── layout.tsx      # Sidebar Layout
│   │   └── admin/
│   │       └── orders/     # Página de lista de pedidos
│   ├── (shop)/             # Grupo Público
│   │   ├── layout.tsx      # (NUEVO) Navbar Layout (ShopLayout)
│   │   ├── page.tsx        # Home
│   │   ├── product/[slug]/ # Detalle
│   │   ├── category/[slug]/# Categorías
│   │   └── cart/           # Checkout Form
│   ├── api/auth/[...nextauth]/ # (NUEVO) API Route Handler
│   └── auth/login/         # (NUEVO) Página de Login Profesional
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
- **Gestión de Productos (CRUD):** Crear la página `/admin/products` para agregar productos reales, subir fotos a Cloudinary y editar stock.