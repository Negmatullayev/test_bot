const { Markup } = require('telegraf');

/**
 * Inline keyboard for question options and navigation
 */
function getQuestionInlineKeyboard(attemptId, currentIndex, totalQuestions, selectedAnswer = null, options = []) {
  const optionButtons = [];

  // Create option buttons (A, B, C, D)
  const optRow1 = [];
  const optRow2 = [];

  options.forEach((opt, idx) => {
    const isSelected = selectedAnswer === opt.key;
    const label = `${isSelected ? '✅ ' : ''}${opt.key}`;
    const btn = Markup.button.callback(
      label,
      `ans_${attemptId}_${currentIndex}_${opt.key}`
    );

    if (idx < 2) {
      optRow1.push(btn);
    } else {
      optRow2.push(btn);
    }
  });

  if (optRow1.length > 0) optionButtons.push(optRow1);
  if (optRow2.length > 0) optionButtons.push(optRow2);

  // Navigation row
  const navRow = [];
  if (currentIndex > 0) {
    navRow.push(Markup.button.callback('⬅️ Oldingi', `nav_${attemptId}_${currentIndex - 1}`));
  }
  if (currentIndex < totalQuestions - 1) {
    navRow.push(Markup.button.callback('➡️ Keyingi', `nav_${attemptId}_${currentIndex + 1}`));
  }

  // Action row
  const actionRow = [
    Markup.button.callback('🏁 Testni yakunlash', `finish_${attemptId}`)
  ];

  const allRows = [...optionButtons];
  if (navRow.length > 0) allRows.push(navRow);
  allRows.push(actionRow);

  return Markup.inlineKeyboard(allRows);
}

/**
 * Result inline buttons (Xatolar tahlili, Sertifikat)
 */
function getResultInlineKeyboard(resultId, passed, hasCertificate) {
  const buttons = [
    [Markup.button.callback('🔎 Xatolarim', `mistakes_${resultId}`)]
  ];

  if (passed) {
    buttons.push([Markup.button.callback('🏆 Sertifikat olish', `getcert_${resultId}`)]);
  }

  return Markup.inlineKeyboard(buttons);
}

module.exports = {
  getQuestionInlineKeyboard,
  getResultInlineKeyboard
};
