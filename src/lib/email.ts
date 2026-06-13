import { Resend } from 'resend';
import React from 'react';
import { OrderEmail } from '@/components/email/OrderEmail';
import { StatusEmail } from '@/components/email/StatusEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? 'FiestasYa <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fiestas-ya.vercel.app';

export interface NewOrderEmailData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: { title: string; quantity: number }[];
  deliveryMethod: string;
  shippingAddress?: string;
  shippingCost: number;
  notes?: string;
}

export async function sendNewOrderEmail(data: NewOrderEmailData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `Nuevo Pedido #${data.orderId.split('-')[0].toUpperCase()} — FiestasYa`,
      react: React.createElement(OrderEmail, {
        ...data,
        url: `${APP_URL}/admin/orders`,
      }),
    });
  } catch (err) {
    console.error('[email] sendNewOrderEmail failed:', err);
  }
}

export interface StatusEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  cancelReason?: string | null;
}

const STATUS_SUBJECTS: Record<string, string> = {
  PAID:             'Pago confirmado',
  PROCESSING:       'Tu pedido está en preparación',
  SHIPPED:          'Tu pedido fue enviado',
  READY_FOR_PICKUP: 'Tu pedido está listo para recoger',
  DELIVERED:        '¡Tu pedido fue entregado!',
  CANCELLED:        'Tu pedido fue cancelado',
};

export async function sendStatusEmail(data: StatusEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const subject = STATUS_SUBJECTS[data.status]
    ? `${STATUS_SUBJECTS[data.status]} — Pedido #${data.orderId.split('-')[0].toUpperCase()}`
    : `Actualización de pedido #${data.orderId.split('-')[0].toUpperCase()}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: data.customerEmail,
      subject,
      react: React.createElement(StatusEmail, {
        orderId: data.orderId,
        customerName: data.customerName,
        status: data.status,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        cancelReason: data.cancelReason,
      }),
    });
  } catch (err) {
    console.error('[email] sendStatusEmail failed:', err);
  }
}
