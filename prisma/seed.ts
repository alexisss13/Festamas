// prisma/seed.ts

import { PrismaClient, Division, Role, BannerPosition } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed para Festamas/FiestasYa...');

  // 1. LIMPIEZA TOTAL (En orden estricto para evitar errores de FK)
  // Borramos primero los hijos, luego los padres.
  console.log('🧹 Limpiando base de datos...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.address.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  
  // Productos y Categorías
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  
  // Configuración y CMS
  await prisma.storeConfig.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.homeSection.deleteMany();
  await prisma.coupon.deleteMany();

  // Usuarios al final
  await prisma.user.deleteMany();


  // 2. USUARIOS (ADMIN)
  console.log('👤 Creando usuarios...');
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
      image: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.png'
    },
  });

  // 3. STORE CONFIG (Configuración base)
  console.log('⚙️ Configurando tienda...');
  await prisma.storeConfig.create({
    data: {
      whatsappPhone: '51999999999',
      welcomeMessage: '¡Hola! Bienvenido a la familia Festamas.',
      localDeliveryPrice: 10.00,
      heroTitle: 'Celebra a lo Grande',
      heroSubtitle: 'Todo lo que necesitas para tu fiesta en un solo lugar',
      heroButtonText: 'Ver Catálogo',
      heroButtonLink: '/collections',
      heroBtnColor: '#fb3099'
    }
  });

  // 4. CATEGORÍAS (Usamos upsert para evitar duplicados si corres el seed varias veces)
  console.log('🗂️ Creando categorías...');
  
  // JUGUETERÍA
  const catJuguetes = await prisma.category.create({
    data: { 
      name: 'Figuras de Acción', 
      slug: 'figuras-accion', 
      division: Division.JUGUETERIA 
    }
  });
  
  const catMunecas = await prisma.category.create({
    data: { 
      name: 'Muñecas y Accesorios', 
      slug: 'munecas', 
      division: Division.JUGUETERIA 
    }
  });

  // FIESTAS
  const catGlobos = await prisma.category.create({
    data: { 
      name: 'Globos Látex', 
      slug: 'globos-latex', 
      division: Division.FIESTAS 
    }
  });

  const catDecoracion = await prisma.category.create({
    data: { 
      name: 'Decoración de Mesa', 
      slug: 'decoracion-mesa', 
      division: Division.FIESTAS 
    }
  });

  // 5. PRODUCTOS
  console.log('Creando productos...');

  // -- Juguetes --
  await prisma.product.create({
    data: {
      title: 'Barbie Edición Playa',
      slug: 'barbie-edicion-playa',
      description: 'Muñeca Barbie clásica con traje de baño y accesorios de verano.',
      price: 45.00,
      stock: 120,
      isAvailable: true,
      categoryId: catMunecas.id,
      division: Division.JUGUETERIA,
      images: ['/images/placeholder.jpg'], // Reemplazar con URL real de Cloudinary luego
      tags: ['barbie', 'verano', 'niñas'],
      barcode: '775000000001',
    }
  });

  await prisma.product.create({
    data: {
      title: 'Max Steel Turbo',
      slug: 'max-steel-turbo',
      description: 'Figura de acción articulada con modo turbo.',
      price: 59.90,
      stock: 40,
      isAvailable: true,
      categoryId: catJuguetes.id,
      division: Division.JUGUETERIA,
      images: ['/images/placeholder.jpg'],
      tags: ['accion', 'niños', 'héroes'],
      barcode: '775000000002',
    }
  });

  // -- Fiestas (Variantes de Color) --
  const groupTagGlobos = 'GLOBO-R12-FIESTA';
  
  await prisma.product.create({
    data: {
      title: 'Globo R12 Rojo Pasión',
      slug: 'globo-r12-rojo',
      description: 'Bolsa de 50 unidades de globos premium color rojo.',
      price: 12.50,
      stock: 500,
      categoryId: catGlobos.id,
      division: Division.FIESTAS,
      images: ['/images/placeholder.jpg'],
      color: '#FF0000',
      groupTag: groupTagGlobos, // Para agruparlos en el frontend
      tags: ['rojo', 'globos', 'básico'],
      barcode: '775000000003',
      wholesalePrice: 10.00, // Precio por mayor
      wholesaleMinCount: 12, // A partir de una docena
    }
  });

  await prisma.product.create({
    data: {
      title: 'Globo R12 Azul Rey',
      slug: 'globo-r12-azul',
      description: 'Bolsa de 50 unidades de globos premium color azul.',
      price: 12.50,
      stock: 300,
      categoryId: catGlobos.id,
      division: Division.FIESTAS,
      images: ['/images/placeholder.jpg'],
      color: '#0000FF',
      groupTag: groupTagGlobos,
      tags: ['azul', 'globos', 'básico'],
      barcode: '775000000004',
      wholesalePrice: 10.00,
      wholesaleMinCount: 12,
    }
  });

  // 6. BANNERS Y SECCIONES (CMS)
  console.log('🎨 Creando contenido visual (CMS)...');
  
  await prisma.banner.create({
    data: {
      title: 'Liquidación de Verano',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/banner-verano.jpg',
      position: BannerPosition.MAIN_HERO,
      division: Division.JUGUETERIA,
      active: true,
      order: 1
    }
  });

  await prisma.homeSection.create({
    data: {
      title: 'Lo Más Vendido',
      subtitle: 'Los favoritos de los peques',
      tag: 'mas-vendido', // Esto lo usarás para filtrar en el frontend
      division: Division.JUGUETERIA,
      icon: 'star',
      order: 1,
      isActive: true
    }
  });

  console.log('✅ Seed completado con éxito. ¡A programar!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });