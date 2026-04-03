import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCourseBySlug } from "@/data/courses";
import { parseAvailability } from "@/lib/parseAvailability";

const PERIOD_TIMES: Record<string, { time: string; timeEnd: string }> = {
  morning:   { time: "10:00", timeEnd: "12:00" },
  midday:    { time: "13:00", timeEnd: "15:00" },
  afternoon: { time: "14:00", timeEnd: "16:00" },
  evening:   { time: "19:00", timeEnd: "21:00" },
  night:     { time: "21:00", timeEnd: "23:00" },
  free:      { time: "09:00", timeEnd: "11:00" },
};

const DAY_NAMES  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course || !(course as any).tutorEmail) {
    return NextResponse.json({ slots: [] });
  }

  const tutorEmail = (course as any).tutorEmail as string;

  const app = await prisma.tutorApplication.findFirst({
    where: { email: tutorEmail },
    select: { availability: true, timezone: true },
  });

  if (!app?.availability) {
    return NextResponse.json({ slots: [] });
  }

  const byDay = parseAvailability(app.availability);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots: object[] = [];

  for (let week = 0; week < 8; week++) {
    for (let dayIdx = 0; dayIdx <= 6; dayIdx++) {
      const periods = byDay[dayIdx];
      if (!periods || periods.length === 0) continue;

      const base = new Date(today);
      const currentDay = base.getDay();
      let diff = dayIdx - currentDay;
      if (diff < 0) diff += 7;
      base.setDate(base.getDate() + diff + week * 7);

      if (base < today) continue;

      for (const period of periods) {
        const pt = PERIOD_TIMES[period] ?? PERIOD_TIMES.free;
        const dateStr = MONTH_NAMES[base.getMonth()] + " " + base.getDate();
        const dateId = base.getFullYear() + "-" + String(base.getMonth()+1).padStart(2,"0") + "-" + String(base.getDate()).padStart(2,"0");
        const id = dateId + "-" + period;
        slots.push({
          id,
          date: dateStr,
          dayOfWeek: DAY_NAMES[dayIdx],
          month: MONTH_NAMES[base.getMonth()],
          day: base.getDate(),
          time: pt.time,
          timeEnd: pt.timeEnd,
          seatsLeft: 10,
        });
      }
    }
  }

  slots.sort((a: any, b: any) => a.id.localeCompare(b.id));

  return NextResponse.json({ slots });
}
