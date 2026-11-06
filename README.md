# Les Échos Élémentaires — RPG HD-2D au tour par tour

RPG jouable dans le navigateur, inspiré de Final Fantasy et Dragon Quest.
Pixel art généré par le code, avec un rendu « HD-2D » : profondeur de champ, bloom, éclairage dynamique, cycle jour/nuit, rayons de lumière et particules.

## Lancer le jeu

Ouvrez `index.html` dans un navigateur récent. Il n’y a ni dépendance ni étape de compilation.
Vous pouvez aussi le servir en local (`python3 -m http.server`) ou l’héberger sur GitHub Pages.

| Action | Clavier | Tactile |
|---|---|---|
| Se déplacer | Flèches / ZQSD / WASD | Croix directionnelle |
| Action (parler, ouvrir, **récolter**) | Entrée / Espace / E | Bouton A |
| Menu / retour | Échap / M | Bouton B ou ☰ |

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
- **Arbre des accomplissements** (inspiré de Chained Echoes) : 23 exploits reliés (boss vaincus, collecte, artisanat, ville, affinité…). Chacun débloque un équipement unique, un familier ou des matériaux rares.
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
- **Histoire** : 4 Gardiens corrompus à purifier, une barrière à briser, puis le dragon Ignar.

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
