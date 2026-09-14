const Test = require('../models/Test');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Result = require('../models/Result');

// @desc    Get all tests with filter & pagination
// @route   GET /api/tests
// @access  Public / Admin
exports.getTests = async (req, res, next) => {
  try {
    const { subjectId, categoryId, difficulty, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (subjectId) query.subjectId = subjectId;
    if (categoryId) query.categoryId = categoryId;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (typeof isActive !== 'undefined') query.isActive = isActive === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Test.countDocuments(query);
    const tests = await Test.find(query)
      .populate('subjectId', 'name icon')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Attach actual question counts
    const testIds = tests.map((t) => t._id);
    const questionCounts = await Question.aggregate([
      { $match: { testId: { $in: testIds } } },
      { $group: { _id: '$testId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    questionCounts.forEach((qc) => {
      countMap[qc._id.toString()] = qc.count;
    });

    const enhancedTests = tests.map((t) => {
      const doc = t.toObject();
      doc.actualQuestionCount = countMap[t._id.toString()] || 0;
      return doc;
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: enhancedTests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single test by ID
// @route   GET /api/tests/:id
// @access  Public / Admin
exports.getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('subjectId', 'name icon')
      .populate('categoryId', 'name');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test topilmadi' });
    }

    const questionCount = await Question.countDocuments({ testId: test._id });

    res.json({
      success: true,
      data: {
        ...test.toObject(),
        actualQuestionCount: questionCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create test
// @route   POST /api/tests
// @access  Admin
exports.createTest = async (req, res, next) => {
  try {
    const {
      title,
      subjectId,
      categoryId,
      topic,
      description,
      durationMinutes,
      totalQuestions,
      pointsPerQuestion,
      passingPercentage,
      difficulty,
      isActive,
      maxAttempts,
      isAntiCheatEnabled,
      startDate,
      endDate
    } = req.body;

    const test = await Test.create({
      title,
      subjectId,
      categoryId: categoryId || null,
      topic,
      description,
      durationMinutes: durationMinutes || 15,
      totalQuestions: totalQuestions || 20,
      pointsPerQuestion: pointsPerQuestion || 1,
      passingPercentage: passingPercentage || 60,
      difficulty: difficulty || 'medium',
      isActive: typeof isActive !== 'undefined' ? isActive : true,
      maxAttempts: maxAttempts || 0,
      isAntiCheatEnabled: typeof isAntiCheatEnabled !== 'undefined' ? isAntiCheatEnabled : true,
      startDate: startDate || null,
      endDate: endDate || null,
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Admin
exports.updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test topilmadi' });
    }

    res.json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Admin
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test topilmadi' });
    }

    // Delete related questions
    await Question.deleteMany({ testId: test._id });
    await test.deleteOne();

    res.json({ success: true, message: 'Test va barcha savollari o‘chirildi' });
  } catch (err) {
    next(err);
  }
};
