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
  // joystick flottant et toucher/clic pour se déplacer, directement sur l'écran de jeu
  initPointer() {
    const cv = document.getElementById('game'), joy = U.el('<div id="joy"><div class="knob"></div></div>');
    document.body.appendChild(joy);
    let st = null;
    const canUse = () => G.scene === 'world' && !G.UI.busy() && G.view === 'world';
    cv.addEventListener('pointerdown', e => {
      G.Audio.init();
      if (!canUse()) return;
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      st = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), joy: false };
    });
    cv.addEventListener('pointermove', e => {
      if (!st || e.pointerId !== st.id) return;
      const dx = e.clientX - st.x, dy = e.clientY - st.y, d = Math.hypot(dx, dy);
      if (!st.joy && d > 18 && e.pointerType !== 'mouse') { st.joy = true; joy.style.left = st.x + 'px'; joy.style.top = st.y + 'px'; joy.classList.add('on'); G.World.path = null; G.World.pathTarget = null; }
      if (st.joy) {
        const k = Math.min(1, d / 42); joy.querySelector('.knob').style.transform = `translate(${dx / (d || 1) * k * 34}px, ${dy / (d || 1) * k * 34}px)`;
        this.touchDir = d < 12 ? null : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
    });
    const end = e => {
      if (!st || e.pointerId !== st.id) return;
      if (!st.joy && performance.now() - st.t < 600 && canUse()) {
        const R = G.R, W = G.World, wx = e.clientX / R.scale + W.cam.x, wy = e.clientY / R.scale + W.cam.y;
        const tx = Math.floor(wx / 16), ty = Math.floor(wy / 16);
        if (tx === W.P.x && ty === W.P.y) W.interact();
        else if (!W.goTo(tx, ty)) G.Audio.sfx('back');
      }
      if (st.joy) { this.touchDir = null; joy.classList.remove('on'); joy.querySelector('.knob').style.transform = ''; }
      st = null;
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
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
  G.World.placePlayer(G.World.start[0], G.World.start[1] - 2, 'down');
  G.titleCam = 0;
  const T = document.getElementById('title');
  T.innerHTML = `<div class="logo"><div class="l1">Les Cristaux</div><div class="l2">ÉLÉMENTAIRES</div><div class="l3">Un RPG HD-2D au tour par tour</div></div>
    <div class="tmenu">${G.hasSave() ? '<button class="btn gold" id="tContinue">Continuer</button>' : ''}<button class="btn" id="tNew">Nouvelle partie</button><button class="btn demo" id="tDemo">✦ Démo rapide <small>niveau 15, tout débloqué</small></button></div>
    <div class="tfoot">Toucher / clic pour se déplacer et agir · Glisser = joystick · Flèches / ZQSD · Entrée · Échap = menu</div>`;
  T.classList.add('show');
  G.Audio.music('title');
  const go = fn => () => { G.Audio.init(); G.Audio.sfx('ok'); T.classList.remove('show'); fn(); };
  const c = document.getElementById('tContinue');
  if (c) c.onclick = go(() => { G.load(); G.World.refresh(); if (!G.World.canWalk(G.S.pos.x, G.S.pos.y)) { G.S.pos = { x: G.World.start[0], y: G.World.start[1], dir: 'down' }; G.S.rest = { x: G.World.start[0], y: G.World.start[1] }; } G.World.placePlayer(G.S.pos.x, G.S.pos.y, G.S.pos.dir); G.UI.lastReady = G.achReadyCount(); G.scene = 'world'; G.view = 'world'; G.Audio.music(G.World.musicFor()); G.R.transition('fadein', 0.6); });
  document.getElementById('tDemo').onclick = go(async () => {
    if (G.hasSave()) {
      const r = await G.UI.ask('Lancer la démo ? La sauvegarde existante sera remplacée.', ['Oui', 'Non']);
      if (r !== 0) { T.classList.add('show'); return; }
    }
    G.S = G.demoState();
    G.World.refresh();
    G.World.placePlayer(G.World.HAVRE[0] + 5, G.World.HAVRE[1] + 4, 'up');
    G.UI.lastReady = 0;
    G.scene = 'world'; G.view = 'world';
    G.Audio.music('town');
    G.R.transition('fadein', 0.8);
    await G.UI.say([
      { who: 'Démo', t: 'Bienvenue au Havre ! L’équipe est au niveau 15. Le Cristal de Terre est déjà libéré et la ville est en construction.' },
      { who: 'Démo', t: 'Chaque région cache un temple ◆ (Menu › Carte) : un donjon avec sa propre faune, au fond duquel un gardien protège le cristal. Le Temple du Vent (Monts Grisés) et celui de l’Eau (Marais Brumeux) vous attendent.' },
      { who: 'Démo', t: 'Menu (☰ / Échap) › Armes : 4 armes par héros. Forgez celles qui manquent, améliorez-les, et comparez les styles de jeu.' },
      { who: 'Démo', t: 'Menu › Accomplissements : deux récompenses attendent d’être réclamées. Menu › Havre : construisez et améliorez les bâtiments.' },
      { who: 'Démo', t: 'Les familiers sont liés et leur énergie est pleine dès le début de chaque combat : essayez la commande « Familier » !' },
      { who: 'Démo', t: 'Le monde est immense : Menu › Carte › Voyage rapide vous mène aux camps de chaque région (marais de l’Hydre, monts de la Wyverne…).' },
      { who: 'Démo', t: 'Le tableau de chasse (à droite de la pierre de fondation, ou Menu › Chasses) propose des contrats d’élite aux primes exclusives. Les trois chasses des Plaines sont faites : la chasse premium du Seigneur des corbeaux est débloquée, et la Liane-mère vous attend en forêt !' },
      { who: 'Démo', t: 'Et devant la pierre de fondation, faites face à un arbre ou un rocher et appuyez sur A pour récolter. Bonne aventure !' },
    ]);
    G.UI.checkAch();
    G.save();
  });
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
      { who: '', t: 'Le monde d’Aube repose sur quatre cristaux élémentaires : Terre, Vent, Eau et Feu. Chacun dort dans un temple, veillé par un gardien.' },
      { who: '', t: 'Mais le Cristal des Ténèbres s’est éveillé. Son ombre a corrompu les gardiens, et la lumière des cristaux faiblit…' },
      { who: 'Lyra', t: 'Kael, l’Ancien Théo nous attend. Sa maison est juste là, au sud-est de la place.' },
      { who: 'Kael', t: 'Allons-y. Et gardons les yeux ouverts : les monstres rôdent jusqu’aux portes du bourg.' },
    ]);
    G.UI.toast(('ontouchstart' in window) ? 'Touchez une case pour y aller, touchez un personnage pour lui parler, ou glissez le doigt pour vous diriger.' : 'Parlez à l’Ancien Théo (maison violette). Cliquez sur une case ou un personnage, ou utilisez les flèches et Entrée.');
    G.save();
  });
};

// Partie de démonstration : milieu d'aventure, tous les systèmes accessibles
G.demoState = () => {
  const S = G.newState();
  S.flags = { demo: true, elder: true, bran: true, visited: { plaines: true, bourg: true, havre: true, foret: true, montagne: true, marais: true } };
  S.party = ['kael', 'lyra', 'bran'];
  const W = { kael: { feu: 3, eau: 3, vent: 2, terre: 2 }, lyra: { feu: 3, eau: 3, vent: 2 }, bran: { feu: 2, vent: 3, terre: 3 } };
  const slot = { kael: 'feu', lyra: 'eau', bran: 'terre' };
  for (const c in W) { const ch = S.chars[c]; ch.lvl = 15; ch.exp = 400; ch.weapons = { feu: null, eau: null, vent: null, terre: null }; for (const e in W[c]) ch.weapons[e] = { tier: W[c][e] }; ch.wslot = slot[c]; }
  S.armors = { tunique: 1, robe_lin: 1, cotte: 2, robe_sorcier: 1, ecorce: 1, amulette_croc: 1, bottes_ailees: 1 };
  Object.assign(S.chars.kael, { armor: 'cotte', acc: 'amulette_croc' });
  Object.assign(S.chars.lyra, { armor: 'robe_sorcier', acc: 'bottes_ailees' });
  Object.assign(S.chars.bran, { armor: 'ecorce' });
  S.fams = {
    pyron: { lvl: 6, exp: 0, owner: 'kael', aff: { kael: 100, lyra: 10, bran: 0 } },
    bulle: { lvl: 6, exp: 0, owner: 'lyra', aff: { kael: 20, lyra: 70, bran: 5 } },
    mousse: { lvl: 4, exp: 0, owner: 'bran', aff: { kael: 0, lyra: 0, bran: 62 } },
  };
  S.gold = 6000;
  S.items = { potion: 12, hipotion: 5, ether: 6, phenix: 3, remede: 4, bombe: 3, appat: 3, friandise: 6, festin: 2, elixir: 1 };
  S.mats = { bois: 40, pierre: 40, minerai: 14, lingot: 30, cristal: 8, mithril: 3, herbe: 20, fibre: 25, fil: 12, gelee: 12, cuir: 14, croc: 12, plume: 10, spore: 8, seve: 6, braise: 12, aile: 4, os: 4, ecaille: 8, ectoplasme: 2, essence_feu: 6, essence_eau: 6, essence_vent: 6, essence_terre: 6, echo: 3, boisancien: 10, coeur_sylve: 1 };
  S.tools = { pick: 2, axe: 2 };
  S.bosses = { sylvaros: true };
  S.bestiary = { gelee: 22, lapin: 14, corbeau: 12, loup: 18, champi: 10, liane: 8, follet: 9, loupb: 11, sylvaros: 1, roi_gelee: 1, lievre_titan: 1, croc_blanc: 1, scarabee: 4, golem_racine: 2 };
  S.seen = Object.assign({ chauve: 1, salamandre: 1, golem: 1 }, S.bestiary);
  S.stats = Object.assign(S.stats, { wins: 48, kills: 121, tags: { loup: 9 }, gathered: 64, crafted: 9, wcraft: 7, weak: 31, tech: 5, goldEarned: 7400, steps: 900 });
  S.town = { founded: true, b: { forge: 2, atelier: 1, marche: 1, menagerie: 2, herboristerie: 1 }, store: { potion: 2, herbe: 4, _gold: 0 }, prog: 6 };
  S.npcs = { dorn: true, mira: true, pell: true, yuna: true, fen: true };
  S.quests = { q_havre: 'done', r_dorn: 'done', r_mira: 'done', r_pell: 'done', r_yuna: 'done', r_fen: 'done', r_grom: 'active', r_lise: 'active' };
  ['a_first', 'a_hunter', 'a_gather', 'a_forge1', 'a_sylve', 'a_weak', 'a_town1', 'a_craft', 'a_lvl10'].forEach(a => S.ach[a] = true);
  S.hunts = { pl1: 'claimed', pl2: 'claimed', pl3: 'claimed', fo1: 'claimed', fo2: 'active' };
  S.hunter = { pts: 9, inf: 0 };
  Object.assign(S.armors, { couronne_gel: 1, cape_traqueur: 1, masque_sporal: 1, lanterne_ames: 1 });
  S.mats.trophee = 4;
  S.time = 10 * 60;
  const [hx, hy] = G.World.HAVRE; S.pos = { x: hx + 5, y: hy + 4, dir: 'up' }; S.rest = { x: hx + 5, y: hy + 4 };
  S.flags.camps = {}; G.World.camps.forEach(c => { if (c.zone !== 'volcan') S.flags.camps[c.id] = true; });
  return S;
};

G.onResize = () => {
  if (G.view === 'battle' && G.Battle.units) G.Battle.layout();
  if (G.World.P) G.World.snapCam();
};

(function boot() {
  G.R.init();
  G.UI.init();
  G.Input.init();
  G.Input.initPointer();
  G.S = G.newState();
  G.World.init();
  G.S = G.newState();
  console.log('Monde généré en', G.World.genTime, 'ms');
  // pré-calcule les sprites de monstres (haute définition) pendant les temps morts, les grands d'abord
  const pre = Object.values(G.ENEMIES).sort((a, b) => G.SPR.ENEMY_SIZE[b.spr] - G.SPR.ENEMY_SIZE[a.spr]);
  const treeKinds = [...new Set(['plain', 'birch', 'autumn', 'cherry', 'fruit', 'pine', 'forest', 'giant', 'willow', 'swamp', 'volcano', 'snowpine'].concat(...Object.values(G.SUBZONES || {}).flat().map(z => (z && z.trees) || [])))];
  const heroes = []; Object.keys(G.CHARS).forEach(c => ['down', 'up', 'left', 'right'].forEach(d => [0, 1, 2].forEach(f => heroes.push([c, d, f]))));
  const tiles = []; ['~', 'w', 'l'].forEach(ch => { for (let v = 0; v < 4; v++) for (let f = 0; f < 8; f++) tiles.push([ch, v, f]); });
  // sans requestIdleCallback (Safari), on ne travaille qu'aux moments calmes : écran titre ou héros immobile hors combat
  const idle = f => window.requestIdleCallback ? requestIdleCallback(f, { timeout: 600 }) : setTimeout(f, 120);
  const calm = () => G.view === 'title' || (G.view !== 'battle' && G.World.P && !G.World.P.moving && !(G.World.path && G.World.path.length));
  const warm = () => {
    if (!calm()) return setTimeout(warm, 400);
    const H = heroes.shift(); if (H) { G.SPR.fit(G.SPR.hero(H[0], G.CHARS[H[0]].pal, H[1], H[2], G.SPR.CHAR_EXTRA[H[0]])); return idle(warm); }
    const K = treeKinds.shift(); if (K) { G.World.treeImg(K); return idle(warm); }
    const T = tiles.shift(); if (T) { G.SPR.fit(G.SPR.animTile(...T)); return idle(warm); }
    const E = pre.shift(); if (!E) return; G.SPR.enemy(E.spr, E.pal, E.e); idle(warm);
  };
  setTimeout(warm, 300);
  G.showTitle();
  let last = performance.now();
  const loop = t => {
    G.R.frameTime(t - last);
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    try {
      G.R.update(dt);
      if (G.view === 'title') {
        G.titleCam += dt * 14;
        const W = G.World;
        W.P.px = (W.BOURG[0] + 8) * 16 + Math.sin(G.titleCam / 120) * 420; W.P.py = (W.BOURG[1] + 1) * 16 + Math.cos(G.titleCam / 160) * 200;
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
