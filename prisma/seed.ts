
import { PrismaClient, ProgramCategory, CourseLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create a Default Tutor (if not exists)
  const user = await prisma.user.upsert({
    where: { email: 'admin@gdifutureworks.com' },
    update: {},
    create: {
      email: 'admin@gdifutureworks.com',
      name: 'GDI Admin',
      role: 'ADMIN',
    },
  });

  const tutorUser = await prisma.user.upsert({
    where: { email: 'instructor@gdifutureworks.com' },
    update: {},
    create: {
      email: 'instructor@gdifutureworks.com',
      name: 'Expert Instructor',
      role: 'TUTOR',
    },
  });

  const tutor = await prisma.tutor.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      status: 'APPROVED',
      expertise: ['Data', 'Python', 'AI'],
    },
  });

  // 2. Create Programs
  const programs = [
    { title: 'Data Analytics', slug: 'data-analytics', category: ProgramCategory.DATA },
    { title: 'Python Programming', slug: 'python-programming', category: ProgramCategory.CODING },
    { title: 'Graphic Design & AI', slug: 'graphic-design-ai', category: ProgramCategory.AI },
    { title: 'LLM & AI Engineering', slug: 'llm-ai-engineering', category: ProgramCategory.AI },
  ];

  for (const p of programs) {
    await prisma.program.upsert({
      where: { slug: p.slug },
      update: { title: p.title, category: p.category },
      create: p,
    });
  }

  const dbPrograms = await prisma.program.findMany();

  // 3. Create Courses with Multi-Currency Prices
  const courseData = [
    {
      slug: 'data-analytics',
      title: 'Basic Data Analyst',
      level: CourseLevel.BEGINNER,
      prices: [
        { currency: 'IDR', amount: 400000 },
        { currency: 'MYR', amount: 93 },
      ]
    },
    {
      slug: 'python-programming',
      title: 'Python for Professionals',
      level: CourseLevel.BEGINNER,
      prices: [
        { currency: 'IDR', amount: 400000 },
        { currency: 'MYR', amount: 93 },
      ]
    },
    {
      slug: 'graphic-design-ai',
      title: 'Graphic Design with AI',
      level: CourseLevel.BEGINNER,
      prices: [
        { currency: 'IDR', amount: 400000 },
        { currency: 'MYR', amount: 93 },
      ]
    },
    {
      slug: 'llm-ai-engineering',
      title: 'LLM & AI Engineering',
      level: CourseLevel.ADVANCED,
      prices: [
        { currency: 'IDR', amount: 400000 },
        { currency: 'MYR', amount: 93 },
      ]
    }
  ];

  for (const c of courseData) {
    const program = dbPrograms.find(p => p.slug === c.slug);
    if (!program) continue;

    await prisma.course.upsert({
      where: { id: c.slug }, // Using slug as ID for simplicity in this seed, or use auto-generated
      update: {
          title: c.title,
          level: c.level,
      },
      create: {
        id: c.slug,
        title: c.title,
        level: c.level,
        durationWeeks: 4,
        programId: program.id,
        tutorId: tutor.id,
        prices: {
          create: c.prices
        }
      }
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
