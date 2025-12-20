'use client';

import { useState } from 'react';
import { Search, Loader2, KeyRound, Save, Mail, User, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { searchCustomers, adminResetPassword, updateCustomerProfile } from '@/actions/admin-users';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Division } from '@prisma/client';

export function CustomerFinder({ division }: { division: Division }) {
    const [query, setQuery] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // 👈 Nuevo estado para controlar el mensaje

    const isFestamas = division === 'JUGUETERIA';
    const brandButton = isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.length < 3) {
            toast.error("Ingresa al menos 3 letras para buscar");
            return;
        }
        setSearching(true);
        setHasSearched(false); // Reseteamos antes de buscar
        
        const { users } = await searchCustomers(query);
        
        setResults(users || []);
        setSearching(false);
        setHasSearched(true); // ¡Ahora sí ya buscamos!
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
    };

    return (
        <div className="space-y-6">
            {/* BARRA DE BÚSQUEDA */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg relative">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar cliente por nombre o email..." 
                        className="pl-10 pr-10 bg-white" // Más padding a la derecha para la X
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            // Opcional: Si borra todo, limpiamos resultados automáticamente
                            if (e.target.value === '') handleClear();
                        }}
                    />
                    {/* BOTÓN LIMPIAR (X) */}
                    {query.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Limpiar búsqueda"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button type="submit" disabled={searching || query.length < 3} className={cn("text-white font-bold min-w-[100px]", brandButton)}>
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                </Button>
            </form>

            {/* RESULTADOS */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-300">
                {results.map((user) => (
                    <CustomerCard key={user.id} user={user} brandButton={brandButton} />
                ))}
                
                {/* MENSAJE DE NO ENCONTRADO: Solo si ya buscó, no está cargando y no hay resultados */}
                {hasSearched && !searching && results.length === 0 && (
                    <div className="col-span-full py-8 text-center bg-white rounded-lg border border-dashed border-slate-200">
                        <p className="text-slate-500 text-sm">
                            No se encontraron clientes que coincidan con <span className="font-bold text-slate-700">"{query}"</span>.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Verifica que el nombre o correo esté bien escrito.</p>
                        <Button variant="link" onClick={handleClear} className="mt-2 text-slate-500">
                            Limpiar búsqueda
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- TARJETA INDIVIDUAL DE CLIENTE (CON ACCIONES) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomerCard({ user, brandButton }: { user: any, brandButton: string }) {
    const isGoogle = user.accounts?.some((acc: any) => acc.provider === 'google');
    
    // Estados locales para edición
    const [editMode, setEditMode] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [newEmail, setNewEmail] = useState(user.email);
    const [newPass, setNewPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [passOpen, setPassOpen] = useState(false);

    const handleUpdateProfile = async () => {
        setLoading(true);
        const res = await updateCustomerProfile(user.id, { name: newName, email: newEmail });
        if (res.ok) {
            toast.success("Perfil actualizado");
            setEditMode(false);
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
            toast.success("Contraseña restablecida exitosamente");
            setPassOpen(false);
            setNewPass('');
        } else {
            toast.error("Error al cambiar contraseña");
        }
        setLoading(false);
    };

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-5 space-y-4">
                {/* HEADER INFO */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            {isGoogle ? (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px] px-1 border-blue-100 font-normal">Google</Badge>
                            ) : (
                                <Badge variant="outline" className="text-[10px] px-1 bg-slate-50 font-normal">Correo</Badge>
                            )}
                            <span className="text-slate-300">|</span>
                            ID: ...{user.id.slice(-4)}
                        </span>
                    </div>
                    {!editMode && (
                        <Button variant="ghost" size="sm" onClick={() => setEditMode(true)} className="h-7 text-xs hover:bg-slate-50">
                            <PencilIcon className="w-3 h-3 mr-1" /> Editar
                        </Button>
                    )}
                </div>

                {/* FORMULARIO DE EDICIÓN RÁPIDA */}
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nombre</Label>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-300" />
                            {editMode ? (
                                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8 text-sm" />
                            ) : (
                                <span className="text-sm text-slate-700">{user.name}</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email</Label>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-300" />
                            {editMode ? (
                                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-8 text-sm" />
                            ) : (
                                <span className="text-sm text-slate-700 truncate" title={user.email}>{user.email}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTONES ACCIONES */}
                <div className="pt-2 flex gap-2">
                    {editMode ? (
                        <>
                            <Button size="sm" onClick={handleUpdateProfile} disabled={loading} className={cn("w-full text-white h-8 text-xs", brandButton)}>
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-2" />} Guardar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditMode(false)} disabled={loading} className="h-8 text-xs">
                                Cancelar
                            </Button>
                        </>
                    ) : (
                        // DIALOG PARA RESET PASSWORD
                        <Dialog open={passOpen} onOpenChange={setPassOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 h-8 text-xs">
                                    <KeyRound className="w-3.5 h-3.5 mr-2" /> Restablecer Clave
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                                        <ShieldAlert className="h-5 w-5" /> Zona de Seguridad
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-2">
                                    <p className="text-sm text-slate-600">
                                        Estás a punto de cambiar la contraseña de <strong>{user.name}</strong>.
                                        <br/>
                                        El cliente perderá acceso inmediato hasta que use esta nueva clave.
                                    </p>
                                    
                                    {isGoogle && (
                                        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                            <strong>Nota:</strong> Este usuario usa Google. Cambiar la contraseña le permitirá entrar TAMBIÉN con correo y esta clave.
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Nueva Contraseña Temporal</Label>
                                        <Input 
                                            value={newPass} 
                                            onChange={(e) => setNewPass(e.target.value)} 
                                            placeholder="Ej: Festamas2025" 
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setPassOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleResetPass} disabled={loading || !newPass} className="bg-amber-600 hover:bg-amber-700 text-white">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar Cambio
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function PencilIcon({className}: {className?: string}) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
    )
}