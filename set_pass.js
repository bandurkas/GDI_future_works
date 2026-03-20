require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function run() {
  try {
    const pass = await bcrypt.hash('GDI!admin2026', 10);
    const updated = await prisma.appUser.update({
      where: { email: 'bandurkas@gmail.com' },
      data: { password_hash: pass }
    });
    console.log('Successfully updated password for:', updated.email);
  } catch (e) {
    console.error('Error updating password:', e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
run();
