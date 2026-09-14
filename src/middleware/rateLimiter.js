const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Juda ko‘p so‘rov yuborildi. Iltimos, 15 daqiqadan so‘ng qayta urinib ko‘ring.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login attempts
  message: {
    success: false,
    message: 'Tizimga kirish uchun juda ko‘p urinish qilindi. Biroz kuting.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
