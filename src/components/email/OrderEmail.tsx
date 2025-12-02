import * as React from 'react';

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: { title: string; quantity: number }[];
  url: string;
}

export const OrderEmail: React.FC<Readonly<OrderEmailProps>> = ({
  orderId,
  customerName,
  customerPhone,
  totalAmount,
  items,
  url,
}) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: 1.5 }}>
    <h2 style={{ color: '#0f172a' }}>¡Nuevo Pedido Recibido! 🎉</h2>
    <p>Hola Admin, tienes una nueva venta en FiestasYa.</p>
    
    <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
      <p><strong>Pedido:</strong> #{orderId.split('-')[0].toUpperCase()}</p>
      <p><strong>Cliente:</strong> {customerName}</p>
      <p><strong>Teléfono:</strong> {customerPhone}</p>
      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
        Total: S/ {totalAmount.toFixed(2)}
      </p>
    </div>

    <h3>Detalle de productos:</h3>
    <ul style={{ paddingLeft: '20px' }}>
      {items.map((item, index) => (
        <li key={index} style={{ marginBottom: '5px' }}>
          {item.quantity}x {item.title}
        </li>
      ))}
    </ul>

    <div style={{ marginTop: '30px' }}>
      <a 
        href={url} 
        style={{ 
          backgroundColor: '#0f172a', 
          color: '#ffffff', 
          padding: '12px 24px', 
          textDecoration: 'none', 
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        Ver en el Panel Admin
      </a>
    </div>
  </div>
);