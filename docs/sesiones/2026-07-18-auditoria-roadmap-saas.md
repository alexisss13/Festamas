# Auditoría y roadmap del ecommerce SaaS

> **Última actualización:** 2026-07-18

## Objetivo

Registrar qué existe actualmente en ecommerce, qué falta para convertirlo en un
ecommerce SaaS profesional y cómo se relaciona con el roadmap transversal del
POS. El plan maestro vive en `pos/docs/roadmap/`; este documento contiene el
detalle específico del ecommerce.

## Línea base encontrada

- 5 rutas API directas; la mayoría de operaciones se implementan con server actions.
- 93 archivos de componentes.
- 33 archivos bajo `src/lib`.
- 1 suite de pruebas visible.
- 38 migraciones Prisma en el repositorio.
- Configuración visual por `Business` y `Branch` ya iniciada.
- Checkout, reservas, pedidos online, tracking, tickets, devoluciones y
  personalización ya tienen piezas implementadas.

La cantidad de migraciones no debe interpretarse como independencia del POS:
ambos repositorios usan la misma base y deben seguir la estrategia maestra de
`pos/docs/operaciones/DATABASE_MIGRATIONS.md`.

## Estado por dominio

### Identidad SaaS y contexto

**Parcial avanzado.** Existe resolución de negocio/sucursal, cookie de sucursal,
configuración por niveles y plantillas genéricas. Falta centralizar la política
de contexto para que páginas, actions, API routes y tareas no implementen reglas
distintas.

### Catálogo

**Parcial.** El ecommerce muestra productos del POS y administra contenido
comercial. Debe quedar bloqueada cualquier mutación de nombre maestro, variantes,
precio base, costo, stock, categoría operativa o proveedor.

### CMS y marketing

**Parcial avanzado.** Existen banners, popups, secciones, catálogos, colecciones,
cupones, reseñas y SEO. Faltan editor de páginas, preview/publicación, reglas de
merchandising y analítica de embudo.

### Checkout y pedidos

**Avanzado, pendiente de pruebas integrales.** Hay carrito persistente, reservas,
selección de entrega, pedidos online, ticket y estados de fulfillment. Falta
probar concurrencia, reintentos, cancelación, devolución y coordinación con el
POS en escenarios completos.

### Postventa

**Parcial avanzado.** Existen solicitudes de cambio/devolución y estructura para
reembolsos. Debe verificarse que el cambio de estado no ejecute por sí solo una
devolución de stock o un reembolso financiero sin autorización operativa.

### Administración ecommerce

**Parcial.** Tiene dashboard, pedidos, productos, colecciones, banners, popups,
reseñas, cupones y configuración. La principal corrección pendiente es imponer
de forma técnica el límite POS vs ecommerce y añadir permisos por negocio,
sucursal y acción.

## Roadmap específico del ecommerce

### E1 — Base y seguridad ecommerce

1. Crear contexto ecommerce único.
2. Revisar todas las server actions con `businessId` y `branchId`.
3. Añadir tests de aislamiento entre dos negocios y dos sucursales.
4. Definir qué puede hacer cada rol ecommerce.
5. Auditar IDs recibidos desde formularios, URLs y server actions.
6. Registrar auditoría de cambios de contenido y configuración.

**Cierre:** ninguna action ecommerce puede operar un recurso de otro negocio o
sucursal y todas las mutaciones relevantes tienen pruebas negativas.

### E2 — Contrato de catálogo POS → ecommerce

1. Definir campos maestros de solo lectura.
2. Definir campos ecommerce editables.
3. Bloquear en backend, no solo ocultar en UI, precio, costo, stock y variantes.
4. Formalizar publicación por canal y sucursal.
5. Manejar productos archivados, no disponibles y sin stock.
6. Validar que las consultas filtren `availableChannels` correctamente.

**Cierre:** ningún usuario ecommerce puede modificar la fuente maestra del POS.

### E3 — Plantillas y temas

1. Registrar plantillas disponibles en configuración global.
2. Validar `templateKey` contra un catálogo de plantillas.
3. Resolver precedencia Branch → Business → default.
4. Separar tokens de color, tipografía, espaciado y layout.
5. Crear preview de sucursal antes de publicar.
6. Crear fallback seguro si falta una configuración.
7. Probar visualmente dos sucursales del mismo negocio con temas distintos.

**Cierre:** agregar un nuevo cliente requiere configuración, no condicionales en
componentes ni textos hardcodeados.

### E4 — CMS y merchandising

1. Editor de páginas y secciones.
2. Ordenamiento y programación de banners, popups y campañas.
3. Colecciones dinámicas por categoría, tags, stock, precio o temporada.
4. Campos SEO por producto, categoría, colección y página.
5. Preview y publicación con auditoría.
6. Paginación server-side en todas las listas grandes.

### E5 — Checkout y fulfillment

1. Tests de carrito, reserva y liberación.
2. Idempotencia para crear pedido y confirmar pago.
3. Selección y recomendación de sucursal con stock.
4. Confirmación operativa de sucursal de empaquetamiento.
5. Ticket online separado de venta física.
6. Estados de pedido y pago independientes.
7. Tracking y comunicación de estados.

### E6 — Postventa

1. Flujo de solicitud.
2. Revisión y aprobación.
3. Recepción del producto.
4. Resolución: cambio, devolución, crédito o reembolso.
5. Reposición de stock en sucursal autorizada.
6. Auditoría y referencia del reembolso.
7. Tests de duplicación y reintentos.

### E7 — Marketing y analítica

1. Dashboard de conversión.
2. Carritos abandonados como módulo desacoplado.
3. Cupones y promociones con reglas explícitas.
4. Reseñas moderadas.
5. Wishlist compartible.
6. Búsqueda URL y filtros avanzados.
7. Métricas por negocio, sucursal, campaña y canal.

### E8 — Calidad y operación

1. Tests de server actions.
2. Tests de permisos.
3. Tests POS ↔ ecommerce.
4. Tests de configuración visual.
5. Tests de serialización Decimal/Date/JSON hacia Client Components.
6. Logs con tenant, sucursal, usuario y pedido.
7. Smoke test del storefront y admin.

## Dependencias con POS

- El POS define productos, variantes, precios, stock y sucursales.
- Los cambios de schema deben reflejarse en ambos clientes Prisma.
- Los movimientos de stock y operaciones físicas deben permanecer en el dominio
  operativo autorizado.
- El ecommerce no debe crear un segundo maestro de catálogo.
- Las pruebas de pedido online deben comprobar el estado resultante en POS.

## Alcance transversal de producto

ecommerce no debe quedar diseñado únicamente para tiendas de productos. El
roadmap de la plataforma contempla negocios de comercio, restaurantes,
servicios y profesionales. El ecommerce debe consumir capacidades del núcleo
según el tipo de negocio: catálogo para retail, menú y pedidos para restaurantes,
y catálogo de servicios/citas para profesionales cuando esos módulos existan.

La habilitación de cada capacidad será administrada por el `SUPER_ADMIN` a
través de planes, módulos y entitlements; no mediante nombres de clientes ni
condicionales específicos.

La profundidad del storefront dependerá del plan: restaurantes podrá comenzar
con catálogo y pedidos, y desbloquear mesas, menú QR, reservas, delivery y
campañas; servicios y profesionales priorizarán agenda/citas junto con CRM,
cotizaciones y órdenes de servicio.

## Pendientes no bloqueados por credenciales externas

- Aislamiento y permisos.
- Tests ecommerce.
- Bloqueo de campos POS.
- Plantillas y preview.
- CMS y merchandising.
- Paginación y filtros.
- Métricas internas.
- Flujo de devoluciones.
- Contrato POS–ecommerce.
- Documentación y migraciones.

## Iteración de integración SaaS

- Se añadió `src/lib/ecommerce-entitlements.ts` para resolver la capacidad
  `ecommerce.store` desde override o plan vigente.
- El checkout verifica esta capacidad antes de reservar stock y crear el pedido.
- La verificación se encuentra detrás de `SAAS_ENTITLEMENTS_ENABLED` para
  permitir una activación controlada después de aplicar la migración compartida.

## Pendientes que sí dependen de acceso externo

- Activación real de Culqi.
- Validación real del webhook.
- Pruebas con credenciales de prueba/live.

Estos pendientes no deben detener el desarrollo de las fases E1–E4 ni la mayor
parte de E5–E8; se documentan en
`ecommerce/docs/integraciones/CULQI_PENDING_SETUP.md`.

## Iteración checkout: idempotencia y estados independientes

- Se añadió `PaymentStatus` al contrato compartido, separado de `OrderStatus`.
- Los pedidos ahora conservan `idempotencyKey` único y `paymentError`.
- El checkout evita crear nuevamente un pedido cuando la misma operación ya fue confirmada o está en procesamiento.
- Los pagos rechazados quedan marcados como fallidos y requieren una nueva clave.
- La migración correspondiente está incluida en `pos/prisma/hotfix_saas_plans.sql` y sigue pendiente de ejecución controlada.

## Iteración fulfillment y máquina de estados

- Se formalizaron transiciones válidas de pedido: pago, preparación, envío,
  recojo, entrega y cancelación.
- Se bloquean retrocesos peligrosos, como devolver un pedido pagado a pendiente
  sin un reembolso.
- La actualización administrativa sincroniza `isPaid` con `paymentStatus`.
- El control de empaquetamiento continúa confirmando la sucursal final y
  registrando el movimiento entre stocks cuando la sucursal cambia.
- El acceso de administración evita desmarcar manualmente un pago confirmado.

## Iteración postventa y ticket dinámico

- Las devoluciones completas y parciales actualizan `paymentStatus` a
  `REFUNDED` o `PARTIALLY_REFUNDED`.
- La reposición de stock continúa dentro de la misma transacción que cierra la
  solicitud, evitando completar una devolución sin registrar inventario.
- El ticket online ahora usa datos del `Business` y `Branch`: nombre, RUC,
  dirección, teléfono y razón social configurados.
- El comprobante se presenta como ticket de pedido online y no como boleta o
  factura, manteniendo la decisión operativa actual.
- Se eliminaron los valores de marca y datos fiscales hardcodeados del ticket.
- El ticket administrativo ahora exige sesión, permiso de ecommerce y
  coincidencia de `businessId`, corrigiendo un posible acceso por IDOR.
- La vista administrativa de invoice y edición de catálogos ahora aplica la
  misma validación de sesión, permiso y tenant.
- Invoice dejó de usar marcas, logos, RUC, dirección y correo hardcodeados;
  toma la configuración del negocio y la sucursal.
- Se extrajo la máquina de estados a `src/lib/order-state-machine.ts` y se
  añadieron pruebas automatizadas para flujo normal, retrocesos peligrosos e
  idempotencia de estado.

## Iteración CMS, marketing y aislamiento tenant-aware

- `Banner`, `Catalog` y `Coupon` incorporan `businessId` en ambos schemas.
- Banners, catálogos y cupones administrativos requieren sesión y permisos.
- Las lecturas y mutaciones se filtran por negocio y, cuando corresponde, por
  sucursal activa.
- Los cupones nuevos quedan asociados al negocio y a una sucursal explícita,
  evitando códigos globales ambiguos entre tenants.
- La SQL idempotente agrega las columnas e índices, pero requiere ejecución
  controlada y eventual backfill de registros antiguos.
