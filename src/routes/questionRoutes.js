const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionImage,
  bulkImportQuestions
} = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/', protect, adminOnly, createQuestion);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);

router.post(
  '/upload-image',
  protect,
  adminOnly,
  upload.single('image'),
  uploadQuestionImage
);

router.post(
  '/bulk-import',
  protect,
  adminOnly,
  upload.single('file'),
  bulkImportQuestions
);

module.exports = router;
