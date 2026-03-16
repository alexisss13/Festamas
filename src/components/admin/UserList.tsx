'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteAdminUser } from '@/actions/admin-users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Trash2, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserList({ users }: { users: any[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

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
        <div className="space-y-4 [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">
            {/* Buscador */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative max-w-full sm:max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar usuario..." 
                        className="pl-10 h-9 bg-white border-slate-200 focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-slate-500 text-center sm:text-left">
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
                </div>
            </div>

            {/* Tabla con scroll horizontal */}
            <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="w-full overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                                <TableHead className="h-11 px-4 lg:px-6 w-16">#</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-slate-700 min-w-[150px]">Nombre</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-slate-700 min-w-[200px]">Correo Electrónico</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-24">Rol</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-slate-700 w-32">Autenticación</TableHead>
                                <TableHead className="h-11 px-4 lg:px-6 text-right font-semibold text-slate-700 w-24">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => {
                                const isGoogle = user.accounts?.some((acc: any) => acc.provider === 'google');
                                const isAdmin = user.role === 'ADMIN';
                                const isSeller = user.role === 'SELLER';

                                return (
                                    <TableRow key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                        <TableCell className="py-3 px-4 lg:px-6">
                                            <Avatar className="h-9 w-9 border border-slate-200">
                                                <AvatarImage src={user.image} />
                                                <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 font-medium text-slate-900">{user.name}</TableCell>
                                        <TableCell className="py-3 px-4 text-slate-600">{user.email}</TableCell>
                                        <TableCell className="py-3 px-4">
                                            <Badge variant="outline" className={cn(
                                                "text-xs font-medium",
                                                isAdmin ? "bg-slate-900 text-white border-slate-900" : 
                                                isSeller ? "bg-amber-50 text-amber-700 border-amber-300" : 
                                                "bg-blue-50 text-blue-700 border-blue-300"
                                            )}>
                                                {isAdmin ? "Admin" : isSeller ? "Vendedor" : "Cliente"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-slate-600">{isGoogle ? "Google" : "Email"}</TableCell>
                                        <TableCell className="py-3 px-4 lg:px-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    asChild 
                                                    title="Editar usuario"
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                                                >
                                                    <Link href={`/admin/users/${user.id}`}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    title="Eliminar usuario"
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={isAdmin && filteredUsers.filter(u => u.role === 'ADMIN').length <= 1}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <User className="w-10 h-10 mb-2 opacity-20" />
                                            <p className="text-sm font-medium">No se encontraron usuarios</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
