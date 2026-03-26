const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({
      where: { id: 'data-analytics' },
      include: { prices: true }
  });
  console.log("Course found:", course ? course.title : "NULL");
  if(course) {
     console.log("Prices:", course.prices);
  }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
