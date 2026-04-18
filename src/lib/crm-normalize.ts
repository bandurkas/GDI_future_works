export type KanbanStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ARCHIVED';

export interface ActivityComment {
  id: string;
  type: 'COMMENT' | 'VOICE' | 'CLAIM';
  text: string;
  createdAt: string;
}

export interface KanbanCard {
  id: string; // Unique ID (e.g., student:abc or lead:xyz)
  originalId: string;
  type: 'LEAD' | 'STUDENT';
  status: KanbanStatus;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  source: string;
  createdAt: Date | string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  details: any; // Activity notes for leads, Payment info for students
  comments?: ActivityComment[];
  gaClientId?: string | null;
  fbClientId?: string | null;
  fbBrowserId?: string | null;
  waStatus?: 'VERIFIED' | 'BYPASSED' | null;
}

/**
 * Normalizes Student and Lead objects into a unified KanbanCard format.
 */
export function normalizeCrmData(students: any[], leads: any[]): KanbanCard[] {
  const cards: KanbanCard[] = [];

  // 1. Process Students
  students.forEach(st => {
    // Map Student status to KanbanStatus
    // Student statuses: LEAD, ACTIVE, COMPLETED, DROPPED, ARCHIVED
    let status: KanbanStatus = 'CONVERTED'; // Default for paid students
    if (st.status === 'ARCHIVED') status = 'ARCHIVED';
    else if (!st.payments.some((p: any) => p.status === 'PAID')) {
      status = 'QUALIFIED'; // If they registered but didn't pay yet, they are qualified
    }

    cards.push({
      id: `student:${st.id}`,
      originalId: st.id,
      type: 'STUDENT',
      status,
      name: st.user?.name || 'Unknown Student',
      email: st.user?.email || '',
      phone: st.user?.phone || null,
      country: st.country || null,
      source: 'Direct Registration',
      createdAt: st.createdAt,
      utmSource: st.utmSource,
      utmMedium: st.utmMedium,
      utmCampaign: st.utmCampaign,
      utmContent: null,
      utmTerm: null,
      details: {
        payments: st.payments,
        country: st.country,
        status: st.status // Original student status
      },
      gaClientId: st.gaClientId,
      fbClientId: st.fbClientId,
      fbBrowserId: st.fbBrowserId
    });
  });

  // 2. Process Leads
  leads.forEach(ld => {
    // Map Telegram CRM statuses to visible Kanban columns
    const tgStatusMap: Record<string, KanbanStatus> = {
      IN_PROGRESS: 'CONTACTED',
      DONE: 'CONVERTED',
    };
    const status = (tgStatusMap[ld.status] ?? ld.status) as KanbanStatus;

    // Map activities to comments
    const comments: ActivityComment[] = (ld.activities ?? []).map((a: any) => {
      let text = '';
      if (a.type === 'VOICE') {
        text = '🎙️ Голосовое сообщение';
      } else {
        try {
          const parsed = JSON.parse(a.notes ?? '');
          text = parsed.text || parsed.message || a.notes || '';
        } catch {
          text = a.notes || '';
        }
      }
      return {
        id: a.id,
        type: a.type as ActivityComment['type'],
        text,
        createdAt: a.createdAt,
      };
    });

    cards.push({
      id: `lead:${ld.id}`,
      originalId: ld.id,
      type: 'LEAD',
      status,
      name: ld.name || 'Unknown Lead',
      email: ld.email || '',
      phone: ld.phone || null,
      country: ld.country || null,
      source: ld.source || 'Unknown',
      createdAt: ld.createdAt,
      utmSource: ld.utmSource,
      utmMedium: ld.utmMedium,
      utmCampaign: ld.utmCampaign,
      utmContent: ld.utmContent,
      utmTerm: ld.utmTerm,
      details: {
        activitiesCount: ld._count?.activities ?? ld.activities?.length ?? 0
      },
      comments,
      gaClientId: ld.gaClientId,
      fbClientId: ld.fbClientId,
      fbBrowserId: ld.fbBrowserId,
      waStatus: (ld.waStatus === 'VERIFIED' || ld.waStatus === 'BYPASSED') ? ld.waStatus : null
    });
  });

  return cards;
}
