import { Users, UserPlus, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Division } from '@prisma/client';

interface Props {
    stats: {
        totalCustomers: number;
        googleUsers: number;
        newCustomers: number;
    };
    division: Division;
}

export function CustomerStats({ stats, division }: Props) {
    const isFestamas = division === 'JUGUETERIA';
    const iconColor = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";
    const bgIcon = isFestamas ? "bg-festamas-primary/10" : "bg-fiestasya-accent/10";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={cn("p-3 rounded-full", bgIcon)}>
                        <Users className={cn("w-6 h-6", iconColor)} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Clientes Registrados</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.totalCustomers}</h3>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={cn("p-3 rounded-full bg-blue-50")}>
                        <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Usuarios Google</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.googleUsers}</h3>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={cn("p-3 rounded-full bg-emerald-50")}>
                        <UserPlus className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Nuevos este Mes</p>
                        <h3 className="text-2xl font-bold text-slate-900">+{stats.newCustomers}</h3>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}