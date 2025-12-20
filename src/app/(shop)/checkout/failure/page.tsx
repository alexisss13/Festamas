import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XCircle, ShoppingBag } from "lucide-react";

export default function FailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in">
      <XCircle className="h-20 w-20 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2 text-slate-900">Algo salió mal</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        No pudimos procesar tu pago. Puede que hayas cancelado la operación o que tu tarjeta haya sido rechazada. No se te ha cobrado nada.
      </p>
      
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/cart">
             Regresar al Carrito
          </Link>
        </Button>
        <Button asChild className="bg-slate-900 hover:bg-slate-800">
          <Link href="/">
            <ShoppingBag className="mr-2 h-4 w-4" /> Seguir Comprando
          </Link>
        </Button>
      </div>
    </div>
  );
}