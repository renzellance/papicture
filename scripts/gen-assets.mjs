/* papicture — brand asset generator (run locally: node scripts/gen-assets.mjs)
   Renders the app icon, apple icon and OG image from SVG via sharp, using the
   design-system palette and the ID-photo card motif. Outputs are committed, so
   this only needs to run when the brand changes. Requires Space Grotesk
   installed locally for the OG text. */
import sharp from 'sharp';
import { mkdirSync } from 'fs';

const ACCENT = '#22489c';
const PAPER = '#f3f1ec';
const INK = '#18140f';
const MUTED = '#837a6c';
const LINE = '#e6e0d5';

/* head + shoulders silhouette inside a photo card (the Portrait placeholder motif) */
function subject(x, y, w, h, dark = false) {
  const headW = w * 0.34, headH = headW / 0.82;
  const headX = x + w / 2 - headW / 2, headY = y + h * 0.17;
  const shW = w * 0.68, shH = shW / 1.7;
  const shX = x + w / 2 - shW / 2, shY = headY + headH * 0.88;
  const skin = dark ? '#c8d0da' : '#b3bdc9';
  const cloth = dark ? '#3a4250' : '#8b97a6';
  return `
    <clipPath id="card${x}${y}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
    <g clip-path="url(#card${x}${y})">
      <ellipse cx="${shX + shW / 2}" cy="${shY + shH}" rx="${shW / 2}" ry="${shH}" fill="${cloth}"/>
      <ellipse cx="${headX + headW / 2}" cy="${headY + headH / 2}" rx="${headW / 2}" ry="${headH / 2}" fill="${skin}"/>
    </g>`;
}

/* corner crop ticks */
function ticks(x, y, w, h, len = 14, sw = 2.5, color = 'rgba(24,20,15,.5)') {
  const i = 10;
  const x0 = x + i, y0 = y + i, x1 = x + w - i, y1 = y + h - i;
  const L = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${color}" stroke-width="${sw}"/>`;
  return L(x0, y0, x0 + len, y0) + L(x0, y0, x0, y0 + len)
    + L(x1, y0, x1 - len, y0) + L(x1, y0, x1, y0 + len)
    + L(x0, y1, x0 + len, y1) + L(x0, y1, x0, y1 - len)
    + L(x1, y1, x1 - len, y1) + L(x1, y1, x1, y1 - len);
}

/* a white ID-photo card with silhouette + ticks + dimension tag */
function photoCard(x, y, w, h, rot, tag) {
  const pad = Math.round(w * 0.07);
  const px = x + pad, py = y + pad, pw = w - pad * 2, ph = h - pad * 2 - (tag ? 26 : 0);
  return `
  <g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fff"
          stroke="${LINE}" stroke-width="1.5"/>
    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#eef0f3"/>
    ${subject(px, py, pw, ph)}
    ${ticks(px, py, pw, ph)}
    ${tag ? `<text x="${px}" y="${y + h - 13}" font-family="DejaVu Sans Mono, monospace" font-size="13" font-weight="bold" letter-spacing="1.5" fill="${INK}">${tag}</text>` : ''}
  </g>`;
}

/* ---- app icon: blue field, single white ID-photo card ---- */
function iconSvg(S) {
  const cw = S * 0.56, ch = cw / 0.78;
  const cx = (S - cw) / 2, cy = (S - ch) / 2;
  const pad = cw * 0.08;
  return `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${S}" height="${S}" fill="${ACCENT}"/>
    <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="${S * 0.035}" fill="#fff"/>
    <rect x="${cx + pad}" y="${cy + pad}" width="${cw - pad * 2}" height="${ch - pad * 2}" fill="#eef0f3"/>
    ${subject(cx + pad, cy + pad, cw - pad * 2, ch - pad * 2, true)}
    ${ticks(cx + pad, cy + pad, cw - pad * 2, ch - pad * 2, S * 0.045, S * 0.012)}
  </svg>`;
}

/* ---- OG image: headline left, fanned photo cards right ---- */
const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <text x="84" y="118" font-family="Space Grotesk, sans-serif" font-size="38" font-weight="bold" letter-spacing="-1" fill="${INK}">papicture<tspan fill="${ACCENT}">.</tspan></text>
  <text x="84" y="248" font-family="Space Grotesk, sans-serif" font-size="76" font-weight="bold" letter-spacing="-2.5" fill="${INK}">One selfie.</text>
  <text x="84" y="330" font-family="Space Grotesk, sans-serif" font-size="76" font-weight="bold" letter-spacing="-2.5" fill="${INK}">Every photo you</text>
  <text x="84" y="412" font-family="Space Grotesk, sans-serif" font-size="76" font-weight="bold" letter-spacing="-2.5" fill="${INK}">need to submit.</text>
  <text x="84" y="490" font-family="DejaVu Sans, sans-serif" font-size="27" fill="${MUTED}">Philippine IDs, visas and work profiles.</text>
  <text x="84" y="556" font-family="DejaVu Sans Mono, monospace" font-size="20" font-weight="bold" letter-spacing="2" fill="${ACCENT}">DIGITAL ₱149 · PRINTED SETS DELIVERED</text>
  ${photoCard(800, 96, 230, 300, -5, '')}
  ${photoCard(975, 200, 200, 290, 5, '')}
  ${photoCard(852, 330, 185, 245, -2, '1X1 IN')}
</svg>`;

mkdirSync('app', { recursive: true });
await sharp(Buffer.from(iconSvg(512))).png().toFile('app/icon.png');
await sharp(Buffer.from(iconSvg(360))).resize(180, 180).png().toFile('app/apple-icon.png');
await sharp(Buffer.from(ogSvg)).png().toFile('app/opengraph-image.png');
console.log('wrote app/icon.png, app/apple-icon.png, app/opengraph-image.png');
