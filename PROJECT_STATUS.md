# PROJECT_STATUS.md

## 🚀 Funcionalidad Actual (Hitos Completados)
- [x] **Autenticación:** NextAuth v5 (Google Login).
- [x] **Catálogo:** Productos con variantes y control de stock.
- [x] **Carrito:** Persistencia con Zustand + Lógica de precios.
- [x] **Pasarela de Pagos:** MercadoPago Checkout Pro (Integration Robusta).
- [x] **Automatización:** Webhooks funcionales (Actualización automática de estado `PENDING` -> `PAID`).
- [x] **Despliegue:** Proyecto activo en Vercel con variables de entorno configuradas.

## 🏗️ Estructura Técnica Clave
src/
├── actions/
│   ├── payments.ts       # 🧠 Lógica de creación de Preferencia (con notification_url explícita)
│   └── order.ts          # Gestión de órdenes en BD
├── app/
│   ├── api/webhooks/mercadopago/ # 👂 Oído del sistema (Recibe el pago)
│   └── (shop)/checkout/  # Páginas de Feedback (Success/Failure)
└── components/providers/ # SessionProvider global

## ⚙️ Stack y Configuración
- **MercadoPago:** Credenciales de Producción (`APP_USR`) configuradas.
- **Webhook:** `https://festamas.vercel.app/api/webhooks/mercadopago`
- **Base de Datos:** Neon (PostgreSQL) con Prisma ORM.

## 🔜 Próximo Paso Inmediato
- **Historial de Pedidos:** Crear la vista "Mis Compras" en el perfil del usuario para que vea el estado de sus pedidos.
- **Correos Transaccionales:** Integrar Resend para enviar el recibo por email automáticamente.