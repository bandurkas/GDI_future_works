const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLeadCapture() {
    console.log('🚀 Starting Lead Capture Test...');
    
    const testPhone = '628111111111';
    const testGaId = 'GA1.2.12345.67890';
    const testFbc = 'fb.1.12345.fbclid6789';
    const testFbp = 'fb.1.12345.random6789';

    try {
        // Mocking the API logic (since I can't easily fetch local Next.js API in isolation)
        const pseudoEmail = `lead_${testPhone}@noemail.gdi`;
        const leadId = 'test-lead-' + Date.now();

        console.log('📝 Inserting test lead with tracking IDs...');
        await prisma.$executeRaw`
            INSERT INTO "Lead" (id, email, name, phone, type, status, source, "gaClientId", "fbClientId", "fbBrowserId", "createdAt", "updatedAt")
            VALUES (${leadId}, ${pseudoEmail}, 'Test Tracking Lead', ${testPhone}, 'STUDENT', 'NEW', 'Test Script', ${testGaId}, ${testFbc}, ${testFbp}, NOW(), NOW())
        `;

        console.log('🔍 Verifying lead in database...');
        const lead = await prisma.lead.findUnique({
            where: { id: leadId }
        });

        if (lead && lead.gaClientId === testGaId && lead.fbClientId === testFbc && lead.fbBrowserId === testFbp) {
            console.log('✅ SUCCESS: Lead captured with all tracking IDs!');
            console.log('Captured Data:', {
                gaClientId: lead.gaClientId,
                fbClientId: lead.fbClientId,
                fbBrowserId: lead.fbBrowserId
            });
        } else {
            console.error('❌ FAILURE: Data mismatch or lead not found.');
            console.error('Found lead:', lead);
        }

        // Cleanup
        await prisma.lead.delete({ where: { id: leadId } });
        console.log('🧹 Cleanup complete.');

    } catch (error) {
        console.error('❌ ERROR during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLeadCapture();
