const { Markup } = require('telegraf');
const Question = require('../../models/Question');
const Attempt = require('../../models/Attempt');
const Subject = require('../../models/Subject');
const { sendQuestionToUser } = require('./testHandler');

/**
 * Handle "🔥 Daily Challenge"
 */
async function handleDailyChallenge(ctx) {
  try {
    if (!ctx.dbUser) return;

    // Check if user already took daily challenge today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const Attempt = require('../../models/Attempt');
    const existingAttempt = await Attempt.findOne({
      userId: ctx.dbUser._id,
      isDailyChallenge: true,
      createdAt: { $gte: todayStart }
    });

    if (existingAttempt && existingAttempt.isCompleted) {
      return ctx.reply(
        '🔥 <b>Siz bugungi Daily Challenge testini topshirib bo‘lgansiz!</b>\n\n' +
        'Yangi challenge ertaga 00:00 da ochiladi. Hozir boshqa fanlardan test ishlashingiz mumkin.',
        { parse_mode: 'HTML' }
      );
    }

    // Get 10 random questions
    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 10 } }
    ]);

    if (questions.length === 0) {
      return ctx.reply('Hozircha bazada savollar mavjud emas.');
    }

    const durationMinutes = 5;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const attempt = await Attempt.create({
      userId: ctx.dbUser._id,
      telegramId: ctx.dbUser.telegramId,
      testId: null,
      isDailyChallenge: true,
      isRandomTest: false,
      subjectTitle: 'Daily Challenge',
      testTitle: '🔥 Kunlik Challenge',
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.questionText,
        imageUrl: q.imageUrl || '',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 1
      })),
      answers: {},
      currentQuestionIndex: 0,
      durationMinutes,
      expiresAt
    });

    const infoText = `🔥 <b>BUGUNGI CHALLENGE</b>\n\n` +
      `Savollar soni: <b>10 ta</b>\n` +
      `⏱ Vaqt: <b>5 daqiqa</b>\n` +
      `⭐ Maksimal ball: <b>100 ball + Bonus</b>\n\n` +
      `Boshlashga tayyormisiz?`;

    await ctx.reply(infoText, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🚀 TESTNI BOSHLASH', `start_attempt_${attempt._id}`)]
      ])
    });
  } catch (err) {
    console.error('[Daily Challenge Error]:', err.message);
    ctx.reply('Daily Challenge yuklashda xatolik yuz berdi.');
  }
}

/**
 * Handle "🎲 Random Test"
 */
async function handleRandomTest(ctx) {
  try {
    if (!ctx.dbUser) return;

    // Get 15 random questions
    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 15 } }
    ]);

    if (questions.length === 0) {
      return ctx.reply('Hozircha bazada yetarli savollar mavjud emas.');
    }

    const durationMinutes = 15;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const attempt = await Attempt.create({
      userId: ctx.dbUser._id,
      telegramId: ctx.dbUser.telegramId,
      testId: null,
      isDailyChallenge: false,
      isRandomTest: true,
      subjectTitle: 'Aralash fanlar',
      testTitle: '🎲 Random Test (Aralash)',
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.questionText,
        imageUrl: q.imageUrl || '',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 1
      })),
      answers: {},
      currentQuestionIndex: 0,
      durationMinutes,
      expiresAt
    });

    const infoText = `🎲 <b>RANDOM TEST (Aralash savollar)</b>\n\n` +
      `Savollar soni: <b>15 ta</b>\n` +
      `⏱ Vaqt: <b>15 daqiqa</b>\n` +
      `⭐ Har bir to‘g‘ri javob uchun: <b>10 ball</b>\n\n` +
      `Har safar turli fanlardan tasodifiy savollar taqdim etiladi.`;

    await ctx.reply(infoText, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🚀 TESTNI BOSHLASH', `start_attempt_${attempt._id}`)]
      ])
    });
  } catch (err) {
    console.error('[Random Test Error]:', err.message);
    ctx.reply('Random test yuklashda xatolik yuz berdi.');
  }
}

module.exports = {
  handleDailyChallenge,
  handleRandomTest
};
