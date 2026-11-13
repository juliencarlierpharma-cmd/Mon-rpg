'use strict';
// ============================================================
//  Sprites procéduraux (pixel art généré par code)
// ============================================================
G.SPR = { cache: {} };
const SPR = G.SPR;
SPR.get = (key, fn) => SPR.cache[key] || (SPR.cache[key] = fn());
// taille logique d'un sprite (un canvas de densité 2 occupe la moitié de sa taille en pixels)
SPR.lw = img => img.width / (img._d || 1);
SPR.lh = img => img.height / (img._d || 1);
SPR.draw = (ctx, img, x, y, sc = 1) => ctx.drawImage(img, x, y, SPR.lw(img) * sc, SPR.lh(img) * sc);

// ---------------- Héros / PNJ (32x32 pixels, 16x16 unités) ----------------
const DEF_NPC_PAL = { S: '#f2c9a0', s: '#d39a78', E: '#1a1a2e', o: '#160e1a' };
SPR.fullPal = p => {
  const P = Object.assign({}, DEF_NPC_PAL, p);
  if (!P.h) P.h = U.mix(P.H, '#000', 0.3);
  if (!P.L) P.L = '#e8e0c8';
  if (!P.D) P.D = U.mix(P.C, '#000', 0.35);
  if (!P.B) P.B = '#4a3422';
  return P;
};
// style de coiffure : 'spiky' (Kael), 'long' (Lyra), 'band' (Bran), 'beard' (barbe blanche), null
SPR.heroPix = (pal, dir, frame, extra) => {
  const P = SPR.fullPal(pal), g = new G.Pix(16, 16, 2);
  const hair = [P.h, P.H, U.mix(P.H, '#fff4d8', 0.4)], skin = [U.mix(P.S, P.s, 0.7), P.S, U.mix(P.S, '#ffffff', 0.35)];
  const cloth = [U.mix(P.C, '#120a20', 0.45), P.C, U.mix(P.C, '#ffffff', 0.35)], pants = [U.mix(P.D, '#000', 0.3), P.D, U.mix(P.D, '#fff', 0.25)];
  const boot = [U.mix(P.B, '#000', 0.35), P.B, U.mix(P.B, '#fff', 0.3)], acc = [U.mix(P.L, '#000', 0.3), P.L, U.mix(P.L, '#fff', 0.4)];
  const side = dir === 'left' || dir === 'right', back = dir === 'up';
  const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0; // balancement de marche
  const st = extra;
  // --- cheveux longs derrière le corps ---
  if (st === 'long' && !back) {
    if (side) g.poly([[3.6, 4.5], [7, 4.5], [6.8, 11.6], [3.4, 11.2]], hair);
    else g.poly([[3, 5], [13, 5], [13.4, 11.4], [2.6, 11.4]], [hair[0], hair[0], hair[1]]);
  }
  // --- jambes & bottes ---
  if (side) {
    const a = sw * 0.9;
    [[6.3 - a, pants[0]], [7.6 + a, null]].forEach(([lx, dark], i) => {
      const lift = i === 0 ? Math.max(0, sw) * 0.4 : Math.max(0, -sw) * 0.4;
      g.rect(lx, 11.6, 2, 2.6 - lift, i === 0 ? [pants[0], pants[0], pants[1]] : pants);
      g.rect(lx - 0.1, 14 - lift, 2.6, 1.5, i === 0 ? [boot[0], boot[0], boot[1]] : boot);
    });
  } else {
    const l1 = frame === 1 ? 0.5 : 0, l2 = frame === 2 ? 0.5 : 0;
    g.rect(5.5, 11.6, 2.2, 2.6 - l1, pants); g.rect(8.3, 11.6, 2.2, 2.6 - l2, pants);
    g.rect(5.3, 14 - l1, 2.5, 1.5, boot); g.rect(8.2, 14 - l2, 2.5, 1.5, boot);
  }
  // --- bras arrière (profil) ---
  if (side) { g.ell(6.4 - sw * 0.6, 10.3, 1.05, 1.9, [cloth[0], cloth[0], cloth[1]]); g.ell(6.4 - sw * 0.9, 12.1, 0.8, 0.8, [skin[0], skin[0], skin[1]]); }
  // --- torse ---
  if (side) g.poly([[5.4, 8.5], [10.4, 8.5], [10.8, 12.1], [5.1, 12.1]], cloth);
  else g.poly([[4.5, 8.5], [11.5, 8.5], [12, 12.1], [4, 12.1]], cloth);
  // plis et ceinture
  if (!side) { g.hline(6.2, 9.4, 6.6, 11, cloth[0]); g.hline(9.8, 9.4, 9.4, 11, cloth[0]); }
  g.rect(side ? 5.2 : 4.2, 11.1, side ? 5.5 : 7.6, 0.8, boot);
  if (!back) g.rect(side ? 9.4 : 7.5, 11.1, 1, 0.8, ['#a8781a', '#e8c050', '#fff0a0']);
  if (!back && !side) g.poly([[6.4, 8.5], [9.6, 8.5], [8, 10.2]], acc);
  if (side && !back) g.poly([[9, 8.5], [10.5, 8.5], [10.4, 9.8]], acc);
  // --- bras avant ---
  if (side) { g.ell(8.6 + sw * 0.7, 10.3, 1.1, 1.95, cloth); g.ell(8.7 + sw * 1, 12.2, 0.85, 0.85, skin); }
  else {
    const a1 = frame === 1 ? -0.4 : frame === 2 ? 0.4 : 0;
    g.ell(3.9, 10.2 + a1, 1.15, 1.95, cloth); g.ell(12.1, 10.2 - a1, 1.15, 1.95, cloth);
    g.ell(3.9, 12.1 + a1, 0.85, 0.85, skin); g.ell(12.1, 12.1 - a1, 0.85, 0.85, skin);
  }
  // --- tête ---
  const hx = side ? 8.4 : 8;
  if (!side && !back) { g.ell(3.7, 6, 0.6, 0.8, skin); g.ell(12.3, 6, 0.6, 0.8, skin); }
  g.ell(hx, 5.6, side ? 4.2 : 4.4, 4.1, skin);
  if (side) g.ell(12.3, 6.5, 0.6, 0.55, skin);
  // --- cheveux ---
  if (back) {
    g.ell(8, 5.1, 4.75, 4.4, hair);
    g.hline(6, 3, 5.5, 8, hair[0]); g.hline(8, 2.4, 8, 8.4, hair[0]); g.hline(10, 3, 10.5, 8, hair[0]);
    if (st === 'long') g.poly([[3.6, 6.5], [12.4, 6.5], [12.6, 11.6], [3.4, 11.6]], hair);
    if (st === 'band') { g.rect(3.4, 3.8, 9.2, 0.8, acc); g.poly([[7.4, 4.5], [8.6, 4.5], [9.4, 7], [8, 6.2], [6.8, 7]], acc); }
  } else if (side) {
    g.ell(7.6, 4.2, 4.6, 3.5, hair);
    g.poly([[3.5, 3.8], [8, 2.6], [7.6, 8.4], [4, 8.6]], hair);
    g.poly([[8.6, 1.4], [12.7, 4.3], [11.8, 5.6], [10.6, 4.6], [9.8, 5.8], [9, 4.4]], hair);
    if (st === 'spiky') { g.poly([[4, 2.6], [1.8, 1.2], [4.8, 1.4]], hair); g.poly([[6, 1.4], [5.4, -0.2], [7.6, 1]], hair); g.poly([[3.4, 4.6], [1.4, 4.2], [3.6, 3.6]], hair); }
    if (st === 'band') { g.rect(4, 3.6, 8.6, 0.8, acc); g.poly([[3.8, 3.8], [1.6, 5.2], [2.4, 6], [4, 4.6]], acc); }
    if (st === 'beard') g.poly([[9, 7], [12.2, 7.2], [11.4, 9.6], [9.4, 9.8]], ['#b8b8c0', '#e8e8ee', '#ffffff']);
    // visage de profil
    g.rect(10.3, 5.6, 0.75, 1.4, P.E); g.dot(10.4, 5.7, '#ffffff'); g.hline(10.1, 5.1, 11.1, 5.2, hair[0]);
    g.rect(11.1, 8, 0.6, 0.35, P.s);
  } else {
    g.ell(8, 3.9, 4.7, 3.3, hair);
    g.poly([[3.4, 4.1], [12.6, 4.1], [12.4, 5.6], [10.8, 4.7], [9.4, 5.5], [8, 4.6], [6.6, 5.5], [5.2, 4.7], [3.6, 5.8]], hair);
    g.rect(3.3, 4.4, 0.9, 2.8, [hair[0], hair[1], hair[1]]); g.rect(11.8, 4.4, 0.9, 2.8, [hair[0], hair[1], hair[1]]);
    if (st === 'spiky') { g.poly([[4.6, 2.6], [3.2, 0.4], [6.2, 1.8]], hair); g.poly([[7, 1.4], [8, -0.1], [9.2, 1.4]], hair); g.poly([[10, 1.8], [12.8, 0.4], [11.6, 2.8]], hair); }
    if (st === 'band') { g.rect(3.4, 3.3, 9.2, 0.85, acc); g.dot(4, 3.4, '#ffffff'); }
    // yeux, sourcils, bouche, joues
    [[5.8, 6.2], [9.3, 6.2]].forEach(([ex, ey]) => { g.rect(ex, ey, 0.95, 1.5, P.E); g.dot(ex + 0.05, ey + 0.05, '#ffffff'); g.dot(ex + 0.5, ey + 1, U.mix(P.E, '#8ac0ff', 0.45)); g.hline(ex - 0.15, ey - 0.5, ex + 1, ey - 0.6, hair[0]); });
    g.rect(7.6, 8.4, 0.8, 0.35, U.mix(P.s, '#8a3a3a', 0.3));
    g.dot(5.2, 7.7, U.mix(P.S, '#ff7a8a', 0.35)); g.dot(10.6, 7.7, U.mix(P.S, '#ff7a8a', 0.35));
    if (st === 'beard') g.poly([[5.4, 7.4], [10.6, 7.4], [10, 9.6], [8, 10.6], [6, 9.6]], ['#b8b8c0', '#e8e8ee', '#ffffff']);
  }
  return g;
};
SPR.CHAR_EXTRA = { kael: 'spiky', lyra: 'long', bran: 'band' };
SPR.hero = (key, pal, dir, frame, extra) => SPR.get(`h_${key}_${dir}_${frame}`, () => {
  let g = SPR.heroPix(pal, dir === 'left' ? 'right' : dir, frame, extra);
  g.outline('#1a1020').polish(0.02, 3);
  if (dir === 'left') g = g.mirror();
  return g.toCanvas();
});

// ---------------- Armes (vue de profil, tournée vers la droite) ----------------
const STEEL = ['#7d8796', '#c3ccd8', '#f4f8ff'];
SPR.WCOL = {
  brise_braise: { blade: ['#8a2a1a', '#e0602a', '#ffc070'], hilt: '#3a2418', gem: '#ffcf40' },
  lame_ressac: { blade: ['#6a8ab0', '#c8e0ff', '#ffffff'], hilt: '#1a2a4a', gem: '#43a8ff' },
  griffes_zephyr: { blade: STEEL, hilt: '#2a4a2a', gem: '#7dffb0' },
  rempart: { blade: STEEL, hilt: '#5a3a22', gem: '#d8a84a', shield: ['#7a5a20', '#c8963a', '#f0d080'] },
  sceptre_solaire: { blade: ['#5a3418', '#8a5a2e', '#b8844a'], hilt: '#5a3418', gem: '#ff7a2a' },
  calice: { blade: ['#a87a20', '#e8c050', '#fff0a0'], hilt: '#a87a20', gem: '#43a8ff' },
  arc_celeste: { blade: ['#4a6a3a', '#8ac070', '#d0f0b0'], hilt: '#e8e8e8', gem: '#7dffb0' },
  grimoire: { blade: ['#3a2410', '#6a4420', '#9a6a3a'], hilt: '#d8a84a', gem: '#d8a84a' },
  gantelets: { blade: ['#8a2a10', '#d8582a', '#ffa060'], hilt: '#3a2a2a', gem: '#ffcf40' },
  trident: { blade: ['#2a6a7a', '#4ab8c8', '#a8f0ff'], hilt: '#2a3a4a', gem: '#43a8ff' },
  lance_dragon: { blade: ['#2a6a4a', '#5ac08a', '#c0ffd8'], hilt: '#3a2a20', gem: '#7dffb0' },
  hache: { blade: ['#5a5a60', '#9a9aa4', '#d8d8e0'], hilt: '#6a4420', gem: '#a0a0a0' },
};
function blade(g, x, y, ang, len, w, cols, hiltLen, hiltCol, guardCol) {
  const ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca, st = 1 / g.k;
  for (let i = -hiltLen; i <= len; i += st) {
    for (let q = 0; q < w; q += st) {
      const xx = x + ca * i + px * (q - (w - st) / 2), yy = y + sa * i + py * (q - (w - st) / 2);
      if (i < 0) g.dot(xx, yy, (Math.round(i * g.k) % 2) ? hiltCol : U.mix(hiltCol, '#ffffff', 0.25));
      else g.dot(xx, yy, i > len - 1 ? cols[2] : q < st ? cols[2] : q >= w - st ? cols[0] : cols[1]);
    }
  }
  if (guardCol) for (let q = -2; q <= 2; q += st) { g.dot(x + px * q, y + py * q, guardCol); g.dot(x + px * q - ca * st, y + py * q - sa * st, U.mix(guardCol, '#000', 0.3)); }
}
SPR.drawWeapon = (g, wid, pose) => {
  const W = G.WEAPONS[wid], C = SPR.WCOL[wid], hx = 13, hy = 17, atk = pose === 'atk';
  switch (W.kind) {
    case 'greatsword': blade(g, hx, hy, atk ? 0.15 : -1.15, 13, 3, C.blade, 3, C.hilt, '#c8a040'); break;
    case 'katana': blade(g, hx, hy, atk ? 0.05 : -0.75, 12, 1, C.blade, 3, C.hilt, '#d8b040'); break;
    case 'daggers':
      blade(g, hx, hy, atk ? 0 : -0.6, 5, 2, C.blade, 2, C.hilt, null);
      blade(g, hx - 6, hy, atk ? 0.4 : -2.3, 5, 2, C.blade, 2, C.hilt, null); break;
    case 'swordshield':
      blade(g, hx, hy, atk ? 0.1 : -1.2, 8, 2, C.blade, 2, C.hilt, '#c8a040');
      g.ell(hx - 1 + (atk ? 0 : 2), hy - 1, 3, 4.5, C.shield); g.set(hx - 1 + (atk ? 0 : 2), hy - 1, '#fff6c0'); break;
    case 'staff':
      g.line(hx - 1, hy + 5, hx + (atk ? 6 : 1), hy - 12, C.blade[1]); g.line(hx, hy + 5, hx + (atk ? 7 : 2), hy - 12, C.blade[0]);
      g.ell(hx + (atk ? 7 : 2), hy - 13, 2.4, 2.4, U.shades(C.gem)); g.set(hx + (atk ? 6 : 1), hy - 14, '#ffffff'); break;
    case 'chalice':
      g.rect(hx, hy - 1, 1, 3, C.blade[1]); g.rect(hx - 1, hy + 2, 3, 1, C.blade[0]);
      g.ell(hx + 0.5, hy - 3, 2.5, 2, C.blade); g.rect(hx - 1, hy - 4, 3, 1, U.shades(C.gem)[2]); break;
    case 'bow': {
      const bx = hx + 2;
      for (let a = -1.3; a <= 1.3; a += 0.05) g.set(bx + Math.cos(a) * 3, hy + Math.sin(a) * 9, a < -1 || a > 1 ? C.blade[2] : C.blade[1]);
      g.line(bx + Math.cos(-1.3) * 3, hy - 9, bx + Math.cos(1.3) * 3, hy + 9, '#f0f0f0');
      if (atk) g.line(bx - 2, hy, bx + 8, hy, '#e8d8a8');
      break;
    }
    case 'tome':
      if (atk) { g.rect(hx - 1, hy - 4, 7, 4, ['#d8c8a0', '#f4ead0', '#fffaf0']); g.line(hx + 2, hy - 4, hx + 2, hy - 1, '#8a6a3a'); g.ell(hx + 3, hy - 7, 1.5, 1.5, U.shades('#ffd040')); }
      else { g.rect(hx - 1, hy - 3, 5, 5, C.blade); g.set(hx + 1, hy - 1, C.gem); g.rect(hx + 3, hy - 3, 1, 5, '#e8dcc0'); }
      break;
    case 'fists':
      g.ell(hx + (atk ? 4 : 0), hy, 2.6, 2.2, C.blade); g.set(hx + (atk ? 5 : 1), hy - 1, C.gem);
      g.ell(hx - 6, hy + 1, 2.2, 2, C.blade); break;
    case 'trident': {
      const a = atk ? 0 : -0.95, ca = Math.cos(a), sa = Math.sin(a);
      blade(g, hx - ca * 4, hy - sa * 4, a, 16, 1, [C.hilt, C.hilt, C.hilt], 0, C.hilt, null);
      const tx = hx + ca * 12, ty = hy + sa * 12, px = -sa, py = ca;
      [-2, 0, 2].forEach(k => blade(g, tx + px * k, ty + py * k, a, 4, 1, C.blade, 0, C.blade[1], null));
      for (let k = -2; k <= 2; k++) g.set(tx + px * k, ty + py * k, C.blade[1]);
      break;
    }
    case 'lance': {
      const a = atk ? 0.05 : -1.35;
      blade(g, hx - Math.cos(a) * 6, hy - Math.sin(a) * 6, a, 14, 1, [C.hilt, '#6a4a30', '#8a6a48'], 0, C.hilt, null);
      const tx = hx + Math.cos(a) * 9, ty = hy + Math.sin(a) * 9;
      blade(g, tx, ty, a, 6, 3, C.blade, 0, C.blade[0], '#d8b040');
      break;
    }
    case 'axe': {
      const a = atk ? 0.1 : -1.2, ca = Math.cos(a), sa = Math.sin(a);
      blade(g, hx, hy, a, 11, 1, [C.hilt, '#8a5a30', '#a8784a'], 3, C.hilt, null);
      const ax = hx + ca * 9, ay = hy + sa * 9, px = -sa, py = ca;
      g.poly([[ax, ay], [ax + px * 5 + ca * 3, ay + py * 5 + sa * 3], [ax + px * 6 - ca * 3, ay + py * 6 - sa * 3], [ax - ca * 2, ay - sa * 2]].map(p => [p[0], p[1]]), C.blade);
      break;
    }
  }
};
// Sprite de combat 48x48 pixels (personnage + arme), regard vers la gauche
SPR.battler = (cid, wid, pose) => SPR.get(`b_${cid}_${wid}_${pose}`, () => {
  const d = G.CHARS[cid];
  const g = new G.Pix(24, 24, 2);
  const h = SPR.heroPix(d.pal, 'right', pose === 'atk' ? 1 : 0, SPR.CHAR_EXTRA[cid]);
  const back = G.WEAPONS[wid].kind === 'bow' || G.WEAPONS[wid].kind === 'staff';
  if (back) SPR.drawWeapon(g, wid, pose);
  for (let y = 0; y < h.h; y++) for (let x = 0; x < h.w; x++) { const c = h.get(x, y); if (c) g._s(x + 8, y + 14, c); }
  if (!back) SPR.drawWeapon(g, wid, pose);
  g.outline('#1a1020').polish(0.02, 5);
  return g.mirror().toCanvas();
});

// ---------------- Monstres ----------------
const EYE = '#ffffff', PUP = '#14101c';
SPR.ENEMY_SIZE = { slime: 16, rabbit: 16, bird: 16, bat: 16, mushroom: 16, wisp: 16, wolf: 24, plant: 24, golem: 24, skeleton: 24, knight: 24, lizard: 24, toad: 24, ghost: 20, snake: 24, imp: 20, ent: 48, wyvern: 48, hydra: 48, dragon: 56 };
SPR.DRAW = {
  slime(g, P) {
    g.ell(8, 11, 6.5, 4.8, P); g.ell(8, 7.5, 3, 2.6, P);
    g.ell(5.5, 8.5, 1.3, 0.9, '#ffffffcc');
    g.rect(8, 9, 2, 3, EYE); g.rect(11, 9, 2, 3, EYE); g.rect(9, 10, 1, 2, PUP); g.rect(12, 10, 1, 2, PUP);
    g.set(10, 13, PUP);
  },
  rabbit(g, P) {
    g.ell(7, 11, 5, 3.8, P); g.ell(11.5, 8, 3.2, 3, P);
    g.ell(10, 3.8, 1, 2.8, P); g.ell(12.2, 4, 1, 2.6, P); g.set(10, 3, '#f0a0b0'); g.set(12, 4, '#f0a0b0');
    g.line(13, 6, 15, 3, '#f8eac0'); g.set(15, 2, '#fffbe8');
    g.set(12, 7, PUP); g.set(14, 9, '#e07080');
    g.ell(2, 10, 1.6, 1.6, '#ffffff'); g.ell(5, 14.5, 2, 1, P[0]); g.ell(10, 14.5, 2, 1, P[0]);
  },
  bird(g, P) {
    g.poly([[3, 9], [0, 12], [4, 11]], P[0]);
    g.ell(7, 9, 4.2, 3.5, P); g.ell(11, 6, 2.6, 2.6, P);
    g.poly([[13, 5.5], [16, 6.6], [13, 7.6]], '#e8b030');
    g.set(11, 5, '#ffe040');
    g.poly([[4, 7], [9, 8], [7, 12], [2, 11]], [P[0], P[0], P[1]]);
    g.line(7, 12, 7, 14, '#e8b030'); g.line(9, 12, 9, 14, '#e8b030');
  },
  bat(g, P) {
    g.poly([[6, 7], [0, 3], [1, 8], [2.5, 7.5], [3, 10], [6, 9.5]], [P[0], P[1], P[0]]);
    g.poly([[10, 7], [16, 3], [15, 8], [13.5, 7.5], [13, 10], [10, 9.5]], [P[0], P[1], P[0]]);
    g.ell(8, 8.5, 2.8, 3, P);
    g.poly([[6, 6], [6.5, 2.5], [8, 5.5]], P); g.poly([[8.5, 5.5], [9.6, 2.5], [10.2, 6]], P);
    g.set(7, 8, '#ff3030'); g.set(9, 8, '#ff3030'); g.set(7, 10, '#fff'); g.set(9, 10, '#fff');
  },
  mushroom(g, P) {
    g.rect(5, 9, 6, 6, ['#c0a888', '#e8d8b8', '#fff4dc']);
    g.ell(8, 7, 7, 4.6, P); g.rect(2, 9, 12, 1, P[0]);
    g.ell(5, 5, 1.3, 1, '#fff'); g.ell(10, 4, 1.6, 1.2, '#fff'); g.ell(12.5, 7, 1, 1, '#fff'); g.ell(4, 8, 0.9, 0.8, '#fff');
    g.set(7, 11, PUP); g.set(10, 11, PUP); g.set(8, 13, '#6a3a2a'); g.set(9, 13, '#6a3a2a');
  },
  wisp(g, P) {
    g.poly([[8, 0], [12, 6], [13.5, 11], [8, 15.5], [2.5, 11], [4, 6]], P);
    g.poly([[11, 2], [13, 5], [11, 6]], P[2]);
    g.ell(8, 10.5, 3.2, 3.6, P[2]); g.ell(8, 11, 1.6, 2, '#fff8d0');
    g.set(7, 9, '#401010'); g.set(10, 9, '#401010');
  },
  wolf(g, P) {
    g.thick([[4, 12], [1.5, 9], [0.5, 5.5]], 1.9, 1, P);
    g.rect(6, 16, 2, 6, P[0]); g.rect(14, 16, 2, 6, P[0]);
    g.ell(11, 14, 7, 4, P); g.ell(15, 12.5, 3.2, 3.8, P);
    g.ell(12, 16.5, 4, 1.3, P[2]);
    g.rect(9, 17, 2, 5, P[1]); g.rect(17, 16, 2, 6, P[1]);
    g.ell(18, 9.5, 4, 3.3, P); g.ell(21.5, 11, 2.6, 1.6, P);
    g.poly([[16, 7.5], [17, 2.5], [19, 7]], P); g.poly([[18.5, 7], [20.2, 3], [21, 7.5]], P[0]);
    g.set(23, 10, PUP); g.set(19, 9, '#ffe040'); g.line(19, 12, 22, 12, '#311');
    g.set(21, 13, '#fff');
  },
  plant(g, P) {
    const stem = U.shades('#3a7a2a');
    g.thick([[8, 23], [8.5, 18], [11, 14]], 1.6, 1.2, stem);
    g.ell(5, 20.5, 3.6, 1.5, P); g.ell(12.5, 21.5, 3.6, 1.5, P); g.ell(4, 16, 2.5, 1.2, P);
    const H = U.shades('#c83a5a');
    g.ell(15, 10, 6.5, 5.6, H);
    g.poly([[13, 10], [22.5, 5.5], [22.5, 14.5]], '#4a0a18');
    [[16, 8], [18, 7], [20, 6], [16, 12], [18, 13], [20, 14]].forEach(p => g.set(p[0], p[1], '#fff'));
    [[12, 6], [10, 9], [13, 14]].forEach(p => g.set(p[0], p[1], '#ffd0e0'));
  },
  golem(g, P, acc) {
    g.rect(6, 18, 4, 5, P); g.rect(13, 18, 4, 5, P);
    g.rect(1, 9, 4, 10, P); g.rect(4, 8, 15, 11, P); g.rect(18, 9, 5, 11, P);
    g.rect(8, 2, 8, 7, P);
    g.rect(10, 4, 2, 2, '#9ff8ff'); g.rect(13, 4, 2, 2, '#9ff8ff');
    g.line(7, 10, 10, 14, acc); g.line(10, 14, 9, 17, acc); g.line(15, 9, 14, 13, acc); g.line(19, 12, 21, 15, acc);
    g.set(5, 9, '#5a8a3a'); g.set(9, 3, '#5a8a3a'); g.set(16, 8, '#5a8a3a');
  },
  skeleton(g) {
    const B = U.shades('#e8e2d0');
    g.line(14, 12, 18, 15, B[1]); g.line(18, 15, 23, 5, '#c8d0dc'); g.line(17, 15, 22, 5, '#ffffff'); g.line(16, 14, 20, 16, '#8a6a3a');
    g.rect(12, 10, 2, 8, B); g.line(9, 11, 16, 11, B[1]); g.line(9, 13, 16, 13, B[1]); g.line(10, 15, 15, 15, B[1]);
    g.rect(10, 17, 6, 2, B); g.line(11, 19, 10, 23, B[1]); g.line(15, 19, 16, 23, B[1]);
    g.line(11, 11, 8, 16, B[1]);
    g.ell(13, 5, 4, 3.8, B); g.rect(11, 8, 5, 2, B);
    g.rect(13, 4, 2, 2, '#14101c'); g.rect(16, 4, 1, 2, '#14101c'); g.set(13, 4, '#ff3030');
  },
  knight(g, P) {
    g.poly([[6, 9], [11, 9], [9, 22], [3, 21]], U.shades('#4a1a3a'));
    g.rect(9, 18, 3, 5, P); g.rect(14, 18, 3, 5, P);
    g.rect(8, 9, 10, 10, P); g.rect(9, 12, 8, 1, '#c8a040');
    g.ell(13, 5, 4.2, 4.2, P); g.rect(13, 5, 4, 1, '#ff3030'); g.set(13, 1, '#a02020'); g.set(12, 0, '#a02020');
    g.ell(6, 14, 3, 4, U.shades('#6a6a7a')); g.set(6, 14, '#c8a040');
    blade(g, 18, 15, -1.0, 10, 2, U.shades('#b8c0cc'), 2, '#3a2a20', '#c8a040');
  },
  lizard(g, P, acc, wings) {
    if (wings) g.poly([[8, 12], [4, 1], [11, 4], [15, 2], [15, 12]], U.shades(U.mix(P[1], '#000', 0.35)));
    g.thick([[5, 15], [2, 13], [0.5, 9]], 2.5, 1, P);
    g.rect(7, 17, 2, 5, P[0]); g.rect(14, 17, 2, 5, P[0]);
    g.ell(11, 15, 7, 3.6, P); g.ell(12, 17, 5, 1.2, P[2]);
    for (let x = 6; x <= 15; x += 2) g.poly([[x, 12], [x + 1, 9.3], [x + 2, 12]], acc);
    g.ell(19, 12, 4.2, 3, P); g.poly([[21, 13], [24, 13], [21, 15]], P[0]);
    g.set(20, 11, '#ffe040'); g.set(23, 12, '#111');
    g.rect(9, 18, 2, 4, P[1]); g.rect(16, 18, 2, 4, P[1]);
  },
  toad(g, P) {
    g.ell(5, 20, 3.2, 2, P[0]); g.ell(19, 20, 3.2, 2, P[0]);
    g.ell(12, 15, 9, 6.5, P); g.ell(13, 17.5, 6, 3.5, U.shades('#e8d8a0'));
    g.ell(8, 8.6, 2.8, 2.8, P); g.ell(16, 8.6, 2.8, 2.8, P);
    g.rect(8, 8, 2, 2, PUP); g.rect(16, 8, 2, 2, PUP); g.set(8, 8, '#ffe040'); g.set(16, 8, '#ffe040');
    g.line(9, 13, 20, 13, '#203018');
    [[6, 13], [10, 11], [17, 11], [5, 16]].forEach(p => g.set(p[0], p[1], P[0]));
  },
  ghost(g, P) {
    g.ell(10, 8, 6.5, 6.5, P);
    g.poly([[3.5, 8], [16.5, 8], [16.5, 16], [14, 13.5], [12, 17], [10, 14], [8, 17.5], [6, 14], [3.5, 16.5]], P);
    g.ell(8, 8, 1.3, 2, '#1a1030'); g.ell(12.5, 8, 1.3, 2, '#1a1030'); g.ell(10.5, 12, 1.2, 1.5, '#1a1030');
    g.thick([[4, 10], [1, 12]], 1.4, 1, P); g.thick([[16, 10], [19, 8]], 1.4, 1, P);
  },
  snake(g, P) {
    g.ell(10, 19.5, 8.5, 3.5, P); g.ell(11, 15, 6, 3, P);
    g.thick([[14, 14], [16, 9], [17, 6]], 2.6, 2.2, P);
    g.ell(19.5, 5.5, 3.6, 2.5, P);
    g.set(20, 4, '#ffe040'); g.line(22, 6, 24, 7, '#e33');
    [[5, 19], [9, 18], [13, 19], [8, 15], [12, 14], [16, 10]].forEach(p => g.set(p[0], p[1], P[0]));
    g.ell(10, 21, 6, 1, P[2]);
  },
  imp(g, P) {
    g.poly([[7, 10], [1, 4], [2, 12]], U.shades('#4a1a2a')); g.poly([[13, 9], [19, 3], [18, 11]], U.shades('#4a1a2a'));
    g.thick([[7, 15], [3, 17], [1.5, 14]], 1, 0.7, P[0]); g.poly([[0, 13], [3, 13], [1.5, 11]], P[0]);
    g.rect(8, 16, 2, 3, P[0]); g.rect(11, 16, 2, 3, P[0]);
    g.ell(10, 12, 4, 4.5, P); g.ell(11, 7, 3.6, 3.2, P);
    g.poly([[8, 5], [7, 1], [9.5, 4.5]], '#2a1a1a'); g.poly([[12.5, 4.5], [14, 0.5], [14, 5]], '#2a1a1a');
    g.set(11, 7, '#ffff60'); g.set(13, 7, '#ffff60'); g.line(11, 9, 13, 9, '#3a0a0a');
  },
  ent(g, P) {
    const bark = U.shades('#6a4a2a');
    g.thick([[18, 40], [12, 46.5]], 3, 2, bark); g.thick([[24, 40], [24, 47]], 3, 2, bark); g.thick([[30, 40], [37, 46.5]], 3, 2, bark);
    g.thick([[17, 21], [8, 17], [3, 11]], 3.2, 1.5, bark); g.thick([[31, 21], [40, 16], [45, 10]], 3.2, 1.5, bark);
    g.rect(15, 14, 18, 27, bark);
    [[18, 16, 18, 38], [23, 15, 22, 39], [29, 16, 30, 38]].forEach(l => g.line(l[0], l[1], l[2], l[3], bark[0]));
    g.ell(24, 9, 18, 9.5, P); g.ell(10, 12, 8, 5.5, P); g.ell(38, 12, 8, 5.5, P); g.ell(3, 10, 4, 3, P); g.ell(45, 9, 3.5, 3, P);
    [[18, 6], [30, 9], [12, 12], [38, 13], [24, 4]].forEach(p => g.ell(p[0], p[1], 2.5, 1.6, U.shades('#9a3ac8')));
    g.ell(20, 24, 2.2, 1.6, '#ff6aff'); g.ell(28, 24, 2.2, 1.6, '#ff6aff'); g.set(20, 24, '#ffffff'); g.set(28, 24, '#ffffff');
    g.poly([[19, 30], [29, 30], [27, 34], [21, 34]], '#1a0a10');
    [[21, 30], [24, 30], [27, 30]].forEach(p => g.set(p[0], p[1], '#d8c8a0'));
  },
  wyvern(g, P) {
    const wing = U.shades(U.mix(P[1], '#a8e8ff', 0.25));
    g.poly([[20, 24], [6, 2], [13, 6], [18, 3], [24, 10], [29, 21]], wing);
    [[20, 24, 6, 2], [22, 22, 18, 3], [24, 22, 24, 10]].forEach(l => g.line(l[0], l[1], l[2], l[3], P[0]));
    g.line(10, 6, 14, 12, '#ffff80'); g.line(14, 12, 12, 15, '#ffff80');
    g.thick([[14, 30], [6, 34], [1, 39]], 3, 1, P);
    g.rect(19, 33, 3, 8, P[0]); g.rect(26, 33, 3, 8, P[0]);
    g.ell(22, 28, 9.5, 7, P); g.ell(24, 31.5, 6, 3, P[2]);
    g.thick([[28, 24], [33, 16], [36, 11]], 3.6, 2.6, P);
    g.ell(39, 10, 5, 3.6, P); g.poly([[42, 9], [48, 11.5], [42, 13.5]], P[0]);
    g.poly([[36, 7.5], [32, 1.5], [38.5, 7]], '#e8e0c0');
    g.set(40, 9, '#ffff40'); g.set(41, 9, '#ffff40');
    g.poly([[20, 21], [16, 15], [26, 18], [31, 13], [30, 22]], wing);
  },
  hydra(g, P) {
    const necks = [[[16, 34], [10, 24], [8, 15]], [[24, 32], [25, 20], [24, 9]], [[32, 34], [38, 25], [40, 16]]];
    const heads = [[8, 12], [26, 6.5], [42, 13]];
    necks.forEach((n, i) => {
      g.thick(n, 3.8, 2.6, P);
      const [hx, hy] = heads[i];
      g.ell(hx, hy, 4.8, 3.3, P); g.poly([[hx + 2, hy], [hx + 7, hy + 1.5], [hx + 2, hy + 3]], P[0]);
      g.set(hx + 1, hy - 1, '#ff3030'); g.set(hx + 2, hy - 1, '#ff3030');
      g.poly([[hx - 3, hy - 2], [hx - 6, hy - 5], [hx - 1, hy - 3]], U.shades('#7ad8c8'));
      g.set(hx + 5, hy + 2, '#fff');
    });
    g.ell(24, 39, 16, 7.5, P);
    [[14, 36], [22, 34], [30, 35], [36, 38]].forEach(p => g.poly([[p[0], p[1]], [p[0] + 2, p[1] - 4], [p[0] + 4, p[1]]], U.shades('#7ad8c8')));
    for (let x = 2; x < 46; x++) { g.set(x, 44 + Math.round(Math.sin(x * 0.7)), '#a8e0ff'); for (let y = 45; y < 48; y++) g.set(x, y + Math.round(Math.sin(x * 0.7)), y === 45 ? '#4a90c8' : '#2a6098'); }
  },
  dragon(g, P) {
    const wing = U.shades(U.mix(P[1], '#2a0a0a', 0.35));
    g.poly([[22, 28], [2, 2], [11, 8], [15, 3], [23, 12], [28, 5], [33, 26]], wing);
    [[22, 28, 2, 2], [24, 26, 15, 3], [27, 26, 28, 5]].forEach(l => g.line(l[0], l[1], l[2], l[3], P[0]));
    g.thick([[15, 38], [6, 42], [1.5, 48], [5, 53]], 4.2, 1.2, P);
    [[8, 40], [4, 45]].forEach(p => g.poly([[p[0], p[1]], [p[0] - 1, p[1] - 4], [p[0] + 2, p[1] - 1]], '#2a1a1a'));
    g.ell(20, 45, 4, 5.5, P); g.ell(34, 45, 4, 5.5, P);
    [[17, 50], [20, 51], [23, 50], [31, 50], [34, 51], [37, 50]].forEach(p => g.set(p[0], p[1], '#f0e8d0'));
    g.ell(26, 34, 12.5, 9.5, P); g.ell(29, 38, 7.5, 5, U.shades('#e8a040'));
    for (let i = 0; i < 5; i++) g.poly([[16 + i * 4, 26 - i * 0.6], [17.5 + i * 4, 21.5 - i * 0.6], [19 + i * 4, 26 - i * 0.6]], '#2a1a1a');
    g.thick([[34, 28], [40, 20], [44, 14]], 4.8, 3.6, P);
    g.ell(47, 12, 6.2, 4.6, P); g.poly([[50, 9.5], [56, 13], [50, 16.5]], P);
    g.poly([[43, 9], [38, 0.5], [46, 8]], '#2a1a1a'); g.poly([[46.5, 8], [45, 0], [49.5, 8]], '#3a2a2a');
    g.ell(48.5, 10.5, 1.2, 0.9, '#ffff60'); g.line(51, 15, 55, 14, '#ffb030'); g.set(55, 13, '#ffe080');
    g.poly([[24, 30], [17, 21], [28, 24], [34, 17], [33, 30]], wing);
  },
};
SPR.enemy = (spr, color, elem) => SPR.get(`e_${spr}_${color}`, () => {
  const s = SPR.ENEMY_SIZE[spr], g = new G.Pix(s, s, 2), P = U.shades(color);
  const acc = elem === 'feu' ? '#ffcf40' : spr === 'golem' ? '#4a443c' : U.mix(color, '#ffffff', 0.5);
  SPR.DRAW[spr](g, P, acc, spr === 'lizard' && color === '#8a1f2a');
  g.outline('#140c1c').polish(0.04, 7);
  return g.toCanvas();
});

// ---------------- Familiers (16x16) ----------------
SPR.FAM_DRAW = {
  bulle(g) {
    const B = U.shades('#9a6a42');
    g.thick([[4, 12], [1.5, 10], [0.5, 7]], 1.6, 0.9, B);
    g.ell(8, 11, 4.6, 3.5, B); g.ell(11, 7, 3.1, 2.8, B); g.ell(12.3, 8.2, 1.8, 1.3, '#f0d8b8');
    g.set(11, 6, PUP); g.set(13, 6, PUP); g.set(14, 8, '#3a2018');
    g.ell(6, 14.5, 1.6, 1, B[0]); g.ell(10, 14.5, 1.6, 1, B[0]);
    g.ell(13.5, 2.5, 1.7, 1.7, U.shades('#7fd0ff')); g.set(13, 2, '#fff');
  },
  pyron(g) {
    const B = U.shades('#ff7a2a');
    g.thick([[5, 11], [2, 9], [1, 6]], 1.8, 1, B); g.ell(1, 4.5, 1.4, 2, U.shades('#ffd040'));
    g.ell(8, 11, 4.2, 2.8, B); g.ell(12, 9, 2.8, 2.4, B);
    g.set(12, 8, PUP); g.set(14, 10, '#7a2010');
    g.rect(6, 13, 1, 2, B[0]); g.rect(10, 13, 1, 2, B[0]);
    [[6, 8.5], [8, 8], [10, 8.3]].forEach(p => g.set(p[0], p[1], '#ffd040'));
  },
  zephy(g) {
    const B = U.shades('#e8f0e0'), W = U.shades('#4aa86a');
    g.poly([[4, 10], [0, 13], [4, 12.5]], W[0]);
    g.ell(8, 10, 4, 3.6, B); g.ell(11, 6.5, 2.6, 2.5, B);
    g.poly([[13, 6], [15.5, 7], [13, 8]], '#e8b030'); g.set(11, 5, PUP);
    g.poly([[4, 8], [9, 9], [7, 13], [2, 12]], W); g.poly([[9, 3], [11, 4], [10, 5]], W[1]);
    g.line(7, 13, 7, 15, '#e8b030'); g.line(9, 13, 9, 15, '#e8b030');
  },
  mousse(g) {
    const S = U.shades('#5a8a3a'), K = U.shades('#a8c878');
    g.ell(3.5, 13, 1.5, 1.2, K); g.ell(12.5, 13, 1.5, 1.2, K); g.ell(4.5, 9, 1.4, 1, K);
    g.ell(13.5, 10, 2.4, 2.1, K); g.set(14, 9, PUP);
    g.ell(8, 10, 5.6, 4.2, S);
    [[6, 8], [9, 7], [11, 9], [7, 11], [10, 12]].forEach(p => g.set(p[0], p[1], S[0]));
    g.ell(7, 6.5, 1.6, 1, U.shades('#8ad860')); g.set(10, 6, '#ffd0f0');
  },
  lumi(g) {
    const B = U.shades('#ffe0a0'), T = U.shades('#fff8e8');
    g.thick([[5, 11], [2, 9], [1, 5]], 2.2, 1.4, B); g.ell(1.5, 4.5, 1.4, 1.6, T);
    g.ell(8, 11, 4.2, 3, B); g.ell(11.5, 7, 3, 2.6, B); g.ell(13.4, 8.2, 1.6, 1, T);
    g.poly([[9.5, 5], [10, 1], [11.5, 4.5]], B[1]); g.poly([[12, 4.5], [14, 1], [14, 5.5]], B[1]);
    g.set(12, 7, '#4a3aa8'); g.set(14.5, 8, '#3a2a2a');
    g.rect(6, 13, 1, 2, B[0]); g.rect(10, 13, 1, 2, B[0]);
    [[3, 2], [7, 7], [15, 3]].forEach(p => g.set(p[0], p[1], '#ffffff'));
  },
  noctis(g) {
    const B = U.shades('#2a2440');
    g.thick([[4, 12], [1, 10], [1.5, 6], [3, 5]], 1.1, 0.9, B);
    g.ell(7, 11, 4.4, 3.1, B); g.ell(11.5, 7, 3.1, 2.8, B);
    g.poly([[9, 5], [9.5, 1.5], [11, 4.5]], B[1]); g.poly([[12, 4.5], [13.5, 1.5], [14, 5.5]], B[1]);
    g.set(11, 7, '#c86aff'); g.set(13, 7, '#c86aff'); g.set(12, 8.5, '#ff9ad8');
    g.rect(5, 13, 1, 2, B[0]); g.rect(9, 13, 1, 2, B[0]);
  },
};
SPR.fam = id => SPR.get('f_' + id, () => { const g = new G.Pix(16, 16, 2); SPR.FAM_DRAW[id](g); g.outline('#140c1c').polish(0.03, 9); return g.toCanvas(); });

// ---------------- Portraits (data URL pour l'interface) ----------------
SPR.url = (key, canvasFn, scale = 4) => SPR.get('url_' + key + '_' + scale, () => {
  const src = canvasFn(), c = U.canvas(src.width * scale, src.height * scale), x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL();
});
SPR.charURL = cid => SPR.url('char_' + cid, () => SPR.hero(cid, G.CHARS[cid].pal, 'down', 0, SPR.CHAR_EXTRA[cid]));
SPR.famURL = fid => SPR.url('fam_' + fid, () => SPR.fam(fid));
SPR.enemyURL = eid => { const e = G.ENEMIES[eid]; return SPR.url('en_' + eid, () => SPR.enemy(e.spr, e.pal, e.e), SPR.ENEMY_SIZE[e.spr] > 24 ? 1 : 2); };
SPR.battlerURL = (cid, wid) => SPR.url('bt_' + cid + wid, () => SPR.battler(cid, wid, 'idle'), 3);

// ---------------- Tuiles 32x32 pixels (16x16 unités) ----------------
const TS = 32;
// bruit de valeur périodique (raccord parfait entre tuiles)
const tn = (x, y, cell, seed) => {
  const p = TS / cell, gx = x / cell, gy = y / cell, xi = Math.floor(gx), yi = Math.floor(gy), xf = gx - xi, yf = gy - yi;
  const H = (a, b) => U.hash(((a % p) + p) % p, ((b % p) + p) % p, seed);
  const sm = t => t * t * (3 - 2 * t), u = sm(xf), v = sm(yf);
  const a = H(xi, yi), b = H(xi + 1, yi), c = H(xi, yi + 1), d = H(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const tfbm = (x, y, seed) => tn(x, y, 8, seed) * 0.55 + tn(x, y, 4, seed + 3) * 0.3 + tn(x, y, 2, seed + 7) * 0.15;
// petit peintre de pixels
function Painter() {
  const c = U.canvas(TS, TS), x = c.getContext('2d'), img = x.createImageData(TS, TS), D = img.data;
  const P = {
    c, set(px, py, col, a = 1) {
      px = Math.floor(px); py = Math.floor(py);
      if (px < 0 || py < 0 || px >= TS || py >= TS) return;
      const i = (py * TS + px) * 4, rgb = typeof col === 'string' ? U.hex2rgb(col) : col;
      D[i] = D[i] * (1 - a) + rgb[0] * a; D[i + 1] = D[i + 1] * (1 - a) + rgb[1] * a; D[i + 2] = D[i + 2] * (1 - a) + rgb[2] * a; D[i + 3] = 255;
    },
    // set avec raccord (enroule les bords)
    wset(px, py, col, a) { P.set(((Math.floor(px) % TS) + TS) % TS, ((Math.floor(py) % TS) + TS) % TS, col, a); },
    get(px, py) { const i = (py * TS + px) * 4; return [D[i], D[i + 1], D[i + 2]]; },
    fill(fn) { for (let py = 0; py < TS; py++) for (let px = 0; px < TS; px++) P.set(px, py, fn(px, py)); },
    done() { x.putImageData(img, 0, 0); c._d = 2; return c; },
  };
  return P;
}
const ramp = (cols, t) => { t = U.clamp(t, 0, 0.999); const n = cols.length - 1, i = Math.floor(t * n), f = t * n - i; return U.hex2rgb(U.mix(cols[i], cols[i + 1], f)); };
const rampQ = (cols, t) => U.hex2rgb(cols[Math.min(cols.length - 1, Math.floor(U.clamp(t, 0, 0.999) * cols.length))]);
const GRASS = {
  '.': ['#3f7d2c', '#4f9334', '#5ea63c', '#72ba48', '#8ccc58'],
  ',': ['#3f7d2c', '#4f9334', '#5ea63c', '#72ba48', '#8ccc58'],
  'g': ['#4a8a32', '#5a9e3a', '#68b044', '#7cc252', '#96d464'],
  'f': ['#25502a', '#2e6030', '#3a7238', '#4a8440', '#5c964a'],
};
// brins d'herbe
function blades(P, v, pal, n, seed) {
  for (let k = 0; k < n; k++) {
    const bx = U.hash(k, v, seed) * TS, by = U.hash(v, k, seed + 1) * TS, h = 3 + Math.floor(U.hash(k, k + v, seed + 2) * 4), lean = U.hash(k, 3, seed + 3) < 0.5 ? -1 : 1;
    for (let i = 0; i < h; i++) { const t = i / h; P.wset(bx + (i > h / 2 ? lean * 0.6 : 0) * (i - h / 2) / 2, by - i, ramp([pal[1], pal[3], pal[4]], t), 0.9); }
    P.wset(bx, by + 1, pal[0], 0.5);
  }
}
const TILE_PAINT = {
  grass(P, v, ch) {
    const pal = GRASS[ch];
    P.fill((x, y) => { const n = tfbm(x, y, 11 + (ch === 'f' ? 5 : 0)) + (U.hash(x, y, v + 40) - 0.5) * 0.12; return rampQ(pal.slice(0, 4), n * 1.05); });
    blades(P, v, pal, ch === 'f' ? 10 : 16, 20);
    if (ch === ',') {
      const cols = [['#ffffff', '#fff2a0'], ['#ffe060', '#ff9a30'], ['#ff8ab0', '#ffe0ec'], ['#a0c8ff', '#ffffff'], ['#d08aff', '#fff0ff']];
      for (let k = 0; k < 3; k++) {
        const fx = 4 + U.hash(k, v, 5) * 24, fy = 4 + U.hash(v, k, 5) * 24, [pc, cc] = cols[(k + v) % cols.length];
        P.wset(fx, fy + 3, '#3a6a2a', 0.7); P.wset(fx, fy + 2, '#3a6a2a', 0.8);
        [[0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]].forEach(([dx, dy], i) => P.wset(fx + dx, fy + dy, pc, i < 4 ? 1 : 0.5));
        P.wset(fx, fy, cc);
      }
    }
    if (ch === 'f') {
      for (let k = 0; k < 7; k++) { const lx = U.hash(k, v, 31) * TS, ly = U.hash(v, k, 31) * TS, c = U.pick ? ['#8a6a2a', '#a8742a', '#6a5020', '#c08a3a'][k % 4] : '#8a6a2a'; P.wset(lx, ly, c); P.wset(lx + 1, ly, c, 0.8); P.wset(lx + 1, ly + 1, '#3a2a10', 0.4); }
      if (v % 3 === 0) for (let k = 0; k < 6; k++) P.wset(8 + k, 20 + (k % 2), '#5a4020', 0.8);
    }
    if (ch === 'g' && v % 4 === 0) for (let k = 0; k < 4; k++) P.wset(6 + k * 6, 10 + k * 3, '#ffffff', 0.8);
  },
  path(P, v) {
    const pal = ['#9a7a4a', '#b08e58', '#c4a266', '#d4b478', '#e2c690'];
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 13) * 0.9 + 0.08 + (U.hash(x, y, v + 50) - 0.5) * 0.15));
    for (let k = 0; k < 7; k++) {
      const px = U.hash(k, v, 61) * TS, py = U.hash(v, k, 61) * TS, sz = U.hash(k, 9, 62) < 0.3 ? 2 : 1;
      for (let j = 0; j <= sz; j++) for (let i = 0; i <= sz; i++) P.wset(px + i, py + j, i + j === 0 ? '#ece0c0' : i + j >= sz * 2 ? '#6a5434' : '#a89474');
      P.wset(px + sz + 1, py + sz + 1, '#5a4428', 0.4);
    }
    if (v % 2 === 0) { let cx = U.hash(v, 1, 70) * TS, cy = 4 + U.hash(v, 2, 70) * 24; for (let i = 0; i < 7; i++) { P.wset(cx, cy, '#7a5e36', 0.7); cx += 1; cy += U.hash(i, v, 71) < 0.5 ? 1 : -1; } }
  },
  rock(P, v) {
    const pal = ['#5c554a', '#6a6256', '#786f62', '#867d6e', '#958b7c'];
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 17) + (U.hash(x, y, v + 60) - 0.5) * 0.18));
    for (let c = 0; c < 1; c++) { let cx = U.hash(c, v, 80) * TS, cy = U.hash(v, c, 80) * TS; for (let i = 0; i < 8; i++) { P.wset(cx, cy, '#4e483f', 0.85); P.wset(cx + 1, cy, '#c8c0b0', 0.3); cx += U.hash(i, c + v, 81) < 0.5 ? 1 : 0; cy += U.hash(i + 1, c + v, 82) < 0.6 ? 1 : 0; } }
    for (let k = 0; k < 4; k++) { const px = U.hash(k, v, 90) * TS, py = U.hash(v, k, 90) * TS; P.wset(px, py, '#c8c0b2'); P.wset(px + 1, py, '#a8a092'); P.wset(px, py + 1, '#6a645a'); P.wset(px + 1, py + 1, '#5a544a'); }
    if (v % 3 === 1) for (let k = 0; k < 5; k++) P.wset(U.hash(k, v, 95) * TS, U.hash(v, k, 95) * TS, '#8aa860', 0.8);
  },
  mud(P, v) {
    const pal = ['#323a24', '#3e4a2c', '#4a5634', '#56623c', '#647046'];
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 23) + (U.hash(x, y, v + 70) - 0.5) * 0.14));
    if (v === 4) { const cx = 10 + U.hash(v, 3, 3) * 12, cy = 10 + U.hash(v, 4, 3) * 12; for (let y = -5; y <= 5; y++) for (let x = -9; x <= 9; x++) { const r = (x * x) / 81 + (y * y) / 25; if (r < 1) P.wset(cx + x, cy + y, r > 0.75 ? '#2a3a32' : U.mix('#2e4a44', '#3a5a52', (y + 5) / 10)); } for (let x = -5; x < 4; x++) P.wset(cx + x, cy - 3, '#6a8a80', 0.7); }
    for (let k = 0; k < 2; k++) { const rx = U.hash(k, v, 6) * TS, ry = U.hash(v, k, 6) * TS; for (let i = 0; i < 4; i++) P.wset(rx + (k % 2 ? i * 0.3 : -i * 0.3), ry - i, i > 2 ? '#a8a060' : '#5a6a34'); }
  },
  volc(P, v, f = 0) {
    const pal = ['#1e1514', '#2a1e1c', '#3a2a28', '#4a3632', '#5a4440'];
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 29) + (U.hash(x, y, v + 80) - 0.5) * 0.15));
    for (let c = 0; c < (v % 2 ? 1 : 0); c++) {
      let cx = U.hash(c, v, 100) * TS, cy = U.hash(v, c, 100) * TS;
      for (let i = 0; i < 20; i++) {
        P.wset(cx - 1, cy, '#7a2010', 0.5); P.wset(cx + 1, cy, '#7a2010', 0.5);
        P.wset(cx, cy, i % 3 === 0 ? '#ffd060' : '#ff7a1a');
        cx += U.hash(i, c + v, 101) < 0.5 ? 1 : -1; cy += U.hash(i, v, 102) < 0.7 ? 1 : 0;
      }
    }
  },
  sand(P, v) {
    const pal = ['#c8b07a', '#d6c088', '#e2cd96', '#ecd9a6', '#f6e8bc'];
    P.fill((x, y) => { const rip = Math.sin((y + Math.sin(x * 0.4) * 1.5) * 0.9) > 0.85 ? -0.18 : 0; return rampQ(pal, tfbm(x, y, 37) * 0.8 + 0.2 + rip + (U.hash(x, y, v + 90) - 0.5) * 0.1); });
    if (v % 3 === 0) { const sx = 8 + v * 2, sy = 18; P.set(sx, sy, '#ffffff'); P.set(sx + 1, sy, '#ffd0c0'); P.set(sx, sy + 1, '#e0a090'); }
  },
  paved(P, v) {
    const mortar = '#6a6258';
    P.fill(() => U.hex2rgb(mortar));
    for (let row = 0; row < 4; row++) {
      const y0 = row * 8, off = (row % 2) * 6 + (v % 3) * 2;
      let x0 = -off;
      while (x0 < TS) {
        const w = 9 + Math.floor(U.hash(x0, row, v + 7) * 6), base = U.mix('#9a9284', '#b8b0a2', U.hash(x0, row, v + 8));
        for (let y = 1; y < 7; y++) for (let x = 1; x < w - 1; x++) {
          let c = base;
          if (y === 1 || x === 1) c = U.mix(base, '#ece6da', 0.45);
          else if (y === 6 || x === w - 2) c = U.mix(base, '#3a342c', 0.4);
          else if (U.hash(x0 + x, y0 + y, 3) < 0.12) c = U.mix(base, '#7a7266', 0.4);
          P.wset(x0 + x, y0 + y, c);
        }
        x0 += w;
      }
    }
    if (v % 3 === 2) for (let k = 0; k < 3; k++) P.wset(5 + k * 9, 7 + (k % 2) * 8, '#5a8a3a', 0.9);
  },
};
const TILE_KIND = { '.': 'grass', ',': 'grass', 'g': 'grass', 'f': 'grass', '_': 'path', 'r': 'rock', 'm': 'mud', 'v': 'volc', 's': 'sand', 'p': 'paved' };
SPR.tile = (ch, v) => SPR.get(`t_${ch}_${v}`, () => {
  const P = Painter(), k = TILE_KIND[ch] || 'grass';
  TILE_PAINT[k](P, v, ch);
  return P.done();
});
// Tuiles animées : eau, lave, eau de marais (8 images)
SPR.animTile = (ch, v, f) => SPR.get(`a_${ch}_${v}_${f}`, () => {
  const P = Painter(), t = f / 8 * Math.PI * 2;
  if (ch === '~') {
    P.fill((x, y) => { const n = tfbm(x + f * 4, y + f * 2, 41) * 0.65 + tfbm(x - f * 4, y + f * 4, 43) * 0.35; return ramp(['#1d4a8e', '#2a64b4', '#3474c4', '#4286d0'], 0.15 + n * 0.75); });
    for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
      const w = tn(x + f * 4, y * 2 + f * 4, 8, 47 + v % 2);
      if (w > 0.8) P.set(x, y, '#bfe0ff', 0.8); else if (w > 0.72) P.set(x, y, '#7ab4ec', 0.6);
    }
    if ((f + v) % 3 === 0) { const sx = (v * 7 + f * 3) % TS, sy = (v * 11) % TS; P.wset(sx, sy, '#ffffff'); P.wset(sx + 1, sy, '#cfe8ff', 0.6); P.wset(sx - 1, sy, '#cfe8ff', 0.6); }
  } else if (ch === 'l') {
    P.fill((x, y) => { const n = tfbm(x + f * 2, y - f * 3, 51) * 0.75 + tfbm(x - f, y + f, 53) * 0.25; return ramp(['#6a1408', '#b8300e', '#e8501a', '#ff8a2a', '#ffd060', '#fff4b0'], U.clamp((n - 0.2) * 1.5, 0, 1)); });
  } else if (ch === 'w') {
    P.fill((x, y) => ramp(['#26443c', '#30544a', '#3a5e54', '#46685c'], tfbm(x + f * 4, y, 61)));
    for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const w = tn(x + f * 4, y * 2, 4, 63); if (w > 0.86) P.set(x, y, '#7a9a88', 0.5); }
    if (v % 3 === 0) {
      const cx = 10, cy = 10;
      for (let y = -4; y <= 4; y++) for (let x = -5; x <= 5; x++) { const r = x * x / 25 + y * y / 16; if (r < 1 && !(x > 0 && Math.abs(y) < 1)) P.set(cx + x, cy + y, r > 0.7 ? '#2e6a2a' : y < 0 ? '#5aa04a' : '#4a8a3a'); }
      P.set(cx - 1, cy - 1, '#ffb0d8'); P.set(cx, cy - 1, '#ff8ac8'); P.set(cx - 1, cy - 2, '#ffd0ea'); P.set(cx, cy, '#ffe080');
    }
  }
  return P.done();
});
SPR.bridge = () => SPR.get('bridge', () => {
  const P = Painter();
  P.fill((x, y) => { if (y < 3 || y > 28) return U.hex2rgb(y === 0 || y === 31 ? '#2a1a0c' : '#4a2e16'); const plank = Math.floor(x / 6), edge = x % 6 === 0; if (edge) return U.hex2rgb('#3a2412'); const base = U.mix('#7a4e2a', '#9a6838', U.hash(plank, 0, 3)); return U.hex2rgb(U.mix(base, '#5a3a1e', Math.sin(y * 0.8 + plank * 2) > 0.85 ? 0.5 : 0)); });
  for (let p = 0; p < 6; p++) { P.set(p * 6 + 2, 5, '#c8c0b0'); P.set(p * 6 + 2, 26, '#c8c0b0'); }
  for (let x = 0; x < TS; x++) { P.set(x, 3, '#a8784a', 0.8); P.set(x, 29, '#1a1008', 0.6); }
  return P.done();
});
// bordure douce d'un sol sur son voisin (transition)
const TILE_PRIO = { '~': 0, 'l': 0, 'w': 1, 's': 2, '_': 3, 'p': 4, 'm': 5, 'v': 5, 'r': 6, '.': 7, ',': 7, 'g': 7, 'f': 8 };
SPR.prio = ch => TILE_PRIO[ch] ?? -1;
// side : 0 haut, 1 droite, 2 bas, 3 gauche (côté d'où vient le voisin)
SPR.fringe = (ch, side, v) => SPR.get(`fr_${ch}_${side}_${v}`, () => {
  const src = SPR.tile(ch, v), c = U.canvas(TS, TS), x = c.getContext('2d');
  x.drawImage(src, 0, 0);
  const img = x.getImageData(0, 0, TS, TS), D = img.data, grassy = TILE_KIND[ch] === 'grass';
  for (let py = 0; py < TS; py++) for (let px = 0; px < TS; px++) {
    const along = side === 0 || side === 2 ? px : py, depth = side === 0 ? py : side === 2 ? TS - 1 - py : side === 1 ? TS - 1 - px : px;
    const lim = 2.5 + tn(along, side * 7, 4, 200 + v) * 4 + (grassy && U.hash(along, side, v + 300) < 0.3 ? 3 : 0);
    const i = (py * TS + px) * 4;
    if (depth > lim) D[i + 3] = 0;
    else if (depth > lim - 1) { D[i] *= 0.7; D[i + 1] *= 0.7; D[i + 2] *= 0.7; }
  }
  x.putImageData(img, 0, 0); c._d = 2;
  return c;
});
// Falaises : face supérieure et paroi
SPR.cliffTop = (volc, v, snow) => SPR.get(`ct_${volc ? 1 : 0}_${v}_${snow ? 1 : 0}`, () => {
  const P = Painter(), pal = volc ? ['#241c1a', '#342826', '#463632', '#5a4642', '#6e5650'] : ['#6e7076', '#868890', '#9ea0a4', '#b6b7b6', '#d0d0ca'];
  P.fill((x, y) => rampQ(pal, tfbm(x, y, volc ? 111 : 113) * 0.9 + 0.05 + (U.hash(x, y, v + 120) - 0.5) * 0.16));
  for (let c = 0; c < 3; c++) { let cx = U.hash(c, v, 130) * TS, cy = U.hash(v, c, 130) * TS; for (let i = 0; i < 8; i++) { P.wset(cx, cy, pal[0]); P.wset(cx + 1, cy + 1, pal[4], 0.4); cx += U.hash(i, c, 131) < 0.5 ? 1 : -1; cy += 1; } }
  for (let k = 0; k < 3; k++) {
    const rx = 3 + U.hash(k, v, 145) * 26, ry = 3 + U.hash(v, k, 145) * 26, rr = 1.5 + U.hash(k, k, 146) * 1.5;
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const d = (x * x + y * y) / (rr * rr); if (d < 1) P.wset(rx + x, ry + y, x + y < -1 ? pal[4] : x + y > 1 ? pal[0] : pal[2]); }
  }
  if (!volc && v % 2 === 0) for (let k = 0; k < 8; k++) { const mx = U.hash(k, v, 140) * TS, my = U.hash(v, k, 140) * TS; P.wset(mx, my, '#6a8a42', 0.9); P.wset(mx + 1, my, '#8aaa5a', 0.7); }
  if (volc && v % 3 === 0) for (let k = 0; k < 5; k++) P.wset(U.hash(k, v, 141) * TS, U.hash(v, k, 141) * TS, '#ff6a2a', 0.8);
  if (snow) for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const n = tfbm(x, y, 150 + v); if (n > 0.48) P.set(x, y, n > 0.62 ? '#ffffff' : n > 0.54 ? '#eef4ff' : '#c8d4e8'); }
  return P.done();
});
SPR.cliffFront = (volc, v) => SPR.get(`cf_${volc ? 1 : 0}_${v}`, () => {
  const c = U.canvas(TS, 16), x = c.getContext('2d'), img = x.createImageData(TS, 16), D = img.data;
  const pal = volc ? ['#120c0c', '#1e1614', '#2a1e1c', '#382826'] : ['#3a3530', '#4a453e', '#5a554c', '#6a645a'];
  for (let y = 0; y < 16; y++) for (let px = 0; px < TS; px++) {
    const strata = Math.sin(y * 1.1 + tn(px, 0, 8, 160 + v) * 4) * 0.5 + 0.5, crack = tn(px, y * 3, 4, 170 + v) > 0.78;
    let t = 1 - y / 18 + (strata - 0.5) * 0.35 + (U.hash(px, y, v + 180) - 0.5) * 0.12;
    if (crack) t -= 0.35;
    let col = U.hex2rgb(pal[Math.max(0, Math.min(3, Math.floor(t * 4)))]);
    if (y === 0) col = U.hex2rgb(volc ? '#5c4844' : '#b5ae9f');
    if (y === 1) col = U.hex2rgb(volc ? '#4a3a36' : '#8f877a');
    if (volc && crack && U.hash(px, y, 3) < 0.3) col = [255, 106, 42];
    const i = (y * TS + px) * 4; D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
  }
  x.putImageData(img, 0, 0); c._d = 2;
  return c;
});

// ---------------- Objets du décor (arbres, rochers, noeuds…) ----------------
// feuillage en touffes : donne du volume aux houppiers
function foliage(g, cx, cy, rx, ry, base, seed, n) {
  const L = U.shades(base), Ld = U.shades(U.mix(base, '#0a1a08', 0.3)), Ll = U.shades(U.mix(base, '#e8ff9a', 0.25));
  g.ell(cx, cy, rx, ry, Ld);
  for (let i = 0; i < n; i++) {
    const a = U.hash(i, seed, 1) * Math.PI * 2, r = Math.sqrt(U.hash(seed, i, 2)) * 0.8;
    const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, s = 1.6 + U.hash(i, i + seed, 3) * 1.8;
    const up = (y - cy) / ry + (x - cx) / rx * 0.5;
    g.ell(x, y, s, s * 0.85, up < -0.3 ? Ll : up > 0.4 ? Ld : L);
  }
}
SPR.tree = kind => SPR.get('tree_' + kind, () => {
  const g = new G.Pix(20, 30, 2);
  const trunk = U.shades(kind === 'swamp' ? '#5a5048' : kind === 'volcano' ? '#2a1e1a' : '#6a4626');
  if (kind === 'swamp' || kind === 'volcano') {
    g.thick([[10.5, 28], [10.2, 18], [10.5, 12]], 1.8, 1.2, trunk);
    g.thick([[10, 17], [6, 12], [3.5, 6]], 1.1, 0.5, trunk); g.thick([[11, 15], [15, 10], [17, 4]], 1.1, 0.5, trunk); g.thick([[10.5, 12], [10, 3.5]], 1, 0.5, trunk);
    g.thick([[6, 12], [4, 13.5]], 0.6, 0.4, trunk); g.thick([[15, 10], [17.5, 11]], 0.6, 0.4, trunk);
    for (let y = 14; y < 28; y += 2.5) g.hline(9.6, y, 10.4, y + 1.5, trunk[0]);
    if (kind === 'swamp') { g.ell(5, 12.5, 1.4, 2.6, U.shades('#6a8a4a')); g.ell(15.5, 10.5, 1.2, 2.4, U.shades('#6a8a4a')); g.ell(11, 7, 1, 2, U.shades('#7a9a5a')); }
    else { [[4, 6], [16.5, 4.5], [10, 4]].forEach(([x, y]) => { g.dot(x, y, '#ffb040'); g.dot(x + 0.5, y, '#ff6a20'); }); }
    g.ell(10.5, 28.3, 3, 1, trunk[0]);
  } else {
    g.poly([[8.2, 29], [8.8, 17], [11.2, 17], [11.8, 29]], trunk);
    g.poly([[7, 29.5], [8.6, 27], [9, 29.5]], trunk[0]); g.poly([[13, 29.5], [11.4, 27], [11, 29.5]], trunk[0]);
    for (let y = 19; y < 28; y += 2) g.hline(9.6 + (y % 4 ? 0.5 : 0), y, 9.8 + (y % 4 ? 0.5 : 0), y + 1.2, trunk[0]);
    if (kind === 'forest') {
      foliage(g, 10, 18, 9, 5, '#2f6a2a', 1, 14); foliage(g, 10, 12, 7.6, 5, '#326e2c', 2, 12); foliage(g, 10, 6.5, 5.4, 4.6, '#367430', 3, 10); foliage(g, 10, 2.6, 2.6, 2.4, '#3a7a34', 4, 4);
    } else {
      foliage(g, 10, 13, 9.2, 8.2, '#4a9a34', kind === 'fruit' ? 5 : 6, 26); foliage(g, 5.5, 16, 3.6, 3, '#4a9a34', 7, 5); foliage(g, 14.5, 16, 3.6, 3, '#4a9a34', 8, 5);
      if (kind === 'fruit') [[7, 13], [13, 9], [10, 16], [5, 10], [15, 14]].forEach(([x, y]) => { g.ell(x, y, 0.9, 0.9, U.shades('#e8303a')); g.dot(x - 0.3, y - 0.4, '#ffd0d0'); });
    }
  }
  g.outline('#10180c').polish(0.03, 11);
  return g.toCanvas();
});
SPR.node = (type, depleted) => SPR.get(`n_${type}_${depleted ? 1 : 0}`, () => {
  const g = new G.Pix(20, 24, 2);
  const rock = U.shades('#8a8478'), rockD = U.shades('#6a645a');
  if (depleted) {
    if (type === 'arbre' || type === 'vieil_arbre') { g.ell(10, 20.5, 3, 1.6, U.shades('#6a4626')); g.ell(10, 20, 2.2, 0.9, U.shades('#d8b888')); g.hline(9, 20, 11, 20, '#a8805a'); }
    else if (type === 'herbe' || type === 'fibre') { [8, 9.5, 11, 12].forEach((x, i) => g.line(x, 22, x + (i % 2 ? 0.5 : -0.5), 19.5 + (i % 2), '#4a7a30', 0.5)); }
    else { g.ell(8, 20.5, 2.2, 1.4, rockD); g.ell(12, 21.2, 1.7, 1.1, rock); g.ell(10.5, 22, 1, 0.7, rock); }
    g.outline('#10180c').polish(0.03, 13); return g.toCanvas();
  }
  const boulder = (cols) => { g.ell(10, 18.4, 7.2, 5, cols); g.ell(6.6, 15.8, 3.8, 3.2, cols); g.ell(13, 15.4, 3, 2.6, cols); g.hline(9, 14.5, 10.5, 18, U.mix(cols[0], '#000', 0.2)); g.hline(13, 19, 15, 21, U.mix(cols[0], '#000', 0.2)); };
  switch (type) {
    case 'arbre': {
      const T = U.shades('#7a5230');
      g.poly([[9, 23], [9.4, 15], [11, 15], [11.4, 23]], T);
      foliage(g, 10, 10, 6.6, 6, '#5aaa3a', 21, 14);
      [[7, 8], [12.5, 7], [10, 12], [13.5, 11]].forEach(([x, y]) => { g.ell(x, y, 0.85, 0.85, U.shades('#e8303a')); g.dot(x - 0.3, y - 0.3, '#ffd0d0'); });
      break;
    }
    case 'vieil_arbre': {
      const T = U.shades('#5a3a2a');
      g.poly([[6.5, 23], [8, 12], [12, 12], [13.5, 23]], T); g.hline(9, 14, 8.6, 22, T[0]); g.hline(11, 14, 11.4, 22, T[0]);
      foliage(g, 10, 9, 9, 7.6, '#2a7a5a', 22, 22);
      [[5, 8], [14, 6], [10, 12], [8, 4], [12.5, 10]].forEach(([x, y]) => { g.dot(x, y, '#c8fff0'); g.dot(x + 0.5, y, '#7affd8'); });
      break;
    }
    case 'rocher': boulder(rock); break;
    case 'fer': boulder(rock); [[7, 16], [11, 17], [13, 19.5], [8, 19.5], [12.5, 15]].forEach(([x, y]) => { g.ell(x, y, 0.9, 0.7, U.shades('#d8823a')); g.dot(x - 0.3, y - 0.3, '#ffd0a0'); }); break;
    case 'cristal': {
      const C = U.shades('#5ae8ff');
      g.ell(10, 20.5, 6.5, 2.6, rockD);
      g.poly([[6.5, 21], [7.6, 9], [10, 21]], C); g.poly([[9, 21], [11, 4.5], [13.6, 21]], C); g.poly([[12.4, 21], [15.2, 12], [16.2, 21]], C);
      g.hline(11, 5, 11.3, 20, '#e8ffff'); g.hline(7.6, 9.5, 7.8, 20, '#c8faff');
      break;
    }
    case 'mithril': {
      const C = U.shades('#c8d8ff');
      boulder(U.shades('#3a3040'));
      [[6, 16], [10, 15], [13, 18], [8, 19], [11.5, 20.5], [14, 15.5]].forEach(([x, y]) => { g.ell(x, y, 0.9, 0.9, C); g.dot(x - 0.3, y - 0.3, '#ffffff'); });
      break;
    }
    case 'herbe': {
      foliage(g, 10, 18, 6.2, 4.6, '#3a9a3a', 23, 12);
      [[7, 16], [11, 15], [13, 18], [9, 19], [12, 20]].forEach(([x, y]) => { g.dot(x, y, '#ffffff'); g.dot(x + 0.5, y, '#fff6a0'); g.dot(x, y + 0.5, '#ffffff'); });
      break;
    }
    case 'fibre': { for (let i = 0; i < 11; i++) { const x0 = 4.5 + i * 1.1; g.line(x0, 22.5, x0 + (i % 2 ? 1.2 : -1), 9 + (i % 4) * 1.6, i % 3 ? '#e8c860' : '#b8902a', 0.5); g.ell(x0 + (i % 2 ? 1.2 : -1), 9 + (i % 4) * 1.6, 0.6, 1.2, U.shades('#f0d878')); } break; }
  }
  g.outline('#10180c').polish(0.03, 15);
  return g.toCanvas();
});
SPR.chest = open => SPR.get('chest' + (open ? 1 : 0), () => {
  const g = new G.Pix(16, 16, 2), W = U.shades('#8a5a2a'), Gd = U.shades('#e8b840');
  if (open) { g.rect(2, 3.5, 12, 4.5, ['#3a2410', '#5a3a1e', '#7a5230']); g.ell(8, 8, 4, 1.2, U.shades('#ffd860')); }
  else g.poly([[2, 9], [2, 6.5], [4, 4.6], [12, 4.6], [14, 6.5], [14, 9]], W);
  g.rect(2, 8.5, 12, 6.5, W);
  for (let x = 4.5; x < 13; x += 2.5) g.hline(x, 9.5, x, 14.5, W[0]);
  g.rect(2, 8.3, 12, 0.9, Gd); g.rect(2, 5, 1, 10, Gd); g.rect(13, 5, 1, 10, Gd);
  g.rect(7, 7.6, 2, 2.8, Gd); g.dot(7.8, 8.8, '#3a2410');
  g.outline('#140c1c').polish(0.02, 17); return g.toCanvas();
});
SPR.sign = () => SPR.get('sign', () => {
  const g = new G.Pix(16, 16, 2), W = U.shades('#9a6a3a');
  g.rect(7, 9, 2, 7, W); g.rect(2, 3, 12, 7, W);
  [4.5, 6.5].forEach(y => g.hline(4, y, 11, y, '#5a3a1e')); g.hline(4, 8, 9, 8, '#5a3a1e');
  g.hline(2.5, 3.5, 13.5, 3.5, '#c8945a'); g.dot(3, 4, '#3a2412'); g.dot(12.6, 4, '#3a2412');
  g.outline('#140c1c').polish(0.02, 19); return g.toCanvas();
});
SPR.lamp = () => SPR.get('lamp', () => {
  const g = new G.Pix(10, 26, 2), M = U.shades('#3a3440');
  g.rect(4.2, 8, 1.6, 17, M); g.rect(2.5, 23.5, 5, 2.5, M); g.rect(3.5, 22, 3, 1.6, M);
  g.poly([[1.5, 2.5], [5, 0.5], [8.5, 2.5]], U.shades('#2a2430'));
  g.rect(2, 2.4, 6, 5.6, U.shades('#2a2430')); g.rect(2.8, 3, 4.4, 4.4, ['#ffc860', '#ffe08a', '#fff8d0']); g.dot(3.5, 3.5, '#ffffff');
  g.hline(5, 3, 5, 7.4, '#2a2430'); g.rect(1.5, 7.8, 7, 0.8, M);
  g.outline('#140c1c').polish(0.02, 21); return g.toCanvas();
});
SPR.stone = () => SPR.get('stone', () => {
  const g = new G.Pix(16, 30, 2), S = U.shades('#7a7a8a'), C = U.shades('#7affd8');
  g.poly([[3, 29], [5, 8], [8, 2], [11, 8], [13, 29]], S);
  [[5, 14, 11, 13], [4.5, 20, 11.5, 21], [4, 25, 12, 24.5]].forEach(([a, b, c, d]) => g.hline(a, b, c, d, S[0]));
  g.poly([[6, 22], [8, 7.5], [10, 22]], C); g.hline(8, 8.5, 8, 21, '#e8fff8'); g.dot(7.5, 12, '#ffffff');
  g.rect(1, 27, 14, 3, U.shades('#5a5a66')); g.hline(1, 27.2, 15, 27.2, '#8a8a9a');
  g.outline('#140c1c').polish(0.02, 23); return g.toCanvas();
});
SPR.plot = () => SPR.get('plot', () => {
  const c = U.canvas(96, 64), x = c.getContext('2d'); x.scale(2, 2);
  x.fillStyle = '#8a6a3a'; x.fillRect(3, 3, 42, 26);
  for (let i = 5; i < 28; i += 5) { x.fillStyle = '#7a5a30'; x.fillRect(3, i, 42, 1.5); x.fillStyle = '#9a7a48'; x.fillRect(3, i + 1.5, 42, 0.5); }
  for (let k = 0; k < 30; k++) { x.fillStyle = k % 2 ? '#6a4a24' : '#a8885a'; x.fillRect(4 + U.hash(k, 1, 3) * 40, 4 + U.hash(k, 2, 3) * 24, 0.5, 0.5); }
  x.fillStyle = '#c8a86a'; [[3, 3], [43, 3], [3, 27], [43, 27]].forEach(p => { x.fillRect(p[0], p[1] - 4, 2, 6); x.fillStyle = '#8a6a3a'; x.fillRect(p[0] + 1.5, p[1] - 4, 0.5, 6); x.fillStyle = '#c8a86a'; });
  x.fillStyle = '#e8d8a8'; x.fillRect(3, 2, 42, 0.5); x.fillRect(3, 1, 42, 0.5);
  c._d = 2;
  return c;
});

// ---------------- Maisons & bâtiments ----------------
// w,h en tuiles ; dessiné à partir du coin haut-gauche ; le toit dépasse vers le haut
SPR.house = (w, h, roof, wall, opts = {}) => SPR.get(`house_${w}_${h}_${roof}_${wall}_${JSON.stringify(opts)}`, () => {
  const W = w * 16, H = h * 16 + 12, g = new G.Pix(W, H, 2);
  const R = U.shades(roof), Wl = U.shades(wall), wallTop = 12 + Math.floor(h * 16 * 0.45), beam = U.shades('#5a3a22');
  // mur avec planches et colombages
  g.rect(1, wallTop, W - 2, H - wallTop - 1, Wl);
  for (let y = wallTop + 3; y < H - 2; y += 3) g.hline(2, y, W - 3, y, U.mix(Wl[1], Wl[0], 0.5));
  for (let x = 1; x < W - 1; x += 0.5) if (U.hash(x * 2, 3, 5) < 0.06) g.dot(x, wallTop + 1 + U.hash(x * 2, 4, 5) * (H - wallTop - 3), Wl[0]);
  g.rect(1, wallTop, 1.5, H - wallTop - 1, beam); g.rect(W - 2.5, wallTop, 1.5, H - wallTop - 1, beam); g.rect(1, wallTop, W - 2, 1.2, beam);
  g.rect(0, H - 2, W, 2, U.shades('#6a6458'));
  // toit en tuiles
  g.poly([[-2, wallTop + 2], [W / 2, 0], [W + 2, wallTop + 2]], R);
  for (let y = 2.5; y < wallTop + 1; y += 2.5) {
    const half = (y / (wallTop + 2)) * (W / 2 + 2), row = Math.round(y / 2.5);
    g.hline(W / 2 - half + 0.5, y, W / 2 + half - 0.5, y, R[0]);
    for (let x = W / 2 - half + (row % 2) * 1.5; x < W / 2 + half; x += 3) g.hline(x, y - 2.4, x, y, U.mix(R[1], R[0], 0.5));
    g.hline(W / 2 - half + 0.5, y + 0.5, W / 2 + half - 0.5, y + 0.5, U.mix(R[1], R[2], 0.5));
  }
  g.line(W / 2 - 0.5, 0, W / 2 - 0.5, 1.5, R[2], 1);
  g.hline(-2, wallTop + 2.2, W + 2, wallTop + 2.2, U.mix(R[0], '#000', 0.3));
  if (opts.chimney) { g.rect(W - 14, 0, 5, 10, U.shades('#6a6a70')); for (let y = 2; y < 10; y += 2) g.hline(W - 14, y, W - 9, y, '#4a4a50'); g.rect(W - 14.5, 0, 6, 1.2, U.shades('#4a4a52')); }
  // porte
  const dx = Math.floor(W / 2) - 3;
  g.rect(dx - 1, H - 13, 9, 12, beam);
  g.rect(dx, H - 12, 7, 11, U.shades('#6a4424')); for (let x = dx + 1.75; x < dx + 7; x += 1.75) g.hline(x, H - 11.5, x, H - 1.5, '#4a2c14');
  g.ell(dx + 5.3, H - 6, 0.6, 0.6, U.shades('#e8c050'));
  g.rect(dx - 1, H - 2.5, 9, 1, U.shades('#8a8478'));
  // fenêtres avec encadrement, croisillons et volets
  const winY = wallTop + 5, wins = W >= 48 ? [6, W - 14] : [4, W - 11];
  wins.forEach(wx => {
    g.rect(wx - 1, winY - 1, 9, 8, beam);
    g.rect(wx, winY, 7, 6, ['#a87818', '#ffd870', '#fff4c0']);
    g.hline(wx + 3.5, winY, wx + 3.5, winY + 6, '#5a3a1e'); g.hline(wx, winY + 3, wx + 7, winY + 3, '#5a3a1e');
    g.dot(wx + 1, winY + 1, '#ffffff'); g.rect(wx - 1, winY + 6.5, 9, 1, U.shades('#8a6a4a'));
    if (opts.flowers !== false) [0, 2, 4, 6].forEach(i => g.dot(wx + i + 0.5, winY + 6, ['#ff6a8a', '#ffe060', '#ff8ac8', '#ffffff'][i / 2]));
  });
  if (opts.sign) { g.rect(dx - 9, H - 19, 7, 5, U.shades('#c8a040')); g.hline(dx - 8, H - 17, dx - 3, H - 17, '#6a4a10'); g.hline(dx - 6, H - 20, dx - 6, H - 19, '#3a2a1a'); }
  if (opts.awning) { for (let x = 1; x < W - 1; x += 0.5) for (let y = wallTop - 2; y < wallTop + 4; y += 0.5) { const st = Math.floor(x / 4) % 2; g.dot(x, y, st ? (y > wallTop + 3 ? '#c8c0b0' : '#efe8da') : (y > wallTop + 3 ? U.mix(opts.awning, '#000', 0.3) : opts.awning)); } for (let x = 1; x < W - 1; x += 2) g.dot(x, wallTop + 4, '#00000040'); }
  if (opts.banner) { [4, W - 8].forEach(bx => { g.rect(bx, wallTop + 2, 4, 10, U.shades(opts.banner)); g.poly([[bx, wallTop + 12], [bx + 2, wallTop + 10.5], [bx + 4, wallTop + 12]], U.mix(opts.banner, '#000', 0.4)); g.ell(bx + 2, wallTop + 5, 0.8, 0.8, U.shades('#ffe080')); }); }
  if (opts.cave) { g.ell(W / 2, H - 6, 9, 9, '#1a1416'); g.ell(W / 2, H - 5, 7, 7, '#0e0a0c'); g.rect(dx - 5, H - 4, 17, 3, U.shades('#6a5a4a')); g.hline(dx - 4, H - 3, dx + 11, H - 3, '#8a7a6a'); }
  g.outline('#140c1c').polish(0.015, 25);
  return g.toCanvas();
});
// Style des bâtiments du Havre en fonction du niveau
SPR.building = (bid, lvl) => {
  const L = Math.max(1, lvl);
  switch (bid) {
    case 'forge': return SPR.house(3, 2, L >= 3 ? '#4a4a56' : '#6a4a3a', '#8a8278', { chimney: true, sign: L >= 2 });
    case 'atelier': return SPR.house(3, 2, '#3a6aa8', '#e8dcc0', { banner: L >= 2 ? '#d84a8a' : null });
    case 'marche': return SPR.house(3, 2, '#3a8a4a', '#e8d8b8', { awning: '#d83a3a' });
    case 'menagerie': return SPR.house(3, 2, '#a83a2a', '#c8a070', { banner: L >= 2 ? '#e8c050' : null });
    case 'herboristerie': return SPR.house(3, 2, '#4a8a3a', '#d8c8a0', { sign: true });
    case 'mine': return SPR.house(3, 2, '#5a5048', '#7a7068', { cave: true });
    case 'taverne': return SPR.house(3, 2, '#8a3a2a', '#d8b888', { sign: true, chimney: true });
    case 'remparts': return null;
  }
  return null;
};
