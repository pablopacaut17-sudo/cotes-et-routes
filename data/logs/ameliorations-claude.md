# Journal des améliorations (tâches Claude)

## 27 novembre 2026 (session avec Pablo)
- Rattrapage de l'actualité étendu à 125 mois (juin 2016), deux passages par heure, couverture complète des années 2016-2024.
- Nouveau robot « Archive du trafic mondial (heure par heure) » (archive-trafic.yml) : garde chaque heure la photographie de tous les avions en vol déjà prise par « Avions du monde en direct » (aucun crédit OpenSky en plus), dans data/trafic/ (≈ 50 000 données par heure, ≈ 1,2 million par jour, ≈ 3,7 Mo par jour, plafond 400 Mo puis retrait des jours les plus anciens). Compté dans le compteur sous « Trafic mondial heure par heure (archive) ».
- À FAIRE (prioritaire) : afficher cette archive sur le site (par exemple une carte « le trafic mondial tel jour à telle heure » dans la rubrique anim ou direct), pour que ces données comptées soient consultables.
- Constat : les vols par aéroport (opensky.yml) sont limités par les crédits OpenSky (≈ 4 000 par jour, 68 aéroports sur 300 le 25 novembre), consommés aussi par les robots en direct. Ne pas augmenter la fréquence des robots OpenSky.
- Bouton « Demander à l'IA » (design/ia.js) branché sur le relais Cloudflare de Pablo ; réglages dans ia-consignes.json (plafond 40 questions par jour, à ne pas augmenter sans son accord).
