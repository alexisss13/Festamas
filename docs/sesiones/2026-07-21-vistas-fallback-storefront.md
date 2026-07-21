# Vistas de fallback: dominio sin negocio, sin sucursales, 404 y crash inesperado — 2026-07-21
> **Última actualización:** 2026-07-21

## Contexto

Verificando en vivo el flujo de creación de negocios (ver
`pos/docs/sesiones/2026-07-21-fix-proxy-bloqueaba-api-internal.md`), se
confirmó que ningún repo del monorepo tenía páginas de error/404 propias:
`ecommerce` y `saas-platform` no tenían ninguna, `pos` solo una acotada a
`/receipt/[businessId]/[code]`. Cualquier visitante real que llegara a un
dominio mal configurado, o a un producto/pedido inexistente, veía la
pantalla de error genérica de Next.js — sin marca, sin contexto.

## Qué se agregó en `ecommerce`

`getEcommerceContextFromCookie()` (usada por el layout raíz,
`src/app/layout.tsx`) lanza uno de dos errores esperados cuando no puede
resolver la tienda:

- `"No existe un negocio ecommerce activo para el dominio solicitado"` —
  el dominio no está asignado a ningún negocio (ver
  `2026-07-20-auto-dominio-storefront-provisioning.md`: esto ya no debería
  pasar para negocios nuevos, pero sigue siendo posible con dominios
  personalizados mal configurados).
- `"No se encontraron sucursales e-commerce para el negocio configurado"` —
  el negocio existe pero ninguna sucursal tiene `ecommerceCode` (raro ahora
  que se autoasigna al crear la sucursal, pero posible si alguien lo borra
  a mano).

Antes, `RootLayout` llamaba `getActiveStorefrontConfig()` (que internamente
llama a la función de arriba) sin capturar el error — lo tiraba sin manejar
y rompía toda la app. Ahora:

1. **`src/app/layout.tsx`**: el `try/catch` alrededor de
   `getActiveStorefrontConfig()` renderiza
   `<StorefrontUnavailable reason={...} />` en vez de propagar el error.
2. **`src/components/storefront/StorefrontUnavailable.tsx`** (nuevo):
   diferencia los dos mensajes conocidos ("tienda no existe" vs. "en
   preparación, sin sucursales") de cualquier otro fallo inesperado
   (mensaje genérico).
3. **`src/app/not-found.tsx`** (nuevo): antes no existía — las llamadas a
   `notFound()` ya presentes en `category/[slug]`, `collections/[slug]`,
   `product/[slug]`, `orders/[id]/*` caían al 404 default de Next.js.
4. **`src/app/global-error.tsx`** (nuevo): red de seguridad para cualquier
   otro crash inesperado en el árbol (no específico a la resolución de
   tienda) — debe ser Client Component con su propio `<html>/<body>` porque
   reemplaza el layout raíz cuando se activa (requisito de Next.js).

## Por qué no se usó `error.tsx` en vez del try/catch

`getEcommerceContextFromCookie()` se llama **dentro del layout raíz**
(`src/app/layout.tsx`), y un `error.tsx` normal no captura errores lanzados
por el layout que lo contiene — solo `global-error.tsx` puede, y ese
reemplaza toda la app (no permite un mensaje específico sin duplicar
lógica). Además, en producción Next.js recorta el `message` real de errores
de Server Components por seguridad (deja solo un `digest`), así que
diferenciar por texto en un error boundary habría sido frágil. Capturar el
error explícitamente en el propio layout, antes de que se propague, evita
ambos problemas.

## Qué se agregó, más simple, en `pos` y `saas-platform`

Solo `not-found.tsx` genérico en cada uno (enlace de vuelta a `/dashboard` o
`/admin`) — son herramientas internas, no de cara al cliente final, así que
no se justificaba el mismo nivel de detalle que en `ecommerce`.

## Verificación

`npx tsc --noEmit` limpio, `rm -rf .next && npm run build` limpio — sin
errores, sin advertencias nuevas.
