const User = require('../models/User');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Subject = require('../models/Subject');

// @desc    Get Admin Dashboard summary stats & charts data
// @route   GET /api/statistics/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalTests,
      totalQuestions,
      todayTestsCount,
      allResultsCount,
      activeTodayUsersCount
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Test.countDocuments(),
      Question.countDocuments(),
      Result.countDocuments({ createdAt: { $gte: todayStart } }),
      Result.countDocuments(),
      User.countDocuments({ lastActive: { $gte: todayStart } })
    ]);

    // Average score calculation
    const avgScoreAgg = await Result.aggregate([
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
          avgScore: { $avg: '$score' }
        }
      }
    ]);
    const avgPercentage = avgScoreAgg.length > 0 ? Math.round(avgScoreAgg[0].avgPercentage) : 0;

    // Daily tests over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTestsAgg = await Result.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Subject breakdown
    const subjectDistributionAgg = await Result.aggregate([
      {
        $group: {
          _id: '$subjectTitle',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Top students
    const topStudents = await User.find({ role: 'user', isBlocked: false })
      .sort({ totalScore: -1 })
      .limit(5)
      .select('firstName lastName username telegramId totalScore xp level levelName totalTests');

    // Recent results
    const recentResults = await Result.find()
      .populate('userId', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalTests,
          totalQuestions,
          todayTestsCount,
          activeTodayUsersCount,
          avgPercentage,
          allResultsCount
        },
        dailyTests: dailyTestsAgg,
        subjectDistribution: subjectDistributionAgg,
        topStudents,
        recentResults
      }
    });
  } catch (err) {
    next(err);
  }
};
