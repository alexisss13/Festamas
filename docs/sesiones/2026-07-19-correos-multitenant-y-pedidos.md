# Ecommerce: correos multi-tenant y aislamiento de pedidos

Fecha: 2026-07-19

## Correos transaccionales sin marca hardcodeada

Los correos de pedido nuevo y de cambio de estado ya no contienen nombres ni
URLs de clientes específicos.

- El nombre visible y el color principal se resuelven desde la sucursal activa,
  con el negocio como fallback.
- Las notificaciones de pedido nuevo se dirigen a los usuarios activos con rol
  OWNER, ADMIN o MANAGER del mismo negocio. Ya no se usa un correo global que
  pudiera cruzar tenants.
- Los asuntos, previsualizaciones, pie de correo y contenido usan el nombre
  dinámico de la tienda.
- La URL del storefront se configura únicamente con `NEXT_PUBLIC_APP_URL`; en
  desarrollo su fallback es local. Para producción debe configurarse por
  despliegue o dominio del tenant.
- `RESEND_FROM_EMAIL` sigue siendo una identidad verificada de la plataforma,
  como exige el proveedor. No se intenta usar remitentes no verificados de cada
  cliente.

## Aislamiento de pedidos

`getOrderById` ahora restringe explícitamente el detalle a pedidos ONLINE del
negocio y sucursal activos. Esto evita que el administrador de ecommerce use
esta vista para acceder accidentalmente a pedidos físicos del POS.

## Validación

- `tsc --noEmit` de ecommerce: correcto.

## Reseñas visibles solo dentro del tenant

- Crear o actualizar una reseña requiere que el producto esté activo,
  disponible y visible en la sucursal activa del negocio.
- Obtener reseñas comprueba primero el producto dentro del contexto ecommerce.
  Las pendientes (`includeAll`) exigen permisos administrativos; los clientes
  solo reciben reseñas aprobadas.
- La reseña personal del usuario se consulta únicamente si el producto pertenece
  al catálogo visible del tenant.
- `tsc --noEmit` de ecommerce: correcto.

## Favoritos aislados por catálogo visible

- La lista de favoritos del cliente se filtra por negocio y sucursal activos.
- Al agregar o retirar un favorito se verifica que el producto esté activo,
  disponible y visible en el catálogo de la sucursal. No se aceptan IDs de
  producto de otro tenant.
- `tsc --noEmit` de ecommerce: correcto.

## Pruebas de flujo de pedidos

- Se ejecutó la suite Jest de ecommerce: 2 suites y 10 pruebas correctas.
- Se amplió la máquina de estados para cubrir cancelación permitida antes de la
  entrega, bloqueo de reapertura de estados terminales y rechazo de saltos en
  fulfillment.
- Las pruebas existentes siguen cubriendo el cálculo del carrito. La próxima
  expansión de calidad debe incluir acciones de servidor con mocks de contexto
  multi-tenant y pruebas E2E contra staging.

## Validación integral de ecommerce

- El build de producción de ecommerce terminó correctamente después de los
  cambios de identidad SaaS, aislamiento por tenant, permisos y separación del
  maestro POS.
- Se generaron correctamente las 43 rutas del proyecto.
- Persiste únicamente la advertencia no bloqueante de
  `baseline-browser-mapping` desactualizado. Su actualización se mantiene como
  tarea de dependencias controlada para no alterar el lockfile de forma
  incidental.

## Separación definitiva entre POS y ecommerce

- Guardar configuración comercial de la tienda ahora requiere sesión y permiso
  de administración ecommerce.
- La acción heredada de crear o editar productos fue convertida en una barrera
  explícita: devuelve un mensaje claro y no ejecuta mutaciones.
- Se mantiene el contrato de producto: POS administra maestro, variantes,
  precios, stock e inventario; ecommerce administra presentación, marketing,
  pedidos y personalización del storefront.
- `tsc --noEmit` de ecommerce: correcto.

## Catálogos y colecciones protegidos

- La lectura pública de catálogos exige ahora negocio y sucursal explícitos;
  ya no muestra catálogos globales históricos de otro tenant.
- Crear o actualizar catálogos valida que la sucursal destino pertenezca al
  negocio activo antes de persistirla.
- Crear, editar, activar/desactivar y eliminar colecciones exige sesión con
  permiso administrativo ecommerce. Antes el scope por negocio existía, pero
  faltaba la barrera de autenticación.
- `tsc --noEmit` de ecommerce: correcto.

## Cupones y reseñas por tenant

- Al crear un cupón, la sucursal elegida se verifica contra el negocio activo;
  no se puede asociar un cupón a una sucursal de otro tenant mediante su ID.
- El incremento de uso de cupón se acota al negocio del contexto ecommerce.
- Aprobar o rechazar una reseña exige administración ecommerce y verifica que el
  producto reseñado pertenezca al negocio activo antes de actualizarla.
- `tsc --noEmit` de ecommerce: correcto.

## Secciones de inicio aisladas por sucursal

- Las secciones de inicio ya no reciben una sucursal arbitraria como parámetro
  desde el consumidor. Obtienen la sucursal activa desde el contexto validado
  del servidor.
- Se retiró el fallback `branchId = null` de lecturas, edición, ordenamiento y
  eliminación. Esos registros globales históricos podían aparecer en tiendas
  de otros negocios.
- Las nuevas secciones se crean con sucursal explícita y las existentes solo
  pueden modificarse si pertenecen a esa misma sucursal.
- `tsc --noEmit` de ecommerce: correcto.

## Aislamiento de categorías y checkout

- Las acciones de crear, editar y eliminar categorías exigen sesión con permiso
  de administración ecommerce y resuelven el negocio en servidor. El
  `businessId` enviado por el formulario se ignora deliberadamente.
- Las búsquedas y mutaciones por ID de categoría se restringen al negocio del
  contexto activo, cerrando un vector IDOR entre tenants.
- La consulta de idempotencia de Culqi ahora se acota por negocio, usuario y
  origen ONLINE antes de devolver el resultado de una orden previa.
- Se eliminó el último texto operativo ligado a una ciudad específica en la
  configuración de delivery.
- `tsc --noEmit` de ecommerce: correcto.
- `next build` de ecommerce: correcto (43 rutas).
- El build informa que `baseline-browser-mapping` está desactualizado. Es una
  advertencia de dependencia, no bloquea el build; se revisará al ejecutar una
  actualización de dependencias controlada.
- No se realizaron commits ni PRs.

## Storefront sin identidad de cliente embebida

- El layout raíz genera título y descripción desde el negocio y sucursal activos.
- Los términos y la política de privacidad generan sus metadatos y el nombre
  mostrado desde el mismo contexto; se retiraron referencias a una ciudad,
  canales de pago o flujos de WhatsApp específicos de un cliente.
- El pie de página ya no tiene nombre, color, dirección, teléfono ni formulario
  de devolución externo fijos. Dirige cambios y devoluciones al historial de
  pedidos, que es el flujo propio del ecommerce.
- `tsc --noEmit` volvió a terminar correctamente tras estos cambios.

## Ticket público y comprobantes por tenant

- El ticket público de pedido online dejó de deducir una marca desde notas del
  pedido. Resuelve nombre, logo, color, razón social, RUC y dirección desde la
  sucursal y negocio reales asociados al pedido.
- La búsqueda de metadata y la vista pública restringen el pedido al negocio
  ecommerce activo; la vista solo opera pedidos de fuente ONLINE.
- El control de acceso de cliente permanece ligado al propietario del pedido.
  Los roles administrativos autorizados pueden revisarlo dentro del negocio
  configurado, sin cruzar tenants.
- `tsc --noEmit` de ecommerce finalizó correctamente.

## Limpieza adicional de identidad SaaS

- Se sustituyeron títulos estáticos de páginas de carrito, búsqueda, perfil,
  favoritos, novedades y direcciones por títulos neutrales que el layout
  complementa con el nombre dinámico de la tienda.
- Los fallbacks de configuración, URL, checkout Culqi, dirección de recojo y
  exportación ya no incluyen nombres de clientes, ciudades o dominios ajenos.
- El selector administrativo usa nombres genéricos de variables y los badges
  visuales dejaron de exponer variantes ligadas a clientes específicos.
- `tsc --noEmit` finalizó correctamente después de la limpieza.

## SEO y colecciones por sucursal

- Las metadata de categorías, productos y colecciones usan el nombre del
  negocio o sucursal activos; no incluyen una ciudad o marca de ejemplo.
- Los encabezados y colores de colecciones se resuelven desde `brandColors` de
  la sucursal, con fallback del negocio, en lugar de inferir una marca desde
  códigos históricos.
- La clasificación interna por división se conserva solo donde el catálogo la
  requiere para consultar productos; no define identidad visual ni texto.
- `tsc --noEmit` de ecommerce: correcto.

## Plantillas y branding configurables por sucursal

- La selección de sucursal del storefront ahora usa la cookie neutral
  `ecommerce_branch_id`. Durante la transición se reconoce de solo lectura el
  nombre histórico de la cookie para no invalidar sesiones ya existentes; las
  nuevas selecciones administrativas y públicas escriben únicamente el nombre
  neutral.
- `StoreConfig` ya se resuelve primero por `(businessId, branchId)` y solo usa
  la configuración de negocio como fallback. Sus colores tienen a su vez
  fallback seguro hacia los colores de marca de la sucursal y luego del negocio.
- Las plantillas `classic`, `modern`, `playful`, `editorial` y `minimal` usan
  `data-template` y tokens CSS. Cambian radio, densidad y/o tipografía sin
  insertar nombres de clientes, textos comerciales ni reglas de negocio en el
  código.
- El panel `/admin/settings` persiste plantilla y los tres colores para la
  sucursal administrativa activa. Por tanto dos sucursales de un mismo negocio
  pueden usar storefronts visualmente distintos, mientras que las sucursales
  sin configuración propia heredan el tema configurado para el negocio.
- `next build` de ecommerce finalizó correctamente el 2026-07-19 (43 rutas).
  Persiste únicamente la advertencia no bloqueante de
  `baseline-browser-mapping` desactualizado. No se realizaron commits ni PRs.

## Resolución de negocio por dominio (SaaS compartido)

- Se añadió `Business.storefrontDomain`, opcional y único, al esquema operativo
  compartido por POS y ecommerce. La migración aditiva se creó y aplicó desde
  el historial propietario de POS: `20260719000000_add_business_storefront_domain`.
- El ecommerce resuelve el negocio desde `Host`/`X-Forwarded-Host` contra ese
  campo. Un dominio no registrado no puede escoger libremente otro tenant por
  cookie o parámetro de URL.
- Para no romper desarrollo local ni instalaciones monotenancy existentes,
  `ECOMMERCE_BUSINESS_ID` (preferida) y el nombre heredado
  `NEXT_PUBLIC_BUSINESS_ID` se mantienen como fallback únicamente cuando el
  host es local. En producción compartida debe registrarse el dominio del
  negocio.
- El sitemap usa ahora el negocio del contexto y la URL del host solicitado;
  dejó de indexar contenido con un ID de negocio y URL globales fijos.
- **Hecho (2026-07-19, sesión posterior):** `storefrontDomain` ya se expone
  únicamente en el panel de SUPER_ADMIN (`saas-platform`, permiso
  `tenant.configure` — ningún otro rol lo tiene) y ahora incluye verificación
  DNS/TLS on-demand (ver `saas-platform/docs/SESION_2026-07-19_DOMINIO_DNS_TLS.md`).
  Sigue pendiente automatizar esa verificación (polling/alertas periódicas) —
  eso sí requiere una decisión de producto (cadencia, a quién alertar) que no
  se tomó unilateralmente.
- Verificaciones: cliente Prisma regenerado, esquema compartido correcto y
  `next build` de ecommerce correcto (43 rutas). Sin commits ni PRs.
