const SOURCE_MAP: Record<string, string> = {
  fb: 'facebook',
  'facebook.com': 'facebook',
  'm.facebook.com': 'facebook',
  'l.facebook.com': 'facebook',
  an: 'facebook', // Meta Audience Network
  ig: 'instagram',
  'instagram.com': 'instagram',
  'l.instagram.com': 'instagram',
  google: 'google',
  'google.com': 'google',
  'accounts.google.com': 'google',
  'google.co.id': 'google',
  yt: 'youtube',
  'youtube.com': 'youtube',
  tt: 'tiktok',
  'tiktok.com': 'tiktok',
  'l.tiktok.com': 'tiktok',
  tw: 'twitter',
  'twitter.com': 'twitter',
  't.co': 'twitter',
};

const MEDIUM_MAP: Record<string, string> = {
  'paid-other': 'paid_social',
  paidsocial: 'paid_social',
  'paid social': 'paid_social',
  ppc: 'cpc',
  'cost-per-click': 'cpc',
  'paid-search': 'cpc',
  banner: 'display',
  retargeting: 'retargeting',
};

function normalize(value: string | null | undefined, map: Record<string, string>): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return map[v] ?? value.trim();
}

export interface UtmParams {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

export function normalizeUtm(params: UtmParams): Required<UtmParams> {
  return {
    utmSource: normalize(params.utmSource, SOURCE_MAP),
    utmMedium: normalize(params.utmMedium, MEDIUM_MAP),
    utmCampaign: params.utmCampaign?.trim() || null,
    utmContent: params.utmContent?.trim() || null,
    utmTerm: params.utmTerm?.trim() || null,
  };
}
