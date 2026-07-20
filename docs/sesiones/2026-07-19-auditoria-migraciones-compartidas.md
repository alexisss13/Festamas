# Auditoría de migraciones compartidas con POS

Fecha: 2026-07-19

La auditoría de `prisma migrate status` confirmó que ecommerce y POS comparten
la base operativa pero no un historial Prisma lineal. El detalle, reglas de
seguridad y plan de reconciliación se mantienen en:

`pos/docs/operaciones/AUDITORIA_HISTORIAL_MIGRACIONES_COMPARTIDO_2026-07-19.md`

Hasta formalizar un baseline común no se debe ejecutar `prisma migrate deploy`
ni `migrate reset` desde ecommerce sobre la base compartida. POS ya formalizó
su migración pendiente `Branch.code`; ecommerce continúa validando el schema
físico con el comando POS `npm run check:shared-schema` hasta crear el baseline
común.
