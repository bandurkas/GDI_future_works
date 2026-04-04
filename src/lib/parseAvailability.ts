const TIME_KEYS = ['morning', 'midday', 'afternoon', 'evening', 'night', 'free'];

export function parseAvailability(raw: string | null): Record<number, string[]> {
  if (!raw) return {};
  const result: Record<number, string[]> = {};
  let items: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) items = parsed.map(String);
    else items = [String(parsed)];
  } catch {
    items = raw.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  }
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  for (const item of items) {
    const lower = item.toLowerCase().replace(/\s/g, '-');
    const dayKey = Object.keys(dayMap).find(k => lower.startsWith(k));
    if (dayKey === undefined) continue;
    const dayIdx = dayMap[dayKey];
    const timeKey = TIME_KEYS.find(t => lower.includes(t)) || 'free';
    if (!result[dayIdx]) result[dayIdx] = [];
    if (!result[dayIdx].includes(timeKey)) result[dayIdx].push(timeKey);
  }
  return result;
}
