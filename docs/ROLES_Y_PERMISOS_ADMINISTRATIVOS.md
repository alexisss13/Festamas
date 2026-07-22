# Roles y permisos administrativos de ecommerce

> Decisión de producto — 2026-07-21

## Roles base

| Rol | Alcance | Responsabilidad |
|---|---|---|
| `OWNER` | Todo el negocio | Suscripción, facturación, usuarios, sucursales y configuración total. |
| `ADMIN` | Todo el negocio | Operación completa, excepto transferencia de propiedad y facturación crítica. |
| `MANAGER` | Una o varias sucursales | Pedidos, catálogo, clientes y reportes de sus sucursales. |
| `OPERATOR` | Una sucursal | Preparación de pedidos, estados y fulfillment. |
| `CATALOG_EDITOR` | Negocio o sucursal | Productos, variantes, precios, imágenes, categorías y promociones. |
| `SUPPORT` | Negocio o sucursal | Consulta de pedidos/clientes y atención de incidencias. |

Los roles son conjuntos de permisos. Un usuario puede tener varios roles y un
alcance de negocio completo, varias sucursales o una sola sucursal.

## Permisos principales

`orders.view`, `orders.manage`, `orders.cancel`, `catalog.view`,
`catalog.manage`, `customers.view`, `customers.manage`, `promotions.manage`,
`reports.view`, `storefront.manage`, `users.manage`, `billing.manage` y
`settings.manage`.

El plan habilita funcionalidades; el rol autoriza al usuario a utilizarlas.
Ningún rol de ecommerce concede permisos de `saas-platform`.

## Reglas de seguridad

- `OWNER` tiene control total y no consume el límite de empleados.
- Cancelaciones, reembolsos y cambios sensibles requieren `OWNER`, `ADMIN` o
  un permiso explícito.
- Un `OPERATOR` no modifica precios, usuarios, planes ni configuración crítica.
- Desactivar un usuario revoca su acceso inmediatamente y conserva su historial.
- Las acciones sensibles se registran en auditoría.

## Verticales

El storefront usa una configuración única por `verticalKey`; no se crean
aplicaciones separadas. Las claves canónicas son `RETAIL`, `RESTAURANT`,
`SERVICES` y `QUOTES`. Los valores históricos `COMMERCE` y `PROFESSIONALS`
se normalizan a `RETAIL` y `SERVICES` respectivamente.

Cada vertical activa módulos independientes y puede crecer sin duplicar el
checkout, catálogo u órdenes comunes.
