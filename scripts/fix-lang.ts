import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Translating records to English...');
  
  const updates = [
    {
      old: 'WA Indonesia CPM 9,795 — держится на уровне вчерашнего рекорда (9,692). Стабилизация — хороший знак.',
      new: "WA Indonesia CPM 9,795 — stable at yesterday's record level (9,692). Stabilization is a positive signal."
    },
    {
      old: 'Site CPM 32,095 — чуть выше вчерашнего (28,396). Пиксель только что заработал, нужно время — обычно 1-3 дня чтобы алгоритм перестроился.',
      new: "Site CPM 32,095 — slightly above yesterday's (28,396). Pixel newly activated; algorithm relearning requires 1-3 days."
    },
    {
      old: 'Malaysia CPM 44,077 — резко упал по сравнению с вчера (75,842)! День 2 уже -42%. Алгоритм учится.',
      new: "Malaysia CPM 44,077 — significant drop vs yesterday (75,842). Day 2: -42%. Algorithm learning phase active."
    }
  ];

  for (const up of updates) {
    await prisma.marketingPerformance.updateMany({
      where: { notes: { contains: up.old } },
      data: { notes: up.new }
    });
  }

  console.log('Done.');
}

main();
