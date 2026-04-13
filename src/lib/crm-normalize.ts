export type KanbanStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ARCHIVED';

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
  gaClientId?: string | null;
  fbClientId?: string | null;
  fbBrowserId?: string | null;
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
    // Lead statuses: NEW, CONTACTED, QUALIFIED, CONVERTED
    const status = ld.status as KanbanStatus;

    // Parse details from activities if available
    let details: any = null;
    if (ld.activities && ld.activities[0]?.notes) {
      try { details = JSON.parse(ld.activities[0].notes); } catch { details = null; }
    }

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
        ...details,
        activitiesCount: ld.activities?.length || 0
      },
      gaClientId: ld.gaClientId,
      fbClientId: ld.fbClientId,
      fbBrowserId: ld.fbBrowserId
    });
  });

  return cards;
}
