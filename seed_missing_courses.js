const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    await prisma.course.upsert({ where: { id: '1' }, update: {}, create: { id: '1', name: 'Data Analytics Bootcamp', default_price: 3500000 }});
    await prisma.course.upsert({ where: { id: '2' }, update: {}, create: { id: '2', name: 'Python Programming', default_price: 3000000 }});
    await prisma.course.upsert({ where: { id: '3' }, update: {}, create: { id: '3', name: 'Graphic Design & AI', default_price: 2500000 }});
    await prisma.course.upsert({ where: { id: '4' }, update: {}, create: { id: '4', name: 'LLM & AI Engineering', default_price: 4500000 }});
    console.log('Static courses injected successfully!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
