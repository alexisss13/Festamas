import { Metadata } from 'next';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export async function generateMetadata(): Promise<Metadata> { const { business, activeBranch } = await getEcommerceContextFromCookie(); const name = activeBranch.name || business.name; return { title: `Términos y condiciones | ${name}`, description: `Políticas de servicio, pagos y entregas de ${name}.` }; }

export default async function TermsPage() {
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const name = activeBranch.name || business.name;
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Términos y Condiciones</h1>
      
      <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introducción</h2>
          <p>
            Bienvenido a <strong>{name}</strong>. Al acceder a nuestro sitio web y realizar pedidos, aceptas los siguientes términos y condiciones.
            Nos reservamos el derecho de actualizar estos términos en cualquier momento sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Proceso de Compra</h2>
          <p>
            Nuestra plataforma permite consultar el catálogo y solicitar pedidos según las modalidades habilitadas por la tienda:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Selecciona tus productos y agrégalos al carrito.</li>
            <li>Al completar el pedido recibirás la confirmación disponible para la tienda.</li>
            <li>El stock, pago y entrega se confirman conforme a la modalidad seleccionada.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Precios y Pagos</h2>
          <p>
            Los precios y medios de pago disponibles se muestran antes de confirmar el pedido.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Los medios de pago pueden variar según la tienda y el pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Envíos y Entregas</h2>
          <p>
            Las zonas, costos y tiempos de entrega se informan durante el pedido. Cuando esté habilitado, también podrás elegir <strong>recojo en tienda</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cambios y Devoluciones</h2>
          <p>
            Aceptamos cambios dentro de los primeros 7 días calendario tras la compra, siempre que el producto esté sellado y en perfectas condiciones.
            No se aceptan devoluciones de productos inflados (globos) o usados, salvo defecto de fábrica comprobado al momento de la entrega.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contacto</h2>
          <p>
            Para cualquier duda o reclamo, puedes escribirnos a nuestro WhatsApp o al correo electrónico de soporte.
          </p>
        </section>

        <div className="pt-8 border-t text-sm text-slate-500">
          Última actualización: {new Date().toLocaleDateString()}
        </div>

      </div>
    </div>
  );
}
