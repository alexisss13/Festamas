# 🎉 FiestasYa E-commerce

Plataforma de comercio electrónico moderna y escalable para la venta de artículos de fiesta. Desarrollada con las últimas tecnologías web.

## 🚀 Tecnologías (Stack)

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4.
- **UI Kit:** Shadcn/UI + Lucide React.
- **Backend:** Server Actions.
- **Base de Datos:** Neon Tech (PostgreSQL) + Prisma ORM.
- **Estado Global:** Zustand (Persistente).
- **Autenticación:** NextAuth v5 (Auth.js).
- **Imágenes:** Cloudinary.
- **Emails:** Resend.
- **Pagos:** Coordinación vía WhatsApp Smart Links.

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/alexisss13/FiestasYa.git](https://github.com/alexisss13/FiestasYa.git)
    cd FiestasYa
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
    ```

4.  **Inicializar Base de Datos:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Cargar Datos de Prueba (Semilla):**
    Esto creará el usuario Admin inicial (`admin@fiestasya.com` / `123456`) y categorías base.
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
- Checkout vía WhatsApp con mensaje detallado.

### 🔐 Panel Administrativo (`/admin`)
- **Dashboard:** Métricas de ventas en tiempo real y gráficos.
- **Pedidos:** Gestión de estado (Pendiente/Pagado/Entregado) y exportación a Excel.
- **Productos:** CRUD completo con gestión de stock e imágenes.
- **Configuración:** Edición de teléfono de contacto y precios de envío.

## 🤝 Contribución

1.  Hacer fork del proyecto.
2.  Crear una rama para tu feature (`git checkout -b feature/nueva-feature`).
3.  Hacer commit (`git commit -m 'Add some feature'`).
4.  Push a la rama (`git push origin feature/nueva-feature`).
5.  Abrir un Pull Request.

---
&copy; 2025 FiestasYa. Trujillo, Perú.