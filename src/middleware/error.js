const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err.stack || err);

  let error = { ...err };
  error.message = err.message;

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resurs topilmadi (Noto‘g‘ri ID)';
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'qiymat';
    const message = `Bu ${field} bazada allaqachon mavjud`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Serverda ichki xatolik yuz berdi'
  });
};

module.exports = errorHandler;
