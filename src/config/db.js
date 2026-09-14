const mongoose = require('mongoose');

const connectDB = async (retryCount = 0) => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uz_quiz_bot';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    if (retryCount < 5) {
      console.log(`🔄 MongoDB'ga qayta ulanishga urinilmoqda... (${retryCount + 1}/5)`);
      setTimeout(() => connectDB(retryCount + 1), 5000);
    } else {
      console.log('💡 Render Environment Variables bo‘limida to‘g‘ri MONGODB_URI sozlanganligini tekshiring.');
    }
  }
};

module.exports = connectDB;
