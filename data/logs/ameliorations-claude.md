# Journal des améliorations (tâches Claude)

## 27 novembre 2026 (session avec Pablo)
- Rattrapage de l'actualité étendu à 125 mois (juin 2016), deux passages par heure, couverture complète des années 2016-2024.
- Nouveau robot « Archive du trafic mondial (heure par heure) » (archive-trafic.yml) : garde chaque heure la photographie de tous les avions en vol déjà prise par « Avions du monde en direct » (aucun crédit OpenSky en plus), dans data/trafic/ (≈ 50 000 données par heure, ≈ 1,2 million par jour, ≈ 3,7 Mo par jour, plafond 400 Mo puis retrait des jours les plus anciens). Compté dans le compteur sous « Trafic mondial heure par heure (archive) ».
- FAIT : carte « Le trafic mondial heure par heure » (design/trafic.js) dans la rubrique « La journée en accéléré » ; l'archive est découpée en un fichier par heure (data/trafic/AAAA-MM-JJ/HH.json.gz, liste dans data/trafic/index.json).
- FAIT : recherche tolérante aux fautes dans la base des accidents (design/recherche-plus.js), avec l'index data/accidents-index.json.gz reconstruit chaque jour (index-accidents.yml, non compté par le compteur).
- Constat : les vols par aéroport (opensky.yml) sont limités par les crédits OpenSky (≈ 4 000 par jour, 68 aéroports sur 300 le 25 novembre), consommés aussi par les robots en direct. Ne pas augmenter la fréquence des robots OpenSky.
- Bouton « Demander à l'IA » (design/ia.js) branché sur le relais Cloudflare de Pablo ; réglages dans ia-consignes.json (plafond 40 questions par jour, à ne pas augmenter sans son accord).

## 28 novembre 2026 (visite quotidienne)
- Santé : registres-plus.yml lit désormais les CSV à très longs champs (erreur « field larger than field limit » du registre néerlandais).
- 15 questions-réponses vérifiées (6 sur les grands accidents : Linate, Haneda, Yemenia 626, Flash 604, Habsheim, MH17).
- Enrichissement (design/site-v39.js) : tableaux pour Airbus, METAR, navigation, environnement, avions de légende. Registre : data/logs/enrichissement-claude.json.

## 28 novembre 2026 (tâche « Amélioration », automatique)
- Questions des lecteurs : issue n° 6 (horaires Paris-CDG – Toronto) traitée ; question-réponse durable ajoutée (compagnies sans escale, distance, durée, décalage horaire, où trouver les horaires du moment), rubrique « lignes ».
- Réponses de l'IA : robot reponses-ia.yml lancé à la main (pas encore passé à 6 h 07) ; rien à vérifier pour l'instant (0 réponse, 0 question sans réponse, 0 signalement).
- Croissance : compteur 13 104 774 (27/11 08:09) → 15 428 353 (recompte du 28/11 matin), soit ≈ +2,3 millions en 24 h (objectif 1 million atteint).
- Réparation : le compteur rangeait chaque fichier des registres, des accidents et des flottes comme une source à part (2 485 « sources » nommées « 2 », « 2014 », « AIO »…). Regroupés (88 sources : « Registres officiels d’immatriculation » 1,74 M, « Base des accidents » 1,79 M, « Flottes des compagnies »), total inchangé.
- Fiches Wikipédia : filtre militaire renforcé (bases aériennes, Naval Air Station, Army Airfield ; hélicoptères d'attaque, bombardiers lourds, avions d'observation de l'Air Corps) ; 36 fiches seront retirées au prochain passage ; « passager » au singulier compte comme civil (Avro Lancastrian gardé).
- Recherche : tolérance aux fautes sur les noms (« boieng 777 », « Airbis A350 », « Embrear 190 », lettres inversées comprises), mots courants jamais pris pour une fiche (« avion » ouvrait la fiche de la compagnie L'Avion ; « cause » ouvrait un hélicoptère militaire), « accident du vol Rio Paris 2009 » renvoie la question-réponse vérifiée au lieu de la réponse générale sur la sécurité, villes reconnues malgré « (Roissy…) » ou « Toulouse/Blagnac ». 7 questions fixes ajoutées à tests/questions.json.
- Chantier du jour (feuille de route) : carte « les avions de la ligne » d'après les vols ADSB.lol (data/vols/lignes/), testée sur téléphone et ordinateur.
- À noter : le dépôt cotes-et-routes-vols n'est pas accessible à cette tâche (lecture GitHub refusée) ; le robot lignes-vols.yml et le testeur de questions n'avaient encore jamais tourné (premiers passages prévus à 7 h 41 et 8 h 04 UTC).
