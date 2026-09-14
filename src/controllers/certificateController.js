const fs = require('fs');
const Certificate = require('../models/Certificate');
const { generateCertificatePdf } = require('../services/certificateService');

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
      .populate('userId', 'username firstName lastName')
      .sort({ issueDate: -1 })
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
