const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getCategoriesBySubject,
  createCategory,
  deleteCategory
} = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSubjects);
router.post('/', protect, adminOnly, createSubject);
router.put('/:id', protect, adminOnly, updateSubject);
router.delete('/:id', protect, adminOnly, deleteSubject);

router.get('/:id/categories', getCategoriesBySubject);
router.post('/categories', protect, adminOnly, createCategory);
router.delete('/categories/:id', protect, adminOnly, deleteCategory);

module.exports = router;
