import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data from Desktop Meta Agent
const PIPEBOARD_TOKEN = 'pk_8ee8c727644d4d32b646ddcf16f2385e';
const AD_ACCOUNT_ID = 'act_2043250756570558';
const META_API_VERSION = 'v22.0';

async function fetchMetaToken() {
    const res = await fetch(`https://pipeboard.co/api/meta/token?api_token=${PIPEBOARD_TOKEN}`);
    if (!res.ok) throw new Error(`Pipeboard token fetch failed: ${res.statusText}`);
    const data = await res.json() as { access_token: string };
    return data.access_token;
}

async function fetchInsights(accessToken: string, datePreset: 'today' | 'yesterday') {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${AD_ACCOUNT_ID}/insights?` + new URLSearchParams({
        access_token: accessToken,
        date_preset: datePreset,
        level: 'adset',
        fields: 'adset_name,spend,impressions,actions',
    });

    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Meta Insights fetch failed: ${JSON.stringify(err)}`);
    }
    const data = await res.json() as { data: any[] };
    return data.data;
}

function mapChannel(adsetName: string) {
    const name = adsetName.toLowerCase();
    if (name.includes('indonesia') && name.includes('wa')) return 'WA Indonesia';
    if (name.includes('malaysia') && name.includes('wa')) return 'Malaysia WA';
    if (name.includes('site') || name.includes('lp') || name.includes('traffic')) return 'Site';
    return 'Other';
}

async function sync() {
    console.log(`[${new Date().toISOString()}] Starting Meta Ads Sync...`);
    
    try {
        const token = await fetchMetaToken();
        console.log('✅ Meta token retrieved via Pipeboard');

        const periods: ('today' | 'yesterday')[] = ['today', 'yesterday'];
        
        for (const preset of periods) {
            const insights = await fetchInsights(token, preset);
            console.log(`📊 Fetched ${insights.length} adsets for ${preset}`);

            const date = new Date();
            if (preset === 'yesterday') date.setDate(date.getDate() - 1);
            date.setHours(0, 0, 0, 0);

            for (const item of insights) {
                const channel = mapChannel(item.adset_name);
                if (channel === 'Other') continue;

                // Extract LPV if available in actions
                const lpvAction = item.actions?.find((a: any) => a.action_type === 'landing_page_view');
                const lpv = lpvAction ? parseInt(lpvAction.value) : 0;

                const uniqueId = `meta-${channel}-${date.toISOString().split('T')[0]}`;

                await prisma.marketingPerformance.upsert({
                    where: { id: uniqueId },
                    update: {
                        spend: parseFloat(item.spend),
                        impressions: parseInt(item.impressions),
                        lpv: lpv > 0 ? lpv : undefined,
                        updatedAt: new Date(),
                    },
                    create: {
                        id: uniqueId,
                        date,
                        channel,
                        spend: parseFloat(item.spend),
                        impressions: parseInt(item.impressions),
                        lpv: lpv > 0 ? lpv : 0,
                    }
                });
            }
        }

        console.log('🚀 Sync completed successfully');
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

// Check if running directly
sync().then(() => {
    console.log('Done.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

export { sync };
