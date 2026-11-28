# Journal du chasseur d'erreurs

Tâche quotidienne : trouver les erreurs du site et les corriger à la source. Rotation des vérifications d'un jour à l'autre :
jeux (Playwright) · fiches d'avions · photos de « Devine l'avion » · grandes fiches Wikipédia · questions-réponses · accidents · recherche du site.
Le robot `.github/workflows/chasseur-erreurs.yml` (chaque nuit, sans IA) écrit son rapport dans `data/logs/chasseur-erreurs.json`.
Corrections d'accidents persistantes : `data/corrections-accidents.json` (appliqué par le robot des accidents).

## 2026-11-28 (premier passage)

**Vérifié** : 0 signalement de visiteur en attente ; pas d'issue « robot-testeur » ouverte ; 56 fiches d'avions (dimensions, dates de premier vol et de mise en service) ; quiz joué sur une copie locale (25 questions relues, 400 tirages contrôlés automatiquement) et défi des codes ; 15 questions-réponses ; 11 accidents récents (≥ 20 morts) ; 10 grandes fiches Wikipédia + balayage automatique des 7 500 ; 12 questions posées à la recherche du site.

**Erreurs corrigées**
- 737 MAX 7 et MAX 10 affichés « en certification » : certifiés par la FAA le 03/08/2026 et le 20/10/2026 (index.html, fiche Boeing 737).
- ATR 42-600S donné « en développement » : projet abandonné en 2025 (fiche ATR, fiche constructeur).
- Quiz : les questions « le plus… » (envergure, altitude, destinations, distance) pouvaient avoir deux bonnes réponses en cas d'égalité (ex. A320neo/A321neo 35,8 m) → choix aux valeurs toutes différentes (`uniq4`).
- Défi des codes : deux aéroports de la même ville (CDG/ORY…) pouvaient figurer parmi les choix → garde-fou dans design/site-v27.js.
- Accidents : 31 234 lignes TSB (Canada) dont le « type d'appareil » était un code numérique (11, 1, 9…) → robot corrigé et données nettoyées ; 1 775 lignes Wikidata dont la « cause » était un identifiant Q… → idem ; Jeju Air 2216 : 179 morts (et non 173) ; Azerbaijan Airlines 8243 : 38 morts (et non 35), immatriculation 4K-AZ65 (et non 4R-AZ65) ; collision de Washington datée du 29/01/2025 ; lignes militaires retirées (UH-60 de l'armée, bases aériennes, exploitants « Department of Defense », etc. : ~200 lignes).
- Grandes fiches : 93 fiches militaires encore publiées (MiG/bombardiers, AH-1 Cobra, Tigre, bases RAF/Navy…) → filtre du robot renforcé (première phrase, bases, `\bbombardier\b` qui ne marchait pas) et fiches vidées ; 23 renvois de notes « [1] » retirés.
- Recherche : ajout de 2 questions-réponses vérifiées (premier avion de ligne à réaction ; le BEA, à ne pas confondre avec British European Airways).

**Reste à faire**
- Photos de « Devine l'avion » non vérifiées (Wikipédia inaccessible depuis l'environnement du chasseur).
- Recherche : « Quel est l'aéroport le plus haut du monde ? » renvoie une réponse hors sujet (classement TriStar) ; « Qu'est-ce que le BEA ? » ouvre la fiche British European Airways.
- Annuaire : 38 aéroports affichent un code local (FAA, « MH-… ») comme code OACI (robot mise-a-jour.yml, > 19 Ko, à reprendre avec prudence).
- Robot de contrôle : étendre le contrôle des fiches d'avions aux modèles ajoutés par les scripts design/ (seules 56 fiches d'index.html sont lues).
