'use client';

import { useActionState, useEffect, useState } from 'react';
import { authenticate, loginWithGoogle } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Eye, EyeOff, Mail, Lock, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  branches?: any[];
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, branches = [] }: LoginModalProps) {
  const router = useRouter();
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [isVisible, setIsVisible] = useState(false);

  // Redirección inteligente
  useEffect(() => {
    if (errorMessage === 'Redirect:Home') {
      onClose();
      window.location.reload();
    } else if (errorMessage === 'Redirect:Admin') {
      onClose();
      window.location.replace('/admin/dashboard');
    }
  }, [errorMessage, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">Iniciar Sesión</DialogTitle>
        
        {/* Header con logos de sucursales */}
        {branches.length > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-center gap-4 overflow-x-auto">
              {branches.map((branch: any) => {
                const branchLogos = (branch.logos as any) || {};
                const logo = branchLogos.isotipo || branchLogos.imagotipo;
                
                return logo ? (
                  <div key={branch.id} className="flex-shrink-0">
                    <Image
                      src={logo}
                      alt={branch.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Contenido del formulario */}
        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 text-sm">
              Inicia sesión para continuar
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="tu@correo.com" 
                  required 
                  autoComplete="email"
                  className="h-12 pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                <Link href="#" className="text-xs font-medium text-[#fc4b65] hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  id="password" 
                  name="password" 
                  type={isVisible ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  autoComplete="current-password"
                  className="h-12 pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 transition-all"
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

            {errorMessage && !errorMessage.startsWith('Redirect:') && (
              <div className="p-3 rounded-lg bg-red-50 text-sm text-red-600 border border-red-100 font-medium text-center animate-in fade-in slide-in-from-top-1">
                {errorMessage}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-[#fc4b65] hover:bg-[#e11d48] transition-colors shadow-lg shadow-[#fc4b65]/20" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">O continúa con</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full h-12 gap-3 text-slate-700 font-medium border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all"
          >
            <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={20} height={20} />
            Google
          </Button>

          <div className="text-center text-sm text-slate-600 pt-2">
            ¿Aún no tienes cuenta?{' '}
            {onSwitchToRegister ? (
              <button 
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    onSwitchToRegister();
                  }, 300);
                }}
                className="font-bold text-[#fc4b65] hover:underline hover:text-[#e11d48] transition-colors"
              >
                Regístrate aquí
              </button>
            ) : (
              <Link 
                href="/auth/new-account" 
                onClick={onClose}
                className="font-bold text-[#fc4b65] hover:underline hover:text-[#e11d48] transition-colors"
              >
                Regístrate aquí
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
