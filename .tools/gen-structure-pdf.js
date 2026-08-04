const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('D:/Office-Nanosoft/fars/project/server/node_modules/pdf-lib');

const ROOT = path.join(__dirname, '..');
const MD = path.join(ROOT, 'PROJECT_STRUCTURE.md');
const OUT = path.join(ROOT, 'SARS-Project-Structure.pdf');

const W = 595.28;
const H = 841.89;
const M = 50;

const toRgb = (hex) => {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );
};

const NAVY = toRgb('#00355f');
const AMBER = toRgb('#fea619');
const GREY = toRgb('#43474e');
const BORDER = toRgb('#c2c7d1');
const WHITE = rgb(1, 1, 1);

function extractFences(md) {
  const lines = md.split(/\r?\n/);
  const fences = [];
  let current = null;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (current === null) current = [];
      else { fences.push(current); current = null; }
      continue;
    }
    if (current !== null) current.push(line);
  }
  return fences.map((f) => ({ lines: f }));
}

function titleForIndex(i) {
  return i === 0
    ? { title: 'Server - Backend', subtitle: 'Express + MongoDB - controllers, routes, models, services' }
    : { title: 'Client - Frontend', subtitle: 'React + Vite + Tailwind - pages, components, context, services' };
}

async function main() {
  if (!fs.existsSync(MD)) throw new Error(`Missing ${MD}`);
  const md = fs.readFileSync(MD, 'utf8');
  const fences = extractFences(md);
  if (fences.length < 2) throw new Error('Expected at least 2 fenced tree blocks in the markdown.');

  const doc = await PDFDocument.create();
  const mono = await doc.embedFont(StandardFonts.Courier);
  const monoBold = await doc.embedFont(StandardFonts.CourierBold);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  fences.slice(0, 2).forEach((fence, index) => {
    const { title, subtitle } = titleForIndex(index);
    const page = doc.addPage([W, H]);

    page.drawRectangle({ x: 0, y: H - 120, width: W, height: 120, color: NAVY });
    page.drawRectangle({ x: 0, y: H - 120 - 3, width: W, height: 3, color: AMBER });

    page.drawText('SARS - Project Structure', { x: M, y: H - 60, size: 20, font: helvBold, color: WHITE });
    page.drawText(`Page ${index + 1} of 2  -  ${title}`, { x: M, y: H - 82, size: 12, font: helvBold, color: AMBER });
    page.drawText(subtitle, { x: M, y: H - 100, size: 9, font: helv, color: rgb(0.84, 0.89, 0.95) });

    const startY = H - 132;
    const lineH = 14;
    let y = startY;
    for (const lineValue of fence.lines) {
      if (y < 70) break; // guard before bottom margin
      if (lineValue.trim().length === 0) {
        y -= lineH;
        continue;
      }
      const trimmed = lineValue.length === 0 ? ' ' : lineValue;
      if (/^(server|client)\/?\s*$/.test(lineValue.trim())) {
        page.drawText(trimmed, { x: M, y, size: 9, font: monoBold, color: NAVY });
      } else {
        page.drawText(trimmed, { x: M, y, size: 8.5, font: mono, color: GREY });
      }
      y -= lineH;
    }

    page.drawText(
      'Source: PROJECT_STRUCTURE.md (edit it, then re-run: node .tools/gen-structure-pdf.js)',
      { x: M, y: 40, size: 8, font: helv, color: BORDER }
    );
  });

  const bytes = await doc.save();
  fs.writeFileSync(OUT, bytes);
  console.log(`Wrote ${OUT} (${bytes.length} bytes, 2 pages).`);
}

main().catch((e) => { console.error(e); process.exit(1); });