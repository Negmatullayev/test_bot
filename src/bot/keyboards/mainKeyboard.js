const { Markup } = require('telegraf');

/**
 * Main persistent reply keyboard
 */
function getMainKeyboard() {
  return Markup.keyboard([
    ['📝 Test ishlash', '🔥 Daily Challenge'],
    ['🎲 Random Test', '📚 Fanlar'],
    ['🏆 Reyting', '📊 Mening natijalarim'],
    ['📈 Statistika', '👤 Profil'],
    ['ℹ️ Bot haqida']
  ]).resize();
}

/**
 * Cancel / Back reply keyboard
 */
function getCancelKeyboard() {
  return Markup.keyboard([['🏠 Bosh menyu', '❌ Bekor qilish']]).resize();
}

module.exports = {
  getMainKeyboard,
  getCancelKeyboard
};
