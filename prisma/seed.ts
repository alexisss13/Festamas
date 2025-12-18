import { PrismaClient, Division, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed...');

  // 1. Limpiar datos existentes (opcional, cuidado en prod)
  // await prisma.orderItem.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.category.deleteMany();
  // await prisma.user.deleteMany();

  // 2. Crear Usuario ADMIN
  const passwordHash = await hash('123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@festamas.com' },
    update: {},
    create: {
      name: 'Admin Festamas',
      email: 'admin@festamas.com',
      password: passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log('👤 Admin creado:', admin.email);

  // 3. Configuración Inicial de Tienda
  await prisma.storeConfig.create({
    data: {
      whatsappPhone: '51999999999',
      welcomeMessage: 'Hola, quiero hacer un pedido.',
      heroTitle: '¡Bienvenido a Festamas!',
      heroSubtitle: 'La mejor juguetería del Perú',
    }
  });

  // 4. Categorías JUGUETERÍA
  const catJuguetes = await prisma.category.create({
    data: { name: 'Juguetes de Acción', slug: 'juguetes-accion', division: Division.JUGUETERIA }
  });
  
  const catMunecas = await prisma.category.create({
    data: { name: 'Muñecas y Accesorios', slug: 'munecas', division: Division.JUGUETERIA }
  });

  // 5. Categorías FIESTAS
  const catGlobos = await prisma.category.create({
    data: { name: 'Globos y Decoración', slug: 'globos', division: Division.FIESTAS }
  });

  // 6. Productos JUGUETERÍA
  await prisma.product.create({
    data: {
      title: 'Muñeca Barbie Playa',
      slug: 'muneca-barbie-playa',
      description: 'Muñeca Barbie lista para el verano con traje de baño.',
      price: 45.00,
      stock: 100,
      categoryId: catMunecas.id,
      division: Division.JUGUETERIA,
      images: ['/images/placeholder.jpg'],
      barcode: '775000000001', // EAN Ficticio
      tags: ['barbie', 'verano', 'niña'],
    }
  });

  await prisma.product.create({
    data: {
      title: 'Max Steel Figura Acción',
      slug: 'max-steel-accion',
      description: 'Figura articulada de Max Steel.',
      price: 55.00,
      stock: 50,
      categoryId: catJuguetes.id,
      division: Division.JUGUETERIA,
      images: ['/images/placeholder.jpg'],
      barcode: '775000000002',
      tags: ['accion', 'niño', 'max steel'],
    }
  });

  // 7. Productos FIESTAS (Con Variantes de Color)
  const groupTagGlobos = 'GLOBO-R12';
  
  await prisma.product.create({
    data: {
      title: 'Globo R12 Rojo',
      slug: 'globo-r12-rojo',
      description: 'Paquete de 50 globos rojos.',
      price: 12.00,
      stock: 200,
      categoryId: catGlobos.id,
      division: Division.FIESTAS,
      images: ['/images/placeholder.jpg'],
      color: '#FF0000',
      groupTag: groupTagGlobos,
      barcode: '775000000003',
      tags: ['fiesta', 'decoracion', 'rojo'],
    }
  });

  await prisma.product.create({
    data: {
      title: 'Globo R12 Azul',
      slug: 'globo-r12-azul',
      description: 'Paquete de 50 globos azules.',
      price: 12.00,
      stock: 200,
      categoryId: catGlobos.id,
      division: Division.FIESTAS,
      images: ['/images/placeholder.jpg'],
      color: '#0000FF',
      groupTag: groupTagGlobos,
      barcode: '775000000004',
      tags: ['fiesta', 'decoracion', 'azul'],
    }
  });

  console.log('✅ Seed completado con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });