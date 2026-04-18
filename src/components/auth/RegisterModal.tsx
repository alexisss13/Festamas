'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { registerUser, loginWithGoogle } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

type FormInputs = {
  name: string;
  email: string;
  password: string;
};

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  branches?: any[];
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin, branches = [] }: RegisterModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    const r = await registerUser(data.name, data.email, data.password);
    if (r.ok) {
      toast.success('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      reset();
      onClose();
      setTimeout(() => {
        onSwitchToLogin();
      }, 300);
    } else {
      toast.error(r.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">Crear Cuenta</DialogTitle>
        
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
              Crear cuenta
            </h2>
            <p className="text-slate-500 text-sm">
              Únete para gestionar tus pedidos y favoritos
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  className={clsx(
                    "h-12 pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 transition-all",
                    { 'border-red-500 focus:border-red-500': errors.name }
                  )}
                  {...register('name', { required: true, minLength: 2 })}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">El nombre es requerido (mínimo 2 caracteres)</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  className={clsx(
                    "h-12 pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 transition-all",
                    { 'border-red-500 focus:border-red-500': errors.email }
                  )}
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">Ingresa un correo válido</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={isVisible ? "text" : "password"}
                  placeholder="••••••••"
                  className={clsx(
                    "h-12 pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 transition-all",
                    { 'border-red-500 focus:border-red-500': errors.password }
                  )}
                  {...register('password', { required: true, minLength: 6 })}
                />
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">Mínimo 6 caracteres</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-[#fc4b65] hover:bg-[#e11d48] transition-colors shadow-lg shadow-[#fc4b65]/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">O regístrate con</span>
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
            ¿Ya tienes cuenta?{' '}
            <button 
              onClick={() => {
                onClose();
                setTimeout(() => {
                  onSwitchToLogin();
                }, 300);
              }}
              className="font-bold text-[#fc4b65] hover:underline hover:text-[#e11d48] transition-colors"
            >
              Inicia sesión
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
