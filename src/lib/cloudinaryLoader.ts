/**
 * Cloudinary Loader para Next.js Image
 * 
 * Este loader permite que Next.js delegue la optimización a Cloudinary
 * en lugar de usar el servidor de Next.js (_next/image)
 * 
 * Transformaciones aplicadas:
 * - f_auto: Formato automático (WebP, AVIF según soporte del navegador)
 * - q_auto: Calidad automática inteligente
 * - w_${width}: Ancho responsive según el viewport
 */

interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ 
  src, 
  width, 
  quality 
}: CloudinaryLoaderProps): string {
  // Validar que src no esté vacío
  if (!src || src.trim() === '') {
    console.error('cloudinaryLoader: src is empty');
    return '';
  }

  // Eliminar slash inicial si fue agregado para validación de Next.js
  let cleanSrc = src;
  if (cleanSrc.startsWith('/') && !cleanSrc.startsWith('//')) {
    cleanSrc = cleanSrc.substring(1);
  }
  // Removemos extension temporalmente para chequear if es un ID puro
  const srcWithoutExt = cleanSrc.replace(/\.(jpeg|jpg|png|gif|webp|avif)$/i, '');

  if (cleanSrc.includes('res.cloudinary.com')) {
    const parts = cleanSrc.split('/upload/');
    if (parts.length > 1) {
      const pathAfterUpload = parts[1];
      const pathParts = pathAfterUpload.split('/');
      const withoutVersion = pathParts.filter((part: string) => !part.startsWith('v') || part.length < 10);
      cleanSrc = withoutVersion.join('/').split('.')[0];
    }
  } else if (
    cleanSrc.startsWith('http://') || 
    cleanSrc.startsWith('https://') || 
    cleanSrc.startsWith('images/') ||
    cleanSrc.startsWith('products/') ||
    cleanSrc.startsWith('logos/')
  ) {
    // Si no es Cloudinary, pero es un archivo local de /images, /products o una URL externa, 
    // la devolvemos completa y que la consuma directo.
    if (!cleanSrc.includes('res.cloudinary.com')) {
       const localUrl = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;
       // Añadimos parámetros w y q para silenciar el warning de Next.js (aunque el servidor estático los ignore)
       return `${localUrl}?w=${width}&q=${quality || 75}`;
    }
  } else {
    // Es posible que sea un ID de Cloudinary pasado en crudo, así que removemos la extensión si tiene
    cleanSrc = srcWithoutExt;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwunkgitl';
  
  // Construir URL con transformaciones
  const params = [
    'f_auto',
    quality ? `q_${quality}` : 'q_auto',
    `w_${width}`,
    'c_limit' // No hacer upscale de imágenes pequeñas
  ];

  // Devolvemos la URL limpia sin extensión forzada, permitiendo que f_auto 
  // decida el mejor formato basándose en los headers del navegador.
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(',')}/${cleanSrc}`;
}
