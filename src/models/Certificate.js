const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    telegramId: {
      type: Number,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      default: null
    },
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Result',
      required: true
    },
    testTitle: {
      type: String,
      required: true
    },
    subjectTitle: {
      type: String,
      default: ''
    },
    percentage: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    qrCodeData: {
      type: String,
      default: ''
    },
    pdfFilePath: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
