const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const generateInvoice = async (student, payment, course) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();

  page.drawText('FARS - Payment Invoice', { x: 50, y: height - 50, size: 20, font: bold });
  page.drawText('Facebook Admission & Registration System', { x: 50, y: height - 70, size: 10, font });

  const yStart = height - 120;
  const items = [
    ['Invoice Date:', new Date().toLocaleDateString()],
    ['Student Name:', student.student_name],
    ['Student ID:', student.student_id_number || 'N/A'],
    ['Course:', course ? course.name : 'N/A'],
    ['Amount:', `BDT ${payment.amount}`],
    ['Transaction ID:', payment.trxid],
    ['Payment Method:', payment.method.toUpperCase()],
    ['Payment Date:', new Date(payment.payment_date).toLocaleDateString()],
    ['Status:', payment.status.toUpperCase()],
  ];

  items.forEach(([label, value], i) => {
    const y = yStart - i * 22;
    page.drawText(label, { x: 50, y, size: 11, font: bold });
    page.drawText(value, { x: 200, y, size: 11, font });
  });

  return await doc.save();
};

const generateAdmissionLetter = async (student, course, batch) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();

  page.drawText('Admission Letter', { x: 50, y: height - 50, size: 24, font: bold });
  page.drawText('FARS - Facebook Admission & Registration System', {
    x: 50, y: height - 75, size: 11, font,
  });

  page.drawLine({
    start: { x: 50, y: height - 90 },
    end: { x: width - 50, y: height - 90 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  const bodyStart = height - 130;
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: 50, y: bodyStart, size: 11, font,
  });

  const lines = [
    `Dear ${student.student_name},`,
    '',
    'We are pleased to inform you that your application for admission has been',
    'reviewed and approved. You are hereby officially admitted to the program.',
    '',
    'Admission Details:',
  ];
  lines.forEach((line, i) => {
    page.drawText(line, { x: 50, y: bodyStart - 30 - i * 16, size: 11, font });
  });

  const details = [
    ['Student ID:', student.student_id_number || 'N/A'],
    ['Program:', course ? course.name : 'N/A'],
    ['Batch:', batch ? batch.batch_name : 'N/A'],
    ['Status:', 'ADMITTED'],
  ];

  const detailStart = bodyStart - 30 - lines.length * 16 - 20;
  details.forEach(([label, value], i) => {
    const y = detailStart - i * 22;
    page.drawText(label, { x: 50, y, size: 11, font: bold });
    page.drawText(value, { x: 180, y, size: 11, font });
  });

  page.drawText('Welcome to FARS!', {
    x: 50, y: detailStart - details.length * 22 - 30, size: 14, font: bold,
    color: rgb(0, 0.2, 0.6),
  });

  return await doc.save();
};

const generateCertificate = async (student, course) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();

  page.drawText('Certificate of Completion', {
    x: width / 2 - 120, y: height - 100, size: 22, font: bold,
  });

  page.drawText('This is to certify that', {
    x: width / 2 - 70, y: height - 160, size: 14, font,
  });

  page.drawText(student.student_name, {
    x: width / 2 - 80, y: height - 200, size: 18, font: bold,
  });

  page.drawText(`has successfully completed the course`, {
    x: width / 2 - 100, y: height - 240, size: 14, font,
  });

  page.drawText(course ? course.name : '', {
    x: width / 2 - 80, y: height - 280, size: 16, font: bold,
  });

  page.drawText(`Student ID: ${student.student_id_number || 'N/A'}`, {
    x: width / 2 - 80, y: height - 350, size: 11, font,
  });

  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: width / 2 - 60, y: height - 380, size: 11, font,
  });

  page.drawText('FARS - Facebook Admission & Registration System', {
    x: width / 2 - 120, y: 80, size: 9, font,
  });

  return await doc.save();
};

module.exports = { generateInvoice, generateAdmissionLetter, generateCertificate };
