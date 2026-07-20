import { Resend } from 'resend';
import React from 'react';
import { OrderEmail } from '@/components/email/OrderEmail';
import { StatusEmail } from '@/components/email/StatusEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Zaiko <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

export interface StoreEmailBrand {
  name: string;
  primaryColor?: string | null;
}

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
  recipientEmails: string[];
  brand: StoreEmailBrand;
}

export async function sendNewOrderEmail(data: NewOrderEmailData): Promise<void> {
  if (!data.recipientEmails.length || !process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: data.recipientEmails,
      subject: `Nuevo pedido #${data.orderId.split('-')[0].toUpperCase()} — ${data.brand.name}`,
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
  brand: StoreEmailBrand;
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
        brand: data.brand,
        ordersUrl: `${APP_URL}/profile/orders`,
      }),
    });
  } catch (err) {
    console.error('[email] sendStatusEmail failed:', err);
  }
}
