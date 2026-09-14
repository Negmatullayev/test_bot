const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
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
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      default: null,
      index: true
    },
    isDailyChallenge: {
      type: Boolean,
      default: false
    },
    isRandomTest: {
      type: Boolean,
      default: false
    },
    subjectTitle: {
      type: String,
      default: ''
    },
    testTitle: {
      type: String,
      default: ''
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question'
        },
        questionText: String,
        imageUrl: String,
        options: [
          {
            key: String,
            text: String
          }
        ],
        correctAnswer: String,
        explanation: String,
        points: {
          type: Number,
          default: 1
        }
      }
    ],
    answers: {
      type: Map,
      of: String, // questionId -> selected key ('A', 'B', 'C', 'D')
      default: {}
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    durationMinutes: {
      type: Number,
      default: 15
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },
    messageId: {
      type: Number, // Last sent Telegram message ID for in-place editing
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Attempt', attemptSchema);
