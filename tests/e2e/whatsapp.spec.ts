import { test, expect } from '@playwright/test';

test.describe('WhatsApp Smart Redirect API (v2)', () => {
    
    test('Priority 1: Respects GDI_CURRENCY=IDR cookie over any header', async ({ request }) => {
        const response = await request.get('/api/whatsapp', {
            headers: { 
                'Cookie': 'GDI_CURRENCY=IDR',
                'cf-ipcountry': 'MY' // Attempting to say they are in Malaysia
            },
            maxRedirects: 0, 
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('628211704707'); // Should be ID
        expect(response.headers()['x-debug-signal']).toBe('cookie_idr');
    });

    test('Priority 2: Uses CF-IPCountry=ID when no cookie is set', async ({ request }) => {
        const response = await request.get('/api/whatsapp', {
            headers: { 'cf-ipcountry': 'ID' },
            maxRedirects: 0,
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('628211704707');
        expect(response.headers()['x-debug-signal']).toBe('cloudflare');
    });

    test('Priority 3: Falls back to Accept-Language=id when no CF header', async ({ request }) => {
        const response = await request.get('/api/whatsapp', {
            headers: { 'accept-language': 'id-ID,id;q=0.9' },
            maxRedirects: 0,
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('628211704707');
        expect(response.headers()['x-debug-signal']).toBe('accept_language');
    });

    test('Debug: Forces Malaysia number via debug_country param', async ({ request }) => {
        const response = await request.get('/api/whatsapp?debug_country=MY', {
            headers: { 'cf-ipcountry': 'ID' }, // Real header says ID
            maxRedirects: 0,
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('60174833318'); // Should be MY
        expect(response.headers()['x-debug-signal']).toBe('debug_param');
    });

    test('Default: Routes to Malaysia number if no signals detected', async ({ request }) => {
        const response = await request.get('/api/whatsapp', {
            maxRedirects: 0,
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('60174833318');
    });
});
