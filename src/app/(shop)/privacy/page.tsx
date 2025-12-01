import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | FiestasYa',
  description: 'Cómo recopilamos, usamos y protegemos tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Política de Privacidad</h1>
      
      <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Compromiso de Seguridad</h2>
          <p>
            En <strong>FiestasYa</strong>, valoramos tu confianza. Nos comprometemos a proteger tu privacidad y a utilizar tu información personal de manera responsable y segura, cumpliendo con la normativa vigente de protección de datos personales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Información que Recopilamos</h2>
          <p>
            Para procesar tus pedidos y mejorar tu experiencia, podemos solicitarte los siguientes datos:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Datos de Identificación:</strong> Nombre y Apellidos.</li>
            <li><strong>Datos de Contacto:</strong> Número de celular (WhatsApp) para coordinar entregas.</li>
            <li><strong>Datos de Navegación:</strong> Información anónima sobre cómo interactúas con nuestra web.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Uso de la Información</h2>
          <p>
            Utilizamos tus datos exclusivamente para los siguientes fines:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Gestionar y coordinar tus pedidos a través de WhatsApp.</li>
            <li>Contactarte en caso de incidencias con el stock o la entrega.</li>
            <li>Mejorar nuestro catálogo de productos basándonos en las preferencias de compra.</li>
          </ul>
          <p className="mt-2">
            <strong>No compartimos, vendemos ni alquilamos tu información personal a terceros.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Cookies y Almacenamiento Local</h2>
          <p>
            Nuestro sitio utiliza almacenamiento local (LocalStorage) y Cookies técnicas esenciales para:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Recordar los productos que agregaste al carrito de compras.</li>
            <li>Mantener tu sesión activa mientras navegas por la tienda.</li>
          </ul>
          <p className="mt-2">
            Estas tecnologías son necesarias para el funcionamiento básico de la tienda y no rastrean tu actividad fuera de nuestro sitio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Tus Derechos</h2>
          <p>
            Tienes derecho a solicitar el acceso, rectificación o eliminación de tus datos personales de nuestros registros.
            Para ejercer estos derechos, puedes contactarnos directamente a través de nuestro WhatsApp o canales oficiales.
          </p>
        </section>

        <div className="pt-8 border-t text-sm text-slate-500">
          Última actualización: {new Date().toLocaleDateString()}
        </div>

      </div>
    </div>
  );
}