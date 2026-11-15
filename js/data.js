'use strict';
// ============================================================
//  Données du jeu
// ============================================================

// ---------------- Matériaux ----------------
G.MATS = {
  bois: { n: 'Bois', i: '🪵', p: 6, d: 'Récolté sur les arbres, même à mains nues.' },
  boisancien: { n: 'Bois ancien', i: '🌳', p: 60, d: 'Arbres anciens de Sylve. Hache en pierre requise.' },
  pierre: { n: 'Pierre', i: '🪨', p: 8, d: 'Rochers. Pioche en bois requise.' },
  minerai: { n: 'Minerai de fer', i: '⛏️', p: 20, d: 'Filons de fer. Pioche en pierre requise.' },
  lingot: { n: 'Lingot de fer', i: '🔩', p: 45, d: 'Raffiné à partir de minerai. Base de toute forge.' },
  cristal: { n: 'Cristal brut', i: '💎', p: 150, d: 'Gisements cristallins. Pioche en fer requise.' },
  mithril: { n: 'Mithril', i: '✨', p: 400, d: 'Métal légendaire du volcan. Pioche en fer requise.' },
  herbe: { n: 'Herbe médicinale', i: '🌿', p: 10, d: 'Buissons d’herbes des plaines et marais.' },
  fibre: { n: 'Fibre', i: '🌾', p: 5, d: 'Hautes herbes. Se tisse en fil.' },
  fil: { n: 'Fil de soie', i: '🧵', p: 30, d: 'Tissé à partir de fibres. Sert aux armures légères.' },
  gelee: { n: 'Gelée', i: '🫧', p: 8, d: 'Laissée par les gelées.' },
  cuir: { n: 'Cuir', i: '🟫', p: 20, d: 'Lapins cornus et loups.' },
  croc: { n: 'Croc', i: '🦷', p: 18, d: 'Loups et lapins cornus.' },
  plume: { n: 'Plume', i: '🪶', p: 18, d: 'Corbeaux des plaines.' },
  spore: { n: 'Spore', i: '🍄', p: 22, d: 'Champignons de Sylve.' },
  seve: { n: 'Sève', i: '🍯', p: 24, d: 'Lianes carnivores.' },
  braise: { n: 'Braise', i: '🔥', p: 28, d: 'Feux follets, salamandres, créatures du volcan.' },
  aile: { n: 'Aile membraneuse', i: '🦇', p: 30, d: 'Chauves-souris des Monts Grisés.' },
  os: { n: 'Os', i: '🦴', p: 30, d: 'Squelettes errants.' },
  ecaille: { n: 'Écaille', i: '🐍', p: 40, d: 'Reptiles et amphibiens.' },
  ectoplasme: { n: 'Ectoplasme', i: '👻', p: 45, d: 'Spectres du marais.' },
  essence_feu: { n: 'Essence de feu', i: '🔴', p: 120, d: 'Créatures de feu. Améliore les armes.' },
  essence_eau: { n: 'Essence d’eau', i: '🔵', p: 120, d: 'Créatures d’eau. Améliore les armes.' },
  essence_vent: { n: 'Essence de vent', i: '🟢', p: 120, d: 'Créatures de vent. Améliore les armes.' },
  essence_terre: { n: 'Essence de terre', i: '🟤', p: 120, d: 'Créatures de terre. Améliore les armes.' },
  echo: { n: 'Fragment d’Écho', i: '🔮', p: 0, d: 'Laissé par les Gardiens et certains accomplissements. Indispensable aux armes de rang 4 et 5.' },
  coeur_sylve: { n: 'Cœur de Sylve', i: '💚', p: 0, d: 'Cœur palpitant de l’Ent corrompu.' },
  plume_tempete: { n: 'Plume de Tempête', i: '⚡', p: 0, d: 'Plume crépitante de la Wyverne.' },
  larme_hydre: { n: 'Larme d’Hydre', i: '💧', p: 0, d: 'Perle d’eau éternelle.' },
  ecaille_ignar: { n: 'Écaille d’Ignar', i: '🐉', p: 0, d: 'Écaille brûlante du Dragon des Cendres.' },
  plume_aurore: { n: 'Plume d’aurore', i: '🌅', p: 0, legend: true, d: 'Légendaire. Butin exclusif de la chasse premium des Plaines. Éveil légendaire des armes de Vent.' },
  seve_eternelle: { n: 'Sève éternelle', i: '🌿', p: 0, legend: true, d: 'Légendaire. Butin exclusif de la chasse premium de la Forêt. Requise pour tout éveil légendaire.' },
  coeur_cristal: { n: 'Cœur de cristal', i: '💠', p: 0, legend: true, d: 'Légendaire. Butin exclusif de la chasse premium des Monts. Éveil légendaire des armes de Terre.' },
  perle_abyssale: { n: 'Perle abyssale', i: '🦪', p: 0, legend: true, d: 'Légendaire. Butin exclusif de la chasse premium du Marais. Éveil légendaire des armes d’Eau.' },
  flamme_primordiale: { n: 'Flamme primordiale', i: '☄️', p: 0, legend: true, d: 'Légendaire. Butin exclusif de la chasse premium du Volcan. Éveil légendaire des armes de Feu.' },
  trophee: { n: 'Trophée de chasse', i: '🏅', p: 0, d: 'Preuve d’une chasse d’élite. Exclusif au tableau de chasse.' },
  ame: { n: 'Âme primordiale', i: '🌟', p: 0, d: 'Exclusive aux chasses de rang A et S. Éveille une arme au rang 6.' },
};

// ---------------- Objets ----------------
G.ITEMS = {
  potion: { n: 'Potion', i: '🧪', p: 30, d: 'Rend 80 PV.', eff: { heal: 80 }, tgt: 'ally' },
  hipotion: { n: 'Super potion', i: '⚗️', p: 120, d: 'Rend 300 PV.', eff: { heal: 300 }, tgt: 'ally' },
  ether: { n: 'Éther', i: '💠', p: 90, d: 'Rend 30 PM.', eff: { mp: 30 }, tgt: 'ally' },
  phenix: { n: 'Plume de phénix', i: '🪽', p: 220, d: 'Ranime un allié avec 40% de ses PV.', eff: { revive: 0.4 }, tgt: 'dead' },
  remede: { n: 'Remède', i: '💊', p: 40, d: 'Soigne toutes les altérations.', eff: { cleanse: true }, tgt: 'ally' },
  bombe: { n: 'Bombe de feu', i: '💣', p: 100, d: 'Inflige 140 dégâts de feu à tous les ennemis.', eff: { bomb: 140, e: 'feu' }, tgt: 'enemies', battleOnly: true },
  elixir: { n: 'Élixir', i: '🏺', p: 0, d: 'Restaure tous les PV et PM.', eff: { heal: 99999, mp: 9999 }, tgt: 'ally' },
  megalixir: { n: 'Mégalixir', i: '🌈', p: 0, d: 'Exclusif aux chasses. Restaure tous les PV et PM de toute l’équipe.', eff: { heal: 99999, mp: 9999 }, tgt: 'allies' },
  appat: { n: 'Appât', i: '🍖', p: 50, d: 'Avoir un appât permet d’apprivoiser certaines créatures vaincues.', noUse: true },
  friandise: { n: 'Friandise', i: '🍪', p: 40, d: 'Familier : +40 EXP.', fam: { exp: 40 } },
  festin: { n: 'Festin', i: '🍱', p: 160, d: 'Familier : +120 EXP et +8 affinité avec son maître.', fam: { exp: 120, aff: 8 } },
};

// ---------------- Altérations ----------------
G.STATUS = {
  burn: { n: 'Brûlure', i: '🔥', bad: true },
  poison: { n: 'Poison', i: '☠️', bad: true },
  stun: { n: 'Étourdi', i: '💫', bad: true },
  atkUp: { n: 'ATQ+', i: '⚔️' }, atkDown: { n: 'ATQ-', i: '🔻', bad: true },
  defUp: { n: 'DÉF+', i: '🛡️' }, defDown: { n: 'DÉF-', i: '💔', bad: true },
  magUp: { n: 'MAG+', i: '✨' }, resUp: { n: 'RÉS+', i: '🔰' }, resDown: { n: 'RÉS-', i: '🌀', bad: true },
  spdUp: { n: 'VIT+', i: '💨' }, spdDown: { n: 'VIT-', i: '🐌', bad: true },
  regen: { n: 'Régén.', i: '💚' }, shield: { n: 'Bouclier', i: '🔷' },
  counter: { n: 'Riposte', i: '↩️' }, taunt: { n: 'Provoc.', i: '😤' }, evade: { n: 'Esquive', i: '👣' },
  charge: { n: 'Concentr.', i: '⚡' },
};

// ---------------- Compétences ----------------
// t : enemy | enemies | ally | allies | self | dead
// dmg : { s: stat, p: puissance, e: élément ('w' = élément de l'arme), h: coups, rnd: cibles aléatoires, ig: ignore DÉF, crit: bonus }
// st : [ [statut, chance, tours, cible('t' cible, 's' soi, 'a' alliés)] ]
G.SKILLS = {
  // ===== KAEL =====
  k_f1: { n: 'Taille lourde', d: 'Coup d’espadon massif.', mp: 4, t: 'enemy', dmg: { s: 'atk', p: 1.9, e: 'w' } },
  k_f2: { n: 'Cri de guerre', d: 'ATQ+ pendant 4 tours.', mp: 6, t: 'self', st: [['atkUp', 1, 4, 's']] },
  k_f3: { n: 'Sang bouillant', d: 'Passif : ATQ +10%, critique +5%.', passive: true, mods: { atk: 0.1, crit: 5 } },
  k_f4: { n: 'Frappe volcanique', d: 'Frappe de feu. 60% de brûlure.', mp: 12, t: 'enemy', dmg: { s: 'atk', p: 2.7, e: 'feu' }, st: [['burn', 0.6, 3, 't']] },
  k_f5: { n: 'Cataclysme', d: 'Onde de flammes sur tous les ennemis.', mp: 22, t: 'enemies', dmg: { s: 'atk', p: 2.2, e: 'feu' }, st: [['burn', 0.4, 3, 't']] },

  k_e1: { n: 'Iaido', d: 'Dégainé éclair. +40% de critique.', mp: 5, t: 'enemy', dmg: { s: 'atk', p: 1.6, e: 'w', crit: 40 } },
  k_e2: { n: 'Garde fluide', d: 'Riposte assurée et DÉF+ pendant 2 tours.', mp: 6, t: 'self', st: [['counter', 1, 2, 's'], ['defUp', 1, 2, 's']] },
  k_e3: { n: 'Esprit calme', d: 'Passif : +3 PM par tour, critique +5%.', passive: true, mods: { mpRegen: 3, crit: 5 } },
  k_e4: { n: 'Tranche-marée', d: 'Vague tranchante sur tous les ennemis.', mp: 12, t: 'enemies', dmg: { s: 'atk', p: 1.5, e: 'eau' } },
  k_e5: { n: 'Lune brisée', d: 'Coup ultime. +30% de critique.', mp: 20, t: 'enemy', dmg: { s: 'atk', p: 3.3, e: 'eau', crit: 30 } },

  k_v1: { n: 'Rafale', d: '3 coups sur des ennemis aléatoires.', mp: 5, t: 'enemies', dmg: { s: 'atk', p: 0.75, h: 3, rnd: true } },
  k_v2: { n: 'Pas de l’ombre', d: 'Esquive et VIT+ pendant 3 tours.', mp: 6, t: 'self', st: [['evade', 1, 3, 's'], ['spdUp', 1, 3, 's']] },
  k_v3: { n: 'Premier coup', d: 'Passif : agit toujours en premier, VIT +5%.', passive: true, mods: { spd: 0.05 }, flags: ['firstStrike'] },
  k_v4: { n: 'Lacération', d: '2 entailles. 70% d’empoisonner.', mp: 10, t: 'enemy', dmg: { s: 'atk', p: 0.95, h: 2 }, st: [['poison', 0.7, 4, 't']] },
  k_v5: { n: 'Danse des lames', d: '6 coups sur des ennemis aléatoires.', mp: 20, t: 'enemies', dmg: { s: 'atk', p: 0.7, h: 6, rnd: true } },

  k_t1: { n: 'Provocation', d: 'Attire les ennemis. DÉF+ 3 tours.', mp: 4, t: 'self', st: [['taunt', 1, 3, 's'], ['defUp', 1, 3, 's']] },
  k_t2: { n: 'Choc sismique', d: 'Coup de bouclier. 35% d’étourdir.', mp: 8, t: 'enemy', dmg: { s: 'atk', p: 1.6, e: 'terre' }, st: [['stun', 0.35, 1, 't']] },
  k_t3: { n: 'Inébranlable', d: 'Passif : survit une fois par combat à un coup fatal. PV +5%.', passive: true, mods: { hp: 0.05 }, flags: ['endure'] },
  k_t4: { n: 'Mur de pierre', d: 'DÉF+ et RÉS+ à toute l’équipe (3 tours).', mp: 14, t: 'allies', st: [['defUp', 1, 3, 't'], ['resUp', 1, 3, 't']] },
  k_t5: { n: 'Bastion', d: 'Bouclier (25% PV max) et régénération pour l’équipe.', mp: 20, t: 'allies', special: 'bastion', st: [['regen', 1, 3, 't']] },

  // ===== LYRA =====
  l_f1: { n: 'Flammèche', d: 'Sort de feu. 25% de brûlure.', mp: 4, t: 'enemy', dmg: { s: 'mag', p: 1.7, e: 'feu' }, st: [['burn', 0.25, 3, 't']] },
  l_f2: { n: 'Brasier', d: 'Flammes sur tous les ennemis.', mp: 10, t: 'enemies', dmg: { s: 'mag', p: 1.3, e: 'feu' } },
  l_f3: { n: 'Foyer intérieur', d: 'Passif : MAG +12%.', passive: true, mods: { mag: 0.12 } },
  l_f4: { n: 'Combustion', d: 'Dégâts doublés sur une cible brûlée.', mp: 12, t: 'enemy', dmg: { s: 'mag', p: 2.0, e: 'feu' }, special: 'detonate' },
  l_f5: { n: 'Météore', d: 'Pluie de météores dévastatrice.', mp: 28, t: 'enemies', dmg: { s: 'mag', p: 2.8, e: 'feu' } },

  l_e1: { n: 'Soin', d: 'Soigne un allié.', mp: 4, t: 'ally', heal: { s: 'mag', p: 2.3 } },
  l_e2: { n: 'Purification', d: 'Soigne les altérations et un peu de PV.', mp: 5, t: 'ally', heal: { s: 'mag', p: 0.8 }, cleanse: true },
  l_e3: { n: 'Soin de groupe', d: 'Soigne toute l’équipe.', mp: 12, t: 'allies', heal: { s: 'mag', p: 1.45 } },
  l_e4: { n: 'Grâce', d: 'Passif : l’équipe commence chaque combat en régénération. RÉS +10%.', passive: true, mods: { res: 0.1 }, flags: ['grace'] },
  l_e5: { n: 'Résurrection', d: 'Ranime un allié avec 60% de ses PV.', mp: 18, t: 'dead', revive: 0.6 },

  l_v1: { n: 'Tir perçant', d: 'Flèche ignorant 60% de la DÉF.', mp: 5, t: 'enemy', dmg: { s: 'mag', p: 1.5, ig: 0.6 } },
  l_v2: { n: 'Flèche entravante', d: 'Réduit la VIT de la cible.', mp: 6, t: 'enemy', dmg: { s: 'mag', p: 1.0 }, st: [['spdDown', 0.85, 3, 't']] },
  l_v3: { n: 'Œil de faucon', d: 'Passif : critique +12%.', passive: true, mods: { crit: 12 } },
  l_v4: { n: 'Volée', d: 'Pluie de flèches sur tous les ennemis.', mp: 12, t: 'enemies', dmg: { s: 'mag', p: 1.25 } },
  l_v5: { n: 'Tempête de flèches', d: '5 flèches de vent aléatoires.', mp: 24, t: 'enemies', dmg: { s: 'mag', p: 1.0, e: 'vent', h: 5, rnd: true } },

  l_t1: { n: 'Affaiblir', d: 'Malédiction : ATQ- et DÉF-.', mp: 4, t: 'enemy', dmg: { s: 'mag', p: 0.6, e: 'terre' }, st: [['atkDown', 0.9, 3, 't'], ['defDown', 0.6, 3, 't']] },
  l_t2: { n: 'Drain vital', d: 'Vole 50% des dégâts infligés.', mp: 6, t: 'enemy', dmg: { s: 'mag', p: 1.4, e: 'terre', drain: 0.5 } },
  l_t3: { n: 'Savoir ancien', d: 'Passif : malédictions +1 tour, MAG +6%.', passive: true, mods: { mag: 0.06 }, flags: ['longDebuff'] },
  l_t4: { n: 'Pétrification', d: '65% d’étourdir et DÉF- garantie.', mp: 12, t: 'enemy', dmg: { s: 'mag', p: 0.9, e: 'terre' }, st: [['stun', 0.65, 1, 't'], ['defDown', 1, 3, 't']] },
  l_t5: { n: 'Séisme', d: 'Séisme sur tous les ennemis. DÉF-.', mp: 24, t: 'enemies', dmg: { s: 'mag', p: 2.2, e: 'terre' }, st: [['defDown', 0.5, 3, 't']] },

  // ===== BRAN =====
  b_f1: { n: 'Uppercut', d: 'Coup ascendant (+1 enchaînement).', mp: 4, t: 'enemy', dmg: { s: 'atk', p: 1.5, e: 'w' } },
  b_f2: { n: 'Concentration', d: 'Prochaine attaque x2, +2 enchaînements.', mp: 5, t: 'self', special: 'focus', st: [['charge', 1, 3, 's']] },
  b_f3: { n: 'Ki brûlant', d: 'Passif : ATQ +8%, PV +6%.', passive: true, mods: { atk: 0.08, hp: 0.06 } },
  b_f4: { n: 'Poing du phénix', d: 'Consomme les enchaînements : +50% par charge.', mp: 12, t: 'enemy', dmg: { s: 'atk', p: 1.4, e: 'feu' }, special: 'finisher' },
  b_f5: { n: 'Mille poings', d: '8 coups de feu aléatoires.', mp: 22, t: 'enemies', dmg: { s: 'atk', p: 0.6, e: 'feu', h: 8, rnd: true } },

  b_e1: { n: 'Empalement', d: 'Coup de trident perçant.', mp: 5, t: 'enemy', dmg: { s: 'atk', p: 1.75, e: 'eau' } },
  b_e2: { n: 'Vague', d: 'Déferlante sur tous les ennemis.', mp: 8, t: 'enemies', dmg: { s: 'atk', p: 1.1, e: 'eau' } },
  b_e3: { n: 'Peau de nacre', d: 'Passif : RÉS +15%, régénère 3% PV par tour.', passive: true, mods: { res: 0.15 }, flags: ['regenAlways'] },
  b_e4: { n: 'Siphon', d: 'Vole 100% des dégâts infligés.', mp: 8, t: 'enemy', dmg: { s: 'atk', p: 1.3, drain: 1 } },
  b_e5: { n: 'Maelström', d: 'Tourbillon géant. VIT- aux ennemis.', mp: 22, t: 'enemies', dmg: { s: 'atk', p: 2.0, e: 'eau' }, st: [['spdDown', 0.5, 3, 't']] },

  b_v1: { n: 'Saut', d: 'S’envole (intouchable) puis s’abat au tour suivant.', mp: 5, t: 'enemy', special: 'jump', dmg: { s: 'atk', p: 2.6, e: 'vent' } },
  b_v2: { n: 'Percée', d: 'Charge traversant tous les ennemis.', mp: 7, t: 'enemies', dmg: { s: 'atk', p: 1.2, e: 'vent', ig: 0.3 } },
  b_v3: { n: 'Vent arrière', d: 'Passif : VIT +10%.', passive: true, mods: { spd: 0.1 } },
  b_v4: { n: 'Cri du dragon', d: 'VIT+ et ATQ+ à toute l’équipe.', mp: 12, t: 'allies', st: [['spdUp', 1, 3, 't'], ['atkUp', 1, 3, 't']] },
  b_v5: { n: 'Chute céleste', d: 'Saut colossal frappant tous les ennemis.', mp: 24, t: 'enemies', special: 'jump', dmg: { s: 'atk', p: 2.4, e: 'vent' } },

  b_t1: { n: 'Fendoir', d: 'Coup de hache. DÉF- garantie.', mp: 4, t: 'enemy', dmg: { s: 'atk', p: 1.6 }, st: [['defDown', 1, 3, 't']] },
  b_t2: { n: 'Racines', d: 'Régénération et DÉF+ pendant 4 tours.', mp: 6, t: 'self', st: [['regen', 1, 4, 's'], ['defUp', 1, 4, 's']] },
  b_t3: { n: 'Peau d’écorce', d: 'Passif : DÉF +12%, PV +8%.', passive: true, mods: { def: 0.12, hp: 0.08 } },
  b_t4: { n: 'Brise-armure', d: 'Ignore 30% DÉF. RÉS- et DÉF-.', mp: 10, t: 'enemy', dmg: { s: 'atk', p: 2.3, ig: 0.3 }, st: [['defDown', 1, 4, 't'], ['resDown', 1, 4, 't']] },
  b_t5: { n: 'Tremblement', d: 'Fissure le sol. 25% d’étourdir.', mp: 22, t: 'enemies', dmg: { s: 'atk', p: 2.0, e: 'terre' }, st: [['stun', 0.25, 1, 't']] },

  // ===== Techniques liées (familiers) =====
  f_bulle: { n: 'Geyser', d: 'Eau sur tous les ennemis + soin de l’équipe.', t: 'enemies', dmg: { s: 'best', p: 1.7, e: 'eau' }, special: 'geyser', tech: true },
  f_pyron: { n: 'Explosion écarlate', d: 'Explosion de feu sur tous les ennemis.', t: 'enemies', dmg: { s: 'best', p: 2.3, e: 'feu' }, st: [['burn', 0.5, 3, 't']], tech: true },
  f_zephy: { n: 'Ouragan', d: '6 coups de vent + VIT+ pour l’équipe.', t: 'enemies', dmg: { s: 'best', p: 0.75, e: 'vent', h: 6, rnd: true }, special: 'hurricane', tech: true },
  f_mousse: { n: 'Carapace titanesque', d: 'Bouclier massif pour l’équipe + dégâts de terre.', t: 'enemies', dmg: { s: 'best', p: 1.4, e: 'terre' }, special: 'carapace', tech: true },
  f_noctis: { n: 'Griffe du néant', d: 'Frappe ignorant toute défense.', t: 'enemy', dmg: { s: 'best', p: 3.6, ig: 1 }, tech: true },
  f_lumi: { n: 'Aurore', d: 'Lumière perçante sur tous les ennemis + grand soin de l’équipe.', t: 'enemies', dmg: { s: 'best', p: 2.0, ig: 0.5 }, special: 'geyser', tech: true },

  // ===== Ennemis =====
  e_tackle: { n: 'Charge', t: 'enemy', dmg: { s: 'atk', p: 1.0 } },
  e_bite: { n: 'Morsure', t: 'enemy', dmg: { s: 'atk', p: 1.25 } },
  e_claw: { n: 'Griffure', t: 'enemy', dmg: { s: 'atk', p: 1.1, h: 2 } },
  e_howl: { n: 'Hurlement', t: 'self', st: [['atkUp', 1, 3, 's']] },
  e_water: { n: 'Jet d’eau', t: 'enemy', dmg: { s: 'mag', p: 1.3, e: 'eau' } },
  e_gust: { n: 'Bourrasque', t: 'enemies', dmg: { s: 'mag', p: 0.9, e: 'vent' } },
  e_spores: { n: 'Spores', t: 'enemies', dmg: { s: 'mag', p: 0.55, e: 'terre' }, st: [['poison', 0.4, 3, 't']] },
  e_vine: { n: 'Liane', t: 'enemy', dmg: { s: 'atk', p: 1.2, e: 'terre', drain: 0.5 } },
  e_fire: { n: 'Boule de feu', t: 'enemy', dmg: { s: 'mag', p: 1.35, e: 'feu' }, st: [['burn', 0.25, 3, 't']] },
  e_flames: { n: 'Flammes', t: 'enemies', dmg: { s: 'mag', p: 1.0, e: 'feu' }, st: [['burn', 0.2, 3, 't']] },
  e_rock: { n: 'Rocher', t: 'enemy', dmg: { s: 'atk', p: 1.45, e: 'terre' } },
  e_smash: { n: 'Écrasement', t: 'enemy', dmg: { s: 'atk', p: 1.1 }, st: [['stun', 0.25, 1, 't']] },
  e_slash: { n: 'Taillade', t: 'enemy', dmg: { s: 'atk', p: 1.3 } },
  e_drain: { n: 'Drain', t: 'enemy', dmg: { s: 'mag', p: 1.1, drain: 1 } },
  e_curse: { n: 'Malédiction', t: 'enemy', dmg: { s: 'mag', p: 0.6 }, st: [['atkDown', 0.7, 3, 't']] },
  e_venom: { n: 'Morsure venimeuse', t: 'enemy', dmg: { s: 'atk', p: 1.1 }, st: [['poison', 0.6, 4, 't']] },
  e_toxic: { n: 'Charge toxique', t: 'enemy', dmg: { s: 'atk', p: 1.0, e: 'eau' }, st: [['poison', 0.4, 3, 't']] },
  e_heal: { n: 'Récupération', t: 'self', heal: { s: 'mag', p: 2.0 } },
  e_breath: { n: 'Souffle ardent', t: 'enemies', dmg: { s: 'mag', p: 1.25, e: 'feu' } },
  // Boss
  e_roots: { n: 'Racines étouffantes', t: 'enemies', dmg: { s: 'atk', p: 1.0, e: 'terre' }, st: [['stun', 0.15, 1, 't']] },
  e_crush: { n: 'Poing d’écorce', t: 'enemy', dmg: { s: 'atk', p: 2.0, e: 'terre' } },
  e_regrow: { n: 'Repousse', t: 'self', heal: { s: 'mag', p: 4 }, st: [['regen', 1, 3, 's']] },
  e_cyclone: { n: 'Cyclone', t: 'enemies', dmg: { s: 'mag', p: 1.45, e: 'vent' } },
  e_dive: { n: 'Piqué', t: 'enemy', dmg: { s: 'atk', p: 2.2, e: 'vent' } },
  e_shriek: { n: 'Cri strident', t: 'enemies', st: [['spdDown', 0.7, 3, 't'], ['defDown', 0.4, 3, 't']] },
  e_tidal: { n: 'Raz-de-marée', t: 'enemies', dmg: { s: 'mag', p: 1.55, e: 'eau' } },
  e_hvenom: { n: 'Crocs toxiques', t: 'enemies', dmg: { s: 'atk', p: 0.9 }, st: [['poison', 0.5, 4, 't']] },
  e_hbite: { n: 'Triple morsure', t: 'enemy', dmg: { s: 'atk', p: 0.95, h: 3 } },
  e_inferno: { n: 'Inferno', t: 'enemies', dmg: { s: 'mag', p: 1.65, e: 'feu' }, st: [['burn', 0.35, 3, 't']] },
  e_dclaw: { n: 'Griffes de cendre', t: 'enemy', dmg: { s: 'atk', p: 2.3, e: 'feu' } },
  e_roar: { n: 'Rugissement', t: 'enemies', st: [['defDown', 0.8, 3, 't'], ['atkDown', 0.5, 3, 't']] },
  e_meteor: { n: 'Pluie de cendres', t: 'enemies', dmg: { s: 'mag', p: 0.75, e: 'feu', h: 4, rnd: true } },
};

// ---------------- Personnages ----------------
G.CHARS = {
  kael: {
    n: 'Kael', title: 'Épéiste vagabond',
    base: { hp: 120, mp: 22, atk: 14, mag: 6, def: 10, res: 6, spd: 10 },
    gr: { hp: 15, mp: 2.2, atk: 2.3, mag: 0.8, def: 1.7, res: 1.0, spd: 0.55 },
    pal: { H: '#b04a2a', h: '#7a2e18', S: '#f2c9a0', s: '#d39a78', E: '#1a1a2e', C: '#2f5fae', D: '#1e3c78', B: '#5a3a22', L: '#e8e0c8', o: '#160e1a' },
    weapons: { feu: 'brise_braise', eau: 'lame_ressac', vent: 'griffes_zephyr', terre: 'rempart' }, start: 'feu',
    innate: [
      { lvl: 4, n: 'Vétéran', d: 'PV +8%.', mods: { hp: 0.08 } },
      { lvl: 9, n: 'Tacticien', d: 'Critique +5%.', mods: { crit: 5 } },
      { lvl: 14, n: 'Volonté', d: 'ATQ +10%.', mods: { atk: 0.1 } },
      { lvl: 20, n: 'Cœur de héros', d: 'Toutes les stats +8%.', mods: { hp: 0.08, atk: 0.08, mag: 0.08, def: 0.08, res: 0.08, spd: 0.08 } },
    ],
  },
  lyra: {
    n: 'Lyra', title: 'Mage des sources',
    base: { hp: 86, mp: 46, atk: 7, mag: 15, def: 6, res: 12, spd: 11 },
    gr: { hp: 9.5, mp: 5, atk: 0.8, mag: 2.4, def: 1.0, res: 1.9, spd: 0.65 },
    pal: { H: '#e9e2b8', h: '#b9a77a', S: '#f6d6b8', s: '#d9a98a', E: '#1d3a5a', C: '#eef2f8', D: '#5aa0c8', B: '#7a5a9a', L: '#ffd86a', o: '#160e1a' },
    weapons: { feu: 'sceptre_solaire', eau: 'calice', vent: 'arc_celeste', terre: 'grimoire' }, start: 'eau',
    innate: [
      { lvl: 4, n: 'Méditation', d: 'PM +12%.', mods: { mp: 0.12 } },
      { lvl: 9, n: 'Esprit vif', d: 'VIT +8%.', mods: { spd: 0.08 } },
      { lvl: 14, n: 'Sagesse', d: 'MAG +10%.', mods: { mag: 0.1 } },
      { lvl: 20, n: 'Aura sereine', d: '+4 PM par tour.', mods: { mpRegen: 4 } },
    ],
  },
  bran: {
    n: 'Bran', title: 'Bâtisseur colosse',
    base: { hp: 140, mp: 18, atk: 13, mag: 5, def: 12, res: 7, spd: 8 },
    gr: { hp: 17, mp: 1.8, atk: 2.1, mag: 0.6, def: 1.9, res: 1.1, spd: 0.5 },
    pal: { H: '#3a2a20', h: '#22180f', S: '#c98a5e', s: '#a06a44', E: '#1a1a1a', C: '#9a5a2a', D: '#5e3418', B: '#2e2e36', L: '#e0402a', o: '#160e1a' },
    weapons: { feu: 'gantelets', eau: 'trident', vent: 'lance_dragon', terre: 'hache' }, start: 'terre',
    innate: [
      { lvl: 4, n: 'Robuste', d: 'PV +12%.', mods: { hp: 0.12 } },
      { lvl: 9, n: 'Garde de fer', d: 'DÉF +10%.', mods: { def: 0.1 } },
      { lvl: 14, n: 'Force brute', d: 'ATQ +10%.', mods: { atk: 0.1 } },
      { lvl: 20, n: 'Rempart vivant', d: 'RÉS +15%, PV +8%.', mods: { res: 0.15, hp: 0.08 } },
    ],
  },
};
G.CHAR_ORDER = ['kael', 'lyra', 'bran'];

// ---------------- Armes (4 par personnage, une par emplacement élémentaire) ----------------
const _SK = (a) => a.map(([lvl, id, tier]) => ({ lvl, id, tier: tier || 1 }));
G.WEAPONS = {
  // ----- Kael -----
  brise_braise: {
    n: 'Brise-Braise', ch: 'kael', slot: 'feu', kind: 'greatsword', kn: 'Espadon', e: 'feu',
    build: 'Berserker — frappes lentes et dévastatrices. Plus il est blessé, plus il frappe fort.',
    trait: { n: 'Fureur', d: 'Dégâts +40% quand les PV sont sous 50%.', f: 'fury' },
    base: { atk: 10, mag: 0 }, gr: { atk: 7, mag: 0 }, mult: { atk: 1.3, spd: 0.85 }, crit: 0, upMat: 'braise',
    skills: _SK([[1, 'k_f1'], [3, 'k_f2'], [6, 'k_f3'], [10, 'k_f4'], [15, 'k_f5', 3]]),
    recipe: { g: 0, m: { lingot: 3, braise: 2 } },
  },
  lame_ressac: {
    n: 'Lame du Ressac', ch: 'kael', slot: 'eau', kind: 'katana', kn: 'Katana', e: 'eau',
    build: 'Duelliste — critiques élevés et ripostes. Punit chaque attaque ennemie.',
    trait: { n: 'Riposte', d: '35% de chances de contre-attaquer les coups physiques.', f: 'counter' },
    base: { atk: 8, mag: 2 }, gr: { atk: 6, mag: 1 }, mult: { atk: 1.05, spd: 1.1 }, crit: 12, upMat: 'gelee',
    skills: _SK([[1, 'k_e1'], [3, 'k_e2'], [6, 'k_e3'], [10, 'k_e4'], [15, 'k_e5', 3]]),
    recipe: { g: 150, m: { lingot: 3, gelee: 5 } },
  },
  griffes_zephyr: {
    n: 'Griffes de Zéphyr', ch: 'kael', slot: 'vent', kind: 'daggers', kn: 'Dagues jumelles', e: null,
    build: 'Assassin — vitesse extrême, coups multiples et poisons. Non infusées.',
    trait: { n: 'Double frappe', d: 'Les attaques normales frappent 2 fois (65% chacune).', f: 'double' },
    base: { atk: 7, mag: 0 }, gr: { atk: 5.5, mag: 0 }, mult: { atk: 0.88, spd: 1.32 }, crit: 8, upMat: 'croc',
    skills: _SK([[1, 'k_v1'], [3, 'k_v2'], [6, 'k_v3'], [10, 'k_v4'], [15, 'k_v5', 3]]),
    recipe: { g: 150, m: { lingot: 2, croc: 4, cuir: 2 } },
  },
  rempart: {
    n: 'Rempart d’Aube', ch: 'kael', slot: 'terre', kind: 'swordshield', kn: 'Épée & bouclier', e: 'terre',
    build: 'Paladin — attire les coups et protège l’équipe. Défense massive.',
    trait: { n: 'Protecteur', d: 'Les ennemis le ciblent bien plus souvent. DÉF +40%.', f: 'taunt' },
    base: { atk: 7, mag: 0 }, gr: { atk: 5, mag: 0 }, mult: { atk: 0.95, def: 1.4, res: 1.2, hp: 1.15, spd: 0.95 }, crit: 0, upMat: 'pierre',
    skills: _SK([[1, 'k_t1'], [3, 'k_t2'], [6, 'k_t3'], [10, 'k_t4'], [15, 'k_t5', 3]]),
    recipe: { g: 150, m: { lingot: 4, pierre: 6, bois: 4 } },
  },
  // ----- Lyra -----
  sceptre_solaire: {
    n: 'Sceptre Solaire', ch: 'lyra', slot: 'feu', kind: 'staff', kn: 'Bâton', e: 'feu',
    build: 'Sorcière — magie offensive pure, brûlures et explosions.',
    trait: { n: 'Pyromancie', d: 'Sorts de feu +25%, brûlures +20% de chances.', f: 'pyro' },
    base: { atk: 3, mag: 10 }, gr: { atk: 1, mag: 7 }, mult: { mag: 1.3, res: 0.9 }, crit: 0, upMat: 'braise',
    skills: _SK([[1, 'l_f1'], [3, 'l_f2'], [6, 'l_f3'], [10, 'l_f4'], [15, 'l_f5', 3]]),
    recipe: { g: 150, m: { bois: 4, braise: 3, lingot: 1 } },
  },
  calice: {
    n: 'Calice des Sources', ch: 'lyra', slot: 'eau', kind: 'chalice', kn: 'Calice', e: 'eau',
    build: 'Prêtresse — soins puissants, purification et résurrection.',
    trait: { n: 'Bénédiction', d: 'Soins +40%.', f: 'healer' },
    base: { atk: 2, mag: 8 }, gr: { atk: 1, mag: 6 }, mult: { mag: 1.0, res: 1.2, mp: 1.2 }, crit: 0, upMat: 'herbe',
    skills: _SK([[1, 'l_e1'], [3, 'l_e2'], [6, 'l_e3'], [10, 'l_e4'], [15, 'l_e5', 3]]),
    recipe: { g: 0, m: { lingot: 1, herbe: 4 } },
  },
  arc_celeste: {
    n: 'Arc Céleste', ch: 'lyra', slot: 'vent', kind: 'bow', kn: 'Arc', e: null,
    build: 'Archère arcanique — précision, critiques et ralentissements. Non infusé.',
    trait: { n: 'Flèches arcaniques', d: 'Les attaques utilisent la MAG et ignorent 30% de DÉF.', f: 'arcane' },
    base: { atk: 4, mag: 8 }, gr: { atk: 2, mag: 6 }, mult: { mag: 1.05, spd: 1.15 }, crit: 10, upMat: 'plume',
    skills: _SK([[1, 'l_v1'], [3, 'l_v2'], [6, 'l_v3'], [10, 'l_v4'], [15, 'l_v5', 3]]),
    recipe: { g: 150, m: { bois: 5, fibre: 4, plume: 3 } },
  },
  grimoire: {
    n: 'Grimoire Tellurique', ch: 'lyra', slot: 'terre', kind: 'tome', kn: 'Grimoire', e: 'terre',
    build: 'Occultiste — malédictions, drains et étourdissements.',
    trait: { n: 'Érudition', d: 'Coût en PM -30%.', f: 'thrift' },
    base: { atk: 2, mag: 9 }, gr: { atk: 1, mag: 6.5 }, mult: { mag: 1.15, res: 1.1 }, crit: 0, upMat: 'spore',
    skills: _SK([[1, 'l_t1'], [3, 'l_t2'], [6, 'l_t3'], [10, 'l_t4'], [15, 'l_t5', 3]]),
    recipe: { g: 150, m: { fibre: 4, spore: 3, cuir: 2 } },
  },
  // ----- Bran -----
  gantelets: {
    n: 'Gantelets Ardents', ch: 'bran', slot: 'feu', kind: 'fists', kn: 'Gantelets', e: 'feu',
    build: 'Moine — enchaînements explosifs. Chaque attaque consécutive frappe plus fort.',
    trait: { n: 'Enchaînement', d: 'Chaque attaque consécutive +15% de dégâts (max 5).', f: 'combo' },
    base: { atk: 8, mag: 0 }, gr: { atk: 6, mag: 0 }, mult: { atk: 1.1, spd: 1.12 }, crit: 5, upMat: 'cuir',
    skills: _SK([[1, 'b_f1'], [3, 'b_f2'], [6, 'b_f3'], [10, 'b_f4'], [15, 'b_f5', 3]]),
    recipe: { g: 150, m: { cuir: 3, braise: 2, lingot: 2 } },
  },
  trident: {
    n: 'Trident Abyssal', ch: 'bran', slot: 'eau', kind: 'trident', kn: 'Trident', e: 'eau',
    build: 'Vampire des abysses — endurance infinie grâce au drain de vie.',
    trait: { n: 'Marée vitale', d: '20% des dégâts infligés sont convertis en PV.', f: 'lifesteal' },
    base: { atk: 9, mag: 0 }, gr: { atk: 6, mag: 0 }, mult: { atk: 1.05, hp: 1.1 }, crit: 0, upMat: 'ecaille',
    skills: _SK([[1, 'b_e1'], [3, 'b_e2'], [6, 'b_e3'], [10, 'b_e4'], [15, 'b_e5', 3]]),
    recipe: { g: 150, m: { lingot: 3, ecaille: 3, gelee: 2 } },
  },
  lance_dragon: {
    n: 'Lance du Dragon', ch: 'bran', slot: 'vent', kind: 'lance', kn: 'Lance', e: 'vent',
    build: 'Chevalier dragon — sauts aériens intouchables et soutien offensif.',
    trait: { n: 'Draconique', d: 'Les attaques ignorent 20% de DÉF. Les sauts infligent +30%.', f: 'dragoon' },
    base: { atk: 9, mag: 0 }, gr: { atk: 6.5, mag: 0 }, mult: { atk: 1.12 }, crit: 4, upMat: 'plume',
    skills: _SK([[1, 'b_v1'], [3, 'b_v2'], [6, 'b_v3'], [10, 'b_v4'], [15, 'b_v5', 3]]),
    recipe: { g: 150, m: { bois: 4, lingot: 3, plume: 3 } },
  },
  hache: {
    n: 'Hache Primitive', ch: 'bran', slot: 'terre', kind: 'axe', kn: 'Hache', e: null,
    build: 'Barbare — brise les armures. Non infusée, mais redoutable contre les ennemis blindés.',
    trait: { n: 'Brise-garde', d: '50% de chances de réduire la DÉF ennemie à chaque coup.', f: 'breaker' },
    base: { atk: 10, mag: 0 }, gr: { atk: 7, mag: 0 }, mult: { atk: 1.25, spd: 0.9, def: 1.1 }, crit: 0, upMat: 'pierre',
    skills: _SK([[1, 'b_t1'], [3, 'b_t2'], [6, 'b_t3'], [10, 'b_t4'], [15, 'b_t5', 3]]),
    recipe: { g: 0, m: { bois: 4, pierre: 4 } },
  },
};
G.MAX_TIER = 7;
G.LEGEND_MAT = { feu: 'flamme_primordiale', eau: 'perle_abyssale', vent: 'plume_aurore', terre: 'coeur_cristal' };
// coût d'amélioration rang t -> t+1
G.upgradeCost = (w, t) => {
  const slotEss = 'essence_' + w.slot;
  if (t === 1) return { g: 120, m: { lingot: 2, [w.upMat]: 3 } };
  if (t === 2) return { g: 320, m: { lingot: 4, [w.upMat]: 5, [slotEss]: 2 } };
  if (t === 3) return { g: 750, m: { lingot: 6, cristal: 3, [slotEss]: 4, echo: 1 } };
  if (t === 4) return { g: 1600, m: { mithril: 4, [slotEss]: 6, echo: 2 } };
  if (t === 5) return { g: 3000, m: { ame: 1, mithril: 4, echo: 2 } }; // éveil : rang 6
  return { g: 6000, m: { [G.LEGEND_MAT[w.slot]]: 2, seve_eternelle: 1, mithril: 6, echo: 3 } }; // légendaire : rang 7
};

// ---------------- Armures & accessoires ----------------
G.ARMORS = {
  tunique: { n: 'Tunique de cuir', slot: 'armor', tier: 1, st: { def: 6, res: 2, hp: 10 }, d: 'Protection légère et souple.', r: { m: { cuir: 3, fibre: 3 } } },
  robe_lin: { n: 'Robe de lin', slot: 'armor', tier: 1, st: { def: 3, res: 7, mp: 10 }, d: 'Robe tissée, favorise la magie.', r: { m: { fibre: 5, herbe: 2 } } },
  anneau_pierre: { n: 'Anneau de pierre', slot: 'acc', tier: 1, st: { def: 4, res: 2 }, d: 'Anneau grossier mais solide.', r: { m: { pierre: 4, lingot: 1 } } },
  cotte: { n: 'Cotte de mailles', slot: 'armor', tier: 2, st: { def: 15, res: 4, hp: 25 }, d: 'Armure lourde.', r: { g: 120, m: { lingot: 5, cuir: 3 } } },
  robe_sorcier: { n: 'Robe de sorcier', slot: 'armor', tier: 2, st: { def: 7, res: 15, mp: 20, mag: 3 }, d: 'Robe brodée de runes.', r: { g: 120, m: { fil: 4, spore: 3 } } },
  amulette_croc: { n: 'Amulette de croc', slot: 'acc', tier: 2, st: { atk: 6 }, d: 'ATQ +6.', r: { g: 80, m: { croc: 5, os: 2 } } },
  bottes_ailees: { n: 'Bottes ailées', slot: 'acc', tier: 2, st: { spd: 4 }, d: 'VIT +4.', r: { g: 80, m: { plume: 4, aile: 2, cuir: 2 } } },
  ecailles: { n: 'Armure d’écailles', slot: 'armor', tier: 3, st: { def: 25, res: 12, hp: 40 }, el: { eau: 0.3 }, d: 'Résiste à l’eau (30%).', r: { g: 300, m: { ecaille: 6, lingot: 6 } } },
  manteau_ombre: { n: 'Manteau d’ombre', slot: 'armor', tier: 3, st: { def: 15, res: 24, crit: 5, mp: 25 }, d: 'Critique +5%.', r: { g: 300, m: { ectoplasme: 5, fil: 5 } } },
  talisman: { n: 'Talisman élémentaire', slot: 'acc', tier: 3, st: {}, el: { feu: 0.25, eau: 0.25, vent: 0.25, terre: 0.25 }, d: 'Résistance de 25% à tous les éléments.', r: { g: 300, m: { essence_feu: 1, essence_eau: 1, essence_vent: 1, essence_terre: 1, cristal: 2 } } },
  armure_mithril: { n: 'Armure de mithril', slot: 'armor', tier: 4, st: { def: 38, res: 22, hp: 70 }, d: 'L’armure ultime des forgerons.', r: { g: 900, m: { mithril: 5, cristal: 4, echo: 1 } } },
  robe_archimage: { n: 'Robe d’archimage', slot: 'armor', tier: 4, st: { def: 22, res: 38, mag: 12, mp: 40 }, d: 'MAG +12.', r: { g: 900, m: { fil: 8, cristal: 5, echo: 1 } } },
  anneau_phenix: { n: 'Anneau du phénix', slot: 'acc', tier: 4, st: { hp: 30 }, flags: ['autoRevive'], d: 'Ranime une fois par combat.', r: { g: 900, m: { braise: 8, essence_feu: 3, echo: 1 } } },
  // uniques (accomplissements)
  ecorce: { n: 'Écorce ancienne', slot: 'armor', tier: 0, st: { def: 20, res: 12, hp: 40 }, flags: ['regenAlways'], d: 'Unique. Régénère 3% PV par tour.' },
  larme_acc: { n: 'Pendentif de l’Hydre', slot: 'acc', tier: 0, st: { mp: 20, res: 8 }, mods: { mpRegen: 4 }, d: 'Unique. +4 PM par tour.' },
  insigne: { n: 'Insigne du Maître', slot: 'acc', tier: 0, st: {}, mods: { hp: 0.06, atk: 0.06, mag: 0.06, def: 0.06, res: 0.06, spd: 0.06 }, d: 'Unique. Toutes les stats +6%.' },
  collier_lien: { n: 'Collier du lien', slot: 'acc', tier: 0, st: { res: 6 }, flags: ['bond'], d: 'Unique. Affinité x2, énergie du familier +50%.' },
  // légendaires (matériaux des chasses premium, Atelier niv. 3)
  armure_aurore: { n: 'Armure de l’Aurore', slot: 'armor', tier: 4, legend: true, st: { def: 58, res: 42, hp: 160, spd: 6 }, mods: { crit: 6 }, d: 'Légendaire. Rapide et robuste.', r: { g: 4000, m: { plume_aurore: 2, seve_eternelle: 1, mithril: 4 } } },
  robe_sylve: { n: 'Robe de la Sylve éternelle', slot: 'armor', tier: 4, legend: true, st: { def: 36, res: 64, mag: 24, mp: 60, hp: 80 }, flags: ['regenAlways'], d: 'Légendaire. Magie et régénération.', r: { g: 4000, m: { seve_eternelle: 2, perle_abyssale: 1, fil: 10 } } },
  egide_cristal: { n: 'Égide de cristal', slot: 'armor', tier: 4, legend: true, st: { def: 74, res: 34, hp: 200 }, el: { terre: 0.3, vent: 0.3 }, d: 'Légendaire. Défense ultime, résiste à la terre et au vent.', r: { g: 4000, m: { coeur_cristal: 2, mithril: 6, cristal: 6 } } },
  anneau_abyssal: { n: 'Anneau abyssal', slot: 'acc', tier: 4, legend: true, st: { res: 16, mp: 40 }, mods: { mpRegen: 6 }, flags: ['autoRevive'], el: { eau: 0.3 }, d: 'Légendaire. +6 PM par tour, ranime une fois.', r: { g: 4000, m: { perle_abyssale: 2, cristal: 5, echo: 1 } } },
  couronne_primordiale: { n: 'Couronne primordiale', slot: 'acc', tier: 4, legend: true, st: { atk: 18, mag: 18 }, mods: { hp: 0.12, atk: 0.12, mag: 0.12, def: 0.12, res: 0.12, spd: 0.12 }, el: { feu: 0.3 }, d: 'Légendaire. Toutes les stats +12%.', r: { g: 5000, m: { flamme_primordiale: 2, seve_eternelle: 1, echo: 3 } } },
  // exclusifs du tableau de chasse
  couronne_gel: { n: 'Couronne gélatineuse', slot: 'acc', tier: 0, hunt: true, st: { hp: 40, res: 6 }, mods: { mpRegen: 2 }, d: 'Chasse. +2 PM par tour.' },
  cape_traqueur: { n: 'Cape du traqueur', slot: 'acc', tier: 0, hunt: true, st: { spd: 5 }, mods: { crit: 6 }, d: 'Chasse. VIT +5, critique +6%.' },
  masque_sporal: { n: 'Masque sporal', slot: 'acc', tier: 0, hunt: true, st: { def: 6, res: 10 }, flags: ['immunePoison'], d: 'Chasse. Immunité au poison et à la brûlure.' },
  lanterne_ames: { n: 'Lanterne des âmes', slot: 'acc', tier: 0, hunt: true, st: { mag: 14, mp: 25 }, mods: { mpRegen: 3 }, d: 'Chasse. MAG +14, +3 PM par tour.' },
  carapace_obsi: { n: 'Carapace d’obsidienne', slot: 'armor', tier: 0, hunt: true, st: { def: 36, res: 14, hp: 70 }, el: { terre: 0.3 }, d: 'Chasse. Résiste à la terre (30%).' },
  plumes_orage: { n: 'Plumes d’orage', slot: 'acc', tier: 0, hunt: true, st: { spd: 8, atk: 8 }, mods: { crit: 8 }, d: 'Chasse. VIT +8, ATQ +8, critique +8%.' },
  ecailles_abyss: { n: 'Écailles abyssales', slot: 'armor', tier: 0, hunt: true, st: { def: 30, res: 30, hp: 90 }, el: { eau: 0.4 }, flags: ['regenAlways'], d: 'Chasse. Résiste à l’eau (40%), régénération.' },
  suaire_royal: { n: 'Suaire royal', slot: 'armor', tier: 0, hunt: true, st: { def: 26, res: 50, mag: 16, mp: 40 }, d: 'Chasse. RÉS et MAG élevées.' },
  coeur_magma: { n: 'Cœur de magma', slot: 'acc', tier: 0, hunt: true, st: { atk: 16, mag: 16 }, flags: ['regenAlways'], el: { feu: 0.25 }, d: 'Chasse. ATQ/MAG +16, régénération.' },
  armure_sans_nom: { n: 'Armure du Sans-Nom', slot: 'armor', tier: 0, hunt: true, st: { def: 50, res: 34, hp: 120, atk: 10 }, d: 'Chasse. L’armure la plus solide du monde.' },
  griffes_lievre: { n: 'Pattes du lièvre-titan', slot: 'acc', tier: 0, hunt: true, st: { spd: 6, hp: 30 }, d: 'Chasse. VIT +6.' },
  voile_liane: { n: 'Voile de liane-mère', slot: 'armor', tier: 0, hunt: true, st: { def: 18, res: 18, hp: 50 }, flags: ['regenAlways'], d: 'Chasse. Régénération.' },
  sceptre_os: { n: 'Couronne d’os', slot: 'acc', tier: 0, hunt: true, st: { mag: 12, atk: 12 }, d: 'Chasse. ATQ/MAG +12.' },
  peau_crapaud: { n: 'Peau du crapaud-roi', slot: 'armor', tier: 0, hunt: true, st: { def: 34, res: 34, hp: 100 }, el: { eau: 0.25 }, d: 'Chasse. Résiste à l’eau.' },
  cornes_seigneur: { n: 'Cornes du seigneur démon', slot: 'acc', tier: 0, hunt: true, st: { atk: 16, mag: 16, spd: 4 }, d: 'Chasse. ATQ/MAG +16.' },
  diademe_celeste: { n: 'Diadème céleste', slot: 'acc', tier: 0, hunt: true, st: { hp: 40 }, mods: { hp: 0.1, atk: 0.1, mag: 0.1, def: 0.1, res: 0.1, spd: 0.1 }, d: 'Chasse. Toutes les stats +10%.' },
  anneau_eternite: { n: 'Anneau d’éternité', slot: 'acc', tier: 0, hunt: true, st: { hp: 60, mp: 30 }, mods: { mpRegen: 5 }, flags: ['autoRevive', 'regenAlways'], d: 'Chasse. Ranime une fois, régénère PV et PM.' },
  couronne: { n: 'Couronne draconique', slot: 'acc', tier: 0, st: { atk: 15, mag: 15, spd: 5 }, mods: { crit: 10 }, d: 'Unique. Trophée du tueur de dragon.' },
  plume_vent: { n: 'Plume de l’orage', slot: 'acc', tier: 0, st: { spd: 8 }, mods: { crit: 6 }, d: 'Unique. VIT +8, critique +6%.' },
};

// ---------------- Outils (collecte) ----------------
G.TOOLS = {
  pioche_bois: { n: 'Pioche en bois', type: 'pick', tier: 1, i: '⛏️', r: { m: { bois: 3 } } },
  pioche_pierre: { n: 'Pioche en pierre', type: 'pick', tier: 2, i: '⛏️', r: { m: { bois: 2, pierre: 3 } } },
  pioche_fer: { n: 'Pioche en fer', type: 'pick', tier: 3, i: '⛏️', r: { m: { bois: 2, lingot: 3 } } },
  hache_pierre: { n: 'Hache en pierre', type: 'axe', tier: 2, i: '🪓', r: { m: { bois: 2, pierre: 3 } } },
  hache_fer: { n: 'Hache en fer', type: 'axe', tier: 3, i: '🪓', r: { m: { bois: 2, lingot: 3 } } },
};
G.REFINE = {
  lingot: { out: 'lingot', q: 1, m: { minerai: 2, bois: 1 } },
  fil: { out: 'fil', q: 1, m: { fibre: 3 } },
  potion: { out: 'potion', q: 1, item: true, m: { herbe: 2, gelee: 1 } },
  friandise: { out: 'friandise', q: 1, item: true, m: { herbe: 1, seve: 1 } },
};

// ---------------- Noeuds de récolte ----------------
G.NODES = {
  arbre: { n: 'Arbre', tool: 'axe', min: 0, hard: 4, loot: [['bois', 2, 3]] },
  vieil_arbre: { n: 'Arbre ancien', tool: 'axe', min: 2, hard: 5, loot: [['boisancien', 1, 2], ['bois', 1, 2]] },
  rocher: { n: 'Rocher', tool: 'pick', min: 1, hard: 4, loot: [['pierre', 2, 3]] },
  fer: { n: 'Filon de fer', tool: 'pick', min: 2, hard: 5, loot: [['minerai', 1, 2], ['pierre', 0, 1]] },
  cristal: { n: 'Gisement de cristal', tool: 'pick', min: 3, hard: 6, loot: [['cristal', 1, 1]] },
  mithril: { n: 'Filon de mithril', tool: 'pick', min: 3, hard: 7, loot: [['mithril', 1, 1]] },
  herbe: { n: 'Buisson d’herbes', tool: null, min: 0, hard: 2, loot: [['herbe', 1, 2]] },
  fibre: { n: 'Hautes herbes', tool: null, min: 0, hard: 2, loot: [['fibre', 2, 3]] },
};

// ---------------- Familiers ----------------
G.FAMS = {
  bulle: { n: 'Bulle', sp: 'Loutre des sources', e: 'eau', tech: 'f_bulle', bonus: { res: 0.1 }, bd: 'RÉS +10%', assist: 'heal', ad: 'Soigne l’allié le plus blessé.' },
  pyron: { n: 'Pyron', sp: 'Salamandre', e: 'feu', tech: 'f_pyron', bonus: { atk: 0.08, mag: 0.08 }, bd: 'ATQ/MAG +8%', assist: 'fire', ad: 'Crache une flammèche.' },
  zephy: { n: 'Zéphy', sp: 'Faucon des cimes', e: 'vent', tech: 'f_zephy', bonus: { spd: 0.1 }, bd: 'VIT +10%', assist: 'peck', ad: 'Pique un ennemi, peut accélérer son maître.' },
  mousse: { n: 'Mousse', sp: 'Tortue moussue', e: 'terre', tech: 'f_mousse', bonus: { def: 0.12 }, bd: 'DÉF +12%', assist: 'shield', ad: 'Protège son maître d’un bouclier.' },
  noctis: { n: 'Noctis', sp: 'Chat du néant', e: null, tech: 'f_noctis', bonus: { crit: 8 }, bd: 'Critique +8%', assist: 'scratch', ad: 'Griffe critique.' },
  lumi: { n: 'Lumi', sp: 'Renard d’aurore', e: null, tech: 'f_lumi', bonus: { hp: 0.1, mag: 0.06 }, bd: 'PV +10%, MAG +6%', assist: 'heal', ad: 'Soigne l’allié le plus blessé. Exclusif aux chasses.' },
};
G.LINK = [0, 30, 60, 100]; // seuils d'affinité

// ---------------- Ennemis ----------------
const _D = (id, ch, a, b) => [id, ch, a || 1, b || a || 1];
G.ENEMIES = {
  gelee: { n: 'Gelée bleue', spr: 'slime', pal: '#4aa8ff', e: 'eau', lvl: 1, hp: 32, atk: 9, mag: 7, def: 4, res: 4, spd: 6, exp: 7, gold: 6, drops: [_D('gelee', 0.6), _D('essence_eau', 0.05)], sk: ['e_tackle', 'e_tackle', 'e_water'] },
  lapin: { n: 'Lapin cornu', spr: 'rabbit', pal: '#d8c7a8', e: null, lvl: 2, hp: 40, atk: 11, mag: 3, def: 5, res: 3, spd: 12, exp: 9, gold: 8, drops: [_D('cuir', 0.5), _D('croc', 0.25)], sk: ['e_tackle', 'e_bite'] },
  corbeau: { n: 'Corbeau', spr: 'bird', pal: '#4a4a6a', e: 'vent', lvl: 2, hp: 34, atk: 10, mag: 8, def: 4, res: 5, spd: 15, exp: 9, gold: 8, drops: [_D('plume', 0.6), _D('essence_vent', 0.05)], sk: ['e_claw', 'e_tackle', 'e_gust'] },
  loup: { n: 'Loup gris', spr: 'wolf', pal: '#8a8f9a', e: null, lvl: 3, hp: 58, atk: 14, mag: 4, def: 6, res: 4, spd: 13, exp: 13, gold: 11, drops: [_D('croc', 0.55), _D('cuir', 0.45)], sk: ['e_bite', 'e_bite', 'e_howl'], tags: ['loup'] },
  champi: { n: 'Champignon', spr: 'mushroom', pal: '#d8443a', e: 'terre', lvl: 4, hp: 72, atk: 13, mag: 13, def: 8, res: 8, spd: 7, exp: 17, gold: 13, drops: [_D('spore', 0.6), _D('herbe', 0.3), _D('essence_terre', 0.06)], sk: ['e_tackle', 'e_spores'] },
  liane: { n: 'Liane carnivore', spr: 'plant', pal: '#4f9a3a', e: 'terre', lvl: 5, hp: 88, atk: 17, mag: 8, def: 9, res: 6, spd: 8, exp: 21, gold: 15, drops: [_D('seve', 0.55), _D('fibre', 0.5, 1, 2)], sk: ['e_bite', 'e_vine'] },
  follet: { n: 'Feu follet', spr: 'wisp', pal: '#ff8a3a', e: 'feu', lvl: 5, hp: 62, atk: 8, mag: 18, def: 6, res: 14, spd: 14, exp: 22, gold: 16, drops: [_D('braise', 0.65), _D('essence_feu', 0.08)], sk: ['e_fire', 'e_fire', 'e_tackle'] },
  loupb: { n: 'Loup des bois', spr: 'wolf', pal: '#4f7a4a', e: 'vent', lvl: 6, hp: 98, atk: 20, mag: 6, def: 9, res: 6, spd: 16, exp: 26, gold: 17, drops: [_D('croc', 0.55), _D('cuir', 0.5), _D('essence_vent', 0.06)], sk: ['e_bite', 'e_claw', 'e_howl'], tags: ['loup'] },
  chauve: { n: 'Chauve-souris', spr: 'bat', pal: '#6a4a8a', e: 'vent', lvl: 7, hp: 92, atk: 21, mag: 14, def: 10, res: 10, spd: 19, exp: 30, gold: 19, drops: [_D('aile', 0.55), _D('essence_vent', 0.08)], sk: ['e_bite', 'e_drain', 'e_gust'] },
  squelette: { n: 'Squelette', spr: 'skeleton', pal: '#e8e2d0', e: null, lvl: 8, hp: 135, atk: 25, mag: 8, def: 14, res: 10, spd: 11, exp: 38, gold: 25, drops: [_D('os', 0.6), _D('lingot', 0.12)], sk: ['e_slash', 'e_slash', 'e_smash'] },
  salamandre: { n: 'Salamandre', spr: 'lizard', pal: '#ff6a2a', e: 'feu', lvl: 8, hp: 122, atk: 22, mag: 21, def: 12, res: 12, spd: 14, exp: 40, gold: 27, drops: [_D('braise', 0.5), _D('ecaille', 0.35), _D('essence_feu', 0.1)], sk: ['e_bite', 'e_fire'], tame: 'pyron' },
  golem: { n: 'Golem de pierre', spr: 'golem', pal: '#9a948a', e: 'terre', lvl: 9, hp: 210, atk: 27, mag: 6, def: 28, res: 8, spd: 6, exp: 48, gold: 32, drops: [_D('pierre', 0.8, 2, 3), _D('minerai', 0.5), _D('essence_terre', 0.12)], sk: ['e_rock', 'e_smash'] },
  geleet: { n: 'Gelée toxique', spr: 'slime', pal: '#a14ad8', e: 'eau', lvl: 10, hp: 155, atk: 25, mag: 23, def: 14, res: 14, spd: 9, exp: 50, gold: 31, drops: [_D('gelee', 0.6, 1, 2), _D('spore', 0.3), _D('essence_eau', 0.1)], sk: ['e_toxic', 'e_water'] },
  crapaud: { n: 'Crapaud géant', spr: 'toad', pal: '#5a8a3a', e: 'eau', lvl: 11, hp: 215, atk: 30, mag: 22, def: 16, res: 12, spd: 10, exp: 57, gold: 35, drops: [_D('ecaille', 0.5), _D('gelee', 0.3)], sk: ['e_tackle', 'e_water', 'e_bite'] },
  spectre: { n: 'Spectre', spr: 'ghost', pal: '#b8d8ff', e: null, lvl: 11, hp: 150, atk: 16, mag: 31, def: 10, res: 32, spd: 14, exp: 60, gold: 39, drops: [_D('ectoplasme', 0.6)], sk: ['e_curse', 'e_drain', 'e_drain'] },
  serpent: { n: 'Serpent des marais', spr: 'snake', pal: '#3a9a8a', e: 'eau', lvl: 12, hp: 195, atk: 34, mag: 14, def: 16, res: 14, spd: 17, exp: 62, gold: 41, drops: [_D('ecaille', 0.6), _D('essence_eau', 0.1)], sk: ['e_venom', 'e_bite'] },
  diablotin: { n: 'Diablotin', spr: 'imp', pal: '#d83a3a', e: 'feu', lvl: 14, hp: 225, atk: 31, mag: 39, def: 18, res: 22, spd: 18, exp: 82, gold: 56, drops: [_D('braise', 0.6), _D('essence_feu', 0.15)], sk: ['e_fire', 'e_flames', 'e_claw'] },
  drake: { n: 'Drake', spr: 'lizard', pal: '#8a1f2a', e: 'feu', lvl: 16, hp: 340, atk: 47, mag: 37, def: 26, res: 22, spd: 17, exp: 108, gold: 72, drops: [_D('ecaille', 0.5), _D('essence_feu', 0.15)], sk: ['e_bite', 'e_breath', 'e_claw'] },
  golemm: { n: 'Golem de magma', spr: 'golem', pal: '#c8482a', e: 'feu', lvl: 16, hp: 430, atk: 45, mag: 20, def: 42, res: 18, spd: 7, exp: 112, gold: 72, drops: [_D('minerai', 0.5, 1, 2), _D('braise', 0.5), _D('cristal', 0.25)], sk: ['e_rock', 'e_flames', 'e_smash'] },
  chevalier: { n: 'Chevalier déchu', spr: 'knight', pal: '#4a4a5a', e: null, lvl: 17, hp: 390, atk: 51, mag: 20, def: 35, res: 26, spd: 13, exp: 122, gold: 82, drops: [_D('os', 0.4), _D('lingot', 0.4, 1, 2), _D('mithril', 0.08)], sk: ['e_slash', 'e_smash', 'e_slash'] },
  // ----- Gardiens -----
  sylvaros: { n: 'Sylvaros, Ent corrompu', spr: 'ent', pal: '#5a7a3a', e: 'terre', lvl: 8, hp: 950, atk: 29, mag: 24, def: 18, res: 14, spd: 8, exp: 320, gold: 400, boss: true, dmgMul: 1.2, drops: [_D('coeur_sylve', 1), _D('echo', 1, 2), _D('boisancien', 1, 3)], sk: ['e_roots', 'e_crush', 'e_crush', 'e_regrow'] },
  wyverne: { n: 'Wyverne Tempête', spr: 'wyvern', pal: '#4a8aa8', e: 'vent', lvl: 12, hp: 2100, atk: 41, mag: 38, def: 24, res: 22, spd: 19, exp: 650, gold: 800, boss: true, dmgMul: 1.3, drops: [_D('plume_tempete', 1), _D('echo', 1, 2), _D('essence_vent', 1, 3)], sk: ['e_cyclone', 'e_dive', 'e_dive', 'e_shriek'] },
  hydre: { n: 'Hydre des Brumes', spr: 'hydra', pal: '#3a7a8a', e: 'eau', lvl: 15, hp: 3200, atk: 45, mag: 47, def: 28, res: 30, spd: 15, exp: 950, gold: 1200, boss: true, dmgMul: 1.35, drops: [_D('larme_hydre', 1), _D('echo', 1, 2), _D('essence_eau', 1, 3)], sk: ['e_tidal', 'e_hvenom', 'e_hbite', 'e_hbite'] },
  ignar: { n: 'Ignar, Dragon des Cendres', spr: 'dragon', pal: '#a82a1a', e: 'feu', lvl: 21, hp: 6200, atk: 63, mag: 62, def: 38, res: 36, spd: 21, exp: 3200, gold: 5000, boss: true, dmgMul: 1.4, drops: [_D('ecaille_ignar', 1), _D('echo', 1, 3)], sk: ['e_inferno', 'e_dclaw', 'e_dclaw', 'e_roar', 'e_meteor'] },
};


// ---------------- Monstres d'élite du tableau de chasse ----------------
// statistiques calculées à partir du niveau ; rôle : tank, rapide, mage, brute ; premium = boss de région
const _EL = (o) => Object.assign({ boss: true, elite: true, big: true }, o);
G.eliteStats = (lvl, role, prem) => {
  const R = { tank: [1.25, 0.95, 0.7, 1.5, 0.9, 0.8], fast: [0.85, 1.05, 0.9, 0.85, 0.9, 1.4], mage: [0.9, 0.7, 1.25, 0.8, 1.4, 1.0], brute: [1.05, 1.2, 0.8, 1.0, 0.9, 0.95] }[role || 'brute'];
  const P = prem ? 1.85 : 1;
  return {
    hp: Math.round(62 * Math.pow(lvl, 1.42) * R[0] * P), atk: Math.round(3.25 * lvl * R[1]), mag: Math.round(3.25 * lvl * R[2]),
    def: Math.round(2.1 * lvl * R[3]), res: Math.round(2.0 * lvl * R[4]), spd: Math.round((9 + lvl * 0.55) * R[5]),
    exp: Math.round(9 * Math.pow(lvl, 1.85) * (prem ? 2.2 : 1)), gold: Math.round(7 * Math.pow(lvl, 1.75) * (prem ? 2 : 1)),
    dmgMul: Math.min(2.1, 1.05 + lvl * 0.028 + (prem ? Math.max(0.12, 0.62 - lvl * 0.016) : 0)), lvl,
  };
};
const _H = (lvl, role, prem, o) => _EL(Object.assign(G.eliteStats(lvl, role, prem), o, { premium: !!prem }));
Object.assign(G.ENEMIES, {
  // Plaines
  roi_gelee: _H(5, 'tank', 0, { n: '★ Roi Gelée', spr: 'slime', pal: '#ffc830', e: 'eau', drops: [_D('gelee', 1, 3, 5)], sk: ['e_tackle', 'e_water', 'e_toxic', 'e_heal'] }),
  lievre_titan: _H(6, 'fast', 0, { n: '★ Lièvre-titan', spr: 'rabbit', pal: '#a8784a', e: 'terre', drops: [_D('cuir', 1, 3, 4), _D('croc', 1, 2, 3)], sk: ['e_tackle', 'e_bite', 'e_rock', 'e_howl'] }),
  croc_blanc: _H(7, 'fast', 0, { n: '★ Croc-Blanc, l’alpha', spr: 'wolf', pal: '#e8f0ff', e: 'vent', drops: [_D('croc', 1, 3, 5), _D('cuir', 1, 2, 3)], sk: ['e_bite', 'e_claw', 'e_howl', 'e_gust'] }),
  seigneur_corbeau: _H(11, 'mage', 1, { n: '♛ Seigneur des corbeaux', spr: 'bird', pal: '#3a2a5a', e: 'vent', big: true, drops: [_D('plume', 1, 6, 9), _D('essence_vent', 1, 2, 3)], sk: ['e_cyclone', 'e_dive', 'e_shriek', 'e_claw'] }),
  // Forêt
  reine_spore: _H(10, 'mage', 0, { n: '★ Reine des spores', spr: 'mushroom', pal: '#b040e0', e: 'terre', drops: [_D('spore', 1, 4, 6)], sk: ['e_spores', 'e_spores', 'e_drain', 'e_heal'] }),
  liane_mere: _H(11, 'tank', 0, { n: '★ Liane-mère', spr: 'plant', pal: '#2a8a3a', e: 'terre', drops: [_D('seve', 1, 3, 5), _D('fibre', 1, 4, 6)], sk: ['e_vine', 'e_roots', 'e_bite', 'e_spores'] }),
  follet_ancien: _H(12, 'mage', 0, { n: '★ Feu-Fol ancestral', spr: 'wisp', pal: '#5ad8ff', e: 'feu', drops: [_D('braise', 1, 4, 6), _D('essence_feu', 1, 1, 2)], sk: ['e_fire', 'e_flames', 'e_inferno'] }),
  ent_ancestral: _H(15, 'tank', 1, { n: '♛ Ent ancestral', spr: 'ent', pal: '#2a6a5a', e: 'terre', big: false, drops: [_D('boisancien', 1, 4, 6), _D('essence_terre', 1, 2, 3)], sk: ['e_roots', 'e_crush', 'e_crush', 'e_spores'] }),
  // Monts
  harpie: _H(15, 'fast', 0, { n: '★ Harpie tonnerre', spr: 'bird', pal: '#f0d040', e: 'vent', drops: [_D('plume', 1, 5, 8), _D('essence_vent', 1, 2, 3)], sk: ['e_dive', 'e_cyclone', 'e_shriek', 'e_claw'] }),
  roi_squelette: _H(16, 'brute', 0, { n: '★ Roi squelette', spr: 'skeleton', pal: '#e8e0c0', e: null, drops: [_D('os', 1, 4, 6), _D('lingot', 1, 2, 4)], sk: ['e_slash', 'e_smash', 'e_curse', 'e_slash'] }),
  golem_obsi: _H(17, 'tank', 0, { n: '★ Golem d’obsidienne', spr: 'golem', pal: '#3a3050', e: 'terre', drops: [_D('cristal', 1, 2, 3), _D('minerai', 1, 4, 6)], sk: ['e_rock', 'e_smash', 'e_crush'] }),
  wyrm: _H(21, 'brute', 1, { n: '♛ Wyrm primordial', spr: 'wyvern', pal: '#d8e0ff', e: 'vent', big: false, drops: [_D('echo', 1, 1, 1), _D('cristal', 1, 3, 4)], sk: ['e_cyclone', 'e_dive', 'e_meteor', 'e_shriek'] }),
  // Marais
  leviathan: _H(20, 'brute', 0, { n: '★ Léviathan des tourbières', spr: 'snake', pal: '#1a5a7a', e: 'eau', drops: [_D('ecaille', 1, 4, 6), _D('essence_eau', 1, 2, 3)], sk: ['e_tidal', 'e_venom', 'e_hbite'] }),
  crapaud_roi: _H(21, 'tank', 0, { n: '★ Crapaud-roi', spr: 'toad', pal: '#8a6a2a', e: 'eau', drops: [_D('ecaille', 1, 3, 5), _D('gelee', 1, 4, 6)], sk: ['e_water', 'e_tidal', 'e_bite', 'e_toxic'] }),
  spectre_roi: _H(22, 'mage', 0, { n: '★ Spectre-Roi', spr: 'ghost', pal: '#ffd86a', e: null, drops: [_D('ectoplasme', 1, 4, 6)], sk: ['e_drain', 'e_curse', 'e_tidal', 'e_shriek'] }),
  hydre_origine: _H(24, 'brute', 1, { n: '♛ Hydre originelle', spr: 'hydra', pal: '#c88aff', e: 'eau', big: false, drops: [_D('echo', 1, 1, 2), _D('ecaille', 1, 5, 8)], sk: ['e_tidal', 'e_hvenom', 'e_hbite', 'e_hbite', 'e_meteor'] }),
  // Volcan
  behemoth: _H(25, 'tank', 0, { n: '★ Béhémoth de magma', spr: 'golem', pal: '#ff3a1a', e: 'feu', drops: [_D('mithril', 1, 1, 2), _D('braise', 1, 5, 8)], sk: ['e_rock', 'e_inferno', 'e_dclaw', 'e_roar'] }),
  seigneur_demon: _H(26, 'mage', 0, { n: '★ Seigneur diablotin', spr: 'imp', pal: '#8a1a3a', e: 'feu', drops: [_D('braise', 1, 5, 7), _D('essence_feu', 1, 2, 4)], sk: ['e_inferno', 'e_fire', 'e_meteor', 'e_curse'] }),
  chevalier_noir: _H(27, 'brute', 0, { n: '★ Chevalier sans nom', spr: 'knight', pal: '#1a1a2a', e: null, drops: [_D('mithril', 1, 2, 3), _D('lingot', 1, 4, 6)], sk: ['e_slash', 'e_smash', 'e_dclaw', 'e_roar'] }),
  dragon_noir: _H(29, 'brute', 1, { n: '♛ Dragon d’obsidienne', spr: 'dragon', pal: '#2a1a3a', e: 'feu', big: false, drops: [_D('echo', 1, 2, 3), _D('mithril', 1, 2, 4)], sk: ['e_inferno', 'e_dclaw', 'e_meteor', 'e_roar', 'e_dclaw'] }),
});
// Traque infinie : un primordial dont la puissance augmente à chaque victoire
G.makeInfinite = n => {
  const sp = ['dragon', 'hydra', 'wyvern', 'ent'][n % 4], pal = ['#ff4a8a', '#4affd8', '#ffd040', '#8a4aff'][n % 4];
  G.ENEMIES.primordial = _EL({
    n: `★ Primordial — vague ${n + 1}`, spr: sp, pal, e: G.ELEM_ORDER[n % 4], lvl: 24 + 3 * n, big: false,
    hp: 9000 + 2600 * n, atk: 70 + 6 * n, mag: 70 + 6 * n, def: 45 + 3 * n, res: 45 + 3 * n, spd: 22 + n,
    exp: 4000 + 900 * n, gold: 3000 + 600 * n, dmgMul: 1.8 + 0.05 * n, drops: [_D('mithril', 1, 1, 3)],
    sk: ['e_meteor', 'e_inferno', 'e_tidal', 'e_cyclone', 'e_dclaw', 'e_roar'],
  });
  return 'primordial';
};

// ---------------- Tableau de chasse ----------------
G.HUNT_RANKS = [
  { r: 'D', pts: 0, b: 'Contrats des Plaines.' },
  { r: 'C', pts: 4, b: 'Contrats de la Forêt. EXP +5%.' },
  { r: 'B', pts: 12, b: 'Contrats des Monts. Or +10%.' },
  { r: 'A', pts: 26, b: 'Contrats du Marais. Butin +25%.' },
  { r: 'S', pts: 44, b: 'Contrats du Volcan. EXP +10%, or +20%. Traque infinie.' },
];
// 4 chasses par région : 3 standard (une par sous-zone) puis une premium (après les 3 autres, répétable)
G.ZONE_RANK = { plaines: 'D', foret: 'C', montagne: 'B', marais: 'A', volcan: 'S' };
G.PREMIUM_LOOT = { plaines: 'plume_aurore', foret: 'seve_eternelle', montagne: 'coeur_cristal', marais: 'perle_abyssale', volcan: 'flamme_primordiale' };
G.HUNTS = [
  { id: 'pl1', zone: 'plaines', sub: 0, t: 'roi_gelee', pts: 2, n: 'Le Roi Gelée', d: 'Une gelée dorée grosse comme une charrette dévore les récoltes.', rw: { g: 300, armor: 'couronne_gel', mats: { trophee: 1 } } },
  { id: 'pl2', zone: 'plaines', sub: 1, t: 'lievre_titan', pts: 2, n: 'Le Lièvre-titan', d: 'Un lièvre aussi grand qu’un cheval laboure les champs à coups de cornes.', rw: { g: 320, armor: 'griffes_lievre', mats: { trophee: 1 } } },
  { id: 'pl3', zone: 'plaines', sub: 2, t: 'croc_blanc', pts: 2, n: 'Croc-Blanc, l’alpha', d: 'Le chef de meute des loups gris rôde dans les collines.', rw: { g: 350, armor: 'cape_traqueur', mats: { trophee: 1 } } },
  { id: 'plP', zone: 'plaines', premium: true, t: 'seigneur_corbeau', pts: 4, n: 'Le Seigneur des corbeaux', d: 'Quand les trois fléaux des plaines tombent, leur maître ailé descend des nuées.', rw: { g: 900, mats: { plume_aurore: 3, trophee: 2 }, items: { megalixir: 1 } }, rep: { g: 400, mats: { plume_aurore: 2 } } },
  { id: 'fo1', zone: 'foret', sub: 0, t: 'reine_spore', pts: 3, n: 'La Reine des spores', d: 'Ses spores empoisonnent tout un pan de la forêt.', rw: { g: 600, armor: 'masque_sporal', mats: { trophee: 1 }, items: { hipotion: 3 } } },
  { id: 'fo2', zone: 'foret', sub: 1, t: 'liane_mere', pts: 3, n: 'La Liane-mère', d: 'Une liane colossale étouffe les arbres un à un.', rw: { g: 620, armor: 'voile_liane', mats: { trophee: 1 } } },
  { id: 'fo3', zone: 'foret', sub: 2, t: 'follet_ancien', pts: 3, n: 'Le Feu-Fol ancestral', d: 'Une flamme bleue millénaire égare les voyageurs.', rw: { g: 650, armor: 'lanterne_ames', mats: { trophee: 1 } } },
  { id: 'foP', zone: 'foret', premium: true, t: 'ent_ancestral', pts: 5, n: 'L’Ent ancestral', d: 'Le plus vieil arbre de Sylve s’éveille quand la forêt est purgée de ses fléaux.', rw: { g: 1600, mats: { seve_eternelle: 3, trophee: 2 }, items: { megalixir: 1 } }, rep: { g: 700, mats: { seve_eternelle: 2 } } },
  { id: 'mo1', zone: 'montagne', sub: 0, t: 'harpie', pts: 4, n: 'La Harpie tonnerre', d: 'Elle fond sur les caravanes depuis les crêtes.', rw: { g: 1000, armor: 'plumes_orage', mats: { trophee: 2 } } },
  { id: 'mo2', zone: 'montagne', sub: 1, t: 'roi_squelette', pts: 4, n: 'Le Roi squelette', d: 'Un roi mort-vivant règne sur les ruines enneigées.', rw: { g: 1000, armor: 'sceptre_os', mats: { trophee: 2 } } },
  { id: 'mo3', zone: 'montagne', sub: 2, t: 'golem_obsi', pts: 4, n: 'Le Golem d’obsidienne', d: 'Un golem de verre noir garde les gisements de cristal.', rw: { g: 1050, armor: 'carapace_obsi', mats: { trophee: 2 }, items: { megalixir: 1 } } },
  { id: 'moP', zone: 'montagne', premium: true, t: 'wyrm', pts: 6, n: 'Le Wyrm primordial', d: 'Un dragon blanc plus ancien qu’Ignar se réveille quand les monts sont pacifiés.', rw: { g: 2600, mats: { coeur_cristal: 3, trophee: 3, ame: 1 } }, rep: { g: 1000, mats: { coeur_cristal: 2 } } },
  { id: 'ma1', zone: 'marais', sub: 0, t: 'leviathan', pts: 5, n: 'Le Léviathan des tourbières', d: 'Un serpent colossal hante les tourbières.', rw: { g: 1500, armor: 'ecailles_abyss', mats: { trophee: 2 }, items: { megalixir: 1 } } },
  { id: 'ma2', zone: 'marais', sub: 1, t: 'crapaud_roi', pts: 5, n: 'Le Crapaud-roi', d: 'Son coassement fait trembler les saules du bayou.', rw: { g: 1500, armor: 'peau_crapaud', mats: { trophee: 2 } } },
  { id: 'ma3', zone: 'marais', sub: 2, t: 'spectre_roi', pts: 5, n: 'Le Spectre-Roi', d: 'Un roi déchu erre dans les brumes. Un renard de lumière veille sur son trésor.', rw: { g: 1800, armor: 'suaire_royal', fam: 'lumi', mats: { trophee: 3 } } },
  { id: 'maP', zone: 'marais', premium: true, t: 'hydre_origine', pts: 7, n: 'L’Hydre originelle', d: 'La mère de toutes les hydres remonte des profondeurs quand le marais est libéré.', rw: { g: 3500, mats: { perle_abyssale: 3, trophee: 4, ame: 1 }, items: { megalixir: 2 } }, rep: { g: 1400, mats: { perle_abyssale: 2 } } },
  { id: 'vo1', zone: 'volcan', sub: 0, t: 'behemoth', pts: 6, n: 'Le Béhémoth de magma', d: 'Le sol tremble sous ses pas dans les champs de cendres.', rw: { g: 2200, armor: 'coeur_magma', mats: { trophee: 3, ame: 1 } } },
  { id: 'vo2', zone: 'volcan', sub: 1, t: 'seigneur_demon', pts: 6, n: 'Le Seigneur diablotin', d: 'Il nage dans les coulées de lave et commande aux diablotins.', rw: { g: 2300, armor: 'cornes_seigneur', mats: { trophee: 3 } } },
  { id: 'vo3', zone: 'volcan', sub: 2, t: 'chevalier_noir', pts: 6, n: 'Le Chevalier sans nom', d: 'Un guerrier sans visage défie quiconque ose fouler la caldeira.', rw: { g: 2400, armor: 'armure_sans_nom', mats: { trophee: 3, ame: 1 }, items: { megalixir: 2 } } },
  { id: 'voP', zone: 'volcan', premium: true, t: 'dragon_noir', pts: 8, n: 'Le Dragon d’obsidienne', d: 'Le dernier des dragons primordiaux sort de la caldeira quand ses gardes sont tombés.', rw: { g: 5000, armor: 'diademe_celeste', mats: { flamme_primordiale: 3, trophee: 5, ame: 2 }, items: { megalixir: 3 } }, rep: { g: 2000, mats: { flamme_primordiale: 2 } } },
];
G.HUNTS.forEach(h => { h.rank = G.ZONE_RANK[h.zone]; });
// anciens identifiants (sauvegardes) -> nouveaux
G.HUNT_OLD = { h1: 'pl1', h2: 'pl3', h3: 'fo1', h4: 'fo3', h5: 'mo3', h6: 'mo1', h7: 'ma1', h8: 'ma3', h9: 'vo1', h10: 'vo3', h11: 'moP', h12: 'maP' };
G.HUNT_INF = { id: 'inf', rank: 'S', zone: 'plaines', n: 'Traque infinie', d: 'Une faille primordiale s’est ouverte au sud des plaines. Chaque victoire en fait surgir un adversaire plus puissant.' };
G.infReward = n => ({ g: 3000 + 600 * n, mats: { ame: 1, trophee: 2, echo: 1 }, items: n % 2 ? { megalixir: 1 } : {}, armor: n === 2 ? 'anneau_eternite' : undefined });

// ---------------- Zones ----------------
G.ZONES = {
  plaines: { n: 'Plaines d’Aube', lv: 'Niv. 1 à 4', lmin: 1, lmax: 4, boss: null, rate: 0.05, bg: 'plains', mus: 'field', groups: [['gelee'], ['gelee', 'gelee'], ['lapin', 'gelee'], ['loup'], ['corbeau', 'corbeau'], ['loup', 'lapin'], ['gelee', 'corbeau', 'gelee'], ['lapin', 'lapin']] },
  foret: { n: 'Forêt de Sylve', lv: 'Niv. 4 à 8', lmin: 4, lmax: 8, boss: 'sylvaros', rate: 0.06, bg: 'forest', mus: 'field', groups: [['champi', 'champi'], ['liane'], ['loupb', 'champi'], ['follet', 'follet'], ['liane', 'follet'], ['loupb', 'loupb'], ['champi', 'liane', 'follet']] },
  montagne: { n: 'Monts Grisés', lv: 'Niv. 7 à 11', lmin: 7, lmax: 11, boss: 'wyverne', rate: 0.062, bg: 'mountain', mus: 'field', groups: [['chauve', 'chauve'], ['golem'], ['squelette', 'chauve'], ['salamandre'], ['squelette', 'squelette'], ['golem', 'salamandre'], ['chauve', 'salamandre', 'chauve']] },
  marais: { n: 'Marais Brumeux', lv: 'Niv. 10 à 14', lmin: 10, lmax: 14, boss: 'hydre', rate: 0.065, bg: 'swamp', mus: 'field', groups: [['geleet', 'geleet'], ['crapaud'], ['spectre', 'geleet'], ['serpent', 'crapaud'], ['spectre', 'spectre'], ['serpent', 'geleet', 'spectre']] },
  volcan: { n: 'Volcan Cendreux', lv: 'Niv. 14 à 18', lmin: 14, lmax: 18, boss: 'ignar', rate: 0.07, bg: 'volcano', mus: 'field', groups: [['diablotin', 'diablotin'], ['drake'], ['golemm'], ['chevalier', 'diablotin'], ['drake', 'diablotin'], ['chevalier', 'golemm']] },
  bourg: { n: 'Bourg-Aube', lv: 'Village', rate: 0, town: true },
  havre: { n: 'Havre', lv: 'Votre ville', rate: 0, town: true },
};

G.ZONE_ORDER = ['plaines', 'foret', 'montagne', 'marais', 'volcan'];
// matériaux typiques gagnés en combat dans chaque région (chance croissante avec la profondeur)
G.ZONE_LOOT = {
  plaines: [['fibre', 2, 4], ['herbe', 1, 3], ['cuir', 1, 2], ['plume', 1, 2]],
  foret: [['boisancien', 1, 2], ['seve', 1, 2], ['spore', 1, 3], ['herbe', 2, 3]],
  montagne: [['minerai', 2, 4], ['cristal', 1, 1], ['pierre', 3, 5], ['essence_terre', 1, 1]],
  marais: [['ecaille', 2, 3], ['ectoplasme', 1, 2], ['essence_eau', 1, 1], ['cristal', 1, 1]],
  volcan: [['braise', 2, 4], ['mithril', 1, 1], ['cristal', 1, 2], ['essence_feu', 1, 1]],
};
// contenu des coffres générés dans chaque région (les coffres profonds ajoutent un objet rare)
G.CHEST_LOOT = {
  plaines: { n: 12, g: [60, 140], items: [['potion', 2], ['ether', 1], ['remede', 2], ['appat', 1], ['friandise', 2]], mats: [['fibre', 3, 5], ['herbe', 2, 4], ['lingot', 1, 2], ['cuir', 2, 3]], rare: [['hipotion', 1], ['essence_terre', 1], ['essence_vent', 1]] },
  foret: { n: 9, g: [120, 220], items: [['potion', 3], ['hipotion', 1], ['remede', 2], ['friandise', 2]], mats: [['boisancien', 1, 2], ['spore', 2, 3], ['seve', 2, 3], ['braise', 2, 2]], rare: [['festin', 1], ['essence_vent', 1], ['essence_feu', 1]] },
  montagne: { n: 9, g: [200, 350], items: [['hipotion', 1], ['ether', 2], ['phenix', 1]], mats: [['minerai', 3, 5], ['cristal', 1, 2], ['os', 2, 3], ['aile', 2, 3]], rare: [['essence_terre', 2], ['cristal', 2], ['festin', 1]] },
  marais: { n: 8, g: [300, 480], items: [['hipotion', 2], ['phenix', 1], ['ether', 2]], mats: [['ecaille', 2, 3], ['ectoplasme', 1, 2], ['gelee', 3, 4]], rare: [['essence_eau', 2], ['festin', 1], ['phenix', 1]] },
  volcan: { n: 7, g: [450, 700], items: [['hipotion', 3], ['phenix', 1], ['ether', 3]], mats: [['mithril', 1, 1], ['cristal', 2, 3], ['braise', 3, 5]], rare: [['elixir', 1], ['essence_feu', 2], ['mithril', 1]] },
};

// ---------------- Sous-zones (3 par région) ----------------
// tint : teinte du sol [r, g, b, force] ; trees : essences ; deco : décor favori ; terrain : densité du relief propre
G.SUBZONES = {
  plaines: [
    { n: 'Prairies dorées', tint: [222, 192, 92, 0.2], trees: ['plain', 'autumn', 'plain'], deco: 'tuft' },
    { n: 'Vallée verdoyante', tint: [40, 150, 80, 0.16], trees: ['plain', 'fruit', 'birch'], deco: 'bush' },
    { n: 'Collines fleuries', tint: [235, 120, 175, 0.1], trees: ['cherry', 'plain', 'cherry'], deco: 'flowers' },
  ],
  foret: [
    { n: 'Bois-Clair', tint: [160, 210, 90, 0.18], trees: ['birch', 'birch', 'plain', 'forest'], deco: 'flowers' },
    { n: 'Sylve profonde', tint: [10, 50, 55, 0.28], trees: ['giant', 'forest', 'pine', 'forest'], deco: 'mushroom', terrain: 0.52 },
    { n: 'Forêt d’automne', tint: [205, 110, 40, 0.22], trees: ['autumn', 'autumn', 'forest', 'birch'], deco: 'leaves' },
  ],
  montagne: [
    { n: 'Contreforts', tint: [150, 108, 64, 0.22], trees: ['pine'], deco: 'pebbles' },
    { n: 'Pics enneigés', tint: [240, 244, 255, 0.36], trees: ['snowpine'], deco: 'gravel', terrain: 0.54 },
    { n: 'Gorges cristallines', tint: [80, 150, 225, 0.22], trees: ['snowpine', 'pine'], deco: 'shard' },
  ],
  marais: [
    { n: 'Tourbières', tint: [120, 96, 44, 0.22], trees: ['swamp'], deco: 'puddle' },
    { n: 'Bayou des saules', tint: [60, 145, 95, 0.2], trees: ['willow', 'willow', 'swamp'], deco: 'reeds', terrain: 0.55 },
    { n: 'Marais spectral', tint: [125, 75, 175, 0.28], trees: ['swamp'], deco: 'bones' },
  ],
  volcan: [
    { n: 'Champs de cendres', tint: [130, 120, 120, 0.22], trees: ['volcano'], deco: 'gravel' },
    { n: 'Coulées de lave', tint: [255, 95, 30, 0.2], trees: ['volcano'], deco: 'vent', terrain: 0.6 },
    { n: 'Caldeira d’obsidienne', tint: [75, 30, 115, 0.28], trees: ['volcano'], deco: 'shard' },
  ],
};

// ---------------- Bâtiments du Havre ----------------
G.BUILDINGS = {
  forge: {
    n: 'Forge', i: '⚒️', npc: 'dorn', max: 4, d: 'Permet de forger des armes de rang supérieur.',
    eff: l => `Rang d’arme max : ${l + 1}`,
    cost: [{ g: 200, m: { bois: 10, pierre: 10 } }, { g: 600, m: { lingot: 6, pierre: 15 } }, { g: 1500, m: { lingot: 12, cristal: 4 } }, { g: 3000, m: { mithril: 6, cristal: 8 } }],
  },
  atelier: {
    n: 'Atelier', i: '🧶', npc: 'mira', max: 3, d: 'Débloque les armures et accessoires de rang supérieur.',
    eff: l => `Rang d’armure max : ${l + 1}`,
    cost: [{ g: 200, m: { bois: 8, fibre: 10 } }, { g: 600, m: { fil: 8, cuir: 6 } }, { g: 1500, m: { fil: 12, cristal: 3 } }],
  },
  marche: {
    n: 'Marché', i: '🏪', npc: 'pell', max: 3, d: 'Ouvre une boutique au Havre, de plus en plus fournie.',
    eff: l => ['Boutique : objets avancés', 'Essences et cristaux, -10%', 'Mithril, -20%'][l - 1] || '',
    cost: [{ g: 300, m: { bois: 12, pierre: 6 } }, { g: 800, m: { lingot: 6, bois: 15 } }, { g: 2000, m: { cristal: 4, boisancien: 6 } }],
  },
  menagerie: {
    n: 'Ménagerie', i: '🐾', npc: 'yuna', max: 3, d: 'Augmente le niveau maximal et l’EXP des familiers.',
    eff: l => `Niveau max des familiers : ${[3, 6, 8, 10][l]}, EXP +${l * 25}%`,
    cost: [{ g: 250, m: { bois: 10, fibre: 8 } }, { g: 700, m: { boisancien: 4, cuir: 6 } }, { g: 1600, m: { boisancien: 8, cristal: 2 } }],
  },
  herboristerie: {
    n: 'Herboristerie', i: '🌿', npc: 'fen', max: 3, d: 'Produit des potions et des herbes après chaque combat.',
    eff: l => `Production : ${l} lot(s) de potions / 3 combats`,
    cost: [{ g: 250, m: { bois: 8, herbe: 6 } }, { g: 700, m: { boisancien: 3, seve: 4 } }, { g: 1500, m: { boisancien: 6, cristal: 2 } }],
  },
  mine: {
    n: 'Mine', i: '⛏️', npc: 'grom', max: 3, d: 'Produit du minerai et de la pierre (et du cristal au niveau 3).',
    eff: l => `Production : ${l * 2} minerai / 3 combats${l >= 3 ? ' + cristal' : ''}`,
    cost: [{ g: 300, m: { bois: 12, pierre: 12 } }, { g: 800, m: { lingot: 6, bois: 10 } }, { g: 1800, m: { lingot: 10, mithril: 2 } }],
  },
  taverne: {
    n: 'Taverne', i: '🍺', npc: 'lise', max: 3, d: 'Repos gratuit au Havre et bonus d’expérience.',
    eff: l => `EXP +${l * 5}%, repos gratuit`,
    cost: [{ g: 300, m: { bois: 15, pierre: 5 } }, { g: 800, m: { boisancien: 4, lingot: 4 } }, { g: 1800, m: { boisancien: 8, cristal: 3 } }],
  },
  remparts: {
    n: 'Remparts', i: '🏰', npc: null, req: 4, max: 3, d: 'Protège le Havre et attire les marchands : or bonus après chaque combat.',
    eff: l => `+${l * 15} or par combat gagné`,
    cost: [{ g: 800, m: { pierre: 30, lingot: 6 } }, { g: 1800, m: { pierre: 40, lingot: 10 } }, { g: 3500, m: { mithril: 4, pierre: 50 } }],
  },
};
G.BUILD_ORDER = ['forge', 'atelier', 'marche', 'menagerie', 'herboristerie', 'mine', 'taverne', 'remparts'];

// ---------------- PNJ recrutables ----------------
G.NPCS = {
  dorn: { n: 'Dorn', job: 'Forgeron', b: 'forge', pal: { H: '#2a2a2a', C: '#6a4a3a', D: '#3a2a20', B: '#222', L: '#c8a050' }, ask: 'Apporte-moi 6 minerais de fer et je forgerai pour ton Havre.', cond: S => [Math.min(S.mats.minerai || 0, 6), 6], pay: { m: { minerai: 6 } } },
  mira: { n: 'Mira', job: 'Tisseuse', b: 'atelier', pal: { H: '#d84a8a', C: '#8a3a9a', D: '#5a2a6a', B: '#3a2a3a', L: '#ffd0e8' }, ask: 'Les loups dévorent mes moutons ! Abats-en 6 et je te suivrai.', cond: S => [Math.min(S.stats.tags.loup || 0, 6), 6] },
  pell: { n: 'Pell', job: 'Marchand', b: 'marche', pal: { H: '#c8a040', C: '#3a8a4a', D: '#24582e', B: '#5a3a22', L: '#ffe08a' }, ask: 'Un nouveau marché ? Investis 300 pièces d’or et j’en suis !', cond: S => [Math.min(S.gold, 300), 300], pay: { g: 300 } },
  yuna: { n: 'Yuna', job: 'Dresseuse', b: 'menagerie', pal: { H: '#4a3a8a', C: '#c8783a', D: '#8a4a20', B: '#3a2a20', L: '#fff' }, ask: 'Montre-moi que tu sais te lier à un familier, et je soignerai les tiens.', cond: S => [Math.min(Object.keys(S.fams).length, 1), 1] },
  fen: { n: 'Fen', job: 'Herboriste', b: 'herboristerie', pal: { H: '#6ac84a', C: '#3a6a3a', D: '#244a24', B: '#4a3a22', L: '#d8ffb0' }, ask: 'Il me faut 8 herbes médicinales pour mes remèdes.', cond: S => [Math.min(S.mats.herbe || 0, 8), 8], pay: { m: { herbe: 8 } } },
  grom: { n: 'Grom', job: 'Mineur', b: 'mine', pal: { H: '#8a8a8a', C: '#5a5a6a', D: '#3a3a44', B: '#222', L: '#ffcc33' }, ask: 'Prouve-moi que tu sais miner : rapporte 3 cristaux bruts.', cond: S => [Math.min(S.mats.cristal || 0, 3), 3], pay: { m: { cristal: 3 } } },
  lise: { n: 'Lise', job: 'Aubergiste', b: 'taverne', pal: { H: '#a85a2a', C: '#c84a4a', D: '#8a2a2a', B: '#3a2a20', L: '#fff0d0' }, ask: 'Une taverne au Havre ? Construis d’abord 3 bâtiments, que j’aie des clients !', cond: S => [Math.min(G.townBuiltCount(), 3), 3] },
};

// ---------------- Quêtes ----------------
G.QUESTS = {
  q_sylve: { n: 'Le cœur de Sylve', type: 'main', d: 'Purifier Sylvaros, l’Ent corrompu, au cœur de la Forêt de Sylve.', cond: S => [S.bosses.sylvaros ? 1 : 0, 1] },
  q_wyverne: { n: 'La tempête des cimes', type: 'main', d: 'Abattre la Wyverne Tempête dans les hauteurs des Monts Grisés.', cond: S => [S.bosses.wyverne ? 1 : 0, 1] },
  q_hydre: { n: 'Les brumes du marais', type: 'main', d: 'Vaincre l’Hydre des Brumes au fond du Marais Brumeux.', cond: S => [S.bosses.hydre ? 1 : 0, 1] },
  q_ignar: { n: 'Les cendres d’Ignar', type: 'main', d: 'Une fois les trois Gardiens purifiés, franchir la barrière du Volcan Cendreux et terrasser Ignar.', cond: S => [S.bosses.ignar ? 1 : 0, 1] },
  q_havre: { n: 'Un refuge pour tous', type: 'main', d: 'Rejoindre le site du Havre, au sud-est de Bourg-Aube, pour y fonder une ville.', cond: S => [S.town.founded ? 1 : 0, 1] },
};
Object.keys(G.NPCS).forEach(id => {
  const n = G.NPCS[id];
  G.QUESTS['r_' + id] = { n: `Recruter ${n.n} (${n.job})`, type: 'recruit', npc: id, d: n.ask, cond: S => S.npcs[id] ? [1, 1] : n.cond(S) };
});

// ---------------- Arbre des accomplissements ----------------
// col/row : position dans l'arbre ; req : prérequis ; c : condition [actuel, cible]
G.ACH = [
  { id: 'a_first', col: 0, row: 2, n: 'Premier sang', d: 'Remporter un combat.', c: S => [S.stats.wins, 1], rw: { fam: 'bulle', items: { potion: 3 } } },

  { id: 'a_hunter', col: 1, row: 0, req: ['a_first'], n: 'Chasseur', d: 'Remporter 15 combats.', c: S => [S.stats.wins, 15], rw: { mats: { cuir: 5, croc: 5 }, items: { appat: 2 } } },
  { id: 'a_gather', col: 1, row: 2, req: ['a_first'], n: 'Collecteur', d: 'Récolter 20 ressources.', c: S => [S.stats.gathered, 20], rw: { tool: 'hache_pierre', mats: { bois: 10 } } },
  { id: 'a_forge1', col: 1, row: 4, req: ['a_first'], n: 'Apprenti forgeron', d: 'Forger une nouvelle arme.', c: S => [S.stats.wcraft, 1], rw: { mats: { lingot: 5 }, g: 150 } },

  { id: 'a_sylve', col: 2, row: 0, req: ['a_hunter'], n: 'Gardien de Sylve', d: 'Purifier Sylvaros.', c: S => [S.bosses.sylvaros ? 1 : 0, 1], rw: { armor: 'ecorce', fam: 'mousse', mats: { echo: 1 } } },
  { id: 'a_weak', col: 2, row: 1, req: ['a_hunter'], n: 'Élémentaliste', d: 'Exploiter 25 faiblesses élémentaires.', c: S => [S.stats.weak, 25], rw: { mats: { essence_feu: 2, essence_eau: 2, essence_vent: 2, essence_terre: 2 } } },
  { id: 'a_town1', col: 2, row: 2, req: ['a_gather'], n: 'Fondateur', d: 'Construire un premier bâtiment au Havre.', c: S => [G.townBuiltCount(), 1], rw: { g: 400, mats: { pierre: 10, bois: 10 } } },
  { id: 'a_craft', col: 2, row: 4, req: ['a_forge1'], n: 'Artisan', d: 'Fabriquer 6 équipements ou outils.', c: S => [S.stats.crafted, 6], rw: { mats: { fil: 5, lingot: 4 }, items: { hipotion: 2 } } },

  { id: 'a_wyverne', col: 3, row: 0, req: ['a_sylve'], n: 'Briseur de tempête', d: 'Abattre la Wyverne Tempête.', c: S => [S.bosses.wyverne ? 1 : 0, 1], rw: { fam: 'zephy', armor: 'plume_vent', mats: { echo: 1 } } },
  { id: 'a_lvl10', col: 3, row: 1, req: ['a_weak'], n: 'Aguerri', d: 'Atteindre le niveau 10.', c: S => [G.maxLevel(), 10], rw: { items: { elixir: 1, ether: 3 } } },
  { id: 'a_recruit', col: 3, row: 2, req: ['a_town1'], n: 'Recruteur', d: 'Recruter 4 habitants.', c: S => [Object.keys(S.npcs).length, 4], rw: { mats: { cristal: 3 }, g: 600 } },
  { id: 'a_bond', col: 3, row: 3, req: ['a_town1'], n: 'Premiers liens', d: 'Atteindre 30 d’affinité avec un familier.', c: S => [G.maxAffinity(), 30], rw: { items: { festin: 3 } } },
  { id: 'a_tools', col: 3, row: 4, req: ['a_craft'], n: 'Mineur aguerri', d: 'Obtenir la pioche en fer.', c: S => [S.tools.pick >= 3 ? 1 : 0, 1], rw: { mats: { cristal: 2, minerai: 6 } } },

  { id: 'a_hydre', col: 4, row: 0, req: ['a_wyverne'], n: 'Purificateur', d: 'Vaincre l’Hydre des Brumes.', c: S => [S.bosses.hydre ? 1 : 0, 1], rw: { armor: 'larme_acc', mats: { echo: 1 } } },
  { id: 'a_kills', col: 4, row: 1, req: ['a_lvl10'], n: 'Exterminateur', d: 'Vaincre 150 monstres.', c: S => [S.stats.kills, 150], rw: { fam: 'noctis' } },
  { id: 'a_town8', col: 4, row: 2, req: ['a_recruit'], n: 'Bâtisseur', d: 'Atteindre 10 de prestige au Havre.', c: S => [G.prestige(), 10], rw: { mats: { mithril: 3, echo: 1 } } },
  { id: 'a_synergy', col: 4, row: 3, req: ['a_bond'], n: 'Synergiste', d: 'Utiliser 8 techniques liées.', c: S => [S.stats.tech, 8], rw: { armor: 'collier_lien' } },
  { id: 'a_master', col: 4, row: 4, req: ['a_tools'], n: 'Maître d’armes', d: 'Forger les 4 armes d’un même personnage.', c: S => [G.maxWeaponsOneChar(), 4], rw: { armor: 'insigne' } },

  { id: 'a_ignar', col: 5, row: 0, req: ['a_hydre'], n: 'Tueur de dragon', d: 'Terrasser Ignar.', c: S => [S.bosses.ignar ? 1 : 0, 1], rw: { armor: 'couronne', mats: { echo: 2 } } },
  { id: 'a_lvl25', col: 5, row: 1, req: ['a_kills'], n: 'Légende vivante', d: 'Atteindre le niveau 25.', c: S => [G.maxLevel(), 25], rw: { items: { elixir: 3 }, mats: { mithril: 4 } } },
  { id: 'a_rich', col: 5, row: 2, req: ['a_town8'], n: 'Magnat', d: 'Gagner 8 000 pièces d’or au total.', c: S => [S.stats.goldEarned, 8000], rw: { mats: { echo: 1, cristal: 4 } } },
  { id: 'a_bond100', col: 5, row: 3, req: ['a_synergy'], n: 'Âmes sœurs', d: 'Atteindre 100 d’affinité.', c: S => [G.maxAffinity(), 100], rw: { items: { festin: 5 }, mats: { echo: 1 } } },
  { id: 'a_arsenal', col: 5, row: 4, req: ['a_master'], n: 'Arsenal complet', d: 'Forger les 12 armes.', c: S => [G.totalWeapons(), 12], rw: { mats: { echo: 3, mithril: 4 } } },
];

// ---------------- Boutiques ----------------
G.SHOPS = {
  bourg_obj: { n: 'Échoppe d’Hilda', items: ['potion', 'ether', 'remede', 'phenix', 'appat', 'friandise'] },
  bourg_mat: { n: 'Comptoir de Bertil', mats: ['lingot', 'fil', 'bois', 'pierre', 'cuir', 'herbe'] },
  havre: lvl => ({
    n: 'Marché du Havre',
    items: ['potion', 'hipotion', 'ether', 'remede', 'phenix', 'bombe', 'appat', 'friandise', 'festin'],
    mats: ['lingot', 'fil', 'minerai', 'boisancien', 'ecaille'].concat(lvl >= 2 ? ['essence_feu', 'essence_eau', 'essence_vent', 'essence_terre', 'cristal'] : []).concat(lvl >= 3 ? ['mithril'] : []),
    disc: lvl >= 3 ? 0.8 : lvl >= 2 ? 0.9 : 1,
  }),
};
