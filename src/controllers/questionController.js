const fs = require('fs');
const Question = require('../models/Question');
const Test = require('../models/Test');
const { parseAndValidateQuestions } = require('../services/exportService');

// @desc    Get questions with filters & pagination
// @route   GET /api/questions
// @access  Public / Admin
exports.getQuestions = async (req, res, next) => {
  try {
    const { testId, subjectId, difficulty, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (testId) query.testId = testId;
    if (subjectId) query.subjectId = subjectId;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (search) query.questionText = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('subjectId', 'name icon')
      .populate('testId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: questions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Public / Admin
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('subjectId', 'name icon')
      .populate('testId', 'title');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Savol topilmadi' });
    }

    res.json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Admin
exports.createQuestion = async (req, res, next) => {
  try {
    const {
      testId,
      subjectId,
      categoryId,
      questionText,
      options,
      correctAnswer,
      explanation,
      imageUrl,
      difficulty,
      points
    } = req.body;

    const question = await Question.create({
      testId: testId || null,
      subjectId,
      categoryId: categoryId || null,
      questionText,
      options,
      correctAnswer: correctAnswer.toUpperCase(),
      explanation: explanation || '',
      imageUrl: imageUrl || '',
      difficulty: difficulty || 'medium',
      points: Number(points) || 1
    });

    res.status(201).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    if (req.body.correctAnswer) {
      req.body.correctAnswer = req.body.correctAnswer.toUpperCase();
    }

    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Savol topilmadi' });
    }

    res.json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Savol topilmadi' });
    }

    await question.deleteOne();
    res.json({ success: true, message: 'Savol o‘chirildi' });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload question image
// @route   POST /api/questions/upload-image
// @access  Admin
exports.uploadQuestionImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Rasm fayli yuklanmadi' });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk validate / import questions from Excel or JSON
// @route   POST /api/questions/bulk-import
// @access  Admin
exports.bulkImportQuestions = async (req, res, next) => {
  try {
    const { testId, subjectId, dryRun = 'false' } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Fan tanlanishi shart' });
    }

    let validationResult;

    if (req.file) {
      const isExcel = req.file.originalname.match(/\.(xlsx|xls|csv)$/i);
      const buffer = fs.readFileSync(req.file.path);
      validationResult = parseAndValidateQuestions(buffer, isExcel);
      // Clean up uploaded temp file
      fs.unlinkSync(req.file.path);
    } else if (req.body.questions) {
      validationResult = parseAndValidateQuestions(req.body.questions, false);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Fayl (Excel/CSV/JSON) yoki savollar ro‘yxati yuborilishi kerak'
      });
    }

    // If dryRun is true, only return preview & errors
    if (dryRun === 'true' || dryRun === true) {
      return res.json({
        success: true,
        dryRun: true,
        validation: validationResult
      });
    }

    if (validationResult.validQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bazada saqlash uchun yaroqli savollar topilmadi',
        errors: validationResult.errors
      });
    }

    // Insert valid questions
    const docsToInsert = validationResult.validQuestions.map((q) => ({
      ...q,
      testId: testId || null,
      subjectId
    }));

    const inserted = await Question.insertMany(docsToInsert);

    res.status(201).json({
      success: true,
      message: `${inserted.length} ta savol muvaffaqiyatli yuklandi`,
      insertedCount: inserted.length,
      errorsCount: validationResult.errorsCount,
      errors: validationResult.errors
    });
  } catch (err) {
    next(err);
  }
};
