const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true
    },
    password: {
      type: String,
      select: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    totalTests: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    totalCorrect: {
      type: Number,
      default: 0
    },
    totalWrong: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    },
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    levelName: {
      type: String,
      default: 'Beginner'
    },
    bestScore: {
      type: Number,
      default: 0
    },
    bestSubject: {
      type: String,
      default: "Yo'q"
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    lastLogoutAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
