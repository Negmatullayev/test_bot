const Result = require('../models/Result');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { exportToExcel, exportToCsv } = require('../services/exportService');
const { generateCertificatePdf } = require('../services/certificateService');

// @desc    Get all results with pagination & filters
// @route   GET /api/results
// @access  Admin / Public (own results)
exports.getResults = async (req, res, next) => {
  try {
    const { userId, testId, passed, page = 1, limit = 20 } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (testId) query.testId = testId;
    if (typeof passed !== 'undefined') query.passed = passed === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Result.countDocuments(query);
    const results = await Result.find(query)
      .populate('userId', 'firstName lastName username telegramId')
      .populate('testId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single result details (with questions and mistakes analysis)
// @route   GET /api/results/:id
// @access  Admin / User
exports.getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('userId', 'firstName lastName username telegramId')
      .populate('testId', 'title');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Natija topilmadi' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Export results to Excel or CSV
// @route   GET /api/results/export/:format
// @access  Admin
exports.exportResults = async (req, res, next) => {
  try {
    const { format } = req.params; // 'excel' or 'csv'
    const results = await Result.find()
      .populate('userId', 'firstName lastName username telegramId')
      .sort({ createdAt: -1 })
      .limit(1000);

    const flatData = results.map((r) => ({
      ID: r._id.toString(),
      Foydalanuvchi: r.userId ? `${r.userId.firstName} ${r.userId.lastName}`.trim() : 'Noma’lum',
      Username: r.userId ? r.userId.username || '' : '',
      TelegramID: r.telegramId,
      Test: r.testTitle,
      Fan: r.subjectTitle,
      SavollarSoni: r.totalQuestions,
      TogriJavoblar: r.correctCount,
      NotogriJavoblar: r.wrongCount,
      Foiz: `${r.percentage}%`,
      Ball: `${r.score}/${r.totalPossibleScore}`,
      VaqtSekund: r.timeSpentSeconds,
      Holat: r.passed ? 'O‘tdi' : 'O‘tmadi',
      Sana: new Date(r.createdAt).toISOString()
    }));

    if (format === 'csv') {
      const csvData = exportToCsv(flatData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="natijalar.csv"');
      return res.send(csvData);
    } else {
      const excelBuffer = exportToExcel(flatData, 'Natijalar');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="natijalar.xlsx"');
      return res.send(excelBuffer);
    }
  } catch (err) {
    next(err);
  }
};
