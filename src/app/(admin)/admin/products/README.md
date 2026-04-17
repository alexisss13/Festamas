# Módulo de Productos - Admin

## Descripción

Este módulo permite a los administradores editar la información de **ecommerce** de los productos que fueron creados en el sistema POS. 

## Características

### ✅ Campos Editables (Solo E-commerce)
- **Descripción**: Texto descriptivo del producto para la tienda online
- **Tags**: Etiquetas para organizar y filtrar productos
- **Group Tag**: Etiqueta de grupo para secciones especiales (nuevo, destacado, oferta, etc.)
- **Disponibilidad**: Control de visibilidad en la tienda online

### 🔒 Campos de Solo Lectura (Datos del POS)
Los siguientes campos NO se pueden editar desde el admin, ya que son gestionados por el POS:
- Nombre del producto
- Categoría
- Proveedor
- SKU
- Código de barras
- Estado (activo/inactivo)
- Imágenes (hasta 5)
- Stock por sucursal
- Precio base
- Costo
- Precio mayorista
- Cantidad mínima mayorista
- Stock mínimo
- Variantes del producto

## Estructura de Archivos

```
src/
├── actions/
│   └── admin-products.ts          # Server actions para productos
├── app/(admin)/admin/products/
│   ├── page.tsx                   # Lista de productos
│   ├── [id]/page.tsx              # Edición de producto
│   └── README.md                  # Esta documentación
└── components/admin/
    ├── ProductsTable.tsx          # Tabla de productos
    └── ProductEditForm.tsx        # Formulario de edición
```

## Flujo de Trabajo

1. Los productos se crean en el sistema POS con todos sus datos básicos
2. Los productos se sincronizan automáticamente con la base de datos
3. En el admin, se pueden editar solo los campos de ecommerce
4. Los cambios se reflejan inmediatamente en la tienda online

## Uso

### Listar Productos
Navega a `/admin/products` para ver todos los productos disponibles.

### Editar Producto
1. Haz clic en "Editar" en cualquier producto de la lista
2. Modifica los campos editables (descripción, tags, etc.)
3. Haz clic en "Guardar Cambios"

### Buscar Productos
Usa la barra de búsqueda para filtrar por:
- Nombre del producto
- Categoría
- SKU
- Código de barras

## Notas Técnicas

- Los productos se obtienen con `active: true` para mostrar solo productos activos
- Las variantes se incluyen con su stock por sucursal
- Los cambios revalidan las rutas `/admin/products` y `/product/[slug]`
- Se requiere rol `ADMIN` para acceder a estas funcionalidades
