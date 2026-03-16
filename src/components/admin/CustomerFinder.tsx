'use client';

import { useState } from 'react';
import { Search, Loader2, KeyRound, User, X, Pencil, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { searchCustomers, adminResetPassword, updateCustomerProfile } from '@/actions/admin-users';
import { toast } from 'sonner';

export function CustomerFinder() {
    const [query, setQuery] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.length < 3) {
            toast.error("Ingresa al menos 3 letras para buscar");
            return;
        }
        setSearching(true);
        setHasSearched(false);
        
        const { users } = await searchCustomers(query);
        
        setResults(users || []);
        setSearching(false);
        setHasSearched(true);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
    };

    return (
        <div className="space-y-4 [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">
            {/* BARRA DE BÚSQUEDA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 flex-1 max-w-full sm:max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Buscar cliente..." 
                            className="pl-10 pr-10 h-9 bg-white focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (e.target.value === '') handleClear();
                            }}
                        />
                        {query.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" disabled={searching || query.length < 3} className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-9 w-full sm:w-auto sm:min-w-[100px]">
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                    </Button>
                </form>
                {hasSearched && (
                    <div className="text-sm text-slate-500 text-center sm:text-left">
                        {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                    </div>
                )}
            </div>

            {/* Tabla con scroll horizontal */}
            {hasSearched && (
                <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="w-full overflow-x-auto">
                        <Table className="min-w-[700px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                                    <TableHead className="h-11 px-4 lg:px-6 w-16">#</TableHead>
                                    <TableHead className="h-11 px-4 font-semibold text-slate-700 min-w-[150px]">Nombre</TableHead>
                                    <TableHead className="h-11 px-4 font-semibold text-slate-700 min-w-[200px]">Correo Electrónico</TableHead>
                                    <TableHead className="h-11 px-4 font-semibold text-slate-700 w-32">Autenticación</TableHead>
                                    <TableHead className="h-11 px-4 lg:px-6 text-right font-semibold text-slate-700 w-24">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((user) => (
                                    <CustomerRowDesktop key={user.id} user={user} />
                                ))}
                                
                                {results.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <User className="w-10 h-10 mb-2 opacity-20" />
                                                <p className="text-sm font-medium">No se encontraron clientes</p>
                                                <p className="text-xs mt-1">Intenta con otro término</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- FILA DE CLIENTE DESKTOP ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomerRowDesktop({ user }: { user: any }) {
    const isGoogle = user.accounts?.some((acc: any) => acc.provider === 'google');
    
    const [editOpen, setEditOpen] = useState(false);
    const [passOpen, setPassOpen] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [newEmail, setNewEmail] = useState(user.email);
    const [newPass, setNewPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        setLoading(true);
        const res = await updateCustomerProfile(user.id, { name: newName, email: newEmail });
        if (res.ok) {
            toast.success("Perfil actualizado");
            setEditOpen(false);
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleResetPass = async () => {
        if (!newPass) return;
        setLoading(true);
        const res = await adminResetPassword(user.id, newPass);
        if (res.ok) {
            toast.success("Contraseña restablecida");
            setPassOpen(false);
            setNewPass('');
        } else {
            toast.error("Error al cambiar contraseña");
        }
        setLoading(false);
    };

    return (
        <>
            <TableRow className="[&_::selection]:bg-slate-200 [&_::selection]:text-slate-900 border-b border-slate-100 hover:bg-slate-50/50">
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
                <TableCell className="py-3 px-4 text-slate-600">{isGoogle ? "Google" : "Email"}</TableCell>
                <TableCell className="py-3 px-4 lg:px-6 text-right">
                    <div className="flex justify-end gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditOpen(true)}
                            title="Editar cliente"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setPassOpen(true)}
                            title="Restablecer contraseña"
                            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Diálogos */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input 
                                value={newEmail} 
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateProfile} disabled={loading} className="bg-slate-900 hover:bg-slate-800">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={passOpen} onOpenChange={setPassOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <Shield className="h-5 w-5" /> Restablecer Contraseña
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-600">
                            Cambiarás la contraseña de <strong>{user.name}</strong>.
                        </p>
                        {isGoogle && (
                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                <strong>Nota:</strong> Este usuario usa Google. La nueva contraseña le permitirá entrar también con email.
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Nueva Contraseña</Label>
                            <Input 
                                type="password"
                                value={newPass} 
                                onChange={(e) => setNewPass(e.target.value)} 
                                placeholder="Ingresa nueva contraseña"
                                className="focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPassOpen(false)}>Cancelar</Button>
                        <Button onClick={handleResetPass} disabled={loading || !newPass} className="bg-amber-600 hover:bg-amber-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// --- CARD DE CLIENTE MOBILE ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomerRowMobile({ user }: { user: any }) {
    const isGoogle = user.accounts?.some((acc: any) => acc.provider === 'google');
    
    const [editOpen, setEditOpen] = useState(false);
    const [passOpen, setPassOpen] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [newEmail, setNewEmail] = useState(user.email);
    const [newPass, setNewPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        setLoading(true);
        const res = await updateCustomerProfile(user.id, { name: newName, email: newEmail });
        if (res.ok) {
            toast.success("Perfil actualizado");
            setEditOpen(false);
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleResetPass = async () => {
        if (!newPass) return;
        setLoading(true);
        const res = await adminResetPassword(user.id, newPass);
        if (res.ok) {
            toast.success("Contraseña restablecida");
            setPassOpen(false);
            setNewPass('');
        } else {
            toast.error("Error al cambiar contraseña");
        }
        setLoading(false);
    };

    return (
        <>
            <div className="p-4 hover:bg-slate-50/50 [&_::selection]:bg-slate-200 [&_::selection]:text-slate-900">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-slate-900 truncate">{user.name}</h3>
                                <p className="text-sm text-slate-600 truncate mt-0.5">{user.email}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setEditOpen(true)}
                                    title="Editar cliente"
                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setPassOpen(true)}
                                    title="Restablecer contraseña"
                                    className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                                >
                                    <KeyRound className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500">
                                {isGoogle ? "Google" : "Email"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diálogos */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input 
                                value={newEmail} 
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateProfile} disabled={loading} className="bg-slate-900 hover:bg-slate-800">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={passOpen} onOpenChange={setPassOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <Shield className="h-5 w-5" /> Restablecer Contraseña
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-600">
                            Cambiarás la contraseña de <strong>{user.name}</strong>.
                        </p>
                        {isGoogle && (
                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                <strong>Nota:</strong> Este usuario usa Google. La nueva contraseña le permitirá entrar también con email.
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Nueva Contraseña</Label>
                            <Input 
                                type="password"
                                value={newPass} 
                                onChange={(e) => setNewPass(e.target.value)} 
                                placeholder="Ingresa nueva contraseña"
                                className="focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPassOpen(false)}>Cancelar</Button>
                        <Button onClick={handleResetPass} disabled={loading || !newPass} className="bg-amber-600 hover:bg-amber-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
