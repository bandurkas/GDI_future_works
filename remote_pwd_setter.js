require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  try {
    const email = 'bandurkas@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found!');
      return;
    }
    const pass = await bcrypt.hash('GDI!admin2026', 10);
    const updated = await prisma.user.update({
      where: { email },
      data: { passwordHash: pass }
    });
    console.log('SUCCESS: Hash updated for', updated.email);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
