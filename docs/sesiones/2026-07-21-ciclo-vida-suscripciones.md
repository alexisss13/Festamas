# Ciclo de vida de suscripciones — 2026-07-21

Ecommerce consulta a `saas-platform` para conocer si el negocio está habilitado
y qué funcionalidades posee.

Los upgrades se habilitan inmediatamente. Los downgrades se aplican al inicio
del siguiente ciclo y no eliminan catálogo, pedidos ni configuración; solo se
impiden nuevas acciones que superen los límites del plan.

En `SUSPENDED` o `CANCELED` se detienen nuevas operaciones comerciales según
la política del plan, conservando consulta y exportación cuando corresponda.
Ecommerce no duplica la lógica de cobros ni de estados de suscripción.
