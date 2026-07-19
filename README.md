# Ecommerce SaaS

Storefront ecommerce multi-tenant. Cada negocio puede operar varias sucursales,
con catálogo y stock sincronizados con el POS y una presentación configurable
por negocio o por sucursal.

## 🚀 Tecnologías (Stack)

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
- **UI Kit:** Shadcn/UI + Lucide React.
- **Backend:** Server Actions.
- **Base de Datos:** Neon Tech (PostgreSQL) + Prisma ORM.
- **Estado Global:** Zustand (Persistente).
- **Autenticación:** NextAuth v5 (Auth.js).
- **Imágenes:** Cloudinary.
- **Emails:** Resend.
- **Pagos:** Culqi Checkout y cargos server-side.

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd Festamas
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz y agrega las siguientes claves (pide los valores al administrador):

    ```env
    # Base de Datos (Neon Tech)
    DATABASE_URL="postgresql://..."

    # Autenticación (Generar con: npx auth secret)
    AUTH_SECRET="tu_secreto_super_seguro"

    # Cloudinary (Imágenes)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu_cloud_name"

    # Resend (Emails)
    RESEND_API_KEY="re_..."
    ADMIN_EMAIL="admin@tuempresa.com"
    
    # URL Base (Para producción)
    NEXT_PUBLIC_APP_URL="http://localhost:3000"

    # Culqi
    NEXT_PUBLIC_CULQI_PUBLIC_KEY="pk_test_..."
    CULQI_SECRET_KEY="sk_test_..."
    CULQI_WEBHOOK_SECRET="..."
    ```

4.  **Inicializar Base de Datos:**
    ```bash
    npx prisma generate
    npx prisma migrate deploy
    ```

5.  **Cargar Datos de Prueba (Semilla):**
    La semilla debe ejecutarse únicamente en entornos de desarrollo y debe
    configurarse para el tenant de prueba correspondiente.
    ```bash
    npx prisma db seed
    ```

6.  **Correr el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Visita `http://localhost:3000`.

## 📦 Funcionalidades Clave

### 🛒 Tienda (Cliente)
- Catálogo dinámico con buscador y filtros.
- Carrito de compras persistente.
- Cálculo de envíos (Local/Provincia).
- Cupones de descuento.
- Checkout con Culqi y confirmación de pago vía webhook.

### 🔐 Panel Administrativo (`/admin`)
- **Dashboard:** Métricas de ventas en tiempo real y gráficos.
- **Pedidos:** Gestión de estado (Pendiente/Pagado/Entregado) y exportación a Excel.
- **Catálogo ecommerce:** gestión de contenido comercial, publicación, SEO y
  merchandising; productos, stock y variantes siguen siendo responsabilidad del POS.
- **Configuración:** plantilla, tema, identidad visual, contenido y opciones
  propias del storefront activo.

La documentación central del workspace está en
`../docs/README.md`.

## 🤝 Contribución

1.  Hacer fork del proyecto.
2.  Crear una rama para tu feature (`git checkout -b feature/nueva-feature`).
3.  Hacer commit (`git commit -m 'Add some feature'`).
4.  Push a la rama (`git push origin feature/nueva-feature`).
5.  Abrir un Pull Request.

---
La identidad, dominio y textos se configuran por tenant; no se fijan en el código fuente.
