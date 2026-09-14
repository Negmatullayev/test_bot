const Subject = require('../models/Subject');
const Category = require('../models/Category');
const Test = require('../models/Test');
const Question = require('../models/Question');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Admin
exports.createSubject = async (req, res, next) => {
  try {
    const { name, icon, description, order } = req.body;
    const subject = await Subject.create({ name, icon, description, order });
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Admin
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Fan topilmadi' });
    }
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Fan topilmadi' });
    }

    // Cascade delete categories, tests, and questions related to this subject
    await Category.deleteMany({ subjectId: subject._id });
    await Test.deleteMany({ subjectId: subject._id });
    await Question.deleteMany({ subjectId: subject._id });
    await subject.deleteOne();

    res.json({ success: true, message: 'Fan va unga tegishli ma’lumotlar o‘chirildi' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get categories for a subject
// @route   GET /api/subjects/:id/categories
// @access  Public
exports.getCategoriesBySubject = async (req, res, next) => {
  try {
    const categories = await Category.find({ subjectId: req.params.id }).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// @desc    Create category
// @route   POST /api/subjects/categories
// @access  Admin
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/subjects/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    }
    await category.deleteOne();
    res.json({ success: true, message: 'Kategoriya o‘chirildi' });
  } catch (err) {
    next(err);
  }
};
