import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/actions/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, LogOut, Settings, Eye, ChevronRight, Gift, Phone, CreditCard } from 'lucide-react';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth-actions';
import Link from 'next/link';
import { EditCustomerInfo } from '@/components/profile/EditCustomerInfo';

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

  const { activeBranch } = await getEcommerceContextFromCookie();
  const brandColor = (activeBranch.brandColors as any)?.primary ?? '#fc4b65';

  const totalOrders = user.orders.length;
  const completedOrders = user.orders.filter((o) => o.isPaid).length;

  // Si tiene Customer vinculado, usar esos datos (incluye POS + Ecommerce)
  const pointsBalance = user.customer?.pointsBalance || 0;
  const totalVisits = user.customer?.visits || totalOrders; // Si no hay customer, usar pedidos como visitas

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* BREADCRUMB */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-slate-900">Inicio</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Mi Perfil</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Mi Perfil
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12 py-6 md:py-8">
        
        {/* HEADER CON AVATAR, INFO Y ESTADÍSTICAS */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 mb-6">
          {/* Fila superior: Avatar + Info + Acciones */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6 pb-6 border-b border-slate-100">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-2 border-slate-100">
                <AvatarImage src={user.image || ''} className="object-cover" />
                <AvatarFallback className="text-3xl font-semibold text-white" style={{ backgroundColor: brandColor }}>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.role === 'ADMIN' && (
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-[11px] bg-slate-900 text-white border-2 border-white shadow-sm">
                  Admin
                </Badge>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-[20px] md:text-[24px] font-semibold text-slate-900 mb-2">{user.name}</h2>
              <p className="text-[13px] md:text-[14px] text-slate-500 mb-3">{user.email}</p>
              <p className="text-[12px] text-slate-400">
                Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              {user.role === 'ADMIN' && (
                <Link href="/admin/dashboard">
                  <Button variant="outline" className="w-full md:w-auto gap-2 border-slate-200 hover:bg-slate-50 text-[13px] h-10 rounded-lg">
                    <Settings className="w-4 h-4" /> Panel Admin
                  </Button>
                </Link>
              )}
              <form action={logout}>
                <Button type="submit" variant="ghost" className="w-full md:w-auto gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 text-[13px] h-10 rounded-lg">
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </Button>
              </form>
            </div>
          </div>

          {/* Fila inferior: Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${brandColor}15` }}>
                <Package className="w-5 h-5" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Pedidos</p>
                <p className="text-[20px] font-bold text-slate-900">{totalOrders}</p>
                <p className="text-[10px] text-slate-400">{completedOrders} completados</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Visitas</p>
                <p className="text-[20px] font-bold text-slate-900">{totalVisits}</p>
                <p className="text-[10px] text-slate-400">
                  {totalVisits === 1 ? 'Compra' : 'Compras'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Direcciones</p>
                <p className="text-[20px] font-bold text-slate-900">{user.addresses.length}</p>
                <Link href="/profile/address" className="text-[10px] font-semibold hover:underline" style={{ color: brandColor }}>
                  Gestionar →
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <Gift className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] text-amber-700 font-medium uppercase tracking-wide">Puntos</p>
                <p className="text-[20px] font-bold text-amber-900">{pointsBalance.toLocaleString()}</p>
                <p className="text-[10px] text-amber-600">
                  {pointsBalance > 0 ? 'Disponibles' : 'Compra más'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL: Izquierda (Info + Direcciones) | Derecha (Pedidos) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SIDEBAR IZQUIERDO - Información y Direcciones */}
          <div className="space-y-6">
            
            {/* INFORMACIÓN PERSONAL */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-slate-900">Información Personal</h2>
                  <EditCustomerInfo
                    docType={user.customer?.docType}
                    docNumber={user.customer?.docNumber}
                    phone={user.customer?.phone}
                    brandColor={brandColor}
                  />
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {user.customer?.docNumber ? (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">
                        {user.customer.docType || 'Documento'}
                      </p>
                      <p className="text-[13px] font-medium text-slate-900">
                        {user.customer.docNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">
                        Documento
                      </p>
                      <p className="text-[12px] text-slate-400">
                        No registrado
                      </p>
                    </div>
                  </div>
                )}
                
                {user.customer?.phone ? (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">
                        Teléfono
                      </p>
                      <p className="text-[13px] font-medium text-slate-900">
                        {user.customer.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Phone className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">
                        Teléfono
                      </p>
                      <p className="text-[12px] text-slate-400">
                        No registrado
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* DIRECCIONES */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-slate-900">Mis Direcciones</h2>
                  <Link href="/profile/address">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-50">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {user.addresses.slice(0, 3).map((address) => (
                      <div key={address.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-slate-900 mb-1 line-clamp-1">
                              {address.address}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {address.city}, {address.province || 'Perú'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {user.addresses.length > 3 && (
                      <Link href="/profile/address">
                        <Button variant="ghost" size="sm" className="w-full text-[12px] h-9 hover:bg-slate-50" style={{ color: brandColor }}>
                          Ver todas ({user.addresses.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                      <MapPin className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-[13px] font-medium text-slate-900 mb-1">Sin direcciones</p>
                    <p className="text-[11px] text-slate-500 mb-4">Agrega una dirección de entrega</p>
                    <Link href="/profile/address">
                      <Button size="sm" className="h-9 text-[12px] rounded-lg" style={{ backgroundColor: brandColor }}>
                        Agregar dirección
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* PEDIDOS RECIENTES - DERECHA */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-slate-900">Pedidos Recientes</h2>
                  <Link href="/profile/orders">
                    <Button variant="ghost" size="sm" className="text-[12px] h-8 hover:bg-slate-50" style={{ color: brandColor }}>
                      Ver todos <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {user.orders.length > 0 ? (
                  <div className="space-y-3">
                    {user.orders.slice(0, 5).map((order) => (
                      <Link 
                        key={order.id} 
                        href={`/profile/orders/${order.id}`}
                        className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                      >
                        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                          <Package className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 mb-1">
                            Pedido #{order.id.split('-')[0].toUpperCase()}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-bold text-slate-900 mb-1">
                            S/ {Number(order.totalAmount || 0).toFixed(2)}
                          </p>
                          <Badge className={cn(
                            "text-[10px] font-semibold px-2.5 py-0.5",
                            order.isPaid 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          )}>
                            {order.isPaid ? 'Pagado' : 'Pendiente'}
                          </Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-5 bg-slate-50 rounded-full mb-4">
                      <Package className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-900 mb-2">No tienes pedidos aún</p>
                    <p className="text-[13px] text-slate-500 mb-6 max-w-sm">
                      Explora nuestra tienda y realiza tu primera compra
                    </p>
                    <Link href="/">
                      <Button size="sm" className="h-10 text-[13px] rounded-lg" style={{ backgroundColor: brandColor }}>
                        Ir a la tienda
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
