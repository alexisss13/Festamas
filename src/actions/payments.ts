"use server";

import { MercadoPagoConfig, Preference } from "mercadopago";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

interface CheckoutData {
  items: any[];
  deliveryMethod: string;
  shippingAddress?: string;
  shippingCost: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
  total: number;
}

export async function createPreference(data: CheckoutData) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, message: "Debes iniciar sesión" };
  }

  try {
    // Definimos la URL base (debe ser la de Vercel en producción)
    const rawUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const baseUrl = rawUrl.trim().replace(/\/$/, "");

    // 1. Crear Orden en BD
    const newOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: data.total,
        totalItems: data.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
        status: "PENDING",
        isPaid: false,
        clientName: data.contactName,
        clientPhone: data.contactPhone,
        deliveryMethod: data.deliveryMethod,
        shippingAddress: data.shippingAddress || "",
        shippingCost: data.shippingCost,
        notes: data.notes,
        orderItems: {
          create: data.items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // 2. Preparar Items
    const mpItems = data.items.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "PEN",
    }));

    if (data.shippingCost > 0) {
      mpItems.push({
        id: "shipping",
        title: "Costo de Envío",
        quantity: 1,
        unit_price: Number(data.shippingCost),
        currency_id: "PEN",
      });
    }

    // 3. Preparar Body Base
    const preferenceBody: any = {
      items: mpItems,
      external_reference: newOrder.id, // 👈 CLAVE: Enlaza el pago con tu orden
      payer: {
        email: session.user.email!,
        name: data.contactName,
      },
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      auto_return: "approved",
      statement_descriptor: "FESTAMAS",
      // 👇 AQUÍ ESTÁ LA MAGIA DESCOMENTADA:
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    };

    const preference = new Preference(client);
    let result;

    try {
      // INTENTO 1: Con auto_return
      result = await preference.create({ body: preferenceBody });
    } catch (firstError: any) {
      // 🛡️ REINTENTO: Si falla por auto_return (localhost), lo quitamos
      if (firstError?.message?.includes("auto_return")) {
        console.warn("⚠️ Falló auto_return. Reintentando sin él...");
        delete preferenceBody.auto_return;
        result = await preference.create({ body: preferenceBody });
      } else {
        throw firstError;
      }
    }

    // 4. Actualizar ID en BD
    await prisma.order.update({
      where: { id: newOrder.id },
      data: { mercadoPagoId: result.id },
    });

    return { 
      success: true, 
      url: process.env.NODE_ENV === 'development' ? result.sandbox_init_point : result.init_point 
    };

  } catch (error: any) {
    console.error("❌ Error Fatal MP:", error);
    return { success: false, message: `Error al generar pago: ${error.message}` };
  }
}