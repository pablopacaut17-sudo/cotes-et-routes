# Feuille de route de Cotes & Routes

Chantiers demandés par Pablo le 27 novembre 2026 (« fais tout »). La tâche « Amélioration » du matin en réalise **un par
jour** (point 4, avant toute autre idée), le teste, puis le coche ici avec la date et une ligne de bilan. Ordre conseillé.

## À faire
- [ ] **Questions sans réponse** : traiter chaque matin `sans_reponse` de data/logs/ia-a-verifier.json (questions que la recherche n'a pas su traiter) : question-réponse vérifiée (faq-verifiees.yml), fiche dans data/fiches.json, ou nouvelle capacité de design/recherche-plus.js quand plusieurs se ressemblent. Déplacer chaque élément traité dans `sans_reponse_traites` ([slug, q, d]). *(tous les jours)*
- [ ] **Exploiter les vols ADSB.lol** (vols détaillés dans le dépôt pablopacaut17-sudo/cotes-et-routes-vols, https://pablopacaut17-sudo.github.io/cotes-et-routes-vols/jours/AAAA-MM-JJ.json.gz, même origine que le site ; totaux par ligne recopiés dans data/vols/lignes/ par lignes-vols.yml) : dans la recherche, « vols entre CDG et JFK » (totaux par ligne de data/vols/lignes/), « nombre de vols par jour à Nice », « quel avion sur la ligne Paris-Montréal » (types les plus fréquents), « où était F-GSQA hier ». Vérifier d'abord le journal data/logs/vols-adsblol.json (recopié depuis l'archive) (le robot a-t-il trouvé la journée et reconnu les départs et arrivées ?).
- [x] **Base des accidents** (fait le 27/11/2026, .github/workflows/index-accidents.yml) : vrais noms de compagnies, sociétés en minuscules, particuliers et militaires écartés, doublons NTSB/TSB + Wikidata fusionnés (date locale et nom de Wikidata, avion et immatriculation de l'enquête). Reste possible : orthographes de lieux des bases d'enquête (« Tamanrassett »).
- [x] **Liens vers Dix Mille Escales** (fait le 27/11/2026, design/finition.js) : la fiche aéroport affiche « Visiter <ville> sur Dix Mille Escales » d'après https://pablopacaut17-sudo.github.io/dix-mille-escales/liens-aeroports.json ; l'adresse #aeroport=CODE ouvre directement la fiche. Reste possible : même lien dans les fiches Wikipédia f/<slug>.html des aéroports.
- [x] **Émojis remplacés par des icônes dessinées** partout (fait le 27/11/2026, design/finition.js, table EMAP : ajouter là toute nouvelle correspondance).
- [ ] **Registres d'immatriculation ouverts supplémentaires** : Royaume-Uni (G-INFO), Canada (CCARCS), Australie (CASA), Irlande, Suisse… (licence ouverte vérifiée avant).
- [ ] **Question à voix haute** dans la recherche (Web Speech API, comme Dix Mille Escales : static/questions.js).
- [ ] **Grandes fiches** : contrôler chaque jour une dizaine de fiches de data/fiches-wp/ (texte propre, pas de militaire, bon sujet) et corriger le robot fiches-wikipedia.yml si besoin.

## Fait
- [x] 27/11 : distance et durée de vol, milliers de fiches Wikipédia avec pages pour Google (f/, sitemap.xml), vols ADSB.lol, bouton « Signaler une erreur », testeur de questions.
