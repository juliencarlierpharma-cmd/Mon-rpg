'use strict';
// ============================================================
//  Entrées, boucle principale, écran titre
// ============================================================
G.Input = {
  held: [], pressed: {}, touchDir: null,
  KEYMAP: {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    z: 'up', w: 'up', s: 'down', q: 'left', a: 'left', d: 'right',
    Z: 'up', W: 'up', S: 'down', Q: 'left', A: 'left', D: 'right',
    Enter: 'A', ' ': 'A', e: 'A', E: 'A', Escape: 'B', m: 'B', M: 'B',
  },
  init() {
    window.addEventListener('keydown', e => {
      const k = this.KEYMAP[e.key];
      if (!k) return;
      const prevented = e.defaultPrevented, busy = G.UI.busy();
      if (['up', 'down', 'left', 'right'].includes(k)) { if (!this.held.includes(k)) this.held.push(k); }
      else if (!busy && !prevented && !e.repeat) this.pressed[k === 'A' ? 'a' : 'b'] = true;
      if (G.scene === 'world' && !busy) e.preventDefault();
    });
    window.addEventListener('keyup', e => { const k = this.KEYMAP[e.key]; if (k) this.held = this.held.filter(h => h !== k); });
    window.addEventListener('blur', () => { this.held = []; this.touchDir = null; });
    // contrôles tactiles
    const tc = document.getElementById('touch');
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) tc.classList.add('on');
    tc.querySelectorAll('[data-d]').forEach(b => {
      const on = e => { e.preventDefault(); G.Audio.init(); this.touchDir = b.dataset.d; b.classList.add('down'); };
      const off = e => { e.preventDefault(); if (this.touchDir === b.dataset.d) this.touchDir = null; b.classList.remove('down'); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
    });
    // glisser sur la croix pour changer de direction
    const pad = tc.querySelector('.dpad');
    pad.addEventListener('pointermove', e => {
      if (!this.touchDir) return;
      const r = pad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 12) return;
      this.touchDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    });
    tc.querySelector('[data-k="a"]').addEventListener('pointerdown', e => { e.preventDefault(); G.Audio.init(); if (!G.UI.busy()) this.pressed.a = true; else { const top = G.UI.stack[G.UI.stack.length - 1]; if (top && top.adv) top.adv(); } });
    tc.querySelector('[data-k="b"]').addEventListener('pointerdown', e => {
      e.preventDefault(); G.Audio.init();
      if (!G.UI.busy()) { this.pressed.b = true; return; }
      const top = G.UI.stack[G.UI.stack.length - 1];
      const btn = top && (top.el.querySelector('[data-a="back"]') || top.el.querySelector('[data-a="close"]'));
      if (btn) btn.click(); else if (top && top.adv) top.adv();
    });
  },
  dir() { return this.touchDir || this.held[this.held.length - 1] || null; },
  take(k) {
    if (!this.pressed[k]) return false;
    this.pressed[k] = false;
    return performance.now() - (G.UI.lastClose || 0) > 220;
  },
};

G.showTitle = () => {
  G.scene = 'title'; G.view = 'title';
  G.UI.battleClose && G.UI.battleClose();
  if (!G.S) G.S = G.newState();
  G.World.placePlayer(27, 28, 'down');
  G.titleCam = 0;
  const T = document.getElementById('title');
  T.innerHTML = `<div class="logo"><div class="l1">Les Échos</div><div class="l2">ÉLÉMENTAIRES</div><div class="l3">Un RPG HD-2D au tour par tour</div></div>
    <div class="tmenu">${G.hasSave() ? '<button class="btn gold" id="tContinue">Continuer</button>' : ''}<button class="btn" id="tNew">Nouvelle partie</button></div>
    <div class="tfoot">Flèches / ZQSD · Entrée = action · Échap = menu · Tactile supporté</div>`;
  T.classList.add('show');
  G.Audio.music('title');
  const go = fn => () => { G.Audio.init(); G.Audio.sfx('ok'); T.classList.remove('show'); fn(); };
  const c = document.getElementById('tContinue');
  if (c) c.onclick = go(() => { G.load(); G.World.refresh(); G.World.placePlayer(G.S.pos.x, G.S.pos.y, G.S.pos.dir); G.UI.lastReady = G.achReadyCount(); G.scene = 'world'; G.view = 'world'; G.Audio.music(G.World.musicFor()); G.R.transition('fadein', 0.6); });
  document.getElementById('tNew').onclick = go(async () => {
    if (G.hasSave()) {
      const r = await G.UI.ask('Commencer une nouvelle partie ? La sauvegarde existante sera écrasée.', ['Oui', 'Non']);
      if (r !== 0) { T.classList.add('show'); return; }
    }
    G.S = G.newState();
    G.World.refresh();
    G.World.placePlayer(G.World.start[0], G.World.start[1], 'up');
    G.scene = 'world'; G.view = 'world';
    G.Audio.music('town');
    G.R.transition('fadein', 0.8);
    await G.UI.say([
      { who: '', t: 'Le monde d’Aube vit au rythme des quatre Échos élémentaires : Feu, Eau, Vent et Terre.' },
      { who: '', t: 'Mais depuis le réveil d’Ignar, le Dragon des Cendres, les Gardiens des Échos ont sombré dans la corruption…' },
      { who: 'Lyra', t: 'Kael, l’Ancien Théo nous attend. Sa maison est juste là, au sud-est de la place.' },
      { who: 'Kael', t: 'Allons-y. Et gardons les yeux ouverts : les monstres rôdent jusqu’aux portes du bourg.' },
    ]);
    G.UI.toast('Parlez à l’Ancien Théo (maison violette). Bouton A / Entrée pour interagir.');
    G.save();
  });
};

G.onResize = () => {
  if (G.view === 'battle' && G.Battle.units) G.Battle.layout();
  if (G.World.P) G.World.snapCam();
};

(function boot() {
  G.R.init();
  G.UI.init();
  G.Input.init();
  G.S = G.newState();
  G.World.init();
  G.showTitle();
  let last = performance.now();
  const loop = t => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    try {
      G.R.update(dt);
      if (G.view === 'title') {
        G.titleCam += dt * 14;
        const W = G.World;
        W.P.px = 27 * 16 + Math.sin(G.titleCam / 120) * 260; W.P.py = 22 * 16 + Math.cos(G.titleCam / 160) * 120;
        W.cam.x = U.clamp(W.P.px - G.R.W / 2, 0, W.W * 16 - G.R.W); W.cam.y = U.clamp(W.P.py - G.R.H / 2, 0, W.H * 16 - G.R.H);
        W.hidePlayer = true; W.ambient(dt); W.render(); W.hidePlayer = false;
      } else if (G.view === 'battle') {
        G.Battle.update(dt); G.Battle.render();
      } else {
        if (G.scene === 'world' || G.scene === 'trans') G.World.update(dt);
        G.World.render();
      }
      if (G.scene === 'world' || G.scene === 'battle') G.S.playTime += dt;
    } catch (err) { console.error(err); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  setInterval(() => { if (G.scene === 'world' && !G.UI.busy()) G.save(); }, 30000);
})();
