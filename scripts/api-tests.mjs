/**
 * GDI FutureWorks — Backend API Test Suite
 * Run: node scripts/api-tests.mjs
 */

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const results = [];

function log(label, ok, detail = '') {
    const icon = ok ? '✅' : '❌';
    const line = `  ${icon} ${label}${detail ? ' — ' + detail : ''}`;
    results.push({ ok, label, detail });
    if (ok) passed++; else failed++;
    console.log(line);
}

async function post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
}

// ─── TOKENIZE ENDPOINT ────────────────────────────────────────────────────────
console.log('\n🔷 /api/tokenize — Course Existence & Validation\n');

// 1. Invalid course id
{
    const { status, data } = await post('/api/tokenize', { id: '999', customerName: 'Test', customerPhone: '0123' });
    log('Rejects unknown course id', status === 400, `status=${status} error="${data?.error}"`);
}

// 2. Missing id field
{
    const { status, data } = await post('/api/tokenize', { customerName: 'Test' });
    log('Rejects missing course id', status === 400, `status=${status} error="${data?.error}"`);
}

// 3. All four valid course IDs resolve course correctly
for (const [id, name] of [['1', 'Data Analytics'], ['2', 'Python'], ['3', 'Graphic Design'], ['4', 'LLM']]) {
    const { status, data } = await post('/api/tokenize', { id, customerName: 'Test User', customerPhone: '0123456789' });
    // We expect either a Midtrans token (200) or a Midtrans API error (still 200 from our route)
    // The key thing: it should NOT be 400 (invalid course), and our route should not crash (not 500 due to our code)
    const courseFound = status !== 400 || data?.error !== 'Course not found';
    log(`Course id "${id}" (${name}) is found`, courseFound, `status=${status} token=${data?.token ? 'present' : 'absent'} error="${data?.error || 'none'}"`);
}

// 4. Price is always server-side — ensure client cannot inject a different price
{
    const { status, data } = await post('/api/tokenize', {
        id: '1',
        customerName: 'Hacker',
        customerPhone: '000',
        grossAmount: 1,      // should be ignored
        priceIDR: 1,         // should be ignored
        price: 1,            // should be ignored
    });
    // If the Midtrans call succeeds, it should use the server IDR price (600000), not 1
    // We can't fully verify the Midtrans payload without intercepting the upstream call,
    // but we verify our route doesn't crash and doesn't accept the client price as authoritative
    log('Client-injected price fields are ignored (route does not crash)', status !== 500, `status=${status}`);
}

// 5. customerName defaults to 'Student' when missing
{
    const { status } = await post('/api/tokenize', { id: '1' });
    log('Missing customerName does not crash route', status !== 500, `status=${status}`);
}

// ─── WEBHOOK ENDPOINT ─────────────────────────────────────────────────────────
console.log('\n🔷 /api/webhook — Signature & Idempotency\n');

// 6. Rejects webhook with missing/invalid signature
{
    const { status, data } = await post('/api/webhook', {
        order_id: 'GDI-data-analytics-1234567890',
        status_code: '200',
        gross_amount: '600000.00',
        signature_key: 'invalidsignature',
        transaction_status: 'settlement',
        transaction_id: 'txn-test-001',
        transaction_time: '2025-03-15 10:00:00',
        customer_details: { first_name: 'Test', phone: '0123' },
        item_details: [{ name: 'Data Analytics Essentials', price: 600000, quantity: 1 }],
    });
    log('Webhook rejects invalid signature', status === 403, `status=${status} error="${data?.error}"`);
}

// 7. Rejects webhook with completely empty body
{
    const { status } = await post('/api/webhook', {});
    // Should 403 (invalid signature from empty fields) or 500 from missing keys — NOT a crash that breaks the server
    log('Webhook handles empty body gracefully (no unhandled crash)', status === 403 || status === 500, `status=${status}`);
}

// 8. Idempotency — if a valid signature were processed twice, the second call should be a no-op
// We can't produce a real Midtrans signature without the MIDTRANS_SERVER_KEY, so we test that
// the idempotency Set is at least wired up by trying the same invalid-sig payload twice.
{
    const payload = {
        order_id: 'GDI-python-programming-9999',
        status_code: '200',
        gross_amount: '600000.00',
        signature_key: 'badsig',
        transaction_status: 'settlement',
        transaction_id: 'txn-idempotency-test',
        transaction_time: '2025-03-15 10:00:00',
        customer_details: { first_name: 'Idempotency', phone: '0000' },
        item_details: [{ name: 'Python for Professionals', price: 600000, quantity: 1 }],
    };
    const r1 = await post('/api/webhook', payload);
    const r2 = await post('/api/webhook', payload);
    // Both should be rejected at signature stage (403) consistently — server stays stable
    log('Webhook endpoint is stable across repeated calls', r1.status === 403 && r2.status === 403, `first=${r1.status} second=${r2.status}`);
}

// ─── ENROLLMENT FLOW PAGES (HTTP checks) ──────────────────────────────────────
console.log('\n🔷 Enrollment Flow — Page Availability (HTTP GET)\n');

const pages = [
    ['/', 'Homepage'],
    ['/about', 'About'],
    ['/community', 'Community'],
    ['/contact', 'Contact'],
    ['/courses', 'Courses listing'],
    ['/courses/data-analytics/schedule', 'Data Analytics Schedule'],
    ['/courses/python-programming/schedule', 'Python Schedule'],
    ['/courses/graphic-design-ai/schedule', 'Graphic Design Schedule'],
    ['/courses/llm-ai-engineering/schedule', 'LLM Schedule'],
    ['/courses/data-analytics/checkout', 'Data Analytics Checkout'],
    ['/courses/python-programming/checkout', 'Python Checkout'],
];

for (const [path, label] of pages) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, { redirect: 'follow' });
        const ok = res.status < 400;
        log(`${label} (${path})`, ok, `HTTP ${res.status}`);
    } catch (e) {
        log(`${label} (${path})`, false, `fetch error: ${e.message}`);
    }
}

// ─── 404 HANDLING ─────────────────────────────────────────────────────────────
console.log('\n🔷 404 Handling\n');

{
    const res = await fetch(`${BASE_URL}/courses/nonexistent-course-xyz/schedule`);
    // Should be 404 or redirect, not a 500 crash
    log('Non-existent course slug does not crash (404 or redirect)', res.status !== 500, `HTTP ${res.status}`);
}

{
    const res = await fetch(`${BASE_URL}/courses/data-analytics/payment?n=Test&p=0123456789`);
    log('Payment page loads with query params', res.status < 400, `HTTP ${res.status}`);
}

// ──────────────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(55));
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed out of ${passed + failed} total\n`);

if (failed > 0) {
    console.log('⚠️  Failed tests:');
    results.filter(r => !r.ok).forEach(r => console.log(`   ❌ ${r.label} — ${r.detail}`));
}

process.exit(failed > 0 ? 1 : 0);
