# Dashboard de rendimiento de catálogo (métricas con datos propios) — 2026-07-22
> **Última actualización:** 2026-07-22

## Contexto

Tercer y último pendiente grande de Fase 6 identificado el 2026-07-21:
"métricas de marketing". Al investigar antes de construir, se confirmó que
no existe ningún campo de atribución de canal/campaña (`utm`, `referrer`) en
ninguna tabla — GA/Meta Pixel mandan datos hacia afuera, pero nada vuelve a
la base propia. Eso descarta "atribución de marketing" real (de dónde vienen
las ventas) sin integrar la API de GA/Meta, para la cual no hay credenciales.
Se acotó a lo que sí es posible con datos propios: rendimiento de catálogo
(vistas vs. ventas reales por producto).

## Bug encontrado y corregido: `Product.salesCount` nunca se incrementaba

Confirmado por `grep` en ambos repos: ningún flujo de pago (ni el webhook de
Culqi ni `finalizePaidOrder`) escribía nunca a `Product.salesCount`, pese a
que **ya se usaba** para ordenar resultados en
`/api/search/suggestions` y `/api/search/top-products` (`orderBy: {
salesCount: 'desc' }`). Esas dos rutas llevaban tiempo ordenando por un
campo siempre en su valor inicial — el orden "más vendidos" nunca reflejó
ventas reales. Se corrigió en `finalizePaidOrder` (`actions/payments.ts`),
en el mismo punto donde ya se descuenta stock por cada ítem: ahora
incrementa `salesCount` del producto correspondiente a cada `OrderItem`
pagado.

**Nota:** el fix solo afecta ventas *a partir de ahora* — no recalcula
retroactivamente pedidos ya pagados antes de este cambio. Por eso el nuevo
dashboard de rendimiento **no usa `salesCount`** para su propio cálculo
(sería incompleto para el histórico) — calcula ventas reales agregando
`OrderItem` directamente, igual que ya hacía `getTopProducts` del dashboard
de ventas existente.

## `getProductPerformance` (actions/dashboard.ts)

Por producto activo: `viewCount` (real, se incrementa en cada visita a la
página de detalle — confirmado antes de construir sobre él), unidades
vendidas y ganancia (computadas desde `OrderItem` pagado), y tasa de
conversión (`unidadesVendidas / viewCount`). Si `viewCount` es 0, la
conversión es `null` (se muestra "—"), no `0%` — para no sugerir "cero
conversión" cuando en realidad es "sin datos suficientes para calcularla".

## Página `/admin/marketing/performance`

Nueva, enlazada en el sidebar bajo "Marketing" junto a "Cupones". Tres
tarjetas de resumen (vistas totales, unidades vendidas, conversión general)
+ tabla por producto ordenada por vistas. Nota visible al pie explicando la
limitación (sin atribución de canal, requiere GA/Meta).

## Hallazgo durante la verificación en vivo (no es un bug)

Contra datos reales de Festamas en staging: "Conversión general: 3100%" —
matemáticamente correcto (31 unidades vendidas contra 1 sola vista
registrada), pero raro a primera vista. Causa real: el listado de productos
tiene botón "Agregar" directo en cada tarjeta — la mayoría de compras nunca
requieren visitar la página de detalle del producto, así que `viewCount`
subestima sistemáticamente el interés real. Es información genuina que el
dashboard revela, no un error de cálculo — se deja tal cual, sin capar el
porcentaje artificialmente.

## Verificación

- `npx tsc --noEmit`: limpio.
- `npm test`: 6/6 suites, 31/31 tests (sin relación directa, confirma que
  nada se rompió).
- `npm run build`: limpio, `/admin/marketing/performance` aparece en la
  lista de rutas.
- Prueba en vivo contra staging (sesión real de admin de Festamas): la
  página carga con datos reales, formato de moneda/porcentaje correcto,
  "—" se muestra correctamente cuando no hay vistas.

## Actualización 2026-07-23: backfill de `salesCount` ya corrido

`scripts/backfill-sales-count.ts` (nuevo) recalcula `salesCount` desde la
fuente real — suma `OrderItem.quantity` de pedidos con `isPaid = true`,
agrupado por producto vía `variant.productId` — y **sobrescribe** el valor
(no incrementa), por lo que es idempotente sin importar cuántas veces se
corra ni si el fix en vivo ya sumó ventas recientes encima.

Probado primero contra la rama de staging de Neon (35/187 productos con
histórico, coincide con producción salvo un producto de prueba adicional en
staging), corrido dos veces para confirmar 0 cambios en la segunda corrida
(idempotente). Corrido después contra producción: **35/186 productos
actualizados** (de 0 al conteo real, entre 1 y 9 ventas históricas cada
uno), segunda corrida confirmó 0 cambios. Aviso del propio script: 2
`OrderItem` de pedidos pagados con `variantId` nulo (variante borrada
después de la venta) quedan fuera del conteo — no atribuibles a ningún
producto, no afecta la corrección del resto.

## Qué queda pendiente

- Atribución real de marketing (canal/campaña) — requiere integrar GA
  Reporting API o Meta Ads API, bloqueado por falta de credenciales.
