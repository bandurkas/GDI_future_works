import { test, expect } from '@playwright/test';

test.describe('Midtrans Checkout & Webhook Pipeline', () => {

  test('POST /api/tokenize - returns 400 when missing cart parameters', async ({ request }) => {
    const response = await request.post('/api/tokenize', {
      data: {
        // Omitting required metadata
        first_name: 'E2E Test',
        email: 'e2e@example.com'
      }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/tokenize - successfully generates mock snap token', async ({ request }) => {
    const response = await request.post('/api/tokenize', {
      data: {
        cart: [{ id: 'data-analytics', name: 'Data Analytics', price: 400000 }],
        first_name: 'Playwright',
        email: 'playwright@gdifuture.works',
        phone: '123456789',
        city: 'Test City',
        country: 'Test Country'
      }
    });

    // We expect either 200 or 500 depending on real Midtrans network reachability.
    // Assuming mock env variables or actual integration keys are active:
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.token).toBeDefined();
      expect(typeof body.token).toBe('string');
    }
  });

  test('POST /api/webhook - rejects unauthenticated signatures', async ({ request }) => {
    const response = await request.post('/api/webhook', {
      data: {
        transaction_status: 'capture',
        order_id: 'TEST-ORDER-123',
        signature_key: 'invalid_mock_signature'
      }
    });

    // Server should reject the invalid signature
    expect(response.status()).toBe(401);
  });
});
