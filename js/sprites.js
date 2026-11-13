'use strict';
// ============================================================
//  Sprites procéduraux (pixel art généré par code)
// ============================================================
G.SPR = { cache: {} };
const SPR = G.SPR;
SPR.get = (key, fn) => SPR.cache[key] || (SPR.cache[key] = fn());

// ---------------- Héros / PNJ (16x16) ----------------
const HERO_T = {
  down: [
    '................',
    '.....oooooo.....',
    '....oHHHHHHo....',
    '...oHHHHHHHHo...',
    '...oHHhHHhHHo...',
    '...oHSSSSSSHo...',
    '...oSESSSSESo...',
    '....oSSssSSo....',
    '...ooCLLLLCoo...',
    '..oSoCCLLCCoSo..',
    '..oSoCCCCCCoSo..',
    '...ooDDBBDDoo...',
    '....oCCooCCo....',
    '....oDDooDDo....',
    '....oBBooBBo....',
    '.....oo..oo.....',
  ],
  up: [
    '................',
    '.....oooooo.....',
    '....oHHHHHHo....',
    '...oHHHHHHHHo...',
    '...oHHHHHHHHo...',
    '...oHHHHHHHHo...',
    '...ohHHHHHHho...',
    '....ohHHHHho....',
    '...ooCCCCCCoo...',
    '..oSoCCCCCCoSo..',
    '..oSoCCCCCCoSo..',
    '...ooDDBBDDoo...',
    '....oCCooCCo....',
    '....oDDooDDo....',
    '....oBBooBBo....',
    '.....oo..oo.....',
  ],
  side: [
    '................',
    '.....ooooo......',
    '....oHHHHHo.....',
    '...oHHHHHHHo....',
    '...oHHHHHhHo....',
    '...oHHHSSSSo....',
    '...oHHSSSESo....',
    '....ohSSSsSo....',
    '....ooCCLCo.....',
    '....oCCCSSo.....',
    '....oCCCSSo.....',
    '....oDDBBDo.....',
    '.....oCCCo......',
    '.....oDDDo......',
    '.....oBBBo......',
    '......ooo.......',
  ],
};
const DEF_NPC_PAL = { S: '#f2c9a0', s: '#d39a78', E: '#1a1a2e', o: '#160e1a' };
SPR.fullPal = p => {
  const P = Object.assign({}, DEF_NPC_PAL, p);
  if (!P.h) P.h = U.mix(P.H, '#000', 0.3);
  if (!P.L) P.L = '#e8e0c8';
  return P;
};
// extra : 'long' (cheveux longs), 'band' (bandeau), 'beard', 'hood'
SPR.heroPix = (pal, dir, frame, extra) => {
  const P = SPR.fullPal(pal);
  const g = new G.Pix(16, 16);
  const t = HERO_T[dir === 'left' || dir === 'right' ? 'side' : dir];
  t.forEach((row, y) => {
    for (let x = 0; x < 16; x++) {
      const ch = row[x];
      if (ch === '.' || !P[ch]) continue;
      let dx = 0, dy = 0;
      if (y >= 12 && frame) {
        if (dir === 'down' || dir === 'up') { if ((frame === 1 && x < 8) || (frame === 2 && x >= 8)) dy = -1; }
        else if (y >= 13) dx = (x < 8 ? -1 : 1) * (frame === 1 ? 1 : 0);
      }
      g.set(x + dx, y + dy, P[ch]);
    }
  });
  const side = t === HERO_T.side;
  if (extra === 'long') {
    if (side) [7, 8, 9, 10].forEach(y => { g.set(4, y, P.H); g.set(3, y, P.o); });
    else if (dir === 'down') [7, 8, 9].forEach(y => { g.set(3, y, P.H); g.set(12, y, P.H); g.set(2, y, P.o); g.set(13, y, P.o); });
    else [8, 9, 10].forEach(y => { for (let x = 5; x <= 10; x++) g.set(x, y, P.H); });
  }
  if (extra === 'band') { if (side) for (let x = 4; x <= 10; x++) g.set(x, 4, P.L); else if (dir === 'down') for (let x = 4; x <= 11; x++) g.set(x, 4, P.L); else for (let x = 4; x <= 11; x++) g.set(x, 5, P.L); }
  if (extra === 'beard' && !side && dir === 'down') { for (let x = 5; x <= 10; x++) g.set(x, 7, '#e8e8e8'); for (let x = 6; x <= 9; x++) g.set(x, 8, '#e8e8e8'); }
  if (extra === 'beard' && side) { g.set(9, 7, '#e8e8e8'); g.set(8, 7, '#e8e8e8'); g.set(8, 8, '#e8e8e8'); }
  return g;
};
SPR.CHAR_EXTRA = { kael: null, lyra: 'long', bran: 'band' };
SPR.hero = (key, pal, dir, frame, extra) => SPR.get(`h_${key}_${dir}_${frame}`, () => {
  let g = SPR.heroPix(pal, dir, frame, extra);
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
  const ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca;
  for (let i = -hiltLen; i <= len; i++) {
    for (let k = 0; k < w; k++) {
      const xx = x + ca * i + px * (k - (w - 1) / 2), yy = y + sa * i + py * (k - (w - 1) / 2);
      if (i < 0) g.set(xx, yy, hiltCol);
      else g.set(xx, yy, i === len ? cols[2] : k === 0 ? cols[2] : k === w - 1 ? cols[0] : cols[1]);
    }
  }
  if (guardCol) for (let k = -2; k <= 2; k++) g.set(x + px * k, y + py * k, guardCol);
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
// Sprite de combat 24x24 (personnage + arme), regard vers la gauche
SPR.battler = (cid, wid, pose) => SPR.get(`b_${cid}_${wid}_${pose}`, () => {
  const d = G.CHARS[cid];
  const g = new G.Pix(24, 24);
  const h = SPR.heroPix(d.pal, 'right', pose === 'atk' ? 1 : 0, SPR.CHAR_EXTRA[cid]);
  const back = G.WEAPONS[wid].kind === 'bow' || G.WEAPONS[wid].kind === 'staff';
  if (back) SPR.drawWeapon(g, wid, pose);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const c = h.get(x, y); if (c) g.set(x + 4, y + 7, c); }
  if (!back) SPR.drawWeapon(g, wid, pose);
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
  const s = SPR.ENEMY_SIZE[spr], g = new G.Pix(s, s), P = U.shades(color);
  const acc = elem === 'feu' ? '#ffcf40' : spr === 'golem' ? '#4a443c' : U.mix(color, '#ffffff', 0.5);
  SPR.DRAW[spr](g, P, acc, spr === 'lizard' && color === '#8a1f2a');
  g.outline('#140c1c');
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
SPR.fam = id => SPR.get('f_' + id, () => { const g = new G.Pix(16, 16); SPR.FAM_DRAW[id](g); g.outline('#140c1c'); return g.toCanvas(); });

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

// ---------------- Tuiles 16x16 ----------------
const TILE_DEF = {
  '.': { b: '#5aa03c', d: '#4a8a30', l: '#74bc4c' },
  ',': { b: '#5aa03c', d: '#4a8a30', l: '#74bc4c', fl: true },
  '_': { b: '#c8a86a', d: '#b4935a', l: '#e0c890', path: true },
  'f': { b: '#3d7a32', d: '#2f6228', l: '#4f8f3e', leaf: '#7a6a3a' },
  'r': { b: '#8f877a', d: '#7a7366', l: '#a59d90' },
  'm': { b: '#4f5a38', d: '#3e4a2c', l: '#5f6a44' },
  'v': { b: '#3d2c2a', d: '#2c201f', l: '#4d3a36', crack: '#b8401a' },
  's': { b: '#e6d39a', d: '#d4bf84', l: '#f4e6b8' },
  'p': { b: '#a39b8e', d: '#857d72', l: '#bdb5a8', paved: true },
  'g': { b: '#62a844', d: '#52923a', l: '#7cc256' },
};
SPR.tile = (ch, v) => SPR.get(`t_${ch}_${v}`, () => {
  const c = U.canvas(16, 16), x = c.getContext('2d'), T = TILE_DEF[ch] || TILE_DEF['.'];
  x.fillStyle = T.b; x.fillRect(0, 0, 16, 16);
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const h = U.hash(px + v * 31, py + v * 17, 3);
    if (h < 0.1) { x.fillStyle = T.d; x.fillRect(px, py, 1, 1); }
    else if (h > 0.93) { x.fillStyle = T.l; x.fillRect(px, py, 1, 1); }
  }
  if (T.paved) {
    x.fillStyle = T.d;
    for (let i = 0; i < 16; i += 8) { x.fillRect(0, i, 16, 1); }
    x.fillRect((v % 2) * 4 + 3, 0, 1, 8); x.fillRect((v % 2) * 4 + 9, 8, 1, 8);
    x.fillStyle = T.l; x.fillRect(1, 1, 5, 1); x.fillRect(10, 9, 4, 1);
  }
  if (ch === '.' || ch === ',' || ch === 'g' || ch === 'f') {
    for (let k = 0; k < 5; k++) {
      const bx = Math.floor(U.hash(k, v, 9) * 15), by = Math.floor(U.hash(v, k, 9) * 13) + 2;
      x.fillStyle = T.d; x.fillRect(bx, by, 1, 2); x.fillStyle = T.l; x.fillRect(bx + 1, by - 1, 1, 2);
    }
  }
  if (T.fl) {
    const cols = ['#ffffff', '#ffe060', '#ff8ab0', '#a0c8ff'];
    for (let k = 0; k < 3; k++) {
      const fx = 2 + Math.floor(U.hash(k, v, 5) * 12), fy = 2 + Math.floor(U.hash(v, k, 5) * 12);
      x.fillStyle = cols[(k + v) % 4]; x.fillRect(fx - 1, fy, 3, 1); x.fillRect(fx, fy - 1, 1, 3); x.fillStyle = '#ffd030'; x.fillRect(fx, fy, 1, 1);
    }
  }
  if (T.leaf && v % 3 === 0) { x.fillStyle = T.leaf; x.fillRect(4 + v % 7, 9, 2, 1); x.fillRect(11, 4 + v % 5, 1, 2); }
  if (T.path) { x.fillStyle = '#a08050'; x.fillRect(3 + v % 5, 5, 2, 1); x.fillRect(10, 11 - v % 4, 1, 1); x.fillStyle = '#e8d4a0'; x.fillRect(7, 2 + v % 6, 1, 1); }
  if (T.crack) { x.fillStyle = T.crack; const o = v % 4; x.fillRect(2 + o, 6, 4, 1); x.fillRect(5 + o, 7, 1, 3); x.fillRect(10, 12 - o, 3, 1); }
  if (ch === 's') { x.fillStyle = '#ffffff'; x.fillRect(4 + v % 6, 8, 1, 1); }
  if (ch === 'm' && v % 2 === 0) { x.fillStyle = '#3a5a52'; x.fillRect(4, 9, 6, 2); x.fillRect(5, 8, 4, 1); }
  return c;
});
// Tuiles animées : eau, lave, eau de marais
SPR.animTile = (ch, v, f) => SPR.get(`a_${ch}_${v}_${f}`, () => {
  const c = U.canvas(16, 16), x = c.getContext('2d');
  if (ch === '~') {
    x.fillStyle = '#2f6fc0'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#2a63ae'; for (let i = 0; i < 16; i += 4) x.fillRect(0, i + 2, 16, 1);
    x.fillStyle = '#5a9ae0';
    for (let k = 0; k < 3; k++) { const wx = (Math.floor(U.hash(k, v, 1) * 16) + f * 2) % 16, wy = (k * 5 + v) % 16; x.fillRect(wx, wy, 4, 1); }
    x.fillStyle = '#cfe8ff'; if ((f + v) % 4 === 0) x.fillRect((v * 5) % 14, (v * 3 + f) % 14, 1, 1);
  } else if (ch === 'l') {
    x.fillStyle = '#d8401a'; x.fillRect(0, 0, 16, 16);
    for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
      const n = U.noise((px + f * 1.5) / 5, (py + v * 3) / 5, 4);
      if (n > 0.62) { x.fillStyle = n > 0.75 ? '#fff0a0' : '#ffb030'; x.fillRect(px, py, 1, 1); }
      else if (n < 0.25) { x.fillStyle = '#8a2a10'; x.fillRect(px, py, 1, 1); }
    }
  } else if (ch === 'w') {
    x.fillStyle = '#3a5e54'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#4a7466'; x.fillRect((f * 2 + v) % 12, 5, 4, 1); x.fillRect((f * 3 + v * 2) % 12, 11, 3, 1);
    if (v % 3 === 0) { x.fillStyle = '#4f8a3a'; x.fillRect(3, 3, 4, 3); x.fillStyle = '#ff9ad8'; x.fillRect(4, 3, 1, 1); }
  }
  return c;
});
SPR.bridge = () => SPR.get('bridge', () => {
  const c = U.canvas(16, 16), x = c.getContext('2d');
  x.fillStyle = '#8a5a32'; x.fillRect(0, 1, 16, 14);
  x.fillStyle = '#5a3a1e'; for (let i = 0; i < 16; i += 4) x.fillRect(i, 1, 1, 14);
  x.fillStyle = '#a87448'; for (let i = 1; i < 16; i += 4) x.fillRect(i, 2, 1, 12);
  x.fillStyle = '#3a2412'; x.fillRect(0, 0, 16, 2); x.fillRect(0, 14, 16, 2);
  return c;
});

// ---------------- Objets du décor (arbres, rochers, noeuds…) ----------------
SPR.tree = kind => SPR.get('tree_' + kind, () => {
  const g = new G.Pix(20, 30);
  const trunk = U.shades(kind === 'swamp' ? '#5a5048' : kind === 'volcano' ? '#2a1e1a' : '#6a4626');
  if (kind === 'swamp' || kind === 'volcano') {
    g.rect(9, 12, 3, 17, trunk);
    g.thick([[10, 16], [5, 11], [3, 6]], 1.1, 0.7, trunk); g.thick([[11, 14], [15, 9], [17, 4]], 1.1, 0.7, trunk); g.thick([[10, 12], [10, 4]], 1, 0.7, trunk);
    if (kind === 'swamp') { g.ell(5, 12, 1.5, 2.5, U.shades('#6a8a4a')); g.ell(15, 10, 1.2, 2.2, U.shades('#6a8a4a')); }
    else { g.set(4, 6, '#ff8030'); g.set(16, 5, '#ff8030'); }
  } else {
    const L = U.shades(kind === 'forest' ? '#2f6a2a' : '#4a9a34');
    g.rect(8, 18, 4, 11, trunk); g.set(7, 28, trunk[0]); g.set(12, 28, trunk[0]);
    if (kind === 'forest') {
      g.ell(10, 16, 9, 5.5, L); g.ell(10, 10, 7.5, 5.5, L); g.ell(10, 5, 5, 4.5, L);
      [[5, 15], [13, 11], [8, 6], [14, 17]].forEach(p => g.set(p[0], p[1], L[2]));
    } else {
      g.ell(10, 12, 9, 8.5, L); g.ell(6, 15, 4, 3.5, L); g.ell(14, 15, 4, 3.5, L);
      [[6, 8], [12, 6], [9, 11], [14, 10]].forEach(p => { g.set(p[0], p[1], L[2]); g.set(p[0] + 1, p[1], L[2]); });
      if (kind === 'fruit') [[7, 13], [13, 9], [10, 16]].forEach(p => { g.set(p[0], p[1], '#e8303a'); g.set(p[0], p[1] - 1, '#ff8080'); });
    }
  }
  g.outline('#10180c');
  return g.toCanvas();
});
SPR.node = (type, depleted) => SPR.get(`n_${type}_${depleted ? 1 : 0}`, () => {
  const g = new G.Pix(20, 24);
  const rock = U.shades('#8a8478');
  if (depleted) {
    if (type === 'arbre' || type === 'vieil_arbre') { g.ell(10, 20, 3, 1.5, U.shades('#6a4626')); g.set(10, 19, '#d8b888'); }
    else if (type === 'herbe' || type === 'fibre') { g.rect(8, 19, 1, 3, '#4a7a30'); g.rect(11, 20, 1, 2, '#4a7a30'); }
    else { g.ell(8, 20, 2, 1.3, rock); g.ell(12, 21, 1.6, 1, rock); }
    g.outline('#10180c'); return g.toCanvas();
  }
  switch (type) {
    case 'arbre': {
      const L = U.shades('#5aaa3a'), T = U.shades('#7a5230');
      g.rect(9, 15, 3, 8, T); g.ell(10, 10, 6.5, 6, L); [[7, 8], [12, 7], [10, 12]].forEach(p => g.set(p[0], p[1], '#e8303a'));
      break;
    }
    case 'vieil_arbre': {
      const L = U.shades('#2a7a5a'), T = U.shades('#5a3a2a');
      g.rect(7, 13, 6, 10, T); g.ell(10, 9, 9, 7.5, L); [[5, 8], [14, 6], [10, 12], [8, 4]].forEach(p => g.set(p[0], p[1], '#a8ffd8'));
      break;
    }
    case 'rocher': g.ell(10, 18, 7, 5, rock); g.ell(7, 15.5, 3.5, 3, rock); break;
    case 'fer': g.ell(10, 18, 7, 5, rock); g.ell(7, 15.5, 3.5, 3, rock); [[7, 16], [11, 17], [13, 19], [8, 19]].forEach(p => { g.set(p[0], p[1], '#e89a5a'); g.set(p[0] + 1, p[1], '#a85a2a'); }); break;
    case 'cristal': {
      const C = U.shades('#5ae8ff');
      g.ell(10, 20, 6, 2.5, rock);
      g.poly([[7, 21], [8, 9], [10, 21]], C); g.poly([[9, 21], [11, 5], [13.5, 21]], C); g.poly([[12, 21], [15, 12], [16, 21]], C);
      break;
    }
    case 'mithril': {
      const C = U.shades('#c8d8ff');
      g.ell(10, 18, 7, 5, U.shades('#3a3040'));
      [[6, 16], [10, 15], [13, 18], [8, 19], [11, 20]].forEach(p => { g.set(p[0], p[1], C[2]); g.set(p[0] + 1, p[1], C[1]); g.set(p[0], p[1] + 1, C[0]); });
      break;
    }
    case 'herbe': { const L = U.shades('#3a9a3a'); g.ell(10, 18, 6, 4.5, L); [[7, 16], [11, 15], [13, 18], [9, 19]].forEach(p => { g.set(p[0], p[1], '#ffffff'); }); break; }
    case 'fibre': { for (let i = 0; i < 7; i++) { const x0 = 5 + i * 1.6; g.line(x0, 22, x0 + (i % 2 ? 1 : -1), 10 + (i % 3) * 2, i % 2 ? '#e8c860' : '#c8a040'); } break; }
  }
  g.outline('#10180c');
  return g.toCanvas();
});
SPR.chest = open => SPR.get('chest' + (open ? 1 : 0), () => {
  const g = new G.Pix(16, 16), W = U.shades('#8a5a2a'), Gd = U.shades('#e8b840');
  if (open) { g.rect(2, 4, 12, 4, ['#3a2410', '#5a3a1e', '#7a5230']); }
  g.rect(2, open ? 8 : 5, 12, open ? 7 : 4, W); g.rect(2, 9, 12, 6, W);
  g.rect(2, 9, 12, 1, Gd[1]); g.rect(7, 8, 2, 3, Gd); g.rect(2, 5, 1, 10, Gd[0]); g.rect(13, 5, 1, 10, Gd[0]);
  g.outline('#140c1c'); return g.toCanvas();
});
SPR.sign = () => SPR.get('sign', () => {
  const g = new G.Pix(16, 16), W = U.shades('#9a6a3a');
  g.rect(7, 9, 2, 7, W); g.rect(2, 3, 12, 7, W); g.line(4, 5, 11, 5, '#5a3a1e'); g.line(4, 7, 9, 7, '#5a3a1e');
  g.outline('#140c1c'); return g.toCanvas();
});
SPR.lamp = () => SPR.get('lamp', () => {
  const g = new G.Pix(10, 26);
  g.rect(4, 8, 2, 17, U.shades('#3a3440')); g.rect(2, 24, 6, 2, U.shades('#3a3440'));
  g.rect(2, 2, 6, 6, U.shades('#2a2430')); g.rect(3, 3, 4, 4, '#ffe08a'); g.set(4, 4, '#ffffff');
  g.outline('#140c1c'); return g.toCanvas();
});
SPR.stone = () => SPR.get('stone', () => {
  const g = new G.Pix(16, 30), S = U.shades('#7a7a8a'), C = U.shades('#7affd8');
  g.poly([[3, 29], [5, 8], [8, 2], [11, 8], [13, 29]], S);
  g.poly([[6, 22], [8, 8], [10, 22]], C); g.set(8, 12, '#ffffff');
  g.rect(1, 27, 14, 3, U.shades('#5a5a66'));
  g.outline('#140c1c'); return g.toCanvas();
});
SPR.plot = () => SPR.get('plot', () => {
  const c = U.canvas(48, 32), x = c.getContext('2d');
  x.fillStyle = '#8a6a3a'; x.fillRect(3, 3, 42, 26); x.fillStyle = '#7a5a30';
  for (let i = 5; i < 28; i += 5) x.fillRect(3, i, 42, 2);
  x.fillStyle = '#c8a86a'; [[3, 3], [43, 3], [3, 27], [43, 27]].forEach(p => x.fillRect(p[0], p[1] - 4, 2, 6));
  x.fillStyle = '#e8d8a8'; x.fillRect(3, 2, 42, 1);
  return c;
});

// ---------------- Maisons & bâtiments ----------------
// w,h en tuiles ; dessiné à partir du coin haut-gauche ; le toit dépasse vers le haut
SPR.house = (w, h, roof, wall, opts = {}) => SPR.get(`house_${w}_${h}_${roof}_${wall}_${JSON.stringify(opts)}`, () => {
  const W = w * 16, H = h * 16 + 12, g = new G.Pix(W, H);
  const R = U.shades(roof), Wl = U.shades(wall), wallTop = 12 + Math.floor(h * 16 * 0.45);
  g.rect(1, wallTop, W - 2, H - wallTop - 1, Wl);
  for (let y = wallTop + 4; y < H - 2; y += 5) g.line(2, y, W - 3, y, Wl[0]);
  g.poly([[-2, wallTop + 2], [W / 2, 0], [W + 2, wallTop + 2]], R);
  for (let y = 4; y < wallTop; y += 4) {
    const half = (y / (wallTop + 2)) * (W / 2 + 2);
    g.line(W / 2 - half + 1, y, W / 2 + half - 1, y, R[0]);
  }
  if (opts.chimney) { g.rect(W - 14, 0, 5, 10, U.shades('#6a6a70')); }
  const dx = Math.floor(W / 2) - 3;
  g.rect(dx, H - 12, 7, 11, U.shades('#5a3a1e')); g.set(dx + 5, H - 6, '#e8c050');
  const winY = wallTop + 5;
  const wins = W >= 48 ? [6, W - 14] : [4, W - 11];
  wins.forEach(wx => { g.rect(wx, winY, 7, 6, ['#806020', '#ffd870', '#fff4c0']); g.line(wx + 3, winY, wx + 3, winY + 5, '#5a3a1e'); });
  if (opts.sign) { g.rect(dx - 8, H - 18, 6, 5, U.shades('#c8a040')); }
  if (opts.awning) { for (let x = 1; x < W - 1; x++) for (let y = wallTop - 2; y < wallTop + 4; y++) g.set(x, y, Math.floor(x / 4) % 2 ? '#e8e0d0' : opts.awning); }
  if (opts.banner) { g.rect(4, wallTop + 2, 4, 10, U.shades(opts.banner)); g.rect(W - 8, wallTop + 2, 4, 10, U.shades(opts.banner)); }
  if (opts.cave) { g.ell(W / 2, H - 6, 9, 9, '#1a1416'); g.rect(dx - 5, H - 4, 17, 3, '#6a5a4a'); }
  g.outline('#140c1c');
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
