const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    telegramId: {
      type: Number,
      required: true,
      index: true
    },
    badgeKey: {
      type: String,
      required: true,
      enum: [
        'first_test',
        'tests_10',
        'tests_50',
        'perfect_score',
        'fast_solver',
        'questions_100',
        'top_student',
        'daily_master'
      ]
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: '🏆'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

achievementSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
