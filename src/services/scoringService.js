const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Result = require('../models/Result');

const LEVELS = [
  { level: 1, name: 'Beginner', minXp: 0, maxXp: 200 },
  { level: 2, name: 'Student', minXp: 201, maxXp: 600 },
  { level: 3, name: 'Advanced', minXp: 601, maxXp: 1500 },
  { level: 4, name: 'Expert', minXp: 1501, maxXp: 3500 },
  { level: 5, name: 'Master', minXp: 3501, maxXp: Infinity }
];

function getLevelInfo(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Calculate test result score, bonuses, XP and check achievements
 */
async function processTestResult(userId, options) {
  const {
    correctCount,
    wrongCount,
    totalQuestions,
    timeSpentSeconds,
    durationMinutes,
    isDailyChallenge,
    subjectTitle
  } = options;

  const totalPossibleScore = totalQuestions * 10;
  let earnedScore = correctCount * 10;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Bonuses
  let bonusPoints = 0;

  // Speed bonus
  const allottedSeconds = (durationMinutes || 15) * 60;
  if (percentage >= 70 && timeSpentSeconds > 0) {
    if (timeSpentSeconds < allottedSeconds * 0.4) {
      bonusPoints += 20; // Super fast
    } else if (timeSpentSeconds < allottedSeconds * 0.7) {
      bonusPoints += 10; // Fast
    }
  }

  // 100% Perfect score bonus
  if (percentage === 100) {
    bonusPoints += 30;
  }

  // Daily challenge bonus
  if (isDailyChallenge) {
    bonusPoints += 20;
  }

  earnedScore += bonusPoints;
  const earnedXp = Math.round(earnedScore * 1.5);

  // Determine badge/evaluation text
  let evaluationBadge = "Ko'proq mashq qiling";
  if (percentage >= 90) {
    evaluationBadge = "A'lo";
  } else if (percentage >= 75) {
    evaluationBadge = 'Juda yaxshi';
  } else if (percentage >= 60) {
    evaluationBadge = 'Yaxshi';
  }

  // Update user stats
  const user = await User.findById(userId);
  if (!user) {
    return {
      score: earnedScore,
      totalPossibleScore,
      percentage,
      evaluationBadge,
      newAchievements: []
    };
  }

  user.totalTests += 1;
  user.totalQuestions += totalQuestions;
  user.totalCorrect += correctCount;
  user.totalWrong += wrongCount;
  user.totalScore += earnedScore;
  user.xp += earnedXp;

  const levelObj = getLevelInfo(user.xp);
  user.level = levelObj.level;
  user.levelName = levelObj.name;
  user.lastActive = new Date();

  if (percentage > user.bestScore) {
    user.bestScore = percentage;
  }
  if (subjectTitle) {
    user.bestSubject = subjectTitle;
  }

  await user.save();

  // Check achievements
  const newAchievements = await checkAndAwardAchievements(user, {
    percentage,
    timeSpentSeconds,
    allottedSeconds,
    isDailyChallenge
  });

  return {
    score: earnedScore,
    totalPossibleScore,
    percentage,
    evaluationBadge,
    bonusPoints,
    earnedXp,
    newLevel: user.level,
    newLevelName: user.levelName,
    newAchievements
  };
}

async function checkAndAwardAchievements(user, meta) {
  const newUnlocked = [];

  const addBadge = async (badgeKey, title, description, icon) => {
    const exists = await Achievement.findOne({ userId: user._id, badgeKey });
    if (!exists) {
      const created = await Achievement.create({
        userId: user._id,
        telegramId: user.telegramId || 0,
        badgeKey,
        title,
        description,
        icon
      });
      newUnlocked.push(created);
    }
  };

  // First Test
  if (user.totalTests >= 1) {
    await addBadge('first_test', 'Birinchi qadam', 'Birinchi testni yakunladingiz', '🎯');
  }

  // 10 Tests
  if (user.totalTests >= 10) {
    await addBadge('tests_10', 'Faol bilimdon', '10 ta testni muvaffaqiyatli yakunladingiz', '🔥');
  }

  // 50 Tests
  if (user.totalTests >= 50) {
    await addBadge('tests_50', 'Test ustasi', '50 ta testni yakunladingiz', '🏆');
  }

  // Perfect score
  if (meta.percentage === 100) {
    await addBadge('perfect_score', 'Mukammal natija', 'Testda 100% natija qayd etdingiz', '💯');
  }

  // Fast Solver
  if (meta.percentage >= 80 && meta.timeSpentSeconds < meta.allottedSeconds * 0.4) {
    await addBadge('fast_solver', 'Chaqqon aql', 'Testni belgilangan vaqtdan 2 baravar tezroq ishladingiz', '⚡');
  }

  // 100 Correct Questions
  if (user.totalCorrect >= 100) {
    await addBadge('questions_100', '100 ta to‘g‘ri javob', 'Jami 100 dan ortiq savollarga to‘g‘ri javob berdingiz', '📚');
  }

  return newUnlocked;
}

module.exports = {
  LEVELS,
  getLevelInfo,
  processTestResult,
  checkAndAwardAchievements
};
