import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz'; 
import { es } from 'date-fns/locale';      
import PrintButton from './PrintButton';
import { Metadata } from 'next';
import { auth } from '@/auth';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({ 
    where: { id },
    include: { orderItems: { include: { product: true } } } // Incluimos productos para detectar tienda
  });

  if (!order) return { title: 'Boleta no encontrada' };

  // 🏪 LÓGICA DE MARCA (Basada en el primer producto)
  // Si el primer producto es de JUGUETERIA, es Festamas. Si no, FiestasYa.
  const firstProduct = order.orderItems[0]?.product;
  const isFestamas = firstProduct?.division === 'JUGUETERIA';
  const brandName = isFestamas ? 'Festamas' : 'FiestasYa';
  
  // Si no hay numero de recibo, usamos el ID corto
  const receiptNum = order.receiptNumber || `WEB-${order.id.split('-')[0].toUpperCase()}`;

  return {
    title: `Boleta ${receiptNum} - ${brandName}`,
  };
}

export default async function InvoicePage({ params }: Props) {
  const session = await auth();
  
  if (!session?.user) {
      redirect('/auth/login');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  });

  if (!order) notFound();

  // Validación de seguridad (Dueño o Admin)
  if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      redirect('/');
  }

  // 🏪 LÓGICA DE MARCA ROBUSTA
  // Miramos la división del primer producto de la orden
  const firstProduct = order.orderItems[0]?.product;
  // Si no hay productos (raro), asumimos Juguetería por defecto o leemos cookie si pudiéramos
  const isFestamas = firstProduct ? firstProduct.division === 'JUGUETERIA' : true;
  
  const brandConfig = isFestamas 
    ? {
        name: 'FESTAMÁS',
        logo: '/images/IconoFestamas.png',
        color: '#fc4b65',
        razonSocial: 'INVERSIONES FESTAMAS S.A.C.' // Ejemplo, ajusta si tienes razón social distinta
      }
    : {
        name: 'FIESTASYA',
        logo: '/images/IconoFiestasYa.png',
        color: '#fb3099',
        razonSocial: 'CORPORACIÓN FIESTASYA S.A.C.'
      };

  const companyInfo = {
    razonSocial: brandConfig.razonSocial, // Usamos la razón social de la marca
    ruc: "20610153756",
    address: "Av. España 123, Trujillo, Perú",
    email: isFestamas ? "ventas@festamas.com" : "ventas@fiestasya.com"
  };

  const subtotal = Number(order.totalAmount) / 1.18;
  const igv = Number(order.totalAmount) - subtotal;

  const timeZone = 'America/Lima';
  const zonedDate = toZonedTime(order.createdAt, timeZone);
  const showPhone = order.clientPhone && order.clientPhone !== '-' && order.clientPhone !== '999999999';

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white print:h-auto print:overflow-visible">
      {/* 🖨️ ESTILOS DE IMPRESIÓN FORZADOS (A4) */}
      <style>{`
        @page {
            size: A4;
            margin: 0; /* Quitamos márgenes del navegador */
        }
        @media print {
            body {
                background-color: white !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            /* Ocultamos todo lo que no sea la boleta */
            nav, footer, header, .no-print { 
                display: none !important; 
            }
            /* El contenedor principal ocupa toda la hoja */
            .invoice-page-wrapper {
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                height: auto !important;
                background: white !important;
            }
            /* La boleta en sí con márgenes internos controlados */
            .invoice-container {
                width: 100% !important;
                max-width: 21cm !important; /* Ancho A4 exacto */
                margin: 0 auto !important;
                padding: 1.5cm !important; /* Margen interno de la hoja */
                box-shadow: none !important;
                border: none !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
            }
        }
      `}</style>

      <div className="invoice-page-wrapper flex items-start justify-center py-10 min-h-screen">
        
        {/* BOLETA */}
        <div className="invoice-container bg-white w-full max-w-[21cm] min-h-[29.7cm] p-12 shadow-xl rounded-sm relative box-border">
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-8 border-b pb-8 border-slate-100">
            <div className="flex flex-col gap-1 max-w-[50%]">
               <div className="relative w-48 h-20 mb-3">
                  <Image 
                    src={brandConfig.logo} 
                    alt={brandConfig.name} 
                    fill 
                    className="object-contain object-left" 
                    priority
                  />
               </div>
               <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wide leading-tight">
                 {companyInfo.razonSocial}
               </h1>
               <p className="text-xs text-slate-500 font-medium">RUC: {companyInfo.ruc}</p>
               <p className="text-xs text-slate-500">{companyInfo.address}</p>
               <p className="text-xs text-slate-500">{companyInfo.email}</p>
            </div>
            
            <div className="text-right">
              <div className={`inline-block border-2 p-4 rounded-lg text-center min-w-[220px] ${isFestamas ? 'border-red-100 bg-red-50' : 'border-pink-100 bg-pink-50'}`}>
                  <h2 className="text-xl font-black text-slate-800 uppercase mb-1">Boleta de Venta</h2>
                  <p className="text-xs text-slate-500 mb-3 tracking-widest uppercase">Electrónica</p>
                  
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">N° Comprobante</p>
                  <p className="font-mono text-xl font-bold text-slate-900 tracking-wider">
                    {/* 👇 AQUÍ EL FIX: Si no hay receiptNumber, mostramos el ID corto WEB-XXXX */}
                    {order.receiptNumber || `WEB-${order.id.split('-')[0].toUpperCase()}`}
                  </p>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                  <p>
                      <strong>Fecha:</strong> {format(zonedDate, "dd/MM/yyyy", { locale: es })} 
                      <span className="mx-2 text-slate-300">|</span> 
                      <strong>Hora:</strong> {format(zonedDate, "hh:mm a", { locale: es })}
                  </p>
              </div>
            </div>
          </div>

          {/* DATOS CLIENTE */}
          <div className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-100 text-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isFestamas ? 'bg-red-500' : 'bg-pink-500'}`}></span>
                Datos del Cliente
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                  <div>
                      <p className="text-xs text-slate-400 mb-0.5">Cliente / Razón Social</p>
                      <p className="font-bold text-slate-800 uppercase truncate">{order.clientName}</p>
                  </div>
                  <div>
                      <p className="text-xs text-slate-400 mb-0.5">DNI / RUC</p>
                      <p className="font-bold text-slate-800 font-mono">
                        {order.notes?.match(/DNI: (\d+)/)?.[1] || (showPhone ? order.clientPhone : 'Sin Doc.')}
                      </p>
                  </div>
                  {order.shippingAddress && (
                      <div className="col-span-2">
                          <p className="text-xs text-slate-400 mb-0.5">Dirección de Entrega</p>
                          <p className="text-slate-800 font-medium">{order.shippingAddress}</p>
                      </div>
                  )}
                  {/* Método de Entrega */}
                  <div className="col-span-2 mt-1 pt-3 border-t border-slate-200/50 flex gap-6">
                      <div>
                          <span className="text-xs text-slate-400 mr-2">Método:</span>
                          <span className="font-semibold text-slate-700">
                            {order.deliveryMethod === 'PICKUP' ? 'Recojo en Tienda' : 'Delivery'}
                          </span>
                      </div>
                      <div>
                          <span className="text-xs text-slate-400 mr-2">Estado:</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.isPaid ? 'PAGADO' : 'PENDIENTE'}
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          {/* TABLA */}
          <table className="w-full mb-8">
              <thead className="border-b-2 border-slate-100">
                  <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2 w-16">Cant.</th>
                      <th className="py-2">Descripción del Producto</th>
                      <th className="py-2 text-right w-24">P. Unit</th>
                      <th className="py-2 text-right w-24">Importe</th>
                  </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                  {order.orderItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3 font-mono font-medium pl-2">{item.quantity}</td>
                          <td className="py-3">
                              <span className="font-bold block text-slate-800">{item.product.title}</span>
                              {/* Podríamos poner SKU o Variante aquí si tuviéramos */}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-500">{formatCurrency(Number(item.price))}</td>
                          <td className="py-3 text-right font-bold font-mono text-slate-800">{formatCurrency(Number(item.price) * item.quantity)}</td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {/* TOTALES */}
          <div className="flex justify-end mb-16">
              <div className="w-72 space-y-1 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-slate-500 text-xs">
                      <span>Op. Gravada</span>
                      <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs">
                      <span>I.G.V. (18%)</span>
                      <span className="font-mono">{formatCurrency(igv)}</span>
                  </div>
                  {Number(order.shippingCost) > 0 && (
                    <div className="flex justify-between text-slate-600 text-xs font-medium pt-1">
                        <span>Costo de Envío</span>
                        <span className="font-mono">{formatCurrency(Number(order.shippingCost))}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-200/60 my-2 pt-2 flex justify-between items-center">
                      <span className="font-black text-slate-800 text-sm uppercase">Importe Total</span>
                      <span className={`font-black text-xl font-mono ${isFestamas ? 'text-red-600' : 'text-pink-600'}`}>
                        {formatCurrency(Number(order.totalAmount))}
                      </span>
                  </div>
              </div>
          </div>

          {/* FOOTER LEGAL */}
          <div className="absolute bottom-12 left-12 right-12 text-center border-t border-slate-100 pt-4">
              <p className="font-bold text-slate-700 text-xs uppercase mb-1">
                ¡Gracias por comprar en {brandConfig.name}!
              </p>
              <p className="text-[10px] text-slate-400 leading-tight max-w-md mx-auto">
                Representación impresa de la BOLETA DE VENTA ELECTRÓNICA. 
                Consulte este documento en festamas.vercel.app. 
                Bienes transferidos en la Amazonía Región Selva para ser consumidos en la misma.
              </p>
              <p className="mt-2 font-mono text-[9px] text-slate-300">UUID: {order.id}</p>
          </div>

          {/* BOTONES FLOTANTES (Solo visibles en pantalla) */}
          <div className="fixed bottom-8 right-8 no-print flex gap-2 z-50">
              <PrintButton />
          </div>

        </div>
      </div>
    </div>
  );
}