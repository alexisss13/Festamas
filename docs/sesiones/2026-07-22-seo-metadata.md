# SEO: metadataBase, canonical, Twitter cards, noindex — 2026-07-22
> **Última actualización:** 2026-07-22

## Corrección de diagnóstico

Al proponer este trabajo se afirmó que "ninguna página de producto/categoría"
tenía SEO. Era **incorrecto** — un `grep` mal leído. La realidad: producto,
categoría y colecciones ya tenían `generateMetadata` con título/descripción/OG,
y la página de producto incluso JSON-LD de schema.org (`Product`, con precio y
disponibilidad). El sitemap dinámico (`sitemap.ts`) ya lista productos,
categorías y colecciones reales con prioridades correctas, y `robots.ts` ya
bloquea `/admin/` y `/auth/`. Se corrige acá para que quede escrito
correctamente — el trabajo real de esta sesión fue más acotado de lo que se
planteó al inicio.

## Qué faltaba de verdad (y se cerró)

- **`metadataBase` sin definir** — nuevo `src/lib/request-site-url.ts`
  (mismo patrón que ya usaba `sitemap.ts`: deriva la URL real del negocio
  desde `x-forwarded-host`, no de un env var fijo — necesario porque cada
  negocio puede tener su propio `storefrontDomain`). Sin esto, Next.js no
  podía resolver correctamente las URLs de imágenes OG relativas, y advertía
  en el build.
- **Twitter cards** — agregadas junto a cada bloque `openGraph` existente
  (producto, categoría, colecciones, `new-arrivals`, `tiendas`, layout raíz).
- **Canonical URLs** — en producto, categoría, colecciones y `new-arrivals`,
  apuntando siempre a la ruta sin query params de filtro/paginación (evita
  que Google indexe `/category/x?sort=...&min=...` como contenido duplicado).
- **`noindex` en páginas personales/transaccionales** — carrito, checkout
  (éxito/fallo), perfil y sus subpáginas (direcciones, pedidos), favoritos,
  búsqueda interna, factura de pedido, formulario de devolución. Ninguna de
  estas debía indexarse (o no tienen valor de SEO propio, o exponen datos
  personales del comprador). `profile/orders/page.tsx` es un Client Component
  y no puede exportar `metadata` directamente — se resolvió con un
  `layout.tsx` nuevo en esa misma carpeta.
- **`tiendas` (localizador de tiendas físicas)** no tenía ninguna metadata —
  ahora tiene título/descripción/OG/Twitter/canonical propios.

## Bug encontrado y corregido de paso (no estaba en el plan)

Al verificar en vivo, el `<title>` de producto/categoría/colecciones salía
**duplicado** — ej. "Patineta Infantil | Festamas | Festamas". Causa: cada
página ya componía `"${título} | ${negocio}"` a mano, y el layout raíz
**también** envuelve el título con su propio template (`%s | ${negocio}`),
duplicando el nombre. Se corrigió quitando el sufijo manual en las 4 páginas
afectadas (producto, categoría, colecciones lista+detalle, tiendas) — el
layout raíz ya lo agrega una sola vez. Verificado con `curl` contra el HTML
real servido, no solo revisando el código.

## Verificación

- `npx tsc --noEmit`: limpio.
- `npm test`: 6/6 suites, 31/31 tests (sin cambios de este trabajo, pero
  confirmado que nada se rompió).
- `npm run build`: limpio, **sin advertencia de `metadataBase`** (antes del
  fix, Next.js la reportaba).
- Prueba en vivo con `curl` contra el servidor real: `<title>` correcto en
  las 5 páginas afectadas, `og:title`/`og:image`/`twitter:card` presentes con
  datos reales en la página de producto, `<link rel="canonical">` presente
  en `new-arrivals`.

## Qué queda fuera de esta sesión

- `Category`/`ProductCollection` no tienen sus propios campos
  `metaTitle`/`metaDescription` en el schema (a diferencia de `Product`, que
  sí los tiene) — hoy su SEO se genera automáticamente desde el nombre. Es
  una mejora incremental (requiere migración de schema), no un defecto.
- Preview/publicación y métricas de marketing (los otros dos pendientes de
  Fase 6 identificados en la sesión anterior) siguen sin empezar.
