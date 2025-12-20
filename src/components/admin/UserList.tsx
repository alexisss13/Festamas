'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteAdminUser } from '@/actions/admin-users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Trash2, Mail, Shield, User, Search, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Division } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserList({ users, division }: { users: any[], division: Division }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    
    const isFestamas = division === 'JUGUETERIA';
    const brandColorText = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";

    // Filtrado local
    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar usuario permanentemente? Esta acción no se puede deshacer.")) return;
        const res = await deleteAdminUser(id);
        if (res.ok) {
            toast.success("Usuario eliminado");
            router.refresh();
        } else {
            toast.error(res.message || "Error al eliminar");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Buscador */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Buscar por nombre o correo..." 
                    className="pl-10 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((user) => {
                    const isGoogle = user.accounts?.some((acc: any) => acc.provider === 'google');
                    const isAdmin = user.role === 'ADMIN';
                    const isSeller = user.role === 'SELLER';

                    return (
                        <Card key={user.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-5 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                {isGoogle ? (
                                                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 rounded"><GlobeIcon className="w-3 h-3"/> Google</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 rounded"><Mail className="w-3 h-3"/> Correo</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Badge className={cn(
                                        "text-[10px] px-2 py-0.5 border-none",
                                        isAdmin ? "bg-slate-900 text-white" : 
                                        isSeller ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                    )}>
                                        {isAdmin ? "ADMIN" : isSeller ? "VENDEDOR" : "CLIENTE"}
                                    </Badge>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        {isAdmin ? <Shield className="w-3.5 h-3.5 text-slate-400"/> : isSeller ? <Store className="w-3.5 h-3.5 text-slate-400"/> : <User className="w-3.5 h-3.5 text-slate-400"/>}
                                        <span className="capitalize">{user.role.toLowerCase()}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" asChild className="h-8 text-slate-500 hover:text-slate-900">
                                        <Link href={`/admin/users/${user.id}`}>
                                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                                        </Link>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(user.id)}
                                        disabled={isAdmin && filteredUsers.filter(u => u.role === 'ADMIN').length <= 1} // No borrar al último admin
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                
                {filteredUsers.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                        No se encontraron usuarios.
                    </div>
                )}
            </div>
        </div>
    );
}

function GlobeIcon({className}: {className?: string}) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
    )
}