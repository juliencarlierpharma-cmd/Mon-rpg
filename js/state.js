'use strict';
// ============================================================
//  État de la partie, statistiques, inventaire, sauvegarde
// ============================================================
G.STATK = ['hp', 'mp', 'atk', 'mag', 'def', 'res', 'spd'];
G.STATN = { hp: 'PV', mp: 'PM', atk: 'ATQ', mag: 'MAG', def: 'DÉF', res: 'RÉS', spd: 'VIT', crit: 'CRIT' };
G.MAX_LVL = 30;
G.SAVE_KEY = 'echos-elementaires-save-v1';

G.newChar = id => {
  const d = G.CHARS[id];
  const w = { feu: null, eau: null, vent: null, terre: null };
  w[d.start] = { tier: 1 };
  return { id, lvl: 1, exp: 0, hp: null, mp: null, weapons: w, wslot: d.start, armor: null, acc: null };
};

G.newState = () => ({
  v: 2,
  party: ['kael', 'lyra'],
  chars: { kael: G.newChar('kael'), lyra: G.newChar('lyra'), bran: G.newChar('bran') },
  gold: 120,
  items: { potion: 5, ether: 2, remede: 2 },
  mats: { lingot: 2 },
  tools: { pick: 0, axe: 0 },
  armors: { tunique: 1, robe_lin: 1 },
  fams: {},
  ach: {},
  flags: {},
  stats: { wins: 0, kills: 0, tags: {}, gathered: 0, crafted: 0, wcraft: 0, weak: 0, tech: 0, goldEarned: 0, steps: 0, battlesTotal: 0 },
  bosses: {},
  town: { founded: false, b: {}, store: {}, prog: 0 },
  npcs: {},
  quests: {},
  hunts: {},
  hunter: { pts: 0, inf: 0 },
  pos: { x: 41, y: 43, dir: 'down' },
  rest: { x: 41, y: 43 },
  time: 9 * 60,
  nodes: {},
  chests: {},
  playTime: 0,
});

// ---------------- Helpers de progression ----------------
G.expNext = l => Math.floor(18 * Math.pow(l, 1.65) + 12);
G.famExpNext = l => 40 * l;
G.famMaxLvl = () => [3, 6, 8, 10][G.S.town.b.menagerie || 0];
G.townBuiltCount = () => Object.values(G.S.town.b).filter(v => v > 0).length;
G.prestige = () => Object.values(G.S.town.b).reduce((a, b) => a + b, 0);
G.maxLevel = () => Math.max(...G.S.party.map(id => G.S.chars[id].lvl));
G.maxAffinity = () => { let m = 0; Object.values(G.S.fams).forEach(f => Object.values(f.aff).forEach(v => m = Math.max(m, v))); return m; };
G.weaponsOf = cid => Object.values(G.S.chars[cid].weapons).filter(Boolean).length;
G.maxWeaponsOneChar = () => Math.max(...G.CHAR_ORDER.map(G.weaponsOf));
G.totalWeapons = () => G.CHAR_ORDER.reduce((a, c) => a + G.weaponsOf(c), 0);
G.maxWeaponTier = () => (G.S.town.b.forge || 0) >= 4 ? 6 : 1 + (G.S.town.b.forge || 0);
G.maxArmorTier = () => 1 + (G.S.town.b.atelier || 0);
G.famOf = cid => { const id = Object.keys(G.S.fams).find(k => G.S.fams[k].owner === cid); return id ? { id, ...G.S.fams[id], ref: G.S.fams[id] } : null; };
G.linkLevel = (famId, cid) => { const a = G.S.fams[famId].aff[cid] || 0; return a >= 100 ? 3 : a >= 60 ? 2 : a >= 30 ? 1 : 0; };

// ---------------- Calcul des statistiques ----------------
G.calc = cid => {
  const S = G.S, c = S.chars[cid], d = G.CHARS[cid];
  const wid = d.weapons[c.wslot], w = G.WEAPONS[wid], tier = (c.weapons[c.wslot] || { tier: 1 }).tier;
  const flat = {}, pct = {};
  G.STATK.forEach(k => { flat[k] = d.base[k] + d.gr[k] * (c.lvl - 1); pct[k] = 0; });
  flat.atk += w.base.atk + w.gr.atk * (tier - 1);
  flat.mag += w.base.mag + w.gr.mag * (tier - 1);
  let crit = 5 + (w.crit || 0), mpRegen = 0;
  const flags = new Set([w.trait.f]), elRes = { feu: 0, eau: 0, vent: 0, terre: 0 };
  const passives = [];
  const applyMods = m => { if (!m) return; for (const k in m) { if (k === 'crit') crit += m[k]; else if (k === 'mpRegen') mpRegen += m[k]; else pct[k] += m[k]; } };
  [c.armor, c.acc].forEach(aid => {
    if (!aid) return;
    const a = G.ARMORS[aid];
    for (const k in a.st) { if (k === 'crit') crit += a.st[k]; else flat[k] += a.st[k]; }
    applyMods(a.mods);
    (a.flags || []).forEach(f => flags.add(f));
    if (a.el) for (const e in a.el) elRes[e] += a.el[e];
  });
  const skills = [];
  w.skills.forEach(s => {
    if (s.lvl > c.lvl || s.tier > tier) return;
    const sk = G.SKILLS[s.id];
    if (sk.passive) { applyMods(sk.mods); (sk.flags || []).forEach(f => flags.add(f)); passives.push(sk.n); }
    else skills.push(s.id);
  });
  d.innate.forEach(p => { if (c.lvl >= p.lvl) { applyMods(p.mods); passives.push(p.n); } });
  const fam = G.famOf(cid);
  let link = 0, reson = false;
  if (fam) {
    link = G.linkLevel(fam.id, cid);
    reson = G.FAMS[fam.id].e === c.wslot;
    if (link >= 1) {
      const mul = (link >= 3 ? 2 : 1) * (reson ? 1.5 : 1);
      const b = G.FAMS[fam.id].bonus;
      for (const k in b) { if (k === 'crit') crit += b[k] * mul; else pct[k] += b[k] * mul; }
    }
  }
  const out = { cid, wid, w, tier, flags, elRes, skills, passives, mpRegen, fam, link, reson };
  G.STATK.forEach(k => { out[k] = Math.max(1, Math.round(flat[k] * (w.mult[k] || 1) * (1 + pct[k]))); });
  out.crit = Math.round(crit);
  out.elem = w.e;
  return out;
};

G.curHP = cid => { const c = G.S.chars[cid], m = G.calc(cid); if (c.hp == null) c.hp = m.hp; c.hp = Math.min(c.hp, m.hp); return c.hp; };
G.curMP = cid => { const c = G.S.chars[cid], m = G.calc(cid); if (c.mp == null) c.mp = m.mp; c.mp = Math.min(c.mp, m.mp); return c.mp; };
G.healAll = () => G.CHAR_ORDER.forEach(id => { const m = G.calc(id); G.S.chars[id].hp = m.hp; G.S.chars[id].mp = m.mp; });

// ---------------- Inventaire ----------------
G.isMat = id => !!G.MATS[id];
G.countOf = id => G.isMat(id) ? (G.S.mats[id] || 0) : (G.S.items[id] || 0);
G.give = (id, q = 1) => {
  const bag = G.isMat(id) ? G.S.mats : G.S.items;
  bag[id] = (bag[id] || 0) + q;
  if (bag[id] <= 0) delete bag[id];
};
// texte d'obtention avec le stock actuel (à appeler après G.give)
G.gotText = (id, q) => `${G.iconOf(id)} ${G.nameOf(id)} +${q} (${G.countOf(id)} en stock)`;
G.goldText = q => `💰 +${U.fmt(q)} (${U.fmt(G.S.gold)} or)`;
G.rewardGotText = rw => {
  const p = [];
  if (rw.g) p.push(G.goldText(rw.g));
  for (const k in (rw.items || {})) p.push(G.gotText(k, rw.items[k]));
  for (const k in (rw.mats || {})) p.push(G.gotText(k, rw.mats[k]));
  return p.concat(G.rewardText({ armor: rw.armor, fam: rw.fam, tool: rw.tool }));
};
G.nameOf = id => (G.MATS[id] || G.ITEMS[id] || G.ARMORS[id] || G.TOOLS[id] || { n: id }).n;
G.iconOf = id => (G.MATS[id] || G.ITEMS[id] || { i: '•' }).i || '•';
G.canPay = cost => {
  if (!cost) return true;
  if ((cost.g || 0) > G.S.gold) return false;
  for (const k in (cost.m || {})) if (G.countOf(k) < cost.m[k]) return false;
  return true;
};
G.pay = cost => {
  if (!cost) return;
  G.S.gold -= cost.g || 0;
  for (const k in (cost.m || {})) G.give(k, -cost.m[k]);
};
G.costHTML = cost => {
  const parts = [];
  if (cost.g) parts.push(`<span class="cost ${G.S.gold >= cost.g ? 'ok' : 'no'}">💰 ${U.fmt(cost.g)}</span>`);
  for (const k in (cost.m || {})) {
    const have = G.countOf(k);
    parts.push(`<span class="cost ${have >= cost.m[k] ? 'ok' : 'no'}" title="${U.esc(G.nameOf(k))}">${G.iconOf(k)} ${U.esc(G.nameOf(k))} ${have}/${cost.m[k]}</span>`);
  }
  return parts.join(' ') || '<span class="cost ok">Gratuit</span>';
};
G.armorFree = aid => {
  const used = G.CHAR_ORDER.filter(c => G.S.chars[c].armor === aid || G.S.chars[c].acc === aid).length;
  return (G.S.armors[aid] || 0) - used;
};

// ---------------- Expérience ----------------
G.gainExp = (cid, amt) => {
  const c = G.S.chars[cid], ups = [];
  const snap = () => { const m = G.calc(cid); return m.skills.map(s => G.SKILLS[s].n).concat(m.passives); };
  const before = new Set(snap());
  c.exp += amt;
  while (c.lvl < G.MAX_LVL && c.exp >= G.expNext(c.lvl)) {
    c.exp -= G.expNext(c.lvl);
    const m0 = G.calc(cid);
    c.lvl++;
    const m1 = G.calc(cid);
    c.hp = (c.hp ?? m0.hp) + (m1.hp - m0.hp);
    c.mp = (c.mp ?? m0.mp) + (m1.mp - m0.mp);
    ups.push(c.lvl);
  }
  if (ups.length) { const m = G.calc(cid); c.hp = m.hp; c.mp = m.mp; }
  const learned = snap().filter(n => !before.has(n));
  return { ups, learned };
};

G.famGainExp = (fid, amt) => {
  const f = G.S.fams[fid];
  amt = Math.round(amt * (1 + (G.S.town.b.menagerie || 0) * 0.25));
  const max = G.famMaxLvl();
  let up = false;
  if (f.lvl >= max) { f.exp = Math.min(f.exp + amt, G.famExpNext(f.lvl) - 1); return false; }
  f.exp += amt;
  while (f.lvl < max && f.exp >= G.famExpNext(f.lvl)) { f.exp -= G.famExpNext(f.lvl); f.lvl++; up = true; }
  if (f.lvl >= max) f.exp = Math.min(f.exp, G.famExpNext(f.lvl) - 1);
  return up;
};
G.addAffinity = (fid, cid, amt) => {
  const f = G.S.fams[fid];
  if (G.S.chars[cid].acc === 'collier_lien') amt *= 2;
  f.aff[cid] = Math.min(100, (f.aff[cid] || 0) + amt);
};
G.addFam = fid => {
  if (G.S.fams[fid]) return false;
  G.S.fams[fid] = { lvl: 1, exp: 0, owner: null, aff: { kael: 0, lyra: 0, bran: 0 } };
  const free = G.S.party.find(c => !G.famOf(c));
  if (free) G.S.fams[fid].owner = free;
  return true;
};

// ---------------- Accomplissements ----------------
G.achState = a => {
  if (G.S.ach[a.id]) return 'claimed';
  if ((a.req || []).some(r => !G.S.ach[r])) return 'locked';
  const [cur, tgt] = a.c(G.S);
  return cur >= tgt ? 'ready' : 'progress';
};
G.achReadyCount = () => G.ACH.filter(a => G.achState(a) === 'ready').length;
G.rewardText = rw => {
  const p = [];
  if (rw.g) p.push(`💰 ${rw.g}`);
  for (const k in (rw.items || {})) p.push(`${G.iconOf(k)} ${G.nameOf(k)} x${rw.items[k]}`);
  for (const k in (rw.mats || {})) p.push(`${G.iconOf(k)} ${G.nameOf(k)} x${rw.mats[k]}`);
  if (rw.armor) p.push(`🛡️ ${G.ARMORS[rw.armor].n}`);
  if (rw.fam) p.push(`🐾 Familier : ${G.FAMS[rw.fam].n}`);
  if (rw.tool) p.push(`${G.TOOLS[rw.tool].i} ${G.TOOLS[rw.tool].n}`);
  return p;
};
G.claimAch = id => {
  const a = G.ACH.find(x => x.id === id);
  if (!a || G.achState(a) !== 'ready') return false;
  G.S.ach[id] = true;
  const rw = a.rw;
  if (rw.g) { G.S.gold += rw.g; }
  for (const k in (rw.items || {})) G.give(k, rw.items[k]);
  for (const k in (rw.mats || {})) G.give(k, rw.mats[k]);
  if (rw.armor) G.S.armors[rw.armor] = (G.S.armors[rw.armor] || 0) + 1;
  if (rw.fam) G.addFam(rw.fam);
  if (rw.tool) { const t = G.TOOLS[rw.tool]; G.S.tools[t.type] = Math.max(G.S.tools[t.type], t.tier); }
  return true;
};

// ---------------- Ville ----------------
G.buildReq = bid => {
  const b = G.BUILDINGS[bid], lvl = G.S.town.b[bid] || 0;
  if (lvl >= b.max) return { ok: false, why: 'Niveau maximal' };
  if (b.npc && !G.S.npcs[b.npc]) return { ok: false, why: `Recruter ${G.NPCS[b.npc].n} (${G.NPCS[b.npc].job})` };
  if (b.req && G.townBuiltCount() < b.req) return { ok: false, why: `${b.req} bâtiments requis` };
  const cost = b.cost[lvl];
  return { ok: G.canPay(cost), cost, why: G.canPay(cost) ? '' : 'Ressources insuffisantes' };
};
G.townTick = () => {
  const T = G.S.town;
  if (!T.founded) return;
  T.prog = (T.prog || 0) + 1;
  const add = (k, q) => { if (q > 0) T.store[k] = (T.store[k] || 0) + q; };
  add('_gold', (T.b.remparts || 0) * 15);
  if (T.prog % 3 === 0) {
    const h = T.b.herboristerie || 0, m = T.b.mine || 0;
    add('potion', h); add('herbe', h * 2); if (h >= 3) add('hipotion', 1);
    add('minerai', m * 2); add('pierre', m * 2); if (m >= 3) add('cristal', 1);
  }
};
G.collectTown = () => {
  const T = G.S.town, got = [];
  for (const k in T.store) {
    if (k === '_gold') { if (T.store[k] > 0) { G.S.gold += T.store[k]; got.push(G.goldText(T.store[k])); } }
    else { G.give(k, T.store[k]); got.push(G.gotText(k, T.store[k])); }
  }
  T.store = {};
  return got;
};

// ---------------- Tableau de chasse ----------------
G.hunterRankIdx = () => { const p = G.S.hunter.pts; let r = 0; G.HUNT_RANKS.forEach((R, i) => { if (p >= R.pts) r = i; }); return r; };
G.hunterRank = () => G.HUNT_RANKS[G.hunterRankIdx()];
G.huntUnlocked = h => G.HUNT_RANKS.findIndex(R => R.r === h.rank) <= G.hunterRankIdx();
G.huntBonus = () => { const i = G.hunterRankIdx(); return { exp: (i >= 1 ? 0.05 : 0) + (i >= 4 ? 0.05 : 0), gold: (i >= 2 ? 0.1 : 0) + (i >= 4 ? 0.1 : 0), drop: i >= 3 ? 1.25 : 1 }; };
G.giveReward = rw => {
  if (rw.g) { G.S.gold += rw.g; G.S.stats.goldEarned += rw.g; }
  for (const k in (rw.items || {})) G.give(k, rw.items[k]);
  for (const k in (rw.mats || {})) G.give(k, rw.mats[k]);
  if (rw.armor) G.S.armors[rw.armor] = (G.S.armors[rw.armor] || 0) + 1;
  if (rw.fam) G.addFam(rw.fam);
};
G.claimHunt = id => {
  const S = G.S;
  if (id === 'inf') {
    if (S.hunts.inf !== 'done') return null;
    const n = S.hunter.inf, rw = G.infReward(n);
    G.giveReward(rw); S.hunter.inf++; S.hunter.pts += 3; S.hunts.inf = null;
    return rw;
  }
  const h = G.HUNTS.find(x => x.id === id);
  if (!h || S.hunts[id] !== 'done') return null;
  G.giveReward(h.rw); S.hunter.pts += h.pts; S.hunts[id] = 'claimed';
  return h.rw;
};

// ---------------- Sauvegarde ----------------
G.save = () => {
  try { localStorage.setItem(G.SAVE_KEY, JSON.stringify(G.S)); return true; } catch (e) { return false; }
};
G.hasSave = () => { try { return !!localStorage.getItem(G.SAVE_KEY); } catch (e) { return false; } };
G.load = () => {
  try {
    const raw = localStorage.getItem(G.SAVE_KEY);
    if (!raw) return false;
    const base = G.newState(), s = JSON.parse(raw);
    G.S = Object.assign(base, s);
    G.S.stats = Object.assign(G.newState().stats, s.stats || {});
    G.S.town = Object.assign(G.newState().town, s.town || {});
    if ((s.v || 1) < 2) { const n = G.newState(); G.S.pos = n.pos; G.S.rest = n.rest; G.S.nodes = {}; G.S.flags.visited = { bourg: true, plaines: true }; G.S.v = 2; }
    return true;
  } catch (e) { console.error(e); return false; }
};
