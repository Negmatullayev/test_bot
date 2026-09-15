const fs = require('fs');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { generateCertificatePdf } = require('../services/certificateService');
const { sendTelegramDocument } = require('../services/botService');

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Admin
exports.getCertificates = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { certificateNumber: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { testTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
      .populate('userId', 'username firstName lastName telegramId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: certificates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create custom certificate by Admin & optionally send via Telegram
// @route   POST /api/certificates
// @access  Admin
exports.createCertificate = async (req, res, next) => {
  try {
    const {
      userName,
      telegramId,
      userId,
      subjectTitle = 'Maxsus Taqdirlash',
      testTitle = 'A’lo Natija va Faollik uchun',
      percentage = 100,
      score = 100,
      sendTelegram = false
    } = req.body;

    if (!userName || !userName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O‘quvchi ism-familiyasi kiritilishi shart'
      });
    }

    // Find user if telegramId or userId provided
    let linkedUser = null;
    let finalTelegramId = telegramId ? Number(telegramId) : null;

    if (userId) {
      linkedUser = await User.findById(userId);
      if (linkedUser && linkedUser.telegramId) {
        finalTelegramId = linkedUser.telegramId;
      }
    } else if (finalTelegramId) {
      linkedUser = await User.findOne({ telegramId: finalTelegramId });
    }

    const certNumber = 'CERT-' + Date.now().toString().slice(-8);
    const issueDate = new Date();
    const appUrl = (process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'https://test-bot-vcjo.onrender.com').replace(/\/$/, '');
    const verifyUrl = `${appUrl}/api/certificates/verify/${certNumber}`;

    // 1. Generate PDF
    const filePath = await generateCertificatePdf({
      certificateNumber: certNumber,
      userName: userName.trim(),
      testTitle: testTitle.trim(),
      subjectTitle: subjectTitle.trim(),
      percentage: Number(percentage) || 100,
      issueDate,
      verifyUrl
    });

    // 2. Save Certificate to Database
    const certificate = await Certificate.create({
      certificateNumber: certNumber,
      userId: linkedUser ? linkedUser._id : null,
      telegramId: finalTelegramId,
      userName: userName.trim(),
      testTitle: testTitle.trim(),
      subjectTitle: subjectTitle.trim(),
      percentage: Number(percentage) || 100,
      score: Number(score) || 100,
      issueDate,
      qrCodeData: verifyUrl,
      pdfFilePath: filePath
    });

    // 3. Send to Telegram if requested
    let telegramSent = false;
    if (sendTelegram && finalTelegramId) {
      const caption = `🎓 <b>Tabriklaymiz, ${userName.trim()}!</b>\n\n` +
        `Sizga <b>"${testTitle.trim()}"</b> (${subjectTitle.trim()}) bo‘yicha rasmiy sertifikat taqdim etildi!\n\n` +
        `📈 Natija: <b>${percentage}%</b>\n` +
        `🆔 Sertifikat ID: <code>${certNumber}</code>`;

      telegramSent = await sendTelegramDocument(finalTelegramId, filePath, caption);
    }

    res.status(201).json({
      success: true,
      message: telegramSent
        ? 'Sertifikat muvaffaqiyatli yaratildi va Telegram orqali yuborildi!'
        : 'Sertifikat muvaffaqiyatli yaratildi va saqlandi!',
      telegramSent,
      data: certificate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send existing certificate to user via Telegram
// @route   POST /api/certificates/:id/send-telegram
// @access  Admin
exports.sendCertificateToTelegram = async (req, res, next) => {
  try {
    const { telegramId } = req.body;
    const cert = await Certificate.findById(req.params.id).populate('userId');

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Sertifikat topilmadi' });
    }

    const targetTelegramId = telegramId ? Number(telegramId) : (cert.telegramId || cert.userId?.telegramId);

    if (!targetTelegramId) {
      return res.status(400).json({
        success: false,
        message: 'Foydalanuvchining Telegram ID si topilmadi. Iltimos Telegram ID ni kiriting.'
      });
    }

    // Ensure PDF exists
    if (!cert.pdfFilePath || !fs.existsSync(cert.pdfFilePath)) {
      const filePath = await generateCertificatePdf({
        certificateNumber: cert.certificateNumber,
        userName: cert.userName,
        testTitle: cert.testTitle,
        subjectTitle: cert.subjectTitle,
        percentage: cert.percentage,
        issueDate: cert.issueDate,
        verifyUrl: cert.qrCodeData
      });
      cert.pdfFilePath = filePath;
      await cert.save();
    }

    const caption = `🎓 <b>Tabriklaymiz, ${cert.userName}!</b>\n\n` +
      `Sizga <b>"${cert.testTitle}"</b> (${cert.subjectTitle || 'Bilim sinovi'}) bo‘yicha rasmiy sertifikatingiz yuborildi!\n\n` +
      `📈 Natija: <b>${cert.percentage}%</b>\n` +
      `🆔 Sertifikat ID: <code>${cert.certificateNumber}</code>`;

    const sent = await sendTelegramDocument(targetTelegramId, cert.pdfFilePath, caption);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'Telegram orqali yuborib bo‘lmadi. Bot bloklangan yoki Telegram ID noto‘g‘ri bo‘lishi mumkin.'
      });
    }

    if (!cert.telegramId) {
      cert.telegramId = targetTelegramId;
      await cert.save();
    }

    res.json({
      success: true,
      message: `Sertifikat ${targetTelegramId} raqamli Telegram foydalanuvchisiga muvaffaqiyatli yuborildi!`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Public / Admin
exports.downloadCertificatePdf = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Sertifikat topilmadi' });
    }

    // If PDF doesn't exist on disk, regenerate it
    if (!cert.pdfFilePath || !fs.existsSync(cert.pdfFilePath)) {
      const filePath = await generateCertificatePdf({
        certificateNumber: cert.certificateNumber,
        userName: cert.userName,
        testTitle: cert.testTitle,
        subjectTitle: cert.subjectTitle,
        percentage: cert.percentage,
        issueDate: cert.issueDate
      });
      cert.pdfFilePath = filePath;
      await cert.save();
    }

    res.download(cert.pdfFilePath, `Sertifikat_${cert.certificateNumber}.pdf`);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Admin
exports.deleteCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Sertifikat topilmadi' });
    }

    // Optionally remove pdf file
    if (cert.pdfFilePath && fs.existsSync(cert.pdfFilePath)) {
      try {
        fs.unlinkSync(cert.pdfFilePath);
      } catch (e) {}
    }

    await cert.deleteOne();
    res.json({ success: true, message: 'Sertifikat muvaffaqiyatli o‘chirildi' });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify certificate by number
// @route   GET /api/certificates/verify/:certificateNumber
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({
      certificateNumber: req.params.certificateNumber
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Bunday sertifikat raqami bazada topilmadi'
      });
    }

    res.json({
      success: true,
      verified: true,
      data: cert
    });
  } catch (err) {
    next(err);
  }
};

