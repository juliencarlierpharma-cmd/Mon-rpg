'use strict';
// ============================================================
//  Combat au tour par tour (ordre de passage basé sur la VIT)
// ============================================================
G.ENEMY_DMG = 2.0;
G.ENEMY_HP = 1.25;
G.Battle = {
  // ---------------- Démarrage ----------------
  start(enemyIds, opts = {}) {
    if (G.scene === 'battle' || G.scene === 'trans') return;
    this.opts = opts; this.over = false; this.result = null; this.tweens = []; this.time = 0;
    this.bg = opts.bg || 'plains';
    this.units = [];
    G.S.party.forEach((cid, i) => this.units.push(this.mkParty(cid, i)));
    const counts = {};
    enemyIds.forEach(id => counts[id] = (counts[id] || 0) + 1);
    const seen = {};
    enemyIds.forEach((id, i) => {
      const E = G.ENEMIES[id];
      seen[id] = (seen[id] || 0) + 1;
      const name = counts[id] > 1 ? `${E.n} ${'ABCD'[seen[id] - 1]}` : E.n;
      const hp = Math.round(E.hp * (E.boss ? 1 : G.ENEMY_HP));
      this.units.push({ side: 'e', eid: id, E, name, i, hp, maxhp: hp, mp: 999, elem: E.e, st: {}, ct: 0, alive: true, ox: 0, oy: 0, flash: 0, alpha: 1, boss: !!E.boss });
    });
    this.layout();
    this.units.forEach(u => { u.ct = this.delay(u) * U.rand(0.3, 1.0); if (u.side === 'p' && u.calc.flags.has('firstStrike')) u.ct = 0; });
    if (opts.boss) this.units.filter(u => u.side === 'e').forEach(u => u.ct += 8);
    G.Audio.sfx('encounter');
    G.Audio.music(opts.boss ? 'boss' : 'battle');
    G.scene = 'trans';
    G.R.transition('battle', 0.75, () => { G.scene = 'battle'; G.view = 'battle'; G.R.parts = []; G.UI.battleOpen(this); this.run(); });
  },
  mkParty(cid, i) {
    const calc = G.calc(cid);
    return { side: 'p', cid, name: G.CHARS[cid].n, i, calc, hp: G.curHP(cid), mp: G.curMP(cid), st: {}, ct: 0, alive: G.curHP(cid) > 0, ox: 0, oy: 0, flash: 0, alpha: 1, combo: 0, energy: G.S.flags.demo && calc.link >= 2 ? 100 : 0, guard: false, elem: null };
  },
  layout() {
    const R = G.R, W = R.W, BH = this.BH = Math.floor(R.H * (R.H > R.W ? 0.6 : 0.64));
    this.units.filter(u => u.side === 'p').forEach((u, i) => { u.hx = Math.round(W * (W < 260 ? 0.76 : 0.74) + i * W * 0.045); u.hy = Math.round(BH * (0.55 + i * 0.15)); });
    const es = this.units.filter(u => u.side === 'e'), n = es.length;
    const P = {
      1: [[0.3, 0.8]], 2: [[0.22, 0.62], [0.36, 0.85]], 3: [[0.17, 0.56], [0.36, 0.7], [0.2, 0.88]], 4: [[0.14, 0.55], [0.34, 0.6], [0.18, 0.82], [0.38, 0.88]],
    }[Math.min(4, n)];
    es.forEach((u, i) => { const p = P[i] || [0.3, 0.7]; u.hx = Math.round(W * p[0]); u.hy = Math.round(BH * p[1]); });
  },
  // ---------------- Statistiques effectives ----------------
  base(u, k) {
    if (u.side === 'p') return u.calc[k];
    if (k === 'crit') return 5;
    return u.E[k];
  },
  stat(u, k) {
    let v = this.base(u, k);
    const s = u.st, up = { atk: 'atkUp', def: 'defUp', mag: 'magUp', res: 'resUp', spd: 'spdUp' }[k], dn = { atk: 'atkDown', def: 'defDown', res: 'resDown', spd: 'spdDown' }[k];
    if (up && s[up]) v *= 1.3;
    if (dn && s[dn]) v *= 0.7;
    if (u.enraged && (k === 'atk' || k === 'mag')) v *= 1.25;
    return v;
  },
  maxHP(u) { return u.side === 'p' ? u.calc.hp : u.maxhp; },
  maxMP(u) { return u.side === 'p' ? u.calc.mp : 999; },
  delay(u) { return 1200 / (this.stat(u, 'spd') + 20); },
  alive(side) { return this.units.filter(u => u.side === side && u.alive); },
  targetable(side) { return this.alive(side).filter(u => !u.airborne); },
  // ordre de passage
  next() {
    const alive = this.units.filter(u => u.alive);
    let best = alive[0];
    alive.forEach(u => { if (u.ct < best.ct) best = u; });
    const d = best.ct;
    alive.forEach(u => u.ct -= d);
    return best;
  },
  preview(n = 8) {
    const sim = this.units.filter(u => u.alive).map(u => ({ u, ct: u.ct }));
    const out = [];
    for (let k = 0; k < n && sim.length; k++) {
      let b = sim[0]; sim.forEach(s => { if (s.ct < b.ct) b = s; });
      const d = b.ct; sim.forEach(s => s.ct -= d);
      out.push(b.u); b.ct = this.delay(b.u);
    }
    return out;
  },
  // ---------------- Boucle principale ----------------
  async run() {
    this.log(this.opts.boss ? `${this.units.find(u => u.side === 'e').name} vous barre la route !` : 'Des monstres surgissent !');
    if (this.alive('p').some(u => u.calc.flags.has('grace'))) {
      this.alive('p').forEach(u => { u.st.regen = { t: 3 }; });
      this.log('La Grâce de Lyra enveloppe l’équipe.');
    }
    G.UI.battleRefresh();
    await U.wait(500);
    while (!this.over) {
      const u = this.next();
      this.active = u;
      G.UI.battleRefresh();
      await this.turn(u);
      this.active = null;
      if (this.checkEnd()) break;
    }
    await this.finish();
  },
  checkEnd() {
    if (this.over) return true;
    if (!this.alive('e').length) { this.result = 'win'; this.over = true; }
    else if (!this.alive('p').length) { this.result = 'lose'; this.over = true; }
    return this.over;
  },
  async turn(u) {
    // effets de début de tour
    u.guard = false;
    const M = this.maxHP(u);
    if (u.st.burn) { await this.dot(u, Math.ceil(M * 0.06), '#ff8a3a', 'brûle'); }
    if (u.alive && u.st.poison) { await this.dot(u, Math.ceil(M * 0.08), '#b86aff', 'souffre du poison'); }
    if (!u.alive) return;
    if (u.st.regen) this.heal(u, Math.ceil(M * 0.08), true);
    if (u.side === 'p') {
      if (u.calc.flags.has('regenAlways')) this.heal(u, Math.ceil(M * 0.03), true);
      if (u.calc.mpRegen) u.mp = Math.min(this.maxMP(u), u.mp + u.calc.mpRegen);
    }
    if (u.st.stun) {
      delete u.st.stun;
      this.log(`${u.name} est étourdi(e) !`);
      G.R.text(u.hx, u.hy - this.h(u) - 4, 'Étourdi', '#ffe080');
      await U.wait(600); this.endTurn(u, 1); return;
    }
    if (u.airborne) { await this.land(u); this.endTurn(u, 1); return; }
    if (u.boss && u.eid === 'ignar' && !u.enraged && u.hp < u.maxhp * 0.5) {
      u.enraged = true; this.log('Ignar entre dans une rage incandescente !'); G.R.flash('#ff6a2a', 0.6); G.R.shake(4, 0.6);
      G.FX.elem('feu', u.hx, u.hy - 40, true); await U.wait(700);
    }
    let act;
    if (u.side === 'p') act = await G.UI.battleCommand(u);
    else act = this.ai(u);
    if (this.over) return;
    const mul = await this.exec(u, act);
    if (this.over || !this.alive('e').length || !this.alive('p').length) { this.endTurn(u, mul); return; }
    if (u.side === 'p' && u.alive && act.type !== 'tech') await this.famAssist(u);
    if (u.boss && u.enraged && Math.random() < 0.35 && this.alive('p').length) { this.log('Ignar enchaîne !'); await U.wait(250); await this.exec(u, this.ai(u)); }
    this.endTurn(u, mul);
  },
  endTurn(u, mul = 1) {
    for (const k in u.st) {
      if (k === 'shield') continue;
      u.st[k].t--;
      if (u.st[k].t <= 0) delete u.st[k];
    }
    u.ct = this.delay(u) * (mul || 1);
    if (u.side === 'p') {
      const fam = u.calc.fam;
      if (fam && u.calc.link >= 2) u.energy = Math.min(100, u.energy + (u.calc.flags.has('bond') ? 24 : 16));
    }
    G.UI.battleRefresh();
  },
  async dot(u, dmg, col, verb) {
    u.hp = Math.max(0, u.hp - dmg);
    G.R.text(u.hx, u.hy - this.h(u) * 0.6, dmg, col);
    u.flash = 0.15;
    this.log(`${u.name} ${verb} (${dmg}).`);
    if (u.hp <= 0) this.kill(u);
    G.UI.battleRefresh();
    await U.wait(380);
  },
  // ---------------- IA ennemie ----------------
  ai(u) {
    const E = u.E;
    let opts = E.sk.slice();
    if (u.hp > u.maxhp * 0.6) opts = opts.filter(s => !G.SKILLS[s].heal);
    opts = opts.filter(s => { const S = G.SKILLS[s]; return !(S.t === 'self' && S.st && S.st.every(x => u.st[x[0]])); });
    if (!opts.length) opts = ['e_tackle'];
    const id = U.pick(opts), S = G.SKILLS[id];
    let target = null;
    if (S.t === 'enemy') target = this.pickPartyTarget();
    return { type: 'skill', id, target };
  },
  pickPartyTarget() {
    const c = this.targetable('p');
    if (!c.length) return null;
    const w = c.map(p => (p.st.taunt ? 4 : 1) * (p.calc.flags.has('taunt') ? 2.5 : 1));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < c.length; i++) { r -= w[i]; if (r <= 0) return c[i]; }
    return c[0];
  },
  // ---------------- Exécution des actions ----------------
  async exec(u, a) {
    switch (a.type) {
      case 'attack': await this.doAttack(u, a.target); return 1;
      case 'skill': await this.doSkill(u, a.id, a.target); return 1;
      case 'item': await this.doItem(u, a.id, a.target); return 1;
      case 'defend':
        u.guard = true; u.mp = Math.min(this.maxMP(u), u.mp + Math.ceil(this.maxMP(u) * 0.06));
        this.log(`${u.name} se met en garde.`); G.FX.buff(u.hx, u.hy - 16, '#9fd8ff'); await U.wait(400); return 0.8;
      case 'flee': {
        const ok = !this.opts.boss && Math.random() < 0.55 + (this.stat(u, 'spd') - 10) * 0.01;
        this.log(ok ? 'Vous prenez la fuite !' : 'Impossible de fuir !');
        await U.wait(500);
        if (ok) { this.result = 'flee'; this.over = true; }
        return 1;
      }
      case 'swap': {
        const c = G.S.chars[u.cid], ratioH = u.hp / u.calc.hp, ratioM = u.mp / Math.max(1, u.calc.mp);
        c.wslot = a.slot;
        u.calc = G.calc(u.cid); u.combo = 0;
        u.hp = Math.max(1, Math.round(ratioH * u.calc.hp)); u.mp = Math.round(ratioM * u.calc.mp);
        this.log(`${u.name} s’équipe de ${u.calc.w.n} !`);
        G.FX.buff(u.hx, u.hy - 16, G.ELEM[a.slot].c);
        await U.wait(450); return 0.5;
      }
      case 'tech': await this.doTech(u, a.target); return 1;
    }
    return 1;
  },
  h(u) { return u.side === 'p' ? 40 : (G.SPR.ENEMY_SIZE[u.E.spr] * this.escale(u)) * 0.8; },
  escale(u) { const s = G.SPR.ENEMY_SIZE[u.E.spr]; if (u.E.big && s < 48) return G.R.W < 300 ? 2 : 3; return s >= 48 ? (G.R.W < 300 ? 1.5 : 2) : 2; },
  center(u) { return [u.hx + u.ox, u.hy + u.oy - this.h(u) * 0.55]; },
  async lunge(u, t) {
    const dir = u.side === 'p' ? -1 : 1;
    u.pose = 'atk';
    await this.tween(u, { ox: dir * 18 }, 120);
    return () => { u.pose = null; return this.tween(u, { ox: 0 }, 160); };
  },
  weaponElem(u) { return u.side === 'p' ? u.calc.w.e : u.elem; },
  async doAttack(u, t) {
    if (!t || !t.alive || t.airborne) t = U.pick(this.targetable(u.side === 'p' ? 'e' : 'p'));
    if (!t) return;
    const F = u.calc.flags;
    const back = await this.lunge(u, t);
    const o = { s: 'atk', p: 1, e: this.weaponElem(u), phys: true, basic: true };
    if (F.has('arcane')) { o.s = 'mag'; o.ig = 0.3; }
    if (F.has('dragoon')) o.ig = 0.2;
    const hits = F.has('double') ? 2 : 1;
    if (hits > 1) o.p = 0.65;
    this.log(`${u.name} attaque !`);
    for (let i = 0; i < hits && t.alive; i++) {
      G.FX.slash(...this.center(t), u.calc.w.e ? G.ELEM[u.calc.w.e].c : '#ffffff');
      await this.hit(u, t, o);
      if (hits > 1) await U.wait(140);
    }
    await back();
    await this.resolveCounters();
  },
  async doSkill(u, id, t) {
    const S = G.SKILLS[id];
    if (u.side === 'p') {
      const cost = this.mpCost(u, S);
      u.mp -= cost;
    }
    this.log(`${u.name} : ${S.n} !`);
    G.UI.battleBanner(S.n, u.side);
    const foes = u.side === 'p' ? 'e' : 'p', allies = u.side;
    if (S.special === 'jump') {
      u.airborne = { id, target: t };
      G.Audio.sfx('wind');
      await this.tween(u, { oy: -260 }, 300);
      this.log(`${u.name} s’envole !`);
      return;
    }
    if (S.special === 'focus') u.combo = Math.min(5, u.combo + 2);
    if (S.dmg) {
      const back = (S.t === 'enemy' || S.dmg.rnd) ? await this.lunge(u, t) : (u.pose = 'atk', () => { u.pose = null; });
      if (u.side === 'p' && S.dmg.s === 'mag') G.Audio.sfx('magic');
      const o = Object.assign({ phys: S.dmg.s === 'atk', skill: S }, S.dmg);
      if (o.e === 'w') o.e = this.weaponElem(u);
      if (u.side === 'e') o.e = o.e || null;
      if (u.side === 'p' && u.calc.flags.has('dragoon') && o.phys) o.ig = Math.max(o.ig || 0, 0.2);
      if (S.special === 'finisher') { o.p += 0.5 * u.combo; u.combo = 0; o.noCombo = true; }
      const hits = o.h || 1;
      if (S.t === 'enemy') {
        if (!t || !t.alive || t.airborne) t = U.pick(this.targetable(foes));
        for (let i = 0; i < hits && t && t.alive; i++) {
          if (S.special === 'detonate' && t.st.burn) { o.p = S.dmg.p * 2; delete t.st.burn; this.log('Combustion !'); }
          await this.hit(u, t, o, S);
          if (hits > 1) await U.wait(150);
        }
      } else if (o.rnd) {
        for (let i = 0; i < hits; i++) {
          const c = this.targetable(foes); if (!c.length) break;
          await this.hit(u, U.pick(c), o, S); await U.wait(110);
        }
      } else {
        const tg = this.targetable(foes);
        for (const x of tg) { for (let i = 0; i < hits && x.alive; i++) await this.hit(u, x, o, S, true); }
        await U.wait(250);
      }
      await back();
      await this.resolveCounters();
      const selfSt = (S.st || []).filter(x => x[3] === 's');
      if (selfSt.length && u.alive) this.applyStatuses(u, u, selfSt, true);
    } else {
      let targets = [];
      if (S.t === 'self') targets = [u];
      else if (S.t === 'enemies') targets = this.targetable(foes);
      else if (S.t === 'enemy') targets = [t && t.alive ? t : U.pick(this.targetable(foes))].filter(Boolean);
      else if (S.t === 'ally') targets = [t && t.alive ? t : u];
      else if (S.t === 'allies') targets = this.alive(allies);
      else if (S.t === 'dead') targets = t ? [t] : [];
      u.pose = 'atk';
      for (const x of targets) {
        if (S.heal) {
          let amt = this.stat(u, S.heal.s) * S.heal.p * U.rand(0.95, 1.05);
          if (u.side === 'p' && u.calc.flags.has('healer')) amt *= 1.4;
          this.heal(x, Math.round(amt));
        }
        if (S.revive && !x.alive) this.revive(x, S.revive);
        if (S.cleanse) this.cleanse(x);
        if (S.special === 'bastion') { x.st.shield = { t: 99, v: Math.round(this.maxHP(x) * 0.25) }; G.R.text(x.hx, x.hy - 46, 'Bouclier', '#9fd8ff'); }
        if (S.st) this.applyStatuses(u, x, S.st, true);
      }
      await U.wait(500);
      u.pose = null;
    }
  },
  mpCost(u, S) { return Math.ceil((S.mp || 0) * (u.calc && u.calc.flags.has('thrift') ? 0.7 : 1)); },
  async land(u) {
    const A = u.airborne, S = G.SKILLS[A.id];
    u.airborne = null;
    const foes = this.targetable('e');
    if (!foes.length) { u.oy = 0; return; }
    const o = Object.assign({ phys: true, skill: S }, S.dmg);
    if (u.calc.flags.has('dragoon')) { o.p *= 1.3; o.ig = 0.2; }
    this.log(`${u.name} s’abat du ciel !`);
    let t = A.target && A.target.alive ? A.target : U.pick(foes);
    if (S.t === 'enemies') {
      u.oy = -260; u.ox = (foes[0].hx - u.hx) * 0.6;
      await this.tween(u, { oy: 0 }, 180);
      for (const x of foes) await this.hit(u, x, o, S, true);
    } else {
      u.ox = t.hx - u.hx + 12; u.oy = -260;
      await this.tween(u, { oy: 0 }, 160);
      await this.hit(u, t, o, S);
    }
    G.R.shake(4, 0.3);
    await U.wait(200);
    await this.tween(u, { ox: 0 }, 220);
  },
  // ---------------- Dégâts ----------------
  async hit(src, tgt, o, S, quick) {
    if (!tgt.alive) return 0;
    const [cx, cy] = this.center(tgt);
    if (o.phys && tgt.st.evade && Math.random() < 0.55) {
      G.R.text(cx, cy, 'Esquive', '#d0ffe8'); G.Audio.sfx('miss');
      await this.tween(tgt, { ox: tgt.side === 'p' ? 10 : -10 }, 80); await this.tween(tgt, { ox: 0 }, 120);
      return 0;
    }
    let s = o.s;
    if (s === 'best') s = this.stat(src, 'atk') >= this.stat(src, 'mag') ? 'atk' : 'mag';
    const atk = this.stat(src, s) * (o.techMul || 1);
    const defK = s === 'mag' ? 'res' : 'def';
    const def = this.stat(tgt, defK) * (1 - (o.ig || 0));
    let dmg = o.flat ? o.flat * U.rand(0.95, 1.05) : atk * o.p * 60 / (60 + def) * U.rand(0.92, 1.08);
    let em = G.elemMult(o.e, tgt.elem);
    if (tgt.side === 'p' && o.e) em *= 1 - (tgt.calc.elRes[o.e] || 0);
    dmg *= em;
    const P = src.side === 'p' ? src.calc.flags : new Set();
    if (o.e === 'feu' && P.has('pyro')) dmg *= 1.25;
    if (P.has('fury') && src.hp < this.maxHP(src) * 0.5) dmg *= 1.4;
    if (P.has('combo') && o.phys && !o.noCombo) { dmg *= 1 + 0.15 * src.combo; src.combo = Math.min(5, src.combo + 1); }
    if (src.st.charge && o.phys) { dmg *= 2; delete src.st.charge; }
    const critCh = (src.side === 'p' ? src.calc.crit : 5) + (o.crit || 0);
    const crit = Math.random() * 100 < critCh;
    if (crit) dmg *= 1.6;
    if (tgt.guard) dmg *= 0.5;
    if (src.side === 'e') dmg *= G.ENEMY_DMG * (src.E.dmgMul || (1 + src.E.lvl * 0.012));
    dmg = Math.max(1, Math.round(dmg));
    // bouclier
    if (tgt.st.shield) {
      const ab = Math.min(tgt.st.shield.v, dmg); tgt.st.shield.v -= ab; dmg -= ab;
      if (tgt.st.shield.v <= 0) delete tgt.st.shield;
      if (ab) G.R.text(cx + 8, cy - 8, `-${ab}🔷`, '#9fd8ff', { size: 0.8 });
    }
    tgt.hp -= dmg;
    if (tgt.hp <= 0 && tgt.side === 'p') {
      if (tgt.calc.flags.has('endure') && !tgt.endured) { tgt.hp = 1; tgt.endured = true; this.log(`${tgt.name} tient bon !`); }
    }
    tgt.flash = 0.18;
    // effets visuels
    if (o.e) G.FX.elem(o.e, cx, cy, crit); else G.FX.elem(null, cx, cy);
    if (crit) { G.R.shake(3, 0.2); G.Audio.sfx('crit'); }
    const col = em > 1 ? '#ffe040' : em < 1 ? '#a8b8c8' : (tgt.side === 'p' ? '#ff9a9a' : '#ffffff');
    G.R.text(cx + U.rand(-6, 6), cy - 4, dmg, col, { crit });
    if (em > 1) { G.R.text(cx, cy - 18, 'Faiblesse !', '#ffe040', { size: 0.7 }); if (src.side === 'p') G.S.stats.weak++; }
    else if (em < 1) G.R.text(cx, cy - 18, 'Résiste', '#a8b8c8', { size: 0.7 });
    if (crit) G.R.text(cx, cy - 26, 'Critique !', '#ff8a5a', { size: 0.7 });
    this.tween(tgt, { ox: tgt.side === 'p' ? 6 : -6 }, 60).then(() => this.tween(tgt, { ox: 0 }, 120));
    // drains
    const drain = (o.drain || 0) + (P.has('lifesteal') ? 0.2 : 0);
    if (drain && src.alive) this.heal(src, Math.round(dmg * drain), true);
    if (src.side === 'p' && P.has('breaker') && Math.random() < 0.5 && tgt.hp > 0) { tgt.st.defDown = { t: 3 }; }
    // statuts
    if (S && S.st && tgt.hp > 0) this.applyStatuses(src, tgt, S.st.filter(x => x[3] === 't'), false);
    if (tgt.hp <= 0) {
      if (tgt.side === 'p' && tgt.calc.flags.has('autoRevive') && !tgt.autoRev) { tgt.autoRev = true; tgt.hp = Math.round(this.maxHP(tgt) * 0.3); this.log(`L’Anneau du phénix ranime ${tgt.name} !`); G.FX.heal(cx, cy); }
      else this.kill(tgt);
    }
    // contre-attaque
    if (tgt.alive && src.alive && o.phys && tgt.side !== src.side && !o.isCounter) {
      const tf = tgt.side === 'p' ? tgt.calc.flags : new Set();
      if (tgt.st.counter || (tf.has('counter') && Math.random() < 0.35)) (this.counters = this.counters || []).push([tgt, src]);
    }
    G.UI.battleRefresh();
    await U.wait(quick ? 120 : 260);
    return dmg;
  },
  async resolveCounters() {
    const list = this.counters || []; this.counters = [];
    for (const [a, b] of list) {
      if (!a.alive || !b.alive) continue;
      this.log(`${a.name} riposte !`);
      G.R.text(a.hx, a.hy - 50, 'Riposte !', '#9fd8ff', { size: 0.8 });
      const back = await this.lunge(a, b);
      G.FX.slash(...this.center(b), '#bfe6ff');
      await this.hit(a, b, { s: 'atk', p: 0.9, e: this.weaponElem(a), phys: true, isCounter: true });
      await back();
    }
  },
  applyStatuses(src, tgt, list, positive) {
    list.forEach(([id, ch, turns]) => {
      if (!tgt.alive) return;
      let c = ch;
      if (id === 'burn' && src.side === 'p' && src.calc.flags.has('pyro')) c += 0.2;
      if (tgt.boss && (id === 'stun')) c *= 0.4;
      if (tgt.side === 'p' && (id === 'poison' || id === 'burn') && tgt.calc.flags.has('immunePoison')) c = 0;
      if (Math.random() >= c) return;
      let t = turns;
      if (G.STATUS[id].bad && src.side === 'p' && src.calc.flags.has('longDebuff')) t++;
      tgt.st[id] = { t: Math.max(t, (tgt.st[id] && tgt.st[id].t) || 0) };
      const [x, y] = this.center(tgt);
      G.R.text(x, y - 30, `${G.STATUS[id].i} ${G.STATUS[id].n}`, G.STATUS[id].bad ? '#d8a8ff' : '#a8ffd8', { size: 0.65 });
      if (G.STATUS[id].bad) G.FX.debuff(x, y); else G.FX.buff(x, y, '#ffd86a');
    });
  },
  heal(u, amt, silent) {
    if (!u.alive || amt <= 0) return;
    const before = u.hp;
    u.hp = Math.min(this.maxHP(u), u.hp + amt);
    const [x, y] = this.center(u);
    if (u.hp > before) G.R.text(x, y - 10, '+' + (u.hp - before), '#8affa0', { size: silent ? 0.75 : 1 });
    if (!silent) G.FX.heal(x, y);
  },
  revive(u, pct) {
    u.alive = true; u.hp = Math.max(1, Math.round(this.maxHP(u) * pct)); u.alpha = 1; u.st = {};
    const [x, y] = this.center(u);
    G.FX.heal(x, y); G.R.light(x, y, 80, '#fff8c0', 1, 0.8);
    this.log(`${u.name} revient au combat !`);
  },
  cleanse(u) { Object.keys(u.st).forEach(k => { if (G.STATUS[k] && G.STATUS[k].bad) delete u.st[k]; }); },
  kill(u) {
    u.hp = 0; u.alive = false; u.st = {}; u.airborne = null; u.oy = 0;
    G.Audio.sfx('die');
    this.log(`${u.name} est vaincu(e) !`);
    if (u.side === 'e') {
      const [x, y] = this.center(u);
      G.R.burst(x, y, { n: 30, c: ['#ffffff', '#c8a8ff', '#ffe0a0'], spd: 50, life: 1, size: 1.4 });
      if (u.boss) { G.R.flash('#ffffff', 0.9); G.R.shake(6, 1); G.R.light(x, y, 160, '#ffffff', 1, 1.2); }
    }
  },
  // ---------------- Objets ----------------
  async doItem(u, id, t) {
    const I = G.ITEMS[id], E = I.eff;
    G.give(id, -1);
    this.log(`${u.name} utilise ${I.n}.`);
    u.pose = 'atk';
    if (E.bomb) {
      for (const x of this.targetable('e')) await this.hit(u, x, { s: 'atk', p: 0, e: E.e, phys: false, flat: E.bomb }, null, true);
    } else if (I.tgt === 'allies') {
      this.alive('p').forEach(p => { if (E.heal) this.heal(p, E.heal); if (E.mp) p.mp = this.maxMP(p); });
    } else if (t) {
      if (E.revive && !t.alive) this.revive(t, E.revive);
      else if (t.alive) {
        if (E.heal) this.heal(t, E.heal);
        if (E.mp) { t.mp = Math.min(this.maxMP(t), t.mp + E.mp); const [x, y] = this.center(t); G.R.text(x, y - 20, '+' + E.mp + ' PM', '#8ad8ff'); G.FX.buff(x, y, '#8ad8ff'); }
        if (E.cleanse) { this.cleanse(t); G.FX.buff(...this.center(t), '#ffffff'); }
      }
    }
    await U.wait(450);
    u.pose = null;
  },
  // ---------------- Familiers ----------------
  async famAssist(u) {
    const fam = u.calc.fam;
    if (!fam || Math.random() > 0.38) return;
    const F = G.FAMS[fam.id], lv = G.S.fams[fam.id].lvl, mul = (1 + lv * 0.07) * (u.calc.reson ? 1.2 : 1);
    const best = Math.max(this.stat(u, 'atk'), this.stat(u, 'mag'));
    const foes = this.targetable('e');
    const [x, y] = this.center(u);
    G.R.text(x - 14, y - 34, F.n, '#ffe8a0', { size: 0.6 });
    switch (F.assist) {
      case 'heal': {
        const lo = this.alive('p').sort((a, b) => a.hp / this.maxHP(a) - b.hp / this.maxHP(b))[0];
        if (lo && lo.hp < this.maxHP(lo)) { this.heal(lo, Math.round(this.maxHP(lo) * 0.06 + lv * 6)); this.log(`${F.n} soigne ${lo.name}.`); }
        break;
      }
      case 'fire': if (foes.length) { const t = U.pick(foes); this.log(`${F.n} crache une flammèche !`); await this.hit(u, t, { s: 'best', p: 0.45 * mul, e: 'feu' }); } break;
      case 'peck': if (foes.length) { const t = U.pick(foes); this.log(`${F.n} pique ${t.name} !`); await this.hit(u, t, { s: 'best', p: 0.4 * mul, e: 'vent' }); if (Math.random() < 0.3) { u.st.spdUp = { t: 2 }; } } break;
      case 'shield': u.st.shield = { t: 99, v: Math.round(this.maxHP(u) * 0.05 + lv * 8) + ((u.st.shield && u.st.shield.v) || 0) }; G.R.text(x, y - 20, 'Bouclier', '#9fd8ff', { size: 0.7 }); this.log(`${F.n} protège ${u.name}.`); break;
      case 'scratch': if (foes.length) { const t = U.pick(foes); this.log(`${F.n} griffe ${t.name} !`); await this.hit(u, t, { s: 'best', p: 0.55 * mul, crit: 25 }); } break;
    }
    void best;
    await U.wait(200);
  },
  async doTech(u, t) {
    const fam = u.calc.fam, F = G.FAMS[fam.id], S = G.SKILLS[F.tech], lv = G.S.fams[fam.id].lvl;
    u.energy = 0;
    G.S.stats.tech++;
    G.addAffinity(fam.id, u.cid, 4);
    const mul = (1 + lv * 0.08) * (u.calc.link >= 3 ? 1.3 : 1) * (u.calc.reson ? 1.15 : 1);
    G.UI.battleBanner(`${S.n} — ${u.name} & ${F.n}`, 'p', true);
    this.log(`Technique liée : ${S.n} !`);
    G.R.flash(F.e ? G.ELEM[F.e].c : '#c86aff', 0.5);
    await U.wait(500);
    const o = Object.assign({ phys: false, techMul: mul }, S.dmg);
    if (S.t === 'enemy') { const tg = t && t.alive ? t : U.pick(this.targetable('e')); if (tg) await this.hit(u, tg, o, S); }
    else if (o.rnd) { for (let i = 0; i < (o.h || 1); i++) { const c = this.targetable('e'); if (!c.length) break; await this.hit(u, U.pick(c), o, S, true); } }
    else for (const x of this.targetable('e')) await this.hit(u, x, o, S, true);
    if (S.special === 'geyser') this.alive('p').forEach(p => this.heal(p, Math.round(this.maxHP(p) * 0.15 * mul)));
    if (S.special === 'hurricane') this.alive('p').forEach(p => { p.st.spdUp = { t: 3 }; });
    if (S.special === 'carapace') this.alive('p').forEach(p => { p.st.shield = { t: 99, v: Math.round(this.maxHP(p) * 0.25 * mul) }; G.R.text(p.hx, p.hy - 46, 'Carapace', '#9fd8ff', { size: 0.7 }); });
    await U.wait(300);
  },
  // ---------------- Fin du combat ----------------
  async finish() {
    await U.wait(600);
    const S = G.S;
    // sauvegarde des PV/PM
    const syncParty = () => this.units.filter(u => u.side === 'p').forEach(u => { const c = S.chars[u.cid]; c.hp = Math.max(1, u.alive ? u.hp : 1); c.mp = Math.max(0, u.mp); });
    if (this.result === 'win') {
      G.Audio.music('victory'); G.Audio.sfx('win');
      const es = this.units.filter(u => u.side === 'e');
      const HB = G.huntBonus();
      const expBonus = 1 + (S.town.b.taverne || 0) * 0.05 + HB.exp;
      const exp = Math.round(es.reduce((a, u) => a + u.E.exp, 0) * expBonus);
      const gold = Math.round(es.reduce((a, u) => a + u.E.gold, 0) * (1 + HB.gold));
      S.gold += gold; S.stats.goldEarned += gold;
      S.stats.wins++; S.stats.kills += es.length;
      const drops = {};
      es.forEach(u => {
        (u.E.tags || []).forEach(t => S.stats.tags[t] = (S.stats.tags[t] || 0) + 1);
        u.E.drops.forEach(([id, ch, a, b]) => { if (Math.random() < Math.min(1, ch * HB.drop)) { const q = U.randi(a, b); drops[id] = (drops[id] || 0) + q; } });
        if (u.boss && !u.E.elite) S.bosses[u.eid] = true;
      });
      for (const k in drops) G.give(k, drops[k]);
      if (this.opts.hunt) S.hunts[this.opts.hunt] = 'done';
      syncParty();
      const lv = [];
      this.units.filter(u => u.side === 'p').forEach(u => {
        const r = G.gainExp(u.cid, u.alive ? exp : Math.round(exp / 2));
        if (r.ups.length) lv.push({ cid: u.cid, lvl: S.chars[u.cid].lvl, learned: r.learned });
      });
      // familiers
      const famRes = [];
      this.units.filter(u => u.side === 'p').forEach(u => {
        const f = G.famOf(u.cid); if (!f) return;
        const up = G.famGainExp(f.id, 10 + es.length * 3);
        const before = G.linkLevel(f.id, u.cid);
        if (u.alive) G.addAffinity(f.id, u.cid, this.opts.boss ? 8 : 3);
        const after = G.linkLevel(f.id, u.cid);
        famRes.push({ fid: f.id, cid: u.cid, up, linkUp: after > before ? after : 0 });
      });
      // apprivoisement
      let tamed = null;
      es.forEach(u => { if (!tamed && u.E.tame && !S.fams[u.E.tame] && (S.items.appat || 0) > 0 && Math.random() < 0.4) { G.give('appat', -1); G.addFam(u.E.tame); tamed = u.E.tame; } });
      G.townTick();
      await G.UI.battleResults({ exp, gold, drops, lv, famRes, tamed });
      G.UI.battleClose();
      this.back(async () => {
        if (this.opts.hunt) { G.Audio.sfx('achieve'); await G.UI.say([{ who: 'Chasse', t: `Cible abattue : ${es[0].E.n} ! Retournez au tableau de chasse (Bourg-Aube, Havre ou Menu › Chasses) pour toucher la prime.` }]); }
        else if (this.opts.boss) await this.bossAftermath(es[0].eid);
        G.UI.checkAch(); G.save();
      });
    } else if (this.result === 'flee') {
      syncParty();
      G.UI.battleClose();
      this.back();
    } else {
      G.UI.battleClose();
      await G.UI.say([{ who: '', t: 'L’équipe s’effondre… Vous vous réveillez à l’auberge, délestés de la moitié de votre or.' }]);
      S.gold = Math.floor(S.gold / 2);
      G.healAll();
      this.back(() => { G.World.placePlayer(S.rest.x, S.rest.y, 'down'); G.save(); }, true);
    }
  },
  back(after, defeat) {
    G.scene = 'trans';
    G.R.transition('fadeout', 0.35, () => {
      if (defeat) G.World.placePlayer(G.S.rest.x, G.S.rest.y, 'down');
      G.World.refresh();
      G.scene = 'world'; G.view = 'world';
      G.Audio.music(G.World.musicFor());
      G.R.parts = [];
      G.R.transition('fadein', 0.4, () => { after && after(); });
    });
  },
  async bossAftermath(id) {
    const S = G.S;
    const txt = {
      sylvaros: [{ who: '', t: 'L’écorce noire se fend… Sylvaros retrouve sa sérénité millénaire.' }, { who: 'Sylvaros', t: 'Merci, enfants de l’Aube… Prenez mon Écho. La forêt veillera sur votre Havre.' }],
      wyverne: [{ who: '', t: 'Les nuages se dissipent. La Wyverne se pose, apaisée.' }, { who: 'Wyverne', t: 'Le ciel est à nouveau libre… Mon Écho est vôtre.' }],
      hydre: [{ who: '', t: 'Les brumes se lèvent sur le marais. L’Hydre plonge dans les eaux redevenues claires.' }],
      ignar: [{ who: 'Ignar', t: 'Impossible… Les Échos… s’unissent contre moi…' }, { who: '', t: 'Le Dragon des Cendres s’effondre. Une pluie de lumière tombe sur le monde.' }, { who: 'Lyra', t: 'C’est fini… Les Échos élémentaires sont libres.' }, { who: 'Bran', t: 'Rentrons au Havre. Il y a encore tant à construire !' }, { who: '', t: '✦ FÉLICITATIONS ✦ Vous avez terminé l’histoire principale. Continuez à développer le Havre, à forger et à compléter l’arbre des accomplissements !' }],
    }[id];
    await G.UI.say(txt);
    const n = ['sylvaros', 'wyverne', 'hydre'].filter(b => S.bosses[b]).length;
    if (id !== 'ignar' && n === 3) await G.UI.say([{ who: '', t: 'Les trois Échos résonnent à l’unisson… Au loin, la barrière de flammes du Volcan s’éteint !' }]);
    if (id === 'ignar') S.flags.cleared = true;
    G.World.refresh();
  },
  log(t) { this.lastLog = t; G.UI.battleLog(t); },
  // ---------------- Animation ----------------
  tween(o, to, ms) {
    return new Promise(res => {
      const from = {}; for (const k in to) from[k] = o[k];
      this.tweens.push({ o, from, to, d: ms / 1000, t: 0, res });
    });
  },
  update(dt) {
    this.time += dt;
    this.tweens.forEach(tw => {
      tw.t += dt; const p = Math.min(1, tw.t / tw.d), e = 1 - Math.pow(1 - p, 3);
      for (const k in tw.to) tw.o[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
      if (p >= 1) { tw.done = true; tw.res(); }
    });
    this.tweens = this.tweens.filter(t => !t.done);
    this.units.forEach(u => { if (u.flash > 0) u.flash -= dt; if (u.side === 'e' && !u.alive) u.alpha = Math.max(0, u.alpha - dt * 1.5); });
    // ambiance
    if (Math.random() < 0.3) {
      const R = G.R, b = this.bg, P = (o) => R.parts.push(Object.assign({ x: Math.random() * R.W, y: Math.random() * this.BH, vx: 0, vy: 0, life: 3, max: 3, size: 0.8, c: '#fff', glow: true, grav: 0, drag: 1, type: 'dot', rot: 0 }, o));
      if (b === 'volcano') P({ y: this.BH, vy: -20, vx: U.rand(-5, 5), c: U.pick(['#ff8a2a', '#ffcf40']) });
      else if (b === 'forest') P({ y: -3, vy: 12, vx: U.rand(-6, 6), c: U.pick(['#6a9a3a', '#a8a040']), type: 'leaf', glow: false, size: 1.3, life: 5, max: 5 });
      else if (b === 'swamp') { if (Math.random() < 0.3) P({ c: '#c8e8d8', type: 'fog', size: 30, life: 5, max: 5, vx: 4 }); }
      else if (b === 'mountain') P({ y: -3, vy: 16, vx: -8, c: '#ffffff', glow: false, life: 5, max: 5 });
      else if (Math.random() < 0.3) P({ vy: -3, c: '#fff8d0', size: 0.6 });
    }
  },
  // ---------------- Rendu ----------------
  render() {
    const R = G.R, x = R.lx, W = R.W, H = R.H, BH = this.BH;
    x.drawImage(this.background(W, H, BH), 0, 0);
    const t = this.time;
    // éléments animés du décor
    if (this.bg === 'plains' || this.bg === 'mountain') {
      x.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 4; i++) { const cx = ((i * 97 + t * (4 + i)) % (W + 80)) - 40, cy = 10 + i * 9; x.beginPath(); x.ellipse(cx, cy, 18 + i * 3, 4, 0, 0, Math.PI * 2); x.fill(); }
    }
    const lights = [];
    if (this.bg === 'volcano') for (let i = 0; i < 5; i++) lights.push({ x: (i + 0.5) * W / 5, y: BH * 0.92, r: 50, c: '#ff5a1a', a: 0.6 + Math.sin(t * 2 + i) * 0.2 });
    if (this.bg === 'swamp') lights.push({ x: W * 0.5, y: BH * 0.3, r: 70, c: '#7affd8', a: 0.3 });
    // unités triées par profondeur
    const sorted = this.units.slice().sort((a, b) => a.hy - b.hy);
    for (const u of sorted) {
      if (u.side === 'e' && u.alpha <= 0) continue;
      const bob = u.alive ? Math.sin(t * 3 + u.i * 1.7) * (u.side === 'e' ? 1.5 : 0.8) : 0;
      let img, sc;
      if (u.side === 'p') { img = G.SPR.battler(u.cid, u.calc.wid, u.pose === 'atk' ? 'atk' : 'idle'); sc = 2; }
      else { img = G.SPR.enemy(u.E.spr, u.E.pal, u.E.e); sc = this.escale(u); }
      const w = img.width * sc, h = img.height * sc;
      const px = Math.round(u.hx + u.ox - w / 2), py = Math.round(u.hy + u.oy - h + (u.side === 'p' ? 2 : 0) + bob);
      // ombre
      const air = Math.min(1, -u.oy / 120);
      x.fillStyle = `rgba(10,8,25,${0.32 * (1 - air * 0.7)})`; x.beginPath(); x.ellipse(u.hx + u.ox, u.hy + 1, (w * 0.32) * (1 - air * 0.5), 3 + w * 0.04, 0, 0, Math.PI * 2); x.fill();
      x.save();
      x.globalAlpha = u.alpha * (u.E && u.E.spr === 'ghost' ? 0.82 : 1);
      if (u.side === 'p' && !u.alive) {
        x.translate(u.hx, u.hy - 6); x.rotate(-Math.PI / 2); x.filter = 'grayscale(0.8)';
        x.drawImage(img, -w / 2, -h / 2, w, h);
      } else {
        x.drawImage(img, px, py, w, h);
        if (u.flash > 0) x.drawImage(this.whiteOf(img), px, py, w, h);
      }
      x.restore();
      if (u.side === 'e' && u.alive) {
        const bw = Math.min(40, w * 0.7), bx = Math.round(u.hx - bw / 2), by = Math.round(u.hy + 4);
        x.fillStyle = 'rgba(0,0,0,0.6)'; x.fillRect(bx - 1, by - 1, bw + 2, 4);
        x.fillStyle = '#4a1010'; x.fillRect(bx, by, bw, 2);
        x.fillStyle = u.hp / u.maxhp > 0.5 ? '#6aff8a' : u.hp / u.maxhp > 0.25 ? '#ffd040' : '#ff5a4a';
        x.fillRect(bx, by, Math.max(0, Math.round(bw * u.hp / u.maxhp)), 2);
        let sx = bx;
        Object.keys(u.st).slice(0, 5).forEach(k => { x.fillStyle = G.STATUS[k] && G.STATUS[k].bad ? '#c86aff' : '#6affc8'; x.fillRect(sx, by + 4, 3, 2); sx += 4; });
        if (u.E.e) lights.push({ x: u.hx, y: u.hy - h * 0.5, r: u.boss ? 90 : 26, c: G.ELEM[u.E.e].c, a: u.boss ? 0.5 : 0.25 });
      }
      if (this.active === u && u.side === 'p' && u.alive) {
        const ay = Math.round(py - 6 + Math.sin(t * 6) * 2);
        x.fillStyle = '#ffe080'; x.beginPath(); x.moveTo(u.hx - 4, ay - 4); x.lineTo(u.hx + 4, ay - 4); x.lineTo(u.hx, ay + 1); x.fill();
      }
      if (this.cursor === u) {
        const ay = Math.round(py - 6 + Math.sin(t * 8) * 2);
        x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(u.hx - 5, ay - 5); x.lineTo(u.hx + 5, ay - 5); x.lineTo(u.hx, ay + 1); x.fill();
        lights.push({ x: u.hx, y: u.hy - h * 0.5, r: 40, c: '#ffffff', a: 0.4 });
      }
    }
    const grade = { plains: 'rgba(255,220,160,0.12)', forest: 'rgba(60,160,80,0.18)', mountain: 'rgba(140,170,220,0.15)', swamp: 'rgba(120,90,160,0.25)', volcano: 'rgba(255,90,40,0.22)' }[this.bg];
    R.present({ dof: 0.55, focusTop: 0.18, focusBot: 0.95, bloom: 0.26, dark: this.bg === 'swamp' ? 0.2 : this.bg === 'volcano' ? 0.18 : 0, darkCol: this.bg === 'volcano' ? '#300808' : '#101830', lights, grade, vignette: 0.55, rays: this.bg === 'forest' ? 0.9 : 0 });
  },
  whiteOf(img) {
    const key = 'white_' + (img._id || (img._id = Math.random().toString(36).slice(2)));
    return G.SPR.get(key, () => { const c = U.canvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height); return c; });
  },
  // Décor de fond (mis en cache)
  background(W, H, BH) {
    return G.SPR.get(`bg_${this.bg}_${W}_${H}_${BH}`, () => {
      const c = U.canvas(W, H), x = c.getContext('2d'), b = this.bg;
      const pal = {
        plains: { sky: ['#6ab0f0', '#cfe8ff'], far: '#7aa0c8', mid: '#4f8f3e', ground: ['#5aa03c', '#3f7a2e'] },
        forest: { sky: ['#2a5a3a', '#7ab070'], far: '#24482a', mid: '#1f3f22', ground: ['#3d7a32', '#244a1e'] },
        mountain: { sky: ['#5a7ab0', '#d8e4f0'], far: '#8a94a8', mid: '#6a6a74', ground: ['#8f877a', '#5e584e'] },
        swamp: { sky: ['#2a2a40', '#6a7a6a'], far: '#3a4a40', mid: '#2a3a2a', ground: ['#4f5a38', '#2e3622'] },
        volcano: { sky: ['#1a0a0a', '#8a2a1a'], far: '#3a1a14', mid: '#2a1210', ground: ['#3d2c2a', '#1e1412'] },
      }[b];
      const hz = Math.round(BH * 0.42);
      let g = x.createLinearGradient(0, 0, 0, hz);
      g.addColorStop(0, pal.sky[0]); g.addColorStop(1, pal.sky[1]); x.fillStyle = g; x.fillRect(0, 0, W, hz + 2);
      // silhouettes lointaines
      x.fillStyle = pal.far; x.beginPath(); x.moveTo(0, hz);
      for (let i = 0; i <= W; i += 4) x.lineTo(i, hz - 8 - (b === 'mountain' || b === 'volcano' ? 22 : 8) * U.fbm(i / 40, 1, 3) - (b === 'volcano' && Math.abs(i - W * 0.7) < 30 ? 30 - Math.abs(i - W * 0.7) : 0));
      x.lineTo(W, hz); x.fill();
      if (b === 'volcano') { x.fillStyle = '#ff5a1a'; x.fillRect(Math.round(W * 0.7) - 3, hz - 40, 6, 3); }
      x.fillStyle = pal.mid; x.beginPath(); x.moveTo(0, hz + 2);
      for (let i = 0; i <= W; i += 3) x.lineTo(i, hz - 2 - 10 * U.fbm(i / 18, 5, 7));
      x.lineTo(W, hz + 2); x.fill();
      // sol en perspective
      g = x.createLinearGradient(0, hz, 0, H);
      g.addColorStop(0, pal.ground[0]); g.addColorStop(1, pal.ground[1]); x.fillStyle = g; x.fillRect(0, hz, W, H - hz);
      for (let i = 0; i < 14; i++) { const y = hz + Math.pow(i / 14, 1.8) * (H - hz); x.fillStyle = 'rgba(0,0,0,0.06)'; x.fillRect(0, Math.round(y), W, 1); }
      for (let i = 0; i < 260; i++) {
        const px = U.hash(i, 1, 4) * W, py = hz + Math.pow(U.hash(i, 2, 4), 0.7) * (H - hz), s = 1 + (py - hz) / (H - hz) * 2;
        x.fillStyle = U.hash(i, 3, 4) < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)'; x.fillRect(px, py, s, Math.max(1, s * 0.5));
      }
      // décor de premier plan
      if (b === 'forest') { for (let i = 0; i < 6; i++) { const tx = U.hash(i, 9, 1) * W; x.fillStyle = '#1a2e16'; x.fillRect(tx, 0, 6 + i % 3 * 3, hz + 6); } }
      if (b === 'swamp') { x.fillStyle = 'rgba(60,100,90,0.5)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(U.hash(i, 4, 2) * W, hz + 10 + U.hash(i, 5, 2) * (BH - hz), 30, 5, 0, 0, Math.PI * 2); x.fill(); } }
      if (b === 'volcano') { x.fillStyle = '#ff5a1a'; for (let i = 0; i < 6; i++) { const y = hz + 6 + U.hash(i, 3, 3) * (BH - hz); x.fillRect(U.hash(i, 2, 3) * W, y, 14 + i * 3, 1); } }
      // zone d'interface (bas de l'écran)
      g = x.createLinearGradient(0, BH - 10, 0, H);
      g.addColorStop(0, 'rgba(5,5,20,0)'); g.addColorStop(0.35, 'rgba(5,5,20,0.65)'); g.addColorStop(1, 'rgba(5,5,20,0.9)');
      x.fillStyle = g; x.fillRect(0, BH - 10, W, H - BH + 10);
      return c;
    });
  },
};
