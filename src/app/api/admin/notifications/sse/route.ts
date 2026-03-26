import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminRole } from '@/lib/auth-guards';
import { ALL_ADMIN_ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  const guard = requireAdminRole(session, ALL_ADMIN_ROLES);
  if (guard) return guard;

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendUpdate = async () => {
        const [pendingApps, newLeads] = await Promise.all([
          prisma.tutorApplication.count({ where: { status: 'PENDING' } }),
          prisma.lead.count({ where: { status: 'NEW' } }),
        ]);

        const data = JSON.stringify({ pendingApps, newLeads });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Send initial data
      await sendUpdate();

      // Poll every 10 seconds (for a simple implementation)
      // In a real production app, you might use Prisma middleware or a message queue
      const interval = setInterval(sendUpdate, 10000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers: responseHeaders });
}
