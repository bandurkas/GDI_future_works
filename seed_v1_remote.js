const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Added crypto import

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding CRM Base Data...');
  try {
    const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? crypto.randomBytes(32).toString('hex');
    const ownerPassword = await bcrypt.hash(adminPassword, 10);

    const owner = await prisma.user.upsert({
        where: { email: 'admin@gdifuture.works' },
        update: {},
        create: {
            name: 'GDI Admin',
            email: 'admin@gdifuture.works',
            passwordHash: ownerPassword,
            role: 'Owner',
        },
    });

    console.log(`Created Owner: ${owner.email}`);

    // Super Admin Seed: Nane Guru (bandurkas@gmail.com)
    const superAdmin = await prisma.user.upsert({
        where: { email: 'bandurkas@gmail.com' },
        update: { role: 'Owner', isActive: true },
        create: {
            name: 'Sergei Bandurka',
            email: 'bandurkas@gmail.com',
            role: 'Owner',
            isActive: true
        }
    });

    console.log(`Ensured Owner Role for: ${superAdmin.email}`);

    // 2. Create foundational Courses based on V1.1 specs
    const dataAnalytics = await prisma.course.upsert({
        where: { id: 'data-analytics' },
        update: {},
        create: {
            id: 'data-analytics',
            name: 'Data Analytics Bootcamp',
            default_price: 3500000,
        }
    });

    const aiEngineering = await prisma.course.upsert({
        where: { id: 'ai-engineering' },
        update: {},
        create: {
            id: 'ai-engineering',
            name: 'AI Engineering Program',
            default_price: 4000000,
        }
    });

    console.log('Created Courses.');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
