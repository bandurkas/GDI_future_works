const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.appUser.findMany();
  const clients = await prisma.client.findMany();
  const payments = await prisma.payment.findMany();
  console.log('AppUsers:', JSON.stringify(users, null, 2));
  console.log('Clients:', JSON.stringify(clients, null, 2));
  console.log('Payments:', JSON.stringify(payments, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
