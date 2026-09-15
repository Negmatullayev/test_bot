const User = require('../models/User');
const Result = require('../models/Result');
const Achievement = require('../models/Achievement');
const { sendTelegramMessage } = require('../services/botService');

const escapeTelegramHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// @desc    Get all users with search, filter, pagination
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, isBlocked, page = 1, limit = 20 } = req.query;

    const query = { role: role || 'user' };
    if (typeof isBlocked !== 'undefined') query.isBlocked = isBlocked === 'true';

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { telegramId: isNaN(Number(search)) ? undefined : Number(search) }
      ].filter((item) => Object.values(item)[0] !== undefined);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user details & test statistics
// @route   GET /api/users/:id
// @access  Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const results = await Result.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const achievements = await Achievement.find({ userId: user._id }).sort({ unlockedAt: -1 });

    res.json({
      success: true,
      data: {
        user,
        results,
        achievements
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Block / Unblock user
// @route   PUT /api/users/:id/block
// @access  Admin
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a private message to a student through Telegram
// @route   POST /api/users/:id/message
// @access  Admin
exports.sendUserMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = await User.findOne({ _id: req.params.id, role: 'user' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'O‘quvchi topilmadi' });
    }
    if (!user.telegramId) {
      return res.status(400).json({ success: false, message: 'O‘quvchining Telegram ID si mavjud emas' });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Xabar matnini kiriting' });
    }

    const text = `📩 <b>Admin xabari</b>\n\n${escapeTelegramHtml(String(message).trim())}`;
    const sent = await sendTelegramMessage(user.telegramId, text);

    if (!sent) {
      return res.status(502).json({ success: false, message: 'Telegram xabarni yuborib bo‘lmadi' });
    }

    res.json({
      success: true,
      message: `${user.firstName || 'O‘quvchi'}ga xabar yuborildi`,
      data: { telegramId: user.telegramId, message: String(message).trim() }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public / Admin
exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const topUsers = await User.find({ isBlocked: false, role: 'user' })
      .sort({ totalScore: -1, xp: -1 })
      .limit(limit)
      .select('firstName lastName username telegramId totalScore xp level levelName totalTests');

    res.json({
      success: true,
      data: topUsers
    });
  } catch (err) {
    next(err);
  }
};
