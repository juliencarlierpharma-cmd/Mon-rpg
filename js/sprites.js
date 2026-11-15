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
// version réduite à la densité du tampon de rendu (préparée une fois, réductions successives par moitié) :
// évite de rééchantillonner une image haute définition à chaque image en qualité réduite
SPR.fit = (img, sc = 1) => {
  const D = G.R.D * Math.max(1, sc), d = img._d || 1; if (!img || d <= D * 1.01 || img.width < 4) return img;
  const m = img._mip || (img._mip = {}); if (m[D]) return m[D];
  let src = img, cd = d;
  while (cd / 2 >= D) { const h = U.canvas(Math.max(1, Math.round(src.width / 2)), Math.max(1, Math.round(src.height / 2))), hx = h.getContext('2d'); hx.imageSmoothingEnabled = true; hx.imageSmoothingQuality = 'high'; hx.drawImage(src, 0, 0, h.width, h.height); src = h; cd /= 2; }
  if (cd > D * 1.01) { const h = U.canvas(Math.max(1, Math.round(img.width * D / d)), Math.max(1, Math.round(img.height * D / d))), hx = h.getContext('2d'); hx.imageSmoothingEnabled = true; hx.imageSmoothingQuality = 'high'; hx.drawImage(src, 0, 0, h.width, h.height); src = h; }
  src._d = D; return (m[D] = src);
};
SPR.draw = (ctx, img, x, y, sc = 1) => ctx.drawImage(SPR.fit(img, sc), x, y, SPR.lw(img) * sc, SPR.lh(img) * sc);

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
// st : { hair: 'spiky'|'long'|'band'|null, outfit: 'tunic'|'robe'|'vest'|'armor'|'apron', hat: 'straw'|'cap'|'helm'|'hood'|'miner', beard, scarf: couleur, ribbon: couleur }
SPR.heroPix = (pal, dir, frame, extra, K = 8) => {
  const st = typeof extra === 'object' && extra ? extra : { hair: extra === 'beard' ? null : extra, beard: extra === 'beard' };
  const P = SPR.fullPal(pal), g = new G.Pix(16, 16, K); g.smooth = true;
  const sh = c => [U.mix(c, '#120a20', 0.42), c, U.mix(c, '#ffffff', 0.35)];
  const hair = [P.h, P.H, U.mix(P.H, '#fff4d8', 0.4)], skin = [U.mix(P.S, P.s, 0.7), P.S, U.mix(P.S, '#ffffff', 0.35)];
  const cloth = sh(P.C), pants = [U.mix(P.D, '#000', 0.3), P.D, U.mix(P.D, '#fff', 0.25)];
  const boot = [U.mix(P.B, '#000', 0.35), P.B, U.mix(P.B, '#fff', 0.3)], acc = [U.mix(P.L, '#000', 0.3), P.L, U.mix(P.L, '#fff', 0.4)];
  const steel = ['#6a7080', '#a8b0c0', '#e8eef8'], apron = ['#b8b0a0', '#ece6d8', '#ffffff'];
  const side = dir === 'left' || dir === 'right', back = dir === 'up';
  const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  const O = st.outfit || 'tunic', robe = O === 'robe', armor = O === 'armor', vest = O === 'vest';
  const body = armor ? steel : cloth, arm = vest ? skin : armor ? steel : cloth;
  // --- éléments derrière le corps ---
  if (st.hair === 'long' && !back && st.hat !== 'hood') {
    if (side) g.poly([[3.6, 4.5], [7, 4.5], [6.8, 11.6], [3.4, 11.2]], hair);
    else g.poly([[3, 5], [13, 5], [13.4, 11.4], [2.6, 11.4]], [hair[0], hair[0], hair[1]]);
  }
  if (st.scarf && side) { const S = sh(st.scarf); g.poly([[6, 8.4], [2.2 - sw * 0.4, 9.6], [1.6 - sw * 0.4, 11.2], [3.2, 10.6], [6.4, 9.6]], S); }
  if (st.hat === 'hood' && !back) { const Hd = sh(P.D); if (side) g.poly([[3.4, 4], [7, 4], [6.6, 10], [3.6, 10.4]], Hd); else g.poly([[3, 5], [13, 5], [13.4, 10.5], [2.6, 10.5]], Hd); }
  // --- jambes / jupe ---
  if (robe) {
    const R = [U.mix(P.C, '#120a20', 0.5), U.mix(P.C, '#000', 0.08), U.mix(P.C, '#fff', 0.3)];
    if (side) { g.poly([[5.2, 11], [10.6, 11], [11.6 + sw * 0.3, 14.8], [4.4 - sw * 0.3, 14.8]], R); g.rect(6.4 + sw * 0.6, 14.6, 2.2, 0.9, boot); }
    else {
      g.poly([[4.2, 11], [11.8, 11], [12.8, 14.8], [3.2, 14.8]], R);
      g.hline(6.4, 11.5, 5.8, 14.6, R[0]); g.hline(9.6, 11.5, 10.2, 14.6, R[0]); g.hline(8, 11.6, 8, 14.6, R[0]);
      g.rect(3.2, 14.4, 9.6, 0.5, acc);
      g.rect(5.6, 14.8 - (frame === 1 ? 0.3 : 0), 2, 0.8, boot); g.rect(8.4, 14.8 - (frame === 2 ? 0.3 : 0), 2, 0.8, boot);
    }
  } else if (side) {
    const a = sw * 0.9;
    [[6.3 - a], [7.6 + a]].forEach(([lx], i) => {
      const lift = i === 0 ? Math.max(0, sw) * 0.4 : Math.max(0, -sw) * 0.4, dk = i === 0;
      const L = armor ? steel : pants;
      g.rect(lx, 11.6, 2, 2.6 - lift, dk ? [L[0], L[0], L[1]] : L);
      g.rect(lx - 0.1, 14 - lift, 2.6, 1.5, dk ? [boot[0], boot[0], boot[1]] : boot); g.hline(lx + 0.2, 14.2 - lift, lx + 2.2, 14.2 - lift, boot[2]);
    });
  } else {
    const l1 = frame === 1 ? 0.5 : 0, l2 = frame === 2 ? 0.5 : 0, L = armor ? steel : pants;
    g.rect(5.5, 11.6, 2.2, 2.6 - l1, L); g.rect(8.3, 11.6, 2.2, 2.6 - l2, L);
    g.rect(5.3, 14 - l1, 2.5, 1.5, boot); g.rect(8.2, 14 - l2, 2.5, 1.5, boot);
    g.hline(5.5, 14.2 - l1, 7.6, 14.2 - l1, boot[2]); g.hline(8.4, 14.2 - l2, 10.5, 14.2 - l2, boot[2]);
  }
  // --- bras arrière (profil) ---
  if (side && !st.noArms) { g.ell(6.4 - sw * 0.6, 10.3, robe ? 1.3 : 1.05, 1.9, [arm[0], arm[0], arm[1]]); g.ell(6.4 - sw * 0.9, 12.1, 0.8, 0.8, [skin[0], skin[0], skin[1]]); }
  // --- torse ---
  if (side) g.poly([[5.4, 8.5], [10.4, 8.5], [10.8, 12.1], [5.1, 12.1]], body);
  else g.poly([[4.5, 8.5], [11.5, 8.5], [12, 12.1], [4, 12.1]], body);
  if (vest && !back) {
    if (side) { g.poly([[8.6, 8.6], [10.4, 8.6], [10.7, 11.2], [9.2, 11.2]], skin); }
    else { g.poly([[6.8, 8.6], [9.2, 8.6], [8.8, 11.1], [7.2, 11.1]], skin); g.hline(8, 9.2, 8, 10.6, skin[0]); }
  }
  if (armor) { if (!side) { g.ell(8, 9.8, 2.6, 1.6, steel); g.dot(7, 9.2, '#ffffff'); } g.ell(side ? 7.8 : 4.4, 8.9, 1.6, 1.1, steel); if (!side) g.ell(11.6, 8.9, 1.6, 1.1, steel); }
  if (O === 'apron' && !back) { if (side) g.poly([[9.4, 9.2], [10.8, 9.2], [11.4, 13.6], [9.6, 13.6]], apron); else { g.poly([[5.8, 9.4], [10.2, 9.4], [10.8, 13.8], [5.2, 13.8]], apron); g.hline(5.8, 9.4, 4.8, 8.6, apron[0]); g.hline(10.2, 9.4, 11.2, 8.6, apron[0]); g.rect(7, 11.2, 2, 1, apron[0]); } }
  // plis et ceinture
  if (!side && !armor && !vest) { g.hline(6.2, 9.4, 6.6, 11, body[0]); g.hline(9.8, 9.4, 9.4, 11, body[0]); }
  g.rect(side ? 5.2 : 4.2, 11.1, side ? 5.5 : 7.6, 0.8, boot);
  if (!back) g.rect(side ? 9.4 : 7.5, 11.1, 1, 0.8, ['#a8781a', '#e8c050', '#fff0a0']);
  if (!back && !side && !vest && !armor && O !== 'apron') g.poly([[6.4, 8.5], [9.6, 8.5], [8, 10.2]], acc);
  // écharpe (face)
  if (st.scarf && !side) { const S = sh(st.scarf); g.poly([[4.6, 8.2], [11.4, 8.2], [11, 9.4], [5, 9.4]], S); if (!back) g.poly([[9.4, 9.2], [10.8, 9.2], [10.6 + sw * 0.3, 11.8], [9.4 + sw * 0.3, 11.4]], S); else g.poly([[6, 9.2], [7.4, 9.2], [7.2 - sw * 0.3, 12], [5.8 - sw * 0.3, 11.6]], S); }
  if (st.scarf && side) { const S = sh(st.scarf); g.poly([[6.6, 8.1], [10.6, 8.1], [10.4, 9.2], [6.4, 9.3]], S); }
  // --- bras avant ---
  const band = vest ? acc : null;
  if (side) { if (!st.noArms) { g.ell(8.6 + sw * 0.7, 10.3, robe ? 1.35 : 1.1, 1.95, arm); g.ell(8.7 + sw * 1, 12.2, 0.85, 0.85, skin); if (band) g.rect(7.9 + sw * 0.8, 11.3, 1.6, 0.6, band); } }
  else {
    const a1 = frame === 1 ? -0.4 : frame === 2 ? 0.4 : 0;
    g.ell(3.9, 10.2 + a1, robe ? 1.4 : 1.15, 1.95, arm); g.ell(12.1, 10.2 - a1, robe ? 1.4 : 1.15, 1.95, arm);
    g.ell(3.9, 12.1 + a1, 0.85, 0.85, skin); g.ell(12.1, 12.1 - a1, 0.85, 0.85, skin);
    if (band) { g.rect(3.1, 11.2 + a1, 1.6, 0.6, band); g.rect(11.3, 11.2 - a1, 1.6, 0.6, band); }
  }
  // --- tête ---
  const hx = side ? 8.4 : 8;
  if (!side && !back) { g.ell(3.7, 6, 0.6, 0.8, skin); g.ell(12.3, 6, 0.6, 0.8, skin); }
  g.ell(hx, 5.6, side ? 4.2 : 4.4, 4.1, skin);
  if (side) g.ell(12.3, 6.5, 0.6, 0.55, skin);
  const hatOn = st.hat === 'helm' || st.hat === 'miner' || st.hat === 'hood';
  // --- cheveux ---
  if (back) {
    g.ell(8, 5.1, 4.75, 4.4, hair);
    g.hline(6, 3, 5.5, 8, hair[0]); g.hline(8, 2.4, 8, 8.4, hair[0]); g.hline(10, 3, 10.5, 8, hair[0]);
    if (st.hair === 'long') g.poly([[3.6, 6.5], [12.4, 6.5], [12.6, 11.6], [3.4, 11.6]], hair);
    if (st.hair === 'band') { g.rect(3.4, 3.8, 9.2, 0.8, acc); g.poly([[7.4, 4.5], [8.6, 4.5], [9.4, 7], [8, 6.2], [6.8, 7]], acc); }
    if (st.ribbon) { g.ell(8, 5.4, 1.4, 0.8, sh(st.ribbon)); g.poly([[7.6, 5.6], [6.8, 7.6], [8, 6.6], [9.2, 7.6], [8.4, 5.6]], sh(st.ribbon)); }
  } else if (side) {
    g.ell(7.6, 4.2, 4.6, 3.5, hair);
    g.poly([[3.5, 3.8], [8, 2.6], [7.6, 8.4], [4, 8.6]], hair);
    g.poly([[8.6, 1.4], [12.7, 4.3], [11.8, 5.6], [10.6, 4.6], [9.8, 5.8], [9, 4.4]], hair);
    g.ell(7.4, 2.7, 2.3, 0.45, [hair[1], hair[2], U.mix(hair[2], '#ffffff', 0.4)]);
    if (st.hair === 'spiky') { g.poly([[4, 2.6], [1.8, 1.2], [4.8, 1.4]], hair); g.poly([[6, 1.4], [5.4, -0.2], [7.6, 1]], hair); g.poly([[3.4, 4.6], [1.4, 4.2], [3.6, 3.6]], hair); }
    if (st.hair === 'band') { g.rect(4, 3.6, 8.6, 0.8, acc); g.poly([[3.8, 3.8], [1.6, 5.2], [2.4, 6], [4, 4.6]], acc); }
    if (st.ribbon) g.ell(5, 4.2, 1, 1.3, sh(st.ribbon));
    if (st.beard) g.poly([[9, 7], [12.2, 7.2], [11.4, 9.6], [9.4, 9.8]], ['#b8b8c0', '#e8e8ee', '#ffffff']);
    g.ell(10.75, 6.3, 0.48, 0.92, '#fbfbff'); g.ell(10.85, 6.38, 0.38, 0.78, [U.mix(P.E, '#000', 0.35), P.E, U.mix(P.E, '#9ad0ff', 0.55)]); g.ell(10.9, 6.45, 0.18, 0.36, '#0c0a16'); g.ell(10.7, 6, 0.13, 0.13, '#ffffff');
    g.line(10.2, 5.2, 11.3, 5.15, hair[0], 0.24); g.line(10.3, 5.45, 11.3, 5.45, U.mix(P.E, '#000', 0.4), 0.2);
    g.ell(11.2, 8.25, 0.32, 0.14, U.mix(P.s, '#8a3a3a', 0.45)); g.ell(10.4, 7.75, 0.6, 0.32, U.mix(P.S, '#ff7a8a', 0.28));
  } else {
    g.ell(8, 3.9, 4.7, 3.3, hair);
    g.poly([[3.4, 4.1], [12.6, 4.1], [12.4, 5.6], [10.8, 4.7], [9.4, 5.5], [8, 4.6], [6.6, 5.5], [5.2, 4.7], [3.6, 5.8]], hair);
    g.rect(3.3, 4.4, 0.9, 2.8, [hair[0], hair[1], hair[1]]); g.rect(11.8, 4.4, 0.9, 2.8, [hair[0], hair[1], hair[1]]);
    g.ell(7.6, 2.35, 2.6, 0.5, [hair[1], hair[2], U.mix(hair[2], '#ffffff', 0.4)]);
    if (st.hair === 'spiky') { g.poly([[4.6, 2.6], [3.2, 0.4], [6.2, 1.8]], hair); g.poly([[7, 1.4], [8, -0.1], [9.2, 1.4]], hair); g.poly([[10, 1.8], [12.8, 0.4], [11.6, 2.8]], hair); }
    if (st.hair === 'band') { g.rect(3.4, 3.3, 9.2, 0.85, acc); g.dot(4, 3.4, '#ffffff'); }
    if (st.ribbon) { g.ell(11.4, 3.2, 1.2, 0.8, sh(st.ribbon)); g.ell(12.6, 3.6, 0.8, 0.7, sh(st.ribbon)); }
    // ombre douce de la frange
    g.ell(8, 5.85, 3.6, 0.28, U.mix(P.S, P.s, 0.3));
    // yeux ronds : blanc, iris dégradé, pupille, reflets ; sourcils ; joues ; nez ; bouche
    const iris = [U.mix(P.E, '#000000', 0.35), P.E, U.mix(P.E, '#9ad0ff', 0.55)];
    [[6.25, 7, -1], [9.75, 7, 1]].forEach(([ex, ey, sd]) => {
      g.ell(ex, ey, 0.78, 0.98, '#fbfbff'); g.ell(ex, ey + 0.55, 0.7, 0.35, '#dcdcec');
      g.ell(ex + sd * 0.06, ey + 0.08, 0.6, 0.86, iris);
      g.ell(ex + sd * 0.06, ey + 0.18, 0.28, 0.42, '#0c0a16');
      g.ell(ex - 0.2, ey - 0.32, 0.2, 0.2, '#ffffff'); g.ell(ex + 0.22, ey + 0.42, 0.1, 0.1, '#e8f4ff');
      g.line(ex - 0.62, ey - 0.88, ex + 0.62, ey - 0.88, U.mix(P.E, '#000', 0.3), 0.16);
      g.line(ex - 0.45 * sd, ey - 1.42, ex + 0.5 * sd, ey - 1.52, U.mix(hair[0], P.S, 0.25), 0.15);
    });
    g.ell(5.1, 8.25, 0.75, 0.38, U.mix(P.S, '#ff7a8a', 0.28)); g.ell(10.9, 8.25, 0.75, 0.38, U.mix(P.S, '#ff7a8a', 0.28));
    g.ell(8.05, 8.2, 0.16, 0.12, U.mix(P.S, P.s, 0.7));
    g.ell(8, 8.85, 0.42, 0.16, U.mix(P.s, '#8a3a3a', 0.45));
    if (st.beard) g.poly([[5.4, 7.4], [10.6, 7.4], [10, 9.6], [8, 10.6], [6, 9.6]], ['#b8b8c0', '#e8e8ee', '#ffffff']);
  }
  // --- couvre-chefs ---
  if (st.hat === 'straw') { const S = ['#a88830', '#e8c860', '#fff0a0']; g.ell(side ? 8 : 8, 3.1, 6.6, 1.5, S); g.ell(side ? 7.8 : 8, 2, 3.6, 1.8, S); g.rect(side ? 4.4 : 4.6, 2.4, side ? 6.8 : 6.8, 0.6, sh('#c83a3a')); }
  if (st.hat === 'cap') { g.ell(8, 2.6, 4.6, 2.2, sh(P.L)); if (!back) g.ell(side ? 11.6 : 8, side ? 3.6 : 4.2, side ? 2 : 3.4, 0.7, sh(U.mix(P.L, '#000', 0.2))); }
  if (st.hat === 'helm' || st.hat === 'miner') {
    g.ell(8, 4, 5, 3.8, steel); g.rect(3, 4.6, 10, 0.9, ['#5a6070', '#8a92a2', '#c8d0e0']);
    if (!back && !side && st.hat === 'helm') g.rect(7.6, 4.6, 0.8, 2.4, steel);
    if (st.hat === 'miner' && !back) { g.ell(side ? 11.4 : 8, 3.2, 1, 1, ['#c88a20', '#ffe080', '#ffffff']); }
  }
  if (st.hat === 'hood') { const Hd = sh(P.D); if (back) g.ell(8, 5, 5, 4.6, Hd); else if (side) { g.ell(7.4, 4, 4.6, 3.6, Hd); g.poly([[3.4, 3.6], [8, 2.4], [7.4, 9], [3.8, 9.4]], Hd); } else { g.ell(8, 3.6, 5, 3.4, Hd); g.rect(3, 3.6, 1.4, 5.5, Hd); g.rect(11.6, 3.6, 1.4, 5.5, Hd); } }
  return g;
};
SPR.CHAR_EXTRA = {
  kael: { hair: 'spiky', outfit: 'tunic', scarf: '#c83a2a' },
  lyra: { hair: 'long', outfit: 'robe', ribbon: '#5aa0c8' },
  bran: { hair: 'band', outfit: 'vest' },
};
SPR.NPC_STYLE = {
  v_farmer: { hat: 'straw' }, v_girl: { hair: 'long', outfit: 'robe', ribbon: '#ff8ab0' }, v_guard: { outfit: 'armor', hat: 'helm' },
  dorn: { beard: true, outfit: 'apron' }, mira: { hair: 'long', outfit: 'robe', ribbon: '#ffd0e8' }, pell: { hat: 'cap', outfit: 'vest' },
  lise: { hair: 'long', outfit: 'apron' }, yuna: { hat: 'hood', outfit: 'robe' }, fen: { hat: 'straw', outfit: 'apron' }, grom: { beard: true, hat: 'miner' },
};
SPR.hero = (key, pal, dir, frame, extra) => SPR.get(`h_${key}_${dir}_${frame}`, () => {
  let g = SPR.heroPix(pal, dir === 'left' ? 'right' : dir, frame, extra);
  g.outline('#1a1020').outline('#1a1020').polish(0, 3);
  if (dir === 'left') g = g.mirror();
  return g.toCanvas(2);
});

// ---------------- Armes (haute définition, vue de profil, tournées vers la droite) ----------------
const STEEL = ['#6a7484', '#c3ccd8', '#f6faff'];
SPR.WCOL = {
  brise_braise: { blade: ['#7a2010', '#e0602a', '#ffc070'], hilt: '#3a2418', gem: '#ffcf40', metal: '#4a4048' },
  lame_ressac: { blade: ['#5a7aa0', '#c8e0ff', '#ffffff'], hilt: '#1a2a4a', gem: '#43a8ff', metal: '#c8a040' },
  griffes_zephyr: { blade: STEEL, hilt: '#2a5a3a', gem: '#7dffb0', metal: '#8a9aa0' },
  rempart: { blade: STEEL, hilt: '#5a3a22', gem: '#d8a84a', metal: '#c8a040', shield: ['#5a3a18', '#a87a3a', '#e8c080'] },
  sceptre_solaire: { blade: ['#4a2a12', '#8a5a2e', '#c89458'], hilt: '#5a3418', gem: '#ff7a2a', metal: '#c8a040' },
  calice: { blade: ['#8a6418', '#e8c050', '#fff4b0'], hilt: '#a87a20', gem: '#43a8ff', metal: '#e8c050' },
  arc_celeste: { blade: ['#3a5a2a', '#8ac070', '#d8f8c0'], hilt: '#e8e8e8', gem: '#7dffb0', metal: '#d8e0e8' },
  grimoire: { blade: ['#3a2410', '#6a4420', '#a8784a'], hilt: '#d8a84a', gem: '#c88a3a', metal: '#d8a84a' },
  gantelets: { blade: ['#6a1a0a', '#d8582a', '#ffa868'], hilt: '#3a2a2a', gem: '#ffcf40', metal: '#4a3a3a' },
  trident: { blade: ['#1a5a6a', '#4ab8c8', '#b8f8ff'], hilt: '#2a3a4a', gem: '#43a8ff', metal: '#c8a040' },
  lance_dragon: { blade: ['#1a5a3a', '#5ac08a', '#d0ffe0'], hilt: '#3a2a20', gem: '#7dffb0', metal: '#c8a040' },
  hache: { blade: ['#4a4a54', '#9a9aa8', '#e8e8f0'], hilt: '#6a4420', gem: '#a8d8ff', metal: '#6a5a4a' },
};
// couleur d'accent de la tenue selon l'emplacement élémentaire de l'arme
SPR.SLOT_TINT = { feu: '#d8402a', eau: '#3a8ad8', vent: '#3aa868', terre: '#c89a3a' };
const WP = {
  at(x, y, a, t, o = 0) { const c = Math.cos(a), s = Math.sin(a); return [x + c * t - s * o, y + s * t + c * o]; },
  // lame : largeur w, pointe (fraction), courbure, effilement ; renvoie les bords
  blade(g, x, y, a, len, w, cols, o = {}) {
    const tip = o.tip || 0.22, cv = o.curve || 0, tp = o.taper || 0, N = 30, L = [], R = [], M = [];
    const C = t => WP.at(x, y, a, t * len, -cv * t * t * len);
    for (let i = 0; i <= N; i++) {
      const t = i / N, [px, py] = C(t), [qx, qy] = C(Math.min(1, t + 0.02)), [rx, ry] = C(Math.max(0, t - 0.02)), dl = Math.hypot(qx - rx, qy - ry) || 1;
      const nx = -(qy - ry) / dl, ny = (qx - rx) / dl, base = w / 2 * (1 - tp * t);
      const wd = t < 1 - tip ? base : base * Math.pow((1 - t) / tip, o.round ? 0.5 : 1);
      L.push([px + nx * wd, py + ny * wd]); R.push([px - nx * wd * (o.back == null ? 1 : o.back), py - ny * wd * (o.back == null ? 1 : o.back)]); M.push([px, py]);
    }
    g.poly(L.concat(R.slice().reverse()), cols);
    if (o.fuller !== false) g.stroke(M.slice(1, Math.round(N * (1 - tip) * 0.85)), w * 0.13, w * 0.08, U.mix(cols[0], cols[1], 0.45));
    g.stroke(L.slice(0, N), 0.07, 0.05, U.mix(cols[2], '#ffffff', 0.5));
    g.stroke(R.slice(0, N), 0.06, 0.04, U.mix(cols[0], '#000000', 0.2));
    g.stroke(M.slice(2, Math.round(N * 0.5)).map(([px, py], i) => [px + (L[i + 2][0] - px) * 0.45, py + (L[i + 2][1] - py) * 0.45]), 0.05, 0.03, '#ffffff');
    return { L, R, M };
  },
  grip(g, x, y, a, len, col, r = 0.32) {
    g.stroke([WP.at(x, y, a, 0), WP.at(x, y, a, -len)], r, r, MON.sh(col, 0.5, 0.35));
    for (let t = 0.2; t < len - 0.1; t += 0.42) g.stroke([WP.at(x, y, a, -t, -r * 0.9), WP.at(x, y, a, -t - 0.28, r * 0.9)], 0.06, 0.06, MON.dk(col, 0.45));
  },
  guard(g, x, y, a, half, col, r = 0.3) {
    const c = MON.sh(col, 0.5, 0.5);
    g.stroke([WP.at(x, y, a, 0, -half), WP.at(x, y, a, 0.15, 0), WP.at(x, y, a, 0, half)], r, r, c);
    g.ell(...WP.at(x, y, a, 0, -half), r * 1.35, r * 1.35, c); g.ell(...WP.at(x, y, a, 0, half), r * 1.35, r * 1.35, c);
  },
  gem(g, x, y, r, col, glow) {
    if (glow) g.blendEll(x, y, r * 3.2, r * 3.2, col, 0.45 * glow, 1.2);
    g.ell(x, y, r, r, MON.sh(col, 0.5, 0.65)); g._disc(x - r * 0.35, y - r * 0.35, r * 0.3, '#ffffff');
  },
  // gravures dorées (rang 3+), aura (rang 7)
  runes(g, M, col, n = 5) { for (let i = 0; i < n; i++) { const p = M[Math.round(M.length * (0.15 + 0.6 * i / n))]; if (!p) continue; g.inside(t => { t.stroke([[p[0] - 0.25, p[1] + 0.12], [p[0], p[1] - 0.18], [p[0] + 0.25, p[1] + 0.12]], 0.05, 0.05, col); }); } },
  aura(g, M, col) { g.blendEll(0, 0, 0.01, 0.01, col, 0); M.forEach((p, i) => { if (i % 3 === 0) g.blendEll(p[0], p[1], 1.0, 1.0, col, 0.28, 1); }); },
  sparkles(g, pts) { pts.forEach(([x, y, r]) => { g.stroke([[x - r, y], [x + r, y]], 0.07, 0.07, '#ffffff'); g.stroke([[x, y - r], [x, y + r]], 0.07, 0.07, '#ffffff'); g._disc(x, y, 0.12, '#ffffff'); }); },
};
// lame tenue par un monstre (squelette, chevalier) : même rendu que les armes des héros
function blade(g, x, y, a, len, w, cols, hiltLen, hiltCol, guardCol) {
  WP.blade(g, x, y, a, len, w, cols, { tip: 0.18 });
  if (guardCol) WP.guard(g, x, y, a, w * 0.9, guardCol, 0.24);
  WP.grip(g, x, y, a, hiltLen, hiltCol, 0.26);
}
// Dessin de chaque arme : (g, x, y = point de prise principal, a = angle, C = couleurs, T = palier 0..3)
SPR.WDRAW = {
  greatsword(g, x, y, a, C, T) {
    const bx = WP.at(x, y, a, 1.0);
    const b = WP.blade(g, bx[0], bx[1], a, 11, 2.5, MON.sh(C.blade[1], 0.55, 0.5), { tip: 0.16, taper: 0.1 });
    for (let i = 3; i < 22; i += 3) { const [px, py] = b.R[i], [qx, qy] = b.M[i]; g.poly([[px, py], [px + (px - qx) * 0.5 + Math.cos(a) * 0.5, py + (py - qy) * 0.5 + Math.sin(a) * 0.5], [b.R[i + 2][0], b.R[i + 2][1]]], MON.sh(C.blade[1], 0.55, 0.5)); }
    g.inside(t => b.M.slice(2, 22).forEach((p, i) => i % 4 === 0 && t.blendEll(p[0], p[1], 0.8, 0.8, '#ffcf40', 0.35, 1)));
    if (T >= 1) WP.runes(g, b.M, '#ffe080', 4 + T);
    if (T >= 3) WP.aura(g, b.M, '#ff8a2a');
    WP.grip(g, ...WP.at(x, y, a, 0.6), a, 2.6, C.hilt, 0.34);
    WP.guard(g, ...WP.at(x, y, a, 0.9), a, 2.0, C.metal, 0.34);
    WP.gem(g, ...WP.at(x, y, a, 1.05), 0.45, C.gem, T >= 2 ? 1 : 0.4);
    g.ell(...WP.at(x, y, a, -2.3), 0.55, 0.55, MON.sh(C.metal, 0.5, 0.5));
    if (T >= 3) WP.sparkles(g, [WP.at(x, y, a, 11.5, 1.2).concat(0.6), WP.at(x, y, a, 7, -2).concat(0.45)]);
  },
  katana(g, x, y, a, C, T) {
    const bx = WP.at(x, y, a, 0.9);
    const b = WP.blade(g, bx[0], bx[1], a, 10.5, 1.0, MON.sh(C.blade[1], 0.5, 0.6), { tip: 0.1, curve: 0.08, back: 0.6, fuller: false });
    g.stroke(b.M.slice(1, 27).map(([px, py], i) => [px + (b.L[i + 1][0] - px) * (0.35 + 0.15 * Math.sin(i * 1.3)), py + (b.L[i + 1][1] - py) * (0.35 + 0.15 * Math.sin(i * 1.3))]), 0.07, 0.05, '#ffffff');
    if (T >= 1) WP.runes(g, b.M, '#9ad8ff', 3 + T);
    if (T >= 3) WP.aura(g, b.M, '#43a8ff');
    g.ell(...WP.at(x, y, a, 0.95), 0.32, 0.32, MON.sh(C.metal));
    const [tx, ty] = WP.at(x, y, a, 0.7); g.ell(tx, ty, 0.95, 0.95, MON.sh('#2a2a3a', 0.4, 0.5)); g.ell(tx, ty, 0.6, 0.6, MON.sh(C.metal, 0.5, 0.5));
    g.stroke([WP.at(x, y, a, 0.5), WP.at(x, y, a, -2.8)], 0.3, 0.28, MON.sh('#f0f0f0', 0.4, 0.3));
    for (let t = 0.6; t < 2.7; t += 0.45) { g.stroke([WP.at(x, y, a, -t, -0.3), WP.at(x, y, a, -t - 0.22, 0), WP.at(x, y, a, -t, 0.3)], 0.07, 0.07, C.hilt); g.stroke([WP.at(x, y, a, -t - 0.22, -0.3), WP.at(x, y, a, -t, 0), WP.at(x, y, a, -t - 0.22, 0.3)], 0.07, 0.07, C.hilt); }
    g.ell(...WP.at(x, y, a, -2.95), 0.38, 0.34, MON.sh(C.metal));
    g.stroke([WP.at(x, y, a, -2.9), WP.at(x, y, a, -3.6, 0.8), WP.at(x, y, a, -3.4, 1.6)], 0.1, 0.07, C.gem);
    if (T >= 2) WP.gem(g, tx, ty, 0.25, C.gem, 1);
    if (T >= 3) WP.sparkles(g, [WP.at(x, y, a, 10.6, 0).concat(0.55)]);
  },
  dagger(g, x, y, a, C, T) {
    const bx = WP.at(x, y, a, 0.55);
    const b = WP.blade(g, bx[0], bx[1], a, 5.4, 1.35, MON.sh(C.blade[1], 0.55, 0.55), { tip: 0.32, curve: 0.2, back: 0.5, fuller: false });
    if (T >= 3) WP.aura(g, b.M, '#7dffb0');
    WP.guard(g, ...WP.at(x, y, a, 0.5), a, 0.9, C.metal, 0.22);
    WP.grip(g, ...WP.at(x, y, a, 0.45), a, 1.4, C.hilt, 0.24);
    const [rx, ry] = WP.at(x, y, a, -1.25); g.ell(rx, ry, 0.42, 0.42, MON.sh(C.metal)); g.ell(rx, ry, 0.2, 0.2, '#1a1020');
    if (T >= 2) WP.gem(g, ...WP.at(x, y, a, 0.5), 0.2, C.gem, 1);
    g.stroke(b.M.slice(5, 22).map(([px, py], i) => [px + (b.L[i + 5][0] - px) * 0.5, py + (b.L[i + 5][1] - py) * 0.5]), 0.04, 0.03, '#2a5a3a');
  },
  sword(g, x, y, a, C, T) {
    const bx = WP.at(x, y, a, 0.7);
    const b = WP.blade(g, bx[0], bx[1], a, 7.4, 1.35, MON.sh(C.blade[1], 0.55, 0.55), { tip: 0.18 });
    if (T >= 1) WP.runes(g, b.M, '#e8c860', 3 + T);
    if (T >= 3) WP.aura(g, b.M, '#ffd860');
    WP.guard(g, ...WP.at(x, y, a, 0.65), a, 1.3, C.metal, 0.24);
    WP.grip(g, ...WP.at(x, y, a, 0.45), a, 1.6, C.hilt, 0.26);
    g.ell(...WP.at(x, y, a, -1.4), 0.4, 0.4, MON.sh(C.metal));
  },
  shield(g, x, y, C, T) {
    const S = C.shield, pts = [[x - 2.2, y - 2.8], [x + 2.2, y - 2.8], [x + 2.3, y + 0.6], [x, y + 3.4], [x - 2.3, y + 0.6]];
    g.part(t => {
      t.poly(pts, MON.sh(S[1], 0.55, 0.45));
      t.inside(u => { u.poly([[x - 2.2, y - 2.8], [x, y - 2.8], [x, y + 3.4], [x - 2.3, y + 0.6]], MON.sh(MON.dk(S[1], 0.15), 0.55, 0.4)); });
      t.stroke(pts.concat([pts[0]]), 0.26, 0.26, MON.sh(C.metal, 0.5, 0.55));
      t.poly([[x - 1.2, y + 0.9], [x - 0.2, y - 1.0], [x + 0.4, y - 0.1], [x + 0.9, y - 0.8], [x + 1.5, y + 0.9]], MON.sh('#6a4a1a', 0.4, 0.3));
      t.stroke([[x - 0.2, y - 1.0], [x - 0.6, y - 0.3]], 0.07, 0.07, '#fff0c0');
      t.ell(x, y + 1.7, 0.42, 0.42, MON.sh(C.metal));
      [[x - 1.7, y - 2.3], [x + 1.7, y - 2.3], [x - 1.8, y + 0.4], [x + 1.8, y + 0.4]].forEach(([px, py]) => t._disc(px, py, 0.16, '#fff0c0'));
    });
    MON.spec(g, x - 1, y - 1.6, 1.2, 0.9, 0.35);
    if (T >= 2) WP.gem(g, x, y + 1.7, 0.36, C.gem, 1);
    if (T >= 3) { g.blendEll(x, y, 2.6, 3.2, '#ffe080', 0.25, 1); WP.sparkles(g, [[x + 2.2, y - 2.6, 0.6]]); }
  },
  staff(g, x, y, a, C, T) {
    const top = WP.at(x, y, a, 10.4), bot = WP.at(x, y, a, -3.8);
    g.stroke([bot, WP.at(x, y, a, 4), top], 0.32, 0.26, MON.sh(C.blade[1], 0.5, 0.4));
    for (let t = -3; t < 9.5; t += 1.6) g.stroke([WP.at(x, y, a, t, -0.26), WP.at(x, y, a, t + 0.5, 0.26)], 0.05, 0.05, MON.dk(C.blade[1], 0.4));
    g.stroke([WP.at(x, y, a, 0.8, -0.35), WP.at(x, y, a, 0.8, 0.35)], 0.16, 0.16, MON.sh(C.metal));
    g.stroke([WP.at(x, y, a, -0.9, -0.35), WP.at(x, y, a, -0.9, 0.35)], 0.16, 0.16, MON.sh(C.metal));
    g.ell(...bot, 0.36, 0.36, MON.sh(C.metal));
    const o = WP.at(x, y, a, 11.4);
    g.blendEll(o[0], o[1], 3.4, 3.4, C.gem, 0.5, 1.2);
    [-1, 1].forEach(s => g.stroke([WP.at(x, y, a, 10, s * 0.3), WP.at(x, y, a, 11, s * 1.25), WP.at(x, y, a, 12.4, s * 0.9), WP.at(x, y, a, 12.9, s * 0.2)], 0.2, 0.08, MON.sh(C.metal, 0.5, 0.5)));
    WP.gem(g, o[0], o[1], 0.95, C.gem, T >= 2 ? 1.2 : 0.7);
    g.ell(o[0] + 0.1, o[1] + 0.1, 0.45, 0.45, '#fff4c0');
    for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283, r0 = 1.2, r1 = T >= 1 ? 2.2 : 1.7; g.stroke([[o[0] + Math.cos(an) * r0, o[1] + Math.sin(an) * r0], [o[0] + Math.cos(an) * r1, o[1] + Math.sin(an) * r1]], 0.07, 0.03, '#ffd060'); }
    if (T >= 3) WP.sparkles(g, [[o[0] + 1.8, o[1] - 1.6, 0.5], [o[0] - 1.6, o[1] + 1.2, 0.4]]);
    const rib = WP.at(x, y, a, 9.6); g.stroke([rib, [rib[0] - 0.6, rib[1] + 1.4], [rib[0] - 0.2, rib[1] + 2.6]], 0.16, 0.08, MON.sh('#c83a2a', 0.5, 0.4));
  },
  chalice(g, x0, y0, C, T, glow) {
    const k = 1.4, X = v => x0 + v * k, Y = v => y0 + v * k, x = 0, y = 0;
    const G2 = MON.sh(C.blade[1], 0.55, 0.6);
    g.part(t => {
      t.ell(X(0), Y(0.3), 1.2 * k, 0.35 * k, G2);
      t.stroke([[X(0), Y(0.2)], [X(0), Y(-1.2)]], 0.24 * k, 0.2 * k, G2); t.ell(X(0), Y(-0.6), 0.38 * k, 0.3 * k, G2);
      t.poly([[X(-1.7), Y(-3.4)], [X(1.7), Y(-3.4)], [X(1.3), Y(-2.2)], [X(0.6), Y(-1.4)], [X(-0.6), Y(-1.4)], [X(-1.3), Y(-2.2)]], G2);
      t.ell(X(0), Y(-3.4), 1.7 * k, 0.42 * k, MON.sh(C.metal, 0.5, 0.6));
      t.ell(X(0), Y(-3.4), 1.4 * k, 0.3 * k, MON.sh(C.gem, 0.4, 0.6));
    });
    g.stroke([[X(-1.4), Y(-2.8)], [X(1.4), Y(-2.8)]], 0.06, 0.06, '#fff4b0');
    WP.gem(g, X(0), Y(-2.4), 0.42, C.gem, T >= 2 ? 1 : 0.5);
    if (T >= 1) [[X(-0.9), Y(-2.5)], [X(0.9), Y(-2.5)]].forEach(([px, py]) => g._disc(px, py, 0.14, '#fff4b0'));
    g.blendEll(X(0), Y(-3.6), 3.2, 2.4, C.gem, 0.3 + (glow ? 0.25 : 0), 1);
    if (glow) { [[X(-0.6), Y(-4.6), 0.32], [X(0.4), Y(-5.4), 0.42], [X(0.9), Y(-4.4), 0.24]].forEach(([px, py, r]) => g.ell(px, py, r * k, r * k * 1.2, MON.sh('#7ac8ff', 0.3, 0.7))); }
    if (T >= 3) WP.sparkles(g, [[X(1.8), Y(-4.6), 0.5]]);
  },
  bow(g, x, y, C, T, draw, hx, hy) {
    const lim = MON.sh(C.blade[1], 0.5, 0.45), top = [x - 0.6, y - 6.2], bot = [x - 0.6, y + 6.2];
    g.stroke([[x - 0.2, y - 0.9], [x + 0.6, y - 3.2], [x + 0.4, y - 5.4], top, [x - 1.1, y - 6.6]], 0.36, 0.14, lim);
    g.stroke([[x - 0.2, y + 0.9], [x + 0.6, y + 3.2], [x + 0.4, y + 5.4], bot, [x - 1.1, y + 6.6]], 0.36, 0.14, lim);
    g.stroke([[x - 0.15, y - 1.1], [x - 0.15, y + 1.1]], 0.42, 0.42, MON.sh(C.hilt, 0.4, 0.3));
    [[x + 0.55, y - 3.4], [x + 0.55, y + 3.4]].forEach(([px, py]) => g._disc(px, py, 0.2, T >= 2 ? '#d8fff0' : '#c8a040'));
    if (T >= 2) WP.gem(g, x + 0.05, y, 0.28, C.gem, 1);
    const sx = draw ? hx : x - 1.6, sy = draw ? hy : y;
    g.stroke([top, [sx, sy]], 0.05, 0.05, '#f4f4f4'); g.stroke([[sx, sy], bot], 0.05, 0.05, '#f4f4f4');
    const ax = sx, ay = sy, tipx = x + 2.4;
    g.stroke([[ax, ay], [tipx, ay]], 0.1, 0.1, MON.sh('#c8a070'));
    g.poly([[tipx - 0.1, ay - 0.42], [tipx + 1.0, ay], [tipx - 0.1, ay + 0.42]], MON.sh('#c8d0dc', 0.5, 0.6));
    [-1, 1].forEach(s => g.poly([[ax + 0.2, ay], [ax + 1.4, ay], [ax + 1.0, ay + s * 0.55], [ax - 0.1, ay + s * 0.6]], MON.sh(C.gem, 0.45, 0.4)));
    if (T >= 3) { g.blendEll(tipx, ay, 1.4, 1.4, C.gem, 0.5, 1); WP.sparkles(g, [[tipx + 1.4, ay - 1, 0.5]]); }
  },
  tome(g, x, y, C, T, open) {
    const cov = MON.sh(C.blade[1], 0.5, 0.4), gold = MON.sh(C.metal, 0.5, 0.55), page = ['#c8b890', '#f4ead0', '#fffaf0'];
    if (!open) {
      g.part(t => {
        t.poly([[x - 1.6, y - 2.2], [x + 1.6, y - 2.2], [x + 1.6, y + 2.2], [x - 1.6, y + 2.2]], cov);
        t.poly([[x + 1.6, y - 2.0], [x + 2.1, y - 1.8], [x + 2.1, y + 2.4], [x + 1.6, y + 2.2]], page);
        for (let i = 0; i < 4; i++) t.stroke([[x + 1.7, y - 1.4 + i * 1.0], [x + 2.0, y - 1.3 + i * 1.0]], 0.03, 0.03, '#b8a880');
        [[x - 1.6, y - 2.2], [x + 1.6, y - 2.2], [x - 1.6, y + 2.2], [x + 1.6, y + 2.2]].forEach(([px, py]) => t.ell(px, py, 0.45, 0.45, gold));
        t.stroke([[x - 1.5, y - 1.6], [x - 1.5, y + 1.6]], 0.14, 0.14, gold);
      });
      g.stroke([[x - 0.8, y - 1.5], [x + 1.1, y - 1.5], [x + 1.1, y + 1.5], [x - 0.8, y + 1.5], [x - 0.8, y - 1.5]], 0.06, 0.06, '#e8c060');
      WP.gem(g, x + 0.15, y, 0.5, C.gem, T >= 2 ? 1 : 0.3);
      return;
    }
    g.blendEll(x, y, 4, 3.2, C.gem, 0.0);
    g.part(t => {
      t.poly([[x - 2.8, y - 1.4], [x, y - 0.9], [x + 2.8, y - 1.4], [x + 3.0, y + 1.0], [x, y + 1.4], [x - 3.0, y + 1.0]], cov);
      t.poly([[x - 2.6, y - 1.7], [x - 0.1, y - 1.1], [x - 0.1, y + 1.0], [x - 2.7, y + 0.6]], page);
      t.poly([[x + 0.1, y - 1.1], [x + 2.6, y - 1.7], [x + 2.7, y + 0.6], [x + 0.1, y + 1.0]], page);
    });
    for (let i = 0; i < 4; i++) { g.stroke([[x - 2.2, y - 1.0 + i * 0.42], [x - 0.5, y - 0.7 + i * 0.42]], 0.035, 0.035, '#8a7a5a'); g.stroke([[x + 0.5, y - 0.7 + i * 0.42], [x + 2.2, y - 1.0 + i * 0.42]], 0.035, 0.035, '#8a7a5a'); }
    const o = [x, y - 3.4];
    g.blendEll(o[0], o[1], 3, 2.4, C.gem, 0.4, 1);
    [[0, -1.6], [1.6, 0], [0, 1.6], [-1.6, 0]].forEach(([dx, dy], i) => { const px = o[0] + dx, py = o[1] + dy * 0.6; g.stroke([[px - 0.35, py], [px, py - 0.4], [px + 0.35, py], [px, py + 0.4], [px - 0.35, py]], 0.07, 0.07, i % 2 ? '#ffe080' : '#fff4c0'); });
    WP.gem(g, o[0], o[1], 0.7, C.gem, 1);
    if (T >= 3) WP.sparkles(g, [[o[0] + 2.4, o[1] - 0.8, 0.5]]);
  },
  gauntlet(g, x, y, C, T, a = 0) {
    const k = 1.45, at = (t, o = 0) => WP.at(x, y, a, t * k, o * k);
    const P = MON.sh(C.blade[1], 0.55, 0.5), M = MON.sh(C.metal, 0.5, 0.45);
    g.part(t => {
      t.stroke([at(-0.5), at(-2.0)], 0.78 * k, 0.72 * k, M);
      t.ell(...at(-1.0), 0.9 * k, 0.9 * k, P);
      t.blob([[x, y, 1.15 * k, 1.0 * k], [...at(0.5), 0.85 * k, 0.85 * k]], P, x, y, 1.4 * k, 1.3 * k);
    });
    g.stroke([at(-0.8, -0.85), at(-0.8, 0.85)], 0.13, 0.13, MON.dk(C.blade[1], 0.45));
    [-0.55, 0, 0.55].forEach(o => { const [px, py] = at(0.9, o); g.ell(px, py, 0.3 * k, 0.3 * k, M); g.poly([[px - 0.15, py - 0.1], [px + 0.7 * k * Math.cos(a), py + 0.7 * k * Math.sin(a) - 0.05], [px + 0.15, py + 0.12]], ['#8a7a5a', '#e8dcc0', '#fffbee']); });
    WP.gem(g, ...at(-0.2, -0.45), 0.4, C.gem, T >= 2 ? 1 : 0.4);
    g.blendEll(x, y, 2.6, 2.6, '#ffcf40', T >= 3 ? 0.4 : 0.2, 1);
    if (T >= 1) g.stroke([at(-1.6, -0.6), at(-1.6, 0.6)], 0.1, 0.1, '#e8c860');
  },
  trident(g, x, y, a, C, T) {
    const shaft = MON.sh(C.hilt, 0.45, 0.4), H = MON.sh(C.blade[1], 0.5, 0.6);
    g.stroke([WP.at(x, y, a, -5), WP.at(x, y, a, 10.4)], 0.26, 0.26, shaft);
    for (let t = -4.5; t < 9; t += 2.2) g.stroke([WP.at(x, y, a, t, -0.26), WP.at(x, y, a, t + 0.4, 0.26)], 0.07, 0.07, MON.dk(C.hilt, 0.4));
    g.ell(...WP.at(x, y, a, -5.1), 0.36, 0.36, MON.sh(C.metal));
    g.part(t => {
      t.stroke([WP.at(x, y, a, 10.2, -1.4), WP.at(x, y, a, 10.8, 0), WP.at(x, y, a, 10.2, 1.4)], 0.3, 0.3, H);
      WP.blade(t, ...WP.at(x, y, a, 10.6), a, 4.2, 0.7, H, { tip: 0.35, fuller: false });
      [-1, 1].forEach(s => { const b = WP.at(x, y, a, 10.2, s * 1.4); WP.blade(t, b[0], b[1], a - s * 0.06, 3, 0.55, H, { tip: 0.45, fuller: false, curve: s * 0.08 }); t.poly([WP.at(x, y, a, 12, s * 1.55), WP.at(x, y, a, 11.4, s * 2.1), WP.at(x, y, a, 12.4, s * 1.6)], H); });
    });
    WP.gem(g, ...WP.at(x, y, a, 10.5), 0.42, C.gem, T >= 2 ? 1 : 0.4);
    if (T >= 1) g.stroke([WP.at(x, y, a, 9.6, -0.4), WP.at(x, y, a, 9.6, 0.4)], 0.14, 0.14, MON.sh(C.metal));
    if (T >= 3) { g.blendEll(...WP.at(x, y, a, 12.5), 2.6, 2.6, '#7ae0ff', 0.35, 1); WP.sparkles(g, [WP.at(x, y, a, 14.4, 1).concat(0.5)]); }
  },
  lance(g, x, y, a, C, T) {
    const shaft = MON.sh('#6a4a30', 0.45, 0.4), H = MON.sh(C.blade[1], 0.55, 0.55);
    g.stroke([WP.at(x, y, a, -5.2), WP.at(x, y, a, 9.2)], 0.28, 0.24, shaft);
    for (let t = -4.6; t < 8.6; t += 0.9) g.stroke([WP.at(x, y, a, t, -0.27), WP.at(x, y, a, t + 0.45, 0.27)], 0.08, 0.08, '#2a7a4a');
    g.ell(...WP.at(x, y, a, -5.3), 0.36, 0.36, MON.sh(C.metal));
    const b = WP.blade(g, ...WP.at(x, y, a, 9.4), a, 5, 1.7, H, { tip: 0.5, round: true });
    if (T >= 1) WP.runes(g, b.M, '#e8ffe0', 2 + T);
    g.part(t => [-1, 1].forEach(s => t.poly([WP.at(x, y, a, 9.6, s * 0.3), WP.at(x, y, a, 8.6, s * 2.0), WP.at(x, y, a, 9.3, s * 1.4), WP.at(x, y, a, 8.4, s * 1.2), WP.at(x, y, a, 9.2, s * 0.6)], MON.sh(C.metal, 0.5, 0.5))));
    WP.gem(g, ...WP.at(x, y, a, 9.3), 0.4, C.gem, T >= 2 ? 1 : 0.4);
    const f = WP.at(x, y, a, 8.2); g.part(t => t.poly([f, [f[0] - 2.2, f[1] + 0.5], [f[0] - 3.4, f[1] + 1.4], [f[0] - 2.4, f[1] + 1.6], [f[0] - 1.2, f[1] + 1.9], ...[WP.at(x, y, a, 6.6)]], MON.sh('#3aa868', 0.5, 0.4)));
    if (T >= 3) { WP.aura(g, b.M, '#7dffb0'); WP.sparkles(g, [WP.at(x, y, a, 14.6, 0.8).concat(0.5)]); }
  },
  axe(g, x, y, a, C, T) {
    const haft = MON.sh('#7a5030', 0.45, 0.4), H = MON.sh(C.blade[1], 0.55, 0.55);
    g.stroke([WP.at(x, y, a, -2.4), WP.at(x, y, a, 9.6)], 0.32, 0.28, haft);
    for (let t = -2; t < 1.2; t += 0.42) g.stroke([WP.at(x, y, a, t, -0.32), WP.at(x, y, a, t + 0.26, 0.32)], 0.07, 0.07, '#3a2010');
    g.ell(...WP.at(x, y, a, -2.5), 0.42, 0.42, MON.sh(C.metal));
    const head = [WP.at(x, y, a, 7.2, -0.3), WP.at(x, y, a, 6.2, -2.6), WP.at(x, y, a, 7.6, -3.6), WP.at(x, y, a, 9.6, -3.9), WP.at(x, y, a, 11, -3.2), WP.at(x, y, a, 9.6, -0.3)];
    g.part(t => {
      t.poly(head, H);
      t.poly([WP.at(x, y, a, 7.4, 0.3), WP.at(x, y, a, 8.4, 2.2), WP.at(x, y, a, 9.2, 0.3)], H);
      t.stroke([WP.at(x, y, a, 7, 0), WP.at(x, y, a, 9.8, 0)], 0.4, 0.4, MON.sh(C.metal, 0.5, 0.45));
    });
    g.stroke([WP.at(x, y, a, 6.4, -2.7), WP.at(x, y, a, 7.7, -3.55), WP.at(x, y, a, 9.6, -3.85), WP.at(x, y, a, 10.9, -3.2)], 0.12, 0.08, '#ffffff');
    g.inside(t => t.stroke([WP.at(x, y, a, 7.6, -0.6), WP.at(x, y, a, 8.6, -2.6), WP.at(x, y, a, 9.6, -0.6)], 0.06, 0.06, MON.dk(C.blade[1], 0.4)));
    if (T >= 1) WP.runes(g, [WP.at(x, y, a, 8, -1.4), WP.at(x, y, a, 8.8, -2.2), WP.at(x, y, a, 9.6, -1.6)], '#e8c860', 3);
    if (T >= 2) WP.gem(g, ...WP.at(x, y, a, 8.4, 0), 0.32, C.gem, 1);
    if (T >= 3) { g.blendEll(...WP.at(x, y, a, 8.6, -2.2), 3, 3, '#ffe080', 0.3, 1); WP.sparkles(g, [WP.at(x, y, a, 11.4, -4.2).concat(0.55)]); }
  },
};
// main : poing refermé sur la prise (doigts perpendiculaires à la prise)
WP.hand = (g, x, y, a, skin, open) => {
  g.ell(x, y, 0.72, 0.68, skin);
  if (open) { [-0.5, 0, 0.5].forEach(o => g.stroke([WP.at(x, y, a, 0.3, o * 0.8), WP.at(x, y, a, 1.0, o)], 0.2, 0.16, skin)); return; }
  [-0.32, 0, 0.32].forEach(o => g.stroke([WP.at(x, y, a, o - 0.05, -0.5), WP.at(x, y, a, o, 0.45)], 0.035, 0.035, U.mix(skin[0], '#5a2a2a', 0.35)));
};
// bras articulé (épaule -> coude -> main), coude plié vers l'arrière/le bas
WP.arm = (g, sx, sy, hx, hy, L, sleeve, skin, band, robe) => {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
  if (d > 2 * L * 0.995) { const f = 2 * L * 0.995 / d; hx = sx + dx * f; hy = sy + dy * f; dx *= f; dy *= f; d = 2 * L * 0.995; }
  const h = Math.sqrt(Math.max(0, L * L - d * d / 4)), mx = (sx + hx) / 2, my = (sy + hy) / 2, ex = mx + (dy / d) * h * 0.9 - 0.15, ey = my - (dx / d) * h * 0.9 + 0.1;
  const ex2 = ex, ey2 = Math.max(ey, Math.min(sy, hy));
  g.stroke([[sx, sy], [ex2, ey2]], robe ? 1.05 : 0.9, robe ? 0.9 : 0.78, sleeve);
  g.stroke([[ex2, ey2], [hx, hy]], robe ? 0.9 : 0.78, robe ? 0.8 : 0.62, sleeve);
  if (robe) { const ux = (hx - ex2), uy = (hy - ey2), ul = Math.hypot(ux, uy) || 1; g.ell(hx - ux / ul * 0.6, hy - uy / ul * 0.6, 0.95, 0.95, sleeve); }
  if (band) { const ux = (hx - ex2), uy = (hy - ey2), ul = Math.hypot(ux, uy) || 1; g.stroke([[hx - ux / ul * 1.0, hy - uy / ul * 1.0], [hx - ux / ul * 0.45, hy - uy / ul * 0.45]], 0.72, 0.68, band); }
  return [hx, hy];
};
// poses : main avant (H1), main arrière (H2), angle de l'arme ; coordonnées du sprite 32 x 28
SPR.POSE = {
  greatsword: { idle: { a: -0.8, H1: [19.4, 22.8], back2: 1.2 }, atk: { a: -0.22, H1: [20.4, 21.6], back2: 1.2 } },
  katana: { idle: { a: -1.0, H1: [19.2, 22.6], back2: 1.1 }, atk: { a: 0.05, H1: [20.5, 21.5], back2: 1.1 } },
  daggers: { idle: { a: 1.75, H1: [19.6, 22.4], H2: [18.2, 21.2], a2: 2.35 }, atk: { a: 0.12, H1: [20.6, 21.2], H2: [17.8, 22.8], a2: 1.9 } },
  swordshield: { idle: { a: -1.35, H2: [18.4, 20.6], H1: [19.2, 22.8] }, atk: { a: -0.06, H2: [20.4, 21.2], H1: [18.8, 23] } },
  staff: { idle: { a: -1.42, H1: [19.6, 22.4], H2: [17.8, 23.4], open2: true }, atk: { a: -0.55, H1: [20.2, 21.8], back2: 2.0 } },
  chalice: { idle: { H1: [19.4, 22], H2: [18.6, 23.2], open2: true }, atk: { H1: [19.4, 19.4], H2: [18.4, 20.8], open2: true } },
  bow: { idle: { H1: [20.6, 21.6], H2: [18.7, 21.6] }, atk: { H1: [20.8, 21.4], H2: [16.6, 21.3] } },
  tome: { idle: { H1: [19.4, 22.8], H2: [17.8, 23.3], open2: true }, atk: { H1: [20.4, 21.2], H2: [18.8, 21.9], open1: true, open2: true } },
  fists: { idle: { H1: [19.7, 21.4], H2: [18.7, 22.4] }, atk: { H1: [20.6, 20.9], H2: [17.4, 22.8] } },
  trident: { idle: { a: -0.85, H1: [19.4, 22.6], back2: 1.8 }, atk: { a: -0.08, H1: [20.4, 21.6], back2: 2.0 } },
  lance: { idle: { a: -1.25, H1: [19.4, 22.4], back2: 1.9 }, atk: { a: -0.06, H1: [20.4, 21.5], back2: 2.0 } },
  axe: { idle: { a: -1.0, H1: [19.2, 22.8], back2: 1.5 }, atk: { a: 0.42, H1: [20.2, 21.6], back2: 1.5 } },
};
SPR.weaponTier = (cid, wid) => {
  if (!G.S || !G.S.chars || !G.S.chars[cid]) return 1;
  const w = G.S.chars[cid].weapons[G.WEAPONS[wid].slot]; return (w && w.tier) || 1;
};
// Sprite de combat (32 x 28 unités) : héros sans bras + bras articulés tenant l'arme, regard vers la gauche
SPR.battler = (cid, wid, pose, tierArg) => {
  const tier = tierArg || SPR.weaponTier(cid, wid), T = tier >= 7 ? 3 : tier >= 5 ? 2 : tier >= 3 ? 1 : 0;
  return SPR.get(`b_${cid}_${wid}_${pose}_${T}`, () => {
    const d = G.CHARS[cid], W = G.WEAPONS[wid], C = SPR.WCOL[wid], kind = W.kind, atk = pose === 'atk';
    const tint = SPR.SLOT_TINT[W.slot] || '#c8a040';
    const ex = Object.assign({}, SPR.CHAR_EXTRA[cid], { noArms: true });
    const pal = Object.assign({}, d.pal);
    if (ex.scarf) ex.scarf = tint; if (ex.ribbon) ex.ribbon = tint; if (ex.hair === 'band') pal.L = tint;
    const K = 16, g = new G.Pix(32, 28, K); g.smooth = true;
    const P = SPR.fullPal(pal), sh = c => [U.mix(c, '#120a20', 0.42), c, U.mix(c, '#ffffff', 0.35)];
    const skin = [U.mix(P.S, P.s, 0.7), P.S, U.mix(P.S, '#ffffff', 0.35)], vest = ex.outfit === 'vest', robe = ex.outfit === 'robe';
    const sleeve = vest ? skin : sh(P.C), sleeveB = sleeve.map(c => U.mix(c, '#120a20', 0.25)), skinB = skin.map(c => U.mix(c, '#120a20', 0.2));
    const band = vest ? sh(P.L) : null;
    const pz = SPR.POSE[kind][atk ? 'atk' : 'idle'], a = pz.a || 0, ca = Math.cos(a), sa = Math.sin(a);
    const H1 = pz.H1, H2 = pz.H2 || (pz.back2 ? [H1[0] - ca * pz.back2, H1[1] - sa * pz.back2] : H1);
    const FS = [16.6, 20.3], BS = [15.0, 20.3];
    const hero = SPR.heroPix(pal, 'right', atk ? 1 : 0, ex, K);
    // 1. armes portées derrière le corps
    if (kind === 'staff' && !atk) SPR.WDRAW.staff(g, H1[0], H1[1], a, C, T);
    // 2. bras arrière
    const h2 = WP.arm(g, BS[0], BS[1], H2[0], H2[1], 2.45, sleeveB, skinB, band && band.map(c => U.mix(c, '#120a20', 0.25)), robe);
    if (kind === 'fists') SPR.WDRAW.gauntlet(g, h2[0], h2[1], C, T, atk ? 0.4 : 0.2);
    else if (kind === 'daggers') { SPR.WDRAW.dagger(g, h2[0], h2[1], pz.a2, C, T); WP.hand(g, h2[0], h2[1], pz.a2, skinB); }
    else WP.hand(g, h2[0], h2[1], a, skinB, pz.open2);
    // 3. corps
    for (let y = 0; y < hero.h; y++) for (let x = 0; x < hero.w; x++) { const c = hero.get(x, y); if (c) g._s(x + 8 * K, y + 11 * K, c); }
    // 4. arme principale
    switch (kind) {
      case 'greatsword': case 'katana': case 'trident': case 'lance': case 'axe': SPR.WDRAW[kind](g, H1[0], H1[1], a, C, T); break;
      case 'staff': if (atk) SPR.WDRAW.staff(g, H1[0], H1[1], a, C, T); break;
      case 'daggers': SPR.WDRAW.dagger(g, H1[0], H1[1], a, C, T); break;
      case 'swordshield': SPR.WDRAW.sword(g, h2[0], h2[1], a, C, T); WP.hand(g, h2[0], h2[1], a, skinB); break;
      case 'chalice': SPR.WDRAW.chalice(g, H1[0], H1[1] - 0.3, C, T, atk); break;
      case 'bow': SPR.WDRAW.bow(g, H1[0], H1[1], C, T, atk, H2[0], H2[1]); break;
      case 'tome': if (atk) SPR.WDRAW.tome(g, 21.6, 18.6, C, T, true); break;
    }
    // 5. bras avant et main refermée sur la prise
    const h1 = WP.arm(g, FS[0], FS[1], H1[0], H1[1], 2.0, sleeve, skin, band, robe);
    if (kind === 'fists') SPR.WDRAW.gauntlet(g, h1[0], h1[1], C, T, atk ? -0.1 : 0.15);
    else if (kind === 'tome' && !atk) { SPR.WDRAW.tome(g, h1[0] + 0.4, h1[1] - 0.6, C, T, false); WP.hand(g, h1[0], h1[1] + 0.9, -1.57, skin); }
    else if (kind === 'bow') WP.hand(g, h1[0], h1[1], -1.57, skin);
    else if (kind === 'chalice') WP.hand(g, h1[0], h1[1], -1.57, skin);
    else WP.hand(g, h1[0], h1[1], kind === 'swordshield' ? -1.57 : a, skin, pz.open1);
    if (kind === 'swordshield') SPR.WDRAW.shield(g, h1[0] + 0.6, h1[1] - 0.6, C, T);
    if (kind === 'bow') WP.hand(g, h2[0], h2[1], 0, skin);
    g.outline('#1a1020').outline('#1a1020').outline('#1a1020').polish(0, 5);
    return g.mirror().toCanvas(2);
  });
};


// ---------------- Monstres ----------------
const EYE = '#ffffff', PUP = '#14101c';
// Outils de dessin des créatures (haute définition, 16 px par unité, rendu lisse puis sur-échantillonné)
const MON = {
  sh: (c, d = 0.5, l = 0.42) => [U.mix(c, '#1a0f2a', d), c, U.mix(c, '#fff8e8', l)],
  dk: (c, t = 0.35) => U.mix(c, '#140a1e', t),
  lt: (c, t = 0.35) => U.mix(c, '#fff8e8', t),
  IVORY: ['#9a8a6a', '#eee4cc', '#fffbee'],
  HORN: ['#2a1a14', '#6a5040', '#c8b498'],
  on(g, x, y) { return !!g.get(Math.floor(x * g.k), Math.floor(y * g.k)); },
  // œil : sclère, iris dégradé, pupille (ronde, fendue ou horizontale), deux reflets, paupière ; ou œil luisant
  eye(g, x, y, r, iris, o = {}) {
    const ry = r * (o.ry || 1.1), ix = x + (o.look == null ? 0.2 : o.look) * r;
    if (o.glow) {
      g.blendEll(x, y, r * 2.6, ry * 2.4, iris, 0.55, 1.4);
      g.ell(x, y, r, ry, MON.sh(iris, 0.35, 0.6));
      g.ell(x + r * 0.08, y + ry * 0.05, r * 0.5, ry * 0.5, MON.lt(iris, 0.8));
      if (o.slit) g.ell(x + r * 0.08, y, r * 0.14, ry * 0.7, PUP);
      g._disc(x - r * 0.3, y - ry * 0.34, r * 0.2, '#ffffff');
      return;
    }
    g.ell(x, y, r, ry, ['#8a7e98', '#ece6f0', '#ffffff']);
    g.ell(ix, y + r * 0.04, r * 0.74, ry * 0.8, MON.sh(iris, 0.62, 0.5));
    if (o.slit) g.ell(ix, y, r * 0.15, ry * 0.68, PUP);
    else if (o.flat) g.ell(ix, y + r * 0.05, r * 0.55, ry * 0.2, PUP);
    else g.ell(ix, y + r * 0.04, r * 0.38, ry * 0.44, PUP);
    g._disc(ix - r * 0.28, y - ry * 0.34, r * 0.22, '#ffffff');
    g._disc(ix + r * 0.26, y + ry * 0.3, r * 0.1, '#e8f0ff');
    if (o.lid) g.stroke([[x - r * 1.1, y - ry * 0.05], [x - r * 0.4, y - ry * 0.85], [x + r * 0.5, y - ry * 1.0], [x + r * 1.15, y - ry * 0.5]], r * 0.2, r * 0.1, o.lid);
  },
  // poils / plumes : petits traits orientés, seulement sur le corps
  fur(g, cx, cy, rx, ry, c, seed, n, len, ang, w = 0.08) {
    for (let i = 0; i < n; i++) {
      const a0 = U.hash(i, seed, 11) * 6.283, rr = Math.sqrt(U.hash(seed, i, 12)), x = cx + Math.cos(a0) * rx * rr, y = cy + Math.sin(a0) * ry * rr;
      const a = ang + (U.hash(i, i + 3, seed) - 0.5) * 0.7, L = len * (0.6 + U.hash(i + 7, seed, 3) * 0.6), ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
      if (!MON.on(g, x, y) || !MON.on(g, ex, ey)) continue;
      g.stroke([[x, y], [x + Math.cos(a + 0.25) * L * 0.5, y + Math.sin(a + 0.25) * L * 0.5], [ex, ey]], w, w * 0.35, c);
    }
  },
  // écailles en arcs
  scales(g, x0, y0, x1, y1, r, c, w = 0.06) {
    for (let y = y0, row = 0; y <= y1; y += r * 1.05, row++) for (let x = x0 + (row % 2) * r; x <= x1; x += r * 2) {
      if (!MON.on(g, x - r, y - r * 0.5) || !MON.on(g, x + r, y - r * 0.5) || !MON.on(g, x, y + r * 0.5)) continue;
      const pts = []; for (let a = 0.2; a <= Math.PI - 0.2; a += 0.25) pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.75 - r * 0.4]);
      g.stroke(pts, w, w, c);
    }
  },
  speckle(g, x0, y0, x1, y1, n, cols, seed, r0 = 0.12, r1 = 0.3) {
    for (let i = 0; i < n; i++) { const x = x0 + U.hash(i, seed, 21) * (x1 - x0), y = y0 + U.hash(seed, i, 22) * (y1 - y0); if (MON.on(g, x, y)) g._disc(x, y, r0 + U.hash(i, i, seed) * (r1 - r0), cols[i % cols.length]); }
  },
  tooth(g, x, y, w, h, up) { g.poly(up ? [[x - w / 2, y], [x + w * 0.1, y - h], [x + w / 2, y]] : [[x - w / 2, y], [x + w / 2, y], [x + w * 0.1, y + h]], MON.IVORY); },
  claw(g, x, y, len, ang, c) { g.stroke([[x, y], [x + Math.cos(ang) * len * 0.6, y + Math.sin(ang) * len * 0.6], [x + Math.cos(ang + 0.5) * len, y + Math.sin(ang + 0.5) * len]], len * 0.24, 0.03, c || '#e8dcc0'); },
  tint(g, pts, r, c, a = 0.4) { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (r * 0.4)); for (let q = 0; q <= n; q++) g.blendEll(x0 + (x1 - x0) * q / n, y0 + (y1 - y0) * q / n, r, r, c, a / 3, 1); } },
  spec(g, x, y, rx, ry, a = 0.7) { g.blendEll(x, y, rx, ry, '#ffffff', a, 0.8); },
  shade(g, x, y, rx, ry, a = 0.4) { g.blendEll(x, y, rx, ry, '#120a20', a, 0.8); },
  // aile membraneuse : bord d'attaque, festons concaves entre les doigts, os
  membrane(g, root, tips, c, bone, bw = 0.3) {
    const pts = [root];
    tips.forEach((p, i) => {
      pts.push(p); const q = tips[i + 1]; if (!q) return;
      for (let t = 0.25; t < 1; t += 0.25) { const mx = p[0] + (q[0] - p[0]) * t, my = p[1] + (q[1] - p[1]) * t, s = 0.13 * Math.sin(Math.PI * t); pts.push([mx + (root[0] - mx) * s, my + (root[1] - my) * s]); }
    });
    g.poly(pts, c);
    tips.forEach((p, i) => { if (i === tips.length - 1) return; const m = [root[0] + (p[0] - root[0]) * 0.5, root[1] + (p[1] - root[1]) * 0.5 - bw]; g.stroke([root, m, p], bw, bw * 0.3, bone); });
  },
  // aile de plumes : éventail de plumes effilées depuis l'épaule (dir : -1 vers la gauche, 1 vers la droite)
  featherWing(g, x, y, dir, len, n, a0, a1, c, w = 0.9) {
    for (let i = n - 1; i >= 0; i--) {
      const f = i / Math.max(1, n - 1), a = a0 + (a1 - a0) * f, L = len * (0.55 + 0.45 * Math.sin(Math.PI * (0.25 + f * 0.6)));
      const ex = x + Math.cos(a) * L * dir, ey = y + Math.sin(a) * L, mx = x + Math.cos(a - 0.12 * dir) * L * 0.55 * dir, my = y + Math.sin(a - 0.12) * L * 0.55;
      g.part(t => t.stroke([[x, y], [mx, my], [ex, ey]], w, 0.08, c), MON.dk(c[1], 0.45));
    }
  },
  // flamme en couches (couleurs du bord vers le cœur)
  flame(g, cx, by, w, h, cols, seed = 1) {
    cols.forEach((c, j) => {
      const f = 1 - j / (cols.length + 0.4), W = w * f, H = h * (0.55 + 0.45 * f), L = [], R = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16, y = by - W * 0.9 - t * (H - W * 0.9), wd = W * Math.pow(1 - t, 0.75), sw = Math.sin(t * 7 + seed + j) * 0.3 * t * W;
        L.push([cx - wd + sw, y]); R.push([cx + wd + sw, y]);
      }
      g.ell(cx, by - W * 0.9, W, W * 0.9, c);
      g.poly(L.concat(R.reverse()), c);
    });
  },
  leaf(g, x, y, len, ang, w, c, vein) {
    const ca = Math.cos(ang), sa = Math.sin(ang), L = [], R = [], sp = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, d = t * len, wd = w * Math.sin(Math.PI * Math.min(1, t * 1.05)) * (1 - t * 0.25), px = x + ca * d, py = y + sa * d + t * t * len * 0.2;
      L.push([px - sa * wd, py + ca * wd]); R.push([px + sa * wd, py - ca * wd]); sp.push([px, py]);
    }
    g.poly(L.concat(R.reverse()), c);
    g.stroke(sp.slice(0, 11), 0.1, 0.03, vein || MON.dk(c[1], 0.35));
    for (let i = 2; i < 10; i += 2) { const [px, py] = sp[i], wd = w * 0.7 * Math.sin(Math.PI * i / 12); g.stroke([[px, py], [px + ca * 0.6 - sa * wd, py + sa * 0.6 + ca * wd]], 0.05, 0.02, vein || MON.dk(c[1], 0.3)); g.stroke([[px, py], [px + ca * 0.6 + sa * wd, py + sa * 0.6 - ca * wd]], 0.05, 0.02, vein || MON.dk(c[1], 0.3)); }
  },
  // bloc de pierre aux coins biseautés
  rock(g, x, y, w, h, c, r = 1) { g.poly([[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r]], c); g.blendEll(x + w * 0.3, y + h * 0.25, w * 0.45, h * 0.35, '#fff8e8', 0.22); g.blendEll(x + w * 0.75, y + h * 0.85, w * 0.5, h * 0.3, '#120a20', 0.3); },
};
SPR.ENEMY_SIZE = { slime: 16, rabbit: 16, bird: 16, bat: 16, mushroom: 16, wisp: 16, wolf: 24, plant: 24, golem: 24, skeleton: 24, knight: 24, lizard: 24, toad: 24, ghost: 20, snake: 24, imp: 20, ent: 48, wyvern: 48, hydra: 48, dragon: 56 };
// Chaque créature regarde vers la droite. Signature : (g, P = 3 tons, C = couleur, acc = accent, wings, elem)
SPR.DRAW = {
  slime(g, P, C) {
    g.blob([[8, 11.4, 6.9, 4.4], [8.2, 7.9, 3.8, 3.4], [3.1, 14.5, 1.7, 1.1], [13.1, 14.7, 1.5, 0.95]], P, 8, 10.2, 7.4, 5.8);
    g.blendEll(8.8, 12, 4.6, 2.6, MON.lt(C, 0.35), 0.4, 1);
    [[5.2, 12.6, 0.6], [11.8, 13.1, 0.42], [6.7, 14.1, 0.32], [9.6, 7.6, 0.38], [3.6, 11.2, 0.3]].forEach(([x, y, r]) => { g.blendEll(x, y, r, r, '#ffffff', 0.35, 0.3); g._disc(x - r * 0.35, y - r * 0.35, r * 0.3, MON.lt(C, 0.85)); });
    g.blendEll(8, 15.6, 7.4, 1.7, MON.dk(C, 0.55), 0.5, 1);
    MON.spec(g, 5.3, 8.9, 1.8, 1.05, 0.9); MON.spec(g, 6.8, 6.2, 0.9, 0.55, 0.75);
    g.stroke([[14.3, 9.8], [14.75, 11.5], [14.3, 13.3]], 0.14, 0.05, MON.lt(C, 0.6));
    MON.eye(g, 9.3, 10.4, 1.05, '#2a1a4a'); MON.eye(g, 12.2, 10.4, 0.98, '#2a1a4a');
    g.stroke([[9.9, 12.7], [10.8, 13.3], [11.7, 12.7]], 0.12, 0.12, MON.dk(C, 0.7));
    g.blendEll(8.1, 12.2, 0.9, 0.5, '#ff7a9a', 0.5); g.blendEll(13.5, 12.1, 0.7, 0.45, '#ff7a9a', 0.5);
  },
  rabbit(g, P, C) {
    const dP = MON.sh(MON.dk(C, 0.25));
    g.part(t => t.ell(9.7, 4.7, 1.05, 3.1, dP));
    g.part(t => {
      t.ell(5.3, 14.4, 2.4, 0.95, dP);
      t.blob([[7, 11, 5, 3.8], [4.6, 11.8, 2.9, 2.9], [11.4, 8.4, 3.2, 2.9], [10.1, 10.4, 2.4, 2.4]], P, 8, 9.6, 6.4, 5.2);
      t.ell(10.5, 14.6, 1.7, 0.8, P);
    });
    g.blendEll(8.6, 12.7, 3.6, 1.9, '#fff8ec', 0.5);
    g.blendEll(12.2, 9.6, 1.6, 1.1, '#fff8ec', 0.4);
    MON.fur(g, 6.5, 10.6, 4.6, 3.3, MON.dk(C, 0.35), 3, 34, 0.9, 2.6);
    MON.fur(g, 7, 9.6, 4, 2.6, MON.lt(C, 0.5), 4, 20, 0.7, 2.7);
    g.part(t => t.ell(2.1, 10.2, 1.6, 1.5, ['#c8c0b8', '#f6f2ec', '#ffffff']));
    MON.fur(g, 2.1, 10.2, 1.4, 1.3, '#d8d0c8', 5, 10, 0.6, 3.6);
    g.part(t => { t.ell(12.3, 4.4, 1.1, 3.0, P); t.ell(12.4, 4.7, 0.52, 2.2, ['#c87888', '#f0a0b0', '#ffd0d8']); });
    g.part(t => { t.poly([[12.9, 6.7], [15.6, 1.4], [14.4, 7.0]], MON.IVORY); for (let i = 0; i < 4; i++) t.stroke([[13.35 + i * 0.5, 5.7 - i * 1.0], [14.25 + i * 0.4, 6.0 - i * 1.0]], 0.06, 0.06, '#b0a080'); });
    MON.eye(g, 12.7, 7.8, 0.8, '#4a1a10', { look: 0.3 });
    g.ell(14.6, 9.2, 0.42, 0.32, ['#a04a5a', '#e07080', '#ffb0c0']);
    g.stroke([[14.5, 9.5], [14.2, 10.2], [13.6, 10.35]], 0.07, 0.07, '#6a3a3a');
    MON.tooth(g, 14.15, 10.2, 0.4, 0.45);
  },
  bird(g, P, C) {
    const dk = MON.sh(MON.dk(C, 0.4)), feather = MON.dk(C, 0.55);
    g.part(t => { for (let i = 0; i < 3; i++) t.poly([[4.6, 9.4 + i * 0.3], [0.2, 10.2 + i * 1.1], [0.9, 11.2 + i * 1.1], [4.6, 11 + i * 0.3]], i === 1 ? P : dk); });
    [[7, 12], [9.2, 12]].forEach(([x, y]) => { g.stroke([[x, y], [x + 0.1, y + 2]], 0.2, 0.15, '#d8a030'); g.stroke([[x + 0.1, y + 2], [x + 1.1, y + 2.3]], 0.13, 0.07, '#d8a030'); g.stroke([[x + 0.1, y + 2], [x - 0.6, y + 2.35]], 0.12, 0.07, '#d8a030'); });
    g.part(t => t.blob([[7.3, 9.2, 4.3, 3.4], [10.9, 6.3, 2.6, 2.5], [9.7, 8, 2.4, 2.4]], P, 8.2, 8.2, 5, 4.6));
    MON.scales(g, 9, 8.8, 11.6, 12, 0.42, MON.lt(C, 0.3), 0.05);
    MON.fur(g, 11, 6, 2.2, 2, MON.lt(C, 0.35), 8, 10, 0.5, 3.4, 0.05);
    g.part(t => { t.poly([[12.7, 5.3], [16, 6.6], [12.9, 6.7]], ['#8a5a10', '#e8b030', '#fff0a0']); t.poly([[12.9, 6.7], [15.5, 6.95], [12.8, 7.6]], ['#7a4a10', '#c8902a', '#f0d080']); });
    MON.eye(g, 11.6, 5.6, 0.64, '#ffcf30', { look: 0.25 });
    g.part(t => {
      t.poly([[4, 7.3], [9.8, 7.1], [10.3, 8.6], [7.6, 12.2], [2.2, 11.9]], P);
      for (let i = 0; i < 5; i++) t.ell(2.9 + i * 1.15, 11.4 - i * 0.6, 1.4, 0.55, i % 2 ? dk : P);
    });
    for (let i = 0; i < 5; i++) g.stroke([[9.6 - i * 0.25, 7.8 + i * 0.5], [3.2 + i * 1.1, 11.2 - i * 0.55]], 0.05, 0.03, feather);
    MON.spec(g, 6.4, 7.9, 2.4, 0.7, 0.45);
  },
  bat(g, P, C) {
    const mem = MON.sh(MON.dk(C, 0.15), 0.6, 0.25), bone = MON.dk(C, 0.5);
    g.part(t => MON.membrane(t, [6.6, 7.4], [[0.2, 2.6], [0.3, 7.6], [2.4, 10], [5.4, 10.6]], mem, bone, 0.22));
    g.part(t => MON.membrane(t, [9.4, 7.4], [[15.8, 2.6], [15.7, 7.6], [13.6, 10], [10.6, 10.6]], mem, bone, 0.22));
    g.part(t => {
      t.poly([[6.1, 6.8], [6.0, 2.4], [8, 5.6]], P); t.poly([[8.1, 5.6], [10, 2.4], [9.9, 6.8]], P);
      t.ell(6.7, 5, 0.42, 1.25, ['#8a4a6a', '#e08ab0', '#ffc0d8']); t.ell(9.4, 5, 0.42, 1.25, ['#8a4a6a', '#e08ab0', '#ffc0d8']);
      t.blob([[8, 9.2, 2.9, 3.1], [8, 6.8, 2.2, 1.9]], P, 8, 8.2, 3.2, 4.2);
    });
    MON.fur(g, 8, 9.6, 2.4, 2.4, MON.lt(C, 0.45), 6, 22, 0.6, 1.7, 0.06);
    MON.fur(g, 8, 9.6, 2.4, 2.4, MON.dk(C, 0.45), 7, 16, 0.5, 1.4, 0.06);
    MON.eye(g, 7.1, 7.1, 0.5, '#ff3030', { glow: true }); MON.eye(g, 9, 7.1, 0.5, '#ff3030', { glow: true });
    g.ell(8.05, 8.2, 0.5, 0.32, MON.sh(MON.dk(C, 0.5)));
    MON.tooth(g, 7.6, 8.75, 0.32, 0.65); MON.tooth(g, 8.5, 8.75, 0.32, 0.65);
    MON.claw(g, 7.2, 11.9, 0.7, 1.7); MON.claw(g, 8.8, 11.9, 0.7, 1.4);
  },
  mushroom(g, P, C) {
    const stem = ['#a8906c', '#ecdcbc', '#fff8e4'];
    g.part(t => { t.ell(4.9, 15, 1.5, 0.7, stem); t.ell(11.1, 15, 1.5, 0.7, stem); });
    g.part(t => { t.poly([[5.3, 8.5], [10.7, 8.5], [11.5, 14.8], [4.5, 14.8]], stem); });
    g.blendEll(8, 9.6, 3.8, 1.8, '#4a2a1a', 0.55);
    MON.speckle(g, 5, 10, 11, 14.6, 14, ['#d8c4a0', '#fffaf0'], 3, 0.08, 0.16);
    g.part(t => {
      t.ell(8, 7.1, 7.2, 4.4, P);
      t.ell(8, 9.7, 6.3, 1.2, ['#a88a6a', '#e8d0b0', '#fff0d8']);
      for (let i = -6; i <= 6; i++) t.stroke([[8 + i * 0.22, 9.1], [8 + i * 0.95, 10.6]], 0.05, 0.04, '#a88a6a');
    });
    g.inside(t => [[5, 5, 1.35, 1], [10.3, 4, 1.65, 1.15], [12.7, 7.1, 1.05, 0.9], [3.5, 7.8, 0.95, 0.75], [7.6, 3.0, 0.85, 0.55], [8.3, 6.7, 1.05, 0.8]].forEach(([x, y, a, b]) => t.ell(x, y, a, b, ['#cfc2b4', '#fbf6ee', '#ffffff'])));
    MON.spec(g, 5.5, 4.4, 2.8, 1.3, 0.35);
    MON.eye(g, 6.8, 11.7, 0.62, '#2a1a1a', { look: 0.3 }); MON.eye(g, 9.4, 11.7, 0.62, '#2a1a1a', { look: 0.3 });
    g.stroke([[6.0, 10.85], [7.5, 11.05]], 0.12, 0.08, '#4a2a1a'); g.stroke([[8.7, 11.05], [10.2, 10.85]], 0.12, 0.08, '#4a2a1a');
    g.ell(8.3, 13.4, 0.75, 0.45, ['#2a0a0a', '#4a1a1a', '#7a3a2a']);
  },
  wisp(g, P, C) {
    MON.flame(g, 8, 15.6, 5.4, 15.4, [MON.dk(C, 0.2), C, MON.lt(C, 0.4), MON.lt(C, 0.75)], 1);
    g.blendEll(8, 11, 3, 3.4, '#ffffff', 0.55, 1);
    MON.flame(g, 11.6, 9.4, 1.2, 4.6, [C, MON.lt(C, 0.5)], 3);
    g.ell(6.8, 10.4, 0.55, 0.85, ['#2a0808', '#4a1410', '#6a2410']); g.ell(9.4, 10.4, 0.55, 0.85, ['#2a0808', '#4a1410', '#6a2410']);
    g._disc(6.65, 10.1, 0.17, '#ffffff'); g._disc(9.25, 10.1, 0.17, '#ffffff');
    g.stroke([[7.4, 12.2], [8.1, 12.6], [8.8, 12.2]], 0.1, 0.1, '#6a2410');
  },
  wolf(g, P, C) {
    const D = MON.sh(MON.dk(C, 0.3)), L = MON.lt(C, 0.55), Dk = MON.dk(C, 0.5);
    g.part(t => { t.stroke([[8, 15], [6.6, 18.4], [7.6, 21.5]], 1.2, 0.7, D); t.ell(8.3, 22, 1.2, 0.6, D); t.stroke([[15.6, 15], [16, 19], [16.2, 21.5]], 1.0, 0.7, D); t.ell(16.7, 22, 1.1, 0.6, D); });
    g.part(t => t.stroke([[5.6, 12.6], [3, 11], [1.5, 8], [1.3, 5.2]], 1.7, 0.9, P));
    MON.fur(g, 2.6, 9, 2.2, 3.6, Dk, 11, 22, 1.0, -1.7);
    MON.fur(g, 2.4, 8.6, 1.6, 3.2, L, 15, 10, 0.8, -1.7);
    g.part(t => t.blob([[11, 14, 6.8, 3.9], [15.6, 12.4, 3.8, 4.2], [6.4, 14.2, 3, 3.4]], P, 11.2, 12.4, 8, 5.8));
    g.blendEll(12, 17.2, 5.2, 1.8, L, 0.55);
    MON.fur(g, 11, 13.6, 7, 3.6, Dk, 12, 60, 1.0, 2.9);
    MON.fur(g, 11, 12.4, 6, 2.4, MON.lt(C, 0.35), 13, 34, 0.8, 2.9);
    g.part(t => {
      t.stroke([[10, 16], [8.8, 19], [9.8, 21.6]], 1.4, 0.8, P); t.ell(10.4, 22.1, 1.35, 0.65, P);
      t.stroke([[17.4, 14.8], [17.8, 19], [18, 21.6]], 1.25, 0.85, P); t.ell(18.6, 22.1, 1.35, 0.65, P);
    });
    [[10.6, 22.3], [11.4, 22.2], [18.8, 22.3], [19.6, 22.2]].forEach(([x, y]) => MON.claw(g, x, y, 0.55, 0.2));
    g.part(t => t.poly([[16, 8], [16.6, 2.8], [18.8, 7]], D));
    g.part(t => {
      t.blob([[18, 9.6, 3.9, 3.3], [21, 11.2, 2.6, 1.5], [16.8, 11.8, 3, 2.4]], P, 18.4, 9.4, 5, 4);
      t.poly([[18, 7.4], [20, 2.6], [20.8, 7.6]], P);
      t.poly([[18.8, 7], [19.9, 4], [20.2, 7.2]], ['#4a2a3a', '#8a5a6a', '#c08a9a']);
      t.ell(21, 12.5, 2.1, 0.7, D);
    });
    g.blendEll(16.8, 12.6, 2.8, 2.1, L, 0.5);
    MON.fur(g, 16.8, 11.6, 2.6, 2.4, MON.lt(C, 0.6), 14, 14, 0.8, 2.2);
    MON.fur(g, 18, 8.6, 2.6, 1.6, Dk, 16, 12, 0.6, 3.0, 0.06);
    g.ell(23.1, 10.6, 0.62, 0.5, ['#08060c', '#1e1824', '#5a5068']);
    MON.eye(g, 19.2, 9.2, 0.62, '#ffc830', { look: 0.3, lid: Dk });
    g.stroke([[18.9, 12], [21.5, 12.1], [22.9, 11.7]], 0.09, 0.07, '#2a1418');
    MON.tooth(g, 21, 12.05, 0.34, 0.55); MON.tooth(g, 22, 11.95, 0.3, 0.45);
  },
  plant(g, P, C) {
    const H = MON.sh('#c83a5a'), stem = MON.sh(MON.dk(C, 0.15));
    MON.leaf(g, 8.2, 22.6, 6, Math.PI + 0.3, 1.6, P); MON.leaf(g, 8.6, 22.8, 6.4, -0.25, 1.7, P); MON.leaf(g, 8.4, 18.6, 4.4, Math.PI + 0.7, 1.2, P);
    g.part(t => { t.stroke([[8.4, 23.6], [8.1, 20], [9, 16.5], [11.6, 13.6]], 1.25, 0.95, stem); [[7.4, 20.4, -1], [9.6, 17.6, 1], [8.1, 18.6, -1]].forEach(([x, y, s]) => t.poly([[x, y - 0.4], [x + s * 1.0, y - 0.9], [x, y + 0.3]], MON.IVORY)); });
    g.part(t => {
      t.blob([[15.6, 10.2, 6.4, 5.4], [20.4, 9.6, 3.4, 3.6]], H, 15.6, 9.2, 7, 6.2);
      t.inside(u => u.poly([[12.2, 10.6], [24, 4.2], [24, 15.4]], ['#2a0410', '#5a0a20', '#9a1a3a']));
    });
    g.inside(t => {
      for (let i = 0; i < 6; i++) { const f = i / 5, x = 13.8 + f * 8.6; MON.tooth(t, x, 10.3 - f * 4.4, 0.7, 1.2); MON.tooth(t, x, 11.4 + f * 3.2, 0.7, 1.15, true); }
    });
    g.inside(t => { t.stroke([[12.6, 10.4], [16, 8.5], [20, 6.4], [23.6, 4.7]], 0.18, 0.12, '#ff8aa8'); t.stroke([[12.6, 11.3], [16.6, 12.7], [20.6, 14], [23.4, 14.9]], 0.18, 0.12, '#ff8aa8'); });
    g.inside(t => [[12.2, 6.6, 0.9], [10, 9.4, 0.7], [13.4, 14.6, 0.8], [15.6, 5.6, 0.6], [11.4, 12.8, 0.5]].forEach(([x, y, r]) => t.ell(x, y, r, r * 0.8, ['#e8a0b8', '#ffd0e0', '#ffffff'])));
    MON.spec(g, 13, 7.2, 2.6, 1.6, 0.35);
    g.stroke([[18.4, 13.4], [18.5, 14.8], [18.3, 15.6]], 0.12, 0.05, '#bfe8ff');
  },
  golem(g, P, C, acc, w, elem) {
    const D = MON.sh(MON.dk(C, 0.3)), hot = elem === 'feu';
    g.part(t => { MON.rock(t, 13, 17.4, 4.4, 5.4, D); MON.rock(t, 17.6, 8.4, 5.2, 6.2, D); MON.rock(t, 18.2, 14.2, 5, 5.6, D, 1.4); });
    g.part(t => MON.rock(t, 3.6, 7.4, 15.4, 11.2, P, 1.6));
    g.part(t => MON.rock(t, 5.4, 17.4, 4.8, 5.6, P));
    g.part(t => MON.rock(t, 8, 1.4, 8.2, 6.8, P, 1.4));
    g.part(t => { MON.rock(t, 0.6, 8.2, 4.8, 6.2, P, 1.2); MON.rock(t, 0.3, 14, 5.4, 5.6, P, 1.6); });
    MON.speckle(g, 0, 0, 24, 24, 260, [MON.dk(C, 0.4), MON.lt(C, 0.3), MON.dk(C, 0.2)], 9, 0.08, 0.22);
    const cracks = [[[7, 10], [9, 12.4], [8.6, 14], [10, 16.6]], [[15, 9], [14.2, 11.6], [15.4, 13.4]], [[19.2, 11], [20.6, 12.8]], [[10.4, 2.4], [11.2, 3.6]], [[1.6, 15.4], [3, 17.2]]];
    cracks.forEach(c => { if (hot) c.forEach(([x, y]) => g.blendEll(x, y, 1.2, 1.2, acc, 0.5, 1)); g.stroke(c, 0.16, 0.08, acc); if (hot) g.stroke(c, 0.06, 0.04, '#fff4c0'); });
    if (!hot) { [[9.6, 1.6, 2.2], [3.4, 7.6, 1.8], [18.6, 8.6, 1.6]].forEach(([x, y, r]) => { g.inside(t => t.ell(x, y + 0.2, r, r * 0.55, MON.sh('#5a8a3a'))); for (let i = 0; i < 4; i++) g.stroke([[x - r * 0.6 + i * r * 0.4, y + 0.4], [x - r * 0.6 + i * r * 0.4 + 0.1, y + 0.9 + (i % 2) * 0.4]], 0.08, 0.04, '#4a7a2a'); }); }
    g.blendEll(11.3, 12.6, 2.4, 2.4, '#7ff0ff', hot ? 0 : 0.35, 1);
    g.stroke([[10.2, 11.6], [11.3, 12.8], [12.4, 11.6]], 0.12, 0.12, hot ? acc : '#9ff8ff'); g.stroke([[11.3, 12.8], [11.3, 14.2]], 0.12, 0.12, hot ? acc : '#9ff8ff');
    MON.eye(g, 10.6, 4.6, 0.72, hot ? '#ffd040' : '#7ff0ff', { glow: true }); MON.eye(g, 13.8, 4.6, 0.72, hot ? '#ffd040' : '#7ff0ff', { glow: true });
    g.stroke([[9.6, 3.4], [11.6, 3.7]], 0.2, 0.2, MON.dk(C, 0.5)); g.stroke([[12.8, 3.7], [14.8, 3.4]], 0.2, 0.2, MON.dk(C, 0.5));
  },
  skeleton(g, P, C) {
    const B = MON.sh(C, 0.45, 0.35), Bd = MON.sh(MON.dk(C, 0.3), 0.45, 0.3), hole = ['#0c0610', '#1a1020', '#2a2030'];
    g.part(t => { t.stroke([[10.6, 10.4], [9.2, 13.6]], 0.42, 0.34, Bd); t.ell(9.2, 13.6, 0.5, 0.5, Bd); t.stroke([[9.2, 13.6], [9.7, 16.4]], 0.34, 0.3, Bd); t.ell(9.8, 16.8, 0.6, 0.5, Bd); });
    g.part(t => { t.stroke([[14.2, 18.6], [15.2, 21.2]], 0.48, 0.38, Bd); t.ell(15.2, 21.2, 0.55, 0.5, Bd); t.stroke([[15.2, 21.2], [15.6, 23.1]], 0.38, 0.32, Bd); t.ell(16.2, 23.3, 1.0, 0.45, Bd); });
    g.part(t => t.poly([[10.6, 17.2], [15.6, 17.2], [15.2, 20.4], [14.2, 19.4], [13.2, 21.2], [12, 19.4], [11, 20.6]], MON.sh('#6a2a2a', 0.5, 0.3)));
    g.part(t => {
      t.stroke([[13, 17.4], [13.2, 13], [13.1, 9]], 0.36, 0.3, B);
      for (let i = 0; i < 4; i++) { const y = 10.4 + i * 1.3, wd = 2.6 - i * 0.25; t.stroke([[13.1, y], [13.1 - wd * 0.8, y + 0.3], [13.1 - wd, y + 0.9]], 0.24, 0.18, B); t.stroke([[13.1, y], [13.1 + wd * 0.8, y + 0.3], [13.1 + wd, y + 0.9]], 0.24, 0.18, B); }
      t.ell(13, 17.9, 2.4, 1.2, B); t.ell(12.1, 18, 0.45, 0.35, hole); t.ell(13.9, 18, 0.45, 0.35, hole);
      t.stroke([[11.8, 18.6], [11.2, 21.4]], 0.5, 0.4, B); t.ell(11.2, 21.4, 0.58, 0.5, B); t.stroke([[11.2, 21.4], [11, 23.1]], 0.4, 0.34, B); t.ell(11.7, 23.3, 1.0, 0.45, B);
      t.ell(10.8, 10.2, 1.0, 0.7, B); t.ell(15.4, 10.2, 1.0, 0.7, B);
    });
    blade(g, 18.9, 14.8, -1.15, 10.5, 1.4, MON.sh('#b8c0cc', 0.5, 0.6), 2, '#3a2a20', '#8a7a5a');
    g.part(t => { t.stroke([[15.4, 10.4], [17, 13.2]], 0.42, 0.34, B); t.ell(17, 13.2, 0.5, 0.5, B); t.stroke([[17, 13.2], [18.6, 14.6]], 0.34, 0.3, B); t.ell(18.9, 14.8, 0.7, 0.6, B); });
    g.part(t => {
      t.blob([[13.4, 5.4, 3.6, 3.3], [15.2, 7.6, 2, 1.4]], B, 13.6, 5.6, 4, 4);
      t.ell(14.8, 9.0, 1.9, 0.75, B);
    });
    g.ell(14.2, 5.8, 1.05, 1.15, hole); g.ell(16.5, 5.8, 0.6, 1.0, hole);
    MON.eye(g, 14.3, 5.9, 0.36, '#ff3030', { glow: true });
    g.poly([[15.6, 7.3], [16.1, 7.3], [15.85, 8.1]], hole);
    g.stroke([[13.4, 8.45], [16.4, 8.45]], 0.08, 0.08, '#3a3028');
    for (let i = 0; i < 6; i++) g.stroke([[13.6 + i * 0.5, 8.0], [13.6 + i * 0.5, 8.9]], 0.04, 0.04, '#5a5040');
    g.stroke([[11.6, 3.2], [12.4, 4.4], [12.1, 5.2]], 0.06, 0.03, '#6a6050');
  },
  knight(g, P, C) {
    const M = MON.sh(C, 0.6, 0.6), Md = MON.sh(MON.dk(C, 0.3), 0.6, 0.45), gold = MON.sh('#c8a040', 0.5, 0.5), cape = MON.sh('#4a1a3a', 0.55, 0.3);
    g.part(t => t.poly([[6.6, 8.8], [11.6, 8.8], [11.2, 22.6], [9.8, 21.3], [8.6, 23], [7.2, 21.6], [5.6, 22.8], [3.2, 21.2]], cape));
    [[7, 10], [8.4, 11], [9.8, 10.4]].forEach(([x, y], i) => g.stroke([[x, y], [x - 1.2 + i * 0.4, y + 10]], 0.1, 0.05, MON.dk('#4a1a3a', 0.45)));
    g.part(t => { t.stroke([[14.6, 18], [15.2, 22.2]], 1.15, 1.0, Md); t.ell(15.9, 22.7, 1.6, 0.75, Md); });
    g.part(t => {
      t.poly([[8, 9], [18.4, 9], [17.6, 17.4], [8.8, 17.4]], M);
      for (let i = 0; i < 3; i++) t.ell(13.2, 17.4 + i * 0.8, 4.6 - i * 0.3, 0.7, M);
      t.rect(8.6, 15.4, 9.1, 0.9, gold);
    });
    g.stroke([[13.2, 9.4], [13.2, 15.2]], 0.12, 0.08, MON.lt(C, 0.6));
    MON.spec(g, 11, 11.2, 2.4, 2.4, 0.4);
    [[9.4, 10], [17, 10], [9.6, 14.6], [16.8, 14.6]].forEach(([x, y]) => g._disc(x, y, 0.2, '#e8c860'));
    g.part(t => { t.stroke([[10.4, 18], [10.2, 22.2]], 1.2, 1.05, M); t.ell(10.9, 22.7, 1.7, 0.75, M); t.ell(10.3, 19.6, 0.9, 0.75, gold); });
    g.part(t => { t.ell(17.6, 10.2, 2.2, 1.9, M); });
    g.part(t => {
      t.blob([[13.4, 5.2, 4.1, 4.3]], M, 13, 4.6, 4.4, 4.6);
      t.inside(u => { u.poly([[13.6, 4.6], [17.6, 4.2], [17.6, 5.6], [13.8, 5.6]], ['#0a0610', '#140c1c', '#241a2a']); });
    });
    g.blendEll(16, 5, 1.6, 0.8, '#ff3030', 0.6, 1); g.stroke([[14.6, 5.0], [16.8, 4.9]], 0.16, 0.1, '#ff6060');
    MON.spec(g, 12, 3.2, 2.2, 1.6, 0.55);
    g.inside(t => { t.stroke([[13.2, 1.1], [13.1, 4.4], [13.4, 9.2]], 0.2, 0.2, '#c8a040'); t.stroke([[14, 6.6], [17.4, 6.4]], 0.1, 0.1, MON.dk(C, 0.6)); [[15, 7.4], [15.8, 7.4], [16.6, 7.3]].forEach(([x, y]) => t._disc(x, y, 0.13, '#0a0610')); });
    g.part(t => t.stroke([[13, 1.1], [11, 0.8], [9, 2.2], [7.8, 4.2]], 0.9, 0.3, MON.sh('#a02020', 0.5, 0.35)));
    g.part(t => { t.poly([[2.8, 10.6], [9.2, 10.6], [9.2, 15.4], [6, 19.6], [2.8, 15.4]], Md); });
    g.stroke([[2.9, 10.7], [9.1, 10.7], [9.1, 15.3], [6, 19.4], [2.9, 15.3], [2.9, 10.7]], 0.22, 0.22, '#c8a040');
    g.stroke([[6, 11.6], [6, 17.6]], 0.3, 0.3, '#6a2a5a'); g.stroke([[3.8, 13.6], [8.2, 13.6]], 0.3, 0.3, '#6a2a5a');
    g.part(t => { t.ell(9.2, 10, 2.6, 2.2, M); t.stroke([[6.8, 11.2], [9.2, 12.2], [11.6, 11.2]], 0.18, 0.18, '#c8a040'); });
    blade(g, 18.6, 15, -1.0, 10, 1.8, MON.sh('#b8c0cc', 0.5, 0.6), 2, '#3a2a20', '#c8a040');
    g.part(t => t.ell(18.6, 15.1, 1.0, 0.9, Md));
    [[11, 13], [15.6, 12.4], [12.4, 16.6]].forEach(([x, y]) => g.stroke([[x, y], [x + 0.9, y + 0.4]], 0.06, 0.03, MON.dk(C, 0.6)));
  },
  lizard(g, P, C, acc, wings, elem) {
    const D = MON.sh(MON.dk(C, 0.3)), belly = MON.sh(U.mix(C, '#ffe0a0', 0.55)), memB = MON.sh(MON.dk(C, 0.45), 0.5, 0.3), bone = MON.dk(C, 0.55);
    if (wings) g.part(t => MON.membrane(t, [11.4, 11.6], [[3.6, 1.2], [8.6, 0.6], [13.8, 1.8], [16.4, 7.4]], memB, bone, 0.35));
    g.part(t => { t.stroke([[8.6, 15.6], [8, 19.4], [7.4, 21.4]], 1.0, 0.7, D); t.ell(7.6, 21.8, 1.2, 0.55, D); t.stroke([[15.6, 15.6], [16.4, 19.4], [16.8, 21.4]], 1.0, 0.7, D); t.ell(17.2, 21.8, 1.2, 0.55, D); });
    g.part(t => {
      t.stroke([[6.4, 15.2], [3.6, 14.6], [1.8, 12.6], [1, 9.8]], 2.0, 0.45, P);
      t.blob([[11.4, 14.8, 6.6, 3.4], [16.8, 13.4, 3.2, 2.8]], P, 12, 13.6, 7.4, 4.4);
    });
    g.inside(t => t.ell(12.4, 17.6, 6, 1.7, belly));
    for (let x = 8; x <= 16.5; x += 1.1) g.inside(t => t.stroke([[x, 16.2], [x - 0.15, 18.6]], 0.06, 0.06, MON.dk(C, 0.2)));
    MON.scales(g, 4, 11.6, 19, 16, 0.42, MON.dk(C, 0.35), 0.05);
    MON.speckle(g, 4, 11.4, 19, 15.4, 22, [MON.lt(C, 0.35)], 4, 0.1, 0.22);
    for (let i = 0; i < 7; i++) { const x = 5.4 + i * 1.6, y = 11.9 - Math.sin(i / 6 * Math.PI) * 0.6, h = 1.6 + Math.sin(i / 6 * Math.PI) * 1.2; g.part(t => t.poly([[x, y + 0.3], [x + 0.55, y - h], [x + 1.3, y + 0.3]], MON.sh(acc, 0.5, 0.4))); }
    g.part(t => {
      t.stroke([[10.4, 16.2], [9.6, 19.6], [10, 21.6]], 1.15, 0.8, P); t.ell(10.4, 21.9, 1.3, 0.6, P);
      t.stroke([[17.4, 15], [18.2, 19], [18.6, 21.6]], 1.1, 0.8, P); t.ell(19, 21.9, 1.3, 0.6, P);
    });
    [[11.2, 22.1], [11.9, 22], [19.8, 22.1], [20.5, 22]].forEach(([x, y]) => MON.claw(g, x, y, 0.5, 0.2));
    g.part(t => {
      t.blob([[19.6, 11.6, 3.5, 2.6], [22, 12.6, 1.9, 1.4]], P, 20, 11.2, 4.4, 3.4);
      t.ell(21.6, 13.6, 2.0, 0.6, D);
      t.poly([[17.4, 10.4], [16, 8.4], [18.6, 9.6]], MON.HORN);
    });
    MON.scales(g, 17.4, 9.6, 22.6, 12, 0.36, MON.dk(C, 0.35), 0.04);
    MON.eye(g, 20.2, 10.9, 0.62, '#ffe040', { slit: true, lid: MON.dk(C, 0.5), look: 0.15 });
    g._disc(23.2, 12.1, 0.16, '#1a0a0a');
    g.stroke([[19.4, 13.1], [22, 13.2], [23.6, 12.9]], 0.08, 0.06, '#2a0e0e');
    MON.tooth(g, 21.4, 13.2, 0.3, 0.45); MON.tooth(g, 22.6, 13.1, 0.3, 0.4);
    if (wings) g.part(t => MON.membrane(t, [12.6, 12.2], [[6.6, 3.4], [10.8, 2.4], [14.6, 3.8], [16.4, 9.4]], MON.sh(MON.dk(C, 0.15), 0.5, 0.35), bone, 0.32));
    if (elem === 'feu') { g.blendEll(1.2, 9, 1.6, 1.6, '#ffcf40', 0.5, 1); MON.flame(g, 1.2, 10.4, 1.0, 3.6, ['#ff6a1a', '#ffb030', '#fff0a0'], 2); }
  },
  toad(g, P, C) {
    const D = MON.sh(MON.dk(C, 0.3)), belly = ['#b8a070', '#e8d8a0', '#fff4d0'];
    g.part(t => { t.blob([[5.2, 18.4, 3.6, 3], [4.6, 21, 3.4, 1.3]], D, 5, 18.6, 4, 3.6); });
    g.part(t => t.blob([[12, 15.2, 9.2, 6.4], [12.2, 11, 6.8, 4.2]], P, 12, 13.4, 9.8, 7.8));
    g.inside(t => t.ell(14.2, 18.4, 6.6, 3.6, belly));
    for (let i = 0; i < 5; i++) g.inside(t => t.stroke([[10 + i * 2, 16.2], [10.2 + i * 2, 21]], 0.05, 0.05, '#c8b080'));
    for (let i = 0; i < 26; i++) { const x = 4 + U.hash(i, 3, 31) * 16, y = 9.6 + U.hash(3, i, 32) * 7.6, r = 0.3 + U.hash(i, i, 33) * 0.45; if (!MON.on(g, x, y) || (x > 9 && y > 15.4)) continue; g.ell(x, y, r, r * 0.85, MON.sh(MON.dk(C, 0.12), 0.45, 0.5)); }
    [[6.4, 14.2, 1.8, 1.2], [16, 11.4, 1.6, 1], [11.6, 10.4, 1.3, 0.8]].forEach(([x, y, a, b]) => g.blendEll(x, y, a, b, MON.dk(C, 0.5), 0.45, 0.6));
    g.part(t => { t.ell(8.6, 8.6, 2.9, 2.7, P); t.ell(16.2, 8.4, 2.9, 2.7, P); });
    MON.eye(g, 8.9, 8.4, 1.6, '#e8b020', { flat: true, look: 0.1 }); MON.eye(g, 16.5, 8.2, 1.6, '#e8b020', { flat: true, look: 0.1 });
    g.stroke([[7.2, 6.4], [8.6, 5.9], [10.4, 6.6]], 0.16, 0.12, MON.dk(C, 0.45)); g.stroke([[14.8, 6.2], [16.2, 5.7], [18, 6.4]], 0.16, 0.12, MON.dk(C, 0.45));
    g.stroke([[5.6, 12.6], [9, 13.4], [13, 13.8], [17, 13.2], [20.6, 12.2]], 0.16, 0.1, '#1e2a12');
    g.stroke([[7, 13.2], [13, 14.4], [19.4, 13.2]], 0.1, 0.06, MON.lt(C, 0.4));
    g._disc(18.8, 10.6, 0.16, '#1e2a12'); g._disc(19.8, 10.4, 0.16, '#1e2a12');
    g.part(t => { t.stroke([[17.6, 17], [19, 20.4]], 1.3, 1.0, P); [[18.2, 21.4], [19.4, 21.6], [20.6, 21.3]].forEach(([x, y]) => t.ell(x, y, 0.6, 0.45, MON.sh(MON.lt(C, 0.2)))); });
    g.part(t => [[2.4, 22, 0.6], [3.8, 22.3, 0.6], [5.2, 22.2, 0.6]].forEach(([x, y, r]) => t.ell(x, y, r, r * 0.7, MON.sh(MON.lt(C, 0.15)))));
  },
  ghost(g, P, C) {
    const hem = []; for (let i = 0; i <= 10; i++) { const x = 16.6 - i * 1.3; hem.push([x, 16.2 + Math.sin(i * 1.6) * 1.3 + (i > 6 ? (i - 6) * 0.5 : 0)]); }
    g.part(t => { t.stroke([[4.6, 10.2], [2.4, 11.6], [1, 12.6]], 1.1, 0.5, P); });
    g.part(t => {
      t.ell(10, 8, 6.5, 6.5, P);
      t.poly([[3.5, 8], [16.5, 8]].concat(hem), P);
    });
    g.blendEll(9.4, 7, 5, 4.6, '#ffffff', 0.4, 1);
    g.blendEll(10, 15.6, 7, 2.6, MON.dk(C, 0.3), 0.4, 1);
    for (let i = 0; i < 5; i++) g.inside(t => t.stroke([[5.4 + i * 2.4, 11], [5 + i * 2.5, 16]], 0.1, 0.04, MON.lt(C, 0.4)));
    g.part(t => { t.stroke([[15.8, 10.2], [18, 8.8], [19.2, 7.4]], 1.0, 0.5, P); t.ell(19.2, 7.3, 0.8, 0.8, P); });
    g.part(t => t.ell(16.8, 9.6, 0.8, 0.55, MON.sh('#6a6a7a', 0.5, 0.5)));
    g.ell(8, 8, 1.4, 2, ['#0c0618', '#1a1030', '#3a2a5a']); g.ell(12.6, 8, 1.3, 1.9, ['#0c0618', '#1a1030', '#3a2a5a']);
    MON.eye(g, 8.2, 8.4, 0.45, '#8ae8ff', { glow: true }); MON.eye(g, 12.8, 8.4, 0.42, '#8ae8ff', { glow: true });
    g.ell(10.6, 12.2, 1.2, 1.6, ['#0c0618', '#1a1030', '#3a2a5a']);
  },
  snake(g, P, C) {
    const D = MON.sh(MON.dk(C, 0.25)), belly = MON.sh(U.mix(C, '#f0e8b0', 0.6)), mark = MON.dk(C, 0.5);
    const coil = (cx, cy, rx, ry, a0, a1) => { const pts = []; for (let a = a0; a <= a1; a += 0.2) pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); return pts; };
    g.part(t => t.stroke(coil(10.4, 19.4, 7.6, 2.4, Math.PI * 0.95, Math.PI * 2.05), 2.2, 2.0, D));
    g.part(t => t.stroke(coil(10.4, 19.6, 7.8, 2.4, -0.05, Math.PI * 1.02), 2.3, 2.2, P));
    g.inside(t => t.stroke(coil(10.4, 20.6, 7.6, 2.4, 0.15, Math.PI * 0.9), 0.9, 0.9, belly));
    g.part(t => t.stroke(coil(11.2, 15.6, 5.4, 1.8, Math.PI * 0.95, Math.PI * 2.1).concat([[16.4, 14], [17, 10.8], [17.6, 7.6]]), 2.0, 1.6, P));
    g.part(t => t.stroke(coil(11.2, 15.8, 5.4, 1.8, 0.1, Math.PI * 0.95), 2.0, 2.0, P));
    MON.tint(g, [[16.4, 15], [17, 11.4], [17.8, 8.2]], 0.9, belly[1], 0.6);
    MON.scales(g, 2, 13, 19.6, 23, 0.42, MON.dk(C, 0.3), 0.05);
    [[4.4, 19.8], [8.6, 21.2], [13.2, 21.4], [17, 19.8], [7.6, 16.6], [12.4, 17.6], [16.6, 12.6]].forEach(([x, y]) => g.inside(t => t.poly([[x - 0.8, y], [x, y - 0.6], [x + 0.8, y], [x, y + 0.6]], mark)));
    g.part(t => {
      t.blob([[19.2, 6, 3.3, 2.2], [21.2, 6.6, 1.9, 1.4]], P, 19.6, 5.6, 4, 3);
      t.ell(20.6, 7.6, 1.8, 0.55, D);
    });
    MON.scales(g, 17.4, 4.6, 21.6, 6.4, 0.34, MON.dk(C, 0.35), 0.04);
    MON.eye(g, 20, 5.5, 0.55, '#ffe040', { slit: true, lid: MON.dk(C, 0.5), look: 0.15 });
    g._disc(22.4, 6.2, 0.14, '#0a1a14');
    g.stroke([[22.6, 7.3], [23.4, 7.5], [23.8, 7.1]], 0.08, 0.06, '#e33'); g.stroke([[23.4, 7.5], [23.8, 7.9]], 0.07, 0.05, '#e33');
  },
  imp(g, P, C) {
    const W = MON.sh('#4a1a2a', 0.5, 0.3), bone = '#2a0a14', belly = MON.sh(MON.lt(C, 0.35));
    g.part(t => MON.membrane(t, [8.2, 9.6], [[1.2, 3], [0.6, 8.6], [2.6, 11.6]], W, bone, 0.2));
    g.part(t => { t.stroke([[8, 15.4], [4.4, 17], [2.4, 15.6], [1.8, 13.4]], 0.42, 0.24, P); t.poly([[1.8, 13.6], [0.8, 12.6], [1.8, 10.8], [2.8, 12.6]], P); });
    g.part(t => { t.stroke([[9.2, 15.6], [8.8, 18.4]], 0.7, 0.55, P); t.stroke([[11.6, 15.6], [12, 18.4]], 0.7, 0.55, P); t.ell(8.8, 18.8, 0.8, 0.5, MON.HORN); t.ell(12.2, 18.8, 0.8, 0.5, MON.HORN); });
    g.part(t => {
      t.blob([[10.4, 12.8, 3.6, 3.6], [11, 7.6, 3.5, 3.1]], P, 10.6, 10, 4.4, 6);
      t.poly([[7.6, 7.4], [5.6, 5.8], [8, 6.4]], P); t.poly([[14.2, 7.2], [16.4, 5.6], [14, 8.2]], P);
    });
    g.inside(t => t.ell(10.8, 13.6, 2.2, 2.4, belly));
    g.part(t => { t.stroke([[9.4, 4.8], [8.4, 2.6], [8.8, 0.7]], 0.6, 0.12, MON.HORN); t.stroke([[12.8, 4.6], [14, 2.4], [13.6, 0.6]], 0.6, 0.12, MON.HORN); });
    MON.eye(g, 10.6, 7.4, 0.48, '#ffe040', { glow: true, slit: true }); MON.eye(g, 12.6, 7.3, 0.46, '#ffe040', { glow: true, slit: true });
    g.stroke([[9.8, 6.5], [11.2, 6.9]], 0.12, 0.08, MON.dk(C, 0.5)); g.stroke([[12, 6.8], [13.4, 6.4]], 0.12, 0.08, MON.dk(C, 0.5));
    g.stroke([[10, 9.2], [11.6, 9.9], [13.4, 9.2]], 0.12, 0.1, '#2a0606');
    MON.tooth(g, 10.9, 9.65, 0.3, 0.42); MON.tooth(g, 12.4, 9.65, 0.3, 0.42);
    g.part(t => MON.membrane(t, [12.2, 9.4], [[18.8, 2.4], [19.2, 7.8], [17.2, 10.8]], MON.sh('#5a1a2a', 0.5, 0.35), bone, 0.2));
    g.part(t => { t.stroke([[13.4, 11.2], [15.2, 12.4]], 0.5, 0.4, P); t.ell(15.6, 12.4, 0.6, 0.55, P); });
    g.blendEll(16.6, 11, 2, 2, '#ffcf40', 0.5, 1);
    MON.flame(g, 16.6, 12, 0.9, 3.0, ['#ff5a1a', '#ffb030', '#fff4b0'], 4);
  },
  ent(g, P, C) {
    const bark = MON.sh('#6a4a2a', 0.55, 0.4), barkD = MON.sh('#4a3220', 0.5, 0.35), crys = MON.sh('#9a3ac8', 0.5, 0.5);
    g.part(t => { t.stroke([[30, 21], [37, 17], [42, 12.6], [45, 9]], 3.2, 1.2, barkD); [[40, 14.6, 42, 18], [43.4, 11, 46.6, 12.6], [44.6, 9.4, 46, 6]].forEach(([a, b, c, d]) => t.stroke([[a, b], [c, d]], 0.7, 0.2, barkD)); });
    g.part(t => { [[[18, 38], [13, 43.4], [8.4, 46.6]], [[22, 40], [20.4, 45], [18, 47.2]], [[26, 40], [28, 45], [30.6, 47.2]], [[30, 38], [35.4, 43.4], [40, 46.6]]].forEach(r => t.stroke(r, 3, 0.6, barkD)); });
    g.part(t => t.poly([[15.4, 12.6], [32.6, 12.6], [34, 26], [33.4, 39.6], [30, 41.6], [18, 41.6], [14.4, 39.4], [14, 26]], bark));
    for (let i = 0; i < 18; i++) { const x = 15.4 + i * 1.0, w = Math.sin(i * 1.7) * 0.6; g.inside(t => t.stroke([[x, 13], [x + w, 22], [x - w * 0.6, 32], [x + w * 0.4, 41.6]], 0.12, 0.08, i % 3 ? '#4a3018' : '#8a6a44')); }
    [[17.6, 34, 1.4], [30.4, 18, 1.1]].forEach(([x, y, r]) => { g.ell(x, y, r, r * 1.3, barkD); g.stroke([[x - r * 0.6, y], [x, y - r * 0.9], [x + r * 0.6, y]], 0.12, 0.12, '#2a1a0e'); });
    g.inside(t => { t.ell(16.4, 28, 2.4, 4, MON.sh('#4a7a2a')); t.ell(31.6, 36, 2, 3, MON.sh('#4a7a2a')); });
    g.part(t => { t.stroke([[18, 21], [12, 18.4], [7, 14.6], [3, 11]], 3.2, 1.2, bark); [[9.4, 16.4, 8, 20], [5, 12.8, 1.6, 13.6], [3.4, 11.4, 1.8, 8.4], [3, 11, 0.8, 10.6]].forEach(([a, b, c, d]) => t.stroke([[a, b], [c, d]], 0.7, 0.15, bark)); });
    const lump = [[24, 7.6, 9], [14, 9.6, 6.4], [34, 9.6, 6.4], [6.4, 10.4, 4], [42.4, 9.6, 3.6], [19, 4.4, 5], [29.6, 4.6, 5], [24, 2.6, 4]];
    g.part(t => { lump.forEach(([x, y, r], i) => t.ell(x, y, r, r * 0.66, MON.sh(U.mix(C, '#000', 0.1 * (i % 3)), 0.5, 0.35))); });
    for (let i = 0; i < 60; i++) { const x = 3 + U.hash(i, 5, 41) * 42, y = 1 + U.hash(5, i, 42) * 12, r = 1 + U.hash(i, i, 43) * 1.4; if (MON.on(g, x, y)) g.inside(t => t.ell(x, y, r, r * 0.6, MON.sh(U.mix(C, i % 2 ? '#fff8c0' : '#0a1a0a', 0.15 + U.hash(i, 1, 44) * 0.15), 0.45, 0.4))); }
    [[18, 6], [30, 9], [12, 11.6], [38, 12.4], [24, 3.6], [8, 9.6]].forEach(([x, y], i) => { g.blendEll(x, y, 3, 2.4, '#d070ff', 0.4, 1); g.part(t => { t.poly([[x - 1, y + 1], [x - 0.3, y - 2.2], [x + 0.6, y + 1]], crys); t.poly([[x + 0.3, y + 1.2], [x + 1.4, y - 0.8], [x + 1.6, y + 1.2]], crys); }); });
    g.stroke([[17, 21.6], [19.4, 22.4], [22, 22.6]], 0.5, 0.3, '#2a1a0e'); g.stroke([[26, 22.6], [28.6, 22.4], [31, 21.6]], 0.5, 0.3, '#2a1a0e');
    g.ell(20, 24.4, 2.4, 1.8, ['#0a0408', '#1a0a14', '#2a1420']); g.ell(28, 24.4, 2.4, 1.8, ['#0a0408', '#1a0a14', '#2a1420']);
    MON.eye(g, 20.2, 24.5, 1.3, '#ff6aff', { glow: true }); MON.eye(g, 28.2, 24.5, 1.3, '#ff6aff', { glow: true });
    g.part(t => t.poly([[18.6, 29.6], [24, 28.8], [29.4, 29.6], [28, 34.4], [24, 35.4], [20, 34.4]], ['#0a0408', '#1a0a10', '#2a1418']));
    [[19.6, 29.8, 1], [22, 29.4, 1], [24.4, 29.2, 1], [26.8, 29.4, 1], [28.6, 29.8, 1], [21, 34.2, 0], [23.6, 35, 0], [26.4, 34.6, 0]].forEach(([x, y, d]) => MON.tooth(g, x, y, 0.9, 1.5, !d));
    [[13, 44.6], [36, 44.6]].forEach(([x, y]) => g.part(t => { t.stroke([[x, y], [x, y - 1.6]], 0.3, 0.25, ['#a8906c', '#ecdcbc', '#fff8e4']); t.ell(x, y - 1.8, 1.2, 0.7, MON.sh('#c8482a')); }));
  },
  wyvern(g, P, C) {
    const wingB = MON.sh(U.mix(MON.dk(C, 0.3), '#a8e8ff', 0.15), 0.5, 0.3), wingF = MON.sh(U.mix(C, '#a8e8ff', 0.25), 0.5, 0.35), bone = MON.dk(C, 0.5);
    const D = MON.sh(MON.dk(C, 0.3)), belly = MON.sh(U.mix(C, '#f0f0e0', 0.6));
    g.part(t => MON.membrane(t, [24, 20], [[5.6, 1.6], [14, 1.4], [21, 3.6], [28.6, 11], [30, 21]], wingB, bone, 0.7));
    [[10, 5, 14, 11, 12, 14.6], [17, 4.6, 20, 9, 18.6, 12]].forEach(([a, b, c, d, e, f]) => { g.blendEll(c, d, 3, 3, '#ffff80', 0.35, 1); g.inside(t => t.stroke([[a, b], [c, d], [e, f]], 0.22, 0.12, '#ffff90')); });
    g.part(t => { t.stroke([[16, 30], [9, 33], [4, 36.4], [1.6, 40.4]], 3.2, 0.5, P); t.poly([[2.6, 38.6], [0.2, 37], [0.4, 43.4], [3.4, 41.4]], wingF); });
    g.part(t => { t.stroke([[26, 33], [27.4, 37], [27, 41]], 1.7, 1.2, D); t.ell(27.8, 41.6, 1.9, 0.8, D); });
    g.part(t => t.blob([[22, 28, 9.4, 6.8], [28, 24, 4.6, 4.6]], P, 22.6, 26.4, 10.4, 8));
    g.inside(t => t.ell(23.4, 32.6, 6.6, 3, belly));
    for (let i = 0; i < 6; i++) g.inside(t => t.stroke([[18.6 + i * 2, 30.2], [18.4 + i * 2, 35.6]], 0.1, 0.1, MON.dk(C, 0.15)));
    MON.scales(g, 13, 21, 32, 30, 0.75, MON.dk(C, 0.3), 0.08);
    g.part(t => {
      t.stroke([[28, 25], [32.4, 18], [35.8, 12.4]], 3.6, 2.4, P);
      t.blob([[38.6, 10.4, 4.6, 3.4], [43.4, 11.6, 3.6, 1.9]], P, 39.6, 10, 6, 4);
      t.ell(42.6, 13.4, 3.4, 0.9, D);
    });
    MON.tint(g, [[30, 26.6], [34, 19.6], [37.2, 14.2]], 1.6, belly[1], 0.6);
    MON.scales(g, 29, 9, 40, 22, 0.6, MON.dk(C, 0.3), 0.07);
    g.part(t => { t.stroke([[36.4, 8.2], [33.6, 4.2], [31.6, 1.6]], 0.95, 0.15, MON.IVORY); t.stroke([[38.4, 7.6], [37.4, 3.6], [36.8, 1.2]], 0.8, 0.15, MON.IVORY); });
    MON.eye(g, 40, 9.6, 0.85, '#ffff40', { glow: true, slit: true });
    g.stroke([[39, 8.6], [41.4, 8.4]], 0.24, 0.12, MON.dk(C, 0.5));
    g._disc(46, 10.6, 0.25, '#0a1418');
    g.stroke([[38.8, 12.7], [43, 12.9], [46.6, 12.4]], 0.14, 0.1, '#14141e');
    [[41, 12.8], [42.6, 12.85], [44.2, 12.75], [45.6, 12.6]].forEach(([x, y]) => MON.tooth(g, x, y, 0.5, 0.75));
    g.part(t => { t.stroke([[19, 32], [18.4, 36.6], [19.4, 40.6]], 1.8, 1.2, P); t.ell(20.2, 41.2, 2, 0.85, P); });
    [[21.4, 41.5], [22.2, 41.3], [29.4, 41.9], [30.2, 41.7]].forEach(([x, y]) => MON.claw(g, x, y, 0.9, 0.2));
    g.part(t => MON.membrane(t, [22, 22], [[14.4, 14.4], [19, 13], [25.6, 15.4], [30, 21.4]], wingF, bone, 0.55));
  },
  hydra(g, P, C) {
    const D = MON.sh(MON.dk(C, 0.3)), belly = MON.sh(U.mix(C, '#e8f0d0', 0.55)), fin = MON.sh('#7ad8c8', 0.5, 0.4);
    const necks = [[[15, 36], [10, 26], [8, 16]], [[33, 36], [38, 26], [40, 17]], [[24, 33], [25, 21], [24, 10]]];
    const heads = [[8.4, 12.6], [41.4, 13.6], [25.6, 6.8]];
    g.part(t => t.blob([[24, 39, 16, 7.5]], P, 24, 37, 17, 9));
    [[12, 35], [19.4, 33.6], [28, 33.6], [35.4, 35.4]].forEach(([x, y]) => g.part(t => { t.poly([[x, y + 0.6], [x + 1.8, y - 4.4], [x + 4.2, y + 0.6]], fin); t.stroke([[x + 1.8, y - 4], [x + 2, y + 0.4]], 0.1, 0.1, MON.dk('#7ad8c8', 0.4)); }));
    MON.scales(g, 9, 33, 39, 44, 0.8, MON.dk(C, 0.3), 0.08);
    necks.forEach((n, i) => {
      const [hx, hy] = heads[i];
      g.part(t => { t.stroke(n, 3.8, 2.6, i === 2 ? P : MON.sh(MON.dk(C, 0.12))); });
      MON.tint(g, n.map(([x, y]) => [x + 1.8, y + 0.4]), 1.5, belly[1], 0.55);
      MON.scales(g, Math.min(...n.map(p => p[0])) - 3, n[2][1], Math.max(...n.map(p => p[0])) + 3, n[0][1], 0.6, MON.dk(C, 0.32), 0.06);
      g.part(t => { t.poly([[hx - 2.6, hy - 1.4], [hx - 6.6, hy - 4.6], [hx - 4.6, hy - 1], [hx - 6.4, hy + 0.6], [hx - 2, hy + 1]], fin); });
      g.part(t => { t.blob([[hx, hy, 4.6, 3.2], [hx + 3.6, hy + 0.9, 3, 1.7]], i === 2 ? P : MON.sh(MON.dk(C, 0.12)), hx + 0.6, hy, 5.6, 3.8); t.ell(hx + 3, hy + 2.6, 2.8, 0.8, D); });
      MON.eye(g, hx + 1, hy - 0.8, 0.62, '#ff3030', { glow: true, slit: true });
      g._disc(hx + 6, hy + 0.4, 0.2, '#0a1418');
      g.stroke([[hx - 0.4, hy + 2], [hx + 3, hy + 2.1], [hx + 6.4, hy + 1.8]], 0.1, 0.08, '#14141e');
      [[hx + 2.4, hy + 2.05], [hx + 3.8, hy + 2.05], [hx + 5.2, hy + 1.95]].forEach(([x, y]) => MON.tooth(g, x, y, 0.42, 0.6));
    });
    const wave = []; for (let x = 0; x <= 48; x += 0.5) wave.push([x, 43.4 + Math.sin(x * 0.55) * 0.8]);
    g.part(t => t.poly(wave.concat([[48, 48], [0, 48]]), ['#1a4a7a', '#2a6a9a', '#5aa0d0']));
    g.stroke(wave.map(([x, y]) => [x, y + 0.2]), 0.2, 0.2, '#c8f0ff');
    [[6, 46.4], [18, 45.8], [31, 46.6], [42, 45.6]].forEach(([x, y]) => g.stroke([[x, y], [x + 3, y - 0.2]], 0.12, 0.08, '#8ad0f0'));
  },
  dragon(g, P, C) {
    const wingB = MON.sh(U.mix(C, '#2a0a0a', 0.45), 0.5, 0.3), wingF = MON.sh(U.mix(C, '#2a0a0a', 0.25), 0.5, 0.35), bone = MON.dk(C, 0.55);
    const D = MON.sh(MON.dk(C, 0.3)), belly = MON.sh('#e8a040', 0.5, 0.4), spike = MON.HORN;
    g.part(t => MON.membrane(t, [26, 26], [[2, 2], [10.6, 1], [19, 2.6], [27.4, 5], [34, 20]], wingB, bone, 0.85));
    g.part(t => { t.stroke([[16, 38], [8, 41], [3.4, 46], [2.6, 51], [6, 53.6]], 4.2, 0.8, P); t.poly([[5, 52.6], [8.6, 51.4], [9, 55.6], [5.6, 55.4]], spike); });
    [[10, 39.2, 1.6], [6, 42.4, 1.4], [3.4, 46.4, 1.1], [2.6, 50, 0.8]].forEach(([x, y, s]) => g.part(t => t.poly([[x - s, y + s * 0.4], [x - s * 0.6, y - s * 2.2], [x + s * 0.8, y]], spike)));
    g.part(t => { t.stroke([[34, 40], [36, 46], [35, 50.6]], 2.8, 2, D); t.ell(36, 51.2, 3, 1.1, D); });
    g.part(t => t.blob([[26, 35, 12.6, 9.4], [33, 30, 6, 6]], P, 26.6, 33, 13.4, 10.6));
    g.inside(t => t.ell(29, 40.4, 8.4, 5, belly));
    for (let i = 0; i < 6; i++) g.inside(t => t.stroke([[22 + i * 2.6, 36], [22.4 + i * 2.6, 45.4]], 0.14, 0.14, '#a86020'));
    MON.scales(g, 14, 26, 38, 37, 0.95, MON.dk(C, 0.32), 0.1);
    for (let i = 0; i < 6; i++) g.part(t => t.poly([[15.6 + i * 3.4, 27.4 - i * 0.6], [17.2 + i * 3.4, 21.8 - i * 0.8], [19 + i * 3.4, 27 - i * 0.6]], spike));
    g.part(t => {
      t.stroke([[33, 29], [38, 22], [42.6, 15.6]], 4.8, 3.4, P);
      t.blob([[46.4, 12.4, 6, 4.4], [51.4, 14, 4.2, 2.4]], P, 47.4, 12, 7.6, 5);
      t.poly([[44.4, 15.4], [55.4, 16.2], [53.6, 18.6], [45, 17.6]], D);
    });
    MON.tint(g, [[35.6, 30.6], [40.2, 23.8], [44.2, 17.8]], 2.2, belly[1], 0.6);
    MON.scales(g, 34, 8, 52, 27, 0.75, MON.dk(C, 0.32), 0.08);
    g.inside(t => t.poly([[46, 15.8], [55, 16.2], [54, 17.2], [46.4, 16.8]], ['#ff6a1a', '#ffb030', '#fff0a0']));
    [[47.6, 15.9], [49.4, 16], [51.2, 16.05], [53, 16.1]].forEach(([x, y]) => MON.tooth(g, x, y, 0.55, 0.8));
    g.part(t => { t.stroke([[43.6, 9.4], [40.4, 5], [38.6, 0.8]], 1.2, 0.2, spike); t.stroke([[46.2, 8.4], [45.4, 4], [46.6, 0.6]], 1.0, 0.2, spike); });
    g.stroke([[46.6, 9.4], [49.8, 9.0]], 0.4, 0.2, MON.dk(C, 0.5));
    MON.eye(g, 48.6, 10.6, 1.1, '#ffff60', { glow: true, slit: true });
    g._disc(54.6, 12.8, 0.3, '#1a0a0a');
    g.blendEll(55.4, 15.6, 2.4, 2.4, '#ffb030', 0.5, 1);
    MON.flame(g, 55.4, 16.4, 0.7, 2.8, ['#ff6a1a', '#ffd060', '#fff4c0'], 5);
    g.part(t => { t.stroke([[20, 40], [19.4, 46], [20.4, 50.6]], 3, 2, P); t.ell(21.4, 51.2, 3, 1.1, P); });
    [[18.4, 51.6], [20.4, 51.9], [22.4, 51.9], [24.2, 51.6], [33.6, 51.6], [35.6, 51.9], [37.6, 51.9]].forEach(([x, y]) => MON.claw(g, x, y, 1.0, 0.4));
    g.part(t => MON.membrane(t, [25, 28], [[16.4, 20.6], [21.4, 19], [28.4, 21], [34, 17.4]], wingF, bone, 0.65));
  },
};
// ---------------- Nouvelles espèces (temples) ----------------
Object.assign(SPR.ENEMY_SIZE, { beetle: 20, crab: 24, gargoyle: 24, jelly: 20, eye: 20, shade: 24, seraph: 24, umbra: 56, creation: 56 });
Object.assign(SPR.DRAW, {
  beetle(g, P, C) {
    const D = MON.sh(MON.dk(C, 0.45)), shell = MON.sh(C, 0.6, 0.55);
    [[6, 13.5], [9.5, 14.2], [13, 14]].forEach(([x, y]) => g.part(t => t.stroke([[x, y], [x - 1.6, y + 2.4], [x - 2.2, y + 4.4]], 0.34, 0.16, D)));
    g.part(t => { t.ell(16.4, 13.2, 2.6, 2.2, D); t.stroke([[17.6, 12], [18.6, 8.6], [17.8, 5.6], [16.4, 4.6]], 0.6, 0.12, MON.HORN); t.stroke([[18.4, 14], [19.6, 15.4]], 0.24, 0.06, MON.HORN); });
    g.part(t => { t.blob([[9.6, 11.6, 7.4, 4.8], [10, 9.4, 5.6, 3.4]], shell, 9.6, 10.6, 8, 5.6); t.ell(10, 15.4, 6.6, 1.2, D); });
    g.inside(t => t.stroke([[3, 11], [6, 8.2], [10, 7], [14.4, 8], [17, 10.8]], 0.14, 0.1, MON.dk(C, 0.6)));
    g.blendEll(8, 10, 4, 3, U.mix(C, '#7affff', 0.5), 0.3, 1); g.blendEll(12.5, 12, 3, 2, U.mix(C, '#ff8aff', 0.4), 0.22, 1);
    MON.spec(g, 7.4, 8.2, 3.2, 1.4, 0.75); MON.spec(g, 13.6, 9.4, 1.2, 0.6, 0.6);
    [[7, 14.6], [10.6, 15], [14.2, 14.6]].forEach(([x, y]) => g.part(t => t.stroke([[x, y], [x + 0.6, y + 2.2], [x + 1.6, y + 3.9]], 0.36, 0.16, D)));
    MON.eye(g, 17.4, 12.6, 0.42, '#ffe060', { glow: true });
  },
  crab(g, P, C) {
    const D = MON.sh(MON.dk(C, 0.3)), L = MON.sh(MON.lt(C, 0.2));
    for (let i = 0; i < 3; i++) { const x = 6 + i * 2.6; g.part(t => t.stroke([[x, 16], [x - 2.4, 18.6], [x - 3, 22.4]], 0.5, 0.16, D)); }
    g.part(t => { t.stroke([[7, 14], [3.6, 12], [2.4, 9]], 0.75, 0.6, D); t.poly([[0.8, 9.4], [2.2, 5.6], [4, 8.2]], D); t.poly([[2.2, 9.6], [4.8, 7.4], [3.6, 10.4]], D); });
    g.part(t => {
      t.blob([[12, 15.2, 8, 4.6], [12, 13, 6.4, 3.4]], P, 12, 13.6, 8.6, 5.4);
      t.ell(10, 9.6, 0.5, 2.4, D); t.ell(14, 9.4, 0.5, 2.6, D);
    });
    [[7.6, 13], [10.4, 11.8], [13.4, 11.8], [16.4, 13]].forEach(([x, y]) => g.inside(t => t.ell(x, y, 0.9, 0.6, L)));
    MON.speckle(g, 5, 11, 20, 19, 18, [MON.dk(C, 0.35), MON.lt(C, 0.4)], 61, 0.1, 0.22);
    MON.spec(g, 9, 12, 3, 1.2, 0.5);
    MON.eye(g, 10, 7.4, 0.62, '#1a1020'); MON.eye(g, 14, 7.2, 0.62, '#1a1020');
    g.stroke([[10.8, 17.2], [12, 17.6], [13.2, 17.2]], 0.1, 0.1, MON.dk(C, 0.6));
    for (let i = 0; i < 3; i++) { const x = 13.5 + i * 2.4; g.part(t => t.stroke([[x, 16.4], [x + 2.4, 19], [x + 2.8, 22.6]], 0.5, 0.16, P)); }
    g.part(t => {
      t.stroke([[17.6, 13.6], [20, 11.4], [20.6, 8.6]], 0.95, 0.8, P);
      t.blob([[21, 7, 2.6, 2.4]], P, 21, 6.4, 3, 2.8);
      t.poly([[21.4, 5.2], [23.8, 1.4], [23.6, 5.8]], P); t.poly([[22.4, 7.8], [24, 5.4], [23.2, 8.8]], D);
    });
    g.stroke([[22.4, 3.4], [23.2, 2.4]], 0.08, 0.05, '#ffffff');
  },
  gargoyle(g, P, C) {
    const D = MON.sh(MON.dk(C, 0.35)), wing = MON.sh(MON.dk(C, 0.2), 0.55, 0.3), bone = MON.dk(C, 0.55);
    g.part(t => MON.membrane(t, [10.4, 8.6], [[1.2, 1.4], [0.6, 6.4], [2, 11], [5.4, 13]], wing, bone, 0.32));
    g.part(t => { t.stroke([[7, 18], [3.4, 19.6], [1.4, 17.6]], 0.6, 0.24, D); t.poly([[0.4, 16.6], [2.2, 15.6], [1.8, 18.4]], D); });
    g.part(t => { t.stroke([[9.4, 16.4], [8, 19.6], [9.4, 22]], 1.1, 0.8, D); t.ell(10.2, 22.4, 1.5, 0.6, D); });
    g.part(t => t.blob([[11.6, 14.4, 4.6, 5.2], [13.4, 9.6, 3.6, 3.4]], P, 12, 12.6, 5.4, 6.6));
    g.part(t => {
      t.blob([[16, 7.6, 3.2, 2.8], [18.6, 8.8, 2, 1.4]], P, 16.4, 7.4, 3.8, 3.4);
      t.stroke([[14.6, 5.6], [13.4, 2.6], [14.4, 0.8]], 0.5, 0.1, MON.HORN); t.stroke([[16.6, 5.2], [17, 2.2], [18.4, 0.8]], 0.45, 0.1, MON.HORN);
    });
    MON.speckle(g, 6, 0, 24, 24, 120, [MON.dk(C, 0.35), MON.lt(C, 0.35)], 63, 0.08, 0.2);
    [[[11, 10], [12, 13], [11.4, 15.6]], [[14, 15], [15.4, 17.6]]].forEach(c => g.inside(t => t.stroke(c, 0.1, 0.06, MON.dk(C, 0.6))));
    MON.eye(g, 17.4, 7.2, 0.5, '#ff4a3a', { glow: true });
    g.stroke([[17.6, 9.6], [19.6, 9.4]], 0.1, 0.08, '#140c1c'); MON.tooth(g, 18.6, 9.5, 0.4, 0.6);
    g.part(t => { t.stroke([[14.6, 13], [17, 16.2], [18.2, 19.6]], 0.85, 0.62, P); t.stroke([[13.6, 17], [14.2, 20.6], [15.4, 22]], 1.1, 0.8, P); t.ell(16.2, 22.4, 1.6, 0.6, P); });
    [[18.4, 20], [19, 19.6], [16.8, 22.6], [17.6, 22.5]].forEach(([x, y]) => MON.claw(g, x, y, 0.6, 0.6));
    g.part(t => MON.membrane(t, [12.4, 9.6], [[6.2, 2.6], [5.4, 7.8], [7, 12], [10, 13.4]], MON.sh(C, 0.55, 0.35), bone, 0.3));
  },
  jelly(g, P, C) {
    const L = MON.lt(C, 0.5);
    for (let i = 0; i < 6; i++) { const x = 5 + i * 2, w = Math.sin(i * 1.7); g.part(t => t.stroke([[x, 11], [x + w, 13.6], [x - w * 0.6, 16.2], [x + w * 0.4, 19.4]], 0.32, 0.08, MON.sh(L, 0.4, 0.5))); }
    g.part(t => { t.blob([[10, 8.4, 7.4, 6]], P, 10, 7, 8, 6.6); t.inside(u => u.rect(0, 11, 20, 4, MON.sh(MON.dk(C, 0.2)))); });
    for (let i = 0; i < 7; i++) g.part(t => t.ell(3.4 + i * 2.2, 11.6, 1.3, 0.9, MON.sh(L, 0.35, 0.5)));
    g.blendEll(10, 7.4, 4.6, 3.6, '#ffffff', 0.32, 1);
    g.blendEll(10, 8.6, 2.6, 2.2, MON.lt(C, 0.8), 0.55, 1);
    MON.spec(g, 6.6, 4.8, 2.2, 1.2, 0.85); MON.spec(g, 13.8, 5, 0.8, 0.5, 0.6);
    MON.eye(g, 9, 8.6, 0.72, '#1a2a4a'); MON.eye(g, 12.2, 8.6, 0.7, '#1a2a4a');
    g.stroke([[9.8, 10.4], [10.6, 10.8], [11.4, 10.4]], 0.08, 0.08, MON.dk(C, 0.6));
  },
  eye(g, P, C) {
    const W = MON.sh(MON.dk(C, 0.25), 0.5, 0.35), bone = MON.dk(C, 0.55);
    g.part(t => MON.membrane(t, [5, 9], [[0.4, 3], [0.4, 8], [1.6, 12]], W, bone, 0.22));
    for (let i = 0; i < 4; i++) { const x = 7 + i * 2, w = Math.sin(i * 2.1); g.part(t => t.stroke([[x, 14], [x + w, 16.4], [x - w, 18.6], [x + w * 0.5, 19.6]], 0.45, 0.1, W)); }
    g.part(t => t.ell(10, 9.6, 6.4, 6, ['#a89ab8', '#ece6f0', '#ffffff']));
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; g.inside(t => t.stroke([[10 + Math.cos(a) * 6, 9.6 + Math.sin(a) * 5.6], [10 + Math.cos(a + 0.3) * 4.6, 9.6 + Math.sin(a + 0.3) * 4.2], [10 + Math.cos(a) * 3.4, 9.6 + Math.sin(a) * 3]], 0.08, 0.03, '#d04a5a')); }
    g.ell(12.4, 9.6, 3.2, 3.4, MON.sh(C, 0.6, 0.6));
    g.ell(13, 9.6, 1.2, 2.6, '#0c0614');
    g._disc(11.4, 8.2, 0.8, '#ffffff'); g._disc(14.2, 11, 0.35, '#e8f0ff');
    g.part(t => t.poly([[3.8, 6.4], [10, 3.2], [16.2, 6.4], [10, 5]], W));
    g.part(t => MON.membrane(t, [15, 9], [[19.6, 3], [19.6, 8], [18.4, 12]], W, bone, 0.22));
    g.blendEll(10, 9.6, 8, 7.6, C, 0.12, 1);
  },
  shade(g, P, C) {
    const cloak = MON.sh(MON.dk(C, 0.2), 0.55, 0.3), glow = U.mix(C, '#c88aff', 0.7);
    const hem = []; for (let i = 0; i <= 8; i++) hem.push([17 - i * 1.4, 21.4 + Math.sin(i * 1.9) * 1.6 - (i > 5 ? (i - 5) * 0.9 : 0)]);
    g.part(t => t.stroke([[8, 12], [5, 14.6], [3, 17.4]], 0.9, 0.3, cloak));
    g.part(t => { t.poly([[8.4, 7.6], [16, 7.6], [17.4, 21].concat()].concat(hem).concat([[6, 18]]), cloak); });
    g.part(t => { t.blob([[12.4, 6.4, 4, 4.2]], cloak, 12, 5.6, 4.4, 4.6); t.poly([[9, 4], [10.6, -0.4], [13.4, 2.6]], cloak); });
    g.ell(13.4, 7, 2.6, 2.8, ['#000000', '#08040c', '#140a1e']);
    MON.eye(g, 12.8, 6.8, 0.42, glow, { glow: true }); MON.eye(g, 14.6, 6.8, 0.4, glow, { glow: true });
    for (let i = 0; i < 4; i++) g.inside(t => t.stroke([[10 + i * 1.6, 10], [9.6 + i * 1.7, 20]], 0.12, 0.06, MON.lt(C, 0.15)));
    g.part(t => { t.stroke([[15, 11], [18.4, 13.4], [20.4, 13]], 0.8, 0.45, cloak); });
    [[20.4, 12.6, -0.6], [20.8, 13.2, 0], [20.4, 13.8, 0.6]].forEach(([x, y, a]) => MON.claw(g, x, y, 1.6, a, '#d8c8f0'));
    for (let i = 0; i < 5; i++) g.blendEll(6 + i * 2.6, 21 + (i % 2), 2, 1.4, glow, 0.25, 1);
  },
  seraph(g, P, C) {
    const W = MON.sh('#fffaf0', 0.3, 0.6), robe = MON.sh(C, 0.4, 0.55), gold = MON.sh('#e8c050', 0.5, 0.6);
    const wing = (cx, cy, dir, s) => MON.featherWing(g, cx, cy, dir, 9 * s, 8, -1.3, 0.35, W, 1.15 * s);
    wing(10.4, 10, -1, 1.05); wing(9.6, 13, -1, 0.75);
    g.part(t => { t.poly([[9, 9], [15, 9], [17.4, 22], [6.6, 22]], robe); t.ell(12, 21.6, 5.4, 1.4, robe); });
    for (let i = 0; i < 4; i++) g.inside(t => t.stroke([[10 + i * 1.3, 10], [8.6 + i * 2.1, 21.6]], 0.08, 0.05, MON.dk(C, 0.25)));
    g.inside(t => { t.rect(8, 13.4, 9, 1, gold); t.stroke([[12, 9.4], [12, 21]], 0.2, 0.2, gold); });
    g.part(t => { t.ell(12.4, 6, 2.8, 3, ['#d8c8a8', '#fff4e0', '#ffffff']); t.poly([[9.8, 4.2], [12.6, 2.2], [15.4, 4.4], [15.2, 7], [13.4, 5.6], [11, 5.8]], MON.sh('#f0d890', 0.4, 0.6)); });
    g._disc(13.6, 6.4, 0.32, '#5a4a8a');
    g.stroke([[8.6, 1.6], [12.4, 0.8], [16.2, 1.6], [12.4, 2.4], [8.6, 1.6]], 0.3, 0.3, '#ffe060');
    g.blendEll(12.4, 1.6, 4.6, 1.8, '#fff4a0', 0.5, 1);
    wing(14, 9.4, 1, 1.2);
    g.part(t => { t.stroke([[14.6, 10.6], [17, 12.6], [18.6, 11.4]], 0.6, 0.45, robe); t.ell(19, 11, 0.7, 0.7, ['#d8c8a8', '#fff4e0', '#ffffff']); });
    g.blendEll(19.4, 10.4, 2.6, 2.6, '#fff4a0', 0.6, 1);
  },
  umbra(g, P, C) {
    const body = MON.sh('#1e1230', 0.5, 0.35), arm = MON.sh('#2a1840', 0.5, 0.35), crys = MON.sh('#a84aff', 0.5, 0.65), smoke = MON.sh('#140c20', 0.4, 0.3);
    // fumée inférieure
    for (let i = 0; i < 9; i++) { const x = 14 + i * 3.6, y = 48 + Math.sin(i * 1.7) * 2; g.part(t => t.ell(x, y, 4.6, 3.4, smoke)); }
    // bras arrière
    g.part(t => { t.stroke([[18, 20], [9, 26], [5, 34]], 3.2, 2.0, arm); [[5, 34, 2.4], [3.6, 33.4, 3], [6.4, 34.8, 3.6]].forEach(([x, y, a]) => MON.claw(t, x, y, 3.4, a, '#c8b0e8')); });
    // corps
    g.part(t => { t.blob([[28, 30, 12, 15], [28, 18, 10, 7], [28, 42, 10, 6]], body, 28, 26, 13, 18); });
    for (let i = 0; i < 7; i++) g.inside(t => t.stroke([[18 + i * 3.2, 14], [17 + i * 3.4, 46]], 0.2, 0.1, '#3a2850'));
    // cœur de cristal
    g.blendEll(28, 28, 8, 8, '#a84aff', 0.5, 1);
    g.part(t => { t.poly([[28, 20], [32.6, 27], [28, 36], [23.4, 27]], crys); t.stroke([[28, 20], [28, 36]], 0.2, 0.2, '#f0d8ff'); });
    [[[24, 30], [20, 34], [17, 33]], [[32, 30], [36, 35], [39, 34]], [[28, 36], [27, 41]]].forEach(c => g.inside(t => t.stroke(c, 0.3, 0.12, '#c88aff')));
    // tête et couronne de cornes
    g.part(t => { t.blob([[30, 10, 6.4, 5.8]], body, 29.6, 9, 7, 6.4); [[25, 6, 21, 0.6], [28, 4.6, 27, -0.4], [32, 4.6, 34, -0.4], [35, 6, 39.6, 0.8]].forEach(([a, b, c, d]) => t.stroke([[a, b], [c, d]], 1.0, 0.12, MON.HORN)); });
    [[27, 9.6, 0.7], [31.4, 9.4, 0.8], [29.2, 12, 0.5], [34, 11, 0.45]].forEach(([x, y, r]) => MON.eye(g, x, y, r, '#d070ff', { glow: true }));
    // bras avant
    g.part(t => { t.stroke([[38, 20], [46, 26], [51, 34]], 3.2, 2.0, arm); [[51, 34, 1.0], [52.6, 33.2, 0.4], [50, 35, 1.6]].forEach(([x, y, a]) => MON.claw(t, x, y, 3.6, a, '#c8b0e8')); });
    g.blendEll(51, 36, 6, 6, '#a84aff', 0.35, 1);
    [[10, 14, 1.6], [46, 12, 1.4], [8, 40, 1.2], [50, 44, 1.5]].forEach(([x, y, r]) => g.part(t => t.poly([[x, y - r * 2.4], [x + r, y], [x, y + r * 2.4], [x - r, y]], crys)));
  },
  creation(g, P, C) {
    const gold = MON.sh('#e8c050', 0.5, 0.6), light = MON.sh('#fff4d0', 0.3, 0.6), robe = MON.sh('#f6eedc', 0.35, 0.6), wingC = MON.sh('#fff8e8', 0.25, 0.6);
    // ailes de lumière (trois paires)
    [-1, 1].forEach(dir => { MON.featherWing(g, 28 + dir * 4, 18, dir, 24, 10, -1.25, -0.35, wingC, 2.3); MON.featherWing(g, 28 + dir * 4, 24, dir, 19, 9, -0.35, 0.45, wingC, 2.0); MON.featherWing(g, 28 + dir * 3, 32, dir, 13, 7, 0.4, 1.1, wingC, 1.7); });
    g.blendEll(28, 24, 26, 22, '#fff4c0', 0.18, 1);
    // anneaux
    const ring = (rx, ry, rot, w) => { const pts = []; for (let a = 0; a <= 6.3; a += 0.12) { const x = Math.cos(a) * rx, y = Math.sin(a) * ry; pts.push([28 + x * Math.cos(rot) - y * Math.sin(rot), 26 + x * Math.sin(rot) + y * Math.cos(rot)]); } g.part(t => t.stroke(pts, w, w, gold)); };
    ring(17, 5, 0.25, 0.55);
    // corps : silhouette de cristal vêtue
    g.part(t => { t.poly([[28, 8], [36, 20], [33, 44], [28, 50], [23, 44], [20, 20]], robe); t.poly([[28, 8], [28, 50], [23, 44], [20, 20]], MON.sh('#e6dcc4', 0.35, 0.55)); });
    for (let i = 0; i < 5; i++) g.inside(t => t.stroke([[22 + i * 3, 22], [24 + i * 2, 48]], 0.14, 0.08, '#c8b890'));
    g.inside(t => { t.rect(18, 30, 20, 1.4, gold); t.poly([[28, 22], [30.4, 27], [28, 32], [25.6, 27]], MON.sh('#ffe9a0', 0.4, 0.65)); });
    g.blendEll(28, 27, 6, 6, '#ffffff', 0.5, 1);
    // tête : masque sans visage, œil unique, couronne
    g.part(t => { t.blob([[28, 10, 5, 5.6]], light, 27.6, 9, 5.6, 6); [[23, 6, 20, 0], [25.6, 4.6, 24.6, -1], [28, 4, 28, -1.6], [30.4, 4.6, 31.4, -1], [33, 6, 36, 0]].forEach(([a, b, c, d]) => t.stroke([[a, b], [c, d]], 0.7, 0.12, gold)); });
    g.ell(28.6, 10.4, 1.8, 1.2, ['#7a5a10', '#ffd860', '#fff8d0']); g.ell(28.8, 10.4, 0.5, 1.0, '#2a1a0a'); g._disc(28.2, 10, 0.3, '#ffffff');
    ring(10, 3, -0.3, 0.45);
    // bras
    g.part(t => { t.stroke([[34, 20], [42, 24], [47, 20]], 1.4, 1.0, robe); t.ell(47.6, 19.4, 1.4, 1.4, light); });
    g.blendEll(48, 19, 5, 5, '#fff4a0', 0.6, 1);
    g.part(t => { t.stroke([[22, 20], [14, 25], [9, 22]], 1.4, 1.0, robe); t.ell(8.4, 21.6, 1.4, 1.4, light); });
    // éclats flottants
    [[6, 40, 1.4], [50, 40, 1.6], [12, 8, 1.1], [45, 7, 1.2], [28, 54, 1.3]].forEach(([x, y, r]) => g.part(t => t.poly([[x, y - r * 2.4], [x + r, y], [x, y + r * 2.4], [x - r, y]], MON.sh('#ffe9a0', 0.4, 0.65))));
  },
});
SPR.enemy = (spr, color, elem) => SPR.get(`e_${spr}_${color}`, () => {
  const s = SPR.ENEMY_SIZE[spr], g = new G.Pix(s, s, 16); g.smooth = true;
  const P = MON.sh(color);
  const acc = elem === 'feu' ? '#ffcf40' : spr === 'golem' ? '#4a443c' : U.mix(color, '#ffffff', 0.5);
  SPR.DRAW[spr](g, P, color, acc, spr === 'lizard' && color === '#8a1f2a', elem);
  g.outline('#140c1c').outline('#140c1c').outline('#140c1c').polish(0, 7);
  return g.toCanvas(2);
});

// ---------------- Familiers (16x16 unités, haute définition, tournés vers la droite) ----------------
SPR.FAM_DRAW = {
  bulle(g) {
    const C = '#9a6a42', P = MON.sh(C), D = MON.sh(MON.dk(C, 0.3)), cream = ['#c8a888', '#f4e2c8', '#fffaf0'];
    g.part(t => t.stroke([[4.6, 12.4], [2.4, 11.6], [1, 9.6], [0.8, 7.4]], 1.3, 0.5, D));
    g.part(t => { t.ell(5.4, 14.4, 1.5, 0.8, D); t.ell(9.4, 14.6, 1.4, 0.75, D); });
    g.part(t => t.blob([[7.8, 11.4, 4.4, 3.2], [10.8, 8.2, 3, 2.7], [10, 10, 2.4, 2.4]], P, 8.6, 9.6, 5.4, 5));
    g.inside(t => { t.ell(9.6, 12.4, 2.4, 1.8, cream); t.ell(12.4, 9.2, 1.9, 1.3, cream); });
    MON.fur(g, 7, 11, 4, 2.8, MON.dk(C, 0.3), 21, 26, 0.7, 2.7, 0.06);
    g.part(t => { t.ell(9.4, 5.9, 0.75, 0.7, P); t.ell(10.8, 14.7, 1.5, 0.75, P); t.ell(6.6, 14.6, 1.4, 0.7, P); });
    MON.eye(g, 11.2, 7.7, 0.68, '#2a1a10', { look: 0.3 });
    g.ell(14, 8.7, 0.5, 0.36, ['#1a0c08', '#3a2018', '#7a5a4a']);
    g.stroke([[13.6, 9.6], [13, 10], [12.4, 9.7]], 0.07, 0.07, '#5a3a28');
    [[0, -0.15], [0, 0.25]].forEach(([a, b]) => g.stroke([[13.2, 9.3 + b], [15.2, 9 + b * 2]], 0.035, 0.02, '#fff8ec'));
    g.blendEll(11.2, 9.3, 0.7, 0.4, '#ff8a8a', 0.4);
    g.part(t => t.ell(13.4, 2.8, 2, 2, MON.sh('#7fd0ff', 0.35, 0.6)));
    g.blendEll(13.6, 3.2, 1.6, 1.6, '#ffffff', 0.35, 1); MON.spec(g, 12.7, 2.1, 0.7, 0.5, 0.95);
    g.stroke([[14.6, 2.4], [14.9, 3.2], [14.6, 4]], 0.08, 0.05, '#ffffff');
  },
  pyron(g) {
    const C = '#ff7a2a', P = MON.sh(C), D = MON.sh(MON.dk(C, 0.3)), belly = MON.sh('#ffd070');
    g.part(t => { t.stroke([[7, 13], [6.6, 14.6]], 0.6, 0.5, D); t.ell(6.8, 14.9, 0.9, 0.45, D); t.stroke([[10.6, 13], [11, 14.6]], 0.6, 0.5, D); t.ell(11.2, 14.9, 0.9, 0.45, D); });
    g.part(t => { t.stroke([[5.4, 11.4], [2.8, 10.6], [1.4, 8.6], [1.2, 6.6]], 1.4, 0.45, P); t.blob([[8.6, 11.2, 4.2, 2.5], [12.2, 9.2, 2.8, 2.3]], P, 9.4, 10, 5.4, 3.8); });
    g.inside(t => t.ell(9.2, 12.8, 3.6, 1.1, belly));
    [[6.4, 9.6, 0.5], [8.6, 9.2, 0.6], [10.6, 9.4, 0.45], [4, 10.6, 0.4]].forEach(([x, y, r]) => g.inside(t => t.ell(x, y, r, r * 0.8, MON.sh('#ffd040', 0.4, 0.5))));
    g.blendEll(1.4, 5.4, 2, 2, '#ffcf40', 0.5, 1);
    MON.flame(g, 1.3, 7, 1.0, 4.4, ['#ff5a1a', '#ffb030', '#fff4b0'], 2);
    g.part(t => { t.stroke([[8.4, 12.4], [8.8, 14.6]], 0.65, 0.55, P); t.ell(9.2, 14.9, 1, 0.45, P); t.stroke([[12, 11.4], [12.6, 14.6]], 0.6, 0.5, P); t.ell(13, 14.9, 0.95, 0.45, P); });
    MON.eye(g, 12.6, 8.4, 0.7, '#3a1a0a', { look: 0.3 });
    g._disc(14.7, 9, 0.12, '#7a2010');
    g.stroke([[12.6, 10.3], [13.8, 10.4], [14.6, 9.9]], 0.07, 0.06, '#7a2010');
    g.blendEll(12, 10, 0.7, 0.4, '#ff3a5a', 0.35);
  },
  zephy(g) {
    const B = ['#b8c4c0', '#f2f6ee', '#ffffff'], W = MON.sh('#4aa86a'), Wd = MON.sh('#2a7a4a'), gold = ['#a8701a', '#e8b030', '#fff0a0'];
    g.part(t => { for (let i = 0; i < 3; i++) t.poly([[4.4, 10 + i * 0.3], [0.2, 11 + i * 1.1], [0.8, 12 + i * 1.1], [4.4, 11.4 + i * 0.3]], i === 1 ? W : Wd); });
    [[7, 12.6], [9.2, 12.6]].forEach(([x, y]) => { g.stroke([[x, y], [x + 0.1, y + 1.8]], 0.22, 0.16, gold[1]); [[0.9, 0.3], [-0.6, 0.3], [0.4, 0.5]].forEach(([dx, dy]) => g.stroke([[x + 0.1, y + 1.8], [x + 0.1 + dx, y + 1.8 + dy]], 0.12, 0.06, gold[1])); });
    g.part(t => t.blob([[7.6, 10, 4.1, 3.3], [11, 6.8, 2.5, 2.4], [9.8, 8.4, 2.2, 2.2]], B, 8.6, 8.6, 5, 4.6));
    MON.scales(g, 8.8, 9.6, 11.4, 12.6, 0.38, '#c8d4cc', 0.045);
    g.part(t => { t.poly([[12.8, 5.9], [15.8, 6.8], [15.2, 7.8], [12.9, 7.6]], gold); });
    g.stroke([[15.2, 7.2], [15.6, 8.1]], 0.12, 0.05, '#7a4a10');
    g.inside(t => t.stroke([[10, 5.4], [12.6, 6.6], [13.2, 8.2]], 0.32, 0.25, MON.dk('#4aa86a', 0.3)));
    MON.eye(g, 11.8, 6.4, 0.62, '#ffb020', { look: 0.25, lid: '#2a5a3a' });
    g.part(t => {
      t.poly([[3.8, 8], [9.8, 7.6], [10.4, 9.2], [7.6, 12.8], [2, 12.4]], W);
      for (let i = 0; i < 5; i++) t.ell(2.7 + i * 1.15, 12 - i * 0.62, 1.4, 0.55, i % 2 ? Wd : W);
    });
    for (let i = 0; i < 5; i++) g.stroke([[9.6 - i * 0.25, 8.4 + i * 0.5], [3.2 + i * 1.1, 11.8 - i * 0.6]], 0.05, 0.03, '#1e5a36');
    g.part(t => { t.poly([[9.4, 4.4], [10.4, 2.2], [11.2, 4.8]], W); t.poly([[10.6, 4.6], [12, 2.8], [12.2, 5.2]], Wd); });
  },
  mousse(g) {
    const S = MON.sh('#5a8a3a'), K = MON.sh('#a8c878'), moss = MON.sh('#4a9a2a');
    g.part(t => { t.ell(3.6, 13.2, 1.6, 1.1, K); t.ell(11.8, 13.4, 1.6, 1.1, K); });
    g.part(t => { t.blob([[13.4, 10.2, 2.4, 2.1], [12, 11, 1.6, 1.4]], K, 13.2, 9.8, 2.8, 2.6); });
    MON.eye(g, 13.8, 9.6, 0.62, '#2a3a1a', { look: 0.3 });
    g.stroke([[14.4, 11], [15.2, 10.8]], 0.07, 0.05, '#3a5a2a');
    g.blendEll(13, 10.8, 0.6, 0.35, '#ff9a9a', 0.35);
    g.part(t => t.ell(8, 12.4, 6, 1.4, MON.sh('#c8b880')));
    g.part(t => t.blob([[8, 10, 5.7, 4.3]], S, 7.6, 9, 6, 5));
    g.inside(t => { [[8, 9.4, 1.6], [5.2, 10.6, 1.2], [10.8, 10.6, 1.2], [6.4, 7.4, 1.1], [9.8, 7.4, 1.1]].forEach(([x, y, r]) => { t.poly([[x - r, y], [x - r / 2, y - r * 0.85], [x + r / 2, y - r * 0.85], [x + r, y], [x + r / 2, y + r * 0.85], [x - r / 2, y + r * 0.85]], MON.sh('#6a9a48', 0.45, 0.4)); }); });
    g.inside(t => [[8, 9.4, 1.6], [5.2, 10.6, 1.2], [10.8, 10.6, 1.2], [6.4, 7.4, 1.1], [9.8, 7.4, 1.1]].forEach(([x, y, r]) => t.stroke([[x - r, y], [x - r / 2, y - r * 0.85], [x + r / 2, y - r * 0.85], [x + r, y], [x + r / 2, y + r * 0.85], [x - r / 2, y + r * 0.85], [x - r, y]], 0.06, 0.06, '#2a4a1a')));
    g.part(t => { t.blob([[7, 6.4, 2.6, 1.2], [9.6, 6.6, 1.8, 1], [5, 7.4, 1.2, 0.8]], moss, 7.4, 6, 3.6, 2); });
    MON.fur(g, 7.4, 6.4, 3, 1, '#7ad848', 31, 10, 0.5, -1.6, 0.05);
    g.part(t => { t.stroke([[9.4, 5.9], [9.6, 4.6]], 0.08, 0.06, '#3a7a2a'); [0, 1.26, 2.5, 3.77, 5.03].forEach(a => t.ell(9.6 + Math.cos(a) * 0.45, 4.3 + Math.sin(a) * 0.45, 0.35, 0.35, MON.sh('#ff9ad8', 0.3, 0.5))); t._disc(9.6, 4.3, 0.2, '#ffe060'); });
  },
  lumi(g) {
    const B = MON.sh('#ffe0a0', 0.4, 0.5), T = ['#d8d0c0', '#fff8e8', '#ffffff'], D = MON.sh(MON.dk('#ffe0a0', 0.25));
    g.part(t => { t.stroke([[7, 13], [6.6, 14.6]], 0.55, 0.45, D); t.stroke([[11, 13], [11.4, 14.6]], 0.55, 0.45, D); });
    g.part(t => { t.stroke([[5.4, 11.4], [2.4, 9.8], [1.2, 6.4], [2, 4.2]], 2.1, 1.3, B); });
    g.inside(t => t.stroke([[1.5, 6], [2, 4.2]], 1.4, 1.3, T));
    MON.fur(g, 2.4, 8, 1.8, 3.4, MON.dk('#ffe0a0', 0.3), 41, 14, 0.7, -1.9, 0.06);
    g.part(t => t.blob([[8.4, 11.2, 4, 2.7], [11.6, 7.6, 2.9, 2.6], [10.4, 9.6, 2.2, 2.2]], B, 9.2, 9.6, 5, 4.4));
    g.inside(t => { t.ell(10.6, 12.4, 2.2, 1.3, T); t.ell(13, 8.8, 1.7, 1.1, T); });
    g.part(t => { t.poly([[9.6, 6.2], [9.8, 1.4], [12, 5.4]], B); t.poly([[12, 5.6], [14.2, 1.6], [14.2, 6.6]], B); t.poly([[10.2, 5.6], [10.3, 2.8], [11.4, 5.2]], MON.sh('#ff9ab0')); t.poly([[12.8, 5.6], [13.8, 3.2], [13.8, 6]], MON.sh('#ff9ab0')); });
    g.part(t => { t.stroke([[8.4, 12.4], [8.8, 14.6]], 0.6, 0.5, B); t.stroke([[12.2, 11.6], [12.8, 14.6]], 0.6, 0.5, B); t.ell(9.1, 14.9, 0.8, 0.4, T); t.ell(13.1, 14.9, 0.8, 0.4, T); });
    MON.eye(g, 12.4, 7.4, 0.68, '#4a3aa8', { look: 0.3 });
    g.ell(14.7, 8.6, 0.38, 0.3, ['#1a0c0c', '#3a2a2a', '#7a6a6a']);
    g.stroke([[14.2, 9.4], [13.6, 9.7]], 0.06, 0.05, '#7a5a4a');
    [[3, 1.6, 0.5], [7, 6.4, 0.35], [15, 3.4, 0.45], [5.6, 3.6, 0.3]].forEach(([x, y, r]) => { g.stroke([[x - r, y], [x + r, y]], 0.07, 0.07, '#ffffff'); g.stroke([[x, y - r], [x, y + r]], 0.07, 0.07, '#ffffff'); });
  },
  noctis(g) {
    const C = '#2a2440', B = MON.sh(C, 0.45, 0.4), D = MON.sh(MON.dk(C, 0.3), 0.4, 0.3);
    g.part(t => { t.stroke([[6, 13], [5.6, 14.6]], 0.55, 0.45, D); t.stroke([[9.6, 13], [10, 14.6]], 0.55, 0.45, D); });
    g.part(t => t.stroke([[4.4, 12], [1.6, 11], [0.8, 8.4], [1.4, 6], [2.8, 5.2]], 0.8, 0.5, B));
    g.part(t => t.blob([[7.2, 11.4, 4.2, 2.7], [11.4, 7.8, 3, 2.7], [9.8, 9.8, 2.2, 2.2]], B, 8.4, 9.6, 5, 4.4));
    g.part(t => { t.poly([[9, 6.2], [9.2, 1.8], [11.2, 5.2]], B); t.poly([[12, 5.2], [13.8, 1.8], [14.2, 6.6]], B); t.poly([[9.6, 5.6], [9.7, 3], [10.6, 5]], MON.sh('#6a3a8a')); t.poly([[12.8, 5.4], [13.6, 3.2], [13.8, 6]], MON.sh('#6a3a8a')); });
    g.part(t => { t.stroke([[8, 12.6], [8.2, 14.6]], 0.6, 0.5, B); t.stroke([[11.4, 11.6], [11.8, 14.6]], 0.6, 0.5, B); t.ell(8.5, 14.9, 0.8, 0.4, B); t.ell(12.1, 14.9, 0.8, 0.4, B); });
    MON.speckle(g, 0, 4, 16, 16, 30, ['#c8b0ff', '#ffffff', '#8a6aff'], 51, 0.05, 0.12);
    MON.eye(g, 11.4, 7.6, 0.6, '#c86aff', { glow: true, slit: true }); MON.eye(g, 13.4, 7.6, 0.55, '#c86aff', { glow: true, slit: true });
    g._disc(14.6, 8.8, 0.18, '#ff9ad8');
    [[0, 0], [0.4, 0.3]].forEach(([a, b]) => g.stroke([[14.2, 9.2 + b], [15.8, 8.9 + b + a]], 0.035, 0.02, '#a898c8'));
    g.blendEll(2.8, 5.2, 1.6, 1.6, '#a86aff', 0.6, 1);
  },
};
SPR.fam = id => SPR.get('f_' + id, () => { const g = new G.Pix(16, 16, 16); g.smooth = true; SPR.FAM_DRAW[id](g); g.outline('#140c1c').outline('#140c1c').outline('#140c1c').polish(0, 9); return g.toCanvas(2); });

// ---------------- Portraits (data URL pour l'interface) ----------------
SPR.url = (key, canvasFn, scale = 4) => SPR.get('url_' + key + '_' + scale, () => {
  const src = canvasFn(), c = U.canvas(Math.round(SPR.lw(src) * scale * 2), Math.round(SPR.lh(src) * scale * 2)), x = c.getContext('2d');
  const smooth = (src._d || 1) * 2 >= scale * 2; x.imageSmoothingEnabled = smooth; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL();
});
SPR.charURL = cid => SPR.url('char_' + cid, () => SPR.hero(cid, G.CHARS[cid].pal, 'down', 0, SPR.CHAR_EXTRA[cid]));
SPR.famURL = fid => SPR.url('fam_' + fid, () => SPR.fam(fid));
SPR.enemyURL = eid => { const e = G.ENEMIES[eid]; return SPR.url('en_' + eid, () => SPR.enemy(e.spr, e.pal, e.e), SPR.ENEMY_SIZE[e.spr] > 24 ? 1 : 2); };
SPR.battlerURL = (cid, wid) => { const t = SPR.weaponTier(cid, wid); return SPR.url('bt_' + cid + wid + '_' + (t >= 7 ? 3 : t >= 5 ? 2 : t >= 3 ? 1 : 0), () => SPR.battler(cid, wid, 'idle', t), 3); };

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
// petit peintre de pixels : coordonnées logiques 0..32 par case, rendu réel en 64 px (EQ = 2 pixels réels par pixel logique)
const EQ = 2, RS = TS * EQ, ENV_K = 4;
// grain à pleine résolution (un tirage par pixel réel)
const gr = (x, y, s) => U.hash(Math.floor(x * EQ), Math.floor(y * EQ), s);
function Painter() {
  const c = U.canvas(RS, RS), x = c.getContext('2d'), img = x.createImageData(RS, RS), D = img.data;
  const put = (X, Y, rgb, a) => { if (X < 0 || Y < 0 || X >= RS || Y >= RS) return; const i = (Y * RS + X) * 4; D[i] = D[i] * (1 - a) + rgb[0] * a; D[i + 1] = D[i + 1] * (1 - a) + rgb[1] * a; D[i + 2] = D[i + 2] * (1 - a) + rgb[2] * a; D[i + 3] = 255; };
  const rgbOf = col => typeof col === 'string' ? U.hex2rgb(col) : col;
  const P = {
    c,
    // bloc logique (2 x 2 pixels réels) avec micro-modelé : coin haut-gauche éclairci, bas-droit assombri
    set(px, py, col, a = 1) {
      const X = Math.floor(px) * EQ, Y = Math.floor(py) * EQ, rgb = rgbOf(col);
      put(X, Y, rgb, a); put(X + 1, Y, rgb, a); put(X, Y + 1, rgb, a); put(X + 1, Y + 1, rgb, a);
    },
    wset(px, py, col, a = 1) {
      const X = ((Math.floor(px) % TS) + TS) % TS, Y = ((Math.floor(py) % TS) + TS) % TS, rgb = rgbOf(col);
      P.set(X, Y, rgb, a);
      if (a >= 0.6) { put(X * EQ, Y * EQ, rgb.map(v => Math.min(255, v * 1.12 + 6)), 0.6 * a); put(X * EQ + 1, Y * EQ + 1, rgb.map(v => v * 0.86), 0.6 * a); }
    },
    // pixel réel unique (détail fin), coordonnées logiques fractionnaires
    dot(px, py, col, a = 1) { put(((Math.floor(px * EQ) % RS) + RS) % RS, ((Math.floor(py * EQ) % RS) + RS) % RS, rgbOf(col), a); },
    fill(fn) { for (let Y = 0; Y < RS; Y++) for (let X = 0; X < RS; X++) put(X, Y, rgbOf(fn((X + 0.25) / EQ, (Y + 0.25) / EQ)), 1); },
    each(fn) { for (let Y = 0; Y < RS; Y++) for (let X = 0; X < RS; X++) fn((X + 0.25) / EQ, (Y + 0.25) / EQ); },
    done() { x.putImageData(img, 0, 0); c._d = 4; return c; },
  };
  return P;
}
const ramp = (cols, t) => { t = U.clamp(t, 0, 0.999); const n = cols.length - 1, i = Math.floor(t * n), f = t * n - i; return U.hex2rgb(U.mix(cols[i], cols[i + 1], f)); };
const rampQ = (cols, t) => U.hex2rgb(cols[Math.min(cols.length - 1, Math.floor(U.clamp(t, 0, 0.999) * cols.length))]);
// les styles partagent la couleur de base de leur sol : seuls les détails changent
// (la couleur, elle, varie en continu à l'échelle de la carte)
const GRASS_STYLE = {};
const GRASS = {
  '.': ['#3f7d2c', '#4f9334', '#5ea63c', '#72ba48', '#8ccc58'],
  ',': ['#3f7d2c', '#4f9334', '#5ea63c', '#72ba48', '#8ccc58'],
  'g': ['#4a8a32', '#5a9e3a', '#68b044', '#7cc252', '#96d464'],
  'f': ['#25502a', '#2e6030', '#3a7238', '#4a8440', '#5c964a'],
};
// brins d'herbe
function blades(P, v, pal, n, seed) {
  for (let k = 0; k < n * 2; k++) {
    const bx = U.hash(k, v, seed) * TS, by = U.hash(v, k, seed + 1) * TS, h = 3 + U.hash(k, k + v, seed + 2) * 4, lean = (U.hash(k, 3, seed + 3) - 0.5) * 1.6;
    for (let i = 0; i <= h * EQ; i++) { const t = i / (h * EQ); P.dot(bx + lean * t * t * 1.5, by - i / EQ, ramp([pal[1], pal[3], pal[4]], t), 0.95); if (t < 0.75) P.dot(bx + lean * t * t * 1.5 + 0.5, by - i / EQ, ramp([pal[0], pal[2], pal[3]], t), 0.7); }
    P.dot(bx, by + 0.5, pal[0], 0.5); P.dot(bx + 0.5, by + 0.5, pal[0], 0.35);
  }
}
// grain fin supplémentaire (détails à pleine résolution)
function fineGrain(P, v, light, dark, n, seed) { for (let k = 0; k < n; k++) { const x = U.hash(k, v, seed) * TS, y = U.hash(v, k, seed + 1) * TS; P.dot(x, y, light, 0.55); P.dot(x + 0.5, y + 0.5, dark, 0.45); } }
const TILE_PAINT = {
  grass(P, v, ch, style) {
    const pal = GRASS[ch];
    P.fill((x, y) => { const n = tfbm(x, y, 11 + (ch === 'f' ? 5 : 0)) + (gr(x, y, v + 40) - 0.5) * 0.22; return rampQ(pal.slice(0, 4), n * 1.05); });
    blades(P, v, pal, style === 'dry' ? 9 : style === 'moss' ? 4 : ch === 'f' ? 10 : 16, 20);
    fineGrain(P, v, pal[4], pal[0], 40, 21);
    if (style === 'clover') for (let k = 0; k < 6; k++) { const cx = U.hash(k, v, 77) * TS, cy = U.hash(v, k, 77) * TS; [[0, -1], [-1, 0], [1, 0]].forEach(([dx, dy]) => { P.wset(cx + dx, cy + dy, pal[3]); P.wset(cx + dx * 2, cy + dy * 2, pal[2], 0.7); }); P.wset(cx, cy + 1, pal[0]); }
    if (style === 'dry') for (let k = 0; k < 10; k++) P.wset(U.hash(k, v, 78) * TS, U.hash(v, k, 78) * TS, '#d8c870', 0.8);
    if (style === 'moss') for (let k = 0; k < 9; k++) { const cx = U.hash(k, v, 79) * TS, cy = U.hash(v, k, 79) * TS; P.wset(cx, cy, '#7ab04a'); P.wset(cx + 1, cy, '#5a9038'); P.wset(cx, cy + 1, '#4a7a30'); }
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
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 13) * 0.9 + 0.08 + (gr(x, y, v + 50) - 0.5) * 0.15));
    for (let k = 0; k < 7; k++) {
      const px = U.hash(k, v, 61) * TS, py = U.hash(v, k, 61) * TS, sz = U.hash(k, 9, 62) < 0.3 ? 2 : 1;
      for (let j = 0; j <= sz; j++) for (let i = 0; i <= sz; i++) P.wset(px + i, py + j, i + j === 0 ? '#ece0c0' : i + j >= sz * 2 ? '#6a5434' : '#a89474');
      P.wset(px + sz + 1, py + sz + 1, '#5a4428', 0.4);
    }
    fineGrain(P, v, '#f0dcb0', '#7a5e36', 70, 72);
    if (v % 2 === 0) { let cx = U.hash(v, 1, 70) * TS, cy = 4 + U.hash(v, 2, 70) * 24; for (let i = 0; i < 7; i++) { P.wset(cx, cy, '#7a5e36', 0.7); cx += 1; cy += U.hash(i, v, 71) < 0.5 ? 1 : -1; } }
  },
  rock(P, v) {
    const pal = ['#5c554a', '#6a6256', '#786f62', '#867d6e', '#958b7c'];
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 17) + (gr(x, y, v + 60) - 0.5) * 0.18));
    for (let c = 0; c < 1; c++) { let cx = U.hash(c, v, 80) * TS, cy = U.hash(v, c, 80) * TS; for (let i = 0; i < 8; i++) { P.wset(cx, cy, '#4e483f', 0.85); P.wset(cx + 1, cy, '#c8c0b0', 0.3); cx += U.hash(i, c + v, 81) < 0.5 ? 1 : 0; cy += U.hash(i + 1, c + v, 82) < 0.6 ? 1 : 0; } }
    for (let k = 0; k < 4; k++) { const px = U.hash(k, v, 90) * TS, py = U.hash(v, k, 90) * TS; P.wset(px, py, '#c8c0b2'); P.wset(px + 1, py, '#a8a092'); P.wset(px, py + 1, '#6a645a'); P.wset(px + 1, py + 1, '#5a544a'); }
    if (v % 3 === 1) for (let k = 0; k < 5; k++) P.wset(U.hash(k, v, 95) * TS, U.hash(v, k, 95) * TS, '#8aa860', 0.8);
    fineGrain(P, v, '#b8b0a2', '#3e3830', 60, 96);
  },
  mud(P, v) {
    const pal = ['#323a24', '#3e4a2c', '#4a5634', '#56623c', '#647046'];
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 23) + (gr(x, y, v + 70) - 0.5) * 0.14));
    if (v === 4) { const cx = 10 + U.hash(v, 3, 3) * 12, cy = 10 + U.hash(v, 4, 3) * 12; for (let y = -5; y <= 5; y++) for (let x = -9; x <= 9; x++) { const r = (x * x) / 81 + (y * y) / 25; if (r < 1) P.wset(cx + x, cy + y, r > 0.75 ? '#2a3a32' : U.mix('#2e4a44', '#3a5a52', (y + 5) / 10)); } for (let x = -5; x < 4; x++) P.wset(cx + x, cy - 3, '#6a8a80', 0.7); }
    fineGrain(P, v, '#6a7a4a', '#22281a', 50, 7);
    for (let k = 0; k < 2; k++) { const rx = U.hash(k, v, 6) * TS, ry = U.hash(v, k, 6) * TS; for (let i = 0; i < 4; i++) P.wset(rx + (k % 2 ? i * 0.3 : -i * 0.3), ry - i, i > 2 ? '#a8a060' : '#5a6a34'); }
  },
  volc(P, v, f = 0) {
    const pal = ['#1e1514', '#2a1e1c', '#3a2a28', '#4a3632', '#5a4440'];
    P.fill((x, y) => rampQ(pal, tfbm(x, y, 29) + (gr(x, y, v + 80) - 0.5) * 0.15));
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
    P.fill((x, y) => { const rip = Math.sin((y + Math.sin(x * 0.4) * 1.5) * 0.9) > 0.85 ? -0.18 : 0; return rampQ(pal, tfbm(x, y, 37) * 0.8 + 0.2 + rip + (gr(x, y, v + 90) - 0.5) * 0.1); });
    fineGrain(P, v, '#fff4d0', '#b89a68', 60, 91);
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
          P.set(((x0 + x) % TS + TS) % TS, y0 + y, c);
        }
        x0 += w;
      }
    }
    fineGrain(P, v, '#d8d0c4', '#5a544a', 50, 8);
    if (v % 3 === 2) for (let k = 0; k < 3; k++) P.wset(5 + k * 9, 7 + (k % 2) * 8, '#5a8a3a', 0.9);
  },
};
const TILE_KIND = { '.': 'grass', ',': 'grass', 'g': 'grass', 'f': 'grass', '_': 'path', 'r': 'rock', 'm': 'mud', 'v': 'volc', 's': 'sand', 'p': 'paved' };
SPR.tile = (ch, v, style) => SPR.get(`t_${ch}_${v}_${style || ''}`, () => {
  const P = Painter(), k = TILE_KIND[ch] || 'grass';
  TILE_PAINT[k](P, v, ch, style);
  return P.done();
});
// Tuiles animées : eau, lave, eau de marais (8 images)
SPR.animTile = (ch, v, f) => SPR.get(`a_${ch}_${v}_${f}`, () => {
  const P = Painter(), t = f / 8 * Math.PI * 2;
  if (ch === '~') {
    P.fill((x, y) => { const n = tfbm(x + f * 4, y + f * 2, 41) * 0.65 + tfbm(x - f * 4, y + f * 4, 43) * 0.35; return ramp(['#1d4a8e', '#2a64b4', '#3474c4', '#4286d0'], 0.15 + n * 0.75); });
    P.each((x, y) => {
      const w = tn(x + f * 4, y * 2 + f * 4, 8, 47 + v % 2);
      if (w > 0.8) P.dot(x, y, '#bfe0ff', 0.8); else if (w > 0.72) P.dot(x, y, '#7ab4ec', 0.6);
    });
    if ((f + v) % 3 === 0) { const sx = (v * 7 + f * 3) % TS, sy = (v * 11) % TS; P.wset(sx, sy, '#ffffff'); P.wset(sx + 1, sy, '#cfe8ff', 0.6); P.wset(sx - 1, sy, '#cfe8ff', 0.6); }
  } else if (ch === 'l') {
    P.fill((x, y) => { const n = tfbm(x + f * 2, y - f * 3, 51) * 0.75 + tfbm(x - f, y + f, 53) * 0.25; return ramp(['#6a1408', '#b8300e', '#e8501a', '#ff8a2a', '#ffd060', '#fff4b0'], U.clamp((n - 0.2) * 1.5, 0, 1)); });
  } else if (ch === 'w') {
    P.fill((x, y) => ramp(['#26443c', '#30544a', '#3a5e54', '#46685c'], tfbm(x + f * 4, y, 61)));
    P.each((x, y) => { const w = tn(x + f * 4, y * 2, 4, 63 + v); if (w > 0.88) P.dot(x, y, '#7a9a88', 0.5); });
    if (v === 0) {
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
  P.each((x, y) => { if (y > 3 && y < 28 && Math.floor(x) % 6 !== 0 && gr(x, y, 9) < 0.08) P.dot(x, y, '#3a2412', 0.35); });
  return P.done();
});
// ---------------- Petits décors de sol (dessinés dans le sol, sans collision) ----------------
SPR.DECAL = {
  flowers(g, v) { const cols = [['#ffffff', '#ffe060'], ['#ff8ab0', '#fff0a0'], ['#ffd040', '#ff8a20'], ['#a8c8ff', '#ffffff'], ['#d08aff', '#ffe0ff'], ['#ff5a5a', '#ffe080']]; for (let i = 0; i < 4 + v % 3; i++) { const x = 3 + U.hash(i, v, 1) * 10, y = 5 + U.hash(v, i, 1) * 8, [p, c] = cols[(i + v) % cols.length]; g.hline(x, y + 0.5, x, y + 2.5, '#3a6a2a'); [[-0.5, 0], [0.5, 0], [0, -0.5], [0, 0.5]].forEach(([dx, dy]) => g.dot(x + dx, y + dy, p)); g.dot(x, y, c); } },
  tuft(g, v) { const C = ['#2e6a26', '#4a9a34', '#7ac852']; for (let i = 0; i < 7; i++) { const x = 5 + i * 0.9; g.line(x, 13, x + (i - 3) * 0.35, 8 + (i % 3), C[i % 3], 0.5); } },
  pebbles(g, v) { for (let i = 0; i < 3 + v % 2; i++) { const x = 4 + U.hash(i, v, 2) * 8, y = 8 + U.hash(v, i, 2) * 5, r = 0.8 + U.hash(i, i, 2) * 0.8; g.ell(x, y, r * 1.3, r, U.shades('#8a8478')); } },
  mushroom(g, v) { const cap = v % 2 ? '#d84a3a' : '#b88a5a'; [[6, 11, 1.6], [9.5, 12.5, 1.1], [8, 9.5, 0.9]].forEach(([x, y, r]) => { g.rect(x - 0.35, y, 0.7, 1.6, U.shades('#f0e0c0')); g.ell(x, y, r * 1.4, r, U.shades(cap)); if (v % 2) g.dot(x - 0.4, y - 0.3, '#ffffff'); }); },
  fern(g, v) { const C = U.shades('#3a8a3a'); [[-1.2, -0.6], [-0.5, -1.1], [0.4, -1.1], [1.1, -0.5]].forEach(([dx, dy]) => { for (let i = 0; i < 6; i++) { const x = 8 + dx * i, y = 13 + dy * i; g.ell(x, y, 0.9 - i * 0.1, 0.45, C); } }); },
  leaves(g, v) { const cols = ['#c8782a', '#a8582a', '#d8a83a', '#8a4a2a']; for (let i = 0; i < 6; i++) g.ell(3 + U.hash(i, v, 3) * 10, 6 + U.hash(v, i, 3) * 8, 0.9, 0.5, U.shades(cols[(i + v) % 4])); },
  stump(g, v) { g.ell(8, 12, 3, 1.6, U.shades('#6a4626')); g.ell(8, 11, 2.6, 1.2, U.shades('#c8a070')); g.hline(7, 11, 9, 11, '#8a6a40'); g.ell(8, 11, 1, 0.5, U.shades('#a88050')); },
  log(g, v) { g.ell(8, 11.5, 5.5, 1.5, U.shades('#6a4626')); g.ell(13, 11.5, 1, 1.4, U.shades('#c8a070')); g.hline(4, 11, 12, 11, '#4a2e16'); g.ell(5, 10.2, 1, 0.5, U.shades('#5aa03a')); },
  bones(g, v) { const B = U.shades('#e8e0c8'); g.line(4, 12, 10, 10, B[1], 0.6); g.ell(4, 12, 0.8, 0.8, B); g.ell(10, 10, 0.8, 0.8, B); g.ell(12, 12.5, 1.5, 1.2, B); g.dot(11.6, 12.3, '#2a2020'); g.dot(12.4, 12.3, '#2a2020'); },
  shard(g, v) { const C = U.shades('#3a2a4a'); g.poly([[6, 13], [7, 8], [8.5, 13]], C); g.poly([[8, 13], [10, 9.5], [11, 13]], C); g.hline(7, 8.5, 7.3, 12.5, '#9a7ab8'); },
  vent(g, v) { g.ell(8, 11, 3.5, 1.8, U.shades('#1a1212')); g.ell(8, 11, 2, 1, U.shades('#ff6a1a')); g.dot(8, 10.6, '#ffe080'); },
  reeds(g, v) { for (let i = 0; i < 5; i++) { const x = 5 + i * 1.5; g.line(x, 13, x + (i - 2) * 0.3, 5 + (i % 2) * 2, '#6a8a3a', 0.5); if (i % 2 === 0) g.ell(x + (i - 2) * 0.3, 6 + (i % 2) * 2, 0.5, 1.4, U.shades('#6a4022')); } },
  puddle(g, v) { g.ell(8, 11, 5, 2, U.shades('#3a5a62')); g.hline(5, 10.2, 9, 10.2, '#9ac0c8'); },
  bush(g, v) { const C = v % 2 ? '#4a9a34' : '#3a7a3a'; g.ell(8, 10.5, 4.5, 3, U.shades(U.mix(C, '#000', 0.2))); g.ell(6.5, 9.6, 2.5, 2.2, U.shades(C)); g.ell(9.8, 9.4, 2.4, 2.2, U.shades(C)); if (v % 3 === 0) [[6, 9], [9.5, 8.6], [8, 11]].forEach(([x, y]) => g.dot(x, y, '#ff5a6a')); },
  gravel(g, v) { for (let i = 0; i < 10; i++) g.dot(2 + U.hash(i, v, 4) * 12, 6 + U.hash(v, i, 4) * 8, ['#a8a090', '#6a645a', '#c8c0b0'][i % 3]); },
  crack(g, v) { let x = 4, y = 8; for (let i = 0; i < 8; i++) { g.hline(x, y, x + 1, y + 0.5, '#3a3530'); x += 1; y += U.hash(i, v, 5) < 0.5 ? 0.5 : -0.5; } },
};
SPR.decal = (type, v) => SPR.get(`dc_${type}_${v}`, () => { const g = new G.Pix(16, 16, ENV_K); SPR.DECAL[type](g, v); g.outline('#10180c').outline('#10180c').polish(0.02, v + 31); return g.toCanvas(); });
// bordure douce d'un sol sur son voisin (transition)
const TILE_PRIO = { '~': 0, 'l': 0, 'w': 1, 's': 2, '_': 3, 'p': 4, 'm': 5, 'v': 5, 'r': 6, '.': 7, ',': 7, 'g': 7, 'f': 8 };
SPR.prio = ch => TILE_PRIO[ch] ?? -1;
// side : 0 haut, 1 droite, 2 bas, 3 gauche (côté d'où vient le voisin)
SPR.fringe = (ch, side, v) => SPR.get(`fr_${ch}_${side}_${v}`, () => {
  const src = SPR.tile(ch, v), c = U.canvas(RS, RS), x = c.getContext('2d');
  x.drawImage(src, 0, 0);
  const img = x.getImageData(0, 0, RS, RS), D = img.data, grassy = TILE_KIND[ch] === 'grass';
  for (let Y = 0; Y < RS; Y++) for (let X = 0; X < RS; X++) {
    const px = (X + 0.5) / EQ, py = (Y + 0.5) / EQ, TL = TS - 0.5;
    const along = side === 0 || side === 2 ? px : py, depth = side === 0 ? py : side === 2 ? TL - py : side === 1 ? TL - px : px;
    const lim = 2.5 + tn(along, side * 7, 4, 200 + v) * 4 + (grassy && U.hash(Math.floor(along), side, v + 300) < 0.3 ? 3 : 0) + (gr(along, side, v + 310) - 0.5) * 0.8;
    const i = (Y * RS + X) * 4;
    if (depth > lim) D[i + 3] = 0;
    else if (depth > lim - 0.6) { D[i] *= 0.68; D[i + 1] *= 0.68; D[i + 2] *= 0.68; }
    else if (depth > lim - 1.1) { D[i] *= 0.84; D[i + 1] *= 0.84; D[i + 2] *= 0.84; }
  }
  x.putImageData(img, 0, 0); c._d = 4;
  return c;
});
// Falaises : face supérieure et paroi
SPR.cliffTop = (volc, v, snow) => SPR.get(`ct_${volc ? 1 : 0}_${v}_${snow ? 1 : 0}`, () => {
  const P = Painter(), pal = volc ? ['#241c1a', '#342826', '#463632', '#5a4642', '#6e5650'] : ['#6e7076', '#868890', '#9ea0a4', '#b6b7b6', '#d0d0ca'];
  P.fill((x, y) => rampQ(pal, tfbm(x, y, volc ? 111 : 113) * 0.9 + 0.05 + (gr(x, y, v + 120) - 0.5) * 0.16));
  for (let c = 0; c < 3; c++) { let cx = U.hash(c, v, 130) * TS, cy = U.hash(v, c, 130) * TS; for (let i = 0; i < 8; i++) { P.wset(cx, cy, pal[0]); P.wset(cx + 1, cy + 1, pal[4], 0.4); cx += U.hash(i, c, 131) < 0.5 ? 1 : -1; cy += 1; } }
  for (let k = 0; k < 3; k++) {
    const rx = 3 + U.hash(k, v, 145) * 26, ry = 3 + U.hash(v, k, 145) * 26, rr = 1.5 + U.hash(k, k, 146) * 1.5;
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const d = (x * x + y * y) / (rr * rr); if (d < 1) P.wset(rx + x, ry + y, x + y < -1 ? pal[4] : x + y > 1 ? pal[0] : pal[2]); }
  }
  if (!volc && v % 2 === 0) for (let k = 0; k < 8; k++) { const mx = U.hash(k, v, 140) * TS, my = U.hash(v, k, 140) * TS; P.wset(mx, my, '#6a8a42', 0.9); P.wset(mx + 1, my, '#8aaa5a', 0.7); }
  if (volc && v % 3 === 0) for (let k = 0; k < 5; k++) P.wset(U.hash(k, v, 141) * TS, U.hash(v, k, 141) * TS, '#ff6a2a', 0.8);
  if (snow) P.each((x, y) => { const n = tfbm(x, y, 150 + v); if (n > 0.48) P.dot(x, y, n > 0.62 ? '#ffffff' : n > 0.54 ? '#eef4ff' : '#c8d4e8'); });
  return P.done();
});
SPR.cliffFront = (volc, v) => SPR.get(`cf_${volc ? 1 : 0}_${v}`, () => {
  const c = U.canvas(RS, 32), x = c.getContext('2d'), img = x.createImageData(RS, 32), D = img.data;
  const pal = volc ? ['#120c0c', '#1e1614', '#2a1e1c', '#382826'] : ['#3a3530', '#4a453e', '#5a554c', '#6a645a'];
  for (let Y = 0; Y < 32; Y++) for (let PX = 0; PX < RS; PX++) {
    const y = Y / 2, px = PX / 2;
    const strata = Math.sin(y * 1.1 + tn(px, 0, 8, 160 + v) * 4) * 0.5 + 0.5, crack = tn(px, y * 3, 4, 170 + v) > 0.78;
    let t = 1 - y / 18 + (strata - 0.5) * 0.35 + (U.hash(PX, Y, v + 180) - 0.5) * 0.12;
    if (crack) t -= 0.35;
    let col = U.hex2rgb(pal[Math.max(0, Math.min(3, Math.floor(t * 4)))]);
    if (Y === 0) col = U.hex2rgb(volc ? '#5c4844' : '#b5ae9f');
    if (Y === 1 || Y === 2) col = U.hex2rgb(volc ? '#4a3a36' : '#8f877a');
    if (volc && crack && U.hash(Math.floor(px), Math.floor(y), 3) < 0.3) col = [255, 106, 42];
    const i = (Y * RS + PX) * 4; D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
  }
  x.putImageData(img, 0, 0); c._d = 4;
  return c;
});

// ---------------- Temples : sols, murs, façades, cristaux, mobilier ----------------
// pierre [sombre..clair], joint, accent
SPR.TPAL = {
  terre: { st: ['#33402a', '#46573a', '#5a6e48', '#708656', '#86a064'], j: '#1e2618', acc: '#7ad84a' },
  vent: { st: ['#56607a', '#6c7892', '#8592aa', '#a0acc2', '#bcc6d8'], j: '#363c4e', acc: '#9ae8ff' },
  eau: { st: ['#1c3448', '#26465e', '#305874', '#3c6a88', '#4a7e9c'], j: '#0e1c28', acc: '#43a8ff' },
  feu: { st: ['#24120e', '#341a14', '#46241a', '#5a3022', '#6e3c2a'], j: '#120806', acc: '#ff6a2a' },
  tenebres: { st: ['#160e20', '#20162e', '#2c1e3e', '#3a2850', '#4a3462'], j: '#0a0610', acc: '#b06aff' },
  lumiere: { st: ['#a89e86', '#bfb59c', '#d4cbb2', '#e6dec8', '#f6f0de'], j: '#7a705a', acc: '#ffd860' },
};
TILE_PAINT.temple = (P, v, ch, style) => {
  const T = SPR.TPAL[style] || SPR.TPAL.tenebres, st = T.st;
  // dalles de 16 x 16 (2 x 2 par case), joints, nuances par dalle
  P.fill((x, y) => {
    const bx = Math.floor(x / 16), by = Math.floor(y / 16), lx = x - bx * 16, ly = y - by * 16;
    if (lx < 0.6 || ly < 0.6) return U.hex2rgb(T.j);
    const base = 0.35 + U.hash(bx + v * 2, by, 61) * 0.3, edge = lx < 1.6 || ly < 1.6 ? 0.18 : lx > 15 || ly > 15 ? -0.15 : 0;
    return rampQ(st, base + edge + tfbm(x, y, 63) * 0.25 - 0.12 + (gr(x, y, v + 64) - 0.5) * 0.1);
  });
  fineGrain(P, v, st[4], st[0], 50, 65);
  // fissures
  if (v % 3 === 0) { let cx = 3 + U.hash(v, 1, 66) * 24, cy = 3 + U.hash(v, 2, 66) * 24; for (let i = 0; i < 10; i++) { P.dot(cx, cy, T.j, 0.9); P.dot(cx + 0.5, cy, st[0], 0.6); cx += U.hash(i, v, 67) < 0.5 ? 0.5 : -0.5; cy += 0.5; } }
  // incrustation de l'élément
  if (v === 1 || v === 5) { const cx = 16, cy = 16; for (let a = 0; a < 4; a++) for (let r = 0; r < 4; r += 0.5) { const ang = a * Math.PI / 2; P.dot(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, T.acc, 0.55 - r * 0.1); } P.dot(cx, cy, '#ffffff', 0.6); }
  if (style === 'terre' && v % 2 === 0) for (let k = 0; k < 10; k++) { const x = U.hash(k, v, 68) * TS, y = U.hash(v, k, 68) * TS; P.wset(x, y, '#5a9a3a', 0.8); P.dot(x + 0.5, y, '#8ad860', 0.6); }
  if (style === 'feu' && v % 2 === 1) { let cx = U.hash(v, 3, 69) * TS, cy = 2; for (let i = 0; i < 24; i++) { P.dot(cx, cy, i % 3 ? '#ff6a1a' : '#ffd060', 0.85); cx += U.hash(i, v, 70) < 0.5 ? 0.5 : -0.5; cy += 1; } }
  if (style === 'eau' && v % 3 === 1) { const cx = 10 + v, cy = 20; for (let y = -3; y <= 3; y += 0.5) for (let x = -6; x <= 6; x += 0.5) if (x * x / 36 + y * y / 9 < 1) P.dot(cx + x, cy + y, y < -1 ? '#7ac8e8' : '#3a7aa8', 0.45); }
  if (style === 'lumiere' && v % 2 === 0) for (let k = 0; k < 12; k++) P.dot(U.hash(k, v, 71) * TS, U.hash(v, k, 71) * TS, '#ffe890', 0.7);
  if (style === 'tenebres' && v % 2 === 0) for (let k = 0; k < 8; k++) P.dot(U.hash(k, v, 72) * TS, U.hash(v, k, 72) * TS, '#c88aff', 0.7);
};
TILE_KIND.k = 'temple'; TILE_PRIO.k = 4;
// mur de temple vu de dessus ; front : la face visible (le sol est juste en dessous)
SPR.templeWall = (key, v, front) => SPR.get(`tw_${key}_${v}_${front ? 1 : 0}`, () => {
  const T = SPR.TPAL[key], st = T.st, P = Painter();
  P.fill((x, y) => {
    if (front && y >= 18) {
      // face avant : briques plus sombres
      const row = Math.floor((y - 18) / 5), off = row % 2 ? 6 : 0, lx = (x + off) % 12, ly = (y - 18) % 5;
      if (y < 19) return U.hex2rgb(st[3]);
      if (lx < 0.6 || ly < 0.6) return U.hex2rgb(T.j);
      return rampQ(st, 0.3 + U.hash(Math.floor((x + off) / 12), row + v, 81) * 0.25 + (1 - (y - 18) / 14) * 0.2 + (ly < 1.4 ? 0.12 : 0) + (gr(x, y, 82) - 0.5) * 0.08);
    }
    // dessus : grands blocs
    const row = Math.floor(y / 8), off = row % 2 ? 8 : 0, lx = (x + off) % 16, ly = y % 8;
    if (lx < 0.6 || ly < 0.6) return U.hex2rgb(T.j);
    const b = 0.06 + U.hash(Math.floor((x + off) / 16) + v * 3, row, 83) * 0.16 + (ly < 1.5 ? 0.1 : ly > 7 ? -0.05 : 0);
    const rgb = rampQ(st, b + (gr(x, y, 84) - 0.5) * 0.06 + tfbm(x, y, 85) * 0.1 - 0.05);
    return [rgb[0] * 0.62, rgb[1] * 0.62, rgb[2] * 0.62];
  });
  if (front) { for (let x = 0; x < TS; x += 0.5) { P.dot(x, 17.5, st[4], 0.8); P.dot(x, 31.5, '#000000', 0.35); } }
  if (key === 'terre' && v % 2 === 0) for (let k = 0; k < 8; k++) { const x = U.hash(k, v, 86) * TS, y = U.hash(v, k, 86) * 14; P.wset(x, y, '#4a8a2a', 0.85); P.dot(x + 0.5, y + 0.5, '#7ac84a', 0.6); }
  if (key === 'tenebres' && front && v === 1) for (let y = 20; y < 30; y += 0.5) P.dot(16, y, '#b06aff', 0.5);
  return P.done();
});
// façade de temple (3 cases de large) : marches, colonnes, fronton, emblème du cristal
SPR.templeFacade = (key, sealed) => SPR.get(`tf_${key}_${sealed ? 1 : 0}`, () => {
  const T = SPR.TPAL[key], st = T.st, S3 = [st[1], st[2], st[4]], D3 = [st[0], st[1], st[3]], g = new G.Pix(48, 58, ENV_K), B = 57, acc = G.TEMPLES[key].col;
  g.rect(1, B - 4, 46, 4, S3); g.rect(4, B - 7, 40, 3, S3); g.rect(7, B - 9, 34, 2, S3);
  g.rect(8, 20, 32, B - 29, D3);
  for (let r = 0; r < 7; r++) g.hline(8, 22 + r * 4, 40, 22 + r * 4, T.j);
  g.poly([[18, B - 9], [18, 33], [24, 28], [30, 33], [30, B - 9]], ['#05030a', '#0c0814', '#1a1424']);
  [[7, 'L'], [15.5, 'L'], [32.5, 'R'], [41, 'R']].forEach(([cx]) => { g.rect(cx - 2, 18, 4, B - 27, S3); g.rect(cx - 2.8, 16.5, 5.6, 2, S3); g.rect(cx - 2.8, B - 10.5, 5.6, 1.6, S3); g.hline(cx - 0.6, 19, cx - 0.6, B - 11, st[4]); g.hline(cx + 1, 19, cx + 1, B - 11, st[0]); });
  g.poly([[3, 17], [24, 3], [45, 17]], [st[2], st[3], st[4]]); g.rect(2, 15.5, 44, 2.5, S3);
  g.poly([[9, 15.5], [24, 6.5], [39, 15.5]], D3);
  // emblème : losange du cristal
  g.poly([[24, 7.5], [27, 11], [24, 15], [21, 11]], MON.sh(sealed ? '#6a3a9a' : acc, 0.5, 0.55));
  g.hline(24, 8.5, 24, 14, '#ffffff');
  if (key === 'terre') { [[4, 30], [44, 40], [10, 50]].forEach(([x, y]) => g.ell(x, y, 2.5, 1.5, U.shades('#4a8a2a'))); }
  if (key === 'feu') { [[12, B - 8], [36, B - 8]].forEach(([x, y]) => g.hline(x, y, x + 3, y, '#ff6a1a')); }
  if (sealed) { g.line(17, 34, 31, B - 11, '#8a6aa8', 0.6); g.line(31, 34, 17, B - 11, '#8a6aa8', 0.6); g.ell(24, 40.5, 3.2, 3.2, MON.sh('#6a2a9a', 0.5, 0.5)); g.ell(24, 40.5, 1.6, 1.6, '#e0b0ff'); }
  g.outline('#140c1c').outline('#140c1c').polish(0.02, 41);
  return g.toCanvas();
});
// cristal flottant : pur, corrompu, ténébreux, brisé
SPR.crystal = (key, state) => SPR.get(`cr_${key}_${state}`, () => {
  const g = new G.Pix(20, 36, 8); g.smooth = true;
  const base = state === 'corrupt' ? '#5a2a7a' : state === 'dark' ? '#2a1240' : G.TEMPLES[key].col, P = MON.sh(base, 0.55, 0.6), L = MON.lt(base, 0.6), Dk = MON.dk(base, 0.5);
  if (state === 'broken') {
    [[5, 33, -0.4], [10, 34, 0.2], [15, 33, 0.5], [8, 31, -0.1], [13, 31, 0.3]].forEach(([x, y, a], i) => g.poly([[x - 1.6, y + 1], [x + Math.sin(a) * 3, y - 3 - i % 3], [x + 1.6, y + 1]], MON.sh('#3a2050', 0.5, 0.4)));
    g.outline('#140c1c').outline('#140c1c'); return g.toCanvas(2);
  }
  // facettes
  g.poly([[10, 1], [17, 12], [14, 30], [10, 34], [6, 30], [3, 12]], P);
  g.poly([[10, 1], [10, 34], [6, 30], [3, 12]], MON.sh(MON.lt(base, 0.2), 0.45, 0.6));
  g.poly([[10, 1], [17, 12], [10, 15]], MON.sh(L, 0.35, 0.6));
  g.poly([[10, 15], [17, 12], [14, 30], [10, 34]], MON.sh(Dk, 0.4, 0.4));
  [[10, 1, 10, 34], [3, 12, 10, 15], [17, 12, 10, 15], [6, 30, 10, 15], [14, 30, 10, 15]].forEach(([a, b, c, d]) => g.stroke([[a, b], [c, d]], 0.12, 0.12, MON.lt(base, 0.7)));
  g.blendEll(9, 12, 4, 7, '#ffffff', state === 'pure' ? 0.55 : 0.2, 1);
  g.stroke([[7.5, 6], [6, 13]], 0.3, 0.15, '#ffffff');
  if (state === 'corrupt' || state === 'dark') { [[[9, 5], [11, 11], [8, 17], [12, 24]], [[14, 14], [12, 20]], [[6, 18], [8, 26]]].forEach(c => g.inside(t => t.stroke(c, 0.25, 0.15, state === 'dark' ? '#c88aff' : '#120818'))); }
  // éclats en orbite
  [[1.5, 20, 1.2], [18.5, 22, 1]].forEach(([x, y, r]) => g.poly([[x, y - r * 2], [x + r, y], [x, y + r * 2], [x - r, y]], P));
  g.outline('#140c1c').outline('#140c1c').outline('#140c1c').polish(0, 5);
  return g.toCanvas(2);
});
SPR.brazier = key => SPR.get('bz_' + key, () => {
  const T = SPR.TPAL[key], g = new G.Pix(16, 20, ENV_K), st = T.st;
  g.rect(6.5, 9, 3, 9, [st[1], st[2], st[4]]); g.rect(5, 17.5, 6, 2, [st[0], st[2], st[3]]);
  g.ell(8, 8.5, 5.5, 2.2, [st[0], st[2], st[4]]); g.ell(8, 8, 4.4, 1.4, ['#1a0e08', '#3a1e10', '#5a2e18']);
  g.ell(8, 7.6, 3, 0.9, MON.sh(G.TEMPLES[key].col, 0.4, 0.6));
  g.outline('#140c1c').outline('#140c1c').polish(0.02, 43);
  return g.toCanvas();
});
SPR.pillar = key => SPR.get('pl_' + key, () => {
  const T = SPR.TPAL[key], st = T.st, g = new G.Pix(16, 40, ENV_K), S3 = [st[1], st[3], st[4]];
  g.rect(2.5, 35, 11, 4.5, S3); g.rect(4, 6, 8, 29, S3); g.rect(2.5, 3, 11, 3.5, S3); g.rect(1.5, 1, 13, 2.2, [st[2], st[3], st[4]]);
  for (let i = 0; i < 3; i++) g.hline(5.5 + i * 2.3, 7, 5.5 + i * 2.3, 34, st[1]);
  g.hline(4.8, 7, 4.8, 34, st[4]);
  g.ell(8, 4.5, 1.2, 1, MON.sh(G.TEMPLES[key].col, 0.4, 0.6));
  if (key === 'terre') { g.ell(5, 30, 2.4, 3.5, U.shades('#4a8a2a')); g.ell(11, 14, 1.4, 2.2, U.shades('#4a8a2a')); }
  g.outline('#140c1c').outline('#140c1c').polish(0.02, 45);
  return g.toCanvas();
});
SPR.portal = key => SPR.get('pt_' + key, () => {
  const c = U.canvas(24 * 4, 20 * 4), x = c.getContext('2d'), col = G.TEMPLES[key].col; x.scale(4, 4);
  x.fillStyle = 'rgba(10,8,20,0.55)'; x.beginPath(); x.ellipse(12, 10, 11, 7, 0, 0, Math.PI * 2); x.fill();
  x.strokeStyle = col; x.lineWidth = 0.8; x.beginPath(); x.ellipse(12, 10, 10, 6.4, 0, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 0.4; x.beginPath(); x.ellipse(12, 10, 7, 4.4, 0, 0, Math.PI * 2); x.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.fillStyle = col; x.fillRect(12 + Math.cos(a) * 8.5 - 0.5, 10 + Math.sin(a) * 5.4 - 0.5, 1, 1); }
  x.beginPath(); x.moveTo(12, 6.6); x.lineTo(14, 10); x.lineTo(12, 13.4); x.lineTo(10, 10); x.closePath(); x.fillStyle = col; x.globalAlpha = 0.6; x.fill();
  c._d = 4; return c;
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
SPR.TREE_SIZE = { pine: [20, 34], snowpine: [20, 34], giant: [28, 40], willow: [26, 30] };
SPR.tree = kind => SPR.get('tree_' + kind, () => {
  const [w, h] = SPR.TREE_SIZE[kind] || [20, 30], g = new G.Pix(w, h, ENV_K), cx = w / 2;
  const bark = c => U.shades(c);
  const trunkPoly = (tw, top, col) => { const T = bark(col); g.poly([[cx - tw / 2 - 0.4, h - 1], [cx - tw / 2 + 0.3, top], [cx + tw / 2 - 0.3, top], [cx + tw / 2 + 0.4, h - 1]], T); g.poly([[cx - tw / 2 - 1.6, h - 0.5], [cx - tw / 2, h - 3], [cx - tw / 2 + 0.6, h - 0.5]], T[0]); g.poly([[cx + tw / 2 + 1.6, h - 0.5], [cx + tw / 2, h - 3], [cx + tw / 2 - 0.6, h - 0.5]], T[0]); for (let y = top + 2; y < h - 1; y += 2) g.hline(cx - 0.6 + (y % 4 ? 0.6 : 0), y, cx - 0.4 + (y % 4 ? 0.6 : 0), y + 1.2, T[0]); };
  switch (kind) {
    case 'swamp': case 'volcano': {
      const trunk = bark(kind === 'swamp' ? '#5a5048' : '#2a1e1a');
      g.thick([[10.5, 28], [10.2, 18], [10.5, 12]], 1.8, 1.2, trunk);
      g.thick([[10, 17], [6, 12], [3.5, 6]], 1.1, 0.5, trunk); g.thick([[11, 15], [15, 10], [17, 4]], 1.1, 0.5, trunk); g.thick([[10.5, 12], [10, 3.5]], 1, 0.5, trunk);
      g.thick([[6, 12], [4, 13.5]], 0.6, 0.4, trunk); g.thick([[15, 10], [17.5, 11]], 0.6, 0.4, trunk);
      for (let y = 14; y < 28; y += 2.5) g.hline(9.6, y, 10.4, y + 1.5, trunk[0]);
      if (kind === 'swamp') { g.ell(5, 12.5, 1.4, 2.6, U.shades('#6a8a4a')); g.ell(15.5, 10.5, 1.2, 2.4, U.shades('#6a8a4a')); g.ell(11, 7, 1, 2, U.shades('#7a9a5a')); }
      else { [[4, 6], [16.5, 4.5], [10, 4]].forEach(([x, y]) => { g.dot(x, y, '#ffb040'); g.dot(x + 0.5, y, '#ff6a20'); }); }
      g.ell(10.5, 28.3, 3, 1, trunk[0]);
      break;
    }
    case 'pine': case 'snowpine': {
      trunkPoly(2.2, h - 8, '#5a3a22');
      const L = kind === 'snowpine' ? '#2e5a46' : '#2a6234';
      for (let i = 0; i < 5; i++) {
        const ty = 2 + i * 5.2, bw = 3 + i * 1.9, by = ty + 7;
        g.poly([[cx, ty], [cx + bw, by], [cx - bw, by]], [U.mix(L, '#000', 0.3), L, U.mix(L, '#d8ff9a', 0.3)]);
        g.poly([[cx, ty + 1], [cx + bw, by], [cx + 0.5, by]], U.mix(L, '#000', 0.25));
        for (let k = -bw + 1; k < bw; k += 1.5) g.dot(cx + k, by - 0.5, U.mix(L, '#000', 0.4));
        if (kind === 'snowpine') { g.poly([[cx, ty], [cx + bw * 0.55, ty + 4], [cx - bw * 0.55, ty + 4]], ['#c8d4e8', '#eef4ff', '#ffffff']); }
      }
      break;
    }
    case 'birch': {
      const T = ['#a8a8a0', '#e8e8e0', '#ffffff'];
      g.poly([[cx - 1, h - 1], [cx - 0.7, 14], [cx + 0.7, 14], [cx + 1, h - 1]], T);
      [16, 19, 22.5, 25.5].forEach((y, i) => g.rect(cx - 1 + (i % 2) * 0.8, y, 1.2, 0.6, '#2a2a2a'));
      g.thick([[cx, 16], [cx - 4, 11]], 0.4, 0.3, T); g.thick([[cx, 15], [cx + 4, 10]], 0.4, 0.3, T);
      foliage(g, cx, 10, 7, 7.5, '#8ac040', 31, 22); foliage(g, cx - 4.5, 13, 3, 2.6, '#9ad04a', 32, 6); foliage(g, cx + 4.5, 12.5, 3, 2.6, '#9ad04a', 33, 6);
      break;
    }
    case 'autumn': case 'cherry': {
      trunkPoly(2.6, 17, '#5a3a24');
      const base = kind === 'autumn' ? '#d8642a' : '#f0a0c0';
      foliage(g, cx, 12, 9, 8, base, kind === 'autumn' ? 41 : 42, 26); foliage(g, cx - 4.5, 15.5, 3.6, 3, kind === 'autumn' ? '#e8a030' : '#f8c0d8', 43, 6); foliage(g, cx + 4.5, 15.5, 3.6, 3, kind === 'autumn' ? '#c8402a' : '#e890b0', 44, 6);
      if (kind === 'cherry') for (let i = 0; i < 8; i++) g.dot(3 + U.hash(i, 2, 45) * 14, 5 + U.hash(i, 3, 45) * 13, '#ffffff');
      break;
    }
    case 'willow': {
      trunkPoly(3, 14, '#5a4a32');
      foliage(g, cx, 9, 10, 6.5, '#6a9a3a', 51, 20);
      for (let i = 0; i < 16; i++) { const x = 3 + i * 1.3, y0 = 10 + U.hash(i, 1, 52) * 3, len = 6 + U.hash(i, 2, 52) * 8; g.line(x, y0, x + (i % 2 ? 0.4 : -0.4), y0 + len, i % 3 ? '#6aa03e' : '#4a7a2e', 0.6); }
      break;
    }
    case 'giant': {
      trunkPoly(5, 22, '#4a3424');
      g.thick([[cx - 2, h - 1], [cx - 7, h - 0.5]], 1, 0.6, bark('#4a3424')); g.thick([[cx + 2, h - 1], [cx + 7, h - 0.5]], 1, 0.6, bark('#4a3424'));
      foliage(g, cx, 20, 13, 6, '#24582a', 61, 22); foliage(g, cx, 13, 11, 6.5, '#2a6430', 62, 20); foliage(g, cx, 6.5, 7.5, 5.5, '#307034', 63, 14);
      [[8, 16], [18, 12], [12, 6], [20, 19]].forEach(([x, y]) => { g.dot(x, y, '#c8fff0'); g.dot(x + 0.5, y, '#7affd8'); });
      break;
    }
    default: {
      trunkPoly(3, 17, '#6a4626');
      if (kind === 'forest') {
        foliage(g, 10, 18, 9, 5, '#2f6a2a', 1, 14); foliage(g, 10, 12, 7.6, 5, '#326e2c', 2, 12); foliage(g, 10, 6.5, 5.4, 4.6, '#367430', 3, 10); foliage(g, 10, 2.6, 2.6, 2.4, '#3a7a34', 4, 4);
      } else {
        foliage(g, 10, 13, 9.2, 8.2, '#4a9a34', kind === 'fruit' ? 5 : 6, 26); foliage(g, 5.5, 16, 3.6, 3, '#4a9a34', 7, 5); foliage(g, 14.5, 16, 3.6, 3, '#4a9a34', 8, 5);
        if (kind === 'fruit') [[7, 13], [13, 9], [10, 16], [5, 10], [15, 14]].forEach(([x, y]) => { g.ell(x, y, 0.9, 0.9, U.shades('#e8303a')); g.dot(x - 0.3, y - 0.4, '#ffd0d0'); });
      }
    }
  }
  g.outline('#10180c').outline('#10180c').polish(0.03, 11);
  return g.toCanvas();
});
SPR.node = (type, depleted) => SPR.get(`n_${type}_${depleted ? 1 : 0}`, () => {
  const g = new G.Pix(20, 24, ENV_K);
  const rock = U.shades('#8a8478'), rockD = U.shades('#6a645a');
  if (depleted) {
    if (type === 'arbre' || type === 'vieil_arbre') { g.ell(10, 20.5, 3, 1.6, U.shades('#6a4626')); g.ell(10, 20, 2.2, 0.9, U.shades('#d8b888')); g.hline(9, 20, 11, 20, '#a8805a'); }
    else if (type === 'herbe' || type === 'fibre') { [8, 9.5, 11, 12].forEach((x, i) => g.line(x, 22, x + (i % 2 ? 0.5 : -0.5), 19.5 + (i % 2), '#4a7a30', 0.5)); }
    else { g.ell(8, 20.5, 2.2, 1.4, rockD); g.ell(12, 21.2, 1.7, 1.1, rock); g.ell(10.5, 22, 1, 0.7, rock); }
    g.outline('#10180c').outline('#10180c').polish(0.03, 13); return g.toCanvas();
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
  g.outline('#10180c').outline('#10180c').polish(0.03, 15);
  return g.toCanvas();
});
SPR.chest = open => SPR.get('chest' + (open ? 1 : 0), () => {
  const g = new G.Pix(16, 16, ENV_K), W = U.shades('#8a5a2a'), Gd = U.shades('#e8b840');
  if (open) { g.rect(2, 3.5, 12, 4.5, ['#3a2410', '#5a3a1e', '#7a5230']); g.ell(8, 8, 4, 1.2, U.shades('#ffd860')); }
  else g.poly([[2, 9], [2, 6.5], [4, 4.6], [12, 4.6], [14, 6.5], [14, 9]], W);
  g.rect(2, 8.5, 12, 6.5, W);
  for (let x = 4.5; x < 13; x += 2.5) g.hline(x, 9.5, x, 14.5, W[0]);
  g.rect(2, 8.3, 12, 0.9, Gd); g.rect(2, 5, 1, 10, Gd); g.rect(13, 5, 1, 10, Gd);
  g.rect(7, 7.6, 2, 2.8, Gd); g.dot(7.8, 8.8, '#3a2410');
  g.outline('#140c1c').outline('#140c1c').polish(0.02, 17); return g.toCanvas();
});
SPR.sign = () => SPR.get('sign', () => {
  const g = new G.Pix(16, 16, ENV_K), W = U.shades('#9a6a3a');
  g.rect(7, 9, 2, 7, W); g.rect(2, 3, 12, 7, W);
  [4.5, 6.5].forEach(y => g.hline(4, y, 11, y, '#5a3a1e')); g.hline(4, 8, 9, 8, '#5a3a1e');
  g.hline(2.5, 3.5, 13.5, 3.5, '#c8945a'); g.dot(3, 4, '#3a2412'); g.dot(12.6, 4, '#3a2412');
  g.outline('#140c1c').outline('#140c1c').polish(0.02, 19); return g.toCanvas();
});
SPR.lamp = () => SPR.get('lamp', () => {
  const g = new G.Pix(10, 26, ENV_K), M = U.shades('#3a3440');
  g.rect(4.2, 8, 1.6, 17, M); g.rect(2.5, 23.5, 5, 2.5, M); g.rect(3.5, 22, 3, 1.6, M);
  g.poly([[1.5, 2.5], [5, 0.5], [8.5, 2.5]], U.shades('#2a2430'));
  g.rect(2, 2.4, 6, 5.6, U.shades('#2a2430')); g.rect(2.8, 3, 4.4, 4.4, ['#ffc860', '#ffe08a', '#fff8d0']); g.dot(3.5, 3.5, '#ffffff');
  g.hline(5, 3, 5, 7.4, '#2a2430'); g.rect(1.5, 7.8, 7, 0.8, M);
  g.outline('#140c1c').outline('#140c1c').polish(0.02, 21); return g.toCanvas();
});
SPR.stone = () => SPR.get('stone', () => {
  const g = new G.Pix(16, 30, ENV_K), S = U.shades('#7a7a8a'), C = U.shades('#7affd8');
  g.poly([[3, 29], [5, 8], [8, 2], [11, 8], [13, 29]], S);
  [[5, 14, 11, 13], [4.5, 20, 11.5, 21], [4, 25, 12, 24.5]].forEach(([a, b, c, d]) => g.hline(a, b, c, d, S[0]));
  g.poly([[6, 22], [8, 7.5], [10, 22]], C); g.hline(8, 8.5, 8, 21, '#e8fff8'); g.dot(7.5, 12, '#ffffff');
  g.rect(1, 27, 14, 3, U.shades('#5a5a66')); g.hline(1, 27.2, 15, 27.2, '#8a8a9a');
  g.outline('#140c1c').outline('#140c1c').polish(0.02, 23); return g.toCanvas();
});
SPR.plot = () => SPR.get('plot', () => {
  const c = U.canvas(192, 128), x = c.getContext('2d'); x.scale(4, 4);
  x.fillStyle = '#8a6a3a'; x.fillRect(3, 3, 42, 26);
  for (let i = 5; i < 28; i += 5) { x.fillStyle = '#7a5a30'; x.fillRect(3, i, 42, 1.5); x.fillStyle = '#9a7a48'; x.fillRect(3, i + 1.5, 42, 0.5); }
  for (let k = 0; k < 30; k++) { x.fillStyle = k % 2 ? '#6a4a24' : '#a8885a'; x.fillRect(4 + U.hash(k, 1, 3) * 40, 4 + U.hash(k, 2, 3) * 24, 0.5, 0.5); }
  x.fillStyle = '#c8a86a'; [[3, 3], [43, 3], [3, 27], [43, 27]].forEach(p => { x.fillRect(p[0], p[1] - 4, 2, 6); x.fillStyle = '#8a6a3a'; x.fillRect(p[0] + 1.5, p[1] - 4, 0.5, 6); x.fillStyle = '#c8a86a'; });
  x.fillStyle = '#e8d8a8'; x.fillRect(3, 2, 42, 0.5); x.fillRect(3, 1, 42, 0.5);
  c._d = 4;
  return c;
});

// ---------------- Architecture ----------------
// Chaque style occupe 3 cases de large (48 unités) ; la base du dessin
// correspond au bas de l'emprise au sol, le reste s'élève au-dessus.
const AR = {
  stone(g, x, y, w, h, base, seed) {
    const rowH = 2.5;
    for (let r = 0; r * rowH < h; r++) {
      const yy = y + r * rowH, off = (r % 2) * 2;
      for (let bx = x - off; bx < x + w; ) {
        const bw = 3 + U.hash(bx * 3, r, seed) * 2.5, c = U.mix(base, U.hash(bx, r, seed + 1) < 0.5 ? '#ffffff' : '#000000', U.hash(bx, r, seed + 2) * 0.14);
        const x0 = Math.max(x, bx), x1 = Math.min(x + w, bx + bw), hh = Math.min(rowH, y + h - yy);
        if (x1 > x0) { g.rect(x0, yy, x1 - x0, hh, [U.mix(c, '#000', 0.25), c, U.mix(c, '#fff', 0.25)]); g.hline(x0, yy + hh - 0.5, x1, yy + hh - 0.5, U.mix(base, '#000', 0.45)); g.hline(x1 - 0.5, yy, x1 - 0.5, yy + hh, U.mix(base, '#000', 0.4)); }
        bx += bw;
      }
    }
  },
  plaster(g, x, y, w, h, base, beam, cross) {
    g.rect(x, y, w, h, U.shades(base));
    for (let i = 0; i < w * h * 0.6; i++) g.dot(x + U.hash(i, 1, 9) * w, y + U.hash(i, 2, 9) * h, U.mix(base, '#000', 0.08));
    const B = U.shades(beam), cols = Math.max(2, Math.round(w / 8));
    g.rect(x, y, w, 1.2, B); g.rect(x, y + h - 1.2, w, 1.2, B);
    for (let i = 0; i <= cols; i++) { const bx = x + i * (w - 1.2) / cols; g.rect(bx, y, 1.2, h, B); if (cross && i < cols) { const nx = x + (i + 1) * (w - 1.2) / cols; g.line(bx + 1, y + 1, nx, y + h - 1, B[1], 0.8); g.line(nx, y + 1, bx + 1, y + h - 1, B[1], 0.8); } }
  },
  planks(g, x, y, w, h, base, vertical = true) {
    const n = vertical ? Math.ceil(w / 2) : Math.ceil(h / 2);
    for (let i = 0; i < n; i++) {
      const c = U.mix(base, '#000', U.hash(i, 3, 7) * 0.18);
      if (vertical) { g.rect(x + i * 2, y, Math.min(2, x + w - (x + i * 2)), h, [U.mix(c, '#000', 0.2), c, U.mix(c, '#fff', 0.15)]); g.hline(x + i * 2, y, x + i * 2, y + h, U.mix(base, '#000', 0.45)); }
      else { g.rect(x, y + i * 2, w, Math.min(2, y + h - (y + i * 2)), [U.mix(c, '#000', 0.2), c, U.mix(c, '#fff', 0.15)]); g.hline(x, y + i * 2, x + w, y + i * 2, U.mix(base, '#000', 0.45)); }
    }
  },
  // toit à deux pans : type 'tile' (tuiles), 'slate' (ardoise), 'thatch' (chaume)
  gable(g, x, y, w, h, color, type, over = 2) {
    const R = U.shades(color), cx = x + w / 2;
    g.poly([[x - over, y + h], [cx, y], [x + w + over, y + h]], R);
    const rows = type === 'thatch' ? 1.6 : type === 'slate' ? 1.8 : 2.5;
    for (let yy = y + rows; yy < y + h; yy += rows) {
      const t = (yy - y) / h, half = t * (w / 2 + over), row = Math.round((yy - y) / rows);
      if (type === 'thatch') { for (let xx = cx - half + 0.5; xx < cx + half; xx += 0.5) if (U.hash(xx * 2, row, 4) < 0.45) g.hline(xx, yy - rows, xx + (xx < cx ? -0.3 : 0.3), yy, U.mix(R[1], U.hash(xx * 2, row, 5) < 0.5 ? R[0] : R[2], 0.6)); }
      else {
        g.hline(cx - half + 0.5, yy, cx + half - 0.5, yy, R[0]);
        const step = type === 'slate' ? 2 : 3;
        for (let xx = cx - half + (row % 2) * step / 2; xx < cx + half; xx += step) g.hline(xx, yy - rows + 0.3, xx, yy, U.mix(R[1], R[0], 0.55));
        g.hline(cx - half + 0.5, yy + 0.5, cx + half - 0.5, yy + 0.5, U.mix(R[1], R[2], 0.5));
      }
    }
    if (type === 'thatch') { g.ell(cx, y + h - 0.2, w / 2 + over + 0.6, 1.6, [R[0], R[1], R[1]]); g.ell(cx, y + 1.2, 1.8, 1.4, R); }
    else { g.line(cx - 0.6, y - 0.4, cx + 0.6, y - 0.4, R[0], 1); g.hline(x - over, y + h + 0.2, x + w + over, y + h + 0.2, U.mix(R[0], '#000', 0.35)); }
  },
  window(g, x, y, w, h, frame, opts = {}) {
    const F = U.shades(frame);
    g.rect(x - 0.8, y - 0.8, w + 1.6, h + 1.6, F);
    if (opts.arch) g.ell(x + w / 2, y, w / 2 + 0.8, w / 2 + 0.2, F);
    g.rect(x, y, w, h, ['#a87818', '#ffd870', '#fff4c0']);
    if (opts.arch) g.ell(x + w / 2, y, w / 2, w / 2 - 0.4, ['#a87818', '#ffd870', '#fff4c0']);
    g.hline(x + w / 2, y - (opts.arch ? w / 2 - 0.5 : 0), x + w / 2, y + h, F[0]); g.hline(x, y + h / 2, x + w, y + h / 2, F[0]);
    g.dot(x + 0.6, y + 0.6, '#ffffff');
    if (opts.shutters) { const S = U.shades(opts.shutters); g.rect(x - 2.6, y - 0.6, 1.8, h + 1.2, S); g.rect(x + w + 0.8, y - 0.6, 1.8, h + 1.2, S); g.hline(x - 1.7, y, x - 1.7, y + h, S[0]); g.hline(x + w + 1.7, y, x + w + 1.7, y + h, S[0]); }
    if (opts.box) { g.rect(x - 0.8, y + h + 0.8, w + 1.6, 1.2, U.shades('#7a5230')); [0, 1, 2, 3].forEach(i => g.dot(x + i * w / 3, y + h + 0.6, ['#ff6a8a', '#ffe060', '#ff8ac8', '#ffffff'][(i + Math.round(x)) % 4])); }
  },
  door(g, x, y, w, h, color, opts = {}) {
    const D = U.shades(color);
    if (opts.arch) { g.ell(x + w / 2, y + w / 2, w / 2 + 0.8, w / 2 + 0.8, U.shades('#6a6458')); g.rect(x - 0.8, y + w / 2, w + 1.6, h - w / 2, U.shades('#6a6458')); g.ell(x + w / 2, y + w / 2, w / 2, w / 2, D); }
    else g.rect(x - 0.8, y - 0.8, w + 1.6, h + 0.8, U.shades('#4a3020'));
    g.rect(x, y + (opts.arch ? w / 2 : 0), w, h - (opts.arch ? w / 2 : 0), D);
    for (let xx = x + 1.6; xx < x + w; xx += 1.6) g.hline(xx, y + 0.5, xx, y + h, D[0]);
    if (opts.double) { g.hline(x + w / 2, y, x + w / 2, y + h, D[0]); g.line(x + 0.5, y + 0.5, x + w / 2 - 0.5, y + h - 0.5, D[2], 0.6); g.line(x + w / 2 - 0.5, y + 0.5, x + 0.5, y + h - 0.5, D[2], 0.6); g.line(x + w / 2 + 0.5, y + 0.5, x + w - 0.5, y + h - 0.5, D[2], 0.6); g.line(x + w - 0.5, y + 0.5, x + w / 2 + 0.5, y + h - 0.5, D[2], 0.6); }
    else g.ell(x + w - 1.4, y + h * 0.55, 0.55, 0.55, U.shades('#e8c050'));
  },
  chimney(g, x, y, h, color = '#7a6a64') { AR.stone(g, x, y, 4.5, h, color, 77); g.rect(x - 0.6, y - 1, 5.7, 1.4, U.shades('#4a4446')); },
  sign(g, x, y, icon) {
    g.hline(x - 3, y, x + 2, y, '#2a2020'); g.hline(x - 2.5, y, x - 2.5, y + 1.2, '#2a2020'); g.hline(x + 1.5, y, x + 1.5, y + 1.2, '#2a2020');
    g.rect(x - 3.6, y + 1.2, 6.2, 4.6, U.shades('#a8784a')); g.rect(x - 3, y + 1.8, 5, 3.4, U.shades('#d8b070'));
    const I = { mug: ['#e8c050', '#ffffff'], bed: ['#c84a4a', '#ffffff'], bottle: ['#7affb0', '#3a8a5a'], gem: ['#5ae8ff', '#ffffff'], anvil: ['#5a5a66', '#c8c8d0'], thread: ['#d84a8a', '#ffd0e8'], leaf: ['#4aa83a', '#d8ffb0'], paw: ['#8a5a3a', '#e8c8a0'] }[icon] || ['#ffffff', '#ffffff'];
    g.ell(x - 0.5, y + 3.5, 1.3, 1.1, U.shades(I[0])); g.dot(x - 0.9, y + 3, I[1]);
  },
  barrel(g, x, y) { g.ell(x, y, 1.8, 2.4, U.shades('#8a5a30')); g.hline(x - 1.8, y - 1, x + 1.8, y - 1, '#4a4a52'); g.hline(x - 1.8, y + 1, x + 1.8, y + 1, '#4a4a52'); g.ell(x, y - 2, 1.4, 0.5, U.shades('#a8784a')); },
  crate(g, x, y, s = 3) { g.rect(x, y, s, s, U.shades('#a8784a')); g.line(x + 0.3, y + 0.3, x + s - 0.3, y + s - 0.3, '#6a4a28', 0.5); g.hline(x, y + s / 2, x + s, y + s / 2, '#6a4a28'); },
  ivy(g, x, y, h, seed) { for (let i = 0; i < h * 2; i++) g.ell(x + Math.sin(i * 0.8 + seed) * 1.2, y + i * 0.5, 0.7, 0.5, U.shades(i % 3 ? '#3a8a3a' : '#5aaa4a')); },
  banner(g, x, y, color, emblem) { g.rect(x, y, 3.4, 7, U.shades(color)); g.poly([[x, y + 7], [x + 1.7, y + 5.6], [x + 3.4, y + 7]], U.mix(color, '#000', 0.4)); g.ell(x + 1.7, y + 3, 0.9, 0.9, U.shades(emblem || '#ffe080')); g.hline(x - 0.5, y, x + 3.9, y, '#3a2a1a'); },
  // enseigne lettrée (police pixel 5x7), centrée en cx
  text(g, cx, y, str, col, px = 0.5) {
    const F = { I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'], N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'] };
    const w = [...str].reduce((a, c) => a + (F[c] ? F[c][0].length : 3) + 1, -1) * px;
    let x = cx - w / 2;
    [...str].forEach(c => { const L = F[c]; if (!L) { x += 4 * px; return; } L.forEach((row, j) => [...row].forEach((v, i) => { if (v === '#') { g.rect(x + i * px, y + j * px, px, px, col); g.rect(x + i * px + px * 0.5, y + j * px + px, px * 0.5, px * 0.5, U.mix(col, '#000', 0.55)); } })); x += (L[0].length + 1) * px; });
  },
  innSign(g, cx, y) {
    g.rect(cx - 6, y, 12, 5.2, ['#2a1408', '#4a2a14', '#6a4424']);
    g.rect(cx - 5.4, y + 0.6, 10.8, 4, ['#3a1e0c', '#5a3418', '#7a4a24']);
    AR.text(g, cx, y + 0.85, 'INN', '#ffd860');
    g.dot(cx - 5.6, y + 0.2, '#ffe080'); g.dot(cx + 5.5, y + 0.2, '#ffe080');
  },
  lantern(g, x, y) { g.hline(x, y - 1.5, x, y, '#2a2020'); g.rect(x - 0.8, y, 1.6, 1.8, ['#c88a20', '#ffe080', '#fff8d0']); },
};
SPR.ARCH_H = { cabin: 44, stilt: 50, ruin: 40, altar: 44, timber: 60, tavern: 60, stone: 46, thatch: 44, manor: 64, barn: 50, shop: 50, forge: 54, market: 40, greenhouse: 44, mine: 46, atelier: 56, menagerie: 50 };
SPR.arch = (style, lvl = 1, opt = {}) => SPR.get(`arch_${style}_${lvl}_${JSON.stringify(opt)}`, () => {
  const W = 48, H = SPR.ARCH_H[style] || 50, g = new G.Pix(W, H, ENV_K), B = H - 1; // B : ligne du sol
  const roofC = opt.roof, wallC = opt.wall;
  const foundation = () => g.rect(0.5, B - 1.5, W - 1, 1.8, U.shades('#6a6458'));
  switch (style) {
    case 'cabin': {
      AR.chimney(g, 35, 6, 16, '#7a7068');
      AR.gable(g, 3, 4, 42, 20, roofC || '#4a3a2a', 'slate', 2.5);
      for (let r = 0; r < 8; r++) { const y = 24 + r * 2.4; g.rect(3, y, 42, 2.4, U.shades(r % 2 ? '#8a5a32' : '#7a4e2a')); g.ell(3, y + 1.2, 1.3, 1.2, U.shades('#c8a070')); g.ell(45, y + 1.2, 1.3, 1.2, U.shades('#c8a070')); g.hline(4, y + 2.3, 44, y + 2.3, '#4a2c14'); }
      AR.window(g, 9, 28, 5, 5, '#4a2c14', { shutters: '#5a7a3a' }); AR.door(g, 21, B - 11.5, 6, 11.5, '#5a3a20');
      g.line(21, 22.5, 19, 20, '#e8dcc0', 0.5); g.line(27, 22.5, 29, 20, '#e8dcc0', 0.5); g.ell(24, 23, 1.2, 0.8, U.shades('#a88050'));
      g.rect(33, B - 5, 8, 1, U.shades('#8a5a30')); for (let k = 0; k < 4; k++) g.ell(34 + k * 2, B - 6, 0.9, 1, U.shades('#a8784a'));
      foundation(); break;
    }
    case 'stilt': {
      [6, 18, 30, 42].forEach(x => g.rect(x, 34, 1.6, B - 34, U.shades('#5a4028')));
      g.rect(2, 32, 44, 2.4, U.shades('#7a5a38')); for (let x = 3; x < 46; x += 3) g.hline(x, 32, x, 34.4, '#4a3420');
      g.line(36, 34, 40, B, '#6a4a2a', 0.8); g.line(39, 34, 43, B, '#6a4a2a', 0.8); for (let k = 0; k < 5; k++) g.hline(36.8 + k * 0.8, 36 + k * 3, 39.8 + k * 0.8, 36 + k * 3, '#6a4a2a');
      for (let x = 6; x < 42; x += 1) g.rect(x, 17, 1, 15, U.shades(x % 2 ? '#a88a5a' : '#94784a'));
      g.hline(6, 21, 42, 21, '#6a5030'); g.hline(6, 27, 42, 27, '#6a5030');
      AR.gable(g, 4, 2, 40, 15, roofC || '#5a6a3a', 'thatch', 3);
      AR.window(g, 12, 22, 4, 4, '#4a3420'); AR.door(g, 26, 22, 5, 10, '#4a3420'); AR.lantern(g, 33, 19);
      break;
    }
    case 'ruin': {
      AR.stone(g, 2, 22, 12, B - 22, '#a8a090', 61); g.poly([[2, 22], [6, 18], [9, 21], [14, 16], [14, 22]], '#a8a090'); AR.stone(g, 2, 16, 12, 6, '#a8a090', 62);
      for (let x = 2; x < 14; x += 0.5) { const top = 16 + Math.abs(Math.sin(x * 1.3)) * 5; for (let y = 15; y < top; y += 0.5) g.erase(x, y); }
      [20, 30].forEach((x, i) => { const top = i ? 10 : 18; g.rect(x, top, 5, B - top, ['#8a8478', '#c8c0b0', '#e8e2d4']); for (let y = top + 2; y < B; y += 3) g.hline(x + 1.2, top, x + 1.2, B, '#a8a090'); g.rect(x - 1, B - 2.5, 7, 2.5, U.shades('#a8a090')); if (i) g.rect(x - 1, top - 2, 7, 2, U.shades('#b8b0a0')); });
      AR.stone(g, 36, 28, 10, B - 28, '#9a9286', 63);
      g.ell(15, B - 1.5, 2, 1, U.shades('#9a9286')); g.ell(27, B - 1, 1.5, 0.8, U.shades('#b8b0a0')); g.ell(42, 26, 1.6, 1, U.shades('#9a9286'));
      AR.ivy(g, 4, 18, 9, 3); AR.ivy(g, 31, 12, 12, 5);
      break;
    }
    case 'altar': {
      g.rect(8, B - 6, 32, 6, U.shades('#2a2030')); g.rect(11, B - 9, 26, 3.5, U.shades('#3a2a40'));
      [[12, 6], [36, 6]].forEach(([x, y]) => { g.poly([[x - 3, B - 9], [x - 1, y], [x + 1, y], [x + 3, B - 9]], ['#1a1420', '#3a2a4a', '#6a4a8a']); g.hline(x - 0.3, y + 2, x - 0.5, B - 10, '#9a7ab8'); g.ell(x, y + 6, 1.2, 1.2, ['#c83a10', '#ff8a2a', '#ffe080']); });
      g.ell(24, B - 11, 4, 2, U.shades('#3a2a40')); g.ell(24, B - 12.5, 2.4, 2.4, ['#c83a10', '#ff6a2a', '#ffe080']); g.dot(23.4, B - 13.2, '#ffffff');
      break;
    }
    case 'timber': case 'tavern': {
      AR.chimney(g, 6, 6, 18);
      AR.gable(g, 2, 2, 44, 26, roofC || (style === 'tavern' ? '#8a3a2a' : '#a8402a'), 'tile', 2.5);
      // lucarne
      g.rect(20, 12, 8, 7, U.shades('#e8dcc0')); AR.gable(g, 19.5, 7.5, 9, 5, roofC || '#a8402a', 'tile', 1); AR.window(g, 22, 13.5, 4, 4, '#5a3a22');
      AR.plaster(g, 1, 28, 46, 14, wallC || '#efe4cc', '#4a2e18', true);
      g.rect(0, 41.5, 48, 1.2, U.shades('#3a2414'));
      AR.stone(g, 2, 42.7, 44, B - 44, '#9a9286', 3);
      AR.window(g, 7, 31, 5, 5, '#4a2e18', { box: true }); AR.window(g, 36, 31, 5, 5, '#4a2e18', { box: true });
      AR.window(g, 6, 45, 5, 4.5, '#5a3a22', { shutters: '#3a6a8a' }); AR.window(g, 37, 45, 5, 4.5, '#5a3a22', { shutters: '#3a6a8a' });
      AR.door(g, 20.5, B - 11.5, 7, 11, '#6a4424', { arch: true });
      if (style === 'tavern' || opt.inn) AR.innSign(g, 24, 41.8);
      AR.sign(g, 33, 39, style === 'tavern' ? 'mug' : opt.icon || 'bed'); AR.lantern(g, 17.5, 44); AR.lantern(g, 30.5, 44);
      if (style === 'tavern' || lvl >= 2) { AR.barrel(g, 4, B - 2.5); AR.barrel(g, 44, B - 2.5); }
      if (lvl >= 2) { g.rect(15, 38.5, 18, 1.2, U.shades('#5a3a22')); for (let x = 15.5; x < 33; x += 1.8) g.hline(x, 36.2, x, 38.5, '#5a3a22'); g.hline(15, 36.2, 33, 36.2, '#5a3a22'); }
      if (lvl >= 3) { AR.banner(g, 2, 29, '#c83a3a', '#ffe080'); AR.banner(g, 42.6, 29, '#c83a3a', '#ffe080'); }
      foundation(); break;
    }
    case 'stone': {
      AR.chimney(g, 36, 4, 14);
      AR.gable(g, 3, 4, 42, 20, roofC || '#4a5a7a', 'slate', 2.5);
      AR.stone(g, 2, 24, 44, B - 24, wallC || '#a89e8e', 5);
      AR.ivy(g, 4, 25, 8, 1);
      AR.window(g, 8, 29, 5, 6, '#4a3a2a', { shutters: '#7a3a2a', box: true }); AR.window(g, 35, 29, 5, 6, '#4a3a2a', { shutters: '#7a3a2a', box: true });
      AR.door(g, 20.5, B - 12, 7, 12, '#7a4a28', { arch: true });
      g.ell(24, 14, 2.4, 2.4, U.shades('#4a3a2a')); g.ell(24, 14, 1.8, 1.8, ['#a87818', '#ffd870', '#fff4c0']); g.hline(22.4, 14, 25.6, 14, '#4a3a2a');
      foundation(); break;
    }
    case 'thatch': {
      AR.gable(g, 3, 2, 42, 22, roofC || '#c8a050', 'thatch', 3);
      AR.plaster(g, 3, 24, 42, B - 24, wallC || '#ece2c8', '#6a4a2a', false);
      AR.window(g, 9, 28, 5, 5, '#6a4a2a', { box: true, shutters: '#4a7a3a' }); AR.window(g, 34, 28, 5, 5, '#6a4a2a', { box: true, shutters: '#4a7a3a' });
      AR.door(g, 21, B - 11, 6, 11, '#7a5230');
      g.ell(6, B - 1.5, 2.5, 1.5, U.shades('#4a9a3a')); g.ell(42, B - 1.5, 2.5, 1.5, U.shades('#4a9a3a')); g.dot(6, B - 2.5, '#ff8ac8'); g.dot(42, B - 2.5, '#ffe060');
      foundation(); break;
    }
    case 'manor': {
      // corps principal
      AR.gable(g, 1, 14, 34, 18, roofC || '#5a3a7a', 'slate', 2);
      AR.stone(g, 1, 32, 34, B - 32, wallC || '#b8b0a2', 9);
      AR.window(g, 5, 36, 4.5, 6, '#4a3a2a', { arch: true }); AR.window(g, 27, 36, 4.5, 6, '#4a3a2a', { arch: true });
      AR.door(g, 14.5, B - 13, 7, 13, '#5a3418', { arch: true });
      AR.banner(g, 10.5, 34, '#7a4aa8', '#ffe080'); AR.banner(g, 22.5, 34, '#7a4aa8', '#ffe080');
      // tour ronde
      g.rect(34, 18, 13, B - 18, U.shades('#a8a092')); AR.stone(g, 34.6, 18, 11.8, B - 18, '#b0a898', 11);
      g.poly([[32.5, 19], [40.5, 0.5], [48.5, 19]], U.shades(roofC || '#5a3a7a'));
      for (let y = 4; y < 19; y += 2.2) { const half = (y / 19) * 8; g.hline(40.5 - half, y, 40.5 + half, y, U.mix(roofC || '#5a3a7a', '#000', 0.3)); }
      g.hline(40.5, 0.5, 40.5, -1, '#2a2020'); g.poly([[40.5, -1], [43, 0], [40.5, 1]], '#ffd040');
      AR.window(g, 38.8, 24, 3.4, 5, '#4a3a2a', { arch: true }); AR.window(g, 38.8, 36, 3.4, 5, '#4a3a2a', { arch: true });
      foundation(); break;
    }
    case 'barn': case 'menagerie': {
      const wall = wallC || (style === 'menagerie' ? '#9a3a2a' : '#8a4a2a');
      // toit à la Mansart (grange)
      const R = U.shades(roofC || '#4a3a30');
      g.poly([[1, 22], [6, 9], [24, 2], [42, 9], [47, 22]], R);
      for (let y = 4; y < 22; y += 2) for (let x = 1; x < 47; x += 0.5) if (g.get(Math.floor(x * g.k), Math.floor(y * g.k))) g.dot(x, y, U.mix(R[1], R[0], 0.5));
      AR.planks(g, 3, 22, 42, B - 22, wall, true);
      g.rect(3, 22, 42, 1.2, U.shades('#e8e0d0')); g.rect(3, 22, 1.2, B - 22, U.shades('#e8e0d0')); g.rect(43.8, 22, 1.2, B - 22, U.shades('#e8e0d0'));
      AR.door(g, 17, B - 15, 14, 15, U.mix(wall, '#000', 0.15), { double: true });
      g.rect(20.5, 11, 7, 6, U.shades('#3a2a1a')); g.rect(21, 14, 6, 3, U.shades('#e8c860')); g.hline(21, 14, 27, 13.5, '#fff0a0');
      if (style === 'menagerie') {
        for (let x = 0.5; x < 14; x += 3) { g.rect(x, B - 6, 1, 6, U.shades('#a8784a')); } g.rect(0.5, B - 5, 13, 0.8, U.shades('#a8784a')); g.rect(0.5, B - 2.5, 13, 0.8, U.shades('#a8784a'));
        g.ell(40, B - 2.5, 3.5, 2.5, U.shades('#e8c860')); g.hline(37, B - 3, 43, B - 3, '#c8a040'); AR.sign(g, 37, 24, 'paw');
        if (lvl >= 2) AR.banner(g, 5, 24, '#e8c050', '#8a3a2a');
      } else { AR.crate(g, 4, B - 4); AR.crate(g, 7.5, B - 4); AR.crate(g, 5.5, B - 7.2); AR.barrel(g, 42, B - 2.5); }
      foundation(); break;
    }
    case 'shop': {
      AR.gable(g, 2, 4, 44, 18, roofC || '#3a6aa8', 'tile', 2.5);
      AR.plaster(g, 2, 22, 44, 10, wallC || '#e8dcc0', '#5a3a22', false);
      AR.window(g, 8, 24, 5, 5, '#5a3a22', { box: true }); AR.window(g, 35, 24, 5, 5, '#5a3a22', { box: true });
      // auvent rayé
      for (let x = 1; x < 47; x += 0.5) for (let y = 32; y < 36.5; y += 0.5) g.dot(x, y + (x % 4 < 2 ? 0 : 0), Math.floor(x / 3) % 2 ? (y > 35.5 ? '#c8c0b0' : '#efe8da') : (y > 35.5 ? U.mix(opt.awning || '#3a6aa8', '#000', 0.3) : (opt.awning || '#3a6aa8')));
      for (let x = 1; x < 47; x += 3) g.ell(x + 1.5, 36.6, 1.5, 0.8, Math.floor(x / 3) % 2 ? U.shades('#efe8da') : U.shades(opt.awning || '#3a6aa8'));
      AR.stone(g, 2, 37.5, 44, B - 37.5, '#a89e8e', 13);
      g.rect(5, 39, 12, 7, U.shades('#5a3a22')); g.rect(5.8, 39.8, 10.4, 5.4, ['#7ab8d8', '#a8d8f0', '#e8f8ff']); [7, 10, 13].forEach((x, i) => g.ell(x, 43.6, 1.1, 1.3, U.shades(['#ff6a6a', '#6aff8a', '#6aa8ff'][i])));
      AR.door(g, 21, B - 11, 6, 11, '#6a4424');
      AR.crate(g, 32, B - 4.5, 3.5); AR.crate(g, 36, B - 4.5, 3.5); [33, 37].forEach(x => { g.ell(x + 0.8, B - 5, 1, 0.8, U.shades('#e8402a')); g.ell(x + 2, B - 5, 1, 0.8, U.shades('#ffb030')); });
      AR.barrel(g, 43, B - 2.5);
      foundation(); break;
    }
    case 'forge': {
      AR.chimney(g, 34, 2, 26, '#8a5a48'); if (lvl >= 3) AR.chimney(g, 8, 6, 20, '#8a5a48');
      AR.gable(g, 2, 14, 44, 16, roofC || (lvl >= 3 ? '#4a4a56' : '#5a4a3a'), 'slate', 2);
      AR.stone(g, 2, 30, 44, B - 30, wallC || '#8a8278', 17);
      // atelier ouvert sur le feu
      g.ell(18, 38, 8, 6, U.shades('#3a3030')); g.rect(10, 38, 16, B - 39.5, U.shades('#2a2020'));
      g.ell(18, B - 5, 5, 3, ['#c83a10', '#ff8a2a', '#ffe080']); g.ell(18, B - 5.5, 2.5, 1.5, U.shades('#fff4b0'));
      g.rect(30, B - 6, 6, 2, U.shades('#4a4a52')); g.rect(32, B - 4, 2, 4, U.shades('#3a3a44')); g.rect(29, B - 6.6, 2, 1, U.shades('#4a4a52'));
      AR.barrel(g, 41, B - 2.5); AR.window(g, 39, 33, 4, 4, '#3a2a1a');
      AR.sign(g, 6, 31, 'anvil');
      if (lvl >= 2) AR.banner(g, 26.5, 32, '#c8a040', '#3a3a44');
      foundation(); break;
    }
    case 'market': {
      const stalls = lvl >= 2 ? [[1, '#d83a3a'], [16.5, '#3a7ad8'], [32, '#4aa83a']] : [[4, '#d83a3a'], [27, '#3a7ad8']];
      stalls.forEach(([sx, col], i) => {
        const w = 15;
        g.rect(sx + 1, 18, 1, B - 18, U.shades('#6a4a28')); g.rect(sx + w - 2, 18, 1, B - 18, U.shades('#6a4a28'));
        for (let x = sx; x < sx + w; x += 0.5) for (let y = 14; y < 19; y += 0.5) g.dot(x, y - (Math.abs(x - sx - w / 2) < 3 ? 1 : 0), Math.floor((x - sx) / 2.5) % 2 ? '#f4ecdc' : col);
        for (let x = sx; x < sx + w; x += 2.5) g.ell(x + 1.25, 19.3, 1.25, 0.7, Math.floor((x - sx) / 2.5) % 2 ? U.shades('#f4ecdc') : U.shades(col));
        g.rect(sx + 0.5, 30, w - 1, 3, U.shades('#8a5a30')); g.rect(sx + 0.5, 33, w - 1, B - 33, U.shades('#6a4424'));
        const goods = [['#e8402a', '#ffb030', '#6ad040'], ['#a8c8e8', '#e8e8f0', '#6a8ab0'], ['#d84a8a', '#6a3aa8', '#e8c050']][i % 3];
        for (let k = 0; k < 5; k++) g.ell(sx + 2.5 + k * 2.3, 29.5, 1.1, 0.9, U.shades(goods[k % 3]));
      });
      AR.crate(g, 13, B - 4); AR.barrel(g, 45, B - 2.5);
      if (lvl >= 3) { g.hline(24, 0.5, 24, 14, '#4a3a2a'); g.poly([[24, 0.5], [30, 2.5], [24, 4.5]], U.shades('#ffd040')); }
      break;
    }
    case 'greenhouse': {
      g.rect(2, 20, 44, B - 20, U.shades('#8a6a40'));
      // verrière
      g.poly([[1, 21], [24, 6], [47, 21]], ['#7ab8c8', '#a8dce8', '#e0f8ff']);
      for (let x = 4; x < 46; x += 5) { g.line(24, 6, x, 21, '#e8e0d0', 0.5); }
      g.rect(3, 22, 42, B - 27, ['#6aa8b8', '#9ad0e0', '#d8f4ff']); for (let k = 0; k < 6; k++) g.line(5 + k * 7, 23, 8 + k * 7, 28, '#e8faff', 0.5);
      for (let x = 3; x < 46; x += 4.5) g.hline(x + 0.5, 22, x + 0.5, B - 2, '#e8e0d0');
      for (let k = 0; k < 9; k++) { const px = 5 + k * 4.4, py = B - 7 - (k % 3); g.ell(px, py, 2, 2.4, U.shades(k % 3 ? '#4aa83a' : '#6ac85a')); if (k % 2) g.dot(px, py - 1, ['#ff6a8a', '#ffe060', '#d08aff'][k % 3]); }
      g.rect(2, B - 5, 44, 4, U.shades('#7a5230'));
      AR.door(g, 21, B - 10, 6, 10, '#6a8a6a');
      AR.sign(g, 39, 18, 'leaf');
      if (lvl >= 2) { g.ell(4, B - 1, 2.5, 1.5, U.shades('#d84a8a')); g.ell(44, B - 1, 2.5, 1.5, U.shades('#e8c050')); }
      foundation(); break;
    }
    case 'mine': {
      const Rk = U.shades('#7a7068');
      g.ell(24, 28, 23, 18, Rk); g.ell(10, 22, 10, 10, Rk); g.ell(38, 20, 10, 11, Rk); g.ell(24, 14, 10, 8, Rk);
      for (let k = 0; k < 14; k++) g.hline(4 + U.hash(k, 1, 6) * 40, 12 + U.hash(k, 2, 6) * 26, 6 + U.hash(k, 3, 6) * 40, 14 + U.hash(k, 4, 6) * 26, '#4a443c');
      [[8, 16], [36, 12], [42, 26], [6, 30]].forEach(([x, y]) => { g.ell(x, y, 1.5, 1, U.shades('#5a8a3a')); });
      g.ell(24, 34, 9, 10, '#1a1416'); g.rect(15, 34, 18, B - 34, '#1a1416'); g.ell(24, 36, 6.5, 7, '#0a0608');
      g.rect(14, 26, 2, B - 26, U.shades('#7a5230')); g.rect(32, 26, 2, B - 26, U.shades('#7a5230')); g.rect(13, 25, 22, 2.2, U.shades('#8a6038'));
      for (let y = B - 8; y < B; y += 2) g.hline(18, y, 30, y, '#5a3a22'); g.hline(19.5, B - 9, 19.5, B, '#8a8a92'); g.hline(28.5, B - 9, 28.5, B, '#8a8a92');
      g.rect(36, B - 6, 8, 4, U.shades('#5a5a66')); g.ell(37.5, B - 1.5, 1, 1, U.shades('#2a2a30')); g.ell(42.5, B - 1.5, 1, 1, U.shades('#2a2a30'));
      [[38, B - 7], [40, B - 7.5], [42, B - 7]].forEach(([x, y]) => g.ell(x, y, 1, 0.8, U.shades(lvl >= 3 ? '#5ae8ff' : '#d8823a')));
      AR.lantern(g, 14, 29); AR.lantern(g, 34, 29);
      break;
    }
    case 'atelier': {
      AR.gable(g, 2, 2, 44, 22, roofC || '#3a6aa8', 'tile', 2.5);
      AR.plaster(g, 2, 24, 44, 12, wallC || '#f0e6d0', '#5a3a22', true);
      AR.window(g, 18, 26, 12, 7, '#5a3a22');
      AR.stone(g, 2, 36, 44, B - 36, '#b0a898', 19);
      AR.window(g, 6, 39, 5, 5, '#4a3a2a', { box: true }); AR.window(g, 37, 39, 5, 5, '#4a3a2a', { box: true });
      AR.door(g, 21, B - 11, 6, 11, '#5a3a6a');
      AR.banner(g, 2.5, 25, '#d84a8a', '#ffd0e8'); AR.sign(g, 41, 24, 'thread');
      if (lvl >= 2) { g.hline(-0.5, 23.5, 12, 26, '#e8e0d0'); [[2, 24], [5, 24.5], [8, 25]].forEach(([x, y], i) => g.rect(x, y, 2, 3, U.shades(['#d84a8a', '#3a8ad8', '#e8c050'][i]))); }
      foundation(); break;
    }
  }
  g.outline('#140c1c').outline('#140c1c').polish(0.012, 25);
  return g.toCanvas();
});
// Style des bâtiments du Havre en fonction du niveau
SPR.building = (bid, lvl) => {
  const L = Math.max(1, lvl);
  switch (bid) {
    case 'forge': return SPR.arch('forge', L);
    case 'atelier': return SPR.arch('atelier', L);
    case 'marche': return SPR.arch('market', L);
    case 'menagerie': return SPR.arch('menagerie', L);
    case 'herboristerie': return SPR.arch('greenhouse', L);
    case 'mine': return SPR.arch('mine', L);
    case 'taverne': return SPR.arch('tavern', L);
  }
  return null;
};
// ---------------- Moulin & accessoires de village ----------------
SPR.windmill = () => SPR.get('windmill', () => {
  const g = new G.Pix(32, 52, ENV_K), B = 51;
  g.poly([[6, B], [10, 18], [22, 18], [26, B]], U.shades('#e8dcc0'));
  AR.stone(g, 6, B - 8, 20, 8, '#a89e8e', 23);
  for (let y = 22; y < B - 8; y += 3) g.hline(8 + (B - y) * 0.05, y, 24 - (B - y) * 0.05, y, '#c8bca0');
  g.poly([[7, 19], [16, 6], [25, 19]], U.shades('#8a3a2a')); for (let y = 9; y < 19; y += 2) { const h = (y - 6) / 13 * 9; g.hline(16 - h, y, 16 + h, y, '#6a2a1a'); }
  AR.window(g, 14, 24, 4, 4, '#5a3a22'); AR.door(g, 13.5, B - 8, 5, 8, '#6a4424');
  g.ell(16, 16, 1.4, 1.4, U.shades('#4a3a2a'));
  g.outline('#140c1c').outline('#140c1c').polish(0.012, 27);
  return g.toCanvas();
});
SPR.millBlades = a => SPR.get('blades_' + a, () => {
  const g = new G.Pix(36, 36, ENV_K), c = 18;
  for (let i = 0; i < 4; i++) {
    const ang = a / 8 * Math.PI / 2 + i * Math.PI / 2, ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca;
    g.line(c, c, c + ca * 16, c + sa * 16, '#5a3a22', 0.8);
    for (let t = 4; t < 16; t += 0.5) for (let k = 0.6; k < 4; k += 0.5) g.dot(c + ca * t + px * k, c + sa * t + py * k, (Math.floor(t) + Math.floor(k)) % 3 === 0 ? '#8a6a40' : '#f0e8d8');
  }
  g.ell(c, c, 1.5, 1.5, U.shades('#3a2a1a'));
  g.outline('#140c1c').outline('#140c1c');
  return g.toCanvas();
});
SPR.PROPS = {
  barrel(g) { AR.barrel(g, 8, 12); },
  barrels(g) { AR.barrel(g, 5, 12.5); AR.barrel(g, 10.5, 12.5); AR.barrel(g, 7.8, 9); },
  crates(g) { AR.crate(g, 3, 9.5, 4); AR.crate(g, 7.5, 9.5, 4); AR.crate(g, 5, 5.5, 4); },
  well(g) { AR.stone(g, 3, 8, 10, 6, '#9a9286', 29); g.ell(8, 8, 5, 1.6, U.shades('#6a6458')); g.ell(8, 8, 3.8, 1, '#1a2a3a'); g.rect(3.5, 1, 1, 7, U.shades('#6a4a28')); g.rect(11.5, 1, 1, 7, U.shades('#6a4a28')); g.poly([[2, 2], [8, -0.5], [14, 2]], U.shades('#8a3a2a')); g.hline(4, 3.5, 12, 3.5, '#4a3a2a'); g.rect(7.4, 3.5, 1.2, 2, U.shades('#8a5a30')); },
  hay(g) { g.ell(8, 11, 5.5, 3.6, U.shades('#e8c860')); for (let x = 4; x < 13; x += 1.2) g.hline(x, 8.5, x + 0.4, 13.5, '#c8a040'); g.hline(3, 11, 13, 11, '#8a6a30'); },
  cart(g) { g.rect(2, 7, 11, 4, U.shades('#8a5a30')); g.ell(4.5, 12, 2, 2, U.shades('#5a3a22')); g.ell(10.5, 12, 2, 2, U.shades('#5a3a22')); g.line(13, 9, 15.5, 7.5, '#5a3a22', 0.6); [[4, 6], [6.5, 5.6], [9, 6], [11, 5.8]].forEach(([x, y]) => g.ell(x, y, 1.3, 1, U.shades('#e8402a'))); },
  bench(g) { g.rect(2, 8, 12, 1.4, U.shades('#8a5a30')); g.rect(2, 5, 12, 1.2, U.shades('#8a5a30')); g.rect(3, 9.4, 1, 4, U.shades('#5a3a22')); g.rect(12, 9.4, 1, 4, U.shades('#5a3a22')); },
  flowerpot(g) { g.poly([[5, 9], [11, 9], [10, 14], [6, 14]], U.shades('#b8603a')); g.ell(8, 8, 3.6, 2.4, U.shades('#4a9a3a')); [[6.5, 7], [9, 6.5], [8, 8]].forEach(([x, y], i) => { g.ell(x, y, 0.9, 0.9, U.shades(['#ff6a8a', '#ffe060', '#d08aff'][i])); }); },
  fence(g) { [2, 7.5, 13].forEach(x => g.rect(x, 6, 1.2, 8, U.shades('#a8784a'))); g.rect(1, 7.5, 14, 1, U.shades('#a8784a')); g.rect(1, 10.5, 14, 1, U.shades('#a8784a')); },
};
SPR.prop = type => SPR.get('prop_' + type, () => { const g = new G.Pix(16, 16, ENV_K); SPR.PROPS[type](g); g.outline('#140c1c').outline('#140c1c').polish(0.02, 33); return g.toCanvas(); });

// ---------------- Fontaine, remparts, portiques ----------------
SPR.fountain = f => SPR.get('fountain_' + f, () => {
  const g = new G.Pix(24, 26, ENV_K), S = ['#6a6a76', '#9a9aa8', '#c8c8d4'];
  g.ell(12, 20, 11, 5, S); g.ell(12, 19.5, 9.5, 3.8, U.shades('#2a6ab8'));
  for (let k = 0; k < 6; k++) { const a = (k + f * 0.5) * 1.05; g.ell(12 + Math.cos(a) * 6, 19.5 + Math.sin(a) * 2.4, 1.2, 0.4, '#a8d8ff'); }
  AR.stone(g, 1, 20, 22, 5, '#9a9aa8', 3);
  g.rect(10.6, 9, 2.8, 11, S); g.ell(12, 9.5, 4.2, 1.6, S); g.ell(12, 9.3, 3.2, 1, U.shades('#3a7ac8'));
  g.ell(12, 5, 1.2, 3, ['#7ab8ec', '#bfe0ff', '#ffffff']);
  for (let k = 0; k < 4; k++) { const t = ((f + k * 2) % 8) / 8; g.dot(12 - 3.5 * t - 0.5, 9 + t * t * 10, '#cfe8ff'); g.dot(12 + 3.5 * t, 9 + t * t * 10, '#cfe8ff'); }
  g.outline('#140c1c').outline('#140c1c').polish(0.015, 41);
  return g.toCanvas();
});
SPR.wallSeg = (v, top) => SPR.get(`wall_${v}_${top ? 1 : 0}`, () => {
  const g = new G.Pix(16, 24, ENV_K);
  AR.stone(g, 0, 8, 16, 15, '#9a9286', 43 + v);
  g.rect(0, 6.5, 16, 1.8, U.shades('#b8b0a2'));
  if (v % 2 === 0) { AR.stone(g, 1, 1, 5.5, 6, '#a8a092', 47); AR.stone(g, 9.5, 1, 5.5, 6, '#a8a092', 48); }
  if (v % 3 === 0) AR.ivy(g, 3 + v % 5, 9, 6, v);
  g.rect(0, 22, 16, 2, U.shades('#6a6458'));
  g.outline('#140c1c').outline('#140c1c').polish(0.015, 49);
  return g.toCanvas();
});
SPR.gatePost = (zone, side, horiz) => SPR.get(`gate_${zone}_${side}_${horiz ? 1 : 0}`, () => {
  const g = new G.Pix(16, 36, ENV_K), col = { foret: '#3e9a4a', montagne: '#8aa0c8', marais: '#9a6ad8' }[zone] || '#c8a040';
  const st = { foret: '#8a7650', montagne: '#a8a294', marais: '#74745e' }[zone] || '#a8a294';
  g.rect(3, 31, 10, 4, U.shades(U.mix(st, '#000', 0.25)));
  AR.stone(g, 4, 9, 8, 22, st, 51 + side);
  g.rect(3, 6.5, 10, 2.6, U.shades(U.mix(st, '#fff', 0.15))); g.poly([[4, 6.5], [8, 3], [12, 6.5]], U.shades(U.mix(st, '#000', 0.1)));
  g.rect(6.4, 0.5, 3.2, 3, ['#c88a20', '#ffe080', '#fff8d0']); g.hline(8, 3, 8, 3.5, '#3a2a1a');
  const bx = horiz ? 6.3 : side === 0 ? 10.5 : 2;
  g.rect(bx, 11, 3.4, 11, U.shades(col)); g.poly([[bx, 22], [bx + 1.7, 20.4], [bx + 3.4, 22]], U.mix(col, '#000', 0.4));
  g.ell(bx + 1.7, 14.5, 1, 1, ['#c8a040', '#ffe080', '#fff8d0']); g.hline(bx - 0.4, 11, bx + 3.8, 11, '#3a2a1a');
  g.outline('#140c1c').outline('#140c1c').polish(0.015, 53);
  return g.toCanvas();
});

// ---------------- Camp (tente et feu) ----------------
SPR.camp = f => SPR.get('camp_' + f, () => {
  const g = new G.Pix(32, 32, ENV_K);
  g.poly([[2, 24], [11, 8], [20, 24]], ['#8a5a30', '#c88a4a', '#e8b878']); g.poly([[11, 8], [20, 24], [24, 22], [15, 7]], U.shades('#9a6a3a'));
  g.poly([[8.5, 24], [11, 15], [13.5, 24]], '#2a1a10'); g.hline(11, 7, 11, 24, '#5a3a20');
  g.rect(14.5, 6, 0.6, 2, '#3a2a1a'); g.poly([[15, 6], [18, 6.8], [15, 7.6]], U.shades('#c83a3a'));
  [[22, 27], [28, 27], [25, 25.6], [25, 28.4]].forEach(([x, y]) => g.ell(x, y, 1.8, 0.9, U.shades('#6a6458')));
  g.line(22, 27.5, 28, 26, '#5a3a20', 0.8); g.line(22, 26, 28, 27.5, '#4a2e16', 0.8);
  const fl = [[25, 24, 2.2, 3.4], [24, 23.5 - (f % 2) * 0.6, 1.2, 2.4], [26.2, 24 - ((f + 1) % 2) * 0.5, 1, 2]];
  fl.forEach(([x, y, rx, ry], i) => g.ell(x, y, rx, ry, i === 0 ? ['#c83a10', '#ff8a2a', '#ffe080'] : ['#ff8a2a', '#ffd040', '#fff8c0']));
  g.ell(30, 24, 1.6, 2.4, U.shades('#6a4626')); g.ell(30, 22, 1.8, 0.6, U.shades('#a8784a'));
  g.outline('#140c1c').outline('#140c1c').polish(0.015, 61);
  return g.toCanvas();
});
