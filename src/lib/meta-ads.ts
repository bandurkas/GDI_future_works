import { prisma } from './prisma';

const META_API_VERSION = 'v25.0';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;

export async function syncMetaAdsPerformance(days = 14) {
  if (!META_ACCESS_TOKEN || !AD_ACCOUNT_ID) {
    throw new Error('Meta Ads credentials missing in environment');
  }

  const endpoint = `https://graph.facebook.com/${META_API_VERSION}/${AD_ACCOUNT_ID}/insights`;
  
  // We fetch insights by day (level=adset results in more data, but we can aggregate here)
  // For daily dynamics, we use 'time_increment=1'
  const params = new URLSearchParams({
    access_token: META_ACCESS_TOKEN,
    fields: 'spend,impressions,actions,inline_link_clicks',
    level: 'campaign', // Campaign level is enough for "Daily Dynamics"
    time_increment: '1',
    date_preset: `last_${days}d`,
    limit: '500'
  });

  const response = await fetch(`${endpoint}?${params.toString()}`);
  const result = await response.json();

  if (result.error) {
    throw new Error(`Meta API Error: ${result.error.message}`);
  }

  const data = result.data || [];
  
  const syncResults = [];

  for (const item of data) {
    const date = new Date(item.date_start);
    const spend = parseFloat(item.spend || '0');
    const impressions = parseInt(item.impressions || '0');
    const clicks = parseInt(item.inline_link_clicks || '0');
    
    // Extract messaging_conversation_started_7d
    const actions = item.actions || [];
    const conversations = actions.find((a: any) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || 0;

    // We store it as "Meta" channel but we can also store campaign name
    const channel = 'Meta'; 
    // Actually, to show daily dynamics across everything, we can aggregate by date
    // Or just store each campaign's daily performance
    const campaignName = item.campaign_name || 'Meta Ads';

    const performance = await prisma.marketingPerformance.upsert({
      where: {
        date_channel: {
          date: date,
          channel: campaignName,
        },
      },
      update: {
        spend: spend,
        impressions: impressions,
        conversations: parseInt(conversations),
        clicks: clicks,
      },
      create: {
        date: date,
        channel: campaignName,
        spend: spend,
        impressions: impressions,
        conversations: parseInt(conversations),
        clicks: clicks,
      },
    });
    
    syncResults.push(performance);
  }

  return syncResults;
}

/**
 * Sends a server-side Conversion Event to Meta Ads API (CAPI).
 * Improves attribution and ad algorithm performance by bypassing ad blockers.
 */
export async function sendMetaConversionEvent({
    eventName,
    userData,
    customData = {},
    sourceUrl
}: {
    eventName: 'Lead' | 'Contact' | 'CompleteRegistration';
    userData: {
        email?: string;
        phone?: string;
        fbc?: string;
        fbp?: string;
        externalId?: string;
        clientIpAddress?: string;
        clientUserAgent?: string;
    };
    customData?: Record<string, any>;
    sourceUrl?: string;
}) {
    if (!META_ACCESS_TOKEN || !process.env.META_PIXEL_ID) {
        console.warn('Meta Ads credentials missing - skipping CAPI event');
        return;
    }

    const endpoint = `https://graph.facebook.com/${META_API_VERSION}/${process.env.META_PIXEL_ID}/events`;

    // Process user data (Meta requires hashing for PII like email/phone, but we can send raw and they hash it if using Business SDK)
    // Here we use standard Graph API payload
    const payload = {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_source_url: sourceUrl || 'https://gdifuture.works',
            user_data: {
                em: userData.email ? [userData.email.toLowerCase().trim()] : undefined,
                ph: userData.phone ? [userData.phone.replace(/\D/g, '')] : undefined,
                fbc: userData.fbc,
                fbp: userData.fbp,
                external_id: userData.externalId,
                client_ip_address: userData.clientIpAddress,
                client_user_agent: userData.clientUserAgent
            },
            custom_data: customData
        }],
        access_token: META_ACCESS_TOKEN
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.error) {
            console.error('Meta CAPI Error:', result.error);
        } else {
            console.log(`Meta CAPI Success: Sent ${eventName} event`);
        }
        return result;
    } catch (error) {
        console.error('Meta CAPI Network Error:', error);
    }
}
