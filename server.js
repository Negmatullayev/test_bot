require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const initBot = require('./src/bot/index');

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Security & Logging Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false // Allows inline scripts & Chart.js CDN for Admin Panel
  })
);
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve Static Web Admin Panel & Uploads
app.use(express.static(path.join(__dirname, 'src/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// Apply Rate Limiter to API routes
app.use('/api', apiLimiter);

// API Routes Mount
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/subjects', require('./src/routes/subjectRoutes'));
app.use('/api/tests', require('./src/routes/testRoutes'));
app.use('/api/questions', require('./src/routes/questionRoutes'));
app.use('/api/results', require('./src/routes/resultRoutes'));
app.use('/api/statistics', require('./src/routes/statisticsRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/certificates', require('./src/routes/certificateRoutes'));

// Root route serves Admin Panel SPA
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.startsWith('/certificates')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'src/public/index.html'));
});

// Centralized Error Handler
app.use(errorHandler);

// Start HTTP Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Quiz Platform Server running on port: ${PORT}`);
  console.log(`🌐 Admin Panel: http://localhost:${PORT}`);
  console.log(`📡 REST API:    http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});

// Start Telegram Bot with auto-retry
const bot = initBot();
if (bot) {
  let isBotRunning = false;

  const startTelegramBot = async (retryCount = 0) => {
    try {
      await bot.launch({
        dropPendingUpdates: true
      });
      isBotRunning = true;
      console.log('🤖 [Telegram Bot] Bot muvaffaqiyatli ishga tushdi va ulandi: @AbubakrTest2026Bot');
    } catch (err) {
      console.error(`❌ [Telegram Bot Launch Error]: ${err.message}`);
      if (retryCount < 5) {
        console.log(`🔄 Botni qayta ulashga urinilmoqda... (${retryCount + 1}/5)`);
        setTimeout(() => startTelegramBot(retryCount + 1), 5000);
      } else {
        console.log('💡 Telegram serveriga ulanishda timeout bo‘ldi. Internet/VPN ulanishingizni tekshiring.');
      }
    }
  };

  startTelegramBot();

  // Enable graceful stop
  process.once('SIGINT', () => {
    if (isBotRunning) bot.stop('SIGINT');
    server.close();
  });
  process.once('SIGTERM', () => {
    if (isBotRunning) bot.stop('SIGTERM');
    server.close();
  });
}
