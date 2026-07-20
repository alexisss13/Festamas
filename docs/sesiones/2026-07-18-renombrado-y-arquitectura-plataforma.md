# Renombrado del proyecto y decisión de unificación

> **Última actualización:** 2026-07-18

## Cambio de nombre

El repositorio de storefront pasó de llamarse `Festamas` a `ecommerce`. El
nombre de una marca concreta queda reservado para configuración de negocio,
plantillas y contenido, no para la identidad técnica del proyecto.

Se actualizaron referencias de rutas en los documentos, `CLAUDE.md`, README y
la documentación de la plataforma. La carpeta antigua solo conservaba metadata
Git residual y fue apartada como `ecommerce-legacy-git-backup` para mantener una
recuperación reversible.

## Unificación POS + ecommerce

La recomendación es un monorepo futuro con tres aplicaciones separadas:

- POS/ERP;
- ecommerce/storefront;
- control plane SaaS.

No se recomienda un único runtime ahora: los canales tienen perfiles de riesgo,
escalado y despliegue diferentes. Primero se debe estabilizar el contrato
tenant-aware, alinear schemas y crear paquetes compartidos sin Prisma Client.

La decisión completa está en
`saas-platform/docs/ADR-001-unificacion-pos-ecommerce.md`.

## Integración inicial del contrato

- POS y ecommerce configuran el alias `@zaiko/contracts`.
- El contexto ecommerce produce `contractVersion`, `businessId`, `branchId`,
  `source` y `requestId`.
- Checkout devuelve el `requestId` y la versión del contrato para trazabilidad.
- El POS dispone de helper para crear contexto de contrato con fuente `POS`.
- El paquete compartido compila sin depender de Prisma ni de Next.js.
