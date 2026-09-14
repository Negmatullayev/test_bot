const { Markup } = require('telegraf');
const Subject = require('../../models/Subject');
const Test = require('../../models/Test');
const User = require('../../models/User');
const Result = require('../../models/Result');
const Achievement = require('../../models/Achievement');
const { getLevelInfo } = require('../../services/scoringService');

/**
 * Handle "📚 Fanlar" menu
 */
async function handleSubjectsMenu(ctx) {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ order: 1 });

    if (subjects.length === 0) {
      return ctx.reply('Hozircha hech qanday fan mavjud emas.');
    }

    const inlineButtons = subjects.map((sub) => [
      Markup.button.callback(`${sub.icon} ${sub.name}`, `sub_${sub._id}`)
    ]);

    const text = `📚 <b>Mavjud fanlar ro‘yxati:</b>\n\n` +
      `Kerakli fanni tanlang va unga tegishli testlarni ko‘ring:`;

    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(inlineButtons)
    });
  } catch (err) {
    console.error('[Subjects Menu Error]:', err.message);
    ctx.reply('Fanlarni yuklashda xatolik yuz berdi.');
  }
}

/**
 * Handle "🏆 Reyting" menu
 */
async function handleLeaderboardMenu(ctx) {
  try {
    const topUsers = await User.find({ role: 'user', isBlocked: false })
      .sort({ totalScore: -1, xp: -1 })
      .limit(10);

    let text = `🏆 <b>TOP O‘QUVCHILAR REYTINGI</b>\n\n`;

    if (topUsers.length === 0) {
      text += `Hozircha o‘quvchilar mavjud emas. Birinchi bo‘lib test ishlang va peshqadam bo‘ling!`;
    } else {
      const medals = ['🥇', '🥈', '🥉'];
      topUsers.forEach((u, idx) => {
        const medal = medals[idx] || `<b>${idx + 1}.</b>`;
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'O‘quvchi';
        text += `${medal} <b>${name}</b> — ${u.totalScore} ball (${u.levelName})\n`;
      });
    }

    if (ctx.dbUser) {
      // Find current user's rank
      const higherUsersCount = await User.countDocuments({
        role: 'user',
        isBlocked: false,
        totalScore: { $gt: ctx.dbUser.totalScore }
      });
      const myRank = higherUsersCount + 1;
      text += `\n━━━━━━━━━━━━━━━━\n`;
      text += `👤 <b>Sizning o‘rningiz:</b> #${myRank} (${ctx.dbUser.totalScore} ball)`;
    }

    await ctx.reply(text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[Leaderboard Error]:', err.message);
    ctx.reply('Reytingni yuklashda xatolik yuz berdi.');
  }
}

/**
 * Handle "📊 Mening natijalarim" menu
 */
async function handleMyResultsMenu(ctx) {
  try {
    if (!ctx.dbUser) return;

    const results = await Result.find({ userId: ctx.dbUser._id })
      .sort({ createdAt: -1 })
      .limit(10);

    if (results.length === 0) {
      return ctx.reply(
        '📊 <b>Siz hali hech qanday test ishlamadingiz.</b>\n\n' +
        'Test ishlash uchun "📝 Test ishlash" tugmasini bosing.',
        { parse_mode: 'HTML' }
      );
    }

    let text = `📊 <b>Sizning so‘nggi natijalaringiz:</b>\n\n`;

    results.forEach((res, idx) => {
      const dateStr = new Date(res.createdAt).toLocaleDateString('uz-UZ');
      const badge = res.percentage >= 80 ? '🟢' : res.percentage >= 60 ? '🟡' : '🔴';
      text += `${idx + 1}. ${badge} <b>${res.testTitle}</b>\n`;
      text += `   📅 Sana: ${dateStr}\n`;
      text += `   ⭐ Ball: ${res.score}/${res.totalPossibleScore} (${res.percentage}%)\n`;
      text += `   ✅ To‘g‘ri: ${res.correctCount} | ❌ Noto‘g‘ri: ${res.wrongCount}\n\n`;
    });

    text += `💡 <i>Xatolar tahlili test yakunlangan vaqtda ko‘rsatiladi.</i>`;

    await ctx.reply(text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[My Results Error]:', err.message);
    ctx.reply('Natijalaringizni yuklashda xatolik yuz berdi.');
  }
}

/**
 * Handle "📈 Statistika" menu
 */
async function handleStatisticsMenu(ctx) {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTests = await Test.countDocuments({ isActive: true });
    const totalResults = await Result.countDocuments();

    const text = `📈 <b>BOT STATISTIKASI</b>\n\n` +
      `👥 Jami o‘quvchilar: <b>${totalUsers}</b>\n` +
      `📚 Mavjud testlar: <b>${totalTests}</b>\n` +
      `✍️ Ishlangan testlar: <b>${totalResults}</b>\n\n` +
      `⚡ Siz ham testlarni muntazam ishlab, o‘z bilimlaringizni mustahkamlang!`;

    await ctx.reply(text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[Statistics Error]:', err.message);
    ctx.reply('Statistikani yuklashda xatolik yuz berdi.');
  }
}

/**
 * Handle "👤 Profil" menu
 */
async function handleProfileMenu(ctx) {
  try {
    if (!ctx.dbUser) return;
    const user = ctx.dbUser;

    const accuracy = user.totalQuestions > 0
      ? Math.round((user.totalCorrect / user.totalQuestions) * 100)
      : 0;

    const achievements = await Achievement.find({ userId: user._id });
    const badgesText = achievements.length > 0
      ? achievements.map((a) => `${a.icon} ${a.title}`).join('\n')
      : "Hozircha yutuqlar yo'q";

    const text = `👤 <b>PROFIL</b>\n\n` +
      `Ism: <b>${user.firstName} ${user.lastName || ''}</b>\n` +
      `Username: @${user.username || "yo'q"}\n` +
      `Telegram ID: <code>${user.telegramId}</code>\n` +
      `Daraja: <b>Level ${user.level} (${user.levelName})</b>\n` +
      `Tajriba: <b>${user.xp} XP</b>\n` +
      `Jami ball: <b>${user.totalScore}</b>\n\n` +
      `📊 <b>SHAXSIY STATISTIKA</b>\n` +
      `Jami testlar: <b>${user.totalTests}</b>\n` +
      `Jami savollar: <b>${user.totalQuestions}</b>\n` +
      `To‘g‘ri javoblar: <b>${user.totalCorrect}</b> ✅\n` +
      `Noto‘g‘ri javoblar: <b>${user.totalWrong}</b> ❌\n` +
      `O‘rtacha aniqlik: <b>${accuracy}%</b>\n` +
      `Eng yaxshi natija: <b>${user.bestScore}%</b> 🏆\n` +
      `Eng yaxshi fan: <b>${user.bestSubject}</b>\n\n` +
      `🎖 <b>YUTUQLAR (ACHIEVEMENTS):</b>\n${badgesText}`;

    await ctx.reply(text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[Profile Error]:', err.message);
    ctx.reply('Profilni yuklashda xatolik yuz berdi.');
  }
}

module.exports = {
  handleSubjectsMenu,
  handleLeaderboardMenu,
  handleMyResultsMenu,
  handleStatisticsMenu,
  handleProfileMenu
};
