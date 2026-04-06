import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz'; 
import { es } from 'date-fns/locale';      

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true
    }
  });

  if (!order) notFound();

  // 1. Detección de marca
  const isFestamas = order.notes?.includes('Tienda: Festamas') || order.notes?.includes('JUGUETERIA') || false;
  const brandName = isFestamas ? 'FESTAMÁS' : 'FIESTASYA';

  // 2. Datos fiscales
  const companyInfo = {
    razonSocial: "FiestasYa SAC",
    ruc: "20610153756",
    address: "Trujillo, Perú",
    phone: "916173003",
  };

  const subtotal = Number(order.totalAmount) / 1.18;
  const igv = Number(order.totalAmount) - subtotal;

  const timeZone = 'America/Lima';
  const zonedDate = toZonedTime(order.createdAt, timeZone);

  // Lógica para mostrar teléfono solo si es real
  const showPhone = order.clientPhone && order.clientPhone !== '-' && order.clientPhone !== '999999999';

  return (
    <>
      {/* Estilos específicos de impresión térmica 80mm */}
      <style>{`
        @page { 
            margin: 0; 
            size: 80mm auto; /* Formato ticket */
        }
        body { 
            margin: 0; 
            padding: 0; 
            background: #fff;
        }
        @media print {
            body { 
                width: 78mm; /* Ligeramente menos para evitar corte */
                padding: 1mm; 
                margin: 0 auto;
                font-family: 'Courier New', Courier, monospace; 
                -webkit-print-color-adjust: exact;
                color: #000;
            }
            .no-print { 
                display: none !important; 
            }
        }
      `}</style>

      {/* Contenedor principal del ticket */}
      <div className="w-[78mm] mx-auto text-black p-2 font-mono text-[12px] leading-tight print:w-full print:p-0">
        
        {/* Cabecera del ticket */}
        <div className="text-center mb-3 pb-2 border-b-2 border-dashed border-black">
          <h1 className="text-xl font-bold uppercase mb-1">{brandName}</h1>
          <p className="font-bold">{companyInfo.razonSocial}</p>
          <p>RUC: {companyInfo.ruc}</p>
          <p>{companyInfo.address}</p>
          <p>Cel: {companyInfo.phone}</p>
        </div>

        {/* Info del Documento */}
        <div className="mb-3 pb-2 border-b-2 border-dashed border-black">
          <p className="text-center font-bold text-sm uppercase mb-1">BOLETA DE VENTA ELECTRÓNICA</p>
          <p className="text-center font-bold text-sm mb-2">{order.receiptNumber || 'PENDIENTE'}</p>
          <div className="flex justify-between">
            <span>Fecha: {format(zonedDate, "dd/MM/yyyy", { locale: es })}</span>
            <span>Hora: {format(zonedDate, "HH:mm", { locale: es })}</span>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div className="mb-3 pb-2 border-b border-black">
          <p>CLIENTE: {order.clientName}</p>
          <p>DNI/RUC: {order.notes?.match(/DNI: (\d+)/)?.[1] || (showPhone ? order.clientPhone : '-')}</p>
          {showPhone && <p>TEL: {order.clientPhone}</p>}
        </div>

        {/* Detalles de la Venta */}
        <table className="w-full text-left mb-3">
          <thead>
            <tr className="border-b border-black">
              <th className="font-normal w-10">CANT</th>
              <th className="font-normal">DESCRIPCIÓN</th>
              <th className="font-normal text-right w-16">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="pt-1">{item.quantity}</td>
                <td className="pt-1 pr-1 truncate max-w-[40mm]">{item.productName} {item.variantName ? `(${item.variantName})` : ''}</td>
                <td className="pt-1 text-right">{formatCurrency(Number(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="border-t-2 border-dashed border-black pt-2 mb-4">
          <div className="flex justify-between">
            <span>OP. GRAVADA:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>IGV (18%):</span>
            <span>{formatCurrency(igv)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm mt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(Number(order.totalAmount))}</span>
          </div>
        </div>

        {/* Pie de ticket */}
        <div className="text-center text-[10px] mt-4 pt-2 border-t border-black">
          <p className="font-bold mb-1">¡GRACIAS POR SU COMPRA!</p>
          <p>Representación impresa de la</p>
          <p>Boleta de Venta Electrónica.</p>
          <p className="mt-2 text-[8px] text-gray-500">ID: {order.id.split('-')[0]}</p>
        </div>

        {/* Script para impresión automática */}
        <script dangerouslySetInnerHTML={{ __html: `
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        ` }} />
      </div>
    </>
  );
}
