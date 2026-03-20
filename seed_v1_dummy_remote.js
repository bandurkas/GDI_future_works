const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Phase 9 Dummy CRM Data...');

    // 1. Grab foundational Owner and Course
    const owner = await prisma.appUser.findUnique({ where: { email: 'admin@gdifuture.works' } });
    if (!owner) throw new Error("Owner not found. Run seed_v1 first.");
    
    const courseDA = await prisma.course.findUnique({ where: { id: 'data-analytics' } });
    const courseAI = await prisma.course.findUnique({ where: { id: 'ai-engineering' } });

    // 2. Create Cohorts
    const cohortMay = await prisma.cohort.create({
        data: {
            course_id: courseDA.id,
            name: "May 2026 Bootcamp",
            start_date: new Date('2026-05-01'),
            end_date: new Date('2026-05-30'),
            status: 'active',
            meeting_url: 'https://zoom.us/gdi-example-1',
        }
    });

    const cohortJune = await prisma.cohort.create({
        data: {
            course_id: courseAI.id,
            name: "June 2026 Bootcamp",
            start_date: new Date('2026-06-05'),
            end_date: new Date('2026-07-05'),
            status: 'upcoming',
        }
    });

    // 3. Create Clients
    const clientSarah = await prisma.client.upsert({
        where: { email: "sarah.j@example.com" },
        update: {},
        create: {
            full_name: "Sarah Jenkins",
            email: "sarah.j@example.com",
            phone_whatsapp: "+6281234567890",
            city: "Jakarta",
            source: "instagram",
        }
    });

    const clientBudi = await prisma.client.upsert({
        where: { email: "budi@example.com" },
        update: {},
        create: {
            full_name: "Budi Santoso",
            email: "budi@example.com",
            phone_whatsapp: "+628111222333",
            city: "Bandung",
            source: "website",
        }
    });

    // 4. Create Enrollments and Ledger
    // Sarah - PAID Data Analytics
    let enrSarah = await prisma.enrollment.findFirst({ where: { client_id: clientSarah.id, cohort_id: cohortMay.id }});
    if(!enrSarah) {
        enrSarah = await prisma.enrollment.create({
            data: {
                client_id: clientSarah.id,
                cohort_id: cohortMay.id,
                enrolled_by_id: owner.id,
                price_agreed: courseDA.default_price,
                payment_status: 'paid',
                total_paid: courseDA.default_price,
            }
        });

        await prisma.payment.create({
            data: {
                enrollment_id: enrSarah.id,
                amount: courseDA.default_price,
                method: 'transfer',
                paid_at: new Date('2026-04-15'),
                recorded_by_id: owner.id,
                notes: "Manual BCA Transfer",
            }
        });
    }

    // Budi - UNPAID AI Engineering
    let enrBudi = await prisma.enrollment.findFirst({ where: { client_id: clientBudi.id, cohort_id: cohortJune.id }});
    if(!enrBudi) {
        await prisma.enrollment.create({
            data: {
                client_id: clientBudi.id,
                cohort_id: cohortJune.id,
                enrolled_by_id: owner.id,
                price_agreed: courseAI.default_price,
                payment_status: 'unpaid',
            }
        });
    }

    // 5. Add a Note to Sarah
    await prisma.note.create({
        data: {
            client_id: clientSarah.id,
            author_id: owner.id,
            content: "Sarah is highly motivated, interested in advanced machine learning after this basics course."
        }
    });

    console.log('Seeding Complete! Added Sarah and Budi to initial cohorts.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
