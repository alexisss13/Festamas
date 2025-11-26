// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Limpiar base de datos (Orden específico por las relaciones)
  // Primero borramos items de ordenes, luego ordenes, productos y al final categorías
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  
  console.log('🧹 Base de datos limpia')

  // 2. Crear Categorías
  const catGlobos = await prisma.category.create({
    data: { name: 'Globos', slug: 'globos' }
  })
  const catVelas = await prisma.category.create({
    data: { name: 'Velas y Bengalas', slug: 'velas' }
  })
  const catDecoracion = await prisma.category.create({
    data: { name: 'Decoración Temática', slug: 'decoracion' }
  })

  console.log('📂 Categorías creadas')

  // 3. Crear Productos
  const productos = [
    {
      title: 'Globo Metálico Número Dorado (80cm)',
      description: 'Globo gigante ideal para cumpleaños. Color dorado brillante, autosellable.',
      slug: 'globo-numero-dorado-80cm',
      price: 15.00,
      stock: 50,
      categoryId: catGlobos.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/balloons.jpg'] // Placeholder temporal
    },
    {
      title: 'Pack de Globos Cromados Azul',
      description: 'Bolsa de 12 unidades, látex de alta calidad, brillo espejo.',
      slug: 'pack-globos-cromados-azul',
      price: 12.50,
      stock: 100,
      categoryId: catGlobos.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/balloons.jpg']
    },
    {
      title: 'Vela Mágica Chispera',
      description: 'Pack de 4 unidades. Llama fría, duración 45 segundos.',
      slug: 'vela-magica-chispera',
      price: 8.00,
      stock: 200,
      categoryId: catVelas.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/fireworks.jpg']
    },
    {
      title: 'Cortina Metálica Lluvia',
      description: 'Ideal para fondo de fotos. Medidas 1x2 metros.',
      slug: 'cortina-metalica-lluvia',
      price: 10.00,
      stock: 30,
      categoryId: catDecoracion.id,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg']
    }
  ]

  for (const p of productos) {
    await prisma.product.create({ data: p })
  }

  console.log(`✅ Seed terminado correctamente. Se crearon ${productos.length} productos.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })