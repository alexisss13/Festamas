# Documentación de Ecommerce

> **Última actualización:** 2026-07-18

Documentación **específica del ecommerce**. Lo transversal (contrato POS↔ecommerce, modelo SaaS, base de datos compartida) vive en el repo `pos`, que es la fuente maestra — ver la sección "Docs compartidos" abajo.

## Estructura

| Carpeta | Qué contiene |
|---|---|
| [`integraciones/`](integraciones/) | Servicios externos del ecommerce (Culqi, etc.): credenciales, webhooks, pendientes. |
| [`decisiones/`](decisiones/) | ADRs y decisiones técnicas del ecommerce. |
| [`sesiones/`](sesiones/) | Registro cronológico del trabajo del ecommerce (`YYYY-MM-DD-tema.md`). |

## Documentos

- [Configuración pendiente de Culqi](integraciones/CULQI_PENDING_SETUP.md)
- [ADR-001 — Alcance de la personalización del ecommerce](decisiones/ADR-001-saas-business-branch-template.md)
- [Auditoría y roadmap ecommerce SaaS](sesiones/2026-07-18-auditoria-roadmap-saas.md)
- [Fix del build de Vercel: `@zaiko/contracts` vendorizado](sesiones/2026-07-20-fix-vercel-build-zaiko-contracts.md)
- [Vistas de fallback: dominio sin negocio, sin sucursales, 404 y crash inesperado](sesiones/2026-07-21-vistas-fallback-storefront.md)

El roadmap transversal de despliegue compartido/dedicado, política offline,
planes y contratos POS–ecommerce vive en `pos/docs/` porque el POS es la fuente
maestra de la plataforma.

## Docs compartidos (viven en el repo `pos`)

Estos abarcan ambos proyectos y se mantienen en `pos/docs` porque el POS es la fuente maestra de productos, stock, sucursales y del esquema de la base compartida:

- `pos/docs/arquitectura/ECOMMERCE_POS_CONTRACT.md` — contrato POS ↔ ecommerce.
- `pos/docs/arquitectura/SAAS_MULTI_TENANT.md` — modelo SaaS multi-tenant.
- `pos/docs/operaciones/DATABASE_MIGRATIONS.md` — base de datos y migraciones compartidas.

## Regla de actualización

Cada cambio del ecommerce se documenta en la misma iteración (bajo la carpeta que corresponda), con su fecha `> **Última actualización:** YYYY-MM-DD`. Si un cambio toca el esquema compartido, actualizar también `pos/docs/operaciones/DATABASE_MIGRATIONS.md`.
