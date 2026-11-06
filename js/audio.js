'use strict';
// ============================================================
//  Audio procédural (WebAudio) : effets sonores et musiques
// ============================================================
G.Audio = {
  ctx: null, master: null, musGain: null, on: true, track: null, timer: null, step: 0,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
      this.musGain = this.ctx.createGain(); this.musGain.gain.value = 0.22; this.musGain.connect(this.master);
      try { this.on = localStorage.getItem('ee-sound') !== '0'; } catch (e) { }
      this.master.gain.value = this.on ? 0.5 : 0;
      if (this.pending) { const p = this.pending; this.pending = null; this.music(p); }
    } catch (e) { this.ctx = null; }
  },
  toggle() {
    this.on = !this.on;
    try { localStorage.setItem('ee-sound', this.on ? '1' : '0'); } catch (e) { }
    if (this.master) this.master.gain.value = this.on ? 0.5 : 0;
    return this.on;
  },
  tone(freq, dur, type = 'square', vol = 0.2, slide = 0, dest, when) {
    if (!this.ctx) return;
    const t = when || this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.2, hp = 800) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, n = Math.floor(this.ctx.sampleRate * dur), b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  },
  sfx(name) {
    if (!this.ctx || !this.on) return;
    switch (name) {
      case 'cursor': this.tone(880, 0.05, 'square', 0.06); break;
      case 'ok': this.tone(660, 0.06, 'square', 0.08); setTimeout(() => this.tone(990, 0.08, 'square', 0.08), 50); break;
      case 'back': this.tone(440, 0.07, 'square', 0.07, -120); break;
      case 'hit': this.noise(0.12, 0.25, 600); this.tone(160, 0.1, 'sawtooth', 0.12, -80); break;
      case 'crit': this.noise(0.18, 0.35, 400); this.tone(220, 0.18, 'sawtooth', 0.18, -150); break;
      case 'magic': this.tone(520, 0.3, 'sine', 0.15, 600); this.tone(780, 0.3, 'triangle', 0.08, 400); break;
      case 'fire': this.noise(0.35, 0.3, 300); this.tone(180, 0.3, 'sawtooth', 0.1, 200); break;
      case 'water': this.tone(300, 0.25, 'sine', 0.18, 500); this.noise(0.2, 0.12, 2000); break;
      case 'wind': this.noise(0.4, 0.22, 3000); break;
      case 'earth': this.tone(90, 0.35, 'sawtooth', 0.22, -40); this.noise(0.25, 0.2, 200); break;
      case 'heal': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'sine', 0.12), i * 70)); break;
      case 'buff': this.tone(400, 0.2, 'triangle', 0.12, 400); break;
      case 'debuff': this.tone(500, 0.25, 'triangle', 0.12, -300); break;
      case 'miss': this.tone(1200, 0.08, 'sine', 0.05, -600); break;
      case 'die': this.tone(300, 0.4, 'square', 0.1, -260); break;
      case 'win': [523, 523, 523, 659, 587, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, i === 6 ? 0.5 : 0.12, 'square', 0.09), [0, 120, 240, 360, 600, 720, 840][i])); break;
      case 'level': [392, 523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 0.15, 'triangle', 0.14), i * 90)); break;
      case 'encounter': [200, 260, 330, 420, 520].forEach((f, i) => setTimeout(() => this.tone(f, 0.08, 'sawtooth', 0.09), i * 40)); break;
      case 'gather': this.tone(260 + Math.random() * 80, 0.06, 'square', 0.1, -60); this.noise(0.05, 0.1, 1500); break;
      case 'get': this.tone(784, 0.08, 'square', 0.08); setTimeout(() => this.tone(1175, 0.12, 'square', 0.08), 70); break;
      case 'craft': [330, 440, 554, 660].forEach((f, i) => setTimeout(() => { this.tone(f, 0.1, 'square', 0.08); this.noise(0.03, 0.08, 3000); }, i * 80)); break;
      case 'achieve': [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'triangle', 0.12), i * 100)); break;
      case 'step': this.noise(0.03, 0.03, 1200); break;
    }
  },
  // Musiques simples : séquences arpégées
  TRACKS: {
    title: { bpm: 76, lead: [64, 0, 67, 71, 72, 0, 71, 67, 69, 0, 72, 76, 74, 0, 71, 0], bass: [45, 45, 52, 52, 41, 41, 48, 48] },
    field: { bpm: 100, lead: [67, 0, 72, 74, 76, 0, 74, 72, 71, 0, 67, 69, 71, 0, 0, 0, 69, 0, 72, 74, 76, 79, 76, 74, 72, 0, 71, 69, 67, 0, 0, 0], bass: [48, 55, 45, 52, 41, 48, 43, 50] },
    town: { bpm: 88, lead: [72, 0, 76, 0, 79, 76, 72, 0, 74, 0, 77, 0, 81, 77, 74, 0], bass: [48, 52, 53, 55] },
    battle: { bpm: 150, lead: [64, 64, 67, 64, 69, 64, 71, 69, 67, 67, 71, 67, 72, 71, 69, 67], bass: [40, 40, 43, 43, 45, 45, 38, 38] },
    boss: { bpm: 160, lead: [62, 0, 65, 62, 68, 0, 67, 65, 62, 0, 65, 68, 70, 69, 68, 65], bass: [38, 38, 41, 41, 44, 44, 37, 37] },
    victory: { bpm: 130, lead: [72, 72, 72, 72, 68, 70, 72, 0, 70, 72, 0, 0, 0, 0, 0, 0], bass: [48, 48, 44, 46] },
  },
  music(name) {
    if (this.track === name) return;
    this.track = name;
    if (!this.ctx) { this.pending = name; return; }
    clearInterval(this.timer); this.step = 0;
    const T = this.TRACKS[name]; if (!T) return;
    const dt = 60 / T.bpm / 2;
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    let next = this.ctx.currentTime + 0.05;
    const tick = () => {
      if (!this.ctx) return;
      while (next < this.ctx.currentTime + 0.25) {
        const s = this.step, l = T.lead[s % T.lead.length];
        if (l) this.tone(midi(l), dt * 0.9, 'square', 0.07, 0, this.musGain, next);
        if (s % 2 === 0) { const b = T.bass[(s / 2) % T.bass.length]; this.tone(midi(b), dt * 1.8, 'triangle', 0.16, 0, this.musGain, next); }
        if (name === 'battle' || name === 'boss') { if (s % 4 === 0) this.tone(70, 0.08, 'sine', 0.25, -30, this.musGain, next); }
        this.step++; next += dt;
      }
    };
    this.timer = setInterval(tick, 60);
    tick();
  },
};
