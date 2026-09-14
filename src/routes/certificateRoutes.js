const express = require('express');
const router = express.Router();
const {
  getCertificates,
  downloadCertificatePdf,
  verifyCertificate
} = require('../controllers/certificateController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getCertificates);
router.get('/:id/download', downloadCertificatePdf);
router.get('/verify/:certificateNumber', verifyCertificate);

module.exports = router;
