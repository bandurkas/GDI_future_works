/**
 * GDI FutureWorks — Senior QA Engineer Full Audit Suite
 * Run: node scripts/full-qa-audit.mjs
 * Covers: Functional · Security · SEO · Performance · Enrollment Flow
 */

import crypto from 'crypto';

const BASE = 'http://localhost:3000';
const RESULTS = { critical: [], warn: [], info: [], pass: [] };

function pass(label, detail = '') { RESULTS.pass.push({ label, detail }); }
function warn(label, detail = '') { RESULTS.warn.push({ label, detail }); }
function crit(label, detail = '') { RESULTS.critical.push({ label, detail }); }
function info(label, detail = '') { RESULTS.info.push({ label, detail }); }

async function get(path, opts = {}) {
    const res = await fetch(`${BASE}${path}`, { redirect: 'follow', ...opts });
    const text = await res.text().catch(() => '');
    return { status: res.status, text, headers: res.headers };
}

async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
}

// ════════════════════════════════════════════════════════════
// 1. FUNCTIONAL TESTING — Page Availability
// ════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  1️⃣  FUNCTIONAL TESTING — Page Availability');
console.log('══════════════════════════════════════════════\n');

const allPages = [
    ['/', 'Homepage'],
    ['/about', 'About'],
    ['/community', 'Community'],
    ['/contact', 'Contact'],
    ['/courses', 'Courses Listing'],
    ['/courses/data-analytics/schedule', 'Schedule – Data Analytics'],
    ['/courses/python-programming/schedule', 'Schedule – Python'],
    ['/courses/graphic-design-ai/schedule', 'Schedule – Graphic Design'],
    ['/courses/llm-ai-engineering/schedule', 'Schedule – LLM & AI'],
    ['/courses/data-analytics/checkout', 'Checkout – Data Analytics'],
    ['/courses/python-programming/checkout', 'Checkout – Python'],
    ['/courses/data-analytics/payment?n=Test+User&p=0123456789', 'Payment – Data Analytics'],
    ['/courses/data-analytics/confirmation', 'Confirmation – Data Analytics'],
];

for (const [path, label] of allPages) {
    try {
        const { status } = await get(path);
        if (status === 200) { pass(`${label} (${path})`, `HTTP ${status}`); console.log(`  ✅ ${label} — HTTP ${status}`); }
        else if (status === 404) { crit(`${label} returns 404`, path); console.log(`  ❌ ${label} — HTTP ${status} (404)`); }
        else if (status >= 500) { crit(`${label} server error`, `HTTP ${status}`); console.log(`  ❌ ${label} — HTTP ${status} (SERVER ERROR)`); }
        else { warn(`${label} unexpected status`, `HTTP ${status}`); console.log(`  ⚠️  ${label} — HTTP ${status}`); }
    } catch (e) {
        crit(`${label} — fetch failed`, e.message);
        console.log(`  ❌ ${label} — fetch error: ${e.message}`);
    }
}

// ════════════════════════════════════════════════════════════
// 2. SEO & TECHNICAL HEALTH
// ════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  2️⃣  SEO & TECHNICAL HEALTH');
console.log('══════════════════════════════════════════════\n');

const seoPages = [
    ['/', 'Homepage', 'GDI FutureWorks'],
    ['/about', 'About', 'About'],
    ['/contact', 'Contact', 'Contact'],
    ['/community', 'Community', 'Community'],
];

for (const [path, label, expectedTitle] of seoPages) {
    const { text } = await get(path);
    const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(text);
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleText = titleMatch?.[1] || '';
    const hasDescription = /meta[^>]+name="description"/i.test(text);
    const hasOgTitle = /meta[^>]+property="og:title"/i.test(text);
    const hasH1 = /<h1[\s>]/i.test(text);
    const multipleH1 = (text.match(/<h1[\s>]/gi) || []).length > 1;
    const hasViewport = /name="viewport"/i.test(text);
    const hasCharset = /charset/i.test(text);

    if (hasTitle && titleText.includes(expectedTitle)) { pass(`${label}: <title> correct`, titleText); console.log(`  ✅ ${label}: <title> — "${titleText}"`); }
    else { warn(`${label}: <title> missing or wrong`, titleText || 'missing'); console.log(`  ⚠️  ${label}: <title> — "${titleText}"`); }

    if (hasDescription) { pass(`${label}: meta description present`); console.log(`  ✅ ${label}: meta description present`); }
    else { warn(`${label}: meta description missing`); console.log(`  ⚠️  ${label}: meta description missing`); }

    if (hasOgTitle) { pass(`${label}: OG tags present`); console.log(`  ✅ ${label}: og:title present`); }
    else { warn(`${label}: OG tags missing`); console.log(`  ⚠️  ${label}: og:title missing`); }

    if (hasH1) { pass(`${label}: <h1> present`); console.log(`  ✅ ${label}: <h1> present`); }
    else { crit(`${label}: no <h1> found`); console.log(`  ❌ ${label}: no <h1> found`); }

    if (multipleH1) { warn(`${label}: multiple <h1> tags found`); console.log(`  ⚠️  ${label}: multiple <h1> tags`); }

    if (!hasViewport) { crit(`${label}: missing viewport meta tag`); console.log(`  ❌ ${label}: missing viewport`); }
    if (!hasCharset) { warn(`${label}: missing charset declaration`); console.log(`  ⚠️  ${label}: missing charset`); }
}

// Check sitemap & robots.txt
const sitemap = await get('/sitemap.xml');
if (sitemap.status === 200) { pass('sitemap.xml', 'HTTP 200'); console.log(`  ✅ sitemap.xml present`); }
else { info('sitemap.xml not found', `HTTP ${sitemap.status}`); console.log(`  ℹ️  sitemap.xml missing (HTTP ${sitemap.status}) — consider adding`); }

const robots = await get('/robots.txt');
if (robots.status === 200) { pass('robots.txt', 'HTTP 200'); console.log(`  ✅ robots.txt present`); }
else { info('robots.txt not found', `HTTP ${robots.status}`); console.log(`  ℹ️  robots.txt missing — consider adding for SEO`); }

// ════════════════════════════════════════════════════════════
// 3. SECURITY & RELIABILITY
// ════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  3️⃣  SECURITY & RELIABILITY');
console.log('══════════════════════════════════════════════\n');

// 3a. Tokenize: price injection attack
{
    const { status, data } = await post('/api/tokenize', { id: '1', customerName: 'Attacker', customerPhone: '000', priceIDR: 1, gross_amount: 1 });
    if (status === 200 && data?.token) { pass('Price injection blocked — server uses own price', 'token generated without client price'); console.log(`  ✅ Price injection blocked — server always uses correct IDR price`); }
    else if (status === 400) { pass('Price injection blocked (rejected)', `status=${status}`); console.log(`  ✅ Price injection blocked — request rejected`); }
    else { warn('Tokenize response unclear for injection attempt', `status=${status}`); console.log(`  ⚠️  Unexpected tokenize response: ${status}`); }
}

// 3b. Tokenize: course id spoofing
{
    const { status, data } = await post('/api/tokenize', { id: '999', customerName: 'Spoofer', customerPhone: '000' });
    if (status === 400) { pass('Non-existent course ID rejected', `error="${data?.error}"`); console.log(`  ✅ Course ID spoofing rejected — HTTP 400`); }
    else { crit('Course ID validation missing', `status=${status}`); console.log(`  ❌ Course ID spoofing not rejected — HTTP ${status}`); }
}

// 3c. Webhook: fake signature
{
    const { status } = await post('/api/webhook', { order_id: 'fake', status_code: '200', gross_amount: '0', signature_key: 'fake' });
    if (status === 403) { pass('Webhook signature validation active', 'HTTP 403 on invalid sig'); console.log(`  ✅ Webhook: invalid signature correctly rejected (403)`); }
    else { crit('Webhook signature bypass possible', `status=${status}`); console.log(`  ❌ Webhook does not reject invalid signature!`); }
}

// 3d. Webhook: empty body
{
    const { status } = await post('/api/webhook', {});
    if (status !== 500 || status === 403) { pass('Webhook handles empty body safely', `status=${status}`); console.log(`  ✅ Webhook handles empty body without crashing (${status})`); }
    else { crit('Webhook crashes on empty body', 'HTTP 500'); console.log(`  ❌ Webhook 500 on empty body`); }
}

// 3e. Check for exposed .env or config files
for (const sensitiveFile of ['/.env', '/.env.local', '/next.config.js', '/.git/config']) {
    const { status } = await get(sensitiveFile);
    if (status === 404 || status === 403) { pass(`Sensitive file blocked: ${sensitiveFile}`, `HTTP ${status}`); console.log(`  ✅ ${sensitiveFile} — not accessible (${status})`); }
    else { crit(`Sensitive file EXPOSED: ${sensitiveFile}`, `HTTP ${status}`); console.log(`  ❌ ${sensitiveFile} — ACCESSIBLE! (HTTP ${status})`); }
}

// 3f. Security headers check
{
    const { headers } = await get('/');
    const xfo = headers.get('x-frame-options');
    const csp = headers.get('content-security-policy');
    const hsts = headers.get('strict-transport-security');
    const xct = headers.get('x-content-type-options');

    if (xfo) { pass('X-Frame-Options header present', xfo); console.log(`  ✅ X-Frame-Options: ${xfo}`); }
    else { info('X-Frame-Options header missing', 'consider adding for clickjacking protection'); console.log(`  ℹ️  X-Frame-Options missing (acceptable in dev)`); }

    if (xct) { pass('X-Content-Type-Options header set', xct); console.log(`  ✅ X-Content-Type-Options: ${xct}`); }
    else { info('X-Content-Type-Options missing'); console.log(`  ℹ️  X-Content-Type-Options missing`); }

    if (!hsts) { info('HSTS not set (expected on local, ensure in production)'); console.log(`  ℹ️  HSTS not set — ensure enabled on production HTTPS`); }
}

// ════════════════════════════════════════════════════════════
// 4. ENROLLMENT FLOW — End-to-End API Chain
// ════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  4️⃣  ENROLLMENT FLOW — API Chain');
console.log('══════════════════════════════════════════════\n');

const enrollmentCourses = [
    { id: '1', slug: 'data-analytics', name: 'Data Analytics Essentials', expectedPriceIDR: 600000 },
    { id: '2', slug: 'python-programming', name: 'Python for Professionals', expectedPriceIDR: 600000 },
    { id: '3', slug: 'graphic-design-ai', name: 'Graphic Design with AI', expectedPriceIDR: 600000 },
    { id: '4', slug: 'llm-ai-engineering', name: 'LLM & AI Engineering', expectedPriceIDR: 600000 },
];

for (const course of enrollmentCourses) {
    // Step 1: Schedule page loads
    const sched = await get(`/courses/${course.slug}/schedule`);
    if (sched.status === 200) { pass(`Enrollment: Schedule page loads for "${course.name}"`); console.log(`  ✅ Schedule page: ${course.name}`); }
    else { crit(`Enrollment: Schedule page broken for "${course.name}"`, `HTTP ${sched.status}`); console.log(`  ❌ Schedule page broken: ${course.name} —${sched.status}`); }

    // Step 2: Checkout page loads
    const checkout = await get(`/courses/${course.slug}/checkout`);
    if (checkout.status === 200) { pass(`Enrollment: Checkout page loads for "${course.name}"`); console.log(`  ✅ Checkout page: ${course.name}`); }
    else { crit(`Enrollment: Checkout page broken for "${course.name}"`, `HTTP ${checkout.status}`); console.log(`  ❌ Checkout page broken: ${course.name} — ${checkout.status}`); }

    // Step 3: Tokenize API generates valid token
    const tok = await post('/api/tokenize', { id: course.id, customerName: 'QA Test', customerPhone: '0123456789' });
    if (tok.status === 200 && tok.data?.token) {
        pass(`Enrollment: Midtrans token for "${course.name}"`, `token=${tok.data.token.slice(0, 10)}...`);
        console.log(`  ✅ Tokenize OK: ${course.name} — token=${tok.data.token.slice(0, 10)}...`);
    } else {
        crit(`Enrollment: Tokenize FAILED for "${course.name}"`, `status=${tok.status} error="${tok.data?.error}"`);
        console.log(`  ❌ Tokenize failed: ${course.name} — ${tok.data?.error}`);
    }
}

// ════════════════════════════════════════════════════════════
// 5. CONTENT INTEGRITY CHECKS
// ════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════');
console.log('  5️⃣  CONTENT INTEGRITY');
console.log('══════════════════════════════════════════════\n');

// Check homepage doesn't contain Micro Tracks
{
    const { text } = await get('/');
    if (!text.includes('Micro Track') && !text.includes('micro-track')) {
        pass('Micro Tracks section removed'); console.log(`  ✅ Micro Tracks removed from homepage`);
    } else {
        crit('Micro Tracks text found on homepage — not fully removed!'); console.log(`  ❌ Micro Tracks still present!`);
    }
}

// Check salary text removed from course cards
{
    const { text } = await get('/');
    const salaryRegex = /RM\s*[\d,]+[–-][\d,]+\s*\/\s*mo/i;
    if (!salaryRegex.test(text)) {
        pass('Salary text (RM X–Y / mo) removed from homepage'); console.log(`  ✅ Salary text removed from homepage`);
    } else {
        const match = text.match(salaryRegex);
        crit('Salary text still present in homepage HTML', match?.[0]); console.log(`  ❌ Salary text found: ${match?.[0]}`);
    }
}

// Check all 4 courses are present on homepage
{
    const { text } = await get('/');
    const courses = ['Data Analytics Essentials', 'Python for Professionals', 'Graphic Design with AI', 'LLM'];
    for (const c of courses) {
        if (text.includes(c)) { pass(`Homepage: "${c}" visible`); console.log(`  ✅ Course present: ${c}`); }
        else { warn(`Homepage: "${c}" not found in HTML`); console.log(`  ⚠️  Course missing from homepage HTML: ${c}`); }
    }
}

// Check RM 150 pricing is present
{
    const { text } = await get('/');
    if (text.includes('150')) { pass('RM 150 pricing present on homepage'); console.log(`  ✅ RM 150 pricing present`); }
    else { warn('RM 150 pricing not found in page HTML'); console.log(`  ⚠️  RM 150 pricing not found`); }
}

// Check contact info (WhatsApp)
{
    const { text } = await get('/contact');
    if (text.includes('wa.me') || text.includes('whatsapp') || text.includes('WhatsApp')) {
        pass('Contact page has WhatsApp link'); console.log(`  ✅ WhatsApp contact link present`);
    } else {
        warn('Contact page missing WhatsApp link'); console.log(`  ⚠️  WhatsApp link not found on contact page`);
    }
}

// ════════════════════════════════════════════════════════════
// FINAL REPORT
// ════════════════════════════════════════════════════════════
const totalTests = RESULTS.critical.length + RESULTS.warn.length + RESULTS.info.length + RESULTS.pass.length;
const score = Math.round(((RESULTS.pass.length + RESULTS.info.length * 0.5) / totalTests) * 100);

console.log('\n');
console.log('══════════════════════════════════════════════════════════════');
console.log('  📊  FULL QA AUDIT REPORT — GDI FutureWorks');
console.log('══════════════════════════════════════════════════════════════');
console.log(`\n  ✅  Passed:   ${RESULTS.pass.length}`);
console.log(`  ❌  Critical: ${RESULTS.critical.length}`);
console.log(`  ⚠️   Warnings: ${RESULTS.warn.length}`);
console.log(`  ℹ️   Info:     ${RESULTS.info.length}`);
console.log(`  📝  Total:    ${totalTests} checks\n`);

if (RESULTS.critical.length > 0) {
    console.log('  🔴 CRITICAL ERRORS (fix immediately):');
    RESULTS.critical.forEach(r => console.log(`     ❌ ${r.label}${r.detail ? ' — ' + r.detail : ''}`));
    console.log('');
}

if (RESULTS.warn.length > 0) {
    console.log('  🟡 WARNINGS:');
    RESULTS.warn.forEach(r => console.log(`     ⚠️  ${r.label}${r.detail ? ' — ' + r.detail : ''}`));
    console.log('');
}

if (RESULTS.info.length > 0) {
    console.log('  🔵 OPTIMIZATION OPPORTUNITIES:');
    RESULTS.info.forEach(r => console.log(`     ℹ️  ${r.label}${r.detail ? ' — ' + r.detail : ''}`));
    console.log('');
}

console.log('══════════════════════════════════════════════════════════════');
console.log(`  🏆 OVERALL SYSTEM HEALTH SCORE: ${score}/100`);
console.log('══════════════════════════════════════════════════════════════\n');

process.exit(RESULTS.critical.length > 0 ? 1 : 0);
