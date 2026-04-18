'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NewAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al home donde se abrirá el modal
    router.replace('/?openRegister=true');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#fc4b65] mx-auto" />
        <p className="text-slate-600">Redirigiendo...</p>
      </div>
    </div>
  );
}