'use client';

// Red de seguridad para errores no manejados en cualquier parte del árbol
// (incluido el propio layout raíz) — sin esto, un fallo inesperado mostraba
// la pantalla de error genérica de Next.js en vez de algo que un cliente
// real de la tienda pueda entender.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-lg font-semibold text-slate-800">Algo salió mal</h1>
          <p className="max-w-sm text-sm text-slate-500">
            Ocurrió un problema inesperado cargando esta página. Intenta de nuevo.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
