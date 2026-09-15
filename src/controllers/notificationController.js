const Notification = require('../models/Notification');
const User = require('../models/User');
const { broadcastMessage, sendTelegramMessage } = require('../services/botService');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Admin
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('sentBy', 'username firstName')
      .populate('specificUserId', 'firstName lastName telegramId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Send broadcast notification to users
// @route   POST /api/notifications
// @access  Admin
exports.sendNotification = async (req, res, next) => {
  try {
    const { title, message, targetType = 'all', specificUserId } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Sarlavha va xabar matnini kiriting'
      });
    }

    let targetUsers = [];

    if (targetType === 'specific_user' && specificUserId) {
      const user = await User.findById(specificUserId);
      if (user && user.telegramId) {
        targetUsers = [user];
      }
    } else if (targetType === 'active_users') {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      targetUsers = await User.find({
        role: 'user',
        isBlocked: false,
        lastActive: { $gte: threeDaysAgo },
        telegramId: { $ne: null }
      });
    } else {
      // All active users
      targetUsers = await User.find({
        role: 'user',
        isBlocked: false,
        telegramId: { $ne: null }
      });
    }

    const formattedText = `📢 <b>${title}</b>\n\n${message}\n\n🤖 <i>Telegram Quiz Bot</i>`;

    const broadcastResult = await broadcastMessage(targetUsers, formattedText);

    const notificationDoc = await Notification.create({
      title,
      message,
      targetType,
      specificUserId: specificUserId || null,
      sentCount: broadcastResult.sentCount,
      failedCount: broadcastResult.failedCount,
      status: broadcastResult.sentCount > 0 ? 'sent' : 'failed',
      sentBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: `Xabar ${broadcastResult.sentCount} ta foydalanuvchiga yuborildi`,
      data: notificationDoc
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification history record
// @route   DELETE /api/notifications/:id
// @access  Admin
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Xabarnoma topilmadi' });
    }

    await notification.deleteOne();
    res.json({ success: true, message: 'Xabarnoma tarixi o‘chirildi' });
  } catch (err) {
    next(err);
  }
};
