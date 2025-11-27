import { Navbar } from "@/components/layout/Navbar";

export default function ShopLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
   <main className="min-h-screen bg-slate-50">
     <Navbar />
     {children}
     {/* Aquí iría el <Footer /> más adelante */}
   </main>
 );
}