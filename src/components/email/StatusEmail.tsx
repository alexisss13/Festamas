import * as React from 'react';
import {
  Html, Body, Head, Heading, Container, Preview,
  Section, Text, Button, Hr,
} from '@react-email/components';

interface StatusEmailProps {
  orderId: string;
  customerName: string;
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  cancelReason?: string | null;
  brand: { name: string; primaryColor?: string | null };
  ordersUrl: string;
}

const STATUS_CONFIG: Record<string, { heading: string; preview: string; description: string; color: string }> = {
  PAID: {
    heading: '¡Pago Confirmado! ✅',
    preview: 'Tu pago fue confirmado',
    description: 'Hemos recibido tu pago correctamente. Ya estamos preparando tu pedido.',
    color: '#16a34a',
  },
  PROCESSING: {
    heading: 'Pedido en Preparación 📦',
    preview: 'Tu pedido está siendo preparado',
    description: 'Estamos preparando tu pedido con mucho cuidado. Te avisaremos cuando salga.',
    color: '#2563eb',
  },
  SHIPPED: {
    heading: '¡Tu Pedido fue Enviado! 🚚',
    preview: 'Tu pedido ya está en camino',
    description: 'Tu pedido ya está en camino. Pronto llegará a tu dirección.',
    color: '#7c3aed',
  },
  READY_FOR_PICKUP: {
    heading: '¡Listo para Recoger! 🛍️',
    preview: 'Tu pedido está listo',
    description: 'Tu pedido ya está listo. Puedes pasar a recogerlo en nuestra tienda.',
    color: '#d97706',
  },
  DELIVERED: {
    heading: '¡Pedido Entregado! 🎉',
    preview: 'Tu pedido fue entregado',
    description: '¡Tu pedido ha sido entregado exitosamente! Gracias por tu compra.',
    color: '#16a34a',
  },
  CANCELLED: {
    heading: 'Pedido Cancelado',
    preview: 'Tu pedido fue cancelado',
    description: 'Tu pedido ha sido cancelado. Si tienes alguna duda, no dudes en contactarnos.',
    color: '#dc2626',
  },
};

export const StatusEmail: React.FC<Readonly<StatusEmailProps>> = ({
  orderId,
  customerName,
  status,
  trackingNumber,
  carrier,
  cancelReason,
  brand,
  ordersUrl,
}) => {
  const cfg = STATUS_CONFIG[status] ?? {
    heading: 'Actualización de Pedido',
    preview: 'Actualización de tu pedido',
    description: 'El estado de tu pedido ha sido actualizado.',
    color: '#64748b',
  };

  const formattedId = orderId.split('-')[0].toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>{cfg.preview} · {brand.name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...h1, color: brand.primaryColor || cfg.color }}>{cfg.heading}</Heading>

          <Text style={greeting}>Hola {customerName},</Text>
          <Text style={text}>{cfg.description}</Text>

          <Section style={card}>
            <Text style={orderIdText}>Pedido #{formattedId}</Text>

            {status === 'SHIPPED' && (carrier || trackingNumber) && (
              <>
                <Hr style={hr} />
                {carrier && <Text style={detail}><strong>Transportista:</strong> {carrier}</Text>}
                {trackingNumber && <Text style={detail}><strong>Tracking:</strong> {trackingNumber}</Text>}
              </>
            )}

            {status === 'CANCELLED' && cancelReason && (
              <>
                <Hr style={hr} />
                <Text style={detail}><strong>Motivo:</strong> {cancelReason}</Text>
              </>
            )}
          </Section>

          <Section style={btnContainer}>
            <Button
              style={{ ...button, backgroundColor: brand.primaryColor || '#0f172a' }}
              href={ordersUrl}
            >
              Ver mis pedidos
            </Button>
          </Section>

          <Text style={footer}>
            {brand.name}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '520px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const h1 = {
  fontSize: '22px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '30px 0 8px',
};

const greeting = {
  color: '#334155',
  fontSize: '16px',
  textAlign: 'center' as const,
  margin: '0 24px 4px',
};

const text = {
  color: '#64748b',
  fontSize: '15px',
  textAlign: 'center' as const,
  margin: '0 24px 24px',
  lineHeight: '22px',
};

const card = {
  padding: '20px 24px',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  backgroundColor: '#f8fafc',
  margin: '0 24px',
};

const orderIdText = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#0f172a',
  textAlign: 'center' as const,
  margin: '0',
};

const detail = {
  fontSize: '14px',
  color: '#475569',
  margin: '4px 0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '14px 0',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '28px',
};

const button = {
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '24px',
};
