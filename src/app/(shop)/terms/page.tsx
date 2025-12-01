import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | FiestasYa',
  description: 'Conoce nuestras políticas de servicio, pagos y envíos.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Términos y Condiciones</h1>
      
      <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introducción</h2>
          <p>
            Bienvenido a <strong>FiestasYa</strong>. Al acceder a nuestro sitio web y realizar pedidos, aceptas los siguientes términos y condiciones.
            Nos reservamos el derecho de actualizar estos términos en cualquier momento sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Proceso de Compra</h2>
          <p>
            Nuestra plataforma funciona bajo la modalidad de <strong>Catálogo Digital</strong>.
            El proceso de compra se finaliza a través de WhatsApp:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Selecciona tus productos y agrégalos al carrito.</li>
            <li>Al completar el pedido, se generará un enlace automático a nuestro WhatsApp oficial.</li>
            <li>La confirmación del stock y el pago final se coordinan directamente con nuestro equipo de ventas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Precios y Pagos</h2>
          <p>
            Todos los precios están expresados en Soles (S/.) e incluyen IGV. 
            Aceptamos los siguientes métodos de pago (previa coordinación):
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Transferencia Bancaria (BCP, Interbank, BBVA).</li>
            <li>Yape / Plin.</li>
            <li>Pago contra entrega (sujeto a cobertura y disponibilidad).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Envíos y Entregas</h2>
          <p>
            Realizamos envíos a todo Trujillo y zonas aledañas. El costo del delivery varía según la distancia y se cotizará al momento de confirmar el pedido por WhatsApp.
            También ofrecemos la opción de <strong>Recojo en Tienda</strong> sin costo adicional.
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