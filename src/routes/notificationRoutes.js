const express = require('express');
const router = express.Router();
const {
  getNotifications,
  sendNotification
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getNotifications);
router.post('/', protect, adminOnly, sendNotification);

module.exports = router;
