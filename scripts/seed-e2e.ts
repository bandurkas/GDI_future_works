/**
 * Idempotent E2E test data seed.
 * Creates known users used by Playwright suites against staging.
 *
 * Safe to run repeatedly. Guarded — refuses to run on the production DB.
 *
 * Usage (on the VPS, from /var/www/gdi-staging):
 *   npx tsx scripts/seed-e2e.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'e2e-admin@test.gdi';
const STUDENT_EMAIL = 'e2e-student@test.gdi';
const PASSWORD = 'E2eTestPass!';

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl.includes('staging') && process.env.ALLOW_NONSTAGING_SEED !== '1') {
    throw new Error(`Refusing to seed non-staging DB: ${dbUrl}. Set ALLOW_NONSTAGING_SEED=1 to override.`);
  }

  const hash = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: hash, role: 'OWNER', isActive: true, name: 'E2E Admin' },
    create: {
      email: ADMIN_EMAIL,
      name: 'E2E Admin',
      passwordHash: hash,
      role: 'OWNER',
      isActive: true,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: STUDENT_EMAIL },
    update: { passwordHash: hash, role: 'STUDENT', isActive: true, name: 'E2E Student', phone: '+6281234567890' },
    create: {
      email: STUDENT_EMAIL,
      name: 'E2E Student',
      phone: '+6281234567890',
      passwordHash: hash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: { status: 'LEAD' },
    create: { userId: studentUser.id, status: 'LEAD', country: 'Indonesia' },
  });

  console.log('✅ E2E seed complete');
  console.log('   admin:   ', admin.email, '(OWNER)');
  console.log('   student: ', studentUser.email, '(STUDENT)');
  console.log('   password:', PASSWORD);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
