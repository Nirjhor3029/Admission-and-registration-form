const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const toRgb = (hex) => {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const methodLabel = (m) => {
  if (m === 'bkash') return 'bKash';
  if (m === 'nagad') return 'Nagad';
  return (m || '').toUpperCase();
};

const generateInvoice = async (student, payment, course) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);
  const W = 595.28;
  const H = 841.89;
  const M = 50;
  const CW = W - M * 2;
  const RIGHT = W - M;

  const NAVY = toRgb('#00355f');
  const AMBER = toRgb('#fea619');
  const TEXT = toRgb('#0b1c30');
  const GREY = toRgb('#43474e');
  const LIGHT = toRgb('#f2f3f9');
  const BORDER = toRgb('#c2c7d1');
  const WHITE = rgb(1, 1, 1);
  const SOFT_WHITE = rgb(0.84, 0.89, 0.95);

  const todayStr = fmtDate(new Date());
  const invNo = `FARS-INV-${String(payment._id).slice(-8).toUpperCase()}`;

  const bandH = 150;
  page.drawRectangle({ x: 0, y: H - bandH, width: W, height: bandH, color: NAVY });
  page.drawRectangle({ x: 0, y: H - bandH - 3, width: W, height: 3, color: AMBER });

  const brandY = H - 58;
  page.drawText('FARS', { x: M, y: brandY, size: 30, font: bold, color: WHITE });
  page.drawText('Facebook Admission & Registration System', {
    x: M, y: brandY - 24, size: 10, font, color: SOFT_WHITE,
  });

  const invLabel = 'INVOICE';
  page.drawText(invLabel, {
    x: RIGHT - bold.widthOfTextAtSize(invLabel, 27),
    y: brandY, size: 27, font: bold, color: WHITE,
  });
  const metaY = brandY - 22;
  const rightAlign = (txt, y, size, col) =>
    page.drawText(txt, { x: RIGHT - font.widthOfTextAtSize(txt, size), y, size, font, color: col });
  rightAlign(`No: ${invNo}`, metaY, 9.5, SOFT_WHITE);
  rightAlign(`Issued: ${todayStr}`, metaY - 15, 9.5, SOFT_WHITE);

  const badgeW = 64;
  const badgeH = 20;
  const bx = RIGHT - badgeW;
  page.drawRectangle({ x: bx, y: metaY - 43, width: badgeW, height: badgeH, color: AMBER });
  const paidW = bold.widthOfTextAtSize('PAID', 11);
  page.drawText('PAID', {
    x: bx + (badgeW - paidW) / 2,
    y: metaY - 43 + (badgeH - 11) / 2 + 2,
    size: 11, font: bold, color: NAVY,
  });

  const sectionY = H - bandH - 3 - 40;
  page.drawText('BILLED TO', { x: M, y: sectionY, size: 10, font: bold, color: NAVY });

  const fields = [
    { text: student.student_name, size: 13, bold: true, color: TEXT },
    { text: `Student ID: ${student.student_id_number || 'N/A'}`, size: 10, color: GREY },
    { text: `Mobile: ${student.mobile}`, size: 10, color: GREY },
  ];
  if (student.email) fields.push({ text: `Email: ${student.email}`, size: 10, color: GREY });
  if (student.address) fields.push({ text: `Address: ${student.address}`, size: 10, color: GREY });

  const boxTop = sectionY - 18;
  const boxH = fields.length * 17 + 18;
  const boxBottom = boxTop - boxH;
  page.drawRectangle({
    x: M, y: boxBottom, width: CW, height: boxH,
    color: LIGHT, borderColor: BORDER, borderWidth: 1,
  });
  let fy = boxTop - 13;
  fields.forEach((f) => {
    page.drawText(f.text, { x: M + 16, y: fy, size: f.size, font: f.bold ? bold : font, color: f.color });
    fy -= 17;
  });

  const tblLabelY = boxBottom - 16;
  page.drawText('PAYMENT SUMMARY', { x: M, y: tblLabelY, size: 10, font: bold, color: NAVY });

  const headerH = 22;
  const headY = tblLabelY - 22;
  page.drawRectangle({ x: M, y: headY, width: CW, height: headerH, color: NAVY });
  const descX = M + 12;
  const methodX = M + 200;
  const trxX = M + 300;
  const headerText = (txt, x, size = 9) =>
    page.drawText(txt, { x, y: headY + 7, size, font: bold, color: WHITE });
  headerText('DESCRIPTION', descX);
  headerText('METHOD', methodX);
  headerText('TRANSACTION ID', trxX);
  headerText('AMOUNT', RIGHT - bold.widthOfTextAtSize('AMOUNT', 9));

  const rowH = 40;
  const rowY = headY - rowH;
  page.drawRectangle({ x: M, y: rowY, width: CW, height: rowH, color: LIGHT });
  const desc1 = course && course.name ? course.name : 'Course Fee';
  let desc2 = 'Course Registration Fee';
  if (course && course.code) desc2 = `${course.code} - ${desc2}`;
  page.drawText(desc1, { x: descX, y: rowY + rowH - 16, size: 11, font: bold, color: TEXT });
  page.drawText(desc2, { x: descX, y: rowY + rowH - 32, size: 8.5, font, color: GREY });
  page.drawText(methodLabel(payment.method), { x: methodX, y: rowY + rowH / 2 - 5, size: 10, font: bold, color: TEXT });
  page.drawText(payment.trxid || '—', { x: trxX, y: rowY + rowH / 2 - 5, size: 9, font, color: GREY });
  const amtStr = `BDT ${Number(payment.amount).toLocaleString()}`;
  page.drawText(amtStr, {
    x: RIGHT - bold.widthOfTextAtSize(amtStr, 11),
    y: rowY + rowH - 16, size: 11, font: bold, color: NAVY,
  });

  const totY = rowY - 26;
  page.drawRectangle({ x: M, y: totY, width: CW, height: 26, color: LIGHT, borderColor: BORDER, borderWidth: 1 });
  page.drawText('TOTAL PAID', { x: descX, y: totY + 8, size: 10, font: bold, color: NAVY });
  page.drawText(amtStr, {
    x: RIGHT - bold.widthOfTextAtSize(amtStr, 13),
    y: totY + 5, size: 13, font: bold, color: NAVY,
  });

  const infoY = totY - 16;
  page.drawText('PAYMENT INFORMATION', { x: M, y: infoY, size: 10, font: bold, color: NAVY });
  const gap = 16;
  const cardW = (CW - gap * 2) / 3;
  const cardsY = infoY - 18 - 58;
  const cards = [
    { label: 'PAYMENT METHOD', value: methodLabel(payment.method) },
    { label: 'TRANSACTION ID', value: payment.trxid || '—' },
    { label: 'PAYMENT DATE', value: fmtDate(payment.payment_date) },
  ];
  cards.forEach((c, i) => {
    const cx = M + i * (cardW + gap);
    page.drawRectangle({
      x: cx, y: cardsY, width: cardW, height: 58,
      color: LIGHT, borderColor: BORDER, borderWidth: 1,
    });
    page.drawText(c.label, { x: cx + 12, y: cardsY + 58 - 17, size: 7.5, font: bold, color: GREY });
    page.drawText(c.value, { x: cx + 12, y: cardsY + 58 - 35, size: 10.5, font: bold, color: TEXT });
  });

  const footY = cardsY - 42;
  page.drawLine({
    start: { x: M, y: footY + 10 },
    end: { x: RIGHT, y: footY + 10 },
    thickness: 0.6,
    color: BORDER,
  });
  page.drawText('Thank you for your payment. Your application has been confirmed.', {
    x: M, y: footY - 8, size: 10.5, font: bold, color: NAVY,
  });
  page.drawText(
    'This is a computer-generated invoice from FARS (Facebook Admission & Registration System).',
    { x: M, y: footY - 22, size: 8.5, font, color: GREY }
  );
  page.drawText(`${invNo}  -  Issued ${todayStr}  -  Status: PAID`, {
    x: M, y: footY - 36, size: 8.5, font, color: GREY,
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
