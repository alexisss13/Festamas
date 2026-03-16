import { Users, UserPlus, Globe, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    stats: {
        totalCustomers: number;
        googleUsers: number;
        newCustomers: number;
    };
    staffCount: number;
}

export function CustomerStats({ stats, staffCount }: Props) {
    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-400 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
                        Total Clientes
                    </CardTitle>
                    <div className="p-2 sm:p-2.5 rounded-full bg-slate-100 shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalCustomers}</div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
                        Registrados en plataforma
                    </p>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-400 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
                        Usuarios Google
                    </CardTitle>
                    <div className="p-2 sm:p-2.5 rounded-full bg-slate-100 shrink-0">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">{stats.googleUsers}</div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
                        Autenticación con Google
                    </p>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-400 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
                        Nuevos este Mes
                    </CardTitle>
                    <div className="p-2 sm:p-2.5 rounded-full bg-slate-100 shrink-0">
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">+{stats.newCustomers}</div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
                        Clientes nuevos
                    </p>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-400 bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
                        Staff Activo
                    </CardTitle>
                    <div className="p-2 sm:p-2.5 rounded-full bg-slate-100 shrink-0">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">{staffCount}</div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
                        Admins y vendedores
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}