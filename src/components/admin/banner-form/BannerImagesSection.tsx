'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';
import { BannerPosition } from '@prisma/client';
import { cn } from '@/lib/utils';

interface BannerImagesSectionProps {
  imageUrl: string;
  mobileUrl: string;
  position: BannerPosition;
  loading: boolean;
  onImageUrlChange: (value: string) => void;
  onMobileUrlChange: (value: string) => void;
}

export function BannerImagesSection({
  imageUrl,
  mobileUrl,
  position,
  loading,
  onImageUrlChange,
  onMobileUrlChange
}: BannerImagesSectionProps) {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-slate-800 text-sm">Recursos Visuales</h2>
        </div>
        <div className="flex items-center gap-2">
          {imageUrl && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
          {mobileUrl && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
        </div>
      </div>
      
      <div className="p-5">
        
        {/* Tabs minimalistas */}
        <div className="flex items-center gap-6 mb-5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              activeTab === 'desktop'
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Desktop
            {!imageUrl && <span className="ml-1.5 text-red-500">*</span>}
            {activeTab === 'desktop' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              activeTab === 'mobile'
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Mobile
            {activeTab === 'mobile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'desktop' ? (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              {position === 'TOP_BAR' 
                ? 'Imagen para barra superior (30-60px de altura)' 
                : 'Imagen principal del banner'}
            </p>
            <ImageUpload 
              value={imageUrl ? [imageUrl] : []}
              onChange={(urls) => onImageUrlChange(urls[0] || '')}
              disabled={loading}
              maxFiles={1} 
              sizing={position === 'TOP_BAR' ? 'topbar-desktop' : 'banner'} 
            />
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Versión optimizada para dispositivos móviles (opcional)
            </p>
            <ImageUpload 
              value={mobileUrl ? [mobileUrl] : []}
              disabled={loading}
              onChange={(url) => onMobileUrlChange(url[0] || '')}
              maxFiles={1}
              sizing={position === 'TOP_BAR' ? 'topbar-mobile' : 'mobile'}
            />
          </div>
        )}
        
      </div>
    </div>
  );
}
