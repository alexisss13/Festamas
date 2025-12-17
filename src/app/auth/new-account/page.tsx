'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser, loginWithGoogle } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

type FormInputs = {
  name: string;
  email: string;
  password: string;
};

export default function NewAccountPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    const r = await registerUser(data.name, data.email, data.password);
    if (r.ok) {
      toast.success('Cuenta creada exitosamente.');
      router.push('/auth/login');
    } else {
      toast.error(r.message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Crear cuenta
        </h1>
        <p className="text-slate-500">
          Únete para gestionar tus pedidos y favoritos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Juan Pérez"
            className={clsx("h-11 bg-white border-slate-200 focus:border-[#fc4b65] focus:ring-[#fc4b65]/20", { 'border-red-500': errors.name })}
            {...register('name', { required: true, minLength: 2 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            className={clsx("h-11 bg-white border-slate-200 focus:border-[#fc4b65] focus:ring-[#fc4b65]/20", { 'border-red-500': errors.email })}
            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={isVisible ? "text" : "password"}
              placeholder="••••••••"
              className={clsx("h-11 bg-white border-slate-200 focus:border-[#fc4b65] focus:ring-[#fc4b65]/20 pr-10", { 'border-red-500': errors.password })}
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
          className="w-full h-11 text-base font-bold bg-[#fc4b65] hover:bg-[#e11d48] transition-colors border-0"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Registrarme'}
        </Button>
      </form>

      <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">O regístrate con</span></div>
      </div>

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
         ¿Ya tienes cuenta?{' '}
         <Link href="/auth/login" className="font-bold text-[#fc4b65] hover:underline">
           Inicia sesión
         </Link>
      </div>
    </>
  );
}