'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAdminUser, UserInput } from '@/actions/admin-users';
import { Role, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Loader2, Save, User, Mail, Shield, KeyRound, 
    AlertTriangle, ImageIcon, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/ui/image-upload';

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: Role;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accounts: any[];
}

interface Props {
  user?: UserData | null;
  currentDivision: Division;
}

export function UserForm({ user, currentDivision }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const isFestamas = currentDivision === 'JUGUETERIA';
  const brandFocusClass = isFestamas ? "focus-visible:ring-festamas-primary" : "focus-visible:ring-fiestasya-accent";
  const brandButtonClass = isFestamas 
    ? "bg-festamas-primary hover:bg-festamas-primary/90" 
    : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";

  // Estados
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<Role>(user?.role || 'SELLER');
  const [image, setImage] = useState(user?.image || '');
  
  // Contraseñas
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isGoogleUser = user?.accounts?.some(acc => acc.provider === 'google');

  // Estado inicial (Snapshot)
  const [initialData, setInitialData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'SELLER',
    image: user?.image || '',
    password: ''
  });
  
  const isDirty = 
    name !== initialData.name || 
    email !== initialData.email || 
    role !== initialData.role ||
    image !== initialData.image ||
    password !== '';

  // Protección de salida
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.target !== '_blank') {
        if (!window.confirm('Tienes cambios sin guardar. ¿Salir?')) {
          e.preventDefault(); e.stopPropagation();
        }
      }
    };
    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, [isDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { toast.error("Nombre y Email obligatorios"); return; }
    
    // Validación de contraseñas
    if (!user && !password) { toast.error("Contraseña obligatoria para nuevos usuarios"); return; }
    if (password && password !== confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    if (password && password.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }

    setLoading(true);

    const dataToSend: UserInput = { 
        name, 
        email, 
        role, 
        image: image || undefined,
        password: password || undefined 
    };
    
    const result = await saveAdminUser(dataToSend, user?.id);

    if (result.ok) {
      toast.success(user ? 'Perfil actualizado' : 'Usuario registrado');
      // Reseteamos password fields visualmente y actualizamos snapshot
      setPassword('');
      setConfirmPassword('');
      setInitialData({ name, email, role, image, password: '' });
      router.push('/admin/users');
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (isDirty && !confirm('¿Descartar cambios?')) return;
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1200px] mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                {user ? 'Editar Staff' : 'Registrar Nuevo Staff'}
                {/* Badge de "Cambios sin guardar" */}
                {isDirty && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Sin guardar
                    </span>
                )}
            </h2>
            <p className="text-slate-500 mt-1">Configura los accesos y permisos del equipo administrativo.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                disabled={loading} 
                className="flex-1 md:flex-none h-11 md:h-10" // Más alto en móvil para mejor touch
            >
                Cancelar
            </Button>
            <Button 
                type="submit" 
                className={cn(
                    "text-white flex-1 md:flex-none min-w-[140px] shadow-sm font-semibold h-11 md:h-10", // Altura touch-friendly
                    brandButtonClass
                )} 
                disabled={loading}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {/* 📱 TEXTO RESPONSIVE: "Guardar" en móvil, "Guardar Cambios" en PC */}
                <span>Guardar <span className="hidden sm:inline">Cambios</span></span>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: FOTO (4 columnas) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-base border-b pb-3">
                    <ImageIcon className="w-4 h-4 text-slate-500" /> Foto de Perfil
                </h3>
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-full max-w-[250px]"> 
                        <ImageUpload 
                            value={image ? [image] : []}
                            onChange={(urls) => setImage(urls[0] || '')}
                            disabled={loading}
                            maxFiles={1}       
                            sizing="cover"     // Cuadrada perfecta
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center max-w-[200px]">
                        Sube una foto profesional.
                    </p>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: DATOS (8 columnas) */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-base border-b pb-3">
                    <User className="w-4 h-4 text-slate-500" /> Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-600 font-medium text-sm">Nombre Completo</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Ej: Juan Pérez"
                            className={brandFocusClass} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-600 font-medium text-sm">Correo Profesional</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="empleado@festamas.com"
                            disabled={!!user} 
                            className={cn(brandFocusClass, user && "bg-slate-50 text-slate-500 cursor-not-allowed")} 
                        />
                        {user && <p className="text-[10px] text-slate-400">El ID de usuario no se puede cambiar.</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-base border-b pb-3">
                    <Shield className="w-4 h-4 text-slate-500" /> Seguridad y Accesos
                </h3>

                <div className="space-y-6">
                    {/* SELECCIÓN DE ROL */}
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-slate-600 font-medium text-sm">Nivel de Acceso</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <Select value={role} onValueChange={(val) => setRole(val as Role)}>
                                <SelectTrigger className={cn("w-full", brandFocusClass)}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SELLER">Vendedor (Punto de Venta)</SelectItem>
                                    <SelectItem value="ADMIN">Administrador (Acceso Total)</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Mensaje Informativo del Rol */}
                            <div className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed",
                                role === 'ADMIN' ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                            )}>
                                {role === 'ADMIN' ? (
                                    <>
                                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold block mb-0.5">Acceso Crítico</span>
                                            Puede modificar configuración, ver métricas sensibles y gestionar usuarios.
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold block mb-0.5">Acceso Operativo</span>
                                            Acceso limitado al Punto de Venta, gestión de productos y pedidos.
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN DE CONTRASEÑA */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        {isGoogleUser ? (
                            <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 flex items-start gap-3">
                                <div className="p-1 bg-white rounded-full shadow-sm"><AlertTriangle className="h-4 w-4 text-blue-500" /></div>
                                <div>
                                    <p className="font-semibold">Cuenta vinculada a Google</p>
                                    <p className="text-xs opacity-90 mt-1">Este usuario inicia sesión principalmente con Google. Puedes establecer una contraseña alternativa si lo deseas.</p>
                                </div>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-600 font-medium text-sm flex items-center gap-2">
                                    <KeyRound className="w-3.5 h-3.5 text-slate-400"/>
                                    {user ? "Nueva Contraseña" : "Contraseña"}
                                </Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder={user ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
                                    className={brandFocusClass} 
                                />
                            </div>

                            {(password || !user) && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Label htmlFor="confirmPassword" className="text-slate-600 font-medium text-sm">Confirmar Contraseña</Label>
                                    <Input 
                                        id="confirmPassword" 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        placeholder="Repite la contraseña"
                                        className={cn(brandFocusClass, password && confirmPassword && password !== confirmPassword && "border-red-300 ring-red-100 focus-visible:ring-red-300")} 
                                    />
                                    {password && confirmPassword && password !== confirmPassword && (
                                        <p className="text-[10px] text-red-500 font-medium">Las contraseñas no coinciden.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </form>
  );
}