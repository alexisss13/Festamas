# Fiscalidad y comprobantes en ecommerce

Ecommerce no emite comprobantes fiscales ni administra numeración. Envía la
orden confirmada al ERP con negocio, sucursal, cliente, líneas, pagos,
`orderId` e `idempotencyKey`, y muestra el comprobante que ERP devuelve.

Las anulaciones, devoluciones, notas de crédito, reembolsos y correcciones
deben referenciar la orden ecommerce y el comprobante ERP original. Un fallo
del proveedor fiscal se comunica como estado pendiente; nunca se duplica la
orden ni se genera una segunda numeración local.
