// Compartido entre settings.ts (edición) y storefront-config.ts (vista previa)
// para no duplicar el shape del JSON guardado en StoreConfig.draftConfig.

export type StoreConfigDraft = {
  whatsappPhone: string;
  welcomeMessage: string;
  localDeliveryPrice: number;
  templateKey: string;
  themeConfig: { primary: string; secondary: string; accent: string };
};

// Cookie que activa la vista previa del draft para un admin autenticado. Se
// revalida la sesión en cada lectura (no basta con que la cookie exista) para
// que perder el permiso o cerrar sesión apague la vista previa de inmediato.
export const STOREFRONT_PREVIEW_COOKIE = 'ecommerce_studio_preview';
