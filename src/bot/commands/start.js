const { getMainKeyboard } = require('../keyboards/mainKeyboard');

const handleStart = async (ctx) => {
  const user = ctx.dbUser;
  const name = user ? user.firstName || 'O‘quvchi' : 'O‘quvchi';

  const welcomeText = `👋 <b>Assalomu alaykum, ${name}!</b>\n\n` +
    `🤖 <b>Bilim Sinovi — Telegram Quiz Botiga xush kelibsiz!</b>\n\n` +
    `Bu bot orqali siz turli fanlar bo‘yicha bilimlaringizni sinab ko‘rishingiz, ` +
    `reytingda yuqori o‘rinlarni egallashingiz va sertifikatlar olishingiz mumkin.\n\n` +
    `🎯 <b>Quyidagi menyudan kerakli bo‘limni tanlang:</b>`;

  await ctx.reply(welcomeText, {
    parse_mode: 'HTML',
    ...getMainKeyboard()
  });
};

module.exports = handleStart;
