import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (body?.action === "test.created") {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const paymentId = body?.data?.id;
  if (!paymentId) {
    return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
  }

  try {
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== 'approved') {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const orderId = paymentData.external_reference;
    if (!orderId) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Idempotencia: si ya está pagada, no reintentamos
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          select: {
            variantId: true,
            productName: true,
            variantName: true,
            quantity: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    if (existingOrder.isPaid) {
      // Ya procesada — respuesta 200 para que MP no reintente
      return NextResponse.json({ success: true, message: "Ya procesada" }, { status: 200 });
    }

    // Procesar en transacción: pagar orden + descontar stock + acumular puntos
    await prisma.$transaction(async (tx) => {
      // 1. Marcar como pagada
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          status: 'PAID',
          mercadoPagoId: String(paymentId),
          updatedAt: new Date(),
        },
      });

      // 2. Descontar stock por cada item con variantId
      if (existingOrder.branchId) {
        for (const item of existingOrder.orderItems) {
          if (!item.variantId) continue;

          const stockRecord = await tx.stock.findUnique({
            where: {
              branchId_variantId: {
                branchId: existingOrder.branchId,
                variantId: item.variantId,
              },
            },
          });

          if (!stockRecord) continue;

          const previousQty = stockRecord.quantity;
          const newQty = Math.max(0, previousQty - item.quantity);

          await tx.stock.update({
            where: { id: stockRecord.id },
            data: { quantity: newQty },
          });

          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              branchId: existingOrder.branchId,
              type: 'SALE_ECOMMERCE',
              quantity: -item.quantity,
              previousStock: previousQty,
              currentStock: newQty,
              reason: `Venta Online #${existingOrder.receiptNumber ?? orderId} — ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`,
            },
          });
        }
      }

      // 3. Acumular puntos si el pedido está asociado a un Customer
      if (existingOrder.customerId && existingOrder.businessId) {
        const total = Number(existingOrder.totalAmount ?? 0);
        
        // Consultar configuración de lealtad en los ajustes del negocio
        const business = await tx.business.findUnique({
          where: { id: existingOrder.businessId },
          select: {
            loyaltyEnabled: true,
            loyaltyEarnRate: true,
          }
        });

        const loyaltyEnabled = business?.loyaltyEnabled ?? false;
        const rate = Number(business?.loyaltyEarnRate) || 10;
        const pointsEarned = loyaltyEnabled && rate > 0 ? Math.floor(total / rate) : 0;

        // Actualizar estadísticas del cliente
        await tx.customer.update({
          where: { id: existingOrder.customerId },
          data: {
            ...(pointsEarned > 0 ? { pointsBalance: { increment: pointsEarned } } : {}),
            totalSpent: { increment: total },
            visits: { increment: 1 },
            lastPurchase: new Date(),
          },
        });

        if (pointsEarned > 0) {
          await tx.pointTransaction.create({
            data: {
              businessId: existingOrder.businessId,
              customerId: existingOrder.customerId,
              points: pointsEarned,
              type: 'EARN',
              description: `Compra online #${existingOrder.receiptNumber ?? orderId.slice(0, 8)}`,
              orderId: orderId,
            },
          });

          // Actualizar el pedido con los puntos ganados
          await tx.order.update({
            where: { id: orderId },
            data: { pointsEarned }
          });
        }
      }
    });

    // Release stock reservations for the order's variants
    const variantIds = existingOrder.orderItems
      .map(i => i.variantId)
      .filter(Boolean) as string[];
    if (variantIds.length > 0) {
      await prisma.stockReservation.deleteMany({
        where: { variantId: { in: variantIds } },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error en Webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
