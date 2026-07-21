import { Construction, Frown, Store } from 'lucide-react';

// Se muestra en vez del layout normal cuando getEcommerceContextFromCookie()
// no pudo resolver un negocio para el dominio de la petición — antes esto
// simplemente tiraba un error sin manejar y el visitante veía la pantalla de
// error genérica de Next.js. Diferencia los dos casos esperados (dominio sin
// negocio asignado, negocio sin sucursales habilitadas todavía) de cualquier
// otro fallo inesperado.
export function StorefrontUnavailable({ reason }: { reason?: string }) {
  const content = (() => {
    if (reason === 'No existe un negocio ecommerce activo para el dominio solicitado') {
      return {
        Icon: Store,
        title: 'Esta tienda no existe',
        description: 'El dominio al que intentas acceder no está asignado a ningún negocio activo todavía.',
      };
    }
    if (reason === 'No se encontraron sucursales e-commerce para el negocio configurado') {
      return {
        Icon: Construction,
        title: 'Tienda en preparación',
        description: 'Este negocio todavía no habilitó ninguna sucursal para ventas en línea.',
      };
    }
    return {
      Icon: Frown,
      title: 'No pudimos cargar esta tienda',
      description: 'Ocurrió un problema inesperado. Intenta de nuevo en unos minutos.',
    };
  })();

  const { Icon, title, description } = content;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
      </div>
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
