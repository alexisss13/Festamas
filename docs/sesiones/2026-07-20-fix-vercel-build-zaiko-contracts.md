# Fix del build de Vercel — `@zaiko/contracts` no resolvía fuera del monorepo local — 2026-07-20
> **Última actualización:** 2026-07-20

## Contexto

El usuario reportó el build de Vercel de `pos` fallando con
`Module not found: Can't resolve '@zaiko/contracts'`. Revisado el detalle
completo en `pos/docs/sesiones/2026-07-20-fix-vercel-build-zaiko-contracts.md`
— este documento es el resumen del mismo fix aplicado aquí en `ecommerce`,
que tenía el idéntico problema.

## Por qué era más grave acá que en `pos`

En `pos` el import roto estaba limitado a 6 rutas internas
(`api/internal/*`). En `ecommerce`, `@zaiko/contracts` se importaba también
desde `src/lib/ecommerce-context.ts` — el módulo que resuelve el tenant
activo y que se usa desde **prácticamente cada página del sitio** (layout
raíz, producto, checkout, admin...). Si este repo se hubiera desplegado a
Vercel tal cual estaba, el build habría fallado por completo, no solo unas
rutas internas.

## Fix aplicado

- Nuevo `src/lib/zaiko-contracts.ts` — copia exacta (mismo algoritmo HMAC,
  mismo payload canónico) de lo que provee `packages/contracts` en el
  monorepo local, que ya no se puede resolver desde un despliegue real.
- Repuntados los 3 imports: `src/lib/ecommerce-context.ts` y las rutas
  `api/internal/tenant/{health,lifecycle}`.
- `package.json`: quitado `"@zaiko/contracts": "file:../packages/contracts"`.
- `tsconfig.json`: quitado el path alias hacia `../packages/contracts`.
- `next.config.ts`: quitado `turbopack.root` (apuntaba fuera del repo) y
  `transpilePackages`; se dejó `turbopack: {}` explícito.

## Verificación

`npx tsc --noEmit` limpio. `rm -rf .next && npm run build` limpio de punta
a punta — 43 rutas compiladas, incluida `/` (que depende de
`ecommerce-context.ts`), cero errores, cero menciones a `@zaiko/contracts`.

## Pendiente

Falta commitear y pushear (no se hizo en esta sesión, como de costumbre) y
disparar un nuevo deploy en Vercel para que el fix quede activo en
producción.
