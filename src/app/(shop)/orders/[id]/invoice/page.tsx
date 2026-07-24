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
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  const { business } = await getEcommerceContextFromCookie();
  const order = await prisma.order.findFirst({ where: { id, businessId: business.id }, include: { business: { select: { name: true } }, branch: { select: { name: true } } } });

  if (!order) return { title: 'Ticket no encontrado' };

  const brandName = order.branch?.name || order.business?.name || 'Tienda online';
  
  // Si no hay numero de recibo, usamos el ID corto
  const receiptNum = order.receiptNumber || `WEB-${order.id.split('-')[0].toUpperCase()}`;

  return {
    title: `Ticket ${receiptNum} - ${brandName}`,
    // Comprobante con datos personales del comprador — nunca debe indexarse.
    robots: { index: false, follow: false },
  };
}

export default async function InvoicePage({ params }: Props) {
  const session = await auth();
  
  if (!session?.user) {
      redirect('/auth/login');
  }

  const { id } = await params;

  const { business } = await getEcommerceContextFromCookie();
  const order = await prisma.order.findFirst({
    where: { id, businessId: business.id, source: 'ONLINE' },
    include: {
      orderItems: true,
      business: { select: { name: true, ruc: true, address: true, logoUrl: true } },
      branch: { select: { name: true, phone: true, address: true, customRuc: true, customLegalName: true, customAddress: true, logos: true, brandColors: true } },
    }
  });

  if (!order) notFound();

  // Validación de seguridad (Dueño o Admin)
  if (order.userId !== session.user.id && !['ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(session.user.role || '')) {
      redirect('/');
  }

  const branchLogos = order.branch?.logos as Record<string, unknown> | null;
  const branchColors = order.branch?.brandColors as Record<string, unknown> | null;
  const brandConfig = { name: order.branch?.name || order.business?.name || 'Tienda online', logo: typeof branchLogos?.imagotipo === 'string' ? branchLogos.imagotipo : order.business?.logoUrl || '', color: typeof branchColors?.primary === 'string' ? branchColors.primary : '#334155' };

  const companyInfo = {
    razonSocial: order.branch?.customLegalName || order.business?.name || brandConfig.name,
    ruc: order.branch?.customRuc || order.business?.ruc || 'Pendiente',
    address: order.branch?.customAddress || order.branch?.address || order.business?.address || 'Perú',
    email: ''
  };


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
            /* Ocultamos todo lo que no sea el ticket */
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
            /* El ticket en sí con márgenes internos controlados */
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
        
        {/* TICKET */}
        <div className="invoice-container bg-white w-full max-w-[21cm] min-h-[29.7cm] p-12 shadow-xl rounded-sm relative box-border">
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-8 border-b pb-8 border-slate-100">
            <div className="flex flex-col gap-1 max-w-[50%]">
               <div className="relative w-48 h-20 mb-3">
                  {brandConfig.logo ? (
                      <Image 
                        src={brandConfig.logo} 
                        unoptimized
                        alt={brandConfig.name} 
                        fill 
                        sizes="192px"
                        className="object-contain object-left" 
                        priority
                      />
                  ) : (
                      <div className="flex h-full items-center font-black text-2xl text-slate-800">{brandConfig.name}</div>
                  )}
               </div>
               <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wide leading-tight">
                 {companyInfo.razonSocial}
               </h1>
               <p className="text-xs text-slate-500 font-medium">RUC: {companyInfo.ruc}</p>
               <p className="text-xs text-slate-500">{companyInfo.address}</p>
               <p className="text-xs text-slate-500">{companyInfo.email}</p>
            </div>
            
            <div className="text-right">
              <div className="inline-block border-2 p-4 rounded-lg text-center min-w-[220px] border-slate-200 bg-slate-50">
                  <h2 className="text-xl font-black text-slate-800 uppercase mb-1">Ticket de Pedido</h2>
                  <p className="text-xs text-slate-500 mb-3 tracking-widest uppercase">Venta online</p>
                  
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">N° Pedido</p>
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
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brandConfig.color }}></span>
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
                              <span className="font-bold block text-slate-800">{item.productName}</span>
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
                      <span>Subtotal</span>
                      <span className="font-mono">{formatCurrency(Number(order.totalAmount) - Number(order.shippingCost))}</span>
                  </div>
                  {Number(order.shippingCost) > 0 && (
                    <div className="flex justify-between text-slate-600 text-xs font-medium pt-1">
                        <span>Costo de Envío</span>
                        <span className="font-mono">{formatCurrency(Number(order.shippingCost))}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-200/60 my-2 pt-2 flex justify-between items-center">
                      <span className="font-black text-slate-800 text-sm uppercase">Importe Total</span>
                      <span className="font-black text-xl font-mono" style={{ color: brandConfig.color }}>
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
                Representación impresa del ticket de pedido online. 
                Consulte el detalle desde su cuenta en la tienda.
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
