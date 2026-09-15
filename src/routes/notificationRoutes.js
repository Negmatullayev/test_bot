const express = require('express');
const router = express.Router();
const {
  getNotifications,
  sendNotification,
  deleteNotification
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getNotifications);
router.post('/', protect, adminOnly, sendNotification);
router.delete('/:id', protect, adminOnly, deleteNotification);

module.exports = router;
