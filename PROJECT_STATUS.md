# PROJECT_STATUS.md

## 1. Funcionalidad Actual

### 🔐 Seguridad & Auth (COMPLETADO)
- **NextAuth v5 Implementado:** Sistema de autenticación robusto basado en sesiones encriptadas.
- **Protección de Rutas:** Middleware (`middleware.ts`) que intercepta y bloquea el acceso a `/admin/*` si no hay sesión activa.
- **Login Profesional:**
  - Diseño "Glassmorphism" Central (Fondo abstracto generado con CSS, sin imágenes externas pesadas).
  - Manejo de estados de carga (spinners) y mensajes de error claros.
  - Server Action `authenticate` para validación segura contra BD.
- **Base de Datos:**
  - Modelo `User` con roles (ADMIN/USER).
  - Seed actualizado para crear usuario Admin por defecto (`admin@fiestasya.com`).
  - Contraseñas "hasheadas" con `bcryptjs`.

### 🛒 Tienda (Frontend)
- **Catálogo:**
  - Home Page (`/`) con grilla dinámica de productos.
  - Filtrado por Categorías (`/category/[slug]`) y Detalle de Producto (`/product/[slug]`).
  - **Filtro de Disponibilidad:** El cliente solo ve productos con `isAvailable: true`.
- **Carrito & Checkout:**
  - Estado Global persistente (Zustand + LocalStorage).
  - `CartSidebar` (Sheet) para gestión rápida sin salir de la navegación.
  - Página `/cart` con formulario de contacto (Nombre/Celular) y validación en tiempo real.
  - **Integridad de Stock:** Verificación backend de que el producto existe y está activo antes de crear la orden.
  - **Persistencia:** Los pedidos se guardan en BD (`PENDING`) antes de redirigir.
  - **Smart Link WhatsApp:** Redirección con mensaje pre-llenado incluyendo ID de pedido real.

### ⚙️ Administración (Backend Dashboard)
- **Layout Diferenciado:**
  - Arquitectura separada: `(shop)` con Navbar público vs `(admin)` con Sidebar lateral privado.
  - Sidebar inteligente con estados activos (`usePathname`).
- **Dashboard de Métricas:**
  - Tarjetas de KPIs (Ingresos reales, Pedidos, Productos, Bajo Stock).
  - Cálculo de ingresos basado en flag `isPaid` (dinero real) y no solo en estado de envío.
- **Gestión de Pedidos:**
  - Vista de Tabla (`/admin/orders`) con **Pestañas de Filtrado** (Todos, Por Despachar, Por Pagar, Historial).
  - Badges de colores para estados (Pendiente, Pagado, Entregado).
  - Detalle de Pedido (`/admin/orders/[id]`) con controles para cambiar estado y marcar como pagado.
- **Gestión de Productos (CRUD Completo):**
  - Tabla de productos con imágenes y stock.
  - **Borrado Lógico (Soft Delete):** Los productos se archivan (`isAvailable: false`) en lugar de borrarse físicamente.
  - Formulario Reactivo (`react-hook-form` + `zod`) para Crear y Editar.
  - **Imágenes:** Subida a Cloudinary mediante Widget (Unsigned preset).

### 🏗️ Arquitectura & Core
- **Server Actions (Backend for Frontend):**
  - `getProducts`: Soporta filtro `includeInactive` para el admin.
  - `getProduct`: Búsqueda por slug optimizada.
  - `createOrder`: Transacciones atómicas con validación de integridad.
  - `getOrders`: Serialización de datos (Decimal -> Number) para componentes cliente.
  - `deleteProduct`: Implementación de Soft Delete (Update flag + Slug change).
  - `getDashboardStats`: Consultas agregadas (`count`, `sum`) en paralelo.
- **Base de Datos:**
  - Modelos: Product, Category, Order, OrderItem, User.
  - Schema actualizado con Soft Delete (`isAvailable`).
  - Seeding inicial ejecutado.

## 2. Estructura de Carpetas (Actualizada)
src/
├── actions/
│   ├── auth-actions.ts     # Login Action
│   ├── products.ts         # CRUD Productos (Soft Delete)
│   ├── product-form.ts     # Lógica Crear/Editar
│   ├── dashboard.ts        # Métricas KPI
│   └── order.ts            # Gestión de Pedidos + Zod
├── app/
│   ├── (admin)/            # Grupo Privado
│   │   ├── layout.tsx      # Sidebar Layout
│   │   └── admin/
│   │       ├── dashboard/  # Métricas
│   │       ├── orders/     # Lista (Tabs) y Detalle
│   │       └── products/   # Lista y Formulario (New/Edit)
│   ├── (shop)/             # Grupo Público
│   │   ├── layout.tsx      # Navbar Layout
│   │   ├── page.tsx        # Home
│   │   ├── cart/           # Checkout
│   │   └── ...             # Rutas dinámicas
│   ├── auth/login/         # Login Glassmorphism
│   ├── api/auth/[...]/     # NextAuth Handler
│   └── ...
├── components/
│   ├── ui/                 # Shadcn (Input, Tabs, Table, etc.)
│   ├── layout/             # Navbar, Sidebar
│   └── features/
│       ├── ProductForm.tsx # Formulario Maestro
│       ├── OrdersView.tsx  # Vista Cliente con Tabs
│       └── ...
├── lib/
│   ├── prisma.ts           # Singleton DB
│   └── zud.ts              # Esquemas de validación
└── ...

## 3. Stack Técnico
- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript (Strict)
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **BD & ORM:** Neon Tech (PostgreSQL) + Prisma v5.22
- **Estado:** Zustand (Persist Middleware)
- **Seguridad:** NextAuth.js v5 (Beta) + BcryptJS
- **Validación:** Zod + React Hook Form
- **Imágenes:** Cloudinary (Next-Cloudinary Widget)
- **Arquitectura de Datos:** Soft Delete (Borrado Lógico)

## 4. Dependencias Clave
- next: latest
- prisma: 5.22.0
- zod: latest
- zustand: latest
- next-auth: beta
- next-cloudinary: latest
- react-hook-form: latest
- lucide-react: latest

## 5. Próximo Paso (Sugerido)
- **Configuración de Negocio (`/admin/settings`):** - Crear formulario para editar datos de la tienda (Teléfono de WhatsApp, Mensaje de bienvenida, etc.) y guardarlos en una tabla `StoreConfig` para no tenerlos hardcodeados en el código.