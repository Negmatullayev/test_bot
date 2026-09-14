const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
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
    testTitle: {
      type: String,
      required: true
    },
    subjectTitle: {
      type: String,
      default: ''
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctCount: {
      type: Number,
      required: true
    },
    wrongCount: {
      type: Number,
      required: true
    },
    unansweredCount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalPossibleScore: {
      type: Number,
      required: true
    },
    timeSpentSeconds: {
      type: Number,
      default: 0
    },
    evaluationBadge: {
      type: String,
      enum: ["A'lo", 'Juda yaxshi', 'Yaxshi', "Ko'proq mashq qiling"],
      default: "Ko'proq mashq qiling"
    },
    passed: {
      type: Boolean,
      default: false
    },
    certificateGenerated: {
      type: Boolean,
      default: false
    },
    answersDetails: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        questionText: String,
        selectedOption: String, // e.g. 'A'
        selectedText: String,
        correctOption: String, // e.g. 'B'
        correctText: String,
        isCorrect: Boolean,
        explanation: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Result', resultSchema);
