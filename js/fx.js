'use strict';
// ============================================================
//  Rendu « HD-2D » : pixel art basse résolution + post-traitement
//  (profondeur de champ, bloom, éclairage dynamique, particules)
// ============================================================
G.R = {
  init() {
    this.cv = document.getElementById('game');
    this.dx = this.cv.getContext('2d');
    this.low = U.canvas(10, 10); this.lx = this.low.getContext('2d');
    this.tiny = U.canvas(4, 4); this.tx = this.tiny.getContext('2d');
    this.dofC = U.canvas(4, 4); this.dofX = this.dofC.getContext('2d');
    this.litC = U.canvas(4, 4); this.litX = this.litC.getContext('2d');
    this.parts = []; this.texts = []; this.flashes = []; this.shakeT = 0; this.shakeA = 0;
    this.trans = null; this.flashA = 0; this.flashC = '#fff';
    window.addEventListener('resize', () => this.resize());
    this.resize();
  },
  resize() {
    const cw = window.innerWidth, ch = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    const short = Math.min(cw, ch);
    this.scale = Math.max(1, Math.round(short / 224));
    this.W = Math.ceil(cw / this.scale); this.H = Math.ceil(ch / this.scale);
    this.dpr = dpr;
    this.cv.width = Math.floor(cw * dpr); this.cv.height = Math.floor(ch * dpr);
    this.cv.style.width = cw + 'px'; this.cv.style.height = ch + 'px';
    this.k = this.scale * dpr;
    this.low.width = this.W; this.low.height = this.H;
    this.tiny.width = Math.max(4, Math.ceil(this.W / 4)); this.tiny.height = Math.max(4, Math.ceil(this.H / 4));
    this.dofC.width = Math.ceil(this.W / 2); this.dofC.height = Math.ceil(this.H / 2);
    this.litC.width = Math.ceil(this.W / 2); this.litC.height = Math.ceil(this.H / 2);
    this.lx.imageSmoothingEnabled = false;
    if (G.onResize) G.onResize();
  },
  shake(a, t) { this.shakeA = Math.max(this.shakeA, a); this.shakeT = Math.max(this.shakeT, t); },
  flash(c = '#fff', a = 0.8) { this.flashC = c; this.flashA = a; },
  light(x, y, r, c, a, life) { this.flashes.push({ x, y, r, c, a, life, max: life }); },
  // ---------- particules (coordonnées basse résolution) ----------
  burst(x, y, o = {}) {
    const n = o.n || 12;
    for (let i = 0; i < n; i++) {
      const ang = o.ang != null ? o.ang + U.rand(-(o.spread || 0.5), o.spread || 0.5) : Math.random() * Math.PI * 2;
      const sp = U.rand(o.spd ? o.spd * 0.4 : 10, o.spd || 40);
      this.parts.push({
        x: x + U.rand(-(o.jx || 0), o.jx || 0), y: y + U.rand(-(o.jy || 0), o.jy || 0),
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp + (o.vy || 0),
        life: U.rand(0.6, 1) * (o.life || 0.8), max: o.life || 0.8,
        size: U.rand(0.6, 1.2) * (o.size || 1.5), c: Array.isArray(o.c) ? U.pick(o.c) : (o.c || '#fff'),
        glow: o.glow ?? true, grav: o.grav || 0, drag: o.drag ?? 0.9, type: o.type || 'dot', rot: Math.random() * 6, layer: o.layer || 0,
      });
    }
  },
  text(x, y, txt, c = '#fff', o = {}) { this.texts.push({ x, y, txt, c, t: 0, max: o.life || 1.1, size: o.size || 1, crit: o.crit, vy: o.vy ?? -22 }); },
  update(dt) {
    for (const p of this.parts) {
      p.life -= dt; p.vy += p.grav * dt; p.vx *= Math.pow(p.drag, dt * 10); p.vy *= Math.pow(p.drag, dt * 10);
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 4;
    }
    this.parts = this.parts.filter(p => p.life > 0);
    if (this.parts.length > 900) this.parts.splice(0, this.parts.length - 900);
    for (const t of this.texts) { t.t += dt; t.y += t.vy * dt; t.vy *= Math.pow(0.05, dt); }
    this.texts = this.texts.filter(t => t.t < t.max);
    for (const f of this.flashes) f.life -= dt;
    this.flashes = this.flashes.filter(f => f.life > 0);
    if (this.shakeT > 0) { this.shakeT -= dt; if (this.shakeT <= 0) this.shakeA = 0; }
    this.flashA = Math.max(0, this.flashA - dt * 2.5);
    if (this.trans) { this.trans.t += dt; if (this.trans.t >= this.trans.dur) { const cb = this.trans.cb; this.trans = null; cb && cb(); } }
  },
  transition(type, dur, cb) { this.trans = { type, dur, t: 0, cb }; },
  // ---------- composition finale ----------
  present(o = {}) {
    const d = this.dx, DW = this.cv.width, DH = this.cv.height, k = this.k;
    const sx = this.shakeT > 0 ? U.rand(-1, 1) * this.shakeA * k : 0, sy = this.shakeT > 0 ? U.rand(-1, 1) * this.shakeA * k : 0;
    d.setTransform(1, 0, 0, 1, 0, 0);
    d.globalCompositeOperation = 'source-over'; d.globalAlpha = 1;
    d.fillStyle = '#000'; d.fillRect(0, 0, DW, DH);
    d.imageSmoothingEnabled = false;
    d.drawImage(this.low, sx, sy, this.W * k, this.H * k);
    // flou basse fréquence partagé (DOF + bloom)
    this.tx.imageSmoothingEnabled = true;
    this.tx.clearRect(0, 0, this.tiny.width, this.tiny.height);
    this.tx.drawImage(this.low, 0, 0, this.tiny.width, this.tiny.height);
    d.imageSmoothingEnabled = true;
    if (o.dof) {
      const X = this.dofX, w = this.dofC.width, h = this.dofC.height;
      X.globalCompositeOperation = 'source-over'; X.clearRect(0, 0, w, h); X.imageSmoothingEnabled = true;
      X.drawImage(this.tiny, 0, 0, w, h);
      X.globalCompositeOperation = 'destination-in';
      const gr = X.createLinearGradient(0, 0, 0, h), ft = o.focusTop ?? 0.3, fb = o.focusBot ?? 0.72;
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(ft, 'rgba(0,0,0,0)'); gr.addColorStop(fb, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
      X.fillStyle = gr; X.fillRect(0, 0, w, h);
      d.globalAlpha = o.dof; d.drawImage(this.dofC, sx, sy, DW, DH); d.globalAlpha = 1;
    }
    if (o.bloom) {
      d.globalCompositeOperation = 'screen'; d.globalAlpha = o.bloom;
      d.drawImage(this.tiny, sx, sy, DW, DH);
      d.globalCompositeOperation = 'source-over'; d.globalAlpha = 1;
    }
    // obscurité + lumières
    const lights = (o.lights || []).concat(this.flashes.map(f => ({ x: f.x, y: f.y, r: f.r, c: f.c, a: f.a * (f.life / f.max) })));
    if (o.dark > 0.01) {
      const X = this.litX, w = this.litC.width, h = this.litC.height;
      X.globalCompositeOperation = 'source-over'; X.clearRect(0, 0, w, h);
      X.fillStyle = U.rgba(o.darkCol || '#0a0c30', o.dark); X.fillRect(0, 0, w, h);
      X.globalCompositeOperation = 'destination-out';
      for (const l of lights) {
        const x = l.x / 2, y = l.y / 2, r = l.r / 2;
        const g = X.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(0,0,0,${U.clamp(l.a ?? 1, 0, 1)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2);
      }
      d.drawImage(this.litC, 0, 0, DW, DH);
    }
    d.globalCompositeOperation = 'lighter';
    for (const l of lights) {
      if (!l.c) continue;
      const x = l.x * k + sx, y = l.y * k + sy, r = l.r * k;
      const g = d.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, U.rgba(l.c, 0.17 * (l.a ?? 1))); g.addColorStop(1, U.rgba(l.c, 0));
      d.fillStyle = g; d.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // particules (lissées, haute résolution)
    for (const p of this.parts) {
      const a = U.clamp(p.life / p.max, 0, 1), x = p.x * k + sx, y = p.y * k + sy, s = p.size * k;
      d.globalAlpha = a;
      if (p.type === 'streak') {
        d.globalCompositeOperation = p.glow ? 'lighter' : 'source-over';
        d.strokeStyle = p.c; d.lineWidth = s * 0.6; d.beginPath(); d.moveTo(x, y); d.lineTo(x - p.vx * 0.06 * k, y - p.vy * 0.06 * k); d.stroke();
      } else if (p.type === 'rock') {
        d.globalCompositeOperation = 'source-over'; d.fillStyle = p.c;
        d.save(); d.translate(x, y); d.rotate(p.rot); d.fillRect(-s, -s, s * 2, s * 2); d.restore();
      } else if (p.type === 'ring') {
        d.globalCompositeOperation = 'lighter'; d.strokeStyle = p.c; d.lineWidth = k * 0.8;
        d.beginPath(); d.arc(x, y, s * (1 + (1 - a) * 6), 0, Math.PI * 2); d.stroke();
      } else if (p.type === 'leaf') {
        d.globalCompositeOperation = 'source-over'; d.fillStyle = p.c;
        d.save(); d.translate(x, y); d.rotate(Math.sin(p.rot) * 1.2); d.fillRect(-s, -s * 0.4, s * 2, s * 0.8); d.restore();
      } else if (p.type === 'fog') {
        d.globalCompositeOperation = 'source-over'; d.globalAlpha = a * 0.16 * Math.min(1, (p.max - p.life) * 2);
        const g = d.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, p.c); g.addColorStop(1, 'rgba(255,255,255,0)');
        d.fillStyle = g; d.fillRect(x - s, y - s, s * 2, s * 2);
      } else {
        d.globalCompositeOperation = p.glow ? 'lighter' : 'source-over';
        if (p.glow) {
          const g = d.createRadialGradient(x, y, 0, x, y, s * 2.5);
          g.addColorStop(0, p.c); g.addColorStop(0.35, U.rgba(p.c.length === 7 ? p.c : '#ffffff', 0.4)); g.addColorStop(1, 'rgba(0,0,0,0)');
          d.fillStyle = g; d.fillRect(x - s * 2.5, y - s * 2.5, s * 5, s * 5);
        } else { d.fillStyle = p.c; d.beginPath(); d.arc(x, y, s, 0, Math.PI * 2); d.fill(); }
      }
    }
    d.globalAlpha = 1; d.globalCompositeOperation = 'source-over';
    // rayons de lumière (god rays)
    if (o.rays) {
      d.globalCompositeOperation = 'lighter';
      const t = performance.now() / 4000;
      for (let i = 0; i < 4; i++) {
        const x0 = ((i * 0.31 + t * 0.05) % 1.2 - 0.1) * DW, w = DW * 0.06;
        const g = d.createLinearGradient(x0, 0, x0 + DW * 0.25, DH);
        const a = o.rays * (0.5 + 0.5 * Math.sin(t * 3 + i * 2));
        g.addColorStop(0, `rgba(255,240,190,${0.12 * a})`); g.addColorStop(1, 'rgba(255,240,190,0)');
        d.fillStyle = g; d.beginPath(); d.moveTo(x0, 0); d.lineTo(x0 + w, 0); d.lineTo(x0 + w + DW * 0.3, DH); d.lineTo(x0 + DW * 0.3, DH); d.fill();
      }
      d.globalCompositeOperation = 'source-over';
    }
    if (o.grade) { d.globalCompositeOperation = 'soft-light'; d.fillStyle = o.grade; d.fillRect(0, 0, DW, DH); d.globalCompositeOperation = 'source-over'; }
    // vignette
    const vg = d.createRadialGradient(DW / 2, DH / 2, Math.min(DW, DH) * 0.35, DW / 2, DH / 2, Math.max(DW, DH) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${o.vignette ?? 0.45})`);
    d.fillStyle = vg; d.fillRect(0, 0, DW, DH);
    // textes flottants
    for (const t of this.texts) {
      const a = t.t < t.max * 0.7 ? 1 : 1 - (t.t - t.max * 0.7) / (t.max * 0.3);
      const pop = t.t < 0.12 ? 1 + (0.12 - t.t) * 5 : 1;
      const fs = Math.round(7 * k * t.size * pop * (t.crit ? 1.35 : 1));
      d.globalAlpha = a; d.font = `900 ${fs}px "Cinzel", Georgia, serif`; d.textAlign = 'center'; d.textBaseline = 'middle';
      d.lineWidth = Math.max(2, fs * 0.18); d.strokeStyle = 'rgba(10,6,20,0.9)';
      d.strokeText(t.txt, t.x * k + sx, t.y * k + sy); d.fillStyle = t.c; d.fillText(t.txt, t.x * k + sx, t.y * k + sy);
    }
    d.globalAlpha = 1;
    if (this.flashA > 0) { d.globalAlpha = this.flashA; d.fillStyle = this.flashC; d.fillRect(0, 0, DW, DH); d.globalAlpha = 1; }
    if (this.trans) this.drawTrans(d, DW, DH);
  },
  drawTrans(d, DW, DH) {
    const T = this.trans, p = U.clamp(T.t / T.dur, 0, 1);
    if (T.type === 'battle') {
      const n = 12;
      d.fillStyle = '#05030a';
      for (let i = 0; i < n; i++) {
        const q = U.clamp(p * 1.6 - i / n * 0.6, 0, 1), h = DH / n;
        d.fillRect(i % 2 ? DW * (1 - q) : 0, i * h, DW * q, h + 1);
      }
      if (p < 0.25) { d.globalAlpha = (0.25 - p) * 3; d.fillStyle = '#fff'; d.fillRect(0, 0, DW, DH); d.globalAlpha = 1; }
    } else if (T.type === 'fadeout') { d.globalAlpha = p; d.fillStyle = '#000'; d.fillRect(0, 0, DW, DH); d.globalAlpha = 1; }
    else if (T.type === 'fadein') { d.globalAlpha = 1 - p; d.fillStyle = '#000'; d.fillRect(0, 0, DW, DH); d.globalAlpha = 1; }
  },
};

// ---------- Effets élémentaires prédéfinis ----------
G.FX = {
  elem(e, x, y, big) {
    const R = G.R, m = big ? 1.6 : 1;
    switch (e) {
      case 'feu':
        R.burst(x, y, { n: 26 * m, c: ['#ffdf6a', '#ff8a2a', '#ff4a1a'], spd: 45, vy: -25, life: 0.8, size: 2, grav: -40, jx: 6, jy: 6 });
        R.light(x, y, 70 * m, '#ff7a2a', 1, 0.5); G.Audio.sfx('fire'); break;
      case 'eau':
        R.burst(x, y, { n: 24 * m, c: ['#bfe6ff', '#43a8ff', '#2a6ad8'], spd: 60, vy: -30, life: 0.9, size: 1.6, grav: 120, jx: 5 });
        R.burst(x, y, { n: 3, c: '#9fd8ff', type: 'ring', size: 3, life: 0.6, spd: 1 });
        R.light(x, y, 60 * m, '#43a8ff', 0.8, 0.5); G.Audio.sfx('water'); break;
      case 'vent':
        for (let i = 0; i < 18 * m; i++) {
          const a = i / 18 * Math.PI * 2;
          R.parts.push({ x: x + Math.cos(a) * 10, y: y + Math.sin(a) * 6, vx: -Math.sin(a) * 70, vy: Math.cos(a) * 40 - 10, life: 0.6, max: 0.6, size: 1.4, c: U.pick(['#d0ffe8', '#7dffb0', '#ffffff']), glow: true, grav: 0, drag: 0.95, type: 'streak', rot: 0 });
        }
        R.light(x, y, 55 * m, '#7dffb0', 0.6, 0.4); G.Audio.sfx('wind'); break;
      case 'terre':
        R.burst(x, y + 6, { n: 16 * m, c: ['#8a6a3a', '#c8a050', '#5a4428'], spd: 70, vy: -60, life: 0.9, size: 1.6, grav: 220, type: 'rock', glow: false, ang: -Math.PI / 2, spread: 1.1 });
        R.burst(x, y + 8, { n: 10, c: '#d8c8a0', spd: 30, life: 0.8, size: 4, type: 'fog' });
        R.shake(2.5, 0.25); G.Audio.sfx('earth'); break;
      default:
        R.burst(x, y, { n: 14, c: ['#ffffff', '#e8e8ff'], spd: 55, life: 0.4, size: 1.2, type: 'streak' });
        G.Audio.sfx('hit');
    }
  },
  slash(x, y, c = '#ffffff') {
    const R = G.R;
    for (let i = 0; i < 14; i++) {
      const t = i / 13, a = -2.3 + t * 2.2;
      R.parts.push({ x: x + Math.cos(a) * 12, y: y + Math.sin(a) * 12, vx: Math.cos(a + 1.57) * 30, vy: Math.sin(a + 1.57) * 30, life: 0.25, max: 0.25, size: 2.2 - t, c, glow: true, grav: 0, drag: 0.8, type: 'streak', rot: 0 });
    }
  },
  heal(x, y) {
    G.R.burst(x, y + 6, { n: 22, c: ['#b0ffb0', '#ffffff', '#7affd8'], spd: 15, vy: -35, life: 1.1, size: 1.6, grav: -10, jx: 8, jy: 4 });
    G.R.light(x, y, 50, '#7affb0', 0.7, 0.6); G.Audio.sfx('heal');
  },
  buff(x, y, c = '#ffd86a') { G.R.burst(x, y, { n: 3, c, type: 'ring', size: 3, life: 0.7, spd: 1 }); G.R.burst(x, y + 8, { n: 12, c, spd: 10, vy: -40, life: 0.8, size: 1.2 }); G.Audio.sfx('buff'); },
  debuff(x, y) { G.R.burst(x, y - 8, { n: 14, c: ['#a86aff', '#5a2a8a'], spd: 10, vy: 30, life: 0.8, size: 1.3 }); G.Audio.sfx('debuff'); },
};
