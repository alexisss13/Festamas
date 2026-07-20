# Reglas del proyecto Ecommerce

## Documentación obligatoria — por repo
Toda modificación del ecommerce se documenta en `ecommerce/docs/` en la misma iteración (ver `ecommerce/docs/README.md`). **No hay `docs/` en la raíz del workspace.** Cada doc lleva bajo su título la línea `> **Última actualización:** YYYY-MM-DD`, que se actualiza en cada edición (no poner la fecha de hoy en un doc que no revisaste).

- `integraciones/` — servicios externos (Culqi, etc.): credenciales, webhooks, pendientes.
- `decisiones/` — ADRs y decisiones técnicas del ecommerce.
- `sesiones/` — registro cronológico del trabajo (`YYYY-MM-DD-tema.md`).

Los docs **transversales** (contrato POS↔ecommerce, modelo SaaS, base de datos compartida) viven en el repo `pos` (fuente maestra): `pos/docs/arquitectura/` y `pos/docs/operaciones/`. Consúltalos y refréncialos; no los dupliques aquí.

## Arquitectura SaaS
- `Business` = tenant aislado; `Branch` = sucursal/storefront dentro del tenant. **El ecommerce nunca mezcla negocios distintos.**
- La configuración visual usa valores genéricos de plantilla; no hardcodear nombres de clientes/marcas/negocios en la lógica. Precedencia de resolución: **Branch → Business → default de plataforma**.
- El **POS es la fuente maestra** de productos, variantes, precios, stock, sucursales y operación física. El ecommerce administra presentación, marketing, pedidos online y postventa.

## Base de datos compartida
`ecommerce` y `pos` comparten PostgreSQL y deben conservar schemas compatibles. No ejecutar `db push` en producción. Las migraciones se documentan en `pos/docs/operaciones/DATABASE_MIGRATIONS.md` y se aplican una sola vez con respaldo. Si el historial de Prisma está desalineado, no usar `migrate resolve` sin revisar primero el estado real de la base.

## Seguridad
- Nunca exponer secretos en `NEXT_PUBLIC_*`.
- Toda acción administrativa valida sesión, permisos, **negocio y sucursal activa**.
- No confiar únicamente en payloads de webhooks; validar contra el proveedor (Culqi, etc.).
- El ecommerce **no** modifica productos maestros, precios o stock salvo los flujos operativos explícitamente autorizados.

## Validación mínima
Antes de entregar: `tsc --noEmit` en `ecommerce` (y en `pos` si el cambio cruza el schema), tests existentes, `prisma generate` en el proyecto afectado.

## Handoff vigente
Antes de continuar el trabajo transversal, leer
`../pos/docs/sesiones/2026-07-19-HANDOFF_CONTINUIDAD_CLAUDE.md`. Contiene el
estado de la base compartida, migraciones, SaaS, verificaciones y pendientes.
