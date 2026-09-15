const { Markup } = require('telegraf');
const path = require('path');
const fs = require('fs');
const Subject = require('../../models/Subject');
const Test = require('../../models/Test');
const Question = require('../../models/Question');
const Attempt = require('../../models/Attempt');
const Result = require('../../models/Result');
const Certificate = require('../../models/Certificate');
const { getQuestionInlineKeyboard, getResultInlineKeyboard } = require('../keyboards/testKeyboard');
const { processTestResult } = require('../../services/scoringService');
const { generateCertificatePdf } = require('../../services/certificateService');

/**
 * Array shuffle helper
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.floor(Math.max(0, seconds) % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * 1. User clicks "📝 Test ishlash"
 */
async function handleStartTestFlow(ctx) {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ order: 1 });

    if (subjects.length === 0) {
      return ctx.reply('Hozircha faol fanlar mavjud emas.');
    }

    const buttons = subjects.map((sub) => [
      Markup.button.callback(`${sub.icon} ${sub.name}`, `tsub_${sub._id}`)
    ]);

    await ctx.reply(
      '📚 <b>Qaysi fan bo‘yicha test topshirmoqchisiz?</b>\n\nFanni tanlang:',
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(buttons)
      }
    );
  } catch (err) {
    console.error('[Start Test Flow Error]:', err.message);
    ctx.reply('Fanlarni yuklashda xatolik yuz berdi.');
  }
}

/**
 * 2. User selects Subject -> List tests for this subject
 */
async function handleSelectSubject(ctx, subjectId) {
  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) return ctx.reply('Fan topilmadi.');

    const tests = await Test.find({ subjectId, isActive: true }).sort({ createdAt: -1 });

    if (tests.length === 0) {
      return ctx.reply(
        `📚 <b>${subject.name}</b> bo‘yicha hozircha faol testlar mavjud emas.`,
        { parse_mode: 'HTML' }
      );
    }

    const buttons = tests.map((t) => {
      const diffIcon = t.difficulty === 'easy' ? '🟢' : t.difficulty === 'hard' ? '🔴' : '🟡';
      return [Markup.button.callback(`${diffIcon} ${t.title}`, `test_preview_${t._id}`)];
    });

    await ctx.reply(
      `📚 <b>${subject.name}</b> fani bo‘yicha mavjud testlar:\n\nTestni tanlang:`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(buttons)
      }
    );
  } catch (err) {
    console.error('[Select Subject Error]:', err.message);
    ctx.reply('Testlarni yuklashda xatolik.');
  }
}

/**
 * 3. Show Test Preview Info
 */
async function handleTestPreview(ctx, testId) {
  try {
    const test = await Test.findById(testId).populate('subjectId', 'name icon');
    if (!test) return ctx.reply('Test topilmadi.');

    const questionCount = await Question.countDocuments({ testId: test._id, isActive: true });

    if (questionCount === 0) {
      return ctx.reply('Bu test uchun savollar hali kiritilmagan.');
    }

    // Check user attempt limit
    if (test.maxAttempts > 0 && ctx.dbUser) {
      const userAttemptsCount = await Result.countDocuments({
        userId: ctx.dbUser._id,
        testId: test._id
      });

      if (userAttemptsCount >= test.maxAttempts) {
        return ctx.reply(
          `⚠️ Siz bu testni maksimal ruxsat berilgan <b>${test.maxAttempts}</b> marta topshirib bo‘lgansiz!`,
          { parse_mode: 'HTML' }
        );
      }
    }

    const diffLabel =
      test.difficulty === 'easy' ? '🟢 Oson' : test.difficulty === 'hard' ? '🔴 Qiyin' : '🟡 O‘rtacha';

    const text = `📝 <b>${test.title}</b>\n\n` +
      `📚 Fan: <b>${test.subjectId ? test.subjectId.name : ''}</b>\n` +
      (test.topic ? `📌 Mavzu: <b>${test.topic}</b>\n` : '') +
      `❓ Savollar soni: <b>${questionCount} ta</b>\n` +
      `⏱ Vaqt: <b>${test.durationMinutes} daqiqa</b>\n` +
      `⭐ Har bir savol: <b>${test.pointsPerQuestion * 10} ball</b>\n` +
      `📊 Qiyinchilik: <b>${diffLabel}</b>\n` +
      `🎯 O‘tish bali: <b>${test.passingPercentage}%</b>\n` +
      (test.description ? `\n💡 <i>${test.description}</i>\n` : '');

    const buttons = [
      [Markup.button.callback('🚀 TESTNI BOSHLASH', `init_test_${test._id}`)]
    ];

    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons)
    });
  } catch (err) {
    console.error('[Test Preview Error]:', err.message);
    ctx.reply('Test ma’lumotlarini yuklashda xatolik.');
  }
}

/**
 * 4. Initialize Test Attempt & Start
 */
async function handleInitTest(ctx, testId) {
  try {
    if (!ctx.dbUser) return;

    const test = await Test.findById(testId).populate('subjectId', 'name');
    if (!test) return ctx.reply('Test topilmadi.');

    let rawQuestions = await Question.find({ testId: test._id, isActive: true });
    if (rawQuestions.length === 0) {
      return ctx.reply('Bu testda savollar mavjud emas.');
    }

    // Anti-cheat: shuffle questions
    if (test.isAntiCheatEnabled) {
      rawQuestions = shuffleArray(rawQuestions);
    }

    // Limit to test totalQuestions if specified
    if (test.totalQuestions && test.totalQuestions < rawQuestions.length) {
      rawQuestions = rawQuestions.slice(0, test.totalQuestions);
    }

    // Prepare questions with anti-cheat shuffled options if enabled
    const preparedQuestions = rawQuestions.map((q) => {
      let optionsList = q.options.map((o) => ({ key: o.key, text: o.text }));

      if (test.isAntiCheatEnabled) {
        const correctOptObj = optionsList.find((o) => o.key === q.correctAnswer);
        const correctText = correctOptObj ? correctOptObj.text : '';

        const shuffledOptions = shuffleArray(optionsList);
        const reKeyedOptions = shuffledOptions.map((opt, idx) => {
          const keys = ['A', 'B', 'C', 'D'];
          return {
            key: keys[idx],
            text: opt.text
          };
        });

        const newCorrectOpt = reKeyedOptions.find((o) => o.text === correctText);
        const newCorrectKey = newCorrectOpt ? newCorrectOpt.key : q.correctAnswer;

        return {
          questionId: q._id,
          questionText: q.questionText,
          imageUrl: q.imageUrl || '',
          options: reKeyedOptions,
          correctAnswer: newCorrectKey,
          explanation: q.explanation || '',
          points: q.points || test.pointsPerQuestion || 1
        };
      }

      return {
        questionId: q._id,
        questionText: q.questionText,
        imageUrl: q.imageUrl || '',
        options: optionsList,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || test.pointsPerQuestion || 1
      };
    });

    const expiresAt = new Date(Date.now() + test.durationMinutes * 60 * 1000);

    const attempt = await Attempt.create({
      userId: ctx.dbUser._id,
      telegramId: ctx.dbUser.telegramId,
      testId: test._id,
      isDailyChallenge: false,
      isRandomTest: false,
      subjectTitle: test.subjectId ? test.subjectId.name : '',
      testTitle: test.title,
      questions: preparedQuestions,
      answers: {},
      currentQuestionIndex: 0,
      durationMinutes: test.durationMinutes,
      expiresAt
    });

    await renderQuestion(ctx, attempt, 0);
  } catch (err) {
    console.error('[Init Test Error]:', err.message);
    ctx.reply('Testni boshlashda xatolik.');
  }
}

/**
 * 5. Render Question Card
 */
async function renderQuestion(ctx, attempt, questionIndex) {
  try {
    // Check if expired
    const now = new Date();
    if (now > attempt.expiresAt) {
      return finishAttempt(ctx, attempt._id, true);
    }

    const totalQ = attempt.questions.length;
    questionIndex = Math.max(0, Math.min(Number(questionIndex) || 0, totalQ - 1));
    const currentQ = attempt.questions[questionIndex];

    if (!currentQ) {
      return finishAttempt(ctx, attempt._id, false);
    }

    attempt.currentQuestionIndex = questionIndex;
    await attempt.save();

    const remainingSec = Math.max(0, Math.floor((attempt.expiresAt - now) / 1000));
    const selectedAns = attempt.answers ? attempt.answers.get(currentQ.questionId ? currentQ.questionId.toString() : questionIndex.toString()) : null;

    let text = `━━━━━━━━━━━━━━━━\n`;
    text += `📝 <b>SAVOL ${questionIndex + 1}/${totalQ}</b>\n`;
    text += `⏱ Qolgan vaqt: <b>${formatTime(remainingSec)}</b>\n\n`;
    text += `<b>${currentQ.questionText}</b>\n\n`;

    currentQ.options.forEach((opt) => {
      const isSelected = selectedAns === opt.key;
      text += `${isSelected ? '👉 ' : ''}<b>${opt.key})</b> ${opt.text}${isSelected ? ' ✅' : ''}\n`;
    });

    text += `━━━━━━━━━━━━━━━━`;

    const keyboard = getQuestionInlineKeyboard(
      attempt._id,
      questionIndex,
      totalQ,
      selectedAns,
      currentQ.options
    );

    // If callback query, edit message
    if (ctx.callbackQuery) {
      try {
        await ctx.editMessageText(text, {
          parse_mode: 'HTML',
          ...keyboard
        });
      } catch (e) {
        // Telegram may reject an edit when the callback is stale or unchanged.
        if (!String(e.message || '').toLowerCase().includes('message is not modified')) {
          await ctx.reply(text, {
            parse_mode: 'HTML',
            ...keyboard
          });
        }
      }
    } else {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        ...keyboard
      });
    }
  } catch (err) {
    console.error('[Render Question Error]:', err.message);
    ctx.reply('Savolni chiqarishda xatolik yuz berdi.');
  }
}

/**
 * 6. User picks an answer option
 */
async function handleAnswerOption(ctx, attemptId, qIndex, optionKey) {
  try {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt || attempt.isCompleted) {
      return ctx.answerCbQuery('Bu test allaqachon yakunlangan');
    }

    const now = new Date();
    if (now > attempt.expiresAt) {
      await ctx.answerCbQuery('Test vaqti tugadi!');
      return finishAttempt(ctx, attemptId, true);
    }

    const question = attempt.questions[Number(qIndex)];
    if (!question) return ctx.answerCbQuery('Savol topilmadi. Testni qayta boshlang.');

    if (!question.options.some((option) => option.key === optionKey)) {
      return ctx.answerCbQuery('Bu variant mavjud emas.');
    }

    const qKey = question.questionId ? question.questionId.toString() : qIndex.toString();
    attempt.answers.set(qKey, optionKey);
    await attempt.save();

    await ctx.answerCbQuery(`Variant [${optionKey}] tanlandi`);

    // If not last question, move automatically to next question
    const nextIndex = Number(qIndex) + 1;
    if (nextIndex < attempt.questions.length) {
      await renderQuestion(ctx, attempt, nextIndex);
    } else {
      // Re-render current question with selected mark
      await renderQuestion(ctx, attempt, Number(qIndex));
    }
  } catch (err) {
    console.error('[Handle Answer Error]:', err.message);
  }
}

/**
 * 7. Navigation (Oldingi / Keyingi)
 */
async function handleNavigation(ctx, attemptId, targetIndex) {
  try {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt || attempt.isCompleted) {
      return ctx.answerCbQuery('Bu test allaqachon yakunlangan');
    }

    const now = new Date();
    if (now > attempt.expiresAt) {
      await ctx.answerCbQuery('Test vaqti tugadi!');
      return finishAttempt(ctx, attemptId, true);
    }

    await ctx.answerCbQuery();
    await renderQuestion(ctx, attempt, Number(targetIndex));
  } catch (err) {
    console.error('[Navigation Error]:', err.message);
  }
}

/**
 * 8. Finish Test and calculate results
 */
async function finishAttempt(ctx, attemptId, isExpired = false) {
  try {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt || attempt.isCompleted) {
      return ctx.reply ? ctx.reply('Test allaqachon yakunlangan.') : null;
    }

    attempt.isCompleted = true;
    await attempt.save();

    const timeSpentSeconds = Math.round((Date.now() - new Date(attempt.startTime).getTime()) / 1000);

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const answersDetails = attempt.questions.map((q, idx) => {
      const qKey = q.questionId ? q.questionId.toString() : idx.toString();
      const selectedKey = attempt.answers ? attempt.answers.get(qKey) : null;
      const isCorrect = selectedKey === q.correctAnswer;

      if (!selectedKey) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      const selectedOptObj = q.options.find((o) => o.key === selectedKey);
      const correctOptObj = q.options.find((o) => o.key === q.correctAnswer);

      return {
        questionId: q.questionId,
        questionText: q.questionText,
        selectedOption: selectedKey || "Tanlanmagan",
        selectedText: selectedOptObj ? selectedOptObj.text : "Javob berilmadi",
        correctOption: q.correctAnswer,
        correctText: correctOptObj ? correctOptObj.text : '',
        isCorrect: !!isCorrect,
        explanation: q.explanation || ''
      };
    });

    const totalQuestions = attempt.questions.length;
    const {
      score,
      totalPossibleScore,
      percentage,
      evaluationBadge,
      newLevel,
      newLevelName,
      newAchievements
    } = await processTestResult(attempt.userId, {
      correctCount,
      wrongCount,
      totalQuestions,
      timeSpentSeconds,
      durationMinutes: attempt.durationMinutes,
      isDailyChallenge: attempt.isDailyChallenge,
      subjectTitle: attempt.subjectTitle
    });

    const passed = percentage >= 60;
    const qualifiesForCertificate = percentage >= 80;

    const resultDoc = await Result.create({
      userId: attempt.userId,
      telegramId: attempt.telegramId,
      testId: attempt.testId,
      testTitle: attempt.testTitle,
      subjectTitle: attempt.subjectTitle,
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage,
      score,
      totalPossibleScore,
      timeSpentSeconds,
      evaluationBadge,
      passed,
      answersDetails
    });

    // Evaluation text & icon
    let evalText = `🏆 A'lo`;
    if (evaluationBadge === 'Juda yaxshi') evalText = `🔥 Juda yaxshi`;
    if (evaluationBadge === 'Yaxshi') evalText = `👍 Yaxshi`;
    if (evaluationBadge === "Ko'proq mashq qiling") evalText = `📚 Ko‘proq mashq qiling`;

    let summaryText = `🏁 <b>TEST YAKUNLANDI</b>\n`;
    if (isExpired) {
      summaryText += `⏱ <i>Belgilangan vaqt tugadi!</i>\n`;
    }
    summaryText += `━━━━━━━━━━━━━━━━\n`;
    summaryText += `📋 Test: <b>${attempt.testTitle}</b>\n\n`;
    summaryText += `📊 <b>Natijangiz:</b>\n`;
    summaryText += `❓ Jami savollar: <b>${totalQuestions}</b>\n`;
    summaryText += `✅ To‘g‘ri javoblar: <b>${correctCount}</b>\n`;
    summaryText += `❌ Noto‘g‘ri javoblar: <b>${wrongCount}</b>\n`;
    summaryText += `⚪ Javobsiz: <b>${unansweredCount}</b>\n`;
    summaryText += `📈 Foiz: <b>${percentage}%</b>\n`;
    summaryText += `⭐ To‘plangan ball: <b>${score}/${totalPossibleScore}</b>\n`;
    summaryText += `⏱ Sarflangan vaqt: <b>${formatTime(timeSpentSeconds)}</b>\n\n`;
    summaryText += `Baholash: <b>${evalText}</b>\n`;
    summaryText += `━━━━━━━━━━━━━━━━\n`;

    if (newAchievements && newAchievements.length > 0) {
      summaryText += `\n🎖 <b>Yangi yutuqlar:</b>\n`;
      newAchievements.forEach((a) => {
        summaryText += `${a.icon} <b>${a.title}</b> — ${a.description}\n`;
      });
    }

    if (qualifiesForCertificate) {
      summaryText += `\n🎉 <i>Tabriklaymiz! Siz 80% dan yuqori ball to‘pladingiz va sertifikat olish imkoniyatiga ega bo‘ldingiz!</i>`;
    }

    const keyboard = getResultInlineKeyboard(
      resultDoc._id,
      qualifiesForCertificate,
      false
    );

    if (ctx.callbackQuery) {
      await ctx.editMessageText(summaryText, {
        parse_mode: 'HTML',
        ...keyboard
      });
    } else {
      await ctx.reply(summaryText, {
        parse_mode: 'HTML',
        ...keyboard
      });
    }
  } catch (err) {
    console.error('[Finish Attempt Error]:', err.message);
  }
}

/**
 * 9. Review Mistakes Handler ("🔎 Xatolarim")
 */
async function handleMistakesReview(ctx, resultId) {
  try {
    const result = await Result.findById(resultId);
    if (!result) return ctx.reply('Natija topilmadi.');

    const wrongAnswers = result.answersDetails.filter((a) => !a.isCorrect);

    if (wrongAnswers.length === 0) {
      return ctx.reply(
        '🎉 <b>Ajoyib!</b> Siz bu testda birorta ham xatoga yo‘l qo‘ymagansiz! (100% to‘g‘ri)',
        { parse_mode: 'HTML' }
      );
    }

    let text = `🔎 <b>XATOLAR TAHLILI (${wrongAnswers.length} ta xato):</b>\n\n`;

    wrongAnswers.forEach((ans, idx) => {
      text += `━━━━━━━━━━━━━━━━\n`;
      text += `❌ <b>SAVOL ${idx + 1}:</b> ${ans.questionText}\n\n`;
      text += `Sizning javobingiz:\n`;
      text += `<b>${ans.selectedOption})</b> ${ans.selectedText}\n\n`;
      text += `To‘g‘ri javob:\n`;
      text += `✅ <b>${ans.correctOption})</b> ${ans.correctText}\n`;
      if (ans.explanation) {
        text += `\n💡 <b>Izoh:</b> <i>${ans.explanation}</i>\n`;
      }
    });

    text += `━━━━━━━━━━━━━━━━`;

    await ctx.reply(text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('[Mistakes Review Error]:', err.message);
    ctx.reply('Xatolarni yuklashda muammo yuz berdi.');
  }
}

/**
 * 10. Generate & Send Certificate ("🏆 Sertifikat olish")
 */
async function handleGetCertificate(ctx, resultId) {
  try {
    const result = await Result.findById(resultId).populate('userId');
    if (!result) return ctx.reply('Natija topilmadi.');

    if (result.percentage < 80) {
      return ctx.reply('Sertifikat olish uchun kamida 80% natija kerak.');
    }

    await ctx.reply('⏳ Sertifikatingiz tayyorlanmoqda, iltimos kuting...');

    const user = result.userId;
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'O‘quvchi';

    let cert = await Certificate.findOne({ resultId: result._id });

    if (!cert) {
      const certNumber = 'CERT-' + Date.now().toString().slice(-8);
      const appUrl = (process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'https://test-bot-vcjo.onrender.com').replace(/\/$/, '');
      const verifyUrl = `${appUrl}/api/certificates/verify/${certNumber}`;
      const filePath = await generateCertificatePdf({
        certificateNumber: certNumber,
        userName,
        testTitle: result.testTitle,
        subjectTitle: result.subjectTitle || 'Bilim Sinovi',
        percentage: result.percentage,
        issueDate: result.createdAt,
        verifyUrl
      });

      cert = await Certificate.create({
        certificateNumber: certNumber,
        userId: user._id,
        telegramId: result.telegramId,
        userName,
        testId: result.testId,
        resultId: result._id,
        testTitle: result.testTitle,
        subjectTitle: result.subjectTitle,
        percentage: result.percentage,
        score: result.score,
        qrCodeData: verifyUrl,
        pdfFilePath: filePath
      });

      result.certificateGenerated = true;
      await result.save();
    }

    // Send PDF document to Telegram
    const caption = `🎓 <b>Tabriklaymiz, ${userName}!</b>\n\n` +
      `Siz <b>"${result.testTitle}"</b> testidan <b>${result.percentage}%</b> natija bilan sertifikatni qo‘lga kiritdingiz!\n\n` +
      `🆔 Sertifikat raqami: <code>${cert.certificateNumber}</code>`;

    await ctx.replyWithDocument(
      { source: cert.pdfFilePath },
      {
        caption,
        parse_mode: 'HTML'
      }
    );
  } catch (err) {
    console.error('[Get Certificate Error]:', err.message);
    ctx.reply('Sertifikatni generatsiya qilishda xatolik yuz berdi.');
  }
}

module.exports = {
  handleStartTestFlow,
  handleSelectSubject,
  handleTestPreview,
  handleInitTest,
  renderQuestion,
  handleAnswerOption,
  handleNavigation,
  finishAttempt,
  handleMistakesReview,
  handleGetCertificate
};
