# Flujo de órdenes ecommerce a POS — 2026-07-21

Ecommerce es responsable de carrito, checkout, pago y comunicación con el
cliente. Envía la orden al ERP con `businessId`, `branchId`, `orderId` e
`idempotencyKey`.

Ecommerce no descuenta stock ni crea una segunda venta operativa. Consume los
estados publicados por ERP: `ACCEPTED`, `PREPARING`, `READY`, `DISPATCHED`,
`DELIVERED` o `CANCELED`.
