const { Telegraf } = require('telegraf');
const userAuthMiddleware = require('./middleware/userAuth');
const handleStart = require('./commands/start');
const handleHelp = require('./commands/help');
const {
  handleSubjectsMenu,
  handleLeaderboardMenu,
  handleMyResultsMenu,
  handleStatisticsMenu,
  handleProfileMenu
} = require('./handlers/menuHandler');
const {
  handleDailyChallenge,
  handleRandomTest
} = require('./handlers/challengeHandler');
const {
  handleStartTestFlow,
  handleSelectSubject,
  handleTestPreview,
  handleInitTest,
  handleAnswerOption,
  handleNavigation,
  finishAttempt,
  handleMistakesReview,
  handleGetCertificate
} = require('./handlers/testHandler');
const { setBotInstance } = require('../services/botService');
const User = require('../models/User');

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

function initBot() {
  const token = process.env.BOT_TOKEN;
  if (!token || token.includes('YOUR_TELEGRAM_BOT_TOKEN')) {
    console.warn('[Telegram Bot] BOT_TOKEN sozlanmagan yoki default holda. Bot ishga tushmaydi.');
    return null;
  }

  const bot = new Telegraf(token);

  // Set instance for background services (broadcasting)
  setBotInstance(bot);

  // Global user authentication middleware
  bot.use(userAuthMiddleware);

  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('profile', handleProfileMenu);
  bot.command('rating', handleLeaderboardMenu);
  bot.command(['stop', 'logout'], async (ctx) => {
    if (ctx.dbUser) {
      ctx.dbUser.lastLogoutAt = new Date();
      await ctx.dbUser.save();
    }
    await ctx.reply('Sizning chiqish vaqtingiz qayd etildi. Qayta kirish uchun /start bosing.');
  });

  // Main Reply Keyboard Menu triggers
  bot.hears('📝 Test ishlash', handleStartTestFlow);
  bot.hears('📚 Fanlar', handleSubjectsMenu);
  bot.hears('🏆 Reyting', handleLeaderboardMenu);
  bot.hears('📊 Mening natijalarim', handleMyResultsMenu);
  bot.hears('📈 Statistika', handleStatisticsMenu);
  bot.hears('👤 Profil', handleProfileMenu);
  bot.hears('ℹ️ Bot haqida', handleHelp);
  bot.hears('🔥 Daily Challenge', handleDailyChallenge);
  bot.hears('🎲 Random Test', handleRandomTest);
  bot.hears(['🏠 Bosh menyu', '❌ Bekor qilish'], handleStart);

  // Forward ordinary student replies to the admin Telegram account.
  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (!ctx.dbUser || ctx.dbUser.role === 'admin' || text.startsWith('/')) return next();

    const adminUser = await User.findOne({ role: 'admin', telegramId: { $ne: null } }).select('telegramId');
    const adminTelegramId = process.env.ADMIN_TELEGRAM_ID || adminUser?.telegramId;
    if (!adminTelegramId) {
      console.warn('[Student Reply] ADMIN_TELEGRAM_ID sozlanmagan va admin Telegram ID bazada topilmadi.');
      return next();
    }

    try {
      const displayName = `${ctx.dbUser.firstName || ''} ${ctx.dbUser.lastName || ''}`.trim() || ctx.dbUser.username || 'O‘quvchi';
      await bot.telegram.sendMessage(
        Number(adminTelegramId),
        `📩 <b>O‘quvchidan yangi javob</b>\n\n` +
        `👤 ${escapeHtml(displayName)}\n` +
        `🆔 <code>${ctx.dbUser.telegramId}</code>\n\n` +
        `${escapeHtml(text)}`,
        { parse_mode: 'HTML' }
      );
      await ctx.reply('✅ Xabaringiz adminga yuborildi.');
    } catch (error) {
      console.error('[Student Reply Forward Error]:', error.message);
    }
  });

  // Inline Actions
  bot.action(/^sub_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    await handleSelectSubject(ctx, ctx.match[1]);
  });

  bot.action(/^tsub_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    await handleSelectSubject(ctx, ctx.match[1]);
  });

  bot.action(/^test_preview_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    await handleTestPreview(ctx, ctx.match[1]);
  });

  bot.action(/^init_test_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    await handleInitTest(ctx, ctx.match[1]);
  });

  bot.action(/^start_attempt_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const Attempt = require('../models/Attempt');
    const attempt = await Attempt.findById(ctx.match[1]);
    if (attempt) {
      const { renderQuestion } = require('./handlers/testHandler');
      await renderQuestion(ctx, attempt, 0);
    }
  });

  // Pick Answer: ans_{attemptId}_{qIndex}_{optionKey}
  bot.action(/^ans_([a-f0-9]+)_([0-9]+)_([A-D])$/, async (ctx) => {
    const [, attemptId, qIndex, optionKey] = ctx.match;
    await handleAnswerOption(ctx, attemptId, qIndex, optionKey);
  });

  // Navigate: nav_{attemptId}_{targetIndex}
  bot.action(/^nav_([a-f0-9]+)_([0-9]+)$/, async (ctx) => {
    const [, attemptId, targetIndex] = ctx.match;
    await handleNavigation(ctx, attemptId, targetIndex);
  });

  // Finish: finish_{attemptId}
  bot.action(/^finish_([a-f0-9]+)$/, async (ctx) => {
    await ctx.answerCbQuery('Test yakunlanmoqda...');
    await finishAttempt(ctx, ctx.match[1], false);
  });

  // Mistakes: mistakes_{resultId}
  bot.action(/^mistakes_([a-f0-9]+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMistakesReview(ctx, ctx.match[1]);
  });

  // Certificate: getcert_{resultId}
  bot.action(/^getcert_([a-f0-9]+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    await handleGetCertificate(ctx, ctx.match[1]);
  });

  // Catch unhandled errors gracefully
  bot.catch((err, ctx) => {
    console.error(`[Telegram Bot Error for ${ctx?.updateType || 'unknown'}]:`, err.message || err);
    try {
      if (ctx && ctx.reply) {
        ctx.reply('❌ Xatolik yuz berdi. Iltimos, birozdan keyin qayta urinib ko‘ring.');
      }
    } catch (e) {}
  });

  return bot;
}

module.exports = initBot;

