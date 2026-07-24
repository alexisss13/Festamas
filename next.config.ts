import type { NextConfig } from "next";

// Report-Only por ahora, no bloqueante: esta tienda carga el widget de pago de
// Culqi (inyectado dinámicamente vía <script>, ver CartClient.tsx), Google
// Analytics y Meta Pixel (scripts inline con contenido dinámico) — sin poder
// disparar una transacción real de Culqi para confirmar en vivo que ningún
// origen falta, forzar el bloqueo desde el día uno arriesga tirar el checkout
// real. Revisar las violaciones reportadas (consola del navegador /
// report-uri si se configura uno) antes de pasar a `Content-Security-Policy`
// bloqueante.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.culqi.com https://www.googletagmanager.com https://connect.facebook.net https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com https://authjs.dev https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://checkout.culqi.com https://api.culqi.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "frame-src https://checkout.culqi.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy-Report-Only', value: CSP },
          // No hace nada por HTTP (los navegadores la ignoran fuera de HTTPS), pero
          // debe estar presente para que surta efecto en cuanto se sirva por HTTPS.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
