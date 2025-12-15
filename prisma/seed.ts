// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed para Festamas (Prioridad Juguetería)...')

  // 1. Limpiar base de datos
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  
  console.log('🧹 Base de datos limpia')

  // 2. Crear Categorías
  
  // --- JUGUETERÍA (FESTAMAS - Principal) ---
  const catLegos = await prisma.category.create({
    data: { name: 'Bloques y Construcción', slug: 'bloques', division: 'JUGUETERIA' }
  })
  const catMunecas = await prisma.category.create({
    data: { name: 'Muñecas y Accesorios', slug: 'munecas', division: 'JUGUETERIA' }
  })
  const catVehiculos = await prisma.category.create({
    data: { name: 'Vehículos y Pistas', slug: 'vehiculos', division: 'JUGUETERIA' }
  })

  // --- FIESTAS (FIESTASYA - Secundaria) ---
  const catGlobos = await prisma.category.create({
    data: { name: 'Globos y Helio', slug: 'globos', division: 'FIESTAS' }
  })
  const catDecoracion = await prisma.category.create({
    data: { name: 'Decoración Temática', slug: 'decoracion', division: 'FIESTAS' }
  })

  console.log('📂 Categorías creadas')

  // 3. Crear Productos
  const productos = [
    // === JUGUETES (Festamas) ===
    {
      title: 'Castillo Medieval de Bloques (500 pzs)',
      description: 'Construye tu propio reino. Compatible con marcas líderes. Incluye dragón y caballeros.',
      slug: 'castillo-medieval-bloques',
      price: 129.90,
      stock: 20,
      categoryId: catLegos.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/animals/kitten-playing.jpg'], // Placeholder
      division: 'JUGUETERIA' as const
    },
    {
      title: 'Muñeca Exploradora con Mochila',
      description: 'Lista para la aventura. Incluye mapa, brújula y mascota.',
      slug: 'muneca-exploradora',
      price: 89.00,
      stock: 15,
      categoryId: catMunecas.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg'], // Placeholder
      division: 'JUGUETERIA' as const
    },
    {
      title: 'Auto de Carreras R/C Veloz',
      description: 'Control remoto de largo alcance, recargable por USB.',
      slug: 'auto-carreras-rc',
      price: 150.00,
      stock: 10,
      categoryId: catVehiculos.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/car-interior.jpg'], // Placeholder
      division: 'JUGUETERIA' as const
    },

    // === FIESTAS (FiestasYa) ===
    {
      title: 'Pack Globos Cromados Dorados (12un)',
      description: 'Brillo espejo intenso, látex de alta resistencia.',
      slug: 'pack-globos-cromados-dorados',
      price: 15.00,
      stock: 100,
      categoryId: catGlobos.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/balloons.jpg'],
      division: 'FIESTAS' as const
    },
    {
      title: 'Cortina Metálica Lluvia Azul',
      description: 'Fondo perfecto para fotos. 1x2 metros.',
      slug: 'cortina-metalica-azul',
      price: 10.00,
      stock: 50,
      categoryId: catDecoracion.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg'],
      division: 'FIESTAS' as const
    }
  ]

  for (const p of productos) {
    await prisma.product.create({ data: p })
  }

  console.log(`✅ Seed terminado. ${productos.length} productos insertados.`)

  // 4. Crear Admin
  const emailAdmin = 'admin@festamas.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: emailAdmin } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10); 
    await prisma.user.create({
      data: {
        name: 'Admin Festamas',
        email: emailAdmin,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('👤 Usuario Admin creado: admin@festamas.com / 123456');
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })