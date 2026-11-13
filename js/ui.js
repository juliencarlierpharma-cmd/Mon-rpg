'use strict';
// ============================================================
//  Interface (DOM) : dialogues, menus, boutiques, combat
// ============================================================
const $ = s => document.querySelector(s);
const esc = U.esc;
const bar = (v, m, cls) => `<div class="bar ${cls || ''}"><i style="width:${U.clamp(m ? v / m * 100 : 0, 0, 100)}%"></i></div>`;
const elemTag = e => e ? `<span class="etag" style="--c:${G.ELEM[e].c}">${G.ELEM[e].i} ${G.ELEM[e].n}</span>` : '<span class="etag" style="--c:#aab">◌ Neutre</span>';

G.UI = {
  stack: [],
  init() {
    this.layer = $('#layer'); this.toasts = $('#toasts'); this.hud = $('#hud'); this.bui = $('#battle-ui');
    document.addEventListener('keydown', e => this.onKey(e));
    this.lastReady = 0;
    setInterval(() => this.updateHUD(), 400);
  },
  busy() { return this.stack.length > 0 || G.scene !== 'world'; },
  push(el, opts = {}) {
    this.layer.appendChild(el);
    const entry = { el, ...opts };
    this.stack.push(entry);
    requestAnimationFrame(() => { el.classList.add('show'); this.focusFirst(el); });
    return entry;
  },
  pop(entry) {
    const i = this.stack.indexOf(entry || this.stack[this.stack.length - 1]);
    if (i < 0) return;
    const [e] = this.stack.splice(i, 1);
    e.el.remove();
    this.lastClose = performance.now();
    if (e.onClose) e.onClose();
    const top = this.stack[this.stack.length - 1];
    if (top) this.focusFirst(top.el);
  },
  focusFirst(root) {
    const f = root.querySelector('[data-focus]') || root.querySelector('button:not([disabled])');
    if (f && !('ontouchstart' in window)) f.focus({ preventScroll: true });
  },
  bind(root, handlers) {
    root.querySelectorAll('[data-a]').forEach(b => {
      b.onclick = ev => { ev.stopPropagation(); G.Audio.init(); const h = handlers[b.dataset.a]; if (h) { G.Audio.sfx(b.dataset.a === 'back' || b.dataset.a === 'close' ? 'back' : 'cursor'); h(b.dataset, b); } };
    });
  },
  onKey(e) {
    G.Audio.init();
    const topEl = this.stack.length ? this.stack[this.stack.length - 1].el : (G.scene === 'battle' ? this.bui : null);
    if (!topEl) return;
    const top = this.stack[this.stack.length - 1];
    if (top && top.onKey && top.onKey(e) === true) { e.preventDefault(); return; }
    const k = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) {
      const list = [...topEl.querySelectorAll('button:not([disabled])')].filter(b => b.offsetParent);
      if (!list.length) return;
      e.preventDefault();
      let i = list.indexOf(document.activeElement);
      i = i < 0 ? 0 : (k === 'ArrowUp' || k === 'ArrowLeft') ? (i - 1 + list.length) % list.length : (i + 1) % list.length;
      list[i].focus(); G.Audio.sfx('cursor');
      if (list[i].onmouseenter) list[i].onmouseenter();
    } else if (k === 'Escape' || k === 'Backspace' || k === 'x' || k === 'X') {
      const b = topEl.querySelector('[data-a="back"]') || topEl.querySelector('[data-a="close"]');
      if (b) { e.preventDefault(); b.click(); }
    }
  },
  // ---------------- HUD ----------------
  updateHUD() {
    if (G.scene !== 'world' || !G.S) { this.hud.classList.add('hide'); return; }
    this.hud.classList.remove('hide');
    const W = G.World, z = G.ZONES[W.zoneAt(W.P.x, W.P.y)], h = Math.floor(G.S.time / 60), m = Math.floor(G.S.time % 60);
    const ready = G.achReadyCount();
    const night = W.dayLight().night;
    const zid = W.zoneAt(W.P.x, W.P.y), plv = Math.round(G.S.party.reduce((a, c) => a + G.S.chars[c].lvl, 0) / G.S.party.length);
    if (this.routeOpen == null) { try { this.routeOpen = localStorage.getItem('ee-route') !== '0'; } catch (e) { this.routeOpen = true; } }
    const route = G.ZONE_ORDER.map((id, i) => {
      const Z = G.ZONES[id], done = Z.boss && G.S.bosses[Z.boss], cur = id === zid;
      const warn = !done && plv < Z.lmin ? 'low' : '';
      return `<li class="${cur ? 'cur' : ''} ${done ? 'done' : ''} ${warn}"><span class="rn">${i + 1}</span><span class="rz">${esc(Z.n)}</span><span class="rl">${done ? '✔' : `${Z.lmin}–${Z.lmax}`}</span></li>`;
    }).join('');
    const zl = z.town ? z.lv : `Niv. conseillé ${z.lmin}–${z.lmax}`;
    this.hud.innerHTML = `<div class="hud-col"><div class="hud-l"><div class="zone">${esc(z.n)}</div><div class="sub">${esc(zl)} · Équipe niv. ${plv}</div><div class="sub">${night ? '🌙' : '☀️'} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} · 💰 ${U.fmt(G.S.gold)}</div></div>
      <div class="route ${this.routeOpen ? '' : 'closed'}"><button class="route-h" id="routeBtn">🧭 Itinéraire ${this.routeOpen ? '▾' : '▸'}</button>${this.routeOpen ? `<ol>${route}</ol>` : ''}</div></div>
      <button class="hud-menu" id="menuBtn">☰${ready ? `<b class="badge">${ready}</b>` : ''}</button>`;
    $('#menuBtn').onclick = () => { G.Audio.init(); if (!this.busy()) this.openMenu(ready ? 'succes' : undefined); };
    $('#routeBtn').onclick = () => { this.routeOpen = !this.routeOpen; try { localStorage.setItem('ee-route', this.routeOpen ? '1' : '0'); } catch (e) { } this.updateHUD(); };
  },
  zoneBanner(Z, first) {
    let b = document.getElementById('zbanner');
    if (!b) { b = U.el('<div id="zbanner"><div class="zb-n"></div><div class="zb-l"></div></div>'); document.body.appendChild(b); }
    b.querySelector('.zb-n').textContent = Z.n; b.querySelector('.zb-l').textContent = (Z.lv || '') + (first ? ' · voyage rapide débloqué' : '');
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(this._zb); this._zb = setTimeout(() => b.classList.remove('show'), 2600);
  },
  toast(msg) {
    const t = U.el(`<div class="toast">${esc(msg)}</div>`);
    this.toasts.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3200);
  },
  checkAch() {
    const n = G.achReadyCount();
    if (n > this.lastReady) { G.Audio.sfx('achieve'); this.toast(`✦ Accomplissement à réclamer ! (${n})`); }
    this.lastReady = n;
  },
  // ---------------- Dialogues ----------------
  say(lines) {
    return new Promise(res => {
      if (!lines.length) return res();
      let i = 0, typing = null;
      const el = U.el(`<div class="modal dialog-wrap"><div class="dialog win"><div class="who"></div><div class="txt"></div><div class="more">▼</div></div></div>`);
      const show = () => {
        const L = typeof lines[i] === 'string' ? { who: '', t: lines[i] } : lines[i];
        el.querySelector('.who').textContent = L.who || '';
        el.querySelector('.who').style.display = L.who ? '' : 'none';
        const txt = el.querySelector('.txt'); txt.textContent = '';
        let k = 0; clearInterval(typing);
        typing = setInterval(() => { k += 2; txt.textContent = L.t.slice(0, k); if (k >= L.t.length) { clearInterval(typing); typing = null; } }, 16);
      };
      const adv = () => {
        if (typing) { clearInterval(typing); typing = null; const L = typeof lines[i] === 'string' ? { t: lines[i] } : lines[i]; el.querySelector('.txt').textContent = L.t; return; }
        G.Audio.sfx('cursor');
        i++;
        if (i >= lines.length) { this.pop(entry); res(); } else show();
      };
      el.onclick = adv;
      const entry = this.push(el, { onKey: e => { if (['Enter', ' ', 'z', 'Z'].includes(e.key)) { adv(); return true; } if (e.key === 'Escape') return true; } });
      entry.adv = adv;
      show();
    });
  },
  ask(text, options) {
    return new Promise(res => {
      const el = U.el(`<div class="modal dialog-wrap"><div class="dialog win"><div class="txt">${esc(text)}</div><div class="choices">${options.map((o, i) => `<button class="btn" data-a="pick" data-i="${i}" ${i === 0 ? 'data-focus' : ''}>${esc(o)}</button>`).join('')}</div></div></div>`);
      let entry;
      this.bind(el, { pick: d => { this.pop(entry); res(+d.i); } });
      entry = this.push(el, { onKey: e => { if (e.key === 'Escape') { this.pop(entry); res(options.length - 1); return true; } } });
    });
  },
  // ---------------- Menu principal ----------------
  TABS: [['equipe', '👥', 'Équipe'], ['armes', '⚔️', 'Armes'], ['competences', '📜', 'Compétences'], ['inventaire', '🎒', 'Sac'], ['artisanat', '🔨', 'Artisanat'], ['familiers', '🐾', 'Familiers'], ['succes', '🏆', 'Accompl.'], ['chasses', '🎯', 'Chasses'], ['havre', '🏘️', 'Havre'], ['quetes', '📖', 'Quêtes'], ['carte', '🗺️', 'Carte'], ['systeme', '⚙️', 'Système']],
  openMenu(tab) {
    if (this.menu) return;
    this.menuTab = tab || this.menuTab || 'equipe';
    this.menuChar = this.menuChar && G.S.party.includes(this.menuChar) ? this.menuChar : G.S.party[0];
    const el = U.el(`<div class="modal menu-wrap"><div class="menu win"><nav class="tabs"></nav><div class="mbody"></div><button class="btn close" data-a="close">✕</button></div></div>`);
    this.menu = this.push(el, { onClose: () => { this.menu = null; G.save(); } });
    this.renderMenu();
  },
  closeMenu() { if (this.menu) this.pop(this.menu); },
  renderMenu() {
    if (!this.menu) return;
    const el = this.menu.el, ready = G.achReadyCount();
    el.querySelector('.tabs').innerHTML = this.TABS.map(([id, ic, n]) => `<button class="tab ${id === this.menuTab ? 'on' : ''}" data-a="tab" data-t="${id}">${ic}<span>${n}</span>${id === 'succes' && ready ? `<b class="badge">${ready}</b>` : ''}</button>`).join('');
    const body = el.querySelector('.mbody');
    const st = body.scrollTop;
    body.innerHTML = this['tab_' + this.menuTab]();
    body.scrollTop = st;
    const H = Object.assign({
      tab: d => { this.menuTab = d.t; this.renderMenu(); el.querySelector('.mbody').scrollTop = 0; },
      close: () => this.closeMenu(),
      char: d => { this.menuChar = d.c; this.renderMenu(); },
    }, this.menuHandlers());
    this.bind(el, H);
    if (this.menuTab === 'carte') this.drawMap(body.querySelector('canvas'));
    const on = el.querySelector('.tab.on'); if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  },
  charTabs(all) {
    const list = all ? G.CHAR_ORDER.filter(c => G.S.party.includes(c)) : G.S.party;
    return `<div class="chartabs">${list.map(c => `<button class="ctab ${c === this.menuChar ? 'on' : ''}" data-a="char" data-c="${c}"><img src="${G.SPR.charURL(c)}">${G.CHARS[c].n}</button>`).join('')}</div>`;
  },
  // ----- Équipe -----
  tab_equipe() {
    return `<h2>Équipe</h2><div class="cards">${G.S.party.map((cid, idx) => {
      const c = G.S.chars[cid], m = G.calc(cid), D = G.CHARS[cid], f = G.famOf(cid);
      const A = c.armor ? G.ARMORS[c.armor] : null, Ac = c.acc ? G.ARMORS[c.acc] : null;
      return `<div class="card pcard">
        <div class="pc-head"><img class="portrait" src="${G.SPR.battlerURL(cid, m.wid)}"><div><h3>${D.n} <small>${D.title}</small></h3>
        <div>Niv. <b>${c.lvl}</b> ${c.lvl < G.MAX_LVL ? `<span class="dim">EXP ${c.exp}/${G.expNext(c.lvl)}</span>` : '<span class="dim">MAX</span>'}</div>${bar(c.exp, G.expNext(c.lvl), 'exp')}
        <div class="hpmp"><span>PV ${G.curHP(cid)}/${m.hp}</span>${bar(G.curHP(cid), m.hp, 'hp')}<span>PM ${G.curMP(cid)}/${m.mp}</span>${bar(G.curMP(cid), m.mp, 'mp')}</div></div></div>
        <div class="stats">${['atk', 'mag', 'def', 'res', 'spd', 'crit'].map(k => `<div><span>${G.STATN[k]}</span><b>${m[k]}${k === 'crit' ? '%' : ''}</b></div>`).join('')}</div>
        <div class="equip">
          <div class="eqrow"><span>Arme</span><b>${elemTag(c.wslot)} ${m.w.n} <small>Rang ${m.tier}</small></b><button class="btn sm" data-a="goarmes" data-c="${cid}">Changer</button></div>
          <div class="eqrow"><span>Armure</span><b>${A ? esc(A.n) : '<i class="dim">aucune</i>'}</b><button class="btn sm" data-a="equipList" data-c="${cid}" data-s="armor">Changer</button></div>
          <div class="eqrow"><span>Accessoire</span><b>${Ac ? esc(Ac.n) : '<i class="dim">aucun</i>'}</b><button class="btn sm" data-a="equipList" data-c="${cid}" data-s="acc">Changer</button></div>
          <div class="eqrow"><span>Familier</span><b>${f ? `<img class="mini" src="${G.SPR.famURL(f.id)}"> ${G.FAMS[f.id].n} · Lien ${m.link}${m.reson ? ' <span class="reson">Résonance !</span>' : ''}` : '<i class="dim">aucun</i>'}</b><button class="btn sm" data-a="tab" data-t="familiers">Gérer</button></div>
        </div>
        <div class="dim small">Trait : <b>${m.w.trait.n}</b> — ${m.w.trait.d}</div>
        ${idx > 0 ? `<button class="btn sm" data-a="lead" data-c="${cid}">Mettre en tête</button>` : '<span class="dim small">Chef d’équipe (affiché sur la carte)</span>'}
      </div>`;
    }).join('')}</div>`;
  },
  // ----- Armes -----
  tab_armes() {
    const cid = this.menuChar, c = G.S.chars[cid], D = G.CHARS[cid];
    return `<h2>Armes — forge & équipement</h2>${this.charTabs()}
      <p class="dim small">Chaque héros possède 4 armes, une par emplacement élémentaire. Chaque arme possède son trait, ses compétences et oriente vers un style de jeu unique. Rang max actuel : <b>${G.maxWeaponTier()}</b> (dépend de la Forge du Havre).</p>
      <div class="cards">${G.ELEM_ORDER.map(slot => this.wcard(cid, slot)).join('')}</div>`;
  },
  wcard(cid, slot) {
    const c = G.S.chars[cid], wid = G.CHARS[cid].weapons[slot], W = G.WEAPONS[wid], own = c.weapons[slot], eq = c.wslot === slot;
    const prevSlot = c.wslot, prevW = c.weapons[slot];
    if (!own) c.weapons[slot] = { tier: 1 };
    c.wslot = slot; const m = G.calc(cid); c.wslot = prevSlot; c.weapons[slot] = prevW;
    const tier = own ? own.tier : 1;
    const skills = W.skills.map(s => { const S = G.SKILLS[s.id], ok = own && c.lvl >= s.lvl && tier >= s.tier; return `<li class="${ok ? 'ok' : 'lock'}">${S.passive ? '◆' : '✦'} <b>${S.n}</b> <small>${S.passive ? 'passif' : S.mp + ' PM'} · niv.${s.lvl}${s.tier > 1 ? ' · rang ' + s.tier : ''}</small><div class="dim small">${S.d}</div></li>`; }).join('');
    let actions = '';
    if (!own) actions = `<div class="cost-line">${G.costHTML(W.recipe)}</div><button class="btn gold" data-a="forge" data-c="${cid}" data-s="${slot}" ${G.canPay(W.recipe) ? '' : 'disabled'}>⚒️ Forger</button>`;
    else {
      if (!eq) actions += `<button class="btn" data-a="equipW" data-c="${cid}" data-s="${slot}">Équiper</button>`;
      if (tier < G.MAX_TIER) {
        const cost = G.upgradeCost(W, tier), capped = tier >= G.maxWeaponTier();
        actions += `<div class="cost-line">→ Rang ${tier + 1} : ${G.costHTML(cost)}</div><button class="btn gold" data-a="upgrade" data-c="${cid}" data-s="${slot}" ${!capped && G.canPay(cost) ? '' : 'disabled'}>${capped ? (tier >= 5 ? 'Forge niv. 4 requise' : `Forge niv. ${tier} requise`) : tier === 5 ? '🌟 Éveiller (rang 6)' : '⬆️ Améliorer'}</button>`;
      } else actions += '<div class="dim">Rang maximal atteint ✦</div>';
    }
    return `<div class="card wcard ${eq ? 'eq' : ''} ${own ? '' : 'unowned'}" style="--c:${G.ELEM[slot].c}">
      <div class="wslot">${G.ELEM[slot].i} Emplacement ${G.ELEM[slot].n}${eq ? ' <span class="pill">Équipée</span>' : ''}</div>
      <div class="wh"><img class="wimg" src="${G.SPR.battlerURL(cid, wid)}"><div><h3>${W.n}</h3><div class="small">${W.kn} · Infusion : ${elemTag(W.e)}</div><div class="small">${own ? `Rang <b>${tier}</b>/${G.MAX_TIER}` : '<i>Non forgée</i>'}</div></div></div>
      <div class="build">${W.build}</div>
      <div class="trait">◈ <b>${W.trait.n}</b> — ${W.trait.d}</div>
      <div class="stats mini">${['hp', 'atk', 'mag', 'def', 'res', 'spd', 'crit'].map(k => `<div><span>${G.STATN[k]}</span><b>${m[k]}</b></div>`).join('')}</div>
      <ul class="skills">${skills}</ul>
      <div class="actions">${actions}</div></div>`;
  },
  // ----- Compétences -----
  tab_competences() {
    const cid = this.menuChar, c = G.S.chars[cid], m = G.calc(cid), D = G.CHARS[cid];
    const wsk = m.w.skills.map(s => { const S = G.SKILLS[s.id], ok = c.lvl >= s.lvl && m.tier >= s.tier; return `<li class="${ok ? 'ok' : 'lock'}">${S.passive ? '◆' : '✦'} <b>${S.n}</b> <small>${S.passive ? 'Passif' : `${Math.ceil(S.mp * (m.flags.has('thrift') ? 0.7 : 1))} PM`} ${ok ? '' : `· niv. ${s.lvl}${s.tier > 1 ? ' & rang ' + s.tier : ''}`}</small><div class="dim small">${S.d}</div></li>`; }).join('');
    const inn = D.innate.map(p => `<li class="${c.lvl >= p.lvl ? 'ok' : 'lock'}">◆ <b>${p.n}</b> <small>Passif · niv. ${p.lvl}</small><div class="dim small">${p.d}</div></li>`).join('');
    const F = m.fam ? G.FAMS[m.fam.id] : null;
    return `<h2>Compétences</h2>${this.charTabs()}
      <div class="card"><h3>${elemTag(c.wslot)} ${m.w.n}</h3><div class="trait">◈ <b>${m.w.trait.n}</b> — ${m.w.trait.d}</div><ul class="skills">${wsk}</ul></div>
      <div class="card"><h3>Talents innés de ${D.n}</h3><ul class="skills">${inn}</ul></div>
      ${F ? `<div class="card"><h3>Synergie avec ${F.n}</h3><ul class="skills">
        <li class="${m.link >= 1 ? 'ok' : 'lock'}">◆ <b>Lien I</b> <small>affinité 30</small><div class="dim small">${F.bd}${m.reson ? ' ×1.5 (Résonance)' : ''}</div></li>
        <li class="${m.link >= 2 ? 'ok' : 'lock'}">✦ <b>Lien II — ${G.SKILLS[F.tech].n}</b> <small>affinité 60</small><div class="dim small">${G.SKILLS[F.tech].d} (commande « Familier » quand l’énergie est pleine)</div></li>
        <li class="${m.link >= 3 ? 'ok' : 'lock'}">◆ <b>Lien III</b> <small>affinité 100</small><div class="dim small">Bonus passif doublé et technique liée +50%.</div></li></ul></div>` : ''}`;
  },
  // ----- Inventaire -----
  tab_inventaire() {
    const S = G.S;
    const items = Object.keys(S.items).filter(k => S.items[k] > 0);
    const mats = Object.keys(G.MATS).filter(k => S.mats[k] > 0);
    return `<h2>Sac</h2>
      <h3>Objets</h3><div class="grid">${items.length ? items.map(k => { const I = G.ITEMS[k]; const usable = !I.noUse && !I.battleOnly && !I.fam && I.tgt !== 'dead'; return `<div class="cell"><span class="ic">${I.i}</span><div><b>${I.n}</b> ×${S.items[k]}<div class="dim small">${I.d}</div></div>${usable ? `<button class="btn sm" data-a="useItem" data-i="${k}">Utiliser</button>` : ''}</div>`; }).join('') : '<p class="dim">Aucun objet.</p>'}</div>
      <h3>Matériaux</h3><div class="grid">${mats.length ? mats.map(k => `<div class="cell"><span class="ic">${G.MATS[k].i}</span><div><b>${G.MATS[k].n}</b> ×${S.mats[k]}<div class="dim small">${G.MATS[k].d}</div></div></div>`).join('') : '<p class="dim">Aucun matériau.</p>'}</div>
      <h3>Outils</h3><div class="grid"><div class="cell"><span class="ic">⛏️</span><div><b>Pioche</b> : ${['mains nues', 'bois', 'pierre', 'fer'][S.tools.pick]}</div></div><div class="cell"><span class="ic">🪓</span><div><b>Hache</b> : ${['mains nues', 'mains nues', 'pierre', 'fer'][S.tools.axe]}</div></div></div>`;
  },
  // ----- Artisanat -----
  tab_artisanat() {
    const S = G.S, maxT = G.maxArmorTier();
    const ar = Object.keys(G.ARMORS).filter(k => G.ARMORS[k].r).map(k => {
      const A = G.ARMORS[k], lock = A.tier > maxT;
      const st = Object.keys(A.st).map(s => `${G.STATN[s]} +${A.st[s]}`).join(', ');
      return `<div class="cell recipe ${lock ? 'locked' : ''}"><div><b>${A.slot === 'armor' ? '🛡️' : '💍'} ${A.n}</b> <small>rang ${A.tier}${S.armors[k] ? ` · possédé ×${S.armors[k]}` : ''}</small><div class="dim small">${st}${st ? ' · ' : ''}${A.d}</div><div class="cost-line">${lock ? `Atelier niv. ${A.tier - 1} requis` : G.costHTML(A.r)}</div></div><button class="btn sm gold" data-a="craftA" data-i="${k}" ${!lock && G.canPay(A.r) ? '' : 'disabled'}>Fabriquer</button></div>`;
    }).join('');
    const tools = Object.keys(G.TOOLS).map(k => {
      const T = G.TOOLS[k], have = S.tools[T.type] >= T.tier;
      return `<div class="cell recipe"><div><b>${T.i} ${T.n}</b>${have ? ' <span class="pill">possédé</span>' : ''}<div class="cost-line">${G.costHTML(T.r)}</div></div><button class="btn sm gold" data-a="craftT" data-i="${k}" ${!have && G.canPay(T.r) ? '' : 'disabled'}>Fabriquer</button></div>`;
    }).join('');
    const ref = Object.keys(G.REFINE).map(k => {
      const R = G.REFINE[k];
      return `<div class="cell recipe"><div><b>${G.iconOf(R.out)} ${G.nameOf(R.out)}</b> <small>(${G.countOf(R.out)})</small><div class="cost-line">${G.costHTML({ m: R.m })}</div></div><button class="btn sm" data-a="refine" data-i="${k}" ${G.canPay({ m: R.m }) ? '' : 'disabled'}>×1</button><button class="btn sm" data-a="refine" data-i="${k}" data-n="5" ${G.canPay({ m: Object.fromEntries(Object.entries(R.m).map(([a, b]) => [a, b * 5])) }) ? '' : 'disabled'}>×5</button></div>`;
    }).join('');
    return `<h2>Artisanat</h2><p class="dim small">Aucune armure ne s’achète : tout se fabrique. Rang d’armure max : <b>${maxT}</b> (Atelier du Havre).</p>
      <h3>Armures & accessoires</h3><div class="grid">${ar}</div>
      <h3>Outils de collecte</h3><p class="dim small">Frappez les ressources sur la carte (bouton A). De meilleurs outils ouvrent de nouveaux filons et récoltent plus vite.</p><div class="grid">${tools}</div>
      <h3>Raffinage & préparations</h3><div class="grid">${ref}</div>`;
  },
  // ----- Familiers -----
  tab_familiers() {
    const S = G.S, ids = Object.keys(S.fams);
    if (!ids.length) return `<h2>Familiers</h2><p class="dim">Vous n’avez encore aucun familier. Remportez votre premier combat puis réclamez l’accomplissement « Premier sang » ! Certains monstres peuvent aussi être apprivoisés avec un Appât.</p>`;
    return `<h2>Familiers</h2><p class="dim small">Assignez un familier à un héros. L’affinité grandit en combattant ensemble et débloque des synergies : bonus passif (Lien I), technique liée (Lien II), puissance accrue (Lien III). Si l’élément du familier correspond à l’emplacement de l’arme équipée : <span class="reson">Résonance</span> (bonus ×1.5). Niveau max : <b>${G.famMaxLvl()}</b> (Ménagerie).</p>
    <div class="cards">${ids.map(fid => {
      const f = S.fams[fid], F = G.FAMS[fid], T = G.SKILLS[F.tech];
      return `<div class="card fcard"><div class="pc-head"><img class="portrait" src="${G.SPR.famURL(fid)}"><div><h3>${F.n} <small>${F.sp}</small></h3><div>${elemTag(F.e)} Niv. <b>${f.lvl}</b>/${G.famMaxLvl()}</div>${bar(f.exp, G.famExpNext(f.lvl), 'exp')}</div></div>
        <div class="small">🤝 Assistance : ${F.ad}</div><div class="small">◆ Synergie : ${F.bd}</div><div class="small">✦ Technique liée : <b>${T.n}</b> — ${T.d}</div>
        <div class="aff">${G.CHAR_ORDER.filter(c => S.party.includes(c)).map(c => { const a = f.aff[c] || 0, L = G.linkLevel(fid, c); return `<div class="affrow"><span>${G.CHARS[c].n}</span>${bar(a, 100, 'aff')}<small>${a}/100 · Lien ${['—', 'I', 'II', 'III'][L]}</small></div>`; }).join('')}</div>
        <div class="actions"><span class="small">Maître :</span>${S.party.map(c => `<button class="btn sm ${f.owner === c ? 'on' : ''}" data-a="famOwner" data-f="${fid}" data-c="${c}">${G.CHARS[c].n}</button>`).join('')}<button class="btn sm ${!f.owner ? 'on' : ''}" data-a="famOwner" data-f="${fid}" data-c="">Aucun</button></div>
        <div class="actions"><button class="btn sm" data-a="feed" data-f="${fid}" data-i="friandise" ${(S.items.friandise || 0) > 0 ? '' : 'disabled'}>🍪 Friandise (${S.items.friandise || 0})</button><button class="btn sm" data-a="feed" data-f="${fid}" data-i="festin" ${(S.items.festin || 0) > 0 ? '' : 'disabled'}>🍱 Festin (${S.items.festin || 0})</button></div>
      </div>`;
    }).join('')}</div>`;
  },
  // ----- Accomplissements -----
  tab_succes() {
    const CW = 150, RH = 96, cols = Math.max(...G.ACH.map(a => a.col)) + 1, rows = Math.max(...G.ACH.map(a => a.row)) + 1;
    const pos = a => [a.col * CW + 12, a.row * RH + 10];
    const lines = G.ACH.flatMap(a => (a.req || []).map(r => { const b = G.ACH.find(x => x.id === r), [x1, y1] = pos(b), [x2, y2] = pos(a); const on = G.S.ach[r]; return `<path d="M${x1 + 128} ${y1 + 36} C ${x1 + 145} ${y1 + 36}, ${x2 - 17} ${y2 + 36}, ${x2} ${y2 + 36}" class="${on ? 'on' : ''}"/>`; })).join('');
    const sel = this.achSel && G.ACH.find(a => a.id === this.achSel);
    const nodes = G.ACH.map(a => {
      const s = G.achState(a), [x, y] = pos(a), [cur, tgt] = a.c(G.S);
      return `<button class="anode ${s} ${this.achSel === a.id ? 'sel' : ''}" style="left:${x}px;top:${y}px" data-a="achSel" data-i="${a.id}">
        <b>${s === 'locked' ? '🔒 ' : s === 'claimed' ? '✔ ' : s === 'ready' ? '✦ ' : ''}${esc(a.n)}</b><small>${s === 'claimed' ? 'Obtenu' : `${Math.min(cur, tgt)}/${tgt}`}</small>${bar(Math.min(cur, tgt), tgt, 'aff')}</button>`;
    }).join('');
    let detail = '<p class="dim">Touchez un nœud pour voir sa récompense. Les nœuds se débloquent en réclamant leurs prérequis.</p>';
    if (sel) {
      const s = G.achState(sel), [cur, tgt] = sel.c(G.S);
      detail = `<h3>${esc(sel.n)}</h3><div>${esc(sel.d)} <b>(${Math.min(cur, tgt)}/${tgt})</b></div><div class="rw">Récompense : ${G.rewardText(sel.rw).map(esc).join(' · ')}</div>
        ${s === 'ready' ? '<button class="btn gold" data-a="claim" data-i="' + sel.id + '">✦ Réclamer</button>' : s === 'locked' ? `<div class="dim">Prérequis : ${(sel.req || []).map(r => G.ACH.find(x => x.id === r).n).join(', ')}</div>` : s === 'claimed' ? '<div class="dim">Récompense obtenue.</div>' : ''}`;
    }
    return `<h2>Arbre des accomplissements</h2><p class="dim small">Accomplissez des exploits pour obtenir équipements uniques, familiers et matériaux rares.</p>
      <div class="atree-wrap"><div class="atree" style="width:${cols * CW + 20}px;height:${rows * RH + 10}px"><svg width="${cols * CW + 20}" height="${rows * RH + 10}">${lines}</svg>${nodes}</div></div>
      <div class="card adetail">${detail}</div>`;
  },
  // ----- Tableau de chasse -----
  tab_chasses() { return this.huntsHTML(); },
  huntsHTML() {
    const S = G.S, ri = G.hunterRankIdx(), R = G.HUNT_RANKS[ri], next = G.HUNT_RANKS[ri + 1];
    const plv = Math.round(S.party.reduce((a, c) => a + S.chars[c].lvl, 0) / S.party.length);
    const card = (h, eid, rw, pts, unlocked) => {
      const E = G.ENEMIES[eid], st = S.hunts[h.id];
      const rewards = G.rewardText(rw).map(t => `<span class="pill ${/🛡️|🐾/.test(t) ? 'excl' : ''}">${esc(t)}</span>`).join(' ');
      let act;
      if (!unlocked) act = `<div class="small no">🔒 Rang ${h.rank} requis</div>`;
      else if (st === 'done') act = `<button class="btn gold" data-a="claimHunt" data-i="${h.id}">✦ Toucher la prime</button>`;
      else if (st === 'active') act = `<div class="small ok">☠ Cible marquée sur la carte — ${esc(G.ZONES[h.zone].n)}</div>`;
      else if (st === 'claimed') act = '<div class="small ok">✔ Chasse accomplie</div>';
      else act = `<button class="btn" data-a="acceptHunt" data-i="${h.id}">Accepter le contrat</button>`;
      const low = unlocked && st !== 'claimed' && plv < E.lvl - 2;
      return `<div class="card hcard ${unlocked ? '' : 'locked'} ${st || ''}" data-rank="${h.rank}">
        <div class="pc-head"><img class="portrait" src="${G.SPR.enemyURL(eid)}"><div><div class="hrank">Rang ${h.rank}</div><h3>${esc(h.n)}</h3>
        <div class="small">${esc(E.n)} · <b class="${low ? 'no' : ''}">niv. ${E.lvl}</b> · ${esc(G.ZONES[h.zone].n)}</div></div></div>
        <div class="small dim">${esc(h.d)}</div>
        <div class="small">Prime : ${rewards} <span class="pill">🎯 +${pts} pts</span></div>
        <div class="actions">${act}</div></div>`;
    };
    const ranks = G.HUNT_RANKS.map((X, i) => `<div class="hr ${i <= ri ? 'on' : ''}"><b>${X.r}</b><span>${X.pts} pts</span><small>${esc(X.b)}</small></div>`).join('');
    const groups = ['D', 'C', 'B', 'A', 'S'].map(r => {
      const list = G.HUNTS.filter(h => h.rank === r).map(h => card(h, h.t, h.rw, h.pts, G.huntUnlocked(h))).join('');
      return `<h3>Contrats de rang ${r}</h3><div class="cards">${list}</div>`;
    }).join('');
    const n = S.hunter.inf, infId = G.makeInfinite(n);
    const inf = card(G.HUNT_INF, infId, G.infReward(n), 3, ri >= 4);
    return `<h2>Tableau de chasse</h2>
      <div class="card hunter"><div class="hbig">${R.r}</div><div style="flex:1;min-width:0"><b>Rang de chasseur ${R.r}</b> · ${S.hunter.pts} points de chasse${next ? ` — prochain rang ${next.r} à ${next.pts} pts` : ' — rang maximal'}
        ${next ? bar(S.hunter.pts - R.pts, next.pts - R.pts, 'exp') : ''}<div class="dim small">Les primes contiennent des équipements, un familier et des matériaux introuvables ailleurs. L’Âme primordiale (rangs A et S) éveille une arme au rang 6.</div></div></div>
      <div class="hranks">${ranks}</div>${groups}
      <h3>Traque infinie <small class="dim">(répétable, +3 niveaux à chaque victoire — ${n} vague(s) vaincue(s))</small></h3><div class="cards">${inf}</div>`;
  },
  hunts() {
    const el = U.el(`<div class="modal menu-wrap"><div class="menu win single"><div class="mbody"></div><button class="btn close" data-a="close">✕</button></div></div>`);
    const entry = this.push(el);
    const render = () => {
      const b = el.querySelector('.mbody'), st = b.scrollTop;
      b.innerHTML = this.huntsHTML(); b.scrollTop = st;
      this.bind(el, Object.assign(this.menuHandlers(render), { close: () => { this.pop(entry); G.save(); } }));
    };
    render();
  },
  // ----- Havre -----
  tab_havre() { return this.havreHTML(); },
  havreHTML(focus) {
    const S = G.S, T = S.town;
    if (!T.founded) return `<h2>Le Havre</h2><p class="dim">Le Havre n’est pas encore fondé. Rendez-vous sur le site du Havre, au sud-est de Bourg-Aube.</p>`;
    const store = Object.keys(T.store);
    const cards = G.BUILD_ORDER.map(bid => {
      const B = G.BUILDINGS[bid], lvl = T.b[bid] || 0, r = G.buildReq(bid), N = B.npc ? G.NPCS[B.npc] : null;
      return `<div class="card bcard ${focus === bid ? 'focus' : ''} ${lvl ? 'built' : ''}"><h3>${B.i} ${B.n} <small>Niv. ${lvl}/${B.max}</small></h3>
        <div class="small">${B.d}</div>
        ${lvl ? `<div class="small ok">Actuel : ${B.eff(lvl)}</div>` : ''}
        ${lvl < B.max ? `<div class="small">Niveau ${lvl + 1} : ${B.eff(lvl + 1)}</div>` : ''}
        <div class="small">${N ? `Responsable : <b>${N.n}</b> (${N.job}) ${S.npcs[B.npc] ? '✔' : '<span class="no">— à recruter</span>'}` : `Requiert ${B.req} bâtiments`}</div>
        ${lvl < B.max ? `<div class="cost-line">${G.costHTML(B.cost[lvl])}</div><button class="btn gold" data-a="build" data-b="${bid}" ${r.ok ? '' : 'disabled'}>${lvl ? '⬆️ Améliorer' : '🏗️ Construire'}</button>${r.ok ? '' : `<div class="small no">${esc(r.why)}</div>`}` : '<div class="dim">Niveau maximal ✦</div>'}
      </div>`;
    }).join('');
    const recruits = Object.keys(G.NPCS).map(id => `<span class="pill ${S.npcs[id] ? 'ok' : ''}">${S.npcs[id] ? '✔' : '✗'} ${G.NPCS[id].n} (${G.NPCS[id].job})</span>`).join(' ');
    return `<h2>Le Havre <small>Prestige ${G.prestige()}</small></h2>
      <div class="card"><h3>Entrepôt</h3><div>${store.length ? store.map(k => k === '_gold' ? `💰 ${T.store[k]}` : `${G.iconOf(k)} ${G.nameOf(k)} ×${T.store[k]}`).join(' · ') : '<span class="dim">Vide — les bâtiments produisent après chaque combat gagné.</span>'}</div>
      <button class="btn" data-a="collect" ${store.length ? '' : 'disabled'}>Récupérer</button></div>
      <div class="card"><h3>Habitants</h3><div>${recruits}</div><div class="dim small">Trouvez-les dans le monde et remplissez leur requête pour qu’ils rejoignent le Havre.</div></div>
      <div class="cards">${cards}</div>`;
  },
  havre(focus) {
    const el = U.el(`<div class="modal menu-wrap"><div class="menu win single"><div class="mbody"></div><button class="btn close" data-a="close">✕</button></div></div>`);
    const entry = this.push(el);
    const render = () => {
      const b = el.querySelector('.mbody'), st = b.scrollTop;
      b.innerHTML = this.havreHTML(focus); b.scrollTop = st;
      this.bind(el, Object.assign(this.menuHandlers(render), { close: () => { this.pop(entry); G.save(); } }));
      if (focus) { const f = el.querySelector('.bcard.focus'); if (f) f.scrollIntoView({ block: 'center' }); focus = null; }
    };
    render();
  },
  // ----- Quêtes -----
  tab_quetes() {
    const S = G.S;
    const row = (id, q) => { const [c, t] = q.cond(S), done = S.quests[id] === 'done' || c >= t && q.type === 'main'; return `<div class="cell quest ${done ? 'done' : ''}"><div><b>${done ? '✔' : '◇'} ${esc(q.n)}</b><div class="dim small">${esc(q.d)}</div></div><small>${Math.min(c, t)}/${t}</small></div>`; };
    const main = Object.keys(G.QUESTS).filter(k => G.QUESTS[k].type === 'main').map(k => row(k, G.QUESTS[k])).join('');
    const rec = Object.keys(G.QUESTS).filter(k => G.QUESTS[k].type === 'recruit' && S.quests[k]).map(k => row(k, G.QUESTS[k])).join('');
    return `<h2>Journal de quêtes</h2><h3>Histoire principale</h3><div class="grid one">${main}</div><h3>Recrutements</h3><div class="grid one">${rec || '<p class="dim">Parlez aux habitants marqués d’un « ! » pour obtenir des quêtes de recrutement.</p>'}</div>`;
  },
  // ----- Carte -----
  tab_carte() {
    const tr = G.World.TRAVEL.map(([id, n]) => `<button class="btn sm" data-a="travel" data-i="${id}" ${G.World.canTravel(id) ? '' : 'disabled'}>${G.World.canTravel(id) ? '🧭' : '🔒'} ${esc(n)}</button>`).join('');
    return `<h2>Carte du monde</h2><div class="card"><h3>Voyage rapide</h3><div class="actions">${tr}</div><div class="dim small">Les lieux se débloquent en les visitant.</div></div><div class="mapwrap"><canvas class="worldmap"></canvas></div><p class="dim small">● Vous · ★ Gardien · ☠ Cible de chasse · 🎯 Tableau de chasse · ! PNJ à recruter · ▣ Coffre · ◆ Havre</p>`;
  },
  drawMap(cv) {
    const W = G.World, s = 5;
    cv.width = W.W * s; cv.height = W.H * s;
    const x = cv.getContext('2d');
    const zc = { plaines: '#9ad070', foret: '#2e7a3a', montagne: '#9aa0b0', marais: '#7a5aa8', volcan: '#e8501a', bourg: '#ffd86a', havre: '#7affd8' };
    const col = { '.': '#5aa03c', ',': '#62a844', '_': '#c8a86a', 'f': '#3d7a32', 'T': '#2a5a26', 'r': '#8f877a', '^': '#5e584e', 'm': '#4f5a38', 'w': '#3a5e54', 'v': '#3d2c2a', 'l': '#e8501a', '~': '#2f6fc0', '=': '#8a5a32', 's': '#e6d39a', 'p': '#a39b8e', 'g': '#7cc256' };
    for (let y = 0; y < W.H; y++) for (let xx = 0; xx < W.W; xx++) { x.fillStyle = col[W.t[y][xx]] || '#000'; x.fillRect(xx * s, y * s, s, s); }
    // teinte et frontières des régions
    for (let y = 0; y < W.H; y++) for (let xx = 0; xx < W.W; xx++) {
      const z = W.z[y][xx];
      x.fillStyle = U.rgba(zc[z], 0.22); x.fillRect(xx * s, y * s, s, s);
      x.fillStyle = 'rgba(255,255,255,0.85)';
      if (xx + 1 < W.W && W.z[y][xx + 1] !== z) x.fillRect((xx + 1) * s - 1, y * s, 2, s);
      if (y + 1 < W.H && W.z[y + 1][xx] !== z) x.fillRect(xx * s, (y + 1) * s - 1, s, 2);
    }
    x.font = `bold ${s * 1.6}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    W.E.forEach(e => {
      if (!W.visible(e)) return;
      const cx = e.x * s + s / 2, cy = e.y * s + s / 2;
      if (e.k === 'boss') { x.fillStyle = '#ff4a6a'; x.fillText('★', cx, cy); }
      else if (e.k === 'npc' && e.npc && !G.S.npcs[e.npc]) { x.fillStyle = '#ffe060'; x.fillText('!', cx, cy); }
      else if (e.k === 'chest' && !G.S.chests[e.id]) { x.fillStyle = '#ffd040'; x.fillRect(cx - 2, cy - 2, 4, 4); }
      else if (e.k === 'house') { x.fillStyle = '#c84a3a'; x.fillRect(e.x * s, e.y * s, e.w * s, e.h * s); }
      else if (e.k === 'stone') { x.fillStyle = '#7affd8'; x.fillText('◆', cx, cy); }
      else if (e.k === 'hunt') { x.fillStyle = '#ff3a4a'; x.fillText('☠', cx, cy); }
      else if (e.k === 'board') { x.fillStyle = '#ffd86a'; x.fillText('🎯', cx, cy); }
      else if (e.k === 'barrier') { x.fillStyle = '#ff8a2a'; x.fillText('▲', cx, cy); }
    });
    x.fillStyle = '#fff'; x.beginPath(); x.arc(W.P.x * s + s / 2, W.P.y * s + s / 2, s * 0.8, 0, 7); x.fill();
    x.strokeStyle = '#000'; x.lineWidth = 1.5; x.stroke();
    x.fillStyle = 'rgba(255,255,255,0.9)'; x.font = `bold ${s * 1.4}px sans-serif`;
    [['Forêt de Sylve', 13, 38], ['Monts Grisés', 30, 10], ['Plaines d’Aube', 46, 28], ['Marais Brumeux', 76, 30], ['Volcan', 77, 13], ['Bourg-Aube', 41, 36], ['Havre', 72, 47]].forEach(([n, a, b]) => { x.strokeStyle = 'rgba(0,0,0,0.7)'; x.lineWidth = 3; x.strokeText(n, a * s, b * s); x.fillText(n, a * s, b * s); });
  },
  // ----- Système -----
  tab_systeme() {
    const t = Math.floor(G.S.playTime / 60);
    return `<h2>Système</h2><div class="card"><div>Temps de jeu : ${Math.floor(t / 60)} h ${t % 60} min · Combats gagnés : ${G.S.stats.wins} · Monstres vaincus : ${G.S.stats.kills}</div>
      <div class="actions"><button class="btn gold" data-a="save">💾 Sauvegarder</button><button class="btn" data-a="sound">${G.Audio.on ? '🔊 Son activé' : '🔇 Son coupé'}</button><button class="btn" data-a="title">↩ Écran titre</button></div></div>
      <div class="card"><h3>Commandes</h3><ul class="help">
      <li><b>Déplacement</b> : flèches / ZQSD / WASD ou croix tactile</li><li><b>Action (A)</b> : Entrée, Espace ou E — parler, ouvrir, <b>récolter</b> une ressource en lui faisant face</li>
      <li><b>Menu (B)</b> : Échap, M ou bouton ☰</li><li>Dans les menus : flèches + Entrée, Échap pour revenir</li></ul></div>
      <div class="card"><h3>Conseils</h3><ul class="help">
      <li>Pas de marchand d’armes : forgez vos 4 armes par héros avec les matériaux des monstres (onglet Armes).</li>
      <li>Les éléments forment un cycle : 💧 Eau › 🔥 Feu › 🌪️ Vent › 🪨 Terre › 💧 Eau. Une faiblesse inflige ×1,5.</li>
      <li>En combat, changer d’arme coûte un demi-tour : adaptez votre style à l’ennemi !</li>
      <li>Le Havre produit des ressources après chaque victoire. Pensez à les récupérer à la pierre de fondation.</li>
      <li>Recrutez les habitants marqués d’un « ! » pour débloquer les bâtiments.</li></ul></div>`;
  },
  // ----- Actions des menus -----
  menuHandlers(rerender) {
    const R = rerender || (() => this.renderMenu());
    const S = G.S;
    return {
      goarmes: d => { this.menuChar = d.c; this.menuTab = 'armes'; this.renderMenu(); },
      lead: d => { S.party = [d.c].concat(S.party.filter(c => c !== d.c)); G.World.placePlayer(G.World.P.x, G.World.P.y, G.World.P.dir); R(); },
      equipList: d => this.equipList(d.c, d.s, R),
      forge: d => {
        const W = G.WEAPONS[G.CHARS[d.c].weapons[d.s]];
        if (!G.canPay(W.recipe)) return;
        G.pay(W.recipe); S.chars[d.c].weapons[d.s] = { tier: 1 }; S.stats.wcraft++; S.stats.crafted++;
        G.Audio.sfx('craft'); this.toast(`⚒️ ${W.n} forgée !`); this.checkAch(); R();
      },
      upgrade: d => {
        const c = S.chars[d.c], W = G.WEAPONS[G.CHARS[d.c].weapons[d.s]], w = c.weapons[d.s], cost = G.upgradeCost(W, w.tier);
        if (w.tier >= G.maxWeaponTier() || !G.canPay(cost)) return;
        G.pay(cost); w.tier++; G.Audio.sfx('craft'); this.toast(`⬆️ ${W.n} : rang ${w.tier} !`); this.checkAch(); R();
      },
      equipW: d => { const c = S.chars[d.c]; const r = G.curHP(d.c) / G.calc(d.c).hp; c.wslot = d.s; c.hp = Math.max(1, Math.round(r * G.calc(d.c).hp)); G.Audio.sfx('ok'); R(); },
      craftA: d => { const A = G.ARMORS[d.i]; if (!G.canPay(A.r) || A.tier > G.maxArmorTier()) return; G.pay(A.r); S.armors[d.i] = (S.armors[d.i] || 0) + 1; S.stats.crafted++; G.Audio.sfx('craft'); this.toast(`🛡️ ${A.n} fabriqué(e) ! (${G.S.armors[d.i]} possédé(s))`); this.checkAch(); R(); },
      craftT: d => { const T = G.TOOLS[d.i]; if (!G.canPay(T.r)) return; G.pay(T.r); S.tools[T.type] = Math.max(S.tools[T.type], T.tier); S.stats.crafted++; G.Audio.sfx('craft'); this.toast(`${T.i} ${T.n} fabriquée !`); this.checkAch(); R(); },
      refine: d => { const Rc = G.REFINE[d.i], n = +(d.n || 1); let made = 0; for (let i = 0; i < n; i++) { if (!G.canPay({ m: Rc.m })) break; G.pay({ m: Rc.m }); G.give(Rc.out, Rc.q); made += Rc.q; } if (made) { G.Audio.sfx('craft'); this.toast('Fabriqué : ' + G.gotText(Rc.out, made)); } R(); },
      useItem: d => {
        const I = G.ITEMS[d.i];
        if (I.tgt !== 'allies') return this.useItemField(d.i, R);
        if (!(S.items[d.i] > 0)) return;
        G.healAll(); G.give(d.i, -1); G.Audio.sfx('heal'); this.toast(`${I.i} ${I.n} : équipe entièrement restaurée.`); R();
      },
      acceptHunt: d => { S.hunts[d.i] = 'active'; if (d.i === 'inf') G.makeInfinite(S.hunter.inf); G.World.refresh(); G.Audio.sfx('ok'); this.toast('Contrat accepté : la cible est marquée ☠ sur la carte.'); R(); },
      claimHunt: d => {
        const before = G.hunterRankIdx(), rw = G.claimHunt(d.i);
        if (!rw) return;
        G.Audio.sfx('achieve');
        this.toast(`🎯 Prime : ${G.rewardGotText(rw).join(', ')}`);
        if (G.hunterRankIdx() > before) setTimeout(() => this.toast(`🏅 Rang de chasseur ${G.hunterRank().r} atteint ! ${G.hunterRank().b}`), 600);
        G.World.refresh(); this.checkAch(); R();
      },
      famOwner: d => { const f = S.fams[d.f]; if (d.c) Object.keys(S.fams).forEach(k => { if (S.fams[k].owner === d.c) S.fams[k].owner = null; }); f.owner = d.c || null; G.Audio.sfx('ok'); R(); },
      feed: d => {
        const f = S.fams[d.f], I = G.ITEMS[d.i];
        if (!(S.items[d.i] > 0)) return;
        if (f.lvl >= G.famMaxLvl() && !I.fam.aff) { this.toast('Niveau maximal atteint (améliorez la Ménagerie).'); return; }
        G.give(d.i, -1);
        const up = G.famGainExp(d.f, I.fam.exp);
        if (I.fam.aff && f.owner) G.addAffinity(d.f, f.owner, I.fam.aff);
        G.Audio.sfx(up ? 'level' : 'get'); if (up) this.toast(`${G.FAMS[d.f].n} passe au niveau ${f.lvl} !`); this.checkAch(); R();
      },
      travel: d => { this.closeMenu(); G.World.travel(d.i); },
      achSel: d => { this.achSel = d.i; R(); },
      claim: d => { if (G.claimAch(d.i)) { G.Audio.sfx('achieve'); const a = G.ACH.find(x => x.id === d.i); this.toast(`✦ ${a.n} : ${G.rewardGotText(a.rw).join(', ')}`); this.lastReady = G.achReadyCount(); G.World.refresh(); R(); } },
      build: d => {
        const r = G.buildReq(d.b); if (!r.ok) return;
        G.pay(r.cost); S.town.b[d.b] = (S.town.b[d.b] || 0) + 1;
        G.Audio.sfx('craft'); this.toast(`🏗️ ${G.BUILDINGS[d.b].n} niveau ${S.town.b[d.b]} !`);
        G.World.refresh(); this.checkAch(); R();
      },
      collect: () => { const got = G.collectTown(); if (got.length) { G.Audio.sfx('get'); this.toast('Récupéré : ' + got.join(', ')); } R(); },
      save: () => { this.toast(G.save() ? '💾 Partie sauvegardée.' : 'Échec de la sauvegarde.'); },
      sound: () => { G.Audio.toggle(); R(); },
      title: async () => { const r = await this.ask('Retourner à l’écran titre ? (la partie sera sauvegardée)', ['Oui', 'Non']); if (r === 0) { G.save(); this.closeMenu(); G.showTitle(); } },
    };
  },
  equipList(cid, slot, R) {
    const c = G.S.chars[cid], cur = c[slot];
    const list = Object.keys(G.S.armors).filter(k => G.ARMORS[k].slot === slot && (G.armorFree(k) > 0 || cur === k));
    const el = U.el(`<div class="modal dialog-wrap"><div class="dialog win list"><h3>${slot === 'armor' ? 'Armure' : 'Accessoire'} de ${G.CHARS[cid].n}</h3>
      ${list.map(k => { const A = G.ARMORS[k]; return `<button class="btn row ${cur === k ? 'on' : ''}" data-a="eq" data-i="${k}"><b>${esc(A.n)}</b><small>${Object.keys(A.st).map(s => `${G.STATN[s]} +${A.st[s]}`).join(', ')} ${esc(A.d)}</small></button>`; }).join('') || '<p class="dim">Rien de disponible. Fabriquez-en dans l’Artisanat !</p>'}
      <button class="btn row" data-a="eq" data-i="">— Retirer —</button><button class="btn" data-a="back">Retour</button></div></div>`);
    let entry;
    this.bind(el, { eq: d => { c[slot] = d.i || null; G.curHP(cid); G.curMP(cid); this.pop(entry); G.Audio.sfx('ok'); R(); }, back: () => this.pop(entry) });
    entry = this.push(el);
  },
  useItemField(id, R) {
    const I = G.ITEMS[id];
    const el = U.el(`<div class="modal dialog-wrap"><div class="dialog win list"><h3>${I.i} ${I.n} — sur qui ?</h3>
      ${G.S.party.map(c => { const m = G.calc(c); return `<button class="btn row" data-a="on" data-c="${c}"><b>${G.CHARS[c].n}</b><small>PV ${G.curHP(c)}/${m.hp} · PM ${G.curMP(c)}/${m.mp}</small></button>`; }).join('')}
      <button class="btn" data-a="back">Retour</button></div></div>`);
    let entry;
    this.bind(el, {
      on: d => {
        const c = G.S.chars[d.c], m = G.calc(d.c), E = I.eff;
        if (!(G.S.items[id] > 0)) return;
        if (E.heal) c.hp = Math.min(m.hp, G.curHP(d.c) + E.heal);
        if (E.mp) c.mp = Math.min(m.mp, G.curMP(d.c) + E.mp);
        G.give(id, -1); G.Audio.sfx('heal'); this.pop(entry); R();
      }, back: () => this.pop(entry),
    });
    entry = this.push(el);
  },
  // ---------------- Boutiques & auberges ----------------
  shop(def) {
    const S = G.S, disc = def.disc || 1;
    let mode = 'buy';
    const el = U.el(`<div class="modal menu-wrap"><div class="menu win single shop"><div class="mbody"></div><button class="btn close" data-a="close">✕</button></div></div>`);
    const entry = this.push(el);
    const price = id => Math.ceil((G.MATS[id] || G.ITEMS[id]).p * disc);
    const render = () => {
      const b = el.querySelector('.mbody'), st = b.scrollTop;
      let rows = '';
      if (mode === 'buy') {
        rows = (def.items || []).concat(def.mats || []).map(id => { const p = price(id); return `<div class="cell"><span class="ic">${G.iconOf(id)}</span><div><b>${G.nameOf(id)}</b> <small class="dim">(possédé ${G.countOf(id)})</small><div class="dim small">${(G.ITEMS[id] || G.MATS[id]).d}</div></div><b class="price">${p} or</b><button class="btn sm" data-a="buy" data-i="${id}" data-n="1" ${S.gold >= p ? '' : 'disabled'}>+1</button><button class="btn sm" data-a="buy" data-i="${id}" data-n="5" ${S.gold >= p * 5 ? '' : 'disabled'}>+5</button></div>`; }).join('');
      } else {
        const own = Object.keys(S.items).filter(k => S.items[k] > 0 && G.ITEMS[k].p > 0).concat(Object.keys(S.mats).filter(k => S.mats[k] > 0 && G.MATS[k].p > 0));
        rows = own.map(id => { const p = Math.floor((G.MATS[id] || G.ITEMS[id]).p / 2); return `<div class="cell"><span class="ic">${G.iconOf(id)}</span><div><b>${G.nameOf(id)}</b> ×${G.countOf(id)}</div><b class="price">${p} or</b><button class="btn sm" data-a="sell" data-i="${id}" data-n="1">-1</button><button class="btn sm" data-a="sell" data-i="${id}" data-n="all">Tout</button></div>`; }).join('') || '<p class="dim">Rien à vendre.</p>';
      }
      b.innerHTML = `<h2>${esc(def.n)} <small>💰 ${U.fmt(S.gold)}</small></h2><p class="dim small">Ici on ne vend ni armes ni armures — seulement des objets et des matériaux.${disc < 1 ? ` Remise : ${Math.round((1 - disc) * 100)}%` : ''}</p>
        <div class="chartabs"><button class="ctab ${mode === 'buy' ? 'on' : ''}" data-a="mode" data-m="buy">Acheter</button><button class="ctab ${mode === 'sell' ? 'on' : ''}" data-a="mode" data-m="sell">Vendre</button></div><div class="grid one">${rows}</div>`;
      b.scrollTop = st;
      this.bind(el, {
        close: () => { this.pop(entry); G.save(); },
        mode: d => { mode = d.m; render(); },
        buy: d => { const n = +d.n, p = price(d.i) * n; if (S.gold < p) return; S.gold -= p; G.give(d.i, n); G.Audio.sfx('get'); this.toast('Acheté : ' + G.gotText(d.i, n)); render(); },
        sell: d => { const n = d.n === 'all' ? G.countOf(d.i) : 1, p = Math.floor((G.MATS[d.i] || G.ITEMS[d.i]).p / 2) * n; G.give(d.i, -n); S.gold += p; S.stats.goldEarned += p; G.Audio.sfx('get'); this.checkAch(); render(); },
      });
    };
    render();
  },
  async inn(kind) {
    const cost = kind === 'havre' ? 0 : 20;
    const r = await this.ask(kind === 'havre' ? 'Taverne du Havre : se reposer gratuitement ?' : `Auberge : se reposer pour ${cost} or ? (restaure PV/PM et sauvegarde)`, ['Se reposer', 'Non merci']);
    if (r !== 0) return;
    if (G.S.gold < cost) { this.toast('Pas assez d’or.'); return; }
    G.S.gold -= cost;
    G.healAll();
    const P = G.World.P; G.S.rest = { x: P.x, y: P.y };
    G.scene = 'trans';
    G.R.transition('fadeout', 0.5, () => { G.S.time = 7 * 60; G.R.transition('fadein', 0.6, () => { G.scene = 'world'; }); });
    G.Audio.sfx('heal'); G.save();
    this.toast('Vous êtes reposés. Partie sauvegardée.');
  },
  // ---------------- Interface de combat ----------------
  battleOpen(B) {
    this.B = B;
    this.bui.innerHTML = `<div class="b-top"><div class="timeline"></div></div><div class="b-banner"></div><div class="b-log"></div><div class="b-bottom"><div class="b-party win"></div><div class="b-cmd win"></div></div>`;
    this.bui.classList.add('show');
    this.battleRefresh();
  },
  battleClose() { this.bui.classList.remove('show'); this.bui.innerHTML = ''; this.B = null; },
  battleLog(t) { const l = this.bui.querySelector('.b-log'); if (l) { l.textContent = t; l.classList.remove('pop'); void l.offsetWidth; l.classList.add('pop'); } },
  battleBanner(t, side, big) {
    const b = this.bui.querySelector('.b-banner'); if (!b) return;
    b.textContent = t; b.className = 'b-banner show ' + (side === 'e' ? 'foe' : '') + (big ? ' big' : '');
    clearTimeout(this._bt); this._bt = setTimeout(() => { b.className = 'b-banner'; }, big ? 1600 : 1100);
  },
  battleRefresh() {
    const B = this.B; if (!B) return;
    const tl = this.bui.querySelector('.timeline');
    if (tl) tl.innerHTML = '<span class="tl-l">Ordre</span>' + B.preview(8).map((u, i) => `<img class="${u.side} ${i === 0 && B.active === u ? 'now' : ''}" src="${u.side === 'p' ? G.SPR.charURL(u.cid) : G.SPR.enemyURL(u.eid)}" title="${esc(u.name)}">`).join('');
    const p = this.bui.querySelector('.b-party');
    if (p) p.innerHTML = B.units.filter(u => u.side === 'p').map(u => `<div class="bp ${B.active === u ? 'act' : ''} ${u.alive ? '' : 'ko'}">
      <div class="bp-n"><b>${u.name}</b> <span class="bp-w" style="color:${G.ELEM[G.S.chars[u.cid].wslot].c}">${G.ELEM[G.S.chars[u.cid].wslot].i}</span> <span class="sts">${Object.keys(u.st).map(k => G.STATUS[k] ? G.STATUS[k].i : '').join('')}${u.combo ? ` <i class="combo">×${u.combo}</i>` : ''}</span></div>
      <div class="bp-b"><span>PV <b>${Math.max(0, Math.ceil(u.hp))}</b>/${u.calc.hp}</span>${bar(u.hp, u.calc.hp, 'hp')}</div>
      <div class="bp-b"><span>PM <b>${u.mp}</b>/${u.calc.mp}</span>${bar(u.mp, u.calc.mp, 'mp')}</div>
      ${u.calc.fam && u.calc.link >= 2 ? `<div class="bp-b en"><span>${G.FAMS[u.calc.fam.id].n}</span>${bar(u.energy, 100, 'en' + (u.energy >= 100 ? ' full' : ''))}</div>` : ''}
    </div>`).join('');
  },
  battleCommand(u) {
    return new Promise(res => {
      const B = this.B, cmd = this.bui.querySelector('.b-cmd');
      const done = a => { B.cursor = null; cmd.innerHTML = ''; res(a); };
      const main = () => {
        B.cursor = null;
        const fam = u.calc.fam, techOk = fam && u.calc.link >= 2 && u.energy >= 100;
        const others = G.ELEM_ORDER.filter(s => s !== G.S.chars[u.cid].wslot && G.S.chars[u.cid].weapons[s]);
        cmd.innerHTML = `<div class="cmd-h">${u.name} — ${u.calc.w.n}</div><div class="cmds">
          <button class="btn" data-a="attack" data-focus>⚔️ Attaque</button>
          <button class="btn" data-a="skills" ${u.calc.skills.length ? '' : 'disabled'}>✦ Compétences</button>
          <button class="btn" data-a="items">🎒 Objets</button>
          <button class="btn" data-a="swap" ${others.length ? '' : 'disabled'}>🔄 Arme</button>
          ${fam && u.calc.link >= 2 ? `<button class="btn ${techOk ? 'gold glow' : ''}" data-a="tech" ${techOk ? '' : 'disabled'}>🐾 ${G.SKILLS[G.FAMS[fam.id].tech].n}</button>` : ''}
          <button class="btn" data-a="defend">🛡️ Défense</button>
          <button class="btn" data-a="flee" ${B.opts.boss ? 'disabled' : ''}>🏃 Fuite</button></div>`;
        this.bind(cmd, {
          attack: () => pickTarget('enemy', t => done({ type: 'attack', target: t }), main),
          skills: () => skills(),
          items: () => items(),
          swap: () => swap(others),
          tech: () => { const T = G.SKILLS[G.FAMS[fam.id].tech]; if (T.t === 'enemy') pickTarget('enemy', t => done({ type: 'tech', target: t }), main); else done({ type: 'tech' }); },
          defend: () => done({ type: 'defend' }),
          flee: () => done({ type: 'flee' }),
        });
        this.focusFirst(cmd);
      };
      const skills = () => {
        cmd.innerHTML = `<div class="cmd-h">Compétences — ${u.name} (PM ${u.mp})</div><div class="cmds list">${u.calc.skills.map(id => { const S = G.SKILLS[id], c = B.mpCost(u, S); const dead = S.t === 'dead' && !B.units.some(x => x.side === 'p' && !x.alive); return `<button class="btn row" data-a="sk" data-i="${id}" ${u.mp >= c && !dead ? '' : 'disabled'}><b>${S.n}</b><small>${c} PM · ${S.d}</small></button>`; }).join('')}</div><button class="btn back" data-a="back">↩ Retour</button>`;
        this.bind(cmd, {
          back: main,
          sk: d => { const S = G.SKILLS[d.i]; const go = t => done({ type: 'skill', id: d.i, target: t }); if (['enemy', 'ally', 'dead'].includes(S.t)) pickTarget(S.t, go, skills); else go(null); },
        });
        this.focusFirst(cmd);
      };
      const items = () => {
        const list = Object.keys(G.S.items).filter(k => G.S.items[k] > 0 && G.ITEMS[k].eff);
        cmd.innerHTML = `<div class="cmd-h">Objets</div><div class="cmds list">${list.map(id => { const I = G.ITEMS[id]; return `<button class="btn row" data-a="it" data-i="${id}"><b>${I.i} ${I.n} ×${G.S.items[id]}</b><small>${I.d}</small></button>`; }).join('') || '<p class="dim">Aucun objet utilisable.</p>'}</div><button class="btn back" data-a="back">↩ Retour</button>`;
        this.bind(cmd, {
          back: main,
          it: d => { const I = G.ITEMS[d.i]; const go = t => done({ type: 'item', id: d.i, target: t }); if (I.tgt === 'enemies' || I.tgt === 'allies') go(null); else pickTarget(I.tgt === 'dead' ? 'dead' : 'ally', go, items); },
        });
        this.focusFirst(cmd);
      };
      const swap = others => {
        cmd.innerHTML = `<div class="cmd-h">Changer d’arme (½ tour)</div><div class="cmds list">${others.map(s => { const W = G.WEAPONS[G.CHARS[u.cid].weapons[s]]; return `<button class="btn row" data-a="sw" data-s="${s}"><b>${G.ELEM[s].i} ${W.n}</b><small>${W.kn} · ${W.trait.n} : ${W.trait.d}</small></button>`; }).join('')}</div><button class="btn back" data-a="back">↩ Retour</button>`;
        this.bind(cmd, { back: main, sw: d => done({ type: 'swap', slot: d.s }) });
        this.focusFirst(cmd);
      };
      const pickTarget = (kind, cb, backFn) => {
        let list;
        if (kind === 'enemy') list = B.targetable('e');
        else if (kind === 'ally') list = B.alive('p');
        else list = B.units.filter(x => x.side === 'p' && !x.alive);
        if (!list.length) { backFn(); return; }
        cmd.innerHTML = `<div class="cmd-h">Cible</div><div class="cmds list">${list.map((t, i) => {
          const weak = kind === 'enemy' && t.elem ? `<small>${G.ELEM[t.elem].i} faible : ${G.ELEM[G.weakTo(t.elem)].i}</small>` : '';
          return `<button class="btn row" data-a="t" data-i="${B.units.indexOf(t)}" ${i === 0 ? 'data-focus' : ''}><b>${esc(t.name)}</b><small>PV ${Math.ceil(t.hp)}/${B.maxHP(t)}</small>${weak}</button>`;
        }).join('')}</div><button class="btn back" data-a="back">↩ Retour</button>`;
        this.bind(cmd, { back: backFn, t: d => cb(B.units[+d.i]) });
        cmd.querySelectorAll('[data-a="t"]').forEach(b => { b.onmouseenter = b.onfocus = () => { B.cursor = B.units[+b.dataset.i]; }; });
        B.cursor = list[0];
        this.focusFirst(cmd);
      };
      main();
    });
  },
  battleResults(r) {
    return new Promise(res => {
      const drops = Object.keys(r.drops).map(k => G.gotText(k, r.drops[k])).join('<br>');
      const lv = r.lv.map(l => `<div class="lvup">⬆ <b>${G.CHARS[l.cid].n}</b> passe niveau <b>${l.lvl}</b> ! <span class="small ok">PV et PM restaurés</span>${l.learned.length ? `<div class="small">Nouveau : ${l.learned.map(esc).join(', ')}</div>` : ''}</div>`).join('');
      const fam = r.famRes.map(f => `${f.up ? `<div class="small">🐾 ${G.FAMS[f.fid].n} monte de niveau !</div>` : ''}${f.linkUp ? `<div class="lvup small">💞 ${G.FAMS[f.fid].n} & ${G.CHARS[f.cid].n} : Lien ${['', 'I', 'II', 'III'][f.linkUp]} atteint !${f.linkUp === 2 ? ' Technique liée débloquée !' : ''}</div>` : ''}`).join('');
      const el = U.el(`<div class="modal dialog-wrap results"><div class="dialog win"><h2>Victoire !</h2>
        <div class="res"><span>EXP</span><b>+${r.exp}</b></div><div class="res"><span>Or</span><b>+${r.gold} <small class="dim">(${U.fmt(G.S.gold)} or)</small></b></div>
        <div class="res"><span>Butin</span><b>${drops || '—'}</b></div>${lv}${fam}
        ${r.tamed ? `<div class="lvup">🐾 ${G.FAMS[r.tamed].n} (${G.FAMS[r.tamed].sp}) a été apprivoisé grâce à l’appât !</div>` : ''}
        <button class="btn gold" data-a="ok" data-focus>Continuer</button></div></div>`);
      if (r.lv.length) setTimeout(() => G.Audio.sfx('level'), 600);
      let entry;
      this.bind(el, { ok: () => { this.pop(entry); res(); } });
      entry = this.push(el, { onKey: e => { if (e.key === 'Enter' || e.key === ' ') { this.pop(entry); res(); return true; } } });
    });
  },
};
