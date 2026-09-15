const express = require('express');
const router = express.Router();
const {
  getCertificates,
  createCertificate,
  sendCertificateToTelegram,
  downloadCertificatePdf,
  deleteCertificate,
  verifyCertificate
} = require('../controllers/certificateController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getCertificates);
router.post('/', protect, adminOnly, createCertificate);
router.post('/:id/send-telegram', protect, adminOnly, sendCertificateToTelegram);
router.delete('/:id', protect, adminOnly, deleteCertificate);
router.get('/:id/download', downloadCertificatePdf);
router.get('/verify/:certificateNumber', verifyCertificate);

module.exports = router;

