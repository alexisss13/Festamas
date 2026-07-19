# Configuración pendiente de Culqi

> **Última actualización:** 2026-07-18 (migrado desde `Tesis/docs`; contenido sin cambios)

La integración de Culqi ya está preparada en el ecommerce, pero todavía no se han incorporado credenciales reales porque falta el acceso al panel de Culqi.

## Variables pendientes

Agregar en el entorno del ecommerce:

```env
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_...
CULQI_SECRET_KEY=sk_test_...
CULQI_WEBHOOK_SECRET=...
CULQI_WEBHOOK_URL=https://dominio-publico.com/api/webhooks/culqi
```

Nunca colocar `CULQI_SECRET_KEY` en variables `NEXT_PUBLIC_*`, componentes de cliente, repositorio ni archivos públicos.

## Checklist cuando se otorgue el acceso

1. Crear o verificar las API Keys de prueba en Culqi.
2. Colocar la llave pública en `NEXT_PUBLIC_CULQI_PUBLIC_KEY`.
3. Colocar la llave privada en `CULQI_SECRET_KEY` únicamente en el servidor.
4. Configurar el webhook en CulqiPanel con esta URL: `https://<dominio-ecommerce>/api/webhooks/culqi`.
5. Suscribir los eventos de cargos y órdenes de pago que correspondan a los medios habilitados.
6. Configurar el secreto de firma del webhook en `CULQI_WEBHOOK_SECRET` cuando Culqi lo entregue para la cuenta.
7. Probar pagos rechazados, aprobados, duplicados y pagos asincrónicos.
8. Verificar que una confirmación descuente stock una sola vez.
9. Cambiar las claves `pk_test_`/`sk_test_` por las claves live únicamente al pasar a producción.
10. Confirmar que la URL pública del webhook no redirija, no requiera login y responda HTTP 200 cuando el evento haya sido procesado.
11. La ruta valida nuevamente el cargo consultando la API de Culqi antes de
    confirmar el pedido; no se debe confiar únicamente en el JSON recibido.

## Estado actual

- Checkout y cargo server-side: implementados.
- Webhook `/api/webhooks/culqi`: implementado.
- Variables reales: pendientes de acceso.
- Pruebas live/test con credenciales Culqi: pendientes.
- Migración compartida de base de datos: los cambios estructurales actuales ya
  fueron aplicados mediante el hotfix idempotente; queda pendiente validar el
  flujo completo con credenciales reales.
- Reembolsos Culqi: código preparado, requiere `CULQI_SECRET_KEY` y una prueba
  con un cargo de test antes de habilitarlo en producción.

## Checklist de aceptación antes de producción

- Crear un pedido online y verificar que `Order.source = ONLINE`.
- Confirmar que el cargo registra `paymentProvider = CULQI` y `culqiPaymentId`.
- Reintentar el webhook y comprobar que no duplica stock ni ticket.
- Probar rechazo de tarjeta y verificar que la reserva se libera.
- Aprobar una devolución y comprobar reembolso, reposición y `refundReference`.
- Verificar que los pedidos físicos del POS no sean procesados por el webhook.

## Orden de despliegue de base de datos

En la base compartida se deben ejecutar una sola vez y en este orden las
migraciones de `Festamas/prisma/migrations/`:

1. `20260718000000_add_culqi_payment_fields`
2. `20260718010000_add_returns_workflow`
3. `20260718020000_scope_store_config`
4. `20260718030000_add_packing_trace`
5. `20260718040000_schedule_popups`

Después se debe regenerar Prisma en `Festamas` y `pos`. No se debe ejecutar
`db push` en producción porque ambos sistemas comparten la estructura de datos.

### Nota sobre la base compartida actual

La base existente no tiene alineado el historial de migraciones inicial de
Prisma: `migrate deploy` intenta recrear tipos que ya existen y se detiene.
Para corregir los errores actuales se ejecutó el hotfix idempotente
`Festamas/prisma/hotfix_shared_schema_alignment.sql` (el hotfix específico
anterior queda como referencia). El saneamiento completo del
historial (`prisma migrate resolve`) debe realizarse con respaldo y ventana de
mantenimiento, no automáticamente desde la aplicación.

Documentación oficial consultada:

- https://docs.culqi.com/es/documentacion/checkout/v4/culqi-checkout/
- https://docs.culqi.com/es/documentacion/pagos-online/webhooks/
- https://docs.culqi.com/es/documentacion/pagos-online/operaciones/devoluciones/
