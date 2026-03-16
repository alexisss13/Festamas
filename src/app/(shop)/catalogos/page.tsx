import { getCatalogs } from '@/actions/catalogs';
import CatalogosClient from './CatalogosClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogos Virtuales | Festamás',
  description: 'Explora nuestros catálogos interactivos con las mejores ofertas.',
};

export const revalidate = 60; // Revalida caché cada minuto

export default async function CatalogosPage() {
  // Pedimos los catálogos a la BD
  const response = await getCatalogs();
  const catalogs = response.success && response.data ? response.data : [];

  return <CatalogosClient catalogs={catalogs} />;
}