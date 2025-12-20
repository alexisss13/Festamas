import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">¡Pago Exitoso!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Gracias por tu compra. Estamos preparando tu pedido. 
        Te llegará un correo con los detalles pronto.
      </p>
      <Button asChild>
        <Link href="/profile">Ver mis pedidos</Link>
      </Button>
    </div>
  );
}