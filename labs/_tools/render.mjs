// Draws the thirty inspection pictures and the piping and instrumentation diagram, and writes
// them as PNG files into labs/files/photos/ and labs/files/drawings/.
//
//   node labs/_tools/render.mjs            every picture
//   node labs/_tools/render.mjs P06 pid    some of them
//
// Run by the course author, once, on a computer with Chrome: each picture is an SVG drawn from
// the table PHOTOS of world.mjs and photographed by headless Chrome. The known value of a picture
// and the position of its pointer come from the same row, so the two cannot disagree. No model
// draws anything: these are props that play the part of photographs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PHOTOS, NAMEPLATES } from './world.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = path.join(HERE, '..', 'files');
const CHROME = process.env.CHROME || [
  path.join(process.env.PROGRAMFILES || '', 'Google/Chrome/Application/chrome.exe'),
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find(p => fs.existsSync(p));

const T = (x, y, s, size = 16, o = '') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" text-anchor="middle" ${o}>${s}</text>`;
const wall = (c1 = '#b9b4a8', c2 = '#8f8a7e') => `<defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="gl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".97"/><stop offset=".6" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="soft"><feGaussianBlur stdDeviation="0.6"/></filter><filter id="blur"><feGaussianBlur stdDeviation="7"/></filter><filter id="dirt"><feGaussianBlur stdDeviation="5"/></filter></defs>
<rect width="640" height="480" fill="url(#w)"/><rect x="0" y="330" width="640" height="46" fill="#5d6b73"/><rect x="0" y="330" width="640" height="8" fill="#75848c"/>`;
const plate = (tag, y = 440) => `<rect x="250" y="${y - 24}" width="140" height="34" rx="4" fill="#e9d36b" stroke="#333" stroke-width="2"/>${T(320, y, tag, 20, 'font-weight="700" fill="#222"')}`;
const dirt = spots => spots.map(([x, y, r, o]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="#4a3a22" opacity="${o}" filter="url(#dirt)"/>`).join('');
const glare = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#gl)"/>`;
const skew = inner => `<g transform="translate(70 30) matrix(0.80 0.10 -0.22 0.92 60 -20)">${inner}</g>`;

// ---- an analog gauge: 270 degrees of scale, zero at the lower left
function gauge(p) {
  const { max, major, minor, dual, redmax } = p.g; const cx = 320, cy = 215, R = 150;
  const ang = v => (225 - 270 * (v / max)) * Math.PI / 180;
  const pt = (v, r) => [cx + r * Math.cos(ang(v)), cy - r * Math.sin(ang(v))];
  let s = `<circle cx="${cx}" cy="${cy}" r="${R + 22}" fill="#2b2f33"/><circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="#f6f4ee" stroke="#111" stroke-width="3"/>`;
  const steps = Math.round(max / minor);
  for (let i = 0; i <= steps; i++) {
    const v = i * minor, isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-6;
    const [x1, y1] = pt(v, R), [x2, y2] = pt(v, R - (isMajor ? 24 : 12));
    s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#111" stroke-width="${isMajor ? 4 : 2}"/>`;
    if (isMajor) { const [tx, ty] = pt(v, R - 44); s += T(tx.toFixed(1), (ty + 7).toFixed(1), Number(v.toFixed(2)), 22, 'font-weight="700" fill="#111"'); }
  }
  if (dual) { // an inner scale in psi, in red
    const pmax = max * 14.5;
    for (let v = 0; v <= pmax; v += 5) {
      const a = (225 - 270 * (v / pmax)) * Math.PI / 180, big = v % 10 === 0;
      const q = r => [cx + r * Math.cos(a), cy - r * Math.sin(a)]; const [x1, y1] = q(R - 62), [x2, y2] = q(R - (big ? 74 : 68));
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#b3261e" stroke-width="2"/>`;
      if (big) { const [tx, ty] = q(R - 88); s += T(tx.toFixed(1), (ty + 5).toFixed(1), v, 14, 'fill="#b3261e"'); }
    }
    s += T(cx, cy + 96, 'psi', 14, 'fill="#b3261e"');
  }
  s += T(cx, cy + 72, p.unit, 22, 'font-weight="700" fill="#111"');
  const needle = (v, col, w, len) => { const [x, y] = pt(v, len), [bx, by] = pt(v, -26); return `<line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; };
  if (redmax) s += needle(redmax, '#d32f2f', 3, R - 16);
  s += needle(p.truth, '#111', 6, R - 20) + `<circle cx="${cx}" cy="${cy}" r="11" fill="#111"/>`;
  return s;
}
// ---- a seven-segment display
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function digit(ch, x, y, on) {
  const w = 56, h = 104, t = 11; const seg = { a: [x + t, y, w - 2 * t, t], b: [x + w - t, y + t, t, h / 2 - t * 1.5], c: [x + w - t, y + h / 2 + t / 2, t, h / 2 - t * 1.5], d: [x + t, y + h - t, w - 2 * t, t], e: [x, y + h / 2 + t / 2, t, h / 2 - t * 1.5], f: [x, y + t, t, h / 2 - t * 1.5], g: [x + t, y + h / 2 - t / 2, w - 2 * t, t] };
  return [...SEG[ch]].map(k => `<rect x="${seg[k][0]}" y="${seg[k][1]}" width="${seg[k][2]}" height="${seg[k][3]}" rx="3" fill="${on}"/>`).join('');
}
function display(p) {
  const low = p.cond === 'low'; const lcd = low ? '#a3ad97' : '#b8c9a3', on = low ? '#8d987f' : '#1c241a';
  let s = `<rect x="90" y="70" width="460" height="250" rx="14" fill="#30363b" stroke="#111" stroke-width="3"/><rect x="120" y="120" width="400" height="150" rx="6" fill="${lcd}" stroke="#111" stroke-width="2"/>`;
  s += T(200, 104, p.tag, 22, 'font-weight="700" fill="#e8e8e8"');
  const chars = [...p.d]; const n = chars.filter(c => c !== '.').length; let x = 150 + (4 - n) * 34;
  for (const c of chars) { if (c === '.') { s += `<rect x="${x - 6}" y="237" width="11" height="11" fill="${on}"/>`; x += 14; } else { s += digit(c, x, 143, on); x += 72; } }
  s += T(478, 250, p.unit, 20, `font-weight="700" fill="${on}"`);
  return s;
}
function nameplate(p) {
  const f = NAMEPLATES[p.tag]; const rows = Object.entries(f);
  let s = `<rect x="150" y="90" width="340" height="230" rx="8" fill="#c9ccce" stroke="#555" stroke-width="3"/>${[[166, 106], [474, 106], [166, 304], [474, 304]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#777"/>`).join('')}`;
  s += T(320, 128, 'NAMEPLATE ' + p.tag, 15, 'font-weight="700" fill="#222"');
  rows.forEach(([k, v], i) => { const y = 158 + i * 26; s += `<text x="186" y="${y}" font-family="Consolas, monospace" font-size="15" fill="#222">${k}</text><text x="300" y="${y}" font-family="Consolas, monospace" font-size="15" fill="#111">${v}</text><line x1="180" y1="${y + 7}" x2="460" y2="${y + 7}" stroke="#8a8d90" stroke-width="1"/>`; });
  return s;
}
function level(p) {
  const { max, major, minor } = p.l; const y = v => 400 - 330 * (v / max); const staff = p.tag === 'LS-101';
  let s = staff ? `<rect x="280" y="50" width="80" height="370" fill="#f3f1e7" stroke="#222" stroke-width="2"/>` : `<rect x="190" y="50" width="60" height="370" rx="8" fill="#dfe6ea" stroke="#333" stroke-width="3"/><rect x="290" y="50" width="70" height="370" fill="#f3f1e7" stroke="#222" stroke-width="2"/>`;
  const n = Math.round(max / minor);
  for (let i = 0; i <= n; i++) { const v = i * minor, big = Math.abs(v / major - Math.round(v / major)) < 1e-6; s += `<line x1="${staff ? 280 : 290}" y1="${y(v)}" x2="${(staff ? 280 : 290) + (big ? 34 : 18)}" y2="${y(v)}" stroke="#111" stroke-width="${big ? 3 : 1.5}"/>`; if (big) s += T(staff ? 338 : 340, y(v) + 6, Number(v.toFixed(1)), 17, 'font-weight="700" fill="#111"'); }
  s += T(staff ? 320 : 325, 40, p.unit, 18, 'font-weight="700" fill="#111"');
  s += staff ? `<rect x="0" y="${y(p.truth)}" width="640" height="${480 - y(p.truth)}" fill="#3c4a3f" opacity=".62"/><line x1="0" y1="${y(p.truth)}" x2="640" y2="${y(p.truth)}" stroke="#cfd8d0" stroke-width="2"/>`
    : `<rect x="194" y="${y(p.truth)}" width="52" height="${416 - y(p.truth)}" fill="#3f7fbf" opacity=".85"/><line x1="194" y1="${y(p.truth)}" x2="246" y2="${y(p.truth)}" stroke="#1d4f80" stroke-width="3"/>`;
  return s;
}
function tagPic(p) {
  if (p.id === 'P27') return `<circle cx="320" cy="210" r="120" fill="#d8b93a" stroke="#333" stroke-width="4"/><circle cx="320" cy="112" r="10" fill="#8f8a7e" stroke="#333" stroke-width="2"/>${T(320, 226, 'HV-112B', 44, 'font-weight="700" fill="#2a2a2a" font-family="Consolas, monospace"')}`;
  if (p.id === 'P28') return `<rect x="170" y="130" width="300" height="160" rx="6" fill="#f4f4f0" stroke="#1b5e20" stroke-width="5"/>${T(320, 172, 'CALIBRATION', 22, 'font-weight="700" fill="#1b5e20"')}${T(320, 212, p.tag, 24, 'font-weight="700" fill="#111"')}${T(320, 258, p.t, 26, 'font-weight="700" fill="#111"')}`;
  if (p.id === 'P29') return `<rect x="200" y="70" width="240" height="300" rx="14" fill="#c62828" stroke="#333" stroke-width="3"/><circle cx="320" cy="100" r="12" fill="#8f8a7e"/>${T(320, 160, 'DANGER', 40, 'font-weight="700" fill="#fff"')}${T(320, 200, 'DO NOT OPERATE', 22, 'font-weight="700" fill="#fff"')}<rect x="222" y="226" width="196" height="110" fill="#fff"/>${T(320, 262, p.tag, 22, 'font-weight="700" fill="#111"')}${T(320, 310, p.t, 28, 'font-weight="700" fill="#111"')}`;
  return `<rect x="60" y="80" width="520" height="260" fill="#3a3f44"/>${[150, 250, 350, 450].map((x, i) => `<rect x="${x - 26}" y="140" width="52" height="120" rx="4" fill="#d9d5c8" stroke="#222" stroke-width="2"/><rect x="${x - 22}" y="268" width="44" height="18" fill="#fff"/>${T(x, 282, ['F-22B', 'F-23B', 'F-24B', 'F-25B'][i], 11, 'fill="#222"')}`).join('')}`;
}
function photo(p) {
  let body = p.kind === 'G' ? gauge(p) : p.kind === 'D' ? display(p) : p.kind === 'N' ? nameplate(p) : p.kind === 'L' ? level(p) : tagPic(p);
  if (p.kind !== 'T' && p.kind !== 'N') body += plate(p.tag);
  if (p.cond === 'angled') body = skew(body);
  let over = '';
  if (p.cond === 'glare') over = p.kind === 'D' ? glare(262, 236, 60, 34) : glare(360, 150, 120, 70);
  if (p.cond === 'dirty') over = p.kind === 'N' ? dirt([[330, 262, 34, .5], [250, 190, 50, .35], [420, 290, 40, .3]]) : p.kind === 'T' ? dirt([[398, 214, 22, .5], [270, 170, 46, .3]]) : dirt([[230, 150, 60, .3], [420, 300, 70, .28], [330, 90, 40, .25]]);
  const inner = wall() + (p.cond === 'blur' ? `<g filter="url(#blur)">${body}</g>` : `<g filter="url(#soft)">${body}</g>`) + over;
  return { w: 640, h: 480, svg: inner, out: path.join(FILES, 'photos', p.id + '.png') };
}

// ---- the piping and instrumentation diagram
function pid() {
  const L = (x1, y1, x2, y2, w = 4) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="${w}"/>`;
  const lab = (x, y, s, size = 15, o = '') => T(x, y, s, size, `fill="#111" ${o}`);
  const valve = (x, y, tag, closed, vertical) => { const a = vertical ? `M${x - 12} ${y - 18} L${x + 12} ${y - 18} L${x - 12} ${y + 18} L${x + 12} ${y + 18} Z` : `M${x - 18} ${y - 12} L${x - 18} ${y + 12} L${x + 18} ${y - 12} L${x + 18} ${y + 12} Z`; return `<path d="${a}" fill="${closed ? '#111' : '#fff'}" stroke="#111" stroke-width="2.5"/>` + (vertical ? `<text x="${x + 20}" y="${y + 5}" font-family="Arial" font-size="13" fill="#111">${tag}</text>` : lab(x, y - 20, tag, 13)); };
  const check = (x, y, tag) => `<path d="M${x - 18} ${y - 12} L${x - 18} ${y + 12} L${x + 18} ${y} Z" fill="#fff" stroke="#111" stroke-width="2.5"/><line x1="${x + 18}" y1="${y - 12}" x2="${x + 18}" y2="${y + 12}" stroke="#111" stroke-width="3"/>` + lab(x, y - 20, tag, 13);
  const bubble = (x, y, a, b) => `<circle cx="${x}" cy="${y}" r="26" fill="#fff" stroke="#111" stroke-width="2.5"/>` + lab(x, y - 3, a, 14, 'font-weight="700"') + lab(x, y + 15, b, 13);
  const arrow = (x, y, dir) => dir === 'l' ? `<path d="M${x} ${y} l16 -9 v18 Z" fill="#111"/>` : dir === 'r' ? `<path d="M${x} ${y} l-16 -9 v18 Z" fill="#111"/>` : `<path d="M${x} ${y} l-9 16 h18 Z" fill="#111"/>`;
  let s = `<rect width="1200" height="760" fill="#fff"/><rect x="8" y="8" width="1184" height="744" fill="none" stroke="#111" stroke-width="2"/>`;
  s += `<rect x="40" y="270" width="170" height="330" fill="#eef3f6" stroke="#111" stroke-width="3"/><path d="M40 420 q42 -14 85 0 t85 0" fill="none" stroke="#111" stroke-width="2"/>` + lab(125, 580, 'WET WELL', 15, 'font-weight="700"');
  s += L(100, 270, 100, 236, 2) + bubble(100, 210, 'LT', '101') + L(165, 270, 165, 236, 2) + bubble(165, 210, 'AT', '130');
  s += L(210, 420, 300, 420) + L(300, 250, 300, 590) + arrow(270, 420, 'r');
  s += L(940, 250, 940, 590) + L(940, 250, 940, 110) + L(940, 110, 60, 110) + arrow(60, 110, 'l') + arrow(660, 110, 'l') + arrow(400, 110, 'l') + arrow(940, 170, 'u');
  s += lab(120, 96, 'TO RISING MAIN', 14, 'font-weight="700"') + lab(860, 100, 'DN400', 11);
  s += L(760, 110, 760, 84, 2) + bubble(760, 58, 'PT', '110') + L(540, 110, 540, 84, 2) + bubble(540, 58, 'FT', '120');
  ['A', 'B', 'C'].forEach((k, i) => {
    const y = 250 + i * 170;
    s += L(300, y, 940, y) + valve(390, y, 'HV-111' + k, false) + `<circle cx="540" cy="${y}" r="34" fill="#fff" stroke="#111" stroke-width="3"/><path d="M540 ${y - 34} L574 ${y} L540 ${y + 34}" fill="none" stroke="#111" stroke-width="2.5"/>` + lab(540, y + 5, 'P', 15, 'font-weight="700"') + `<text x="432" y="${y + 44}" font-family="Arial" font-size="15" font-weight="700" fill="#111">P-101${k}</text>`;
    s += check(690, y, 'NRV-103' + k) + valve(820, y, 'HV-112' + k, false) + arrow(880, y, 'r');
    s += L(540, y - 34, 540, y - 76, 2) + valve(540, y - 58, 'HV-115' + k, true, true) + L(540, y + 34, 540, y + 76, 2) + valve(540, y + 58, 'HV-116' + k, true, true);
    s += `<rect x="622" y="${y + 30}" width="64" height="26" fill="#fff" stroke="#111" stroke-width="2"/>` + lab(654, y + 48, 'VFD-101' + k, 11);
  });
  s += `<rect x="966" y="440" width="218" height="260" fill="#fff" stroke="#111" stroke-width="2"/>` + lab(1075, 464, 'LEGEND', 14, 'font-weight="700"');
  s += valve(1000, 498, '', false) + `<text x="1030" y="503" font-family="Arial" font-size="11">NORMALLY OPEN VALVE</text>` + valve(1000, 542, '', true) + `<text x="1030" y="547" font-family="Arial" font-size="11">NORMALLY CLOSED VALVE</text>`;
  s += check(1000, 586, '') + `<text x="1030" y="591" font-family="Arial" font-size="12">NON-RETURN VALVE</text>` + `<circle cx="1000" cy="630" r="16" fill="#fff" stroke="#111" stroke-width="2"/><text x="1030" y="635" font-family="Arial" font-size="12">INSTRUMENT</text>` + arrow(1008, 672, 'r') + `<text x="1030" y="677" font-family="Arial" font-size="12">FLOW DIRECTION</text>`;
  s += `<text x="40" y="736" font-family="Arial" font-size="14" font-weight="700">AFLAJ WASTEWATER SERVICES · AL-RABWA PUMPING STATION PS-07 · P&amp;ID SHEET 1 · REV D · SYNTHETIC TRAINING DRAWING</text>`;
  return { w: 1200, h: 760, svg: s, out: path.join(FILES, 'drawings', 'pid_ps07.png') };
}

if (!CHROME) { console.error('Chrome was not found: set CHROME to its path'); process.exit(2); }
const want = process.argv.slice(2);
const jobs = [...PHOTOS.map(p => [p.id, () => photo(p)]), ['pid', pid]].filter(([id]) => !want.length || want.includes(id));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pro211-'));
fs.mkdirSync(path.join(FILES, 'photos'), { recursive: true }); fs.mkdirSync(path.join(FILES, 'drawings'), { recursive: true });
for (const [id, make] of jobs) {
  const j = make();
  const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}svg{display:block}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${j.w} ${j.h}" width="${j.w}" height="${j.h}">${j.svg}</svg>`;
  const pagePath = path.join(tmp, id + '.html');
  fs.writeFileSync(pagePath, html, 'utf8');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${j.w},${j.h}`, '--user-data-dir=' + path.join(tmp, 'profile'), '--screenshot=' + j.out, pathToFileURL(pagePath).href], { stdio: 'ignore' });
  console.log('drew', id, fs.statSync(j.out).size, 'bytes');
}
fs.rmSync(tmp, { recursive: true, force: true });
