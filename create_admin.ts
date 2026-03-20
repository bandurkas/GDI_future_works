import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@gdifuture.works';
    const password = 'testadminpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        { email: 'admin@gdifuture.works', name: 'GDI Admin' },
        { email: 'bandurkas@gmail.com', name: 'Nane Guru' }
    ];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                passwordHash: hashedPassword,
                role: 'ADMIN',
            },
            create: {
                email: u.email,
                name: u.name,
                passwordHash: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log(`Admin user created/updated: ${user.email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
