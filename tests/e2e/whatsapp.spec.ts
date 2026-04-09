import { test, expect } from '@playwright/test';

test.describe('WhatsApp Smart Redirect API', () => {
    test('Redirects Indonesia (ID) clients to the +62 number', async ({ request }) => {
        // We set maxRedirects to 0 so we can inspect the raw 302 response headers
        const response = await request.get('/api/whatsapp', {
            headers: { 'cf-ipcountry': 'ID' },
            maxRedirects: 0, 
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('https://wa.me/628211704707');
    });

    test('Redirects Malaysia (MY) clients to the +60 number', async ({ request }) => {
        const response = await request.get('/api/whatsapp', {
            headers: { 'cf-ipcountry': 'MY' },
            maxRedirects: 0,
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('https://wa.me/60174833318');
    });

    test('Preserves the text query parameter dynamically', async ({ request }) => {
        const response = await request.get('/api/whatsapp?text=Hello+GDI+FutureWorks', {
            headers: { 'cf-ipcountry': 'ID' },
            maxRedirects: 0,
        });
        
        expect(response.status()).toBe(302);
        expect(response.headers().location).toContain('text=Hello+GDI+FutureWorks');
    });
});
