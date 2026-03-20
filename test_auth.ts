import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function test() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@gdifuture.works' }
        });
        console.log("User:", user);
        
        if (user && user.passwordHash) {
            const isValid = await bcrypt.compare("testadminpassword", user.passwordHash);
            console.log("Password valid:", isValid);
        }
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
