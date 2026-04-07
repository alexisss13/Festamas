import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

// ==========================================
// 1. CARGA MANUAL DE VARIABLES DE ENTORNO
// ==========================================
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  console.log('📂 Leyendo archivo .env...');
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  
  envConfig.split('\n').forEach((line) => {
    if (!line || line.startsWith('#')) return;
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ ERROR: DATABASE_URL no se cargó. Verifica tu .env');
  process.exit(1);
}

// ==========================================
// 2. INICIALIZACIÓN DE PRISMA
// ==========================================
const prisma = new PrismaClient(); 

async function main() {
  console.log('🌱 Iniciando seed...');

  // ==========================================
  // 3. CREACIÓN DE CUENTA DE SOFTWARE TI
  // ==========================================
  console.log('👤 Verificando/Creando usuario Software TI (SUPER_ADMIN)...');
  const superAdminPassword = await hash('ti12345', 10);
  
  // Usamos upsert para que sea idempotente (se puede ejecutar varias veces sin romper)
  await prisma.user.upsert({
    where: { email: 'ti@pos.com' },
    update: {
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
    create: {
      name: 'Software TI',
      email: 'ti@pos.com',
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
      isActive: true
    }
  });

  console.log('✅ Usuario Software TI creado/actualizado');
  console.log('------------------------------------------------');

  // ==========================================
  // 4. CREACIÓN DE UNIDADES DE MEDIDA (UOM)
  // ==========================================
  console.log('📦 Creando unidades de medida...');
  
  const uoms = [
    { name: 'Unidad', abbreviation: 'UND' },
    { name: 'Caja', abbreviation: 'CJ' },
    { name: 'Paquete', abbreviation: 'PQ' },
    { name: 'Docena', abbreviation: 'DOC' },
    { name: 'Kilogramo', abbreviation: 'KG' },
    { name: 'Gramo', abbreviation: 'GR' },
    { name: 'Litro', abbreviation: 'LT' },
    { name: 'Mililitro', abbreviation: 'ML' },
    { name: 'Metro', abbreviation: 'MT' },
    { name: 'Centímetro', abbreviation: 'CM' },
  ];

  for (const uom of uoms) {
    const existing = await prisma.unitOfMeasure.findFirst({
      where: { abbreviation: uom.abbreviation }
    });
    
    if (!existing) {
      await prisma.unitOfMeasure.create({
        data: uom
      });
    }
  }

  console.log(`✅ ${uoms.length} unidades de medida verificadas/creadas`);
  console.log('------------------------------------------------');
  console.log('✅ SEED COMPLETADO EXITOSAMENTE 🚀');
  console.log('\n--- Cuenta de Acceso Maestra ---');
  console.log(`👨‍💻 Software TI   : ti@pos.com / ti12345`);
  console.log(`🔑 Rol           : SUPER_ADMIN`);
  console.log('------------------------------------------------');
}

main()
  .catch(e => {
    console.error('❌ Error fatal en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });