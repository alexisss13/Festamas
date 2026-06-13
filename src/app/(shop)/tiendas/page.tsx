import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoreBranches } from '@/actions/stores';

const DAY_LABELS: Record<string, string> = {
  lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb', dom: 'Dom',
};

function formatBusinessHours(hours: Record<string, string> | null | undefined): string {
  if (!hours) return 'Consultar horarios';
  const entries = Object.entries(hours);
  if (entries.length === 0) return 'Consultar horarios';

  // Group consecutive days with same hours
  const grouped: string[] = [];
  let i = 0;
  const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  const present = days.filter(d => hours[d]);

  if (present.length === 0) return 'Consultar horarios';

  // Build a readable string
  return present
    .map(d => `${DAY_LABELS[d] ?? d}: ${hours[d]}`)
    .join(' | ');
}

// Instagram reels embeds
const REELS = [
  'https://www.instagram.com/reel/DQotA_Cjsj1/embed',
  'https://www.instagram.com/reel/DRJOJUGjBI4/embed',
];

export default async function TiendasPage() {
  const branches = await getStoreBranches();

  return (
    <main className="min-h-screen bg-white pb-10">
      {/* BREADCRUMB */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <a href="/" className="hover:text-slate-700">Inicio</a>
            <span>/</span>
            <span className="text-slate-900 font-medium">Tiendas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Nuestras Tiendas</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-10 xl:px-12 py-6 md:py-8 space-y-12 md:space-y-16">

        {/* Tiendas físicas */}
        <section className="animate-in fade-in duration-700">
          <p className="text-[12px] md:text-[14px] text-slate-500 mb-6 px-2">
            Encuentra nuestra ubicación más cercana y ven a visitarnos.
          </p>

          {branches.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium">No hay tiendas disponibles por el momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
              {branches.map(store => {
                const mapQuery = store.address ? encodeURIComponent(store.address) : '';
                const mapEmbedUrl = mapQuery
                  ? `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`
                  : null;
                const phone = store.phone?.replace(/\D/g, '') ?? '';
                const whatsappLink = phone ? `https://wa.me/51${phone}` : null;
                const mapsLink = mapQuery
                  ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
                  : null;

                return (
                  <div
                    key={store.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Mapa */}
                    {mapEmbedUrl ? (
                      <div className="relative h-[280px] w-full bg-slate-50 overflow-hidden">
                        <iframe
                          src={mapEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={false}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="absolute inset-0 w-full h-full"
                          title={`Mapa de ${store.name}`}
                        />
                      </div>
                    ) : (
                      <div className="h-[120px] bg-slate-50 flex items-center justify-center">
                        <MapPin className="h-10 w-10 text-slate-200" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-4 md:p-6">
                      <h3 className="font-medium text-[16px] md:text-[18px] leading-tight text-[#333] tracking-tight mb-4">
                        {store.name}
                      </h3>

                      <div className="flex flex-col gap-3 mb-4">
                        {store.address && (
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                            <span className="text-[13px] md:text-[14px] leading-tight text-slate-600">
                              {store.address}
                            </span>
                          </div>
                        )}

                        {store.businessHours && (
                          <div className="flex items-start gap-2.5">
                            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                            <div className="flex flex-col gap-0.5">
                              {formatBusinessHours(store.businessHours).split(' | ').map((line, i) => (
                                <span key={i} className={cn(
                                  'leading-tight text-slate-600',
                                  i === 0 ? 'text-[13px] md:text-[14px]' : 'text-[12px] md:text-[13px] text-slate-500'
                                )}>
                                  {line}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {store.phone && (
                          <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 shrink-0 text-primary" />
                            {whatsappLink ? (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[13px] md:text-[14px] leading-tight text-slate-600 hover:text-slate-900 transition-colors"
                              >
                                {store.phone}
                              </a>
                            ) : (
                              <span className="text-[13px] md:text-[14px] leading-tight text-slate-600">
                                {store.phone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {mapsLink && (
                        <a
                          href={mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-primary text-white hover:opacity-90 transition-all h-9 md:h-10 px-6 font-medium text-[13px] rounded-xl shadow-sm"
                        >
                          <Navigation className="w-4 h-4" />
                          Cómo llegar
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Instagram Reels */}
        <section className="animate-in fade-in duration-700 delay-150">
          <div className="flex items-end justify-between mb-4 px-2">
            <div className="flex flex-col">
              <h2 className="font-medium text-[16px] md:text-[24px] leading-tight text-[#333] tracking-tight">
                Conoce nuestras tiendas
              </h2>
              <p className="text-[12px] md:text-[14px] text-slate-500 mt-0.5 md:mt-1 leading-tight">
                Un recorrido visual por nuestras instalaciones.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            {REELS.map((reelUrl, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden aspect-[9/16] relative w-full max-w-[350px] mx-auto sm:mx-0 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <iframe
                  src={reelUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  title={`Instagram Reel ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
