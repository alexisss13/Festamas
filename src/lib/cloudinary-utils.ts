/**
 * Utilidades para trabajar con Cloudinary
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwunkgitl';

/**
 * Extrae el public_id de una URL completa de Cloudinary
 * 
 * Ejemplo:
 * Input: "https://res.cloudinary.com/demo/image/upload/v1234/uploads/abc123.jpg"
 * Output: "uploads/abc123"
 */
export function extractPublicId(url: string): string {
  if (!url.includes('res.cloudinary.com')) {
    return url; // Ya es un public_id
  }

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return url;

    // Remover versión (v1234567) y extensión (.jpg)
    const pathParts = parts[1].split('/');
    const withoutVersion = pathParts.filter(part => !part.startsWith('v'));
    const publicId = withoutVersion.join('/').split('.')[0];

    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return url;
  }
}

/**
 * Construye una URL de Cloudinary con transformaciones
 */
interface BuildUrlOptions {
  publicId: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  gravity?: 'auto' | 'face' | 'center';
  quality?: number | 'auto';
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
}

export function buildCloudinaryUrl({
  publicId,
  width,
  height,
  crop = 'limit',
  gravity,
  quality = 'auto',
  format = 'auto'
}: BuildUrlOptions): string {
  
  const transformations: string[] = [];

  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);

  const transformString = transformations.join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Genera un blur placeholder para Next.js Image
 */
export function getBlurDataUrl(publicId: string): string {
  return buildCloudinaryUrl({
    publicId,
    width: 10,
    quality: 10,
    format: 'jpg'
  });
}

/**
 * Convierte URLs antiguas a public_ids
 * Útil para migrar datos existentes
 */
export function migrateUrlsToPublicIds(urls: string[]): string[] {
  return urls.map(url => extractPublicId(url));
}

/**
 * Valida si una string es un public_id válido de Cloudinary
 */
export function isValidPublicId(str: string): boolean {
  // Un public_id no debe contener http:// o https://
  if (str.includes('http://') || str.includes('https://')) {
    return false;
  }
  
  // Debe tener al menos un carácter
  if (str.length === 0) {
    return false;
  }

  return true;
}

/**
 * Obtiene las dimensiones recomendadas según el tipo de imagen
 */
export function getRecommendedDimensions(type: 'product' | 'banner' | 'mobile' | 'thumbnail') {
  const dimensions = {
    product: { width: 800, height: 800 },
    banner: { width: 1500, height: 450 },
    mobile: { width: 640, height: 680 },
    thumbnail: { width: 200, height: 200 }
  };

  return dimensions[type];
}
