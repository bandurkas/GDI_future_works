import { prisma } from './src/lib/prisma.js'; // Need to adjust path depending on where I run this

async function test() {
    try {
        const lead = await prisma.lead.findFirst({
            where: { source: 'Interest Form' },
            orderBy: { createdAt: 'desc' }
        });
        console.log('Latest interest lead:', lead);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
