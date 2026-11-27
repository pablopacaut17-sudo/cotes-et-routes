# Feuille de route de Cotes & Routes

Chantiers demandés par Pablo le 27 novembre 2026 (« fais tout »). La tâche « Amélioration » du matin en réalise **un par
jour** (point 4, avant toute autre idée), le teste, puis le coche ici avec la date et une ligne de bilan. Ordre conseillé.

## À faire
- [ ] **Questions sans réponse** : traiter chaque matin `sans_reponse` de data/logs/ia-a-verifier.json (questions que la recherche n'a pas su traiter) : question-réponse vérifiée (faq-verifiees.yml), fiche dans data/fiches.json, ou nouvelle capacité de design/recherche-plus.js quand plusieurs se ressemblent. Déplacer chaque élément traité dans `sans_reponse_traites` ([slug, q, d]). *(tous les jours)*
- [ ] **Exploiter les vols ADSB.lol** (data/vols/, robot vols-adsblol.yml) : dans la recherche, « vols entre CDG et JFK » (totaux par ligne de data/vols/lignes/), « nombre de vols par jour à Nice », « quel avion sur la ligne Paris-Montréal » (types les plus fréquents), « où était F-GSQA hier ». Vérifier d'abord le journal data/logs/vols-adsblol.json (le robot a-t-il trouvé la journée et reconnu les départs et arrivées ?).
- [ ] **Base des accidents** : vrais noms de compagnies (« American Airlines » et non « AMR Corporation » : table de correspondance des sociétés mères), et date locale de l'accident quand la base donne l'heure UTC (exemple : vol American Airlines 965, Buga, 20 décembre 1995 heure locale).
- [ ] **Liens vers Dix Mille Escales** : sur chaque aéroport et dans les fiches d'aéroport, la ville desservie avec un lien vers sa fiche https://pablopacaut17-sudo.github.io/dix-mille-escales/villes/<slug>/ (index des villes : static/index.json de Dix Mille Escales).
- [ ] **Registres d'immatriculation ouverts supplémentaires** : Royaume-Uni (G-INFO), Canada (CCARCS), Australie (CASA), Irlande, Suisse… (licence ouverte vérifiée avant).
- [ ] **Question à voix haute** dans la recherche (Web Speech API, comme Dix Mille Escales : static/questions.js).
- [ ] **Grandes fiches** : contrôler chaque jour une dizaine de fiches de data/fiches-wp/ (texte propre, pas de militaire, bon sujet) et corriger le robot fiches-wikipedia.yml si besoin.

## Fait
- [x] 27/11 : distance et durée de vol, milliers de fiches Wikipédia avec pages pour Google (f/, sitemap.xml), vols ADSB.lol, bouton « Signaler une erreur », testeur de questions.
