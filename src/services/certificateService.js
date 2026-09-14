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
    issueDate
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
      const qrData = `CERT-ID: ${certificateNumber}\nUser: ${userName}\nTest: ${testTitle}\nResult: ${percentage}%\nDate: ${new Date(issueDate).toLocaleDateString('uz-UZ')}`;
      const qrBuffer = await QRCode.toBuffer(qrData, {
        width: 110,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      const width = doc.page.width;
      const height = doc.page.height;

      // Background
      doc.rect(0, 0, width, height).fill('#0b0f19');

      // Decorative outer border
      doc.rect(20, 20, width - 40, height - 40)
         .lineWidth(3)
         .stroke('#3b82f6');

      // Inner border
      doc.rect(28, 28, width - 56, height - 56)
         .lineWidth(1)
         .stroke('#1e293b');

      // Header Golden Accent
      doc.rect(35, 35, width - 70, 8)
         .fill('#3b82f6');

      // Certificate Title
      doc.fontSize(28)
         .fillColor('#60a5fa')
         .text('SERTIFIKAT', 0, 70, { align: 'center', tracking: 4 });

      doc.fontSize(12)
         .fillColor('#94a3b8')
         .text('MUVAFFAQIYATLI YAKUNLANGANLIK TO‘G‘RISIDA', 0, 110, { align: 'center', tracking: 2 });

      // Body text
      doc.fontSize(14)
         .fillColor('#cbd5e1')
         .text('Ushbu sertifikat quyidagi o‘quvchiga taqdim etiladi:', 0, 155, { align: 'center' });

      // Recipient Name
      doc.fontSize(26)
         .fillColor('#38bdf8')
         .text(userName.toUpperCase(), 0, 190, { align: 'center', underline: false });

      // Divider
      doc.moveTo(width / 2 - 150, 230)
         .lineTo(width / 2 + 150, 230)
         .lineWidth(1.5)
         .stroke('#3b82f6');

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
         .fillColor('#22c55e')
         .text(`Natija: ${percentage}% ball to‘plaganligi uchun`, 0, 280, { align: 'center' });

      // QR Code
      doc.image(qrBuffer, 65, height - 170, { width: 95, height: 95 });
      doc.fontSize(9)
         .fillColor('#64748b')
         .text(`ID: ${certificateNumber}`, 65, height - 65);

      // Seal & Signature
      const rightX = width - 220;
      doc.fontSize(11)
         .fillColor('#94a3b8')
         .text(`Sana: ${new Date(issueDate).toLocaleDateString('uz-UZ')}`, rightX, height - 130);

      doc.fontSize(12)
         .fillColor('#e2e8f0')
         .text('Telegram Quiz Platform', rightX, height - 105);

      doc.fontSize(10)
         .fillColor('#64748b')
         .text('Raqamli Tasdiqlangan Hujjat', rightX, height - 85);

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
