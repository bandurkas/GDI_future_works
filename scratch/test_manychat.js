const axios = require('axios');

const WEBHOOK_URL = 'https://gdifuture.works/api/leads/manychat';
const WEBHOOK_KEY = 'gdi-mc-2026'; // Default key if not set in env

const testData = {
  name: "ManyChat Test User",
  phone: "628123456789",
  email: "test_manychat@example.com",
  channel: "whatsapp",
  course: "Data Science",
  budget: "3.5jt",
  schedule: "Weekend",
  notes: "Qualified by AI. User wants to start next week.",
  manychat_id: "MC_123456789",
  key: WEBHOOK_KEY
};

async function testWebhook() {
  console.log('--- Testing ManyChat Webhook ---');
  
  // 1. Test Unauthorized
  try {
    console.log('\n1. Testing Unauthorized (wrong key)...');
    await axios.post(WEBHOOK_URL, { ...testData, key: 'wrong-key' });
  } catch (error) {
    console.log('Result:', error.response?.status === 401 ? '✅ PASSED (401)' : `❌ FAILED (${error.response?.status})`);
  }

  // 2. Test Success
  try {
    console.log('\n2. Testing Success (valid payload)...');
    const response = await axios.post(WEBHOOK_URL, testData);
    console.log('Result:', response.status === 200 && response.data.ok ? '✅ PASSED (200 OK)' : '❌ FAILED');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    if (error.response) console.log('Data:', error.response.data);
  }

  // 3. Test Upsert
  try {
    console.log('\n3. Testing Upsert (same lead)...');
    const response = await axios.post(WEBHOOK_URL, { ...testData, name: "ManyChat Test User Updated" });
    console.log('Result:', response.status === 200 && response.data.ok ? '✅ PASSED (200 OK)' : '❌ FAILED');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

testWebhook();
