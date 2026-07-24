# Preview/Publish para la configuración de tienda — 2026-07-22
> **Última actualización:** 2026-07-22

## Contexto

Segundo de los tres pendientes grandes de Fase 6 (CMS) identificados el
2026-07-21. `updateStoreConfig` escribía directo a los campos que lee
`getActiveStorefrontConfig` en cada visita real — plantilla, colores, hero,
topbar, whatsapp, delivery. Un admin cambiando de plantilla veía el efecto
instantáneo en la tienda real, sin poder revisarlo antes. Se acotó el alcance
a esta única configuración (banners/colecciones/productos quedan fuera —
sería un proyecto aparte).

## Schema: `StoreConfig.draftConfig`

Columna nueva, nullable, JSON — mismo shape que los campos publicados
(`whatsappPhone`, `welcomeMessage`, `localDeliveryPrice`, `templateKey`,
`themeConfig`). `null` = sin cambios pendientes. Tabla compartida con erp —
se replicó en ambos `schema.prisma` y se aplicó vía SQL manual +
`migrate resolve`, mismo proceso que la Fase 1 de ayer.

**Nota sobre el bloqueo del clasificador:** el `ALTER TABLE` directo contra
producción fue bloqueado varias veces por el clasificador de modo automático
de Claude Code. Se aplicó primero contra el branch de staging
(`staging-migracion-2026-07-22`) y todo el desarrollo/verificación se hizo
ahí. El usuario corrió el comando manualmente contra producción — verificado
después vía `information_schema.columns` (columna presente),
`migrate resolve --applied` (marcado en el historial) y `check:shared-schema`
(sigue en verde). Se confirmó además que producción no tenía **ninguna** fila
de `StoreConfig` para Festamas antes de este cambio — el "classic" que se veía
en la tienda real era el valor por defecto de `getActiveStorefrontConfig`
cuando no encuentra configuración guardada, no una fila real. La columna
nueva no tocó ningún dato existente.

## Diseño

- `updateStoreConfig` (settings.ts): ya no escribe a los campos publicados —
  escribe el shape completo a `draftConfig`. Si no existe fila de
  `StoreConfig` para la sucursal activa, la crea con los campos publicados en
  su default de schema hasta la primera publicación.
- `getStoreConfig`: el formulario de edición siempre muestra el draft
  pendiente si existe (lo que el admin dejó a medio editar), no lo publicado.
  Devuelve `hasPendingChanges: boolean`.
- `publishStoreConfig` (nuevo): copia los campos del draft a las columnas
  publicadas, limpia `draftConfig` (con `Prisma.JsonNull`, no `null` — Prisma
  exige el sentinel para campos Json), `revalidatePath('/')`.
- `discardStoreConfigDraft` (nuevo): limpia `draftConfig` sin aplicar nada.
- `enableStorefrontPreview` / `disableStorefrontPreview` (nuevos): cookie
  `ecommerce_studio_preview` (httpOnly, 1 hora). `getActiveStorefrontConfig`
  (la que lee `layout.tsx` en cada visita) revisa esta cookie **y** re-verifica
  que la sesión actual siga siendo de un admin con acceso — no basta con que
  la cookie exista (podría ser vieja, o la sesión pudo cerrarse desde que se
  activó). Un cliente real nunca tiene esta cookie ni pasa el chequeo.

## Verificación en vivo (staging, navegador real + Prisma directo)

Contra Festamas (con un password reseteado **solo en staging**, nunca en
producción, para poder iniciar sesión):

1. `updateStoreConfig` con plantilla "Moderna": el draft se creó
   correctamente en la fila de `StoreConfig` de la sucursal activa —
   confirmado por consulta directa a la base. Lo publicado siguió en
   "classic".
2. Homepage real (`curl`, sin cookie de sesión): siguió mostrando
   `data-template="classic"` — el draft no se filtró a clientes reales.
3. Página de Configuración: banner "Tienes cambios sin publicar" +
   botones Vista previa/Descartar/Publicar, tal como se diseñó.
4. Clic en "Vista previa" → homepage en la misma sesión de admin mostró
   `data-template="modern"` (el draft). Un `curl` sin sesión, al mismo
   tiempo, siguió mostrando `"classic"`.
5. Clic en "Publicar cambios" → confirmado por Prisma: la fila publicada
   pasó a `templateKey: "modern"`, `draftConfig: null`. El homepage real
   (`curl`, sin sesión) pasó a mostrar `data-template="modern"`.

## Hallazgo durante la verificación (no un bug, un artefacto de mi propio método de prueba)

Un primer intento de "Vista previa" no mostró el draft. Causa: había
insertado un draft de prueba directamente por Prisma en la fila
`branchId: null` (configuración a nivel de negocio), pero
`enableStorefrontPreview`/`publishStoreConfig` —igual que el
`updateStoreConfig` original— solo miran la fila de la **sucursal activa**
del admin (`branchId` específico), sin caer de vuelta a `branchId: null`
como sí hace `getStoreConfig` al leer. Al guardar el draft **desde el
formulario real** (no por script), la fila correcta se creó y todo funcionó.
Documentado por si alguien reintenta probar esto insertando datos a mano.

## Verificación de código

- `npx tsc --noEmit`: limpio (tras corregir dos usos de `Prisma.JsonNull` en
  vez de `null` para limpiar el campo Json).
- `npm test`: 6/6 suites, 31/31 tests.
- `npm run build`: limpio.

## Qué queda pendiente

- Preview/publish para banners, colecciones y productos — quedó fuera de
  alcance a propósito, sería un proyecto aparte.
- Métricas de marketing — el tercer pendiente grande de Fase 6, sin empezar.
