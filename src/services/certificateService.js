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

      // Premium navy background with a warm certificate accent.
      doc.rect(0, 0, width, height).fill('#081c2c');
      doc.circle(width - 90, 55, 130).fillOpacity(0.08).fill('#38bdf8').fillOpacity(1);
      doc.circle(55, height - 45, 105).fillOpacity(0.06).fill('#f6c453').fillOpacity(1);

      // Subtle repeated brand watermark behind the certificate content.
      doc.save();
      doc.rotate(-24, { origin: [width / 2, height / 2] });
      doc.fontSize(34)
         .fillColor('#ffffff')
         .fillOpacity(0.035)
         .text('BILIM SINOVI  •  TELEGRAM QUIZ BOT', 105, 220, { width: 630, align: 'center' })
         .text('BILIM SINOVI  •  TELEGRAM QUIZ BOT', 90, 330, { width: 660, align: 'center' });
      doc.restore();

      // Decorative outer border
      doc.rect(20, 20, width - 40, height - 40)
         .lineWidth(2.5)
         .stroke('#f6c453');

      // Inner border
      doc.rect(28, 28, width - 56, height - 56)
         .lineWidth(1)
         .stroke('#2d5870');

      // Header accent
      doc.rect(35, 35, width - 70, 8)
         .fill('#38bdf8');

      doc.fontSize(11)
         .fillColor('#f6c453')
         .text('BILIM SINOVI  •  RASMIY TASDIQNOMA', 0, 60, { align: 'center', characterSpacing: 1.5 });

      // Certificate Title
      doc.fontSize(28)
         .fillColor('#f8fafc')
         .text('SERTIFIKAT', 0, 82, { align: 'center', characterSpacing: 4 });

      doc.fontSize(12)
         .fillColor('#9fc4d5')
         .text('MUVAFFAQIYATLI YAKUNLANGANLIK TO‘G‘RISIDA', 0, 121, { align: 'center', characterSpacing: 1.5 });

      // Body text
      doc.fontSize(14)
         .fillColor('#c7dce5')
         .text('Ushbu sertifikat quyidagi o‘quvchiga taqdim etiladi:', 0, 158, { align: 'center' });

      // Recipient Name
      doc.fontSize(26)
         .fillColor('#38d6c7')
         .text(userName.toUpperCase(), 0, 194, { align: 'center', underline: false });

      // Divider
      doc.moveTo(width / 2 - 150, 230)
         .lineTo(width / 2 + 150, 230)
         .lineWidth(1.5)
         .stroke('#f6c453');

      // Test details
      doc.fontSize(14)
         .fillColor('#e2e8f0')
         .text(
           `"${testTitle}" (${subjectTitle}) bo‘yicha bilim sinovida`,
           0,
           250,
           { align: 'center' }
         );

      doc.fontSize(16)
         .fillColor('#f6c453')
         .text(`Natija: ${percentage}% ball to‘plaganligi uchun`, 0, 280, { align: 'center' });

      // QR Code
      doc.image(qrBuffer, 65, height - 180, { width: 112, height: 112 });
      doc.fontSize(9)
         .fillColor('#9fc4d5')
         .text('QR orqali tekshirish', 65, height - 60, { width: 112, align: 'center' });
      doc.fontSize(8)
         .fillColor('#6f9caf')
         .text(certificateNumber, 65, height - 46, { width: 112, align: 'center' });

      // Seal & Signature
      const rightX = width - 220;
      doc.fontSize(11)
         .fillColor('#c7dce5')
         .text(`Sana: ${issueDateText}`, rightX, height - 142);

      doc.fontSize(12)
         .fillColor('#38d6c7')
         .text('Bilim Sinovi', rightX, height - 116);

      doc.fontSize(10)
         .fillColor('#9fc4d5')
         .text(`Telegram: @${botUsername}`, rightX, height - 96);
      doc.fontSize(9)
         .fillColor('#6f9caf')
         .text('Raqamli tasdiqlangan hujjat', rightX, height - 78);

      // Clickable links remain useful when the PDF is opened digitally.
      doc.fontSize(8)
         .fillColor('#38bdf8')
         .text('Sertifikatni tekshirish', rightX, height - 55, { link: verifyUrl, underline: true });
      doc.fontSize(8)
         .fillColor('#38bdf8')
         .text('Botga o‘tish', rightX, height - 40, { link: botUrl, underline: true });

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
