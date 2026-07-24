# Endurecimiento de seguridad + cobertura de tests (Fase 10) — 2026-07-22
> **Última actualización:** 2026-07-22

## Contexto

Al auditar qué faltaba en cada repo, se encontró que `ecommerce` — la tienda
pública, la que recibe tráfico anónimo real y procesa pagos con Culqi — era
el repo con **menos blindaje** de los tres: 3 archivos de test en total (cero
pruebas de checkout/webhook/auth), sin rate limiting y sin cabeceras de
seguridad, mientras que `saas-platform` (herramienta interna) ya tenía ambas
cosas desde una sesión anterior. Se decidió priorizar esto sobre CMS/checkout
nuevo porque es la mayor superficie de riesgo real del stack.

## Cabeceras de seguridad (`next.config.ts`)

Calcadas de `saas-platform/next.config.ts` (`X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`,
HSTS) — esas van **bloqueantes** desde ya, no tienen riesgo de romper nada.

La `Content-Security-Policy` va **en modo Report-Only**, a propósito, no
bloqueante todavía. Razón: esta tienda carga Culqi (widget de pago inyectado
dinámicamente), Google Analytics y Meta Pixel (scripts inline con contenido
dinámico) — sin poder disparar una transacción real de Culqi para confirmar
en vivo que el allowlist cubre absolutamente todo, forzar el bloqueo desde el
día uno arriesga tirar el checkout real. El allowlist se armó revisando el
código real (`grep` de todos los `<script src=...>` y `<Image src=...>`
externos), no copiando la política estricta de saas-platform a ciegas — esa
no tiene estos terceros y no aplica igual aquí.

**Pendiente explícito, no resuelto en esta sesión:** revisar las violaciones
que reporte el navegador (o un `report-uri` si se configura) durante unos
días de tráfico real, y solo entonces pasar de
`Content-Security-Policy-Report-Only` a `Content-Security-Policy` bloqueante.

## Rate limiting

Mismo patrón in-memory que `saas-platform/src/lib/rate-limit.ts` (mismo
caveat documentado: por proceso, no sirve con más de una réplica sin mover a
un store compartido como Redis).

- Login (`authenticate` en `auth-actions.ts`): 5 intentos / 15 min, por
  IP+correo — igual que el límite que ya usa saas-platform para su login.
- Registro (`registerUser`): 5 registros / hora, por IP — nuevo, frena
  creación masiva de cuentas.
- Cargo de checkout (`createCulqiChargeForCheckout` en `payments.ts`): 10
  intentos / 15 min, **por usuario autenticado, no por IP** — frena la
  prueba rápida de tarjetas robadas contra una misma cuenta sin bloquear a
  un comprador real que reintenta tras una tarjeta rechazada.
- **Deliberadamente sin rate limit:** el webhook de Culqi
  (`/api/webhooks/culqi`). Ahí la seguridad viene de la verificación
  obligatoria contra la API real de Culqi con la secret key (nunca se confía
  en el body del webhook), no de limitar intentos — limitar por IP ahí
  arriesga bloquear entregas legítimas de Culqi en un pico de ventas real,
  un riesgo peor que el que se evitaría.

## Cobertura de tests (3 → 6 suites, 13 → 31 tests)

Se extrajo lógica pura de tres puntos sensibles para poder probarla sin
mockear Prisma/fetch, siguiendo el mismo estilo que ya usaba
`order-state-machine.test.ts` (función pura + test directo):

- `src/lib/rate-limit.ts` → `rate-limit.test.ts`: permite hasta el máximo,
  bloquea después, resetea tras la ventana, `resetRateLimit` funciona,
  claves independientes no se pisan.
- `src/lib/culqi-charge.ts` (nuevo, extraído del webhook) → 
  `culqi-charge.test.ts`: las tres señales de aprobación (`paid`, `status`,
  `outcome.type`), rechazo correcto, extracción de `order_id` con la
  prioridad correcta (cargo confirmado por Culqi antes que el body del
  webhook, que no es de fiar).
- `src/lib/registration-validation.ts` (nuevo, extraído de `registerUser`) →
  `registration-validation.test.ts`: las 3 reglas de validación.

El webhook y `registerUser` ahora **usan** estas funciones extraídas — mismo
comportamiento, ahora testeado.

## Verificación

- `npm test`: 6/6 suites, 31/31 tests.
- `npx tsc --noEmit`: limpio.
- `npm run build`: limpio.
- Prueba en vivo: homepage carga con datos reales y precios correctos, cero
  violaciones de CSP reportadas en consola (modo Report-Only, se verían como
  advertencia si algo fallara) — cabeceras confirmadas por `curl -I` contra
  el servidor real.

## Qué queda fuera de esta sesión

- Pasar la CSP de Report-Only a bloqueante (pendiente de observar tráfico
  real primero).
- Cobertura de tests para el resto del checkout (creación de pedido,
  reserva de stock, cupones) — se priorizaron los 3 puntos más sensibles
  (rate limit, verificación de pago, validación de registro), no es
  cobertura exhaustiva.
- `typescript: { ignoreBuildErrors: true }` en `next.config.ts` — no se tocó
  (fuera de alcance de esta sesión), pero vale la pena revisar en otro
  momento: significa que errores de tipo futuros no bloquearían el build.
