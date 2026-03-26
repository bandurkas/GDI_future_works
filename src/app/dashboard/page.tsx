import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courses, getCourseBySlug } from "@/data/courses";
import { ALL_ADMIN_ROLES } from "@/lib/roles";
import { fmt } from "@/lib/utils";
import DashboardView, { type PopularCourse, type Spot, type PurchaseRecord } from "./DashboardView";

interface SessionPayload {
  clientId: string;
  email: string;
  name: string;
  role: string;
}

async function getLegacySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gdi_session")?.value;
  if (!token) return null;
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not set");
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

const FEATURED_SLUGS = ['llm-ai-engineering', 'graphic-design-ai', 'python-programming'];

const MONTH_ORDER: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};


export default async function DashboardPage() {
  const [nextAuthSession, legacySession] = await Promise.all([auth(), getLegacySession()]);

  if (!nextAuthSession && !legacySession) {
    redirect("/login");
  }

  const name = nextAuthSession?.user?.name || legacySession?.name || "Student";
  const firstName = name.split(' ')[0];
  const avatarUrl = nextAuthSession?.user?.image ?? null;
  const email = nextAuthSession?.user?.email || legacySession?.email;

  // Fetch real role + userId from DB (legacy JWT hardcodes role: "student")
  let isAdmin = false;
  let purchases: PurchaseRecord[] = [];

  if (email) {
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    isAdmin = ALL_ADMIN_ROLES.includes(dbUser?.role ?? '');

    if (dbUser?.id) {
      const student = await prisma.student.findUnique({
        where: { userId: dbUser.id },
        select: {
          bookings: {
            where: { status: { not: 'CANCELLED' } },
            include: {
              session: { include: { course: { select: { title: true } } } },
              payments: {
                select: { status: true, amount: true, currency: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      purchases = (student?.bookings ?? []).map(b => {
        const pay = b.payments[0] ?? null;
        return {
          id: b.id,
          courseTitle: b.session?.course?.title ?? 'Unknown course',
          sessionDate: b.session?.startTime ? fmt(b.session.startTime) : null,
          paymentStatus: pay?.status ?? null,
          amount: pay?.amount != null ? Number(pay.amount) : null,
          currency: pay?.currency ?? null,
        };
      });
    }
  }

  // Popular courses (static)
  const popularCourses: PopularCourse[] = FEATURED_SLUGS
    .map(slug => getCourseBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => c != null)
    .map(c => ({
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      icon: c.icon,
      iconBg: c.iconBg,
      priceMYR: c.priceMYR,
      priceIDR: c.priceIDR,
      nextSession: c.nextSession,
      seatsLeft: c.seatsLeft,
    }));

  // Next available spots (static schedules, seatsLeft > 0, sorted by date, first 4)
  const allSpots: (Spot & { sortKey: number })[] = [];
  for (const c of courses) {
    for (const s of c.schedules) {
      if (s.seatsLeft > 0) {
        allSpots.push({
          courseSlug: c.slug,
          courseTitle: c.title,
          date: s.date,
          dayOfWeek: s.dayOfWeek,
          day: s.day,
          month: s.month,
          time: s.time,
          timeEnd: s.timeEnd,
          seatsLeft: s.seatsLeft,
          sortKey: (MONTH_ORDER[s.month] ?? 99) * 100 + s.day,
        });
      }
    }
  }
  allSpots.sort((a, b) => a.sortKey - b.sortKey);
  const spots: Spot[] = allSpots.slice(0, 4).map(({ sortKey: _sk, ...rest }) => rest);

  return (
    <DashboardView
      firstName={firstName}
      avatarUrl={avatarUrl}
      isAdmin={isAdmin}
      popularCourses={popularCourses}
      spots={spots}
      purchases={purchases}
    />
  );
}
