'use strict';
// ============================================================
//  Cœur : utilitaires, éléments, moteur de pixel art procédural
// ============================================================
window.G = window.G || {};

const U = G.U = {
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  rand(a, b) { return a + Math.random() * (b - a); },
  randi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  pick(a) { return a[Math.floor(Math.random() * a.length)]; },
  chance(p) { return Math.random() < p; },
  hash(x, y, s) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s | 0) + 1, 982451653);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  },
  noise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const sm = t => t * t * (3 - 2 * t);
    const a = U.hash(xi, yi, s), b = U.hash(xi + 1, yi, s), c = U.hash(xi, yi + 1, s), d = U.hash(xi + 1, yi + 1, s);
    const u = sm(xf), v = sm(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  },
  fbm(x, y, s) { return U.noise(x, y, s) * 0.6 + U.noise(x * 2, y * 2, s + 7) * 0.3 + U.noise(x * 4, y * 4, s + 13) * 0.1; },
  hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  },
  rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); },
  mix(a, b, t) {
    const A = U.hex2rgb(a), B = U.hex2rgb(b);
    return U.rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  },
  rgba(hex, a) { const c = U.hex2rgb(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; },
  shades(c) { return [U.mix(c, '#1a1030', 0.4), c, U.mix(c, '#fff6e0', 0.38)]; },
  wait(ms) { return new Promise(r => setTimeout(r, ms)); },
  fmt(n) { return Math.floor(n).toLocaleString('fr-FR'); },
  esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
  el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; },
  canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; },
};

// ---------------- Éléments ----------------
G.ELEM = {
  feu: { n: 'Feu', c: '#ff6a3d', i: '🔥' },
  eau: { n: 'Eau', c: '#43a8ff', i: '💧' },
  vent: { n: 'Vent', c: '#7dffb0', i: '🌪️' },
  terre: { n: 'Terre', c: '#d8a84a', i: '🪨' },
};
G.ELEM_ORDER = ['feu', 'eau', 'vent', 'terre'];
// X bat Y : l'eau éteint le feu, le feu consume le vent, le vent érode la terre, la terre absorbe l'eau
G.BEATS = { eau: 'feu', feu: 'vent', vent: 'terre', terre: 'eau' };
G.elemMult = (a, d) => {
  if (!a || !d) return 1;
  if (G.BEATS[a] === d) return 1.5;
  if (a === d) return 0.5;
  return 1;
};
G.weakTo = e => e ? Object.keys(G.BEATS).find(k => G.BEATS[k] === e) : null;

// ---------------- Grille de pixels ----------------
G.Pix = class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  set(x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    this.d[y * this.w + x] = c;
  }
  get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null; return this.d[y * this.w + x]; }
  rect(x, y, w, h, c) {
    const sh = Array.isArray(c);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      let col = c;
      if (sh) col = (j === 0 || i === 0) ? c[2] : (j >= h - 1 || i >= w - 1) ? c[0] : c[1];
      this.set(x + i, y + j, col);
    }
  }
  _shade(c, nx, ny, r) {
    const l = -(nx * 0.55 + ny * 0.83);
    if (r > 0.78 && l < 0.1) return c[0];
    return l > 0.42 ? c[2] : l < -0.3 ? c[0] : c[1];
  }
  ell(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, r = nx * nx + ny * ny;
        if (r > 1) continue;
        this.set(x, y, Array.isArray(c) ? this._shade(c, nx, ny, r) : c);
      }
  }
  poly(pts, c) {
    let minY = Infinity, maxY = -Infinity;
    pts.forEach(p => { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const yy = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) {
          let col = c;
          if (Array.isArray(c)) { const t = (y - minY) / Math.max(1, maxY - minY); col = t < 0.3 ? c[2] : t > 0.72 ? c[0] : c[1]; }
          this.set(x, y, col);
        }
    }
  }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  // trace épais le long d'une suite de points (cous, queues…)
  thick(pts, r0, r1, c) {
    const steps = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
      for (let k = 0; k < n; k++) steps.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    steps.push(pts[pts.length - 1]);
    steps.forEach((p, i) => { const r = r0 + (r1 - r0) * i / Math.max(1, steps.length - 1); this.ell(p[0], p[1], r, r, c); });
  }
  ascii(lines, pal, ox = 0, oy = 0) {
    lines.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch !== '.' && pal[ch]) this.set(ox + x, oy + y, pal[ch]); } });
  }
  outline(col = '#140c1c') {
    const o = this.d.slice();
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.d[y * this.w + x]) continue;
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) o[y * this.w + x] = col;
    }
    this.d = o;
    return this;
  }
  mirror() {
    const p = new Pix(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) p.d[y * this.w + x] = this.d[y * this.w + (this.w - 1 - x)];
    return p;
  }
  toCanvas() {
    const c = U.canvas(this.w, this.h), x = c.getContext('2d');
    for (let i = 0; i < this.d.length; i++) if (this.d[i]) { x.fillStyle = this.d[i]; x.fillRect(i % this.w, Math.floor(i / this.w), 1, 1); }
    return c;
  }
};
