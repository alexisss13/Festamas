import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/actions/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Package, LogOut, Settings, CreditCard, ShieldCheck, Plus, ChevronRight } from 'lucide-react';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth-actions';
import Link from 'next/link';

export const metadata = {
  title: 'Mi Perfil | Festamas',
  description: 'Gestiona tu cuenta, direcciones y pedidos.',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login?returnTo=/profile');
  }

  const user = await getUserProfile();
  
  if (!user) {
    redirect('/');
  }

  // Detectar División para estilos
  const cookieStore = await cookies();
  const division = cookieStore.get('festamas_division')?.value || 'JUGUETERIA';
  const isFestamas = division === 'JUGUETERIA';

  // Estilos dinámicos
  const textPrimary = isFestamas ? 'text-[#fc4b65]' : 'text-[#ec4899]';
  const bgPrimary = isFestamas ? 'bg-[#fc4b65]' : 'bg-[#ec4899]';
  const bgPrimaryHover = isFestamas ? 'hover:bg-[#e11d48]' : 'hover:bg-[#be185d]';
  const bgLight = isFestamas ? 'bg-red-50' : 'bg-pink-50';

  return (
    // 🏗️ CONTENEDOR ESTANDARIZADO (Igual al Home y Orders)
    <div className="container mx-auto px-4 mt-8 md:mt-12 pb-24 animate-in fade-in duration-500">
      
      {/* 1. ENCABEZADO DE PERFIL */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative group">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg transition-transform group-hover:scale-105 ring-1 ring-slate-100">
                <AvatarImage src={user.image || ''} className="object-cover" />
                <AvatarFallback className={cn("text-3xl font-bold text-white", bgPrimary)}>
                    {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <Badge className={cn("absolute -bottom-2 -right-2 px-3 py-1 text-xs shadow-md border-white border-2", 
                user.role === 'ADMIN' ? "bg-slate-900" : "bg-emerald-500"
            )}>
                {user.role === 'ADMIN' ? 'Administrador' : 'Cliente Verificado'}
            </Badge>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1 py-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
            <p className="text-slate-500 font-medium">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 pt-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Miembro desde {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
            {user.role === 'ADMIN' && (
                <Link href="/admin/dashboard" className="w-full">
                    <Button variant="outline" className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                        <Settings className="w-4 h-4 text-slate-500" /> Panel Admin
                    </Button>
                </Link>
            )}
            
            {/* 🚪 BOTÓN CERRAR SESIÓN */}
            <form action={logout} className="w-full">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                </Button>
            </form>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* 2. GRID DE GESTIÓN (BENTO GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* TARJETA 1: DATOS PERSONALES */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 border-b border-slate-50">
                <CardTitle className="text-base font-bold text-slate-800">Datos Personales</CardTitle>
                <div className={cn("p-2 rounded-full bg-opacity-10", bgLight)}>
                    <User className={cn("w-4 h-4", textPrimary)} />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    <div className="grid gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{user.name}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{user.email}</span>
                    </div>
                    {/* Botón visual (funcionalidad futura) */}
                    <Button variant="outline" className="w-full mt-2 h-9 text-xs border-dashed text-slate-500 hover:text-slate-800 hover:bg-slate-50">
                        Editar Información
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* TARJETA 2: DIRECCIONES */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 relative overflow-hidden group h-full">
            <div className={cn("absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5", bgPrimary)} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 border-b border-slate-50">
                <CardTitle className="text-base font-bold text-slate-800">Mis Direcciones</CardTitle>
                <div className={cn("p-2 rounded-full bg-opacity-10", bgLight)}>
                    <MapPin className={cn("w-4 h-4", textPrimary)} />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {user.addresses.length > 0 ? (
                    <div className="space-y-3">
                        {user.addresses.slice(0, 2).map((address) => (
                            <div key={address.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-700 truncate">{address.address}</span>
                                    <span className="text-[10px] text-slate-500 truncate">{address.city}, {address.province || 'Perú'}</span>
                                </div>
                            </div>
                        ))}
                        <Link href="/profile/address" className="block">
                            <Button variant="ghost" className={cn("w-full mt-2 text-xs font-bold hover:bg-slate-50", textPrimary)}>
                                Gestionar Direcciones
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="bg-slate-50 p-3 rounded-full mb-3">
                            <MapPin className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-500 mb-4">No tienes direcciones guardadas.</p>
                        <Link href="/profile/address" className="w-full">
                            <Button className={cn("w-full text-white shadow-md transition-all active:scale-95", bgPrimary, bgPrimaryHover)}>
                                <Plus className="w-4 h-4 mr-2" /> Agregar Dirección
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* TARJETA 3: ÚLTIMOS PEDIDOS */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 md:col-span-2 lg:col-span-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 border-b border-slate-50">
                <CardTitle className="text-base font-bold text-slate-800">Pedidos Recientes</CardTitle>
                <div className={cn("p-2 rounded-full bg-opacity-10", bgLight)}>
                    <Package className={cn("w-4 h-4", textPrimary)} />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {user.orders.length > 0 ? (
                    <div className="space-y-4">
                        {user.orders.slice(0, 3).map((order) => (
                            <div key={order.id} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">#{order.id.split('-')[0].toUpperCase()}</span>
                                    <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <Badge variant="outline" className={cn("font-medium text-[10px] px-2", 
                                    order.isPaid 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                )}>
                                    {order.isPaid ? 'Pagado' : 'Pendiente'}
                                </Badge>
                            </div>
                        ))}
                        {/* 🔗 ENLACE ARREGLADO A /profile/orders */}
                        <Button variant="link" className={cn("w-full text-xs h-auto p-0 mt-2 gap-1 group/link", textPrimary)} asChild>
                            <Link href="/profile/orders">
                                Ver historial completo <ChevronRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center h-full min-h-[140px]">
                        <Package className="w-10 h-10 text-slate-200 mb-2" />
                        <p className="text-sm text-slate-500">Aún no has realizado compras.</p>
                        <Link href="/" className={cn("text-xs font-bold mt-2 hover:underline", textPrimary)}>
                            ¡Ir a la tienda!
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* TARJETA 4: SEGURIDAD (Banner Inferior) */}
        <Card className="bg-slate-50/50 border-slate-100 md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full shadow-sm ring-1 ring-slate-100">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="font-bold text-slate-800">Tu cuenta está protegida</h3>
                        <p className="text-sm text-slate-500">Tus datos están encriptados. No compartimos tu información.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <CreditCard className="w-4 h-4" /> Pagos procesados por Mercado Pago
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}