// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed para Festamas (Prioridad Juguetería)...')

  // 1. Limpiar base de datos
  await prisma.banner.deleteMany() // LIMPIAR BANNERS TAMBIÉN
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  
  console.log('🧹 Base de datos limpia')

  // 2. Crear Categorías
  const catLegos = await prisma.category.create({ data: { name: 'Bloques y Construcción', slug: 'bloques', division: 'JUGUETERIA' } })
  const catMunecas = await prisma.category.create({ data: { name: 'Muñecas y Accesorios', slug: 'munecas', division: 'JUGUETERIA' } })
  const catVehiculos = await prisma.category.create({ data: { name: 'Vehículos y Pistas', slug: 'vehiculos', division: 'JUGUETERIA' } })

  const catGlobos = await prisma.category.create({ data: { name: 'Globos y Helio', slug: 'globos', division: 'FIESTAS' } })
  const catDecoracion = await prisma.category.create({ data: { name: 'Decoración Temática', slug: 'decoracion', division: 'FIESTAS' } })

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
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/animals/kitten-playing.jpg'],
      division: 'JUGUETERIA' as const
    },
    {
        title: 'Muñeca Exploradora',
        description: 'Lista para la aventura.',
        slug: 'muneca-exploradora',
        price: 89.00,
        stock: 15,
        categoryId: catMunecas.id,
        images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg'],
        division: 'JUGUETERIA' as const
    },
    // === FIESTAS (FiestasYa) ===
    {
        title: 'Pack Globos Dorados',
        description: 'Brillo espejo intenso.',
        slug: 'pack-globos-cromados-dorados',
        price: 15.00,
        stock: 100,
        categoryId: catGlobos.id,
        images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/balloons.jpg'],
        division: 'FIESTAS' as const
    }
  ]

  for (const p of productos) {
    await prisma.product.create({ data: p })
  }

  // 4. CREAR BANNERS (NUEVO) 📸
  // Usamos imágenes de placeholder de Cloudinary demo
  const banners = [
    // Festamas Cintillo
    {
        title: 'Envío Gratis Festamas',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_60,w_1920/v1/samples/animals/kitten-playing.jpg',
        position: 'TOP_STRIP' as const,
        division: 'JUGUETERIA' as const,
        link: '#'
    },
    // Festamas Hero
    {
        title: 'Lego Star Wars Hero',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_550,w_1920/v1/samples/landscapes/nature-mountains.jpg',
        position: 'MAIN_HERO' as const,
        division: 'JUGUETERIA' as const,
        link: '/category/bloques'
    },
    // FiestasYa Cintillo
    {
        title: 'Oferta Globos',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_60,w_1920/v1/samples/balloons.jpg',
        position: 'TOP_STRIP' as const,
        division: 'FIESTAS' as const,
        link: '#'
    },
    // FiestasYa Hero
    {
        title: 'Decoración Boda Hero',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_550,w_1920/v1/samples/food/dessert.jpg',
        position: 'MAIN_HERO' as const,
        division: 'FIESTAS' as const,
        link: '/category/decoracion'
    }
  ]

  for (const b of banners) {
    await prisma.banner.create({ data: b })
  }

  console.log(`✅ Seed terminado. ${productos.length} productos y ${banners.length} banners insertados.`)

  // 5. Crear Admin
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