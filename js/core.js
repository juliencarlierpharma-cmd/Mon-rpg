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
// Les coordonnées passées aux méthodes sont « logiques » ; la grille réelle
// fait w*k × h*k pixels, ce qui permet de dessiner les mêmes formes avec plus
// de détails (courbes plus douces, ombrages plus fins).
G.Pix = class Pix {
  constructor(w, h, k = 1) { this.k = k; this.w = Math.round(w * k); this.h = Math.round(h * k); this.d = new Array(this.w * this.h).fill(null); }
  _s(X, Y, c) { if (X < 0 || Y < 0 || X >= this.w || Y >= this.h || !c) return; this.d[Y * this.w + X] = c; }
  // pixel « logique » (bloc k×k)
  set(x, y, c) { const k = this.k, X = Math.floor(x * k), Y = Math.floor(y * k); for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) this._s(X + i, Y + j, c); }
  // efface un pixel réel
  erase(x, y) { const X = Math.floor(x * this.k), Y = Math.floor(y * this.k); if (X >= 0 && Y >= 0 && X < this.w && Y < this.h) this.d[Y * this.w + X] = null; }
  // pixel réel unique (détails fins)
  dot(x, y, c) { const k = this.k, n = Math.max(1, Math.round(k / 2)), X = Math.floor(x * k), Y = Math.floor(y * k); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) this._s(X + i, Y + j, c); }
  // un seul pixel réel (traits très fins)
  px1(x, y, c) { this._s(Math.floor(x * this.k), Math.floor(y * this.k), c); }
  get(X, Y) { if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) return null; return this.d[Y * this.w + X]; }
  rect(x, y, w, h, c) {
    const k = this.k, X0 = Math.round(x * k), Y0 = Math.round(y * k), W = Math.max(1, Math.round(w * k)), H = Math.max(1, Math.round(h * k));
    const sh = Array.isArray(c), P = sh ? Pix.tones(c) : null;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      let col = c;
      if (sh) { const t = (j / Math.max(1, H - 1)) * 0.75 + (i / Math.max(1, W - 1)) * 0.25; col = this.smooth ? Pix.ramp(c)[Math.round((1 - U.clamp(t, 0, 1) * 0.85) * 32)] : j < k || i < k ? P[4] : (j >= H - k || i >= W - k) ? P[0] : P[t < 0.35 ? 3 : t < 0.7 ? 2 : 1]; }
      this._s(X0 + i, Y0 + j, col);
    }
  }
  // 3 tons [sombre, moyen, clair] -> 5 tons
  static tones(c) { if (c.length >= 5) return c; return c._t || (c._t = [c[0], U.mix(c[0], c[1], 0.5), c[1], U.mix(c[1], c[2], 0.5), c[2]]); }
  // dégradé continu (rendu lisse) : 33 teintes interpolées entre les 5 tons
  static ramp(c) {
    if (c._r) return c._r;
    const P = Pix.tones(c), R = [];
    for (let i = 0; i <= 32; i++) { const t = i / 32 * 4, a = Math.min(3, Math.floor(t)); R.push(U.mix(P[a], P[a + 1], t - a)); }
    return (c._r = R);
  }
  _shade(c, nx, ny, r) {
    if (this.smooth) {
      const R = Pix.ramp(c), l = -(nx * 0.55 + ny * 0.83), rim = r > 0.7 ? (r - 0.7) / 0.3 * Math.max(0, 0.5 - l) * 0.9 : 0;
      const t = U.clamp((l + 0.85) / 1.6 - rim, 0, 1);
      return R[Math.round(t * 32)];
    }
    const P = Pix.tones(c), l = -(nx * 0.55 + ny * 0.83);
    if (r > 0.82 && l < 0.15) return P[0];
    return l > 0.55 ? P[4] : l > 0.25 ? P[3] : l > -0.15 ? P[2] : l > -0.45 ? P[1] : P[0];
  }
  ell(cx, cy, rx, ry, c) {
    const k = this.k;
    for (let Y = Math.floor((cy - ry - 1) * k); Y <= Math.ceil((cy + ry + 1) * k); Y++)
      for (let X = Math.floor((cx - rx - 1) * k); X <= Math.ceil((cx + rx + 1) * k); X++) {
        const nx = ((X + 0.5) / k - cx) / rx, ny = ((Y + 0.5) / k - cy) / ry, r = nx * nx + ny * ny;
        if (r > 1) continue;
        this._s(X, Y, Array.isArray(c) ? this._shade(c, nx, ny, r) : c);
      }
  }
  poly(pts, c) {
    const k = this.k;
    let minY = Infinity, maxY = -Infinity;
    pts.forEach(p => { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    const P = Array.isArray(c) ? Pix.tones(c) : null;
    for (let Y = Math.floor(minY * k); Y <= Math.ceil(maxY * k); Y++) {
      const yy = (Y + 0.5) / k, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let n = 0; n + 1 < xs.length; n += 2)
        for (let X = Math.round(xs[n] * k); X < Math.round(xs[n + 1] * k); X++) {
          let col = c;
          if (P) { const t = (yy - minY) / Math.max(0.01, maxY - minY); col = this.smooth ? Pix.ramp(c)[Math.round((1 - U.clamp(t * 1.1 - 0.05, 0, 1)) * 32)] : t < 0.15 ? P[4] : t < 0.35 ? P[3] : t < 0.65 ? P[2] : t < 0.85 ? P[1] : P[0]; }
          this._s(X, Y, col);
        }
    }
  }
  // ligne : épaisseur w en unités logiques (par défaut 1 = un pixel logique)
  line(x0, y0, x1, y1, c, w = 1) {
    const k = this.k, n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * k * 1.5)), r = Math.max(1, Math.round(w * k));
    for (let i = 0; i <= n; i++) {
      const X = Math.floor((x0 + (x1 - x0) * i / n) * k + 0.5 / k), Y = Math.floor((y0 + (y1 - y0) * i / n) * k + 0.5 / k);
      for (let j = 0; j < r; j++) for (let q = 0; q < r; q++) this._s(X + q, Y + j, c);
    }
  }
  // ligne fine (un pixel réel)
  hline(x0, y0, x1, y1, c) { this.line(x0, y0, x1, y1, c, Math.max(1 / this.k, 0.32)); }
  thick(pts, r0, r1, c) {
    const steps = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.5));
      for (let q = 0; q < n; q++) steps.push([a[0] + (b[0] - a[0]) * q / n, a[1] + (b[1] - a[1]) * q / n]);
    }
    steps.push(pts[pts.length - 1]);
    steps.forEach((p, i) => { const r = r0 + (r1 - r0) * i / Math.max(1, steps.length - 1); this.ell(p[0], p[1], r, r, c); });
  }
  ascii(lines, pal, ox = 0, oy = 0) {
    lines.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch !== '.' && pal[ch]) this.set(ox + x, oy + y, pal[ch]); } });
  }
  // contour « sélectif » : teinte sombre de la couleur voisine plutôt qu'un noir uniforme
  outline(col = '#140c1c', sel = true) {
    const o = this.d.slice();
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.d[y * this.w + x]) continue;
      const n = this.get(x, y + 1) || this.get(x, y - 1) || this.get(x + 1, y) || this.get(x - 1, y);
      if (!n) continue;
      o[y * this.w + x] = sel && n.length === 7 ? U.mix(n, col, 0.72) : col;
    }
    this.d = o;
    return this;
  }
  // reflet de bord (lumière venant du haut à gauche) + léger grain
  polish(grain = 0.05, seed = 1) {
    const o = this.d.slice();
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const c = this.d[y * this.w + x];
      if (!c || c.length !== 7) continue;
      const up = this.get(x, y - 1), lf = this.get(x - 1, y);
      let v = c;
      if (!up || !lf) v = U.mix(v, '#fff8e8', 0.18);
      const h = U.hash(x, y, seed);
      if (h < grain) v = U.mix(v, '#000000', 0.12); else if (h > 1 - grain) v = U.mix(v, '#ffffff', 0.1);
      o[y * this.w + x] = v;
    }
    this.d = o;
    return this;
  }
  mirror() {
    const p = new Pix(1, 1); p.k = this.k; p.smooth = this.smooth; p.w = this.w; p.h = this.h; p.d = new Array(this.w * this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) p.d[y * this.w + x] = this.d[y * this.w + (this.w - 1 - x)];
    return p;
  }
  toCanvas(ss = 1) {
    const c = U.canvas(this.w, this.h), x = c.getContext('2d');
    const img = x.createImageData(this.w, this.h), D = img.data, cache = {};
    for (let i = 0; i < this.d.length; i++) {
      const col = this.d[i]; if (!col) continue;
      let rgba = cache[col];
      if (!rgba) {
        if (col[0] === '#') { const h = col.slice(1); const r = U.hex2rgb(h.slice(0, 6)); rgba = [r[0], r[1], r[2], h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255]; }
        else { x.fillStyle = col; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; rgba = [d[0], d[1], d[2], d[3]]; x.clearRect(0, 0, 1, 1); }
        cache[col] = rgba;
      }
      D[i * 4] = rgba[0]; D[i * 4 + 1] = rgba[1]; D[i * 4 + 2] = rgba[2]; D[i * 4 + 3] = rgba[3];
    }
    x.putImageData(img, 0, 0);
    c._d = this.k;
    if (ss > 1) {
      // réduction lissée : bords anticrénelés
      const o = U.canvas(Math.round(this.w / ss), Math.round(this.h / ss)), ox = o.getContext('2d');
      ox.imageSmoothingEnabled = true; ox.imageSmoothingQuality = 'high'; ox.drawImage(c, 0, 0, o.width, o.height);
      o._d = this.k / ss; return o;
    }
    return c;
  }
};
