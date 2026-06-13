'use server';

// Las variantes se gestionan exclusivamente desde el ERP Zaiko.
// Este archivo conserva solo helpers de lectura.

export async function getVariantAttributeSuggestions() {
  return {
    success: true,
    suggestions: {
      color: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Rosa', 'Negro', 'Blanco', 'Morado', 'Naranja', 'Celeste'],
      talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      tamaño: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'],
      edad: ['0-3 meses', '3-6 meses', '6-12 meses', '1-2 años', '3-5 años', '6-8 años', '9-12 años'],
      material: ['Plástico', 'Tela', 'Madera', 'Metal', 'Goma', 'Peluche'],
      personaje: ['Mickey Mouse', 'Minnie', 'Frozen', 'Spider-Man', 'Princesas', 'Paw Patrol', 'Peppa Pig'],
    },
  };
}
