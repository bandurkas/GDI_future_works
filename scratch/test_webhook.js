const { notifyNewLead } = require('../src/lib/sales-notifications');

async function test() {
  console.log('🚀 Отправка тестового лида в Make.com...');
  
  try {
    await notifyNewLead({
      source: 'TEST_AUTOMATION',
      name: 'Andi (Test Lead)',
      phone: '628123456789',
      course: 'Python for Beginners',
      interest: 'Python',
      country: 'Indonesia'
    });
    console.log('✅ Тестовый лид успешно отправлен! Проверьте Make.com.');
  } catch (err) {
    console.error('❌ Ошибка при отправке:', err);
  }
}

test();
