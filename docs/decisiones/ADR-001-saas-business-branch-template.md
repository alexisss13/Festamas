# ADR-001: alcance de la personalización del ecommerce

> **Última actualización:** 2026-07-18 (migrado desde `Tesis/docs`; contenido sin cambios)

## Decisión

El ecommerce se modela como un storefront de una sucursal (`Branch`) dentro de
un negocio (`Business`). La configuración puede definirse a nivel de negocio y
sobrescribirse a nivel de sucursal.

La precedencia es:

```text
Branch.StoreConfig > Business.StoreConfig > valores predeterminados de la plataforma
```

La plantilla se selecciona mediante una clave genérica (`templateKey`) y sus
colores o tokens mediante `themeConfig`. No se deben introducir nombres de
clientes en el código para decidir la interfaz.

## Motivo

Un negocio puede tener varias sucursales que comparten catálogo y operación,
pero necesitan campañas, identidad visual, dominio o presentación distinta. La
configuración por negocio evita duplicación; el override por sucursal permite
personalización independiente cuando sea necesaria.

## Consecuencias

- Productos, precios base, variantes y stock continúan bajo el POS.
- El ecommerce administra presentación, marketing, contenido y pedidos online.
- Las nuevas plantillas deben consumir datos de configuración, no condicionales
  con nombres como `Festamas` o `FiestasYa`.
- La resolución de contexto debe determinar negocio y sucursal antes de renderizar.
- Las configuraciones deben validarse y auditarse desde el panel autorizado.
