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
            name: 'Nane Guru',
            email: 'bandurkas@gmail.com',
            role: 'Owner',
            isActive: true
        }
    });

    console.log(`Ensured Owner Role for: ${superAdmin.email}`);

    // 1. Create a foundational Program (IT Bootcamps)
    const program = await prisma.program.upsert({
        where: { slug: 'bootcamps' },
        update: {},
        create: {
            title: 'IT Bootcamps',
            slug: 'bootcamps',
            description: 'Intensive industry-ready training programs.',
            category: 'DATA',
        }
    });

    // 2. Create a default Tutor (linked to Owner for testing)
    const tutor = await prisma.tutor.upsert({
        where: { userId: owner.id },
        update: {},
        create: {
            userId: owner.id,
            bio: 'Head of Education at GDI.',
            expertise: ['Data & AI'],
            status: 'APPROVED',
        }
    });

    // 3. Create foundational Courses
    const dataAnalytics = await prisma.course.upsert({
        where: { id: 'data-analytics' },
        update: {},
        create: {
            id: 'data-analytics',
            programId: program.id,
            tutorId: tutor.id,
            title: 'Data Analytics Bootcamp',
            price: 3500000,
            durationWeeks: 4,
            level: 'BEGINNER',
            isPublished: true,
        }
    });

    const aiEngineering = await prisma.course.upsert({
        where: { id: 'ai-engineering' },
        update: {},
        create: {
            id: 'ai-engineering',
            programId: program.id,
            tutorId: tutor.id,
            title: 'AI Engineering Program',
            price: 4000000,
            durationWeeks: 6,
            level: 'INTERMEDIATE',
            isPublished: true,
        }
    });

    console.log('Created Programs, Tutors, and Courses.');
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
