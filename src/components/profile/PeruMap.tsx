'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PeruMapProps {
  onSelectRegion: (regionName: string) => void;
  selectedRegion: string | null;
  brandColor: string;
}

// Mapeo de códigos de región a nombres completos
const REGION_NAMES: Record<string, string> = {
  'PEAMA': 'Amazonas',
  'PEANC': 'Áncash',
  'PEAPU': 'Apurímac',
  'PEARE': 'Arequipa',
  'PEAYA': 'Ayacucho',
  'PECAJ': 'Cajamarca',
  'PECAL': 'Callao',
  'PECUS': 'Cusco',
  'PEHUC': 'Huánuco',
  'PEHUV': 'Huancavelica',
  'PEICA': 'Ica',
  'PEJUN': 'Junín',
  'PELAL': 'La Libertad',
  'PELAM': 'Lambayeque',
  'PELIM': 'Lima Province',
  'PELMA': 'Lima',
  'PELOR': 'Loreto',
  'PEMDD': 'Madre de Dios',
  'PEMOQ': 'Moquegua',
  'PEPAS': 'Pasco',
  'PEPIU': 'Piura',
  'PEPUN': 'Puno',
  'PESAM': 'San Martín',
  'PETAC': 'Tacna',
  'PETUM': 'Tumbes',
  'PEUCA': 'Ucayali',
};

export function PeruMap({ onSelectRegion, selectedRegion, brandColor }: PeruMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<HTMLDivElement>(null);
  const selectedRegionRef = useRef<string | null>(selectedRegion);
  const brandColorRef = useRef<string>(brandColor);

  // Mantener refs actualizadas
  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
    brandColorRef.current = brandColor;
  }, [selectedRegion, brandColor]);

  const updatePathColor = useCallback((pathElement: SVGPathElement, regionName: string) => {
    if (selectedRegionRef.current === regionName) {
      pathElement.setAttribute('fill', brandColorRef.current);
    } else {
      pathElement.setAttribute('fill', '#E5E7EB');
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    fetch('/peru.svg')
      .then(res => res.text())
      .then(svgContent => {
        if (svgRef.current) {
          svgRef.current.innerHTML = svgContent;
          const svg = svgRef.current.querySelector('svg');
          
          if (svg) {
            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.display = 'block';
            svg.style.maxWidth = '100%';
            svg.style.maxHeight = '100%';
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            const paths = svg.querySelectorAll('path.sm_state');
            
            paths.forEach((path) => {
              const pathElement = path as SVGPathElement;
              const classList = pathElement.getAttribute('class') || '';
              const match = classList.match(/sm_state_([A-Z]+)/);
              const regionCode = match ? match[1] : '';
              const regionName = REGION_NAMES[regionCode] || regionCode;
              
              pathElement.setAttribute('cursor', 'pointer');
              pathElement.setAttribute('stroke', '#ffffff');
              pathElement.setAttribute('stroke-width', '2');
              pathElement.style.transition = 'all 0.2s ease';
              
              // Color inicial
              updatePathColor(pathElement, regionName);

              // Eventos
              pathElement.addEventListener('mouseenter', () => {
                setHoveredRegion(regionName);
                if (selectedRegionRef.current !== regionName) {
                  pathElement.setAttribute('fill', '#CBD5E1');
                  pathElement.style.filter = 'brightness(0.95)';
                } else {
                  pathElement.style.filter = 'brightness(1.1)';
                }
              });

              pathElement.addEventListener('mousemove', (e: MouseEvent) => {
                if (!svgRef.current) return;
                const rect = svgRef.current.getBoundingClientRect();
                setMousePosition({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              });

              pathElement.addEventListener('mouseleave', () => {
                setHoveredRegion(null);
                pathElement.style.filter = 'brightness(1)';
                // Restaurar color según si está seleccionado o no
                updatePathColor(pathElement, regionName);
              });

              pathElement.addEventListener('click', () => {
                onSelectRegion(regionName);
              });
            });
          }
        }
      })
      .catch(err => console.error('Error loading map:', err));
  }, [updatePathColor, onSelectRegion]);

  // Actualizar colores cuando cambia la selección
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;

    const paths = svg.querySelectorAll('path.sm_state');
    paths.forEach((path) => {
      const pathElement = path as SVGPathElement;
      const classList = pathElement.getAttribute('class') || '';
      const match = classList.match(/sm_state_([A-Z]+)/);
      const regionCode = match ? match[1] : '';
      const regionName = REGION_NAMES[regionCode] || regionCode;
      
      updatePathColor(pathElement, regionName);
    });
  }, [selectedRegion, brandColor, updatePathColor]);

  return (
    <div className="relative w-full">
      {/* Tooltip que sigue el cursor */}
      {hoveredRegion && (
        <div 
          className="absolute bg-white px-3 py-1.5 rounded-lg shadow-lg border border-slate-200 text-[13px] font-semibold text-slate-900 z-20 pointer-events-none whitespace-nowrap"
          style={{
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y - 10}px`,
            transform: 'translate(0, -100%)'
          }}
        >
          {hoveredRegion}
        </div>
      )}

      {/* Contenedor del SVG */}
      <div ref={svgRef} className="w-full h-[600px] md:h-[650px] bg-slate-50 rounded-lg p-4" />

      {/* Leyenda */}
      <div className="mt-4 flex items-center justify-center gap-6 text-[12px] text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-200 border-2 border-white shadow-sm" />
          <span className="font-medium">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border-2 border-white shadow-sm" style={{ backgroundColor: brandColor }} />
          <span className="font-medium">Seleccionado</span>
        </div>
      </div>
    </div>
  );
}
