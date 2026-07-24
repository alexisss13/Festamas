import { Metadata } from 'next';

// page.tsx de esta ruta es un Client Component ('use client'), así que no
// puede exportar `metadata` directamente — se declara en este layout, que sí
// puede ser un Server Component aunque envuelva contenido cliente.
export const metadata: Metadata = {
  title: 'Mis pedidos',
  description: 'Historial de tus pedidos y devoluciones.',
  robots: { index: false, follow: false },
};

export default function ProfileOrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
