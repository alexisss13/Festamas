'use client';

import { useActionState, useEffect, useState } from 'react';
import { authenticate, loginWithGoogle } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [isVisible, setIsVisible] = useState(false);

  // 🧠 Lógica de Redirección Inteligente
  useEffect(() => {
    if (errorMessage === 'Redirect:Home') {
      window.location.replace('/'); // Clientes al Home
    } else if (errorMessage === 'Redirect:Admin') {
      window.location.replace('/admin/dashboard'); // Admins a su cueva
    }
  }, [errorMessage]);

  return (
    <>
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Iniciar Sesión
        </h1>
        <p className="text-slate-500">
          Bienvenido de nuevo
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="tu@correo.com" 
            required 
            className="h-11 bg-white border-slate-200 focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link href="#" className="text-xs font-medium text-[#fc4b65] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={isVisible ? "text" : "password"} 
              placeholder="••••••••" 
              required 
              className="h-11 bg-white border-slate-200 focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 🔴 FIX: Solo mostramos la alerta si NO es una redirección */}
        {errorMessage && !errorMessage.startsWith('Redirect:') && (
          <div className="p-3 rounded-md bg-red-50 text-sm text-red-600 border border-red-100 font-medium text-center animate-in fade-in slide-in-from-top-1">
            {errorMessage}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-11 text-base font-bold bg-[#fc4b65] hover:bg-[#e11d48] transition-colors border-0" 
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ingresar'}
        </Button>
      </form>

      {/* SEPARADOR */}
      <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">O continúa con</span></div>
      </div>

      {/* GOOGLE (Abajo) */}
      <Button 
          variant="outline" 
          type="button"
          onClick={() => loginWithGoogle()}
          className="w-full h-12 gap-3 text-slate-700 font-medium border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
          <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={20} height={20} />
          Google
      </Button>

      <div className="text-center text-sm text-slate-600 pt-2">
         ¿Aún no tienes cuenta?{' '}
         <Link href="/auth/new-account" className="font-bold text-[#fc4b65] hover:underline">
           Regístrate aquí
         </Link>
      </div>
    </>
  );
}