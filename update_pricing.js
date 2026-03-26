const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    await prisma.course.updateMany({
        where: { id: { in: ['1', '2', '3', '4'] } },
        data: { default_price: 400000 }
    });
    console.log('Database defaults updated to 400000 IDR');
}
main().catch(console.error).finally(() => prisma.$disconnect());
