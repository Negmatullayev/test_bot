const express = require('express');
const router = express.Router();
const {
  getResults,
  getResultById,
  exportResults
} = require('../controllers/resultController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/export/:format', protect, adminOnly, exportResults);
router.get('/', protect, getResults);
router.get('/:id', protect, getResultById);

module.exports = router;
