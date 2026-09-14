const xlsx = require('xlsx');

/**
 * Validate and parse bulk questions from JSON or Excel Buffer
 */
function parseAndValidateQuestions(dataInput, isBuffer = false) {
  let rawList = [];
  const errors = [];
  const validQuestions = [];

  try {
    if (isBuffer) {
      const workbook = xlsx.read(dataInput, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rawList = xlsx.utils.sheet_to_json(sheet);
    } else if (typeof dataInput === 'string') {
      rawList = JSON.parse(dataInput);
    } else if (Array.isArray(dataInput)) {
      rawList = dataInput;
    }
  } catch (err) {
    return {
      success: false,
      message: `Faylni o'qishda xatolik: ${err.message}`,
      errors: ['Fayl formati noto‘g‘ri (JSON yoki Excel kutilyapti)'],
      validQuestions: []
    };
  }

  if (!Array.isArray(rawList) || rawList.length === 0) {
    return {
      success: false,
      message: "Faylda savollar topilmadi yoki bo'sh",
      errors: ["Savollar ro'yxati bo'sh"],
      validQuestions: []
    };
  }

  rawList.forEach((item, idx) => {
    const rowNum = idx + 1;
    const questionText = item.questionText || item.question || item['Savol'];
    const optA = item.optionA || item.A || item['Variant A'] || item.a;
    const optB = item.optionB || item.B || item['Variant B'] || item.b;
    const optC = item.optionC || item.C || item['Variant C'] || item.c;
    const optD = item.optionD || item.D || item['Variant D'] || item.d;
    let correct = item.correctAnswer || item.correct || item['To‘g‘ri javob'] || item.ans;
    const explanation = item.explanation || item.izoh || item['Izoh'] || '';
    const difficulty = (item.difficulty || item.daraja || 'medium').toString().toLowerCase();

    if (!questionText || questionText.toString().trim() === '') {
      errors.push(`${rowNum}-qator xato: Savol matni yo'q`);
      return;
    }

    if (!optA || !optB) {
      errors.push(`${rowNum}-qator xato: Kamida A va B variantlar bo'lishi shart`);
      return;
    }

    if (!correct) {
      errors.push(`${rowNum}-qator xato: To‘g‘ri javob ko‘rsatilmagan`);
      return;
    }

    correct = correct.toString().trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      errors.push(`${rowNum}-qator xato: To‘g‘ri javob A, B, C yoki D bo'lishi kerak (Kiritilgan: ${correct})`);
      return;
    }

    const options = [
      { key: 'A', text: optA.toString().trim() },
      { key: 'B', text: optB.toString().trim() }
    ];

    if (optC) options.push({ key: 'C', text: optC.toString().trim() });
    if (optD) options.push({ key: 'D', text: optD.toString().trim() });

    validQuestions.push({
      questionText: questionText.toString().trim(),
      options,
      correctAnswer: correct,
      explanation: explanation.toString().trim(),
      difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
      points: Number(item.points || item.ball || 1)
    });
  });

  return {
    success: errors.length === 0,
    totalCount: rawList.length,
    validCount: validQuestions.length,
    errorsCount: errors.length,
    errors,
    validQuestions
  };
}

/**
 * Export results or users to Excel buffer
 */
function exportToExcel(data, sheetName = 'Sheet1') {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Export to CSV buffer
 */
function exportToCsv(data) {
  const worksheet = xlsx.utils.json_to_sheet(data);
  return xlsx.utils.sheet_to_csv(worksheet);
}

module.exports = {
  parseAndValidateQuestions,
  exportToExcel,
  exportToCsv
};
