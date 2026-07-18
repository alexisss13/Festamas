import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopBanner } from "@/components/layout/TopBanner";
import { PopupModal } from "@/components/layout/PopupModal";
import { getActivePopup } from "@/actions/popups";

export default async function ShopLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const popup = await getActivePopup();
 return (
   <div className="flex flex-col min-h-screen bg-white">
     <TopBanner />
     <Navbar />
     <div className="flex-grow">
        {children}
     </div>
     <Footer />
     <PopupModal popup={popup} />
   </div>
 );
}
