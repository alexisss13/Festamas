'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

type Popup = { id: string; imageUrl: string; link: string | null; showOnce: boolean };

export function PopupModal({ popup }: { popup: Popup | null }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!popup) return;
    const key = `festamas-popup-${popup.id}`;
    if (!popup.showOnce || !localStorage.getItem(key)) setVisible(true);
  }, [popup]);
  if (!popup || !visible) return null;
  const close = () => {
    if (popup.showOnce) localStorage.setItem(`festamas-popup-${popup.id}`, '1');
    setVisible(false);
  };
  const content = <Image src={popup.imageUrl} alt="Promoción" width={720} height={720} className="w-full h-auto object-contain" priority />;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
    <div className="relative max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
      <button onClick={close} aria-label="Cerrar promoción" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white"><X className="h-5 w-5" /></button>
      {popup.link ? <a href={popup.link} onClick={close}>{content}</a> : content}
    </div>
  </div>;
}
