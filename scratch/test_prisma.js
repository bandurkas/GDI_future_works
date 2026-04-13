const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing Lead retrieval...');
        const lead = await prisma.lead.findFirst();
        console.log('First lead:', lead);
        
        console.log('Testing Lead creation...');
        const newLead = await prisma.lead.create({
            data: {
                email: `test_${Date.now()}@test.com`,
                name: 'Test Lead',
                type: 'STUDENT',
                status: 'NEW',
                phone: '123456789',
                source: 'Test Script'
            }
        });
        console.log('Created lead:', newLead);
    } catch (err) {
        console.error('Prisma Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
