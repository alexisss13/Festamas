// Tipos compartidos para exportación
export interface OrderForExport {
  id: string;
  receiptNumber?: string | null;
  clientName: string;
  clientPhone: string;
  status: string;
  isPaid: boolean;
  isPOS?: boolean;
  totalAmount: number;
  createdAt: Date | string;
  deliveryMethod: string;
  shippingAddress?: string | null;
  address?: string | null;
  shippingCost: number;
  notes?: string | null;
  orderItems: {
    quantity: number;
    price: number;
    productName: string;
  }[];
}

export interface TransformedOrderData {
  'N° Pedido': string;
  'Fecha': string;
  'Hora': string;
  'Origen': string;
  'Cliente': string;
  'DNI': string;
  'Celular': string;
  'Método Entrega': string;
  'Dirección': string;
  'Productos': string;
  'Estado': string;
  'Pagado': string;
  'Subtotal': number;
  'Costo Envío': number;
  'Total': number;
}

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json';
