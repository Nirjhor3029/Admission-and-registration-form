const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('D:/Office-Nanosoft/fars/project/server/node_modules/pdf-lib');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'SARS-Database-Schema.pdf');

const W = 595.28;
const H = 841.89;
const M = 50;
const BOX_X = 96;
const BOX_W = 360;
const ROUTE_X = 545;
const GAP_DEFAULT = 52;

const toRgb = (hex) => {
  const h = hex.replace('#', '');
  return rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
};

const NAVY = toRgb('#00355f');
const NAVY2 = toRgb('#0f4c81');
const AMBER = toRgb('#fea619');
const TEAL = toRgb('#00544d');
const GREY = toRgb('#43474e');
const BORDER = toRgb('#c2c7d1');
const LIGHT = toRgb('#f2f3f9');
const WHITE = rgb(1, 1, 1);

const PAGES = [
  {
    title: 'Admissions & Payments',
    boxes: [
      {
        name: 'Student',
        tag: 'person record · unique mobile',
        fk: false,
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['student_name', 'String', 'required'],
          ['mobile', 'String', 'required · unique'],
          ['email', 'String', ''],
          ['whatsapp', 'String', ''],
          ['gender', 'enum', 'male/female/other'],
          ['qualification', 'String', ''],
          ['student_photo_url', 'String', 'cloudinary url'],
          ['address', 'String', ''],
          ['referral_source', 'enum', '6 sources'],
        ],
      },
      {
        name: 'Application',
        tag: 'one row per course application',
        fk: true,
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['student_id', 'ObjectId', 'FK -> Student'],
          ['course_id', 'ObjectId', 'FK -> Course'],
          ['level_id', 'ObjectId', 'FK -> ProgramLevel'],
          ['batch_id', 'ObjectId', 'FK -> Batch'],
          ['status', 'Enum[7]', 'state machine'],
          ['draft_code', 'String', 'unique · DRF-xxxxxx'],
          ['application_code', 'String', 'unique · APP-xxxxxx'],
          ['student_id_number', 'String', 'unique · FARS{yyyy}'],
          ['certificate_generated', 'Boolean', 'default false'],
        ],
      },
      {
        name: 'Payment',
        tag: 'payment attempt per application',
        fk: true,
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['student_id', 'ObjectId', 'FK -> Student'],
          ['application_id', 'ObjectId', 'FK -> Application'],
          ['method', 'enum[bkash.nagad]', 'required'],
          ['amount', 'Number', 'required'],
          ['trxid', 'String', 'required · unique'],
          ['payment_date', 'Date', 'required'],
          ['screenshot_url', 'String', ''],
          ['verified_by', 'ObjectId', 'FK -> Admin'],
          ['verified_at', 'Date', ''],
          ['rejection_reason', 'String', 'when rejected'],
          ['status', 'enum[4]', 'pending..refunded'],
        ],
      },
    ],
    edges: [
      { a: 'Student', b: 'Application' },
      { a: 'Application', b: 'Payment' },
    ],
  },
  {
    title: 'Course Catalog',
    boxes: [
      {
        name: 'CourseCategory',
        tag: 'course grouping',
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['name', 'String', 'required'],
          ['sort_order', 'Number', '0'],
          ['status', 'enum', 'active|inactive'],
        ],
      },
      {
        name: 'Course',
        tag: 'course offering',
        fk: true,
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['name', 'String', 'required'],
          ['code', 'String', 'unique · e.g. MAD'],
          ['category_id', 'ObjectId', 'FK -> CourseCategory'],
          ['fee', 'Number', 'min 0'],
          ['duration', 'String', ''],
          ['sort_order', 'Number', '0'],
          ['description', 'String', ''],
          ['status', 'enum', 'active|inactive'],
        ],
      },
      {
        name: 'ProgramLevel',
        tag: 'workshop / bootcamp',
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['name', 'String', 'required'],
          ['duration', 'String', 'required'],
          ['fee', 'Number', 'required'],
          ['time_slots', 'String[]', ''],
          ['sort_order', 'Number', '0'],
          ['status', 'enum', 'active|inactive'],
        ],
      },
      {
        name: 'Batch',
        tag: 'course + level batch',
        fk: true,
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['course_id', 'ObjectId', 'FK -> Course'],
          ['level_id', 'ObjectId', 'FK -> ProgramLevel'],
          ['batch_name', 'String', 'required'],
          ['start_date', 'Date', 'required'],
          ['capacity', 'Number', 'required'],
          ['seats_filled', 'Number', 'default 0'],
          ['sort_order', 'Number', '0'],
          ['class_schedule', 'String', ''],
          ['status', 'enum[5]', 'upcoming..completed'],
        ],
      },
    ],
    edges: [
      { a: 'CourseCategory', b: 'Course' },
      { a: 'Course', b: 'Batch' },
      { a: 'ProgramLevel', b: 'Batch' },
    ],
  },
  {
    title: 'Admin, Audit & Config',
    boxes: [
      {
        name: 'Admin',
        tag: 'staff account',
        fk: true,
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['name', 'String', 'required'],
          ['email', 'String', 'required · unique'],
          ['password_hash', 'String', 'bcrypt rounds 12'],
          ['role', 'enum[4]', 'permission levels'],
        ],
      },
      {
        name: 'AuditLog',
        tag: 'admin action journal',
        fk: true,
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['admin_id', 'ObjectId', 'FK -> Admin'],
          ['action', 'String', 'required'],
          ['target_type', 'enum', 'student/payment/course/...'],
          ['target_id', 'ObjectId', 'polymorphic'],
          ['details', 'String', ''],
        ],
      },
      {
        name: 'PaymentConfig',
        tag: 'singleton document',
        fields: [
          ['_id', 'ObjectId', 'PK'],
          ['bkash_number', 'String', ''],
          ['nagad_number', 'String', ''],
        ],
      },
    ],
    edges: [{ a: 'Admin', b: 'AuditLog' }],
  },
];

async function main() {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvB = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const monoB = await doc.embedFont(StandardFonts.CourierBold);
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  PAGES.forEach((pg, pi) => {
    const page = doc.addPage([W, H]);

    page.drawRectangle({ x: 0, y: H - 110, width: W, height: 110, color: NAVY });
    page.drawRectangle({ x: 0, y: H - 110 - 3, width: W, height: 3, color: AMBER });
    page.drawText('SARS - Database Schema', { x: M, y: H - 56, size: 20, font: helvB, color: WHITE });
    page.drawText(`Page ${pi + 1} of ${PAGES.length}  -  ${pg.title}`, { x: M, y: H - 78, size: 12, font: helvB, color: AMBER });
    page.drawText(`MongoDB / Mongoose collections - generated ${today} - source: DATABASE_SCHEMA.md`, {
      x: M, y: H - 96, size: 9, font: helv, color: rgb(0.84, 0.89, 0.95),
    });

    const rects = {};
    const th = 22;
    const fh = 13;
    let top = H - 128;
    pg.boxes.forEach((box) => {
      const bodyH = box.fields.length * fh + 12;
      const bh = th + bodyH;
      const y = top - bh;
      rects[box.name] = { x: BOX_X, y, w: BOX_W, h: bh, cx: BOX_X + BOX_W / 2 };

      page.drawRectangle({ x: BOX_X, y, width: BOX_W, height: th, color: box.fk ? NAVY2 : TEAL });
      page.drawText(box.name, { x: BOX_X + 10, y: y + 6, size: 11, font: helvB, color: WHITE });
      if (box.tag) {
        page.drawText(box.tag, { x: BOX_X + BOX_W - 8 - helv.widthOfTextAtSize(box.tag, 8), y: y + 7, size: 8, font: helv, color: rgb(0.85, 0.9, 0.95) });
      }

      const by = y - bodyH;
      page.drawRectangle({ x: BOX_X, y: by, width: BOX_W, height: bodyH, color: LIGHT, borderColor: BORDER, borderWidth: 1 });

      let fy = y - fh - 3;
      box.fields.forEach(([n, t, note]) => {
        const isPK = n === '_id';
        const isFK = /^FK ->/.test(note);
        page.drawText(n, { x: BOX_X + 12, y: fy, size: 9.5, font: monoB, color: isPK ? NAVY : isFK ? TEAL : GREY });
        page.drawText(t, { x: BOX_X + BOX_W - 118, y: fy, size: 9, font: mono, color: isFK ? NAVY2 : BORDER });
        if (note) page.drawText(note, { x: BOX_X + BOX_W - 6 - mono.widthOfTextAtSize(note, 7.5), y: fy - 8, size: 7.5, font: mono, color: isPK ? AMBER : isFK ? NAVY : BORDER });
        fy -= fh;
      });

      top = y - bh - GAP;
    });

    const arrow = (x, y, dx, dy, color) => {
      page.drawLine({ start: { x, y }, end: { x: x + dx, y: y + dy }, thickness: 1.2, color });
    };

    pg.edges.forEach((e) => {
      const A = rects[e.a];
      const B = rects[e.b];
      if (!A || !B) return;
      const aBottom = A.y;            // bottom edge y of source box
      const bTop = B.y + 22;          // top edge y of target box
      const ax = A.cx;
      const bx = B.cx;

      page.drawLine({ start: { x: ax, y: aBottom }, end: { x: ROUTE_X, y: aBottom }, thickness: 1.2, color: NAVY });
      page.drawLine({ start: { x: ROUTE_X, y: aBottom }, end: { x: ROUTE_X, y: bTop }, thickness: 1.2, color: NAVY });
      page.drawLine({ start: { x: ROUTE_X, y: bTop }, end: { x: bx, y: bTop }, thickness: 1.2, color: NAVY });
      arrow(bx - 6, bTop + 4, 6, -4, NAVY); // arrowhead pointing up into target top

      page.drawText('1', { x: ROUTE_X + 4, y: aBottom - 2, size: 9, font: helvB, color: AMBER });
      page.drawText('N', { x: ROUTE_X + 4, y: bTop + 4, size: 9, font: helvB, color: AMBER });
    });

    page.drawText('Cross-page references are shown on the field itself (e.g. course_id -> Course).', {
      x: M, y: 36, size: 8, font: helv, color: BORDER,
    });
  });

  const bytes = await doc.save();
  fs.writeFileSync(OUT, bytes);
  console.log(`Wrote ${OUT} (${bytes.length} bytes, ${PAGES.length} pages).`);
}

main().catch((e) => { console.error(e); process.exit(1); });