// Backfill de Product.salesCount (2026-07-23).
//
// El campo nunca se incrementó en ningún lado hasta el fix de hoy en
// finalizePaidOrder (src/actions/payments.ts) — todo pedido pagado ANTES de
// ese fix quedó sin contar. Este script recalcula salesCount desde la fuente
// real (OrderItem de pedidos con isPaid = true) y lo SOBRESCRIBE por
// completo — no incrementa sobre el valor actual — para que el resultado sea
// idempotente sin importar cuántas veces se corra ni si ya corrió el fix en
// vivo sobre pedidos recientes.
//
// Uso: npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/backfill-sales-count.ts
import prisma from '../src/lib/prisma';

type Row = { productId: string; total: string };

async function main() {
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT v."productId" AS "productId", SUM(oi."quantity")::text AS total
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    JOIN "ProductVariant" v ON v.id = oi."variantId"
    WHERE o."isPaid" = true
    GROUP BY v."productId"
  `;

  const totals = new Map(rows.map(r => [r.productId, parseInt(r.total, 10)]));

  const orphanCount = await prisma.$queryRaw<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    WHERE o."isPaid" = true AND oi."variantId" IS NULL
  `;
  const orphans = parseInt(orphanCount[0]?.count ?? '0', 10);

  const products = await prisma.product.findMany({ select: { id: true, title: true, salesCount: true } });

  let changed = 0;
  for (const product of products) {
    const real = totals.get(product.id) ?? 0;
    if (real !== product.salesCount) {
      await prisma.product.update({ where: { id: product.id }, data: { salesCount: real } });
      changed++;
      console.log(`  ${product.title}: ${product.salesCount} -> ${real}`);
    }
  }

  console.log(`\nProductos actualizados: ${changed}/${products.length}`);
  if (orphans > 0) {
    console.log(
      `Aviso: ${orphans} OrderItem(s) de pedidos pagados tienen variantId nulo ` +
      `(variante eliminada después de la venta) — esas ventas no se pudieron ` +
      `atribuir a ningún producto y quedan fuera del conteo.`,
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
