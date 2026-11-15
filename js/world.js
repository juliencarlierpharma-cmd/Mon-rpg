'use strict';
// ============================================================
//  Monde : carte, entités, déplacement, collecte, rencontres
// ============================================================
const WALKABLE = new Set(['.', ',', '_', 'f', 'r', 'm', 'w', 'v', 's', 'p', 'g', '=']);
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

G.World = {
  W: 180, H: 134,
  // repères (coordonnées en tuiles)
  BOURG: [74, 74], HAVRE: [132, 96], VX: 128, VY: 42,
  init() {
    this.gen();
    this.defineEntities();
    this.decorate();
    this.placeNodes();
    this.connect();
    this.refresh();
    this.P = { x: 0, y: 0, px: 0, py: 0, dir: 'down', moving: false, t: 0, fx: 0, fy: 0, tx: 0, ty: 0, anim: 0 };
    this.followers = [];
    this.cam = { x: 0, y: 0 };
    this.mining = null;
    this.sinceBattle = 0;
    this.emitT = 0;
  },
  // ---------------- Génération ----------------
  gen() {
    const W = this.W, H = this.H, VX = this.VX, VY = this.VY;
    this.t = []; this.z = [];
    for (let y = 0; y < H; y++) {
      this.t.push([]); this.z.push([]);
      for (let x = 0; x < W; x++) {
        const n = U.fbm(x / 6, y / 6, 11), h = U.hash(x, y, 21);
        let ch = h < 0.07 ? ',' : '.', zone = 'plaines';
        if (n > 0.72 && h < 0.5) ch = 'T';
        if (y <= 32 && x < VX) { zone = 'montagne'; ch = (n > 0.58) ? '^' : 'r'; }
        if (x <= 54 && y >= 38 && y <= 116) { zone = 'foret'; ch = (n > 0.57 || h < 0.08) ? 'T' : 'f'; }
        if (x > VX && y < VY) { zone = 'volcan'; ch = n > 0.69 ? 'l' : 'v'; }
        if ((x === VX && y <= VY) || (y === VY && x >= VX)) { zone = 'volcan'; ch = '^'; }
        if (x >= VX && y > VY && y <= 92) { zone = 'marais'; ch = n > 0.6 ? 'w' : 'm'; if (h < 0.05) ch = 'T'; }
        const rx = 108 + Math.round(Math.sin(y * 0.11) * 5 + Math.sin(y * 0.31) * 1.5);
        if (y >= 36 && y < 122 && x >= rx && x <= rx + 2) ch = '~';
        // lacs des plaines
        if (zone === 'plaines' && y > 36 && y < 120 && U.fbm(x / 9, y / 9, 71) > 0.74 && Math.abs(x - 78) + Math.abs(y - 78) > 14) ch = '~';
        if (y >= 124) ch = '~'; else if (y >= 122) ch = 's';
        if (x === 0 || x === W - 1 || y === 0) ch = y >= 122 ? '~' : (zone === 'foret' ? 'T' : '^');
        this.t[y][x] = ch; this.z[y][x] = zone;
      }
    }
    // lisières : chaque zone sauvage est bordée d'une frontière bien visible
    const EDGE = { foret: 'T', montagne: '^', marais: 'T' };
    const edges = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const z = this.z[y][x];
      if (!EDGE[z]) continue;
      const out = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([dx, dy]) => { const o = this.z[y + dy][x + dx]; return o !== z && o !== 'volcan'; });
      if (out && this.t[y][x] !== '~') edges.push([x, y, EDGE[z]]);
    }
    edges.forEach(([x, y, c]) => { this.t[y][x] = c; });
    // villes
    const [bx, by] = this.BOURG, [hx, hy] = this.HAVRE;
    this.rect(bx, by, 9, 9, 'g', 'bourg');
    this.rect(bx + 3, by + 3, 3, 3, 'p');
    for (let i = 0; i < 9; i++) { this.t[by + 4][bx + i] = 'p'; this.t[by + i][bx + 4] = 'p'; }
    this.rect(hx, hy, 12, 8, 'g', 'havre');
    for (let x = 0; x < 12; x++) this.t[hy + 4][hx + x] = 'p';
    // chemins principaux (les passages à travers les lisières deviennent des portiques)
    this.gates = [];
    const P = (pts) => { for (let i = 0; i < pts.length - 1; i++) this.carve(pts[i], pts[i + 1], '_'); };
    P([[bx - 1, by + 4], [28, by + 4], [28, 59], [16, 59]]);
    P([[28, by + 4], [28, 106], [44, 106], [44, 116]]);
    P([[28, 92], [10, 92], [10, 108]]);
    P([[bx + 4, by - 1], [bx + 4, 28], [68, 28], [68, 11]]);
    P([[bx + 4, 28], [112, 28], [112, 18]]);
    P([[68, 28], [20, 28], [20, 12]]);
    P([[bx + 9, by + 4], [148, by + 4], [148, 68], [163, 68]]);
    P([[148, 84], [170, 84], [170, 72]]);
    P([[148, 68], [148, VY], [148, 16], [154, 16], [154, 13]]);
    P([[148, 30], [172, 30], [172, 8]]);
    P([[bx + 4, by + 9], [bx + 4, hy + 4], [hx - 1, hy + 4]]);
    P([[hx + 5, hy + 8], [hx + 5, 120], [172, 120]]);
    P([[bx + 4, 112], [40, 112]]);
    P([[122, by + 4], [122, 77]]);
    // sol autour des gardiens
    [[16, 58], [68, 10], [164, 68], [154, 12]].forEach(([x, y]) => this.clearAround(x, y, 1));
    this.computeDepth();
  },
  // profondeur de chaque case dans sa région (0 à l'entrée, 1 au plus loin)
  computeDepth() {
    const W = this.W, H = this.H, d = this.depth = Array.from({ length: H }, () => new Float32Array(W).fill(-1));
    const q = [];
    this.gates.forEach(g => { d[g.y][g.x] = 0; q.push([g.x, g.y]); });
    [this.BOURG, this.HAVRE].forEach(([bx, by]) => { for (let y = by - 1; y <= by + 9; y++) for (let x = bx - 1; x <= bx + 12; x++) if (this.z[y] && this.z[y][x] === 'plaines' && d[y][x] < 0) { d[y][x] = 0; q.push([x, y]); } });
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i], z = this.z[y][x];
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || d[ny][nx] >= 0 || this.z[ny][nx] !== z) continue;
        d[ny][nx] = d[y][x] + 1; q.push([nx, ny]);
      }
    }
    const max = {};
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const z = this.z[y][x]; max[z] = Math.max(max[z] || 1, d[y][x]); }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) d[y][x] = d[y][x] < 0 ? 0.5 : d[y][x] / max[this.z[y][x]];
  },
  depthAt(x, y) { return this.depth && this.depth[y] ? this.depth[y][x] : 0; },
  rect(x0, y0, w, h, ch, zone) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { this.t[y][x] = ch; if (zone) this.z[y][x] = zone; } },
  groundOf(zone) { return { foret: 'f', montagne: 'r', marais: 'm', volcan: 'v', bourg: 'g', havre: 'g' }[zone] || '.'; },
  carve(a, b, ch) {
    let [x, y] = a; const [x1, y1] = b;
    let prev = null;
    const put = () => {
      const c = this.t[y][x], z = this.z[y][x];
      if (prev && ch && z !== prev.z && ['foret', 'montagne', 'marais', 'volcan'].includes(z) && !this.gates.some(g => g.x === x && g.y === y))
        this.gates.push({ x, y, z, horiz: prev.y === y });
      prev = { x, y, z };
      if (z === 'bourg' || z === 'havre') { if (!WALKABLE.has(c)) this.t[y][x] = 'g'; return; }
      if (c === '~') this.t[y][x] = '=';
      else if (c !== '=' && c !== 'p') this.t[y][x] = ch || this.groundOf(z);
    };
    put();
    while (x !== x1 || y !== y1) { if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); put(); }
  },
  clearAround(cx, cy, r) {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      if (x <= 0 || y <= 0 || x >= this.W - 1 || y >= this.H - 1) continue;
      if (!WALKABLE.has(this.t[y][x]) || this.t[y][x] === 'w') this.t[y][x] = this.groundOf(this.z[y][x]);
    }
  },
  tile(x, y) { return (x < 0 || y < 0 || x >= this.W || y >= this.H) ? '^' : this.t[y][x]; },
  zoneAt(x, y) { return (this.z[y] && this.z[y][x]) || 'plaines'; },
  // ---------------- Entités ----------------
  defineEntities() {
    const S = () => G.S, E = this.E = [];
    const add = e => { e.w = e.w || 1; e.h = e.h || 1; E.push(e); return e; };
    const [bx, by] = this.BOURG, [hx, hy] = this.HAVRE;
    const B = (x, y) => [bx + x, by + y], Hv = (x, y) => [hx + x, hy + y];
    // --- Bourg-Aube ---
    const house = (id, rx, ry, o) => { const [x, y] = B(rx, ry); add(Object.assign({ k: 'house', id, x, y, w: 3, h: 2, door: [x + 1, y + 1] }, o)); };
    house('inn', 0, 0, { arch: 'timber', aopt: { icon: 'bed', inn: true }, roof: '#a83a2a', wall: '#e8d8b8', label: 'Auberge', act: () => G.UI.inn('bourg'), opts: { sign: true, chimney: true } });
    house('shop_obj', 6, 0, { arch: 'shop', aopt: { awning: '#3a6aa8' }, roof: '#3a6aa8', wall: '#e8dcc0', label: 'Échoppe', act: () => G.UI.shop(G.SHOPS.bourg_obj), opts: { awning: '#3a6aa8' } });
    house('shop_mat', 0, 6, { arch: 'barn', aopt: { wall: '#7a5a3a', roof: '#3a5a3a' }, roof: '#3a8a4a', wall: '#d8c8a0', label: 'Comptoir', act: () => G.UI.shop(G.SHOPS.bourg_mat), opts: { awning: '#c87a2a' } });
    house('elder', 6, 6, { arch: 'manor', aopt: {}, roof: '#7a4aa8', wall: '#e8e0d0', label: 'Maison de l’Ancien', act: () => this.elderTalk(), opts: { banner: '#7a4aa8' } });
    add({ k: 'fountain', x: bx + 4, y: by + 4 });
    [B(3, 2), B(5, 2), B(3, 6), B(5, 6), Hv(4, 3), Hv(6, 3), Hv(3, 7), Hv(8, 7)].forEach(([x, y], i) => add({ k: 'lamp', x, y, show: i < 4 ? null : () => S().town.founded }));
    add({ k: 'sign', x: bx - 1, y: by + 3, text: '← Forêt de Sylve (ouest)\n↑ Monts Grisés (nord)\n→ Marais Brumeux (est)\n↓ Site du Havre (sud-est)' });
    add({ k: 'sign', x: hx - 1, y: hy + 3, text: 'Site du Havre — terre d’accueil.\n« Ici renaîtra l’espoir. »' });
    add({ k: 'sign', x: 147, y: 46, text: 'Au nord : le Volcan Cendreux.\nUne barrière de flammes en garde l’entrée.' });
    const [fx1, fy1] = B(2, 3), [gx1, gy1] = B(5, 7), [dx1, dy1] = B(8, 3);
    add({ k: 'npc', id: 'v_farmer', x: fx1, y: fy1, pal: { H: '#8a6a3a', C: '#6a8a3a', D: '#3a5a24', B: '#4a3a22' }, name: 'Paysan', lines: ['Tu peux arracher du bois aux arbres à mains nues, comme un sauvage !', 'Avec trois bûches, fabrique une pioche en bois (Menu → Artisanat → Outils).', 'Ensuite pierre, fer… chaque outil ouvre de nouveaux filons.'] });
    add({ k: 'npc', id: 'v_girl', x: gx1, y: gy1, pal: { H: '#e8b040', C: '#d85a8a', D: '#8a2a5a', B: '#4a3a22' }, name: 'Fillette', lines: ['Les familiers aiment se battre aux côtés de leur maître.', 'Plus l’affinité grandit, plus ils débloquent de synergies !', 'Et si l’élément du familier correspond à l’arme équipée… ça résonne !'] });
    add({ k: 'npc', id: 'v_guard', x: dx1, y: dy1, pal: { H: '#5a5a6a', C: '#8a8a9a', D: '#4a4a5a', B: '#2a2a2a', L: '#c8a040' }, name: 'Garde', lines: ['Ici, aucun marchand ne vend d’armes ni d’armures.', 'Tout se forge avec les matériaux arrachés aux monstres.', 'Les lisières de forêt, les falaises et les marais marquent la frontière de chaque région : suis les portiques pour y entrer.'] });
    // --- PNJ recrutables (position d'origine) ---
    const home = { dorn: B(6, 3), pell: B(2, 5), lise: B(3, 1), mira: [62, 80], yuna: [64, 96], fen: [122, 76], grom: [110, 20] };
    const havre = { dorn: Hv(0, 3), mira: Hv(2, 3), pell: Hv(8, 3), lise: Hv(10, 3), yuna: Hv(2, 7), fen: Hv(5, 7), grom: Hv(9, 7) };
    Object.keys(G.NPCS).forEach(id => {
      const N = G.NPCS[id];
      add({ k: 'npc', id: 'r_' + id, npc: id, x: home[id][0], y: home[id][1], pal: N.pal, name: `${N.n} (${N.job})`, show: () => !S().npcs[id], act: () => this.recruitTalk(id) });
      add({ k: 'npc', id: 'h_' + id, npc: id, x: havre[id][0], y: havre[id][1], pal: N.pal, name: `${N.n} (${N.job})`, show: () => S().npcs[id] && S().town.founded, act: () => this.serviceTalk(id) });
    });
    // --- Gardiens ---
    [['sylvaros', 16, 58], ['wyverne', 68, 10], ['hydre', 164, 68], ['ignar', 154, 12]].forEach(([id, x, y]) =>
      add({ k: 'boss', id, x, y, show: () => !S().bosses[id], act: () => this.bossTalk(id) }));
    add({ k: 'barrier', x: 148, y: this.VY, show: () => ['sylvaros', 'wyverne', 'hydre'].some(b => !S().bosses[b]), act: () => this.barrierTalk() });
    // --- Portiques aux entrées des régions ---
    this.gates.forEach(g => {
      if (g.z === 'volcan') return;
      const posts = g.horiz ? [[g.x, g.y - 1], [g.x, g.y + 1]] : [[g.x - 1, g.y], [g.x + 1, g.y]];
      posts.forEach(([x, y], i) => { this.t[y][x] = this.groundOf(this.z[y][x]); add({ k: 'gate', x, y, zone: g.z, side: i, horiz: g.horiz }); });
    });
    // --- Havre ---
    add({ k: 'stone', x: hx + 5, y: hy + 3, show: () => S().town.founded, act: () => G.UI.havre() });
    const plots = { forge: [0, 0], atelier: [3, 0], marche: [6, 0], taverne: [9, 0], menagerie: [0, 5], herboristerie: [3, 5], mine: [6, 5] };
    Object.keys(plots).forEach(bid => {
      const [x, y] = Hv(...plots[bid]);
      add({ k: 'plot', id: bid, x, y, w: 3, h: 2, door: [x + 1, y + 1], show: () => S().town.founded, act: () => this.plotTalk(bid) });
    });
    const rem = () => (S().town.b.remparts || 0) > 0;
    for (let x = hx - 1; x <= hx + 12; x++) add({ k: 'wall', x, y: hy - 1, show: rem });
    for (let y = hy; y <= hy + 7; y++) { if (y < hy + 3 || y > hy + 5) add({ k: 'wall', x: hx - 1, y, show: rem }); add({ k: 'wall', x: hx + 12, y, show: rem }); }
    // --- Tableau de chasse ---
    add({ k: 'board', x: bx + 7, y: by + 5, act: () => G.UI.hunts() });
    add({ k: 'board', x: hx + 11, y: hy + 3, show: () => S().town.founded, act: () => G.UI.hunts() });
    G.HUNTS.concat([G.HUNT_INF]).forEach(h => {
      this.clearAround(h.at[0], h.at[1], 1);
      add({ k: 'hunt', id: 'hunt_' + h.id, hunt: h.id, x: h.at[0], y: h.at[1], show: () => S().hunts[h.id] === 'active', act: () => this.huntTalk(h.id) });
    });
    // --- Coffres ---
    const chests = [
      ['c1', 44, 102, { items: { potion: 3 }, mats: { lingot: 2 } }], ['c2', 10, 96, { g: 200, items: { appat: 1 } }],
      ['c3', 112, 16, { mats: { minerai: 4, lingot: 2 } }], ['c4', 26, 10, { items: { hipotion: 2, ether: 2 } }],
      ['c5', 170, 52, { mats: { ecaille: 3 }, items: { phenix: 1 } }], ['c6', 134, 86, { items: { festin: 1, friandise: 3 } }],
      ['c7', 166, 26, { mats: { mithril: 2, cristal: 2 } }], ['c8', 38, 44, { mats: { boisancien: 2 }, items: { remede: 3 } }],
      ['c9', 172, 118, { g: 500 }], ['c10', 10, 118, { items: { bombe: 3 } }], ['c11', 52, 22, { mats: { cristal: 1 }, items: { ether: 2 } }],
      ['c12', 122, 100, { items: { appat: 2, friandise: 2 } }], ['c13', 94, 48, { g: 150, mats: { fibre: 6 } }],
      ['c14', 8, 68, { mats: { spore: 3, seve: 2 }, items: { ether: 1 } }], ['c15', 92, 8, { mats: { cristal: 2 }, items: { hipotion: 1 } }],
      ['c16', 176, 80, { mats: { ectoplasme: 2 }, items: { festin: 1 } }],
    ];
    chests.forEach(([id, x, y, loot]) => { this.clearAround(x, y, 0); add({ k: 'chest', id, x, y, loot, act: () => this.openChest(id) }); });
    // coffres générés : répartis dans chaque région, contenu selon la région et la profondeur
    Object.keys(G.CHEST_LOOT).forEach(zone => {
      const T = G.CHEST_LOOT[zone], cand = [];
      for (let y = 2; y < this.H - 2; y++) for (let x = 2; x < this.W - 2; x++) {
        if (this.z[y][x] !== zone) continue;
        const c = this.t[y][x];
        if (!WALKABLE.has(c) || c === '_' || c === '=' || c === 'w') continue;
        if (![[0, 1], [0, -1], [1, 0], [-1, 0]].every(([dx, dy]) => WALKABLE.has(this.t[y + dy][x + dx]))) continue;
        cand.push([x, y, U.hash(x, y, 4242)]);
      }
      cand.sort((a, b) => a[2] - b[2]);
      let n = 0;
      for (const [x, y] of cand) {
        if (n >= T.n) break;
        if (E.some(e => e.k === 'chest' && Math.abs(e.x - x) + Math.abs(e.y - y) < 14)) continue;
        if (E.some(e => Math.abs(e.x - x) <= e.w && Math.abs(e.y - y) <= e.h)) continue;
        const dep = this.depthAt(x, y), r = (k) => U.hash(x, y, k), pick = (arr, k) => arr[Math.floor(r(k) * arr.length)];
        const loot = { g: Math.round(T.g[0] + (T.g[1] - T.g[0]) * r(1) * (0.6 + dep * 0.8)), items: {}, mats: {} };
        const it = pick(T.items, 2); loot.items[it[0]] = it[1];
        const m = pick(T.mats, 3); loot.mats[m[0]] = m[1] + Math.floor(r(4) * (m[2] - m[1] + 1));
        if (dep > 0.55) { const rr = pick(T.rare, 5); (G.MATS[rr[0]] ? loot.mats : loot.items)[rr[0]] = (G.MATS[rr[0]] ? loot.mats : loot.items)[rr[0]] || 0; (G.MATS[rr[0]] ? loot.mats : loot.items)[rr[0]] += rr[1]; }
        const id = `z_${zone}_${n}`;
        add({ k: 'chest', id, x, y, loot, deep: dep > 0.55, act: () => this.openChest(id) });
        n++;
      }
    });
    Object.values(home).concat(Object.values(havre)).forEach(([x, y]) => this.clearAround(x, y, 0));
    this.start = B(4, 6);
  },
  // maisons d'habitation, moulin et accessoires autour des villes
  decorate() {
    const [bx, by] = this.BOURG, [hx, hy] = this.HAVRE, E = this.E;
    const occ = () => { const m = new Set(); E.forEach(e => { for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) m.add(x + ',' + y); if (e.door) m.add(e.door[0] + ',' + (e.door[1] + 1)); }); return m; };
    const fronts = () => E.filter(e => ['npc', 'house', 'chest', 'boss', 'sign', 'stone', 'plot', 'board', 'node'].includes(e.k));
    // ensemble des entités importantes accessibles depuis le départ
    const reachSet = () => {
      const blocked = occ(), start = this.start, seen = new Set([start.join(',')]), q = [start];
      const pass = (x, y) => WALKABLE.has(this.tile(x, y)) && !blocked.has(x + ',' + y);
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of Object.values(DIRS)) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && pass(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
      const ok = new Set();
      fronts().forEach((e, i) => { if ((e.door ? [[e.door[0], e.door[1] + 1]] : Object.values(DIRS).map(([dx, dy]) => [e.x + dx, e.y + dy])).some(([x, y]) => seen.has(x + ',' + y))) ok.add(e); });
      return ok;
    };
    const free = (x, y, w, h, margin) => {
      const m = occ();
      for (let yy = y - margin; yy < y + h + margin; yy++) for (let xx = x - margin; xx < x + w + margin; xx++) {
        if (m.has(xx + ',' + yy)) return false;
        if (yy >= y && yy < y + h && xx >= x && xx < x + w) { const c = this.tile(xx, yy); if (!WALKABLE.has(c) || c === '_' || c === '=' || c === 'p') return false; }
      }
      return true;
    };
    const tryAdd = (e, margin = 1) => { if (!free(e.x, e.y, e.w, e.h, margin)) return false; const before = reachSet(); E.push(e); const after = reachSet(); if ([...before].some(b => !after.has(b))) { E.pop(); return false; } return true; };
    // maisons d'habitation (architectures variées)
    const homes = [
      [bx - 5, by + 1, 'thatch', { roof: '#c8a050' }], [bx - 5, by + 6, 'stone', { roof: '#4a5a7a' }], [bx + 11, by + 1, 'thatch', { roof: '#b8903a', wall: '#f0e0c0' }],
      [bx + 11, by + 6, 'timber', { roof: '#6a4a8a' }], [bx + 1, by - 5, 'stone', { roof: '#7a4a3a', wall: '#b8a890' }], [bx + 6, by - 5, 'thatch', { roof: '#d8b060' }],
      [bx - 1, by + 11, 'timber', { roof: '#3a6a5a', wall: '#f4ecd8' }], [hx + 13, hy + 1, 'stone', { roof: '#5a6a8a' }], [hx - 6, hy + 5, 'thatch', { roof: '#c8a050' }],
    ];
    const lines = ['Personne ne répond… On entend un chat ronronner derrière la porte.', 'Une odeur de pain chaud s’échappe de la maison.', '« Bonne route, voyageurs ! » lance une voix à la fenêtre.'];
    homes.forEach(([x, y, arch, aopt], i) => tryAdd({ k: 'house', id: 'home' + i, x, y, w: 3, h: 2, door: [x + 1, y + 1], arch, aopt, label: 'Maison', act: () => G.UI.say([{ who: '', t: lines[i % lines.length] }]) }));
    // architecture des régions sauvages : cabane, ruines, hutte sur pilotis, autel
    const wild = { foret: ['cabin', 6], montagne: ['ruin', 6], marais: ['stilt', 5], volcan: ['altar', 4] };
    Object.keys(wild).forEach(zone => {
      const [arch, n] = wild[zone]; let placed = 0;
      const cand = [];
      for (let y = 2; y < this.H - 4; y++) for (let x = 2; x < this.W - 4; x++) if (this.z[y][x] === zone && this.z[y + 1][x + 2] === zone) cand.push([x, y, U.hash(x, y, 909)]);
      cand.sort((a, b) => a[2] - b[2]);
      for (const [x, y] of cand) {
        if (placed >= n) break;
        if (!this.isNear(x + 1, y + 2, '_', 3)) continue; // près d'un chemin pour être vue
        if (tryAdd({ k: 'house', id: `${arch}${placed}`, x, y, w: 3, h: 2, door: [x + 1, y + 1], arch, aopt: {}, label: { cabin: 'Cabane de chasseur', ruin: 'Ruines antiques', stilt: 'Hutte sur pilotis', altar: 'Autel d’obsidienne' }[arch], act: () => G.UI.say([{ who: '', t: { cabin: 'Une cabane de chasseur. Des trophées de cerf ornent la porte.', ruin: 'Les vestiges d’un temple oublié. Des glyphes élémentaires sont gravés dans la pierre.', stilt: 'Une hutte de pêcheur perchée au-dessus des eaux noires.', altar: 'Un autel d’obsidienne où brûlent des flammes éternelles.' }[arch] }]) })) placed++;
      }
    });
    // moulin
    [[bx + 12, by + 11], [bx - 7, by + 11], [bx + 14, by - 4]].some(([x, y]) => tryAdd({ k: 'mill', id: 'mill', x, y, w: 2, h: 2, act: () => G.UI.say([{ who: '', t: 'Les ailes du moulin tournent paresseusement au gré du vent.' }]) }));
    // accessoires
    const props = [
      ['well', bx - 2, by + 4], ['barrels', bx + 1, by + 2], ['crates', bx + 7, by + 2], ['flowerpot', bx + 3, by + 8], ['bench', bx + 5, by + 8], ['cart', bx - 2, by + 8], ['hay', bx + 10, by + 4],
      ['barrels', hx + 1, hy + 2], ['crates', hx + 7, hy + 2], ['flowerpot', hx + 4, hy + 4], ['flowerpot', hx + 6, hy + 4], ['well', hx + 13, hy + 4], ['hay', hx - 2, hy + 1], ['cart', hx - 2, hy + 7], ['fence', bx - 3, by - 2], ['fence', bx - 2, by - 2],
    ];
    props.forEach(([t, x, y], i) => tryAdd({ k: 'prop', id: 'prop' + i, type: t, x, y, w: 1, h: 1, show: (x >= hx - 3 && y >= hy - 3) ? () => G.S.town.founded : null }, 0));
  },
  isNear(cx, cy, ch, r) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (this.tile(x, y) === ch) return true; return false; },
  placeNodes() {
    const rates = {
      plaines: [[0.022, 'arbre'], [0.034, 'herbe'], [0.046, 'fibre'], [0.058, 'rocher'], [0.065, 'fer']],
      foret: [[0.045, 'arbre'], [0.065, 'herbe'], [0.105, 'vieil_arbre'], [0.118, 'fibre'], [0.128, 'rocher']],
      montagne: [[0.063, 'rocher'], [0.108, 'fer'], [0.130, 'cristal']],
      marais: [[0.054, 'herbe'], [0.081, 'fibre'], [0.099, 'fer'], [0.112, 'arbre']],
      volcan: [[0.04, 'fer'], [0.07, 'cristal'], [0.125, 'mithril'], [0.135, 'rocher']],
    };
    const occ = new Set(this.E.flatMap(e => { const r = []; for (let y = e.y - 1; y <= e.y + e.h; y++) for (let x = e.x - 1; x <= e.x + e.w; x++) r.push(x + ',' + y); return r; }));
    for (let y = 1; y < this.H - 1; y++) for (let x = 1; x < this.W - 1; x++) {
      const ch = this.t[y][x], zone = this.z[y][x], R = rates[zone];
      if (!R || ch === '_' || ch === '=' || !WALKABLE.has(ch) || occ.has(x + ',' + y)) continue;
      if (![[0, 1], [0, -1], [1, 0], [-1, 0]].every(([dx, dy]) => WALKABLE.has(this.t[y + dy][x + dx]) && this.t[y + dy][x + dx] !== '_')) continue;
      const h = U.hash(x, y, 77), r = R.find(q => h < q[0]);
      if (!r) continue;
      this.E.push({ k: 'node', id: `n${x}_${y}`, type: r[1], x, y, w: 1, h: 1, act: () => this.startMining(`n${x}_${y}`) });
      for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) occ.add(xx + ',' + yy);
    }
  },
  // garantit que chaque entité importante est accessible depuis le départ
  connect() {
    const blockedByEnt = new Set();
    this.E.forEach(e => { if (e.k === 'barrier') return; for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) blockedByEnt.add(x + ',' + y); });
    const pass = (x, y) => WALKABLE.has(this.tile(x, y)) && !blockedByEnt.has(x + ',' + y);
    const bfs = () => {
      const seen = new Set([this.start.join(',')]), q = [this.start];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of Object.values(DIRS)) {
          const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
          if (!seen.has(k) && pass(nx, ny)) { seen.add(k); q.push([nx, ny]); }
        }
      }
      return seen;
    };
    let reach = bfs();
    const targets = this.E.filter(e => !['node', 'lamp', 'wall', 'gate'].includes(e.k));
    for (const e of targets) {
      const fronts = e.door ? [[e.door[0], e.door[1] + 1]] : Object.values(DIRS).map(([dx, dy]) => [e.x + dx, e.y + dy]);
      if (fronts.some(([x, y]) => reach.has(x + ',' + y))) continue;
      const [fx, fy] = fronts.find(([x, y]) => !blockedByEnt.has(x + ',' + y)) || fronts[0];
      let best = null, bd = 1e9;
      reach.forEach(k => { const [x, y] = k.split(',').map(Number); const d = Math.abs(x - fx) + Math.abs(y - fy); if (d < bd) { bd = d; best = [x, y]; } });
      if (!best) continue;
      this.carve(best, [fx, fy]);
      // retirer les noeuds sur le passage
      this.E = this.E.filter(n => n.k !== 'node' || WALKABLE.has(this.tile(n.x, n.y)) && !this.onLine(best, [fx, fy], n.x, n.y));
      reach = bfs();
    }
  },
  onLine(a, b, px, py) {
    let [x, y] = a; const [x1, y1] = b;
    if (x === px && y === py) return true;
    while (x !== x1 || y !== y1) { if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); if (x === px && y === py) return true; }
    return false;
  },
  visible(e) { return !e.show || e.show(); },
  refresh() {
    this.occ = new Map();
    this.E.forEach(e => {
      if (!this.visible(e)) return;
      if (e.k === 'plot' && !(G.S.town.b[e.id] > 0)) return;
      for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) this.occ.set(x + ',' + y, e);
    });
    // les parcelles vides restent interactives par leur « porte »
    this.E.forEach(e => { if (e.k === 'plot' && this.visible(e) && !(G.S.town.b[e.id] > 0)) this.occ.set(e.door[0] + ',' + e.door[1], e); });
  },
  entAt(x, y) { return this.occ.get(x + ',' + y); },
  canWalk(x, y) { return WALKABLE.has(this.tile(x, y)) && !this.entAt(x, y); },
  nodeDepleted(e) { const d = G.S.nodes[e.id]; return d != null && G.S.stats.steps - d < 140; },
  // ---------------- Placement du joueur ----------------
  placePlayer(x, y, dir) {
    const P = this.P;
    P.x = P.tx = x; P.y = P.ty = y; P.px = x * 16; P.py = y * 16; P.dir = dir || 'down'; P.moving = false;
    this.followers = G.S.party.slice(1).map(() => ({ x, y, px: x * 16, py: y * 16, fx: x, fy: y, dir: P.dir }));
    G.S.pos = { x, y, dir: P.dir };
    this.lastZone = this.zoneAt(x, y);
    this.snapCam();
  },
  snapCam() { const c = this.camTarget(); this.cam.x = c.x; this.cam.y = c.y; },
  camTarget() {
    const R = G.R, P = this.P;
    return { x: U.clamp(P.px + 8 - R.W / 2, 0, Math.max(0, this.W * 16 - R.W)), y: U.clamp(P.py + 8 - R.H / 2, 0, Math.max(0, this.H * 16 - R.H)) };
  },
  // ---------------- Mise à jour ----------------
  // construit en arrière-plan le prochain bloc de sol proche du joueur (un à la fois)
  warmChunks() {
    const CK = 16, pcx = Math.floor(this.P.x / CK), pcy = Math.floor(this.P.y / CK);
    let best = null, bd = 1e9;
    for (let gy = 0; gy * CK < this.H; gy++) for (let gx = 0; gx * CK < this.W; gx++) {
      if (G.SPR.cache[`chunk_${gx}_${gy}`]) continue;
      const d = Math.abs(gx - pcx) + Math.abs(gy - pcy); if (d < bd) { bd = d; best = [gx, gy]; }
    }
    if (best && bd <= 2) this.chunk(best[0], best[1]);
  },
  update(dt) {
    const P = this.P, S = G.S;
    this.warmT = (this.warmT || 0) - dt;
    if (this.warmT <= 0 && !P.moving) { this.warmT = 0.25; this.warmChunks(); }
    S.time = (S.time + dt * 0.6) % 1440;
    if (this.mining) { this.updateMining(dt); }
    else if (P.moving) {
      P.t += dt / 0.16;
      const t = Math.min(1, P.t);
      P.px = U.lerp(P.fx * 16, P.tx * 16, t); P.py = U.lerp(P.fy * 16, P.ty * 16, t);
      this.followers.forEach(f => { f.px = U.lerp(f.fx * 16, f.x * 16, t); f.py = U.lerp(f.fy * 16, f.y * 16, t); });
      P.anim += dt;
      if (P.t >= 1) { P.moving = false; P.x = P.tx; P.y = P.ty; this.onStep(); }
    }
    if (!P.moving && !this.mining && !G.UI.busy() && G.scene === 'world') {
      const d = G.Input.dir();
      if (d) this.tryMove(d);
      else P.anim = 0;
      if (G.Input.take('a')) this.interact();
      if (G.Input.take('b')) G.UI.openMenu();
    }
    // caméra
    const c = this.camTarget();
    const ox = this.cam.x, oy = this.cam.y;
    this.cam.x += (c.x - this.cam.x) * Math.min(1, dt * 10); this.cam.y += (c.y - this.cam.y) * Math.min(1, dt * 10);
    const ddx = this.cam.x - ox, ddy = this.cam.y - oy;
    G.R.parts.forEach(p => { if (p.layer === 1) { p.x -= ddx; p.y -= ddy; } });
    this.ambient(dt);
  },
  tryMove(dir) {
    const P = this.P, [dx, dy] = DIRS[dir];
    P.dir = dir;
    const nx = P.x + dx, ny = P.y + dy;
    if (!this.canWalk(nx, ny)) return;
    P.fx = P.x; P.fy = P.y; P.tx = nx; P.ty = ny; P.t = 0; P.moving = true;
    let px = P.x, py = P.y;
    this.followers.forEach(f => {
      const ox = f.x, oy = f.y;
      f.fx = ox; f.fy = oy; f.x = px; f.y = py;
      if (px > ox) f.dir = 'right'; else if (px < ox) f.dir = 'left'; else if (py > oy) f.dir = 'down'; else if (py < oy) f.dir = 'up';
      px = ox; py = oy;
    });
  },
  onStep() {
    const P = this.P, S = G.S;
    S.stats.steps++; S.time = (S.time + 2) % 1440;
    S.pos = { x: P.x, y: P.y, dir: P.dir };
    if (S.stats.steps % 2 === 0) G.Audio.sfx('step');
    const zone = this.zoneAt(P.x, P.y), Z = G.ZONES[zone];
    S.flags.visited = S.flags.visited || {};
    const first = !S.flags.visited[zone];
    S.flags.visited[zone] = true;
    if (zone !== this.lastZone) { if (this.lastZone) G.UI.zoneBanner(Z, first && !Z.town); this.lastZone = zone; }
    if (zone === 'havre' && !S.flags.bran) { this.branEvent(); return; }
    this.sinceBattle++;
    const ch = this.tile(P.x, P.y);
    if (Z.rate > 0 && this.sinceBattle > 6 && ch !== '=') {
      const rate = Z.rate * (ch === '_' ? 0.45 : 1);
      if (Math.random() < rate) { this.sinceBattle = 0; this.encounter(zone); }
    }
  },
  encounter(zone) {
    const Z = G.ZONES[zone], dep = this.depthAt(this.P.x, this.P.y);
    let grp = U.pick(Z.groups).slice();
    if (grp.length < 3 && (Math.random() < dep * 0.8 || (G.maxLevel() > G.ENEMIES[grp[0]].lvl + 4 && Math.random() < 0.6))) grp.push(U.pick(U.pick(Z.groups)));
    G.Battle.start(grp, { bg: Z.bg, zone, depth: dep });
  },
  TRAVEL: [
    ['bourg', 'Bourg-Aube', 78, 80], ['havre', 'Le Havre', 137, 100], ['foret', 'Orée de Sylve', 50, 78],
    ['montagne', 'Pied des Monts Grisés', 78, 30], ['marais', 'Entrée du marais', 132, 78], ['volcan', 'Volcan Cendreux', 148, 38],
  ],
  canTravel(id) {
    const S = G.S, v = S.flags.visited || {};
    if (id === 'bourg') return true;
    if (id === 'havre') return S.town.founded;
    return !!v[id];
  },
  travel(id) {
    const T = this.TRAVEL.find(t => t[0] === id);
    G.scene = 'trans';
    G.R.transition('fadeout', 0.35, () => {
      this.placePlayer(T[2], T[3], 'down'); this.sinceBattle = 0; G.R.parts = [];
      G.UI.zoneBanner(G.ZONES[this.zoneAt(T[2], T[3])]);
      G.Audio.music(this.musicFor());
      G.R.transition('fadein', 0.4, () => { G.scene = 'world'; });
    });
  },
  musicFor() { const z = this.zoneAt(this.P.x, this.P.y); return G.ZONES[z].town ? 'town' : 'field'; },
  // ---------------- Interactions ----------------
  facing() { const [dx, dy] = DIRS[this.P.dir]; return [this.P.x + dx, this.P.y + dy]; },
  interact() {
    const [fx, fy] = this.facing();
    const e = this.entAt(fx, fy);
    if (!e) return;
    G.Audio.sfx('cursor');
    if (e.k === 'house' || e.k === 'plot') {
      if (e.door && (fx !== e.door[0] || fy !== e.door[1]) && e.k === 'house') { G.UI.toast(e.label); return; }
      e.act(); return;
    }
    if (e.k === 'npc') {
      const [dx, dy] = DIRS[this.P.dir];
      e.dir = dx > 0 ? 'left' : dx < 0 ? 'right' : dy > 0 ? 'up' : 'down';
      if (e.act) e.act(); else G.UI.say(e.lines.map(t => ({ who: e.name, t })));
      return;
    }
    if (e.k === 'gate') { const Z = G.ZONES[e.zone]; G.UI.say([{ who: 'Borne', t: `Frontière : ${Z.n}. ${Z.lv}.` }]); return; }
    if (e.k === 'sign') { G.UI.say([{ who: 'Panneau', t: e.text }]); return; }
    if (e.k === 'fountain') { G.UI.say([{ who: '', t: 'L’eau de la fontaine scintille. Vous vous sentez apaisés.' }]); return; }
    if (e.act) e.act();
  },
  async elderTalk() {
    const S = G.S, who = 'Ancien Théo';
    if (!S.flags.elder) {
      S.flags.elder = true;
      await G.UI.say([
        { who, t: 'Kael, Lyra… Vous voilà enfin. Les Échos élémentaires sont corrompus.' },
        { who, t: 'Ignar, le Dragon des Cendres, a souillé les quatre Gardiens : Sylvaros dans la forêt, la Wyverne sur les cimes, l’Hydre dans le marais.' },
        { who, t: 'Purifiez les trois Gardiens et la barrière du Volcan cédera. Alors seulement vous pourrez affronter Ignar.' },
        { who, t: 'Les réfugiés affluent… Au sud-est s’étend une terre fertile : le site du Havre. Votre ami Bran vous y attend pour bâtir une ville.' },
        { who, t: 'Recrutez des habitants, construisez forge et ateliers. Ici, nulle boutique ne vend d’armes : tout doit se forger !' },
        { who, t: 'Prenez ceci, et que les Échos vous guident.' },
      ]);
      G.give('potion', 2); G.give('bois', 3); G.UI.toast('Obtenu : ' + G.gotText('potion', 2) + ', ' + G.gotText('bois', 3));
      return;
    }
    const left = ['sylvaros', 'wyverne', 'hydre'].filter(b => !S.bosses[b]);
    let tip;
    if (!S.town.founded) tip = 'Rends-toi au sud-est, au site du Havre. Bran t’y attend.';
    else if (S.bosses.ignar) tip = 'Tu as sauvé notre monde. Le Havre grandira grâce à toi.';
    else if (left.length) tip = `Il reste ${left.length} Gardien(s) corrompu(s). ${left.includes('sylvaros') ? 'Sylvaros, dans la forêt à l’ouest, est le plus faible.' : left.includes('wyverne') ? 'La Wyverne t’attend au sommet des Monts Grisés.' : 'L’Hydre se cache à l’est du Marais Brumeux.'}`;
    else tip = 'La barrière du Volcan est tombée ! Ignar t’attend au nord-est. Forge tes meilleures armes avant d’y aller.';
    await G.UI.say([{ who, t: tip }, { who, t: 'N’oublie pas : chaque arme change complètement ton style. Expérimente !' }]);
  },
  async recruitTalk(id) {
    const S = G.S, N = G.NPCS[id], who = `${N.n} (${N.job})`, qid = 'r_' + id;
    if (!S.quests[qid]) {
      S.quests[qid] = 'active';
      await G.UI.say([{ who, t: N.ask }]);
      G.UI.toast(`Nouvelle quête : ${G.QUESTS[qid].n}`);
      return;
    }
    const [c, t] = N.cond(S);
    if (c < t) { await G.UI.say([{ who, t: `${N.ask} (${c}/${t})` }]); return; }
    const pay = N.pay ? ` (${N.pay.g ? N.pay.g + ' or' : Object.keys(N.pay.m).map(k => N.pay.m[k] + ' ' + G.nameOf(k)).join(', ')})` : '';
    const r = await G.UI.ask(`${N.n} est prêt(e) à rejoindre le Havre.${pay}`, ['Recruter', 'Plus tard']);
    if (r !== 0) return;
    if (N.pay) G.pay(N.pay);
    S.npcs[id] = true; S.quests[qid] = 'done';
    this.refresh();
    G.Audio.sfx('achieve');
    await G.UI.say([{ who, t: S.town.founded ? 'Marché conclu ! Je file au Havre.' : 'Dès que ta ville existera, je m’y installerai !' }]);
    G.UI.toast(`${N.n} a rejoint le Havre !`);
    G.UI.checkAch();
  },
  async serviceTalk(id) {
    const S = G.S, N = G.NPCS[id], who = `${N.n} (${N.job})`, lvl = S.town.b[N.b] || 0;
    if (!lvl) { await G.UI.say([{ who, t: `Construis-moi un(e) ${G.BUILDINGS[N.b].n} grâce à la pierre de fondation, et je me mettrai au travail !` }]); return; }
    switch (id) {
      case 'dorn': G.UI.openMenu('armes'); break;
      case 'mira': G.UI.openMenu('artisanat'); break;
      case 'pell': G.UI.shop(G.SHOPS.havre(lvl)); break;
      case 'lise': G.UI.inn('havre'); break;
      case 'yuna': G.UI.openMenu('familiers'); break;
      default: {
        const got = G.collectTown();
        await G.UI.say([{ who, t: got.length ? 'Voici la production du Havre : ' + got.join(', ') : 'Rien de neuf pour l’instant. Reviens après quelques combats !' }]);
      }
    }
  },
  async plotTalk(bid) {
    G.UI.havre(bid);
  },
  async bossTalk(id) {
    const E = G.ENEMIES[id];
    const lines = {
      sylvaros: 'Un arbre gigantesque se dresse… ses yeux s’embrasent d’une lueur violette !',
      wyverne: 'La foudre crépite. La Wyverne Tempête déploie ses ailes au-dessus des cimes !',
      hydre: 'Les brumes s’écartent. Trois têtes émergent des eaux noires…',
      ignar: 'La chaleur est insoutenable. IGNAR, le Dragon des Cendres, ouvre les yeux.',
    };
    await G.UI.say([{ who: '', t: lines[id] }]);
    const r = await G.UI.ask(`Affronter ${E.n} (niv. ${E.lvl}) ?`, ['Combattre !', 'Se préparer']);
    if (r !== 0) return;
    G.Battle.start([id], { bg: { sylvaros: 'forest', wyverne: 'mountain', hydre: 'swamp', ignar: 'volcano' }[id], boss: true, zone: this.zoneAt(this.P.x, this.P.y) });
  },
  async huntTalk(id) {
    const S = G.S, h = id === 'inf' ? G.HUNT_INF : G.HUNTS.find(x => x.id === id);
    const eid = id === 'inf' ? G.makeInfinite(S.hunter.inf) : h.t, E = G.ENEMIES[eid];
    await G.UI.say([{ who: 'Chasse', t: `${h.n} — la cible est là : ${E.n} (niv. ${E.lvl}).` }]);
    const r = await G.UI.ask(`Engager le combat contre ${E.n} ? Impossible de fuir.`, ['Chasser !', 'Plus tard']);
    if (r !== 0) return;
    G.Battle.start([eid], { bg: G.ZONES[this.zoneAt(this.P.x, this.P.y)].bg || 'plains', boss: true, hunt: id, zone: this.zoneAt(this.P.x, this.P.y) });
  },
  async barrierTalk() {
    const n = ['sylvaros', 'wyverne', 'hydre'].filter(b => G.S.bosses[b]).length;
    await G.UI.say([{ who: '', t: `Une muraille de flammes éternelles bloque le passage. ${n}/3 Échos purifiés résonnent en vous.` }]);
  },
  async openChest(id) {
    const S = G.S, e = this.E.find(x => x.id === id);
    if (S.chests[id]) { G.UI.toast('Le coffre est vide.'); return; }
    S.chests[id] = true;
    const L = e.loot, got = [];
    if (L.g) { S.gold += L.g; S.stats.goldEarned += L.g; got.push(G.goldText(L.g)); }
    for (const k in (L.items || {})) { G.give(k, L.items[k]); got.push(G.gotText(k, L.items[k])); }
    for (const k in (L.mats || {})) if (L.mats[k] > 0) { G.give(k, L.mats[k]); got.push(G.gotText(k, L.mats[k])); }
    G.Audio.sfx('get');
    G.R.burst(e.x * 16 + 8 - this.cam.x, e.y * 16 + 6 - this.cam.y, { n: 20, c: ['#ffe080', '#ffffff'], spd: 30, vy: -20, life: 0.8, layer: 1 });
    await G.UI.say([{ who: '', t: 'Coffre ouvert ! ' + got.join(', ') }]);
  },
  async branEvent() {
    const S = G.S;
    S.flags.bran = true;
    await G.UI.say([
      { who: 'Bran', t: 'Kael ! Lyra ! Vous voilà enfin. Regardez cette plaine… c’est ici que nous bâtirons le Havre !' },
      { who: 'Kael', t: 'Bran ! Toujours aussi enthousiaste. Mais une ville, sans habitants ni artisans… ?' },
      { who: 'Bran', t: 'Justement ! Recrutons des artisans dans la région. Chacun pourra bâtir et faire tourner un bâtiment.' },
      { who: 'Bran', t: 'Et je viens avec vous. Ma Hache Primitive a besoin d’exercice !' },
      { who: '', t: 'Bran rejoint l’équipe ! Le Havre est fondé. Utilisez la pierre de fondation pour construire.' },
    ]);
    if (!S.party.includes('bran')) S.party.push('bran');
    S.town.founded = true; S.quests.q_havre = 'done';
    const c = S.chars.bran; c.lvl = Math.max(c.lvl, Math.max(1, G.maxLevel() - 1)); c.hp = null; c.mp = null;
    this.refresh();
    this.placePlayer(this.P.x, this.P.y, this.P.dir);
    G.Audio.sfx('achieve');
    G.UI.checkAch();
    G.save();
  },
  // ---------------- Collecte ----------------
  startMining(id) {
    const e = this.E.find(x => x.id === id), N = G.NODES[e.type];
    if (this.nodeDepleted(e)) { G.UI.toast(`${N.n} : épuisé, repousse bientôt.`); return; }
    const tier = N.tool ? G.S.tools[N.tool] : 9;
    if (N.tool && tier < N.min) {
      const need = Object.values(G.TOOLS).find(t => t.type === N.tool && t.tier === N.min);
      G.UI.toast(`${N.n} : ${need ? need.n : 'outil'} requis !`); G.Audio.sfx('back'); return;
    }
    const need = Math.max(1, N.hard - (N.tool ? tier : 0));
    this.mining = { e, N, hits: 0, need, t: 0 };
  },
  updateMining(dt) {
    const M = this.mining;
    M.t += dt;
    if (M.t >= 0.28) {
      M.t = 0; M.hits++;
      G.Audio.sfx('gather');
      const sx = M.e.x * 16 + 8 - this.cam.x, sy = M.e.y * 16 + 8 - this.cam.y;
      const col = { arbre: '#8a5a30', vieil_arbre: '#5a3a2a', herbe: '#5ac83a', fibre: '#e8c860', cristal: '#8affff', mithril: '#d8e8ff' }[M.e.type] || '#9a948a';
      G.R.burst(sx, sy, { n: 6, c: col, spd: 40, vy: -30, grav: 160, life: 0.5, size: 1, type: 'rock', glow: false, layer: 1 });
      if (M.hits >= M.need) {
        const got = [];
        M.N.loot.forEach(([id, a, b]) => { const q = U.randi(a, b); if (q > 0) { G.give(id, q); got.push(G.gotText(id, q)); G.S.stats.gathered += q; } });
        G.S.nodes[M.e.id] = G.S.stats.steps;
        G.Audio.sfx('get');
        G.R.burst(sx, sy - 6, { n: 12, c: ['#ffffff', '#ffe080'], spd: 25, vy: -25, life: 0.6, layer: 1 });
        G.UI.toast(got.join(', '));
        this.mining = null;
        G.UI.checkAch();
      }
    }
  },
  // ---------------- Ambiance ----------------
  dayLight() {
    const h = G.S.time / 60;
    let dark = 0, col = '#0a1040', grade = null;
    if (h >= 20 || h < 5) dark = 0.55;
    else if (h >= 17.5) { const t = (h - 17.5) / 2.5; dark = t * 0.55; col = U.mix('#5a2050', '#0a1040', t); grade = U.rgba('#ff8a3a', 0.25 * (1 - t)); }
    else if (h < 7) { const t = (7 - h) / 2; dark = t * 0.55; col = U.mix('#3a3070', '#0a1040', t); grade = U.rgba('#ffb0a0', 0.18 * (1 - t)); }
    return { dark, col, grade, night: dark > 0.3 };
  },
  ambient(dt) {
    const R = G.R, zone = this.zoneAt(this.P.x, this.P.y), night = this.dayLight().night;
    this.emitT -= dt;
    if (this.emitT > 0) return;
    this.emitT = 0.12;
    const x = Math.random() * R.W, y = Math.random() * R.H;
    const P = (o) => R.parts.push(Object.assign({ x, y, vx: 0, vy: 0, life: 4, max: 4, size: 1, c: '#fff', glow: true, grav: 0, drag: 1, type: 'dot', rot: 0, layer: 1 }, o));
    if (zone === 'foret') { if (Math.random() < 0.5) P({ y: -4, vx: U.rand(-8, 8), vy: U.rand(8, 16), c: U.pick(['#6a9a3a', '#a8a040', '#4a7a2a']), glow: false, type: 'leaf', size: 1.4, life: 6, max: 6 }); }
    else if (zone === 'montagne') P({ y: -4, vx: U.rand(-12, -4), vy: U.rand(10, 20), c: '#ffffff', glow: false, size: 0.8, life: 6, max: 6 });
    else if (zone === 'marais') { if (Math.random() < 0.35) P({ vx: U.rand(-5, 5), c: '#c8e8d8', type: 'fog', size: U.rand(20, 40), life: 6, max: 6 }); }
    else if (zone === 'volcan') P({ y: R.H + 2, vx: U.rand(-6, 6), vy: U.rand(-25, -12), c: U.pick(['#ff8a2a', '#ffcf40']), size: 0.9, life: 5, max: 5 });
    else if (Math.random() < 0.3) P({ vx: U.rand(-4, 4), vy: U.rand(-4, 2), c: night ? '#d8ff6a' : '#fff8d0', size: night ? 1 : 0.6, life: 3, max: 3 });
    if (night && (zone === 'plaines' || zone === 'marais' || zone === 'foret') && Math.random() < 0.4) P({ vx: U.rand(-5, 5), vy: U.rand(-5, 5), c: '#d8ff6a', size: 1, life: 3, max: 3 });
  },
  // ---------------- Rendu ----------------
  render() {
    const R = G.R, x = R.begin(), cam = this.cam, frame = Math.floor(performance.now() / 220) % 8;
    const cx = Math.round(cam.x * 2) / 2, cy = Math.round(cam.y * 2) / 2;
    const x0 = Math.max(0, Math.floor(cx / 16)), x1 = Math.min(this.W - 1, Math.ceil((cx + R.W) / 16));
    const y0 = Math.max(0, Math.floor(cy / 16)), y1 = Math.min(this.H - 1, Math.ceil((cy + R.H) / 16) + 2);
    x.fillStyle = '#000'; x.fillRect(0, 0, R.W, R.H);
    const lights = [], objs = [], day = this.dayLight();
    // 1) surfaces animées (eau, lave, marais) et ponts
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const ch = this.t[ty][tx], sx = tx * 16 - cx, sy = ty * 16 - cy;
      if (ch !== '~' && ch !== 'l' && ch !== 'w' && ch !== '=') continue;
      const v = Math.floor(U.hash(tx, ty, 5) * 8);
      x.drawImage(G.SPR.animTile(ch === '=' ? '~' : ch, v, frame), sx, sy, 16, 16);
      if (ch === '=') x.drawImage(G.SPR.bridge(), sx, sy, 16, 16);
      if (ch === '~' && ty > 0 && this.t[ty - 1][tx] !== '~' && this.t[ty - 1][tx] !== '=') {
        x.fillStyle = 'rgba(15,40,90,0.5)'; x.fillRect(sx, sy, 16, 3);
        x.fillStyle = (frame % 4 < 2) ? '#cfe8ff' : '#9fd0ff'; x.fillRect(sx + ((frame * 2) % 6), sy + 3.5, 4, 0.5); x.fillRect(sx + 9 - (frame % 3), sy + 4.5, 3, 0.5);
      }
      if (ch === 'l' && (tx + ty) % 2 === 0) lights.push({ x: sx + 8, y: sy + 8, r: 30, c: '#ff6a2a', a: 0.7 });
    }
    // 2) sol pré-dessiné par blocs (textures, transitions, teintes, petits décors)
    const CK = 16, c0x = Math.floor(x0 / CK), c1x = Math.floor(x1 / CK), c0y = Math.floor(y0 / CK), c1y = Math.floor(y1 / CK);
    for (let gy = c0y; gy <= c1y; gy++) for (let gx = c0x; gx <= c1x; gx++) x.drawImage(this.chunk(gx, gy), gx * CK * 16 - cx, gy * CK * 16 - cy, CK * 16, CK * 16);
    // 3) arbres et falaises (objets triés en profondeur)
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const ch = this.t[ty][tx], sx = tx * 16 - cx, sy = ty * 16 - cy, zone = this.z[ty][tx];
      if (ch === 'T') {
        const kind = this.treeKind(tx, ty, zone);
        objs.push({ y: ty * 16 + 16, d: () => { this.shadow(sx + 8, sy + 14, 7); const img = G.SPR.tree(kind); G.SPR.draw(x, img, sx + 8 - G.SPR.lw(img) / 2, sy + 16 - G.SPR.lh(img) + 2); } });
      } else if (ch === '^') objs.push({ y: ty * 16 + 15, d: () => this.drawCliff(tx, ty, sx, sy, zone) });
    }
    // entités
    for (const e of this.E) {
      if (e.x + e.w < x0 - 1 || e.x > x1 + 1 || e.y + e.h < y0 - 1 || e.y > y1 + 2) continue;
      if (!this.visible(e)) continue;
      const sx = e.x * 16 - cx, sy = e.y * 16 - cy;
      objs.push({ y: (e.y + e.h) * 16 - (e.k === 'plot' && !(G.S.town.b[e.id] > 0) ? 32 : 0), d: () => this.drawEnt(e, sx, sy, frame, lights, day) });
    }
    // joueur + suiveurs
    const P = this.P;
    const walkF = P.moving ? [1, 0, 2, 0][Math.floor(P.anim / 0.1) % 4] : 0;
    const party = this.hidePlayer ? [] : G.S.party;
    this.followers.forEach((f, i) => {
      const cid = party[i + 1]; if (!cid) return;
      const moving = P.moving && (f.fx !== f.x || f.fy !== f.y);
      objs.push({ y: f.py + 16 - 0.1, d: () => { this.shadow(f.px - cx + 8, f.py - cy + 15, 5); G.SPR.draw(x, G.SPR.hero(cid, G.CHARS[cid].pal, f.dir, moving ? walkF : 0, G.SPR.CHAR_EXTRA[cid]), Math.round(f.px - cx), Math.round(f.py - cy)); } });
    });
    const lead = party[0];
    if (lead) objs.push({ y: P.py + 16, d: () => {
      this.shadow(P.px - cx + 8, P.py - cy + 15, 5);
      let ox = 0, oy = 0;
      if (this.mining) { const s = Math.sin(this.mining.t / 0.28 * Math.PI); const [dx, dy] = DIRS[P.dir]; ox = dx * s * 3; oy = dy * s * 3; }
      G.SPR.draw(x, G.SPR.hero(lead, G.CHARS[lead].pal, P.dir, walkF, G.SPR.CHAR_EXTRA[lead]), Math.round(P.px - cx + ox), Math.round(P.py - cy + oy));
    } });
    objs.sort((a, b) => a.y - b.y).forEach(o => o.d());
    // indicateur d'interaction
    if (!P.moving && !this.mining && lead) {
      const [fx, fy] = this.facing(), e = this.entAt(fx, fy);
      if (e && e.k !== 'lamp' && e.k !== 'wall') {
        const bob = Math.sin(performance.now() / 200) * 1.5;
        x.fillStyle = '#ffffff'; x.fillRect(Math.round(P.px - cx + 7), Math.round(P.py - cy - 7 + bob), 2, 3); x.fillRect(Math.round(P.px - cx + 7), Math.round(P.py - cy - 3 + bob), 2, 1);
      }
    }
    if (day.night) lights.push({ x: P.px - cx + 8, y: P.py - cy + 8, r: 75, c: '#ffcf80', a: 0.9 });
    const zone = this.zoneAt(P.x, P.y);
    const grade = day.grade || { foret: 'rgba(60,140,60,0.18)', marais: 'rgba(110,80,140,0.22)', volcan: 'rgba(255,90,40,0.2)', montagne: 'rgba(120,150,200,0.14)' }[zone] || 'rgba(255,220,160,0.1)';
    R.present({ dof: 0.85, focusTop: 0.3, focusBot: 0.75, bloom: 0.2, dark: Math.max(day.dark, zone === 'marais' ? 0.12 : 0, zone === 'volcan' ? 0.2 : 0), darkCol: zone === 'volcan' ? '#300808' : day.col, lights, grade, vignette: 0.5, rays: zone === 'foret' && !day.night ? 1 : zone === 'plaines' && !day.night ? 0.35 : 0 });
  },
  // espèce d'arbre selon la région (variété du paysage)
  treeKind(tx, ty, zone) {
    const h = U.hash(tx, ty, 9), n = U.fbm(tx / 7, ty / 7, 41);
    if (zone === 'foret') return h < 0.42 ? 'pine' : h < 0.86 ? 'forest' : h < 0.95 ? 'birch' : 'giant';
    if (zone === 'marais') return h < 0.45 ? 'willow' : 'swamp';
    if (zone === 'volcan') return 'volcano';
    if (zone === 'montagne') return 'snowpine';
    if (n > 0.62) return h < 0.5 ? 'birch' : 'plain';
    if (n < 0.36) return h < 0.45 ? 'autumn' : h < 0.6 ? 'cherry' : 'plain';
    return h < 0.15 ? 'fruit' : h < 0.28 ? 'pine' : 'plain';
  },
  // style d'herbe selon de grandes plaques de bruit
  groundStyle(ch, tx, ty) {
    if (ch === 'f') return U.fbm(tx / 6, ty / 6, 51) > 0.55 ? 'moss' : 'fern';
    if (ch !== '.' && ch !== ',') return '';
    const n = U.fbm(tx / 9, ty / 9, 52), m = U.fbm(tx / 4, ty / 4, 53);
    if (n < 0.38) return 'dry';
    if (m > 0.64) return 'clover';
    return 'lush';
  },
  decalFor(tx, ty) {
    const ch = this.t[ty][tx], zone = this.z[ty][tx], h = U.hash(tx, ty, 333);
    if (ch === '_' || ch === 'p' || ch === '=' || ch === '~' || ch === 'l' || ch === 'w' || ch === 'T' || ch === '^') return null;
    const L = {
      plaines: [[0.07, 'flowers'], [0.13, 'tuft'], [0.16, 'pebbles'], [0.18, 'bush'], [0.19, 'stump']],
      bourg: [[0.12, 'flowers'], [0.16, 'tuft']], havre: [[0.1, 'flowers'], [0.14, 'tuft']],
      foret: [[0.08, 'fern'], [0.14, 'leaves'], [0.18, 'mushroom'], [0.2, 'log'], [0.22, 'stump']],
      montagne: [[0.08, 'gravel'], [0.14, 'pebbles'], [0.17, 'crack'], [0.185, 'bones'], [0.2, 'tuft']],
      marais: [[0.09, 'reeds'], [0.14, 'puddle'], [0.18, 'mushroom'], [0.2, 'log']],
      volcan: [[0.07, 'shard'], [0.11, 'vent'], [0.14, 'bones'], [0.18, 'gravel']],
    }[zone] || [];
    const r = L.find(q => h < q[0]);
    return r ? r[1] : null;
  },
  chunk(gx, gy) {
    return G.SPR.get(`chunk_${gx}_${gy}`, () => {
      const CK = 16, c = U.canvas(CK * 32, CK * 32), x = c.getContext('2d');
      x.imageSmoothingEnabled = false; x.scale(2, 2);
      const tiles = [];
      for (let ty = gy * CK; ty < Math.min(this.H, gy * CK + CK); ty++) for (let tx = gx * CK; tx < Math.min(this.W, gx * CK + CK); tx++) tiles.push([tx, ty]);
      // textures
      tiles.forEach(([tx, ty]) => {
        const ch = this.t[ty][tx], sx = (tx - gx * CK) * 16, sy = (ty - gy * CK) * 16;
        if (ch === '~' || ch === 'l' || ch === 'w' || ch === '=') return;
        const base = this.baseCh(tx, ty), v = Math.floor(U.hash(tx, ty, 5) * 8);
        x.drawImage(G.SPR.tile(base, v, this.groundStyle(base, tx, ty)), sx, sy, 16, 16);
      });
      // teinte continue à grande échelle (sur l'herbe et la roche)
      const img = x.getImageData(0, 0, c.width, c.height), D = img.data, W = c.width;
      for (let BY = 0; BY < c.height; BY += 4) for (let BX = 0; BX < W; BX += 4) {
        const tx = gx * CK + (BX >> 5), ty = gy * CK + (BY >> 5), ch = this.baseCh(tx, ty);
        if (!ch || ch === '_' || ch === 'p' || ch === 's') continue;
        const wx = (gx * CK * 32 + BX + 2) / 32, wy = (gy * CK * 32 + BY + 2) / 32;
        const n = U.noise(wx / 5, wy / 5, 61), b = (U.noise(wx / 2, wy / 2, 62) - 0.5) * 0.12;
        let tr = 0, tg = 0, tb = 0, a = 0;
        if (ch === '.' || ch === ',' || ch === 'g') { if (n < 0.42) { tr = 196; tg = 176; tb = 80; a = (0.42 - n) * 0.9; } else if (n > 0.6) { tr = 30; tg = 110; tb = 80; a = (n - 0.6) * 0.8; } }
        else if (ch === 'f') { if (n > 0.55) { tr = 20; tg = 70; tb = 60; a = (n - 0.55) * 0.8; } else { tr = 90; tg = 110; tb = 40; a = (0.55 - n) * 0.4; } }
        else if (ch === 'r') { if (n < 0.45) { tr = 120; tg = 96; tb = 70; a = (0.45 - n) * 0.8; } else { tr = 100; tg = 110; tb = 130; a = (n - 0.45) * 0.5; } }
        a = Math.min(0.32, a);
        for (let Y = BY; Y < BY + 4; Y++) for (let X = BX; X < BX + 4; X++) {
          const i = (Y * W + X) * 4; if (D[i + 3] === 0) continue;
          D[i] = Math.min(255, (D[i] * (1 - a) + tr * a) * (1 + b)); D[i + 1] = Math.min(255, (D[i + 1] * (1 - a) + tg * a) * (1 + b)); D[i + 2] = Math.min(255, (D[i + 2] * (1 - a) + tb * a) * (1 + b));
        }
      }
      x.putImageData(img, 0, 0);
      // transitions douces : le sol « dominant » déborde sur son voisin
      tiles.forEach(([tx, ty]) => {
        const ch = this.t[ty][tx]; if (ch === '=') return;
        const sx = (tx - gx * CK) * 16, sy = (ty - gy * CK) * 16, base = this.baseCh(tx, ty), pb = G.SPR.prio(base);
        [[0, -1, 0], [1, 0, 1], [0, 1, 2], [-1, 0, 3]].forEach(([dx, dy, side]) => {
          const nb = this.baseCh(tx + dx, ty + dy);
          if (nb && nb !== base && G.SPR.prio(nb) > pb && !(G.SPR.prio(nb) === 7 && pb === 7)) x.drawImage(G.SPR.fringe(nb, side, (tx * 3 + ty) % 4), sx, sy, 16, 16);
        });
      });
      // petits décors
      tiles.forEach(([tx, ty]) => {
        const d = this.decalFor(tx, ty); if (!d) return;
        const sx = (tx - gx * CK) * 16 + (U.hash(tx, ty, 334) - 0.5) * 6, sy = (ty - gy * CK) * 16 + (U.hash(ty, tx, 334) - 0.5) * 4;
        x.drawImage(G.SPR.decal(d, Math.floor(U.hash(tx, ty, 335) * 6)), sx, sy, 16, 16);
      });
      return c;
    });
  },
  baseCh(x, y) { if (x < 0 || y < 0 || x >= this.W || y >= this.H) return null; const c = this.t[y][x]; return c === 'T' || c === '^' ? this.groundOf(this.z[y][x]) : c === '=' ? null : c; },
  shadow(x, y, r) { const c = G.R.lx; c.fillStyle = 'rgba(10,10,30,0.28)'; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), r, r * 0.45, 0, 0, Math.PI * 2); c.fill(); },
  drawCliff(tx, ty, sx, sy, zone) {
    const x = G.R.lx, volc = zone === 'volcan', v = Math.floor(U.hash(tx, ty, 6) * 4);
    const below = this.tile(tx, ty + 1) === '^', snow = !volc && ty < 7 && U.hash(tx, ty, 8) < 0.7;
    x.drawImage(G.SPR.cliffTop(volc, v, snow), sx, sy - 8, 16, 16);
    const bev = (x0, y0, w, h, c0, horiz, rev) => { const g = horiz ? x.createLinearGradient(x0, 0, x0 + w, 0) : x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(rev ? 1 : 0, c0); g.addColorStop(rev ? 0 : 1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(x0, y0, w, h); };
    const L = this.tile(tx - 1, ty) !== '^', Rr = this.tile(tx + 1, ty) !== '^', T = this.tile(tx, ty - 1) !== '^';
    if (L) { bev(sx, sy - 8, 2.5, 16, volc ? 'rgba(150,110,100,0.45)' : 'rgba(255,255,250,0.45)', true); x.fillStyle = 'rgba(20,16,20,0.6)'; x.fillRect(sx, sy - 8, 0.5, 16); }
    if (Rr) { bev(sx + 13, sy - 8, 3, 16, 'rgba(0,0,0,0.35)', true, true); x.fillStyle = 'rgba(20,16,20,0.6)'; x.fillRect(sx + 15.5, sy - 8, 0.5, 16); }
    if (T) { bev(sx, sy - 8, 16, 2.5, volc ? 'rgba(150,110,100,0.5)' : 'rgba(255,255,250,0.55)', false); x.fillStyle = 'rgba(20,16,20,0.6)'; x.fillRect(sx, sy - 8, 16, 0.5); }
    if (!below) bev(sx, sy + 5, 16, 3, 'rgba(0,0,0,0.3)', false, true);
    if (!below) {
      x.drawImage(G.SPR.cliffFront(volc, v), sx, sy + 8, 16, 8);
      const g = x.createLinearGradient(0, sy + 16, 0, sy + 19); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(sx, sy + 16, 16, 3);
    }
  },
  drawEnt(e, sx, sy, frame, lights, day) {
    const x = G.R.lx, t = performance.now() / 1000;
    switch (e.k) {
      case 'house': {
        const img = G.SPR.arch(e.arch || 'thatch', 1, e.aopt || {});
        if (e.aopt && e.aopt.inn) lights.push({ x: sx + 24, y: sy + 32 - 15, r: day.night ? 34 : 14, c: '#ffd060', a: 0.8 });
        G.SPR.draw(x, img, sx, sy + e.h * 16 - G.SPR.lh(img));
        if (day.night) lights.push({ x: sx + e.w * 8, y: sy + 14, r: 34, c: '#ffcf70', a: 0.6 });
        break;
      }
      case 'plot': {
        const lvl = G.S.town.b[e.id] || 0;
        if (!lvl) { G.SPR.draw(x, G.SPR.plot(), sx, sy); }
        else {
          const img = G.SPR.building(e.id, lvl);
          G.SPR.draw(x, img, sx, sy + 32 - G.SPR.lh(img));
          if (e.id === 'taverne') lights.push({ x: sx + 24, y: sy + 32 - 15, r: day.night ? 34 : 14, c: '#ffd060', a: 0.8 });
          for (let i = 0; i < lvl; i++) { x.fillStyle = '#ffd86a'; x.fillRect(sx + 2 + i * 4, sy + 28, 3, 3); }
          if (e.id === 'forge') { lights.push({ x: sx + 24, y: sy + 26, r: 40, c: '#ff8a2a', a: 0.8 }); if (Math.random() < 0.08) G.R.parts.push({ x: sx + 36, y: sy - 12, vx: U.rand(-3, 3), vy: -12, life: 2.5, max: 2.5, size: 5, c: '#c8c8c8', glow: false, grav: -2, drag: 1, type: 'fog', rot: 0, layer: 1 }); }
          if (day.night) lights.push({ x: sx + 24, y: sy + 14, r: 34, c: '#ffcf70', a: 0.6 });
        }
        break;
      }
      case 'wall': G.SPR.draw(x, G.SPR.wallSeg((e.x * 7 + e.y * 3) % 6), sx, sy + 16 - 24 + 2); break;
      case 'gate': {
        this.shadow(sx + 8, sy + 15, 6);
        G.SPR.draw(x, G.SPR.gatePost(e.zone, e.side, e.horiz), sx, sy + 16 - 36 + 2);
        lights.push({ x: sx + 8, y: sy - 17, r: day.night ? 48 : 22, c: '#ffd070', a: 0.9 });
        break;
      }
      case 'board': {
        this.shadow(sx + 8, sy + 15, 7);
        x.fillStyle = '#5a3a1e'; x.fillRect(sx + 2, sy - 2, 2, 17); x.fillRect(sx + 12, sy - 2, 2, 17);
        x.fillStyle = '#8a5a32'; x.fillRect(sx, sy - 10, 16, 14); x.fillStyle = '#a8744a'; x.fillRect(sx, sy - 10, 16, 2);
        x.fillStyle = '#3a2412'; x.fillRect(sx, sy + 3, 16, 1);
        [[2, -7, '#f4ead0'], [7, -8, '#fff6e0'], [11, -6, '#f0e0c0'], [4, -3, '#e8d8b8']].forEach(([px, py, c]) => { x.fillStyle = c; x.fillRect(sx + px, sy + py, 4, 5); x.fillStyle = '#c83a3a'; x.fillRect(sx + px + 1, sy + py + 1, 2, 1); });
        x.fillStyle = '#ffd86a'; x.fillRect(sx + 7, sy - 13, 2, 3);
        const ready = G.HUNTS.some(h => G.S.hunts[h.id] === 'done') || G.S.hunts.inf === 'done';
        if (ready) { x.fillStyle = '#7affb0'; x.font = 'bold 8px monospace'; x.fillText('✦', sx + 5, sy - 15 + Math.sin(t * 4) * 1.5); }
        lights.push({ x: sx + 8, y: sy - 4, r: day.night ? 36 : 16, c: '#ffd070', a: 0.6 });
        break;
      }
      case 'hunt': {
        const eid = e.hunt === 'inf' ? 'primordial' : G.HUNTS.find(h => h.id === e.hunt).t;
        if (!G.ENEMIES[eid]) G.makeInfinite(G.S.hunter.inf);
        const E = G.ENEMIES[eid], img = G.SPR.enemy(E.spr, E.pal, E.e), bob = Math.sin(t * 2.5 + e.x) * 2;
        const sc = G.SPR.lw(img) <= 24 ? 1.5 : 1, w = G.SPR.lw(img) * sc, h = G.SPR.lh(img) * sc;
        this.shadow(sx + 8, sy + 15, Math.min(14, w * 0.35));
        x.drawImage(img, Math.round(sx + 8 - w / 2), Math.round(sy + 16 - h + bob), w, h);
        x.fillStyle = '#ff3a4a'; x.font = 'bold 9px monospace'; x.fillText('☠', sx + 4, sy - h + 12 + bob + Math.sin(t * 5) * 1.5);
        lights.push({ x: sx + 8, y: sy + 4, r: 55, c: '#ff3a4a', a: 0.7 });
        if (Math.random() < 0.25) G.R.parts.push({ x: sx + 8 + U.rand(-10, 10), y: sy + 12, vx: 0, vy: -14, life: 1.2, max: 1.2, size: 1, c: '#ff5a6a', glow: true, grav: 0, drag: 1, type: 'dot', rot: 0, layer: 1 });
        break;
      }
      case 'mill': {
        const img = G.SPR.windmill(); G.SPR.draw(x, img, sx, sy + 32 - G.SPR.lh(img));
        const bl = G.SPR.millBlades(Math.floor(t * 4) % 8); G.SPR.draw(x, bl, sx + 16 - 18, sy + 32 - 52 + 16 - 18);
        if (day.night) lights.push({ x: sx + 16, y: sy + 8, r: 30, c: '#ffcf70', a: 0.6 });
        break;
      }
      case 'prop': G.SPR.draw(x, G.SPR.prop(e.type), sx, sy); break;
      case 'lamp': G.SPR.draw(x, G.SPR.lamp(), sx + 3, sy - 10); if (day.night || this.zoneAt(e.x, e.y) === 'havre') lights.push({ x: sx + 8, y: sy - 5, r: day.night ? 55 : 20, c: '#ffd070', a: 1 }); break;
      case 'sign': G.SPR.draw(x, G.SPR.sign(), sx, sy); break;
      case 'fountain': {
        G.SPR.draw(x, G.SPR.fountain(frame), sx - 4, sy + 16 - 26 + 3);
        if (Math.random() < 0.3) G.R.parts.push({ x: sx + 8, y: sy - 5, vx: U.rand(-12, 12), vy: U.rand(-20, -8), life: 0.7, max: 0.7, size: 0.7, c: '#cfeaff', glow: true, grav: 80, drag: 1, type: 'dot', rot: 0, layer: 1 });
        lights.push({ x: sx + 8, y: sy + 4, r: 36, c: '#6ab8ff', a: 0.6 });
        break;
      }
      case 'npc': {
        const bob = Math.floor(t * 2 + e.x) % 2;
        this.shadow(sx + 8, sy + 15, 5);
        G.SPR.draw(x, G.SPR.hero('npc_' + e.id, e.pal, e.dir || 'down', 0, G.SPR.NPC_STYLE[e.npc || e.id] || {}), sx, sy - bob);
        if (e.npc && !G.S.npcs[e.npc]) { const q = G.S.quests['r_' + e.npc]; x.fillStyle = q ? '#7affd8' : '#ffd86a'; x.font = 'bold 8px monospace'; x.fillText(q ? '…' : '!', sx + 6, sy - 3 + Math.sin(t * 4) * 1.5); }
        break;
      }
      case 'node': {
        const dep = this.nodeDepleted(e);
        G.SPR.draw(x, G.SPR.node(e.type, dep), sx - 2, sy - 8);
        if (this.mining && this.mining.e === e) {
          const p = this.mining.hits / this.mining.need;
          x.fillStyle = 'rgba(20,10,20,0.85)';
          const cracks = [[4, 3, 5, 1], [8, 4, 1, 4], [5, 8, 4, 1], [10, 9, 1, 4], [3, 11, 4, 1], [9, 13, 4, 1]];
          cracks.slice(0, Math.ceil(p * cracks.length)).forEach(c => x.fillRect(sx + c[0], sy + c[1], c[2], c[3]));
          x.fillStyle = '#000'; x.fillRect(sx, sy - 12, 16, 3); x.fillStyle = '#7affb0'; x.fillRect(sx, sy - 12, 16 * p, 3);
        }
        if (!dep && (e.type === 'cristal' || e.type === 'mithril')) lights.push({ x: sx + 8, y: sy + 6, r: 26, c: e.type === 'cristal' ? '#5ae8ff' : '#c8d8ff', a: 0.7 });
        if (!dep && Math.random() < 0.006) G.R.parts.push({ x: sx + U.rand(2, 14), y: sy + U.rand(-4, 8), vx: 0, vy: -4, life: 0.8, max: 0.8, size: 0.8, c: '#ffffff', glow: true, grav: 0, drag: 1, type: 'dot', rot: 0, layer: 1 });
        break;
      }
      case 'chest': G.SPR.draw(x, G.SPR.chest(G.S.chests[e.id]), sx, sy); if (!G.S.chests[e.id] && Math.random() < 0.02) G.R.parts.push({ x: sx + U.rand(2, 14), y: sy + 4, vx: 0, vy: -6, life: 1, max: 1, size: 0.8, c: '#ffe080', glow: true, grav: 0, drag: 1, type: 'dot', rot: 0, layer: 1 }); break;
      case 'stone': {
        G.SPR.draw(x, G.SPR.stone(), sx, sy - 14);
        lights.push({ x: sx + 8, y: sy - 2, r: 50 + Math.sin(t * 2) * 6, c: '#7affd8', a: 0.9 });
        if (Math.random() < 0.15) G.R.parts.push({ x: sx + 8 + U.rand(-4, 4), y: sy, vx: 0, vy: -10, life: 1.5, max: 1.5, size: 0.8, c: '#7affd8', glow: true, grav: 0, drag: 1, type: 'dot', rot: 0, layer: 1 });
        break;
      }
      case 'boss': {
        const E = G.ENEMIES[e.id], img = G.SPR.enemy(E.spr, E.pal, E.e), bob = Math.sin(t * 2) * 2;
        this.shadow(sx + 8, sy + 15, 14);
        G.SPR.draw(x, img, Math.round(sx + 8 - G.SPR.lw(img) / 2), Math.round(sy + 16 - G.SPR.lh(img) + bob));
        lights.push({ x: sx + 8, y: sy, r: 60, c: G.ELEM[E.e].c, a: 0.8 });
        if (Math.random() < 0.25) G.R.parts.push({ x: sx + 8 + U.rand(-16, 16), y: sy + 12, vx: 0, vy: -14, life: 1.4, max: 1.4, size: 1, c: '#c86aff', glow: true, grav: 0, drag: 1, type: 'dot', rot: 0, layer: 1 });
        break;
      }
      case 'barrier': {
        for (let i = 0; i < 6; i++) {
          const h = 10 + Math.sin(t * 8 + i * 1.7) * 5;
          x.fillStyle = i % 2 ? '#ff8a2a' : '#ffcf40'; x.fillRect(sx + i * 3 - 1, sy + 16 - h - 4, 3, h + 4);
        }
        x.fillStyle = '#fff4b0'; x.fillRect(sx + 5, sy + 6, 6, 8);
        lights.push({ x: sx + 8, y: sy + 6, r: 60, c: '#ff7a2a', a: 1 });
        if (Math.random() < 0.4) G.R.parts.push({ x: sx + U.rand(0, 16), y: sy + 10, vx: U.rand(-4, 4), vy: -30, life: 0.9, max: 0.9, size: 1, c: U.pick(['#ffcf40', '#ff6a2a']), glow: true, grav: 0, drag: 1, type: 'dot', rot: 0, layer: 1 });
        break;
      }
    }
  },
};
