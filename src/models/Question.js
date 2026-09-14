const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      default: null,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Fan kiritilishi shart'],
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    questionText: {
      type: String,
      required: [true, 'Savol matni kiritilishi shart'],
      trim: true
    },
    options: {
      type: [optionSchema],
      validate: [
        function (val) {
          return val.length >= 2 && val.length <= 4;
        },
        'Kamida 2 ta, ko‘pi bilan 4 ta variant bo‘lishi kerak'
      ]
    },
    correctAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: [true, 'To‘g‘ri javob ko‘rsatilishi shart']
    },
    explanation: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    points: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);
