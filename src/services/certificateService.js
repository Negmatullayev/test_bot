const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF Certificate for a passed test
 */
async function generateCertificatePdf(certificateData) {
  const {
    certificateNumber,
    userName,
    testTitle,
    subjectTitle,
      percentage,
      issueDate,
      verifyUrl: providedVerifyUrl
  } = certificateData;

  const certDir = path.join(__dirname, '../../certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const filePath = path.join(certDir, `cert_${certificateNumber}.pdf`);

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 40
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Generate QR Code Buffer
         const appUrl = (process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'https://test-bot-vcjo.onrender.com').replace(/\/$/, '');
         const botUsername = process.env.BOT_USERNAME || 'AbubakrTest2026Bot';
         const botUrl = `https://t.me/${botUsername}`;
         const verifyUrl = providedVerifyUrl || `${appUrl}/api/certificates/verify/${certificateNumber}`;
         const issueDateText = new Date(issueDate).toLocaleDateString('uz-UZ');
         const qrData = verifyUrl;
      const qrBuffer = await QRCode.toBuffer(qrData, {
            width: 128,
            margin: 2,
        color: {
               dark: '#102a43',
          light: '#ffffff'
        }
      });

      const width = doc.page.width;
      const height = doc.page.height;

      // Original paper-style layout: ivory paper, navy ink, and a gold ribbon.
      doc.rect(0, 0, width, height).fill('#f7f2e8');
      doc.rect(0, 0, 76, height).fill('#102a43');
      doc.rect(76, 0, 8, height).fill('#d8a93a');

      // Light watermark with the bot name behind the certificate text.
      doc.save();
      doc.rotate(-90, { origin: [width / 2, height / 2] });
      doc.fontSize(40)
         .fillColor('#102a43')
         .fillOpacity(0.045)
         .text('BILIM SINOVI  •  TELEGRAM QUIZ BOT', 120, 385, { width: 520, align: 'center' });
      doc.restore();

      // Double frame and corner ornaments.
      doc.rect(105, 28, width - 133, height - 56)
         .lineWidth(2)
         .stroke('#102a43');
      doc.rect(113, 36, width - 149, height - 72)
         .lineWidth(1)
         .stroke('#d8a93a');
      [[105, 28], [width - 28, 28], [105, height - 28], [width - 28, height - 28]].forEach(([x, y]) => {
        doc.circle(x, y, 5).fill('#d8a93a');
      });

      // Brand mark on the side ribbon.
      doc.fontSize(10)
         .fillColor('#f7f2e8')
         .text('BILIM', 23, 218, { width: 30, align: 'center', characterSpacing: 1 });
      doc.fontSize(10)
         .text('SINOVI', 17, 235, { width: 42, align: 'center', characterSpacing: 1 });
      doc.moveTo(23, 270).lineTo(61, 270).lineWidth(1).stroke('#d8a93a');
      doc.fontSize(8)
         .text(`@${botUsername}`, 10, 286, { width: 56, align: 'center' });

      doc.fontSize(11)
         .fillColor('#b0811b')
         .text('RASMIY BILIM TASDIQNOMASI', 105, 66, { width: width - 133, align: 'center', characterSpacing: 2 });
      doc.fontSize(33)
         .fillColor('#102a43')
         .text('SERTIFIKAT', 105, 91, { width: width - 133, align: 'center', characterSpacing: 5 });
      doc.fontSize(11)
         .fillColor('#526777')
         .text('MUVAFFAQIYATLI YAKUNLANGANLIK TO‘G‘RISIDA', 105, 137, { width: width - 133, align: 'center', characterSpacing: 1.5 });

      doc.fontSize(14)
         .fillColor('#526777')
         .text('Ushbu sertifikat quyidagi o‘quvchiga taqdim etiladi:', 105, 176, { width: width - 133, align: 'center' });
      doc.fontSize(27)
         .fillColor('#102a43')
         .text(userName.toUpperCase(), 105, 207, { width: width - 133, align: 'center' });
      doc.moveTo(270, 247).lineTo(width - 115, 247).lineWidth(1.5).stroke('#d8a93a');

      doc.fontSize(13)
         .fillColor('#304b5d')
         .text(`"${testTitle}"`, 150, 267, { width: width - 225, align: 'center' });
      doc.fontSize(11)
         .fillColor('#526777')
         .text(`${subjectTitle} bo‘yicha bilim sinovida`, 150, 289, { width: width - 225, align: 'center' });

      // Highlighted result pill.
      doc.roundedRect(width / 2 - 92, 320, 184, 38, 19).fill('#102a43');
      doc.fontSize(16)
         .fillColor('#f7f2e8')
         .text(`NATIJA  ${percentage}%`, width / 2 - 92, 331, { width: 184, align: 'center' });

      // QR verification block.
      doc.image(qrBuffer, 137, height - 171, { width: 108, height: 108 });
      doc.fontSize(8)
         .fillColor('#526777')
         .text('QR ORQALI TEKSHIRISH', 125, height - 57, { width: 132, align: 'center', characterSpacing: 0.7 });
      doc.fontSize(8)
         .fillColor('#102a43')
         .text(certificateNumber, 125, height - 43, { width: 132, align: 'center' });

      // Original seal and signature area.
      const sealX = width - 208;
      const sealY = height - 116;
      doc.circle(sealX, sealY, 38).lineWidth(2).stroke('#d8a93a');
      doc.circle(sealX, sealY, 30).lineWidth(1).stroke('#d8a93a');
      doc.fontSize(8).fillColor('#b0811b').text('VERIFIED', sealX - 27, sealY - 5, { width: 54, align: 'center' });
      doc.fontSize(10).fillColor('#526777').text(`Sana: ${issueDateText}`, width - 335, height - 164, { width: 190, align: 'right' });
      doc.moveTo(width - 338, height - 116).lineTo(width - 145, height - 116).lineWidth(1).stroke('#102a43');
      doc.fontSize(11).fillColor('#102a43').text('Bilim Sinovi jamoasi', width - 338, height - 105, { width: 193, align: 'right' });
      doc.fontSize(8).fillColor('#526777').text(`Telegram: @${botUsername}`, width - 338, height - 87, { width: 193, align: 'right' });
      doc.fontSize(8).fillColor('#1e7f91').text('Sertifikatni tekshirish', width - 338, height - 65, { width: 193, align: 'right', link: verifyUrl, underline: true });
      doc.fontSize(8).fillColor('#1e7f91').text('Botga o‘tish', width - 338, height - 50, { width: 193, align: 'right', link: botUrl, underline: true });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateCertificatePdf
};
