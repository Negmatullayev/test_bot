const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test nomi kiritilishi shart'],
      trim: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Fan tanlanishi shart'],
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    topic: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    durationMinutes: {
      type: Number,
      default: 15,
      min: 1
    },
    totalQuestions: {
      type: Number,
      default: 20
    },
    pointsPerQuestion: {
      type: Number,
      default: 1
    },
    passingPercentage: {
      type: Number,
      default: 60
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'all'],
      default: 'medium'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    maxAttempts: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    isAntiCheatEnabled: {
      type: Boolean,
      default: true // shuffle questions and options
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Test', testSchema);
