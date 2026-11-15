# Les Cristaux Élémentaires — RPG HD-2D au tour par tour

RPG jouable dans le navigateur, inspiré de Final Fantasy et Dragon Quest.
Pixel art généré par le code, avec un rendu « HD-2D » : profondeur de champ, bloom, éclairage dynamique, cycle jour/nuit, rayons de lumière et particules.

Le rendu utilise une densité de 4 pixels par unité. Le décor est dessiné à pleine résolution : 64 × 64 pixels par case pour les sols (grain, brins d’herbe et transitions au pixel près), 4 pixels par unité pour les arbres, maisons, décors et accessoires, ainsi que pour les fonds de combat ; les teintes régionales du sol sont fondues en dégradés continus. Héros et PNJ sont dessinés en haute définition et sur-échantillonnés (bords anticrénelés, dégradés continus, contours fins, yeux ronds avec iris et reflets), avec un déplacement au quart d’unité. Les 20 espèces de monstres et les boss sont dessinés au même niveau de détail : yeux avec iris et reflets, pelage, plumes, écailles, membranes d’ailes, crocs, griffes, lueurs et contours internes entre les parties du corps. Les 6 familiers suivent le même rendu.

En combat, chaque héros tient réellement son arme : bras articulés, mains refermées sur la poignée et posture propre à chaque arme (garde à deux mains, dagues en prise inversée, bouclier au bras, arc bandé, calice levé, grimoire ouvert, gantelets, armes d’hast). Les 12 armes sont redessinées en détail, et l’accessoire de couleur du héros (foulard, ruban, bandeau) prend la teinte de l’élément de l’arme. Le rang d’amélioration se voit aussi : gravures dès le rang 3, gemme lumineuse au rang 5, aura et éclats au rang 7 (légendaire). Auparavant : personnages en 32×32 pixels (visage, cheveux, plis, ombrage en volume), monstres, familiers, arbres et bâtiments dessinés à résolution double avec des contours colorés, et textures extérieures 32×32 qui se raccordent d’une tuile à l’autre, avec des transitions douces entre types de sol.

Le paysage varie :
- teinte du sol qui évolue en continu sur la carte, styles de sol par plaques et 17 petits décors semés selon la région ;
- 12 espèces d’arbres ;
- 17 architectures : colombages, pierre, chaume, manoir à tourelle, grange, boutique, forge, marché, serre, mine, atelier, ménagerie, ainsi qu’une cabane de chasseur, des ruines, une hutte sur pilotis et un autel d’obsidienne dans les régions sauvages ;
- un moulin animé, des accessoires de village et des tenues de personnages variées (robe, gilet, armure, tablier, chapeaux, capuche, écharpe).

## Lancer le jeu

Ouvrez `index.html` dans un navigateur récent. Il n’y a ni dépendance ni étape de compilation.
Vous pouvez aussi le servir en local (`python3 -m http.server`) ou l’héberger sur GitHub Pages.

| Action | Clavier | Tactile |
|---|---|---|
| Se déplacer | Flèches / ZQSD / WASD, ou clic sur une case | Toucher une case (chemin le plus court), ou glisser le doigt (joystick flottant) |
| Aller parler / ouvrir / récolter | Clic sur le PNJ, coffre, ressource ou bâtiment | Toucher la cible : le héros s’y rend et agit seul |
| Action (parler, ouvrir, **récolter**) | Entrée / Espace / E | Bouton A |
| Menu / retour | Échap / M | Bouton B ou ☰ |

**Démo rapide** : le bouton de l’écran titre lance une partie de milieu d’aventure (niveau 15, Havre en construction, familiers liés, armes forgées et matériaux en stock) pour essayer tous les systèmes tout de suite. Le voyage rapide se trouve dans Menu › Carte.

**Fluidité** : Menu › Système › Qualité (Auto, Haute, Moyenne, Économie). En mode Auto, le jeu démarre en Économie sur téléphone, monte d’un cran s’il reste fluide et redescend s’il ralentit. L’Économie calcule l’image à mi-résolution et retire le flou de profondeur, le halo et les rayons de lumière.

La partie est sauvegardée dans le navigateur : automatiquement, à l’auberge et depuis le menu Système.

## Systèmes de jeu

- **Combats au tour par tour** : l’ordre de passage dépend de la vitesse et s’affiche dans une frise. Le jeu gère les faiblesses élémentaires (cycle 💧 › 🔥 › 🌪️ › 🪨 › 💧), les critiques, les altérations (brûlure, poison, étourdissement, buffs et debuffs), les boucliers, les ripostes et les sauts aériens.
- **4 armes par personnage**, une par emplacement élémentaire (Feu, Eau, Vent, Terre). Une arme n’est pas forcément infusée de son élément.
  Chaque arme a son trait, ses statistiques et ses 5 compétences, et elle change complètement le rôle du personnage :
  - **Kael** : Berserker (espadon), Duelliste à ripostes (katana), Assassin à coups multiples (dagues), Paladin protecteur (épée et bouclier).
  - **Lyra** : Sorcière pyromancienne (bâton), Prêtresse (calice), Archère arcanique (arc), Occultiste à malédictions (grimoire).
  - **Bran** : Moine à enchaînements (gantelets), Vampire des abysses (trident), Chevalier dragon (lance), Barbare brise-armure (hache).
  - En combat, changer d’arme coûte un demi-tour.
- **Compétences actives et passives** débloquées avec les niveaux (et le rang de l’arme), plus des talents innés propres à chaque héros.
- **Arbre des accomplissements** (inspiré de Chained Echoes) : 26 exploits reliés (boss vaincus, collecte, artisanat, ville, affinité…). Chacun débloque un équipement unique, un familier ou des matériaux rares.
- **Familiers** (5) : ils gagnent des niveaux et ont une affinité avec chaque héros.
  - Lien I : bonus passif.
  - Lien II : technique liée (attaque combinée).
  - Lien III : bonus doublé.
  - Résonance : si l’élément du familier correspond à l’arme équipée, ses bonus sont multipliés.
- **Artisanat** : forge et amélioration des armes (rangs 1 à 5), fabrication d’armures, d’accessoires et d’outils, raffinage. **Aucun marchand d’armes ni d’armures** : les boutiques vendent uniquement des objets et des matériaux.
- **Collecte façon Minecraft** : on frappe les arbres, rochers, filons et herbes. Les meilleurs outils (pioche et hache en bois, pierre puis fer) ouvrent de nouveaux filons et récoltent plus vite. Les ressources repoussent.
- **Le Havre**, une ville à bâtir :
  - 8 bâtiments améliorables : forge, atelier, marché, ménagerie, herboristerie, mine, taverne, remparts.
  - Chaque bâtiment exige de recruter un habitant (7 PNJ, chacun avec sa quête).
  - La ville produit des ressources après chaque victoire.
- **Monde ouvert de 624 × 464 cases** (près de 290 000 cases) : régions organiques et imbriquées (langues de forêt, enclaves, lobes de marais, chaînes de montagnes) organisées en anneaux de difficulté autour de Bourg-Aube. Les frontières restent visibles et infranchissables hors des chemins : lisières de forêt, falaises, haies du marais et muraille du volcan, avec un portique à chaque passage. Le volcan n’a qu’une entrée, gardée par la barrière.
- **Camps** ⛺ dans chaque région : repos, point de retour et voyage rapide une fois découverts.
- **Carte du monde** avec brouillard : seules les zones explorées sont révélées.
- **Profondeur des régions** (indicateur ▮▮▯) : plus on s’éloigne de l’entrée, plus les monstres sont nombreux et coriaces, mais l’EXP, l’or et le butin augmentent.
- **Butin et farm équilibrés** : chaque région donne ses matériaux typiques en combat et possède ses coffres (12 à 7 par région, objets rares dans les profondeurs). Il faut environ 6 combats par niveau au niveau conseillé, dans chaque région.
- **Auberges** signalées par une enseigne « INN » au-dessus de la porte.
- **Itinéraire** (coin supérieur gauche) : ordre conseillé des régions, niveaux recommandés, région actuelle et Gardiens vaincus. Repliable.
- **Butin lisible** : chaque objet obtenu indique le nouveau total en stock.
- **Montée de niveau** : les PV et PM sont entièrement restaurés.
- **Sous-zones** : chaque région est divisée en 3 sous-zones reconnaissables (ex. Bois-Clair, Sylve profonde, Forêt d’automne ; Contreforts, Pics enneigés, Gorges cristallines), chacune avec sa teinte, ses essences d’arbres, son relief et ses décors, nommée à l’écran et sur la carte.
- **Tableau de chasse** (Bourg-Aube, Havre ou Menu › Chasses) : 20 contrats, 4 par région.
  - 3 chasses standard par région, une dans chaque sous-zone, qui donnent équipements uniques et points de chasse (rangs D à S, bonus permanents).
  - 1 chasse premium ♛ par région, qui n’apparaît qu’une fois les 3 primes standard de la région touchées. Elle est répétable et donne le seul matériau légendaire de la région : Plume d’aurore, Sève éternelle, Cœur de cristal, Perle abyssale, Flamme primordiale.
  - Ces matériaux permettent l’éveil légendaire des armes au rang 7 (rang maximum, Forge niv. 4) et la fabrication de 5 armures et accessoires légendaires (Atelier niv. 3).
  - Au rang S, la Traque infinie est répétable et monte de 3 niveaux à chaque victoire.
- **Histoire** : le monde d’Aube repose sur quatre cristaux élémentaires (Terre, Vent, Eau, Feu), chacun gardé dans un temple. Le Cristal des Ténèbres s’est éveillé et a corrompu leurs gardiens.
  - Libérez les cristaux de Terre (Sylvaros, Forêt de Sylve), de Vent (la Wyverne, Monts Grisés) et d’Eau (l’Hydre, Marais Brumeux) : la barrière du Volcan cède et donne accès au Temple du Feu (Ignar).
  - Les quatre cristaux libérés brisent le sceau du Temple des Ténèbres, dans les Plaines au nord de Bourg-Aube. Son gardien, Umbra, protège le Cristal des Ténèbres.
  - Sa destruction déclenche une cinématique : le Cristal de Lumière apparaît au Havre. Il ouvre le Sanctuaire où attend le véritable boss de fin, la Création originelle.
- **Temples** (donjons) : un par région, marqués ◆ sur la carte. Chacun est un intérieur à part entière : salles reliées par des couloirs, piliers, braseros, coffres, éclairage d’ambiance, portail de sortie, et le cristal au fond de la salle du gardien. Chaque temple a sa propre faune (5 espèces) et son niveau : Terre 7–9, Vent 10–12, Eau 13–15, Feu 18–20, Ténèbres 22–25, Lumière 26–29.
- **Bestiaire** (Menu › Bestiaire) : 77 créatures (plafond fixé à 200), classées par habitat. Les créatures vaincues sont recensées avec leur butin, celles seulement croisées restent en aperçu. Nouvelles espèces : scarabée de jade, crabes des abysses et de lave, gargouilles, méduse spectrale, œils du néant et d’aurore, ombre rampante, séraphin, ainsi que les boss Umbra et la Création originelle.

## Structure

```
index.html        page et conteneurs d’interface
css/style.css     interface (fenêtres RPG, menus, combat, tactile)
js/core.js        utilitaires, éléments, moteur de pixel art procédural
js/data.js        données : personnages, armes, compétences, ennemis, objets, recettes, accomplissements, bâtiments…
js/state.js       état de la partie, calcul des stats, inventaire, sauvegarde
js/sprites.js     sprites (héros, monstres, boss, familiers, tuiles, bâtiments)
js/fx.js          rendu HD-2D (post-traitement, lumières, particules)
js/world.js       carte, entités, déplacement, collecte, rencontres
js/battle.js      système de combat
js/ui.js          dialogues, menus, boutiques, interface de combat
js/audio.js       effets sonores et musiques procédurales (WebAudio)
js/main.js        entrées, boucle principale, écran titre
```
