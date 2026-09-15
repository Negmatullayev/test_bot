const { getMainKeyboard } = require('../keyboards/mainKeyboard');
const Certificate = require('../../models/Certificate');
const fs = require('fs');

const handleStart = async (ctx) => {
  const user = ctx.dbUser;
  const name = user ? user.firstName || 'O‘quvchi' : 'O‘quvchi';
  const startPayload = ctx.message?.text?.split(' ')[1] || '';

  if (startPayload.startsWith('cert_')) {
    try {
      const certificateNumber = startPayload.slice(5).toUpperCase();
      const certificate = await Certificate.findOne({ certificateNumber });

      if (!certificate) {
        return ctx.reply('❌ Bu sertifikat topilmadi yoki bekor qilingan.');
      }

      const verificationText = `✅ <b>SERTIFIKAT TASDIQLANDI</b>\n\n` +
        `👤 Egasi: <b>${certificate.userName}</b>\n` +
        `📚 Test: <b>${certificate.testTitle}</b>\n` +
        `📈 Natija: <b>${certificate.percentage}%</b>\n` +
        `🆔 Raqam: <code>${certificate.certificateNumber}</code>\n` +
        `📅 Sana: ${new Date(certificate.issueDate).toLocaleDateString('uz-UZ')}`;

      await ctx.reply(verificationText, { parse_mode: 'HTML' });

      if (certificate.pdfFilePath && fs.existsSync(certificate.pdfFilePath)) {
        await ctx.replyWithDocument(
          { source: certificate.pdfFilePath },
          { caption: '📄 Sertifikatning tasdiqlangan nusxasi.' }
        );
      }

      return;
    } catch (error) {
      console.error('[Certificate Deep Link Error]:', error.message);
      return ctx.reply('⚠️ Sertifikatni tekshirishda vaqtinchalik xatolik. Keyinroq qayta urinib ko‘ring.');
    }
  }

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
