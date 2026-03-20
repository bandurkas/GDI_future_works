import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.appUser.findMany();
    console.log('AppUsers in DB:');
    users.forEach(u => {
        console.log(`- ${u.email} (Role: ${u.role})`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
