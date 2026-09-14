const { getMainKeyboard } = require('../keyboards/mainKeyboard');

const handleHelp = async (ctx) => {
  const text = `ℹ️ <b>Botdan foydalanish bo‘yicha qo‘llanma:</b>\n\n` +
    `📝 <b>Test ishlash:</b> Fan va test turini tanlab, bilimlaringizni sinang.\n` +
    `🔥 <b>Daily Challenge:</b> Har kungi maxsus 10 ta savolli tezkor test.\n` +
    `🎲 <b>Random Test:</b> Barcha fanlar yoki mavzulardan tasodifiy savollar.\n` +
    `🏆 <b>Reyting:</b> Eng ko‘p ball to‘plagan eng yaxshi o‘quvchilar ro‘yxati.\n` +
    `📊 <b>Mening natijalarim:</b> Siz ishlagan testlar tarixi va xatolar tahlili.\n` +
    `👤 <b>Profil:</b> Shaxsiy darajangiz (XP, Level) va nishonlaringiz.\n\n` +
    `⚡ <b>Ball tizimi:</b>\n` +
    `• To‘g‘ri javob = +10 ball\n` +
    `• Testni tezroq yakunlash = +10..20 bonus\n` +
    `• 100% natija = +30 bonus\n` +
    `• 80%+ natija ko‘rsatsangiz maxsus <b>PDF Sertifikat</b> taqdim etiladi!`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    ...getMainKeyboard()
  });
};

module.exports = handleHelp;
