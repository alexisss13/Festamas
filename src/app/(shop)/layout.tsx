import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ShopLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
   <div className="flex flex-col min-h-screen bg-white">
     <Navbar />
     <div className="flex-grow">
        {children}
     </div>
     <Footer />
   </div>
 );
}