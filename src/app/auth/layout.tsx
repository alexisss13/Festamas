import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white">
      
      {/* 🖼️ COLUMNA IZQUIERDA (Imagen de Marca) */}
      <div className="hidden lg:block relative h-full w-full bg-slate-900">
        <Image
          src="/images/logo.jpg" // 👈 Asegúrate de tener una foto bonita aquí (o usa una URL de ejemplo)
          alt="Celebración Festamas"
          fill
          className="object-cover opacity-60"
          priority
        />
        
        {/* Overlay de Marca */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-12">
           <div className="flex items-center gap-4 mb-4">
              <span className="text-white text-3xl font-extrabold tracking-tight">Festamas</span>
              <span className="text-white/50 text-3xl font-light">+</span>
              <span className="text-white text-3xl font-extrabold tracking-tight">FiestasYa</span>
           </div>
           <p className="text-slate-200 text-lg max-w-md leading-relaxed">
             Únete a la comunidad más grande de celebraciones en Trujillo. Encuentra todo para tu fiesta en un solo lugar.
           </p>
        </div>
      </div>

      {/* 📝 COLUMNA DERECHA (El Formulario) */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-sm space-y-8">
           {children}
        </div>
      </div>

    </div>
  );
}