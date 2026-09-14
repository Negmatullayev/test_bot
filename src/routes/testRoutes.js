const express = require('express');
const router = express.Router();
const {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest
} = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getTests);
router.get('/:id', getTestById);
router.post('/', protect, adminOnly, createTest);
router.put('/:id', protect, adminOnly, updateTest);
router.delete('/:id', protect, adminOnly, deleteTest);

module.exports = router;
