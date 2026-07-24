import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { finalizePaidOrder } from '@/actions/payments';
import { isChargeApproved, extractOrderId, type CulqiChargeData } from '@/lib/culqi-charge';

interface CulqiWebhookPayload {
  type?: string;
  data?: CulqiChargeData;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as CulqiWebhookPayload | null;
  const paymentId = body?.data?.id;
  if (!paymentId) return NextResponse.json({ success: true, ignored: true });

  try {
    const secretKey = process.env.CULQI_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: 'Culqi no configurado' }, { status: 500 });

    // Confirmamos el cargo desde Culqi; nunca confiamos únicamente en el body
    // recibido por el webhook.
    const response = await fetch(`https://api.culqi.com/v2/charges/${paymentId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.json({ error: 'No se pudo validar el cargo' }, { status: 502 });

    const charge = await response.json() as CulqiWebhookPayload['data'];
    if (!isChargeApproved(charge)) return NextResponse.json({ success: true, ignored: true });

    const orderId = extractOrderId(charge, body?.data?.metadata);
    if (!orderId) return NextResponse.json({ success: true, ignored: true });

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, isPaid: true } });
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    if (!order.isPaid) await finalizePaidOrder(orderId, paymentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en webhook Culqi:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
